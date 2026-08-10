# Gera os paths SVG dos estados do Brasil a partir da malha oficial do IBGE.
# Projecao Mercator (a mesma que o site usa para plotar cidades por lat/lon).
import json, math

UF = {
    "11": ("RO", "Rondônia"), "12": ("AC", "Acre"), "13": ("AM", "Amazonas"),
    "14": ("RR", "Roraima"), "15": ("PA", "Pará"), "16": ("AP", "Amapá"),
    "17": ("TO", "Tocantins"), "21": ("MA", "Maranhão"), "22": ("PI", "Piauí"),
    "23": ("CE", "Ceará"), "24": ("RN", "Rio Grande do Norte"), "25": ("PB", "Paraíba"),
    "26": ("PE", "Pernambuco"), "27": ("AL", "Alagoas"), "28": ("SE", "Sergipe"),
    "29": ("BA", "Bahia"), "31": ("MG", "Minas Gerais"), "32": ("ES", "Espírito Santo"),
    "33": ("RJ", "Rio de Janeiro"), "35": ("SP", "São Paulo"), "41": ("PR", "Paraná"),
    "42": ("SC", "Santa Catarina"), "43": ("RS", "Rio Grande do Sul"),
    "50": ("MS", "Mato Grosso do Sul"), "51": ("MT", "Mato Grosso"),
    "52": ("GO", "Goiás"), "53": ("DF", "Distrito Federal"),
}

WIDTH = 1000.0          # largura do viewBox
PAD = 6.0
TOL = 0.55              # tolerancia da simplificacao, em unidades do viewBox
LON_MAX = -34.5         # corta ilhas oceanicas (Noronha, Rocas, Trindade)

def merc(lon, lat):
    return lon, math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))

def rings_of(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"][0]]
    out = []
    for poly in geom["coordinates"]:
        out.append(poly[0])
    return out

def ring_area(pts):
    a = 0.0
    for i in range(len(pts) - 1):
        a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
    return abs(a) / 2

def rdp(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        s, e = stack.pop()
        if e <= s + 1:
            continue
        x1, y1 = pts[s]; x2, y2 = pts[e]
        dx, dy = x2 - x1, y2 - y1
        norm = math.hypot(dx, dy)
        worst, wi = -1.0, -1
        for i in range(s + 1, e):
            x0, y0 = pts[i]
            if norm == 0:
                d = math.hypot(x0 - x1, y0 - y1)
            else:
                d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm
            if d > worst:
                worst, wi = d, i
        if worst > tol:
            keep[wi] = True
            stack.append((s, wi)); stack.append((wi, e))
    return [p for p, k in zip(pts, keep) if k]

data = json.load(open("ibge_uf.json", encoding="utf-8"))

# 1) projeta e descarta ilhas oceanicas
feats = []
for ft in data["features"]:
    sigla, nome = UF[ft["properties"]["codarea"]]
    rings = []
    for r in rings_of(ft["geometry"]):
        if min(c[0] for c in r) > LON_MAX:
            continue
        rings.append([merc(c[0], c[1]) for c in r])
    feats.append((sigla, nome, rings))

# 2) bbox global -> escala do viewBox
xs = [p[0] for _, _, rs in feats for r in rs for p in r]
ys = [p[1] for _, _, rs in feats for r in rs for p in r]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
scale = (WIDTH - 2 * PAD) / (maxx - minx)
height = (maxy - miny) * scale + 2 * PAD

def to_svg(p):
    return (p[0] - minx) * scale + PAD, (maxy - p[1]) * scale + PAD

# 3) simplifica em unidades de tela e monta os paths
estados = {}
for sigla, nome, rings in feats:
    parts, biggest, biggest_area = [], None, -1.0
    for r in rings:
        pts = [to_svg(p) for p in r]
        area = ring_area(pts)
        if area < 1.2:                      # ilhota irrelevante nesta escala
            continue
        simp = rdp(pts, TOL)
        if len(simp) < 4:
            continue
        if area > biggest_area:
            biggest_area, biggest = area, simp
        d = "M" + " ".join(f"{x:.1f},{y:.1f}" for x, y in simp) + "Z"
        parts.append(d)
    # rotulo: centroide do maior anel
    cx = sum(p[0] for p in biggest) / len(biggest)
    cy = sum(p[1] for p in biggest) / len(biggest)
    estados[sigla] = {"nome": nome, "d": "".join(parts), "cx": round(cx, 1), "cy": round(cy, 1)}

saida = {
    "viewBox": f"0 0 {WIDTH:.0f} {height:.0f}",
    # parametros da projecao Mercator, para o JS plotar cidades por lat/lon
    "proj": {"minx": round(minx, 6), "maxy": round(maxy, 6), "scale": round(scale, 6), "pad": PAD},
    "estados": estados,
}
json.dump(saida, open("mapa-brasil.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

total = sum(len(v["d"]) for v in estados.values())
print(f"viewBox 0 0 {WIDTH:.0f} {height:.0f} | {len(estados)} UFs | {total/1024:.1f} KB de paths")
