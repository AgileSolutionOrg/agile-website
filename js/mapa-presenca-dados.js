/* Onde a Agile Solution ja chegou — dados da secao "Presenca no Brasil".
   ESTE e o unico arquivo do mapa que se edita a mao.

   CRITERIO (decisao do Gildonei em 09/10/2026): estado com cliente que JA GEROU
   RECEITA — tem lancamento no contas a receber do portal CONFIRMADO, EMITIDO ou
   RECEBIDO, de qualquer ano. Cliente so cadastrado (sem venda) nao conta, e
   previsao tambem nao. E o mesmo criterio do mapa do Ecossistema no portal.

   Conferencia no banco do portal (droplet):
     docker compose exec -T db psql -U agileportal -d agileportal -c \
       "SELECT upper(trim(c.uf)), count(*) FROM cliente c WHERE EXISTS (SELECT 1 FROM faturamento f
        WHERE f.cliente_id = c.id AND f.situacao IN ('CONFIRMADO','EMITIDA','RECEBIDA')) GROUP BY 1;"

   O mapa mostra PRESENCA (sim/nao), nunca quantidade — nenhum numero de
   carteira aparece na tela.

   ufs     — siglas dos estados ja atendidos. Pintam o estado.
   cidades — pontos no mapa. lat/lon em graus decimais (negativo = Sul/Oeste).
             A UF da cidade e pintada automaticamente, mesmo que falte em "ufs".
             Cidade sem lat/lon e ignorada no desenho (mas ainda pinta a UF).
             "sede: true" desenha o ponto branco da sede da Agile. */

const MAPA_PRESENCA_DADOS = {
  revisado: true,

  // Conferido em 09/10/2026: RS 27, SC 14, PR 11, CE 2, SP 1 clientes com receita.
  ufs: ["RS", "SC", "PR", "SP", "CE"],

  cidades: [
    { nome: "Itajaí", uf: "SC", lat: -26.9078, lon: -48.6619, sede: true }
  ]
};
