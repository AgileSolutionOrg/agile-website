/* Onde a Agile Solution ja chegou — dados da secao "Presenca no Brasil".
   ESTE e o unico arquivo do mapa que se edita a mao.

   CRITERIO: empresa ja atendida, nao contrato ativo. A pergunta que a secao
   responde e "onde a Agile ja chegou" — um cliente antigo continua sendo um
   estado onde a Agile chegou. Por contrato ativo seriam 4 estados; por
   empresa atendida, 10. Nao trocar para status='ATIVO'.

   Conferencia no banco do portal (droplet):
     docker compose exec -T db psql -U agileportal -d agileportal -c \
       "SELECT uf, cidade, count(*) FROM cliente GROUP BY uf, cidade ORDER BY uf, cidade;"

   O mapa mostra PRESENCA (sim/nao), nunca quantidade — nenhum numero de
   carteira aparece na tela.

   ufs     — siglas dos estados ja atendidos. Pintam o estado.
   cidades — pontos no mapa. lat/lon em graus decimais (negativo = Sul/Oeste).
             A UF da cidade e pintada automaticamente, mesmo que falte em "ufs".
             Cidade sem lat/lon e ignorada no desenho (mas ainda pinta a UF).
             "sede: true" desenha o ponto branco da sede da Agile. */

const MAPA_PRESENCA_DADOS = {
  revisado: true,

  ufs: ["RS", "SP", "SC", "PR", "CE", "MG", "RN", "PE", "PA", "GO"],

  cidades: [
    { nome: "Itajaí", uf: "SC", lat: -26.9078, lon: -48.6619, sede: true }
  ]
};
