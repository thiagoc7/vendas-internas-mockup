// Dados FICTÍCIOS do mockup Vendas Internas v4 (era v3) (21/10/2026). Nenhuma pessoa ou empresa real.
// CNPJ: base de 12 dígitos; o dígito verificador é calculado aqui (cnpj()).
window.HOJE = "2026-10-21"; // quarta-feira

window.cnpjDv = (b) => { const d = b.split("").map(Number);
  for (const w of [[5,4,3,2,9,8,7,6,5,4,3,2],[6,5,4,3,2,9,8,7,6,5,4,3,2]]) { const s = w.reduce((a, k, i) => a + k * d[i], 0); const r = s % 11; d.push(r < 2 ? 0 : 11 - r); }
  return d.join(""); };
window.cnpjFmt = (d) => d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
const _cnpj = (b) => cnpjFmt(cnpjDv(b));

window.VENDEDORAS = [
  { id: "fer", nome: "Fernanda Rocha", curto: "Fernanda" },
  { id: "jul", nome: "Juliana Prado", curto: "Juliana" },
  { id: "cam", nome: "Camila Neves", curto: "Camila" },
];
window.SUPERVISOR = { nome: "Marcelo Duarte", curto: "Marcelo" };

// Carteira (vem do BI: dim_cliente.id_rep_carteira). consumo = média L/mês dos últimos 3 meses.
window.CLIENTES = [
  { id: 1, dona: "fer", nome: "Concretiza Concreto", razao: "Concretiza Concreto Usinado Ltda", cnpj: _cnpj("473815920001"), cidade: "Barueri", consumo: 22000, produto: "S10", ultimo: "2026-10-17", vencidos: 0, titulos: 0, limite: 600000,
    prox: null, eventos: [{ d: "2026-10-17", h: "10:40", canal: "whatsapp", dir: "cliente", res: "conversou", quem: "Elaine", n: 4, ini: "2026-10-17", memo: "Pediu 6.000 L pra quinta. A Elaine atendeu a caixa no sábado e programou a entrega." },
      { d: "2026-10-02", h: "11:20", canal: "telefone", dir: "eu", res: "conversou", memo: "Contou da usina nova em Barueri a partir de novembro. Pedi pra conversar com o Marcos (compras)." }] },
  { id: 2, dona: "fer", nome: "Concreteira Pedra Alta", razao: "Pedra Alta Concreto e Bombeamento Ltda", cnpj: _cnpj("281940370001"), cidade: "Guarulhos", consumo: 9500, produto: "S10", ultimo: "2026-10-14", vencidos: 18430, titulos: 2, limite: 150000, prox: null, eventos: [] },
  { id: 3, dona: "fer", nome: "Construtora Horizonte Verde", razao: "Horizonte Verde Construções e Incorporações S.A.", cnpj: _cnpj("615203840001"), cidade: "Cotia", consumo: 6200, produto: "S500", ultimo: "2026-10-02", vencidos: 0, titulos: 0, limite: 200000, prox: null, eventos: [] },
  { id: 4, dona: "fer", nome: "Transportes Irmãos Sabiá", razao: "Transportes Irmãos Sabiá Ltda", cnpj: _cnpj("390172650001"), cidade: "Osasco", consumo: 14000, produto: "S10", ultimo: "2026-10-17", vencidos: 0, titulos: 0, limite: 250000,
    prox: { d: "2026-10-28", h: "10:00", assunto: "acompanhar consumo" },
    eventos: [{ d: "2026-10-14", h: "15:40", canal: "whatsapp", dir: "cliente", res: "conversou", memo: "Pediu pra antecipar a entrega de sexta. Combinado com a logística." }] },
  { id: 5, dona: "fer", nome: "Mercado Vila Nova", razao: "Comercial Vila Nova de Alimentos Ltda", cnpj: _cnpj("528461030001"), cidade: "Carapicuíba", consumo: 1800, produto: "S10", ultimo: "2026-09-21", vencidos: 3210, titulos: 1, limite: 30000, prox: null,
    eventos: [{ d: "2026-09-30", h: "09:15", canal: "telefone", dir: "eu", res: "sem_resposta", memo: "Liguei sobre o título vencido, ninguém atendeu." }] },
  { id: 6, dona: "fer", nome: "Viação Jardim Paulista", razao: "Viação Jardim Paulista Transportes Ltda", cnpj: _cnpj("174092860001"), cidade: "São Paulo", consumo: 31000, produto: "S10", ultimo: "2026-10-20", vencidos: 0, titulos: 0, limite: 900000,
    prox: { d: "2026-11-03", h: "", assunto: "renovação do contrato" }, eventos: [{ d: "2026-10-08", h: "14:00", canal: "reuniao", dir: "eu", res: "conversou", memo: "Reunião com o gerente de frota. Contrato vence em dezembro; quer proposta em novembro." }] },
  { id: 7, dona: "jul", nome: "Agropecuária Ibiúna Verde", razao: "Agropecuária Ibiúna Verde Ltda", cnpj: _cnpj("703518290001"), cidade: "Ibiúna", consumo: 5400, produto: "S500", ultimo: "2026-10-09", vencidos: 0, titulos: 0, limite: 80000, prox: null, eventos: [] },
  { id: 8, dona: "cam", nome: "Locadora Máquinas Anhanguera", razao: "Anhanguera Locação de Máquinas Ltda", cnpj: _cnpj("846270150001"), cidade: "Cajamar", consumo: 7800, produto: "S500", ultimo: "2026-10-16", vencidos: 4120, titulos: 1, limite: 120000, prox: null, eventos: [] },
];

// Negócio = "estou vendendo pra ele". cliente = id da carteira (venda nova pra cliente) ou null (prospect).
// etapa: contato | proposta | fechado | perdido. conversa = já houve contato com resultado "conversou".
const _neg = (o) => ({ comodato: false, conversa: false, previsao: "", concorrente: "", visita: false, visitaNota: "", gescor: null, motivo: "", cliente: null, eventos: [], ...o });
window.NEGOCIOS = [
  // ── Fernanda: atrasados
  _neg({ id: 1, dona: "fer", empresa: "Transportes Rota Bandeirante", razao: "Rota Bandeirante Transportes e Logística Ltda", cnpj: _cnpj("552018470001"), cidade: "São Paulo (Vila Maria)",
    produto: "S10", litros: 18000, etapa: "contato", contato: { nome: "Wagner Teles", tel: "(11) 98722-1043", email: "wagner@rotabandeirante.exemplo" }, concorrente: "Ipiranga",
    prox: null, campanha: "in", fonteDet: "cliente Irmãos Sabiá",
    eventos: [{ d: "2026-10-20", h: "16:10", canal: "whatsapp", dir: "eu", res: null, memo: "" },
      { d: "2026-10-15", h: "16:10", canal: "email", dir: "eu", res: "sem_resposta", memo: "Mandei a tabela de outubro S10 com frete CIF.", n: 1 },
      { d: "2026-10-13", h: "11:30", canal: "telefone", dir: "eu", res: "sem_resposta", memo: "Recepção pediu pra mandar por e-mail." },
      { d: "2026-10-13", h: "11:00", sistema: "Negócio criado (indicação do cliente Irmãos Sabiá)" }] }),
  _neg({ id: 2, dona: "fer", empresa: "Concreteira Pedra Alta", cliente: 2, cidade: "Guarulhos", produto: "S10", litros: 4000, comodato: true, etapa: "proposta", conversa: true, previsao: "2026-10-30",
    contato: { nome: "Renata Paiva", tel: "(11) 97455-2210", email: "compras@pedraalta.exemplo" },
    prox: { d: "2026-10-20", h: "15:00", assunto: "fechar comodato da bomba nova", canal: "whatsapp" },
    eventos: [{ d: "2026-10-16", h: "10:05", canal: "whatsapp", dir: "eu", res: "pediu_proposta", memo: "Proposta #1433 enviada: tanque 15 m³ em comodato + S10 a R$ 6,18." },
      { d: "2026-10-14", h: "09:40", canal: "telefone", dir: "cliente", res: "conversou", memo: "Vão abrir frente nova em Arujá, querem tanque lá." }] }),
  _neg({ id: 3, dona: "fer", empresa: "Supermercados Bom Preço Paulista", razao: "Bom Preço Paulista Supermercados Ltda", cnpj: _cnpj("617390250001"), cidade: "Carapicuíba", produto: "S10", litros: 2500, etapa: "contato", conversa: true,
    contato: { nome: "Cláudio Mendes", tel: "(11) 96610-7781", email: "claudio@bompreco.exemplo" },
    prox: { d: "2026-10-16", h: "", assunto: "falar com compras sobre os geradores", canal: "telefone" }, campanha: "lc",
    eventos: [{ d: "2026-10-09", h: "14:20", canal: "telefone", dir: "eu", res: "conversou", memo: "Usam diesel nos geradores das 4 lojas. Quem decide é o compras, volta dia 16." }] }),
  // ── Fernanda: hoje
  _neg({ id: 4, dona: "fer", empresa: "Concretiza Concreto", cliente: 1, cidade: "Barueri", produto: "S10", litros: 30000, comodato: true, etapa: "proposta", conversa: true, previsao: "2026-10-27", concorrente: "Vibra",
    contato: { nome: "Marcos Ribeiro", tel: "(11) 98134-5520", email: "marcos.compras@concretiza.exemplo" }, visita: true, visitaNota: "Ver o lugar do tanque na usina nova antes de fechar.",
    prox: { d: "2026-10-21", h: "14:00", assunto: "fechar comodato da usina Barueri", canal: "whatsapp" },
    eventos: [{ d: "2026-10-20", h: "17:30", canal: "email", dir: "cliente", res: "conversou", memo: "Pediu prazo de 28 dias e que o tanque seja de 30 m³." },
      { d: "2026-10-19", h: "10:00", canal: "email", dir: "eu", res: "pediu_proposta", memo: "Proposta #1434 enviada: 30.000 L/mês S10, tanque 30 m³ em comodato." },
      { d: "2026-10-16", h: "11:00", canal: "reuniao", dir: "eu", res: "conversou", memo: "Reunião no escritório deles. Usina nova abre em novembro; hoje compram da Vibra." }] }),
  _neg({ id: 5, dona: "fer", empresa: "Hospital Santa Clara de Osasco", razao: "Associação Hospitalar Santa Clara de Osasco", cnpj: _cnpj("438102770001"), cidade: "Osasco", produto: "S10", litros: 2500, etapa: "contato", etapaV4: "qualificado", previsaoNec: "2026-11", conversa: true,
    contato: { nome: "Patrícia Gomes", tel: "(11) 3681-4400", email: "suprimentos@hsantaclara.exemplo" },
    prox: null, campanha: "in", fonteDet: "Marcelo (supervisor)",
    eventos: [{ d: "2026-10-17", h: "15:00", canal: "email", dir: "eu", res: "qualificado", memo: "Mandei a tabela S10 com entrega quinzenal no gerador. Contrato atual vai até o fim de novembro." },
      { d: "2026-10-15", h: "09:30", canal: "telefone", dir: "eu", res: "conversou", memo: "Contrato atual vence em novembro, estão cotando 3 distribuidoras." }] }),
  _neg({ id: 6, dona: "fer", empresa: "DataSul Data Center", razao: "DataSul Serviços de Data Center Ltda", cnpj: _cnpj("290571840001"), cidade: "Carapicuíba", campanha: "lc", produto: "S10", litros: 4000, etapa: "contato",
    contato: { nome: "Eduardo Kato", tel: "(11) 99820-3315", email: "facilities@datasul.exemplo" },
    prox: { d: "2026-10-21", h: "09:00", assunto: "1º contato — diesel dos geradores", canal: "whatsapp" },
    eventos: [{ d: "2026-10-20", h: "16:00", sistema: "Negócio criado (importado da Lista Carapicuíba)" }] }),
  _neg({ id: 7, dona: "fer", empresa: "Construtora Horizonte Verde", cliente: 3, cidade: "Cotia", produto: "S500", litros: 5000, etapa: "contato", conversa: true,
    contato: { nome: "Anderson Viana", tel: "(11) 97001-8846", email: "obras@horizonteverde.exemplo" },
    prox: { d: "2026-10-21", h: "16:00", assunto: "obra nova em Cotia (Granja Viana)", canal: "telefone" },
    eventos: [{ d: "2026-10-20", h: "11:15", canal: "whatsapp", dir: "cliente", res: "conversou", memo: "Começam terraplanagem na Granja Viana dia 03/11. Querem diesel no canteiro." }] }),
  // ── Fernanda: sem próximo contato
  _neg({ id: 8, dona: "fer", empresa: "Plásticos Cotia Indústria", razao: "Plásticos Cotia Indústria e Comércio Ltda", cnpj: _cnpj("361847290001"), cidade: "Cotia", produto: "S500", litros: 3500, etapa: "contato", conversa: true,
    contato: { nome: "Sônia Freitas", tel: "(11) 4612-0090", email: "" }, prox: null, campanha: "lc",
    eventos: [{ d: "2026-10-12", h: "10:40", canal: "telefone", dir: "eu", res: "conversou", memo: "Falei com a Sônia: usam S500 na caldeira, compram de posto. Pediu pra mandar tabela e ligar de novo." }] }),
  _neg({ id: 9, dona: "fer", empresa: "Logística Tietê Express", razao: "Tietê Express Logística Ltda", cnpj: _cnpj("520936180001"), cidade: "Osasco", produto: "S10", litros: 12000, etapa: "contato", conversa: true,
    contato: { nome: "Rafael Moura", tel: "(11) 98877-6402", email: "rafael@tieteexpress.exemplo" }, prox: null, concorrente: "Raízen", campanha: "wa", etapaV4: "qualificado", previsaoNec: "2026-12",
    eventos: [{ d: "2026-10-07", h: "13:50", canal: "whatsapp", dir: "eu", res: "conversou", memo: "Frota de 40 caminhões, contrato com a Raízen até dezembro. Pediu pra falar mais perto do fim do ano." }] }),
  // ── Fernanda: proposta com próximo no futuro
  _neg({ id: 10, dona: "fer", empresa: "Pedreira Vale do Juqueri", razao: "Mineração Vale do Juqueri Ltda", cnpj: _cnpj("147258360001"), cidade: "Mairiporã", produto: "S500", litros: 15000, comodato: true, etapa: "proposta", conversa: true, previsao: "2026-11-05",
    contato: { nome: "Gilberto Sá", tel: "(11) 97230-1188", email: "gilberto@valejuqueri.exemplo" },
    prox: { d: "2026-10-23", h: "09:30", assunto: "retorno da proposta #1431", canal: "telefone" }, campanha: "in", fonteDet: "Hélio (Atlas)",
    eventos: [{ d: "2026-10-18", h: "10:20", canal: "email", dir: "eu", res: "pediu_proposta", memo: "Proposta #1431 enviada (S500 + tanque 20 m³)." },
      { d: "2026-10-14", h: "15:30", canal: "telefone", dir: "cliente", res: "conversou", memo: "Ligou pedindo preço; o fornecedor atual atrasou duas entregas." }] }),
  _neg({ id: 11, dona: "fer", empresa: "Frigorífico Serra Azul", razao: "Frigorífico Serra Azul Alimentos Ltda", cnpj: _cnpj("852741960001"), cidade: "Itapecerica da Serra", produto: "S10", litros: 6000, etapa: "proposta", conversa: true, previsao: "2026-11-15",
    contato: { nome: "Luciana Prates", tel: "(11) 4667-2010", email: "compras@serraazul.exemplo" },
    prox: null, campanha: "lc",
    eventos: [{ d: "2026-10-16", h: "09:00", canal: "email", dir: "eu", res: "pediu_proposta", memo: "Proposta #1435 enviada. Sem retorno ainda." },
      { d: "2026-10-14", h: "14:10", canal: "telefone", dir: "eu", res: "conversou", memo: "Câmaras frias com gerador a diesel + 8 caminhões de entrega." }] }),
  // ── Fernanda: fechado (aguardando GESCOR) e perdido
  _neg({ id: 12, dona: "fer", empresa: "Guindastes Atlas Içamentos", razao: "Atlas Içamentos e Guindastes Ltda", cnpj: _cnpj("963852740001"), cidade: "Santana de Parnaíba", produto: "S10", litros: 7000, etapa: "fechado", conversa: true, gescor: "aguardando", ganhoEm: "2026-10-19",
    endereco: "Av. Tenente Marques, 4100 — Fazendinha — Santana de Parnaíba/SP — 06529-001",
    contato: { nome: "Hélio Bastos", tel: "(11) 99541-3307", email: "helio@atlasicamentos.exemplo" }, prox: { d: "2026-10-24", h: "", assunto: "confirmar 1º pedido" }, campanha: "in", fonteDet: "cliente Irmãos Sabiá",
    eventos: [{ d: "2026-10-19", h: "16:45", canal: "telefone", dir: "cliente", res: "fechou", memo: "Fechou! 1º pedido de 5.000 L pra semana que vem." },
      { d: "2026-10-15", h: "10:00", canal: "email", dir: "eu", res: "pediu_proposta", memo: "Proposta #1428 enviada." }] }),
  _neg({ id: 13, dona: "fer", empresa: "Transportadora Ligeira Sul", razao: "Ligeira Sul Transportes Rodoviários Ltda", cnpj: _cnpj("741963850001"), cidade: "São Bernardo do Campo", produto: "S10", litros: 20000, etapa: "perdido", conversa: true, motivo: "Preço", concorrente: "Vibra", campanha: "lc",
    contato: { nome: "Otávio Lins", tel: "(11) 4332-7781", email: "otavio@ligeirasul.exemplo" }, prox: null,
    eventos: [{ d: "2026-10-14", h: "11:00", canal: "telefone", dir: "cliente", res: "recusou", memo: "Ficaram com a Vibra: R$ 0,06 abaixo da nossa." },
      { d: "2026-10-08", h: "10:30", canal: "email", dir: "eu", res: "pediu_proposta", memo: "Proposta #1419 enviada." }] }),
  // ── Fernanda: leads de LinkedIn e do site (sem campanha)
  _neg({ id: 14, dona: "fer", empresa: "Terraplenagem Morro Grande", razao: "Morro Grande Terraplenagem Ltda", cnpj: _cnpj("418273650001"), cidade: "Santana de Parnaíba", produto: "S500", litros: 8000, etapa: "contato", conversa: true, fonte: "linkedin", fonteDet: "post da obra no Tamboré",
    contato: { nome: "Vinícius Prado", tel: "(11) 98412-7730", email: "" }, prox: { d: "2026-10-23", h: "10:00", assunto: "mandar tabela S500", canal: "whatsapp" },
    eventos: [{ d: "2026-10-16", h: "16:20", canal: "whatsapp", dir: "cliente", res: "conversou", memo: "3 escavadeiras e 2 caminhões; abastecem em posto. Quer preço S500 no canteiro." },
      { d: "2026-10-15", h: "", sistema: "Lead cadastrado (LinkedIn)" }] }),
  _neg({ id: 15, dona: "fer", empresa: "Lavanderia Industrial Tamboré", razao: "Tamboré Lavanderia Industrial Ltda", cnpj: _cnpj("517392840001"), cidade: "Barueri", produto: "S10", litros: 3000, etapa: "contato", fonte: "site", fonteDet: "formulário de contato",
    contato: { nome: "Cristiane Lopes", tel: "(11) 4195-3300", email: "compras@lavtambore.exemplo" }, prox: { d: "2026-10-21", h: "15:30", assunto: "tentar de novo — caldeira a diesel", canal: "telefone" },
    eventos: [{ d: "2026-10-20", h: "10:15", canal: "telefone", dir: "eu", res: "sem_resposta", memo: "Recepção: a Cristiane volta amanhã à tarde." },
      { d: "2026-10-19", h: "", sistema: "Lead do site (formulário de contato)" }] }),
  // ── Juliana
  _neg({ id: 21, dona: "jul", empresa: "Viação Morumbi Sul", razao: "Viação Morumbi Sul Ltda", cnpj: _cnpj("258369140001"), cidade: "São Paulo (Campo Limpo)", produto: "S10", litros: 40000, etapa: "contato", conversa: true,
    contato: { nome: "Jorge Amaral", tel: "(11) 5511-0020", email: "" }, fonte: "linkedin", prox: { d: "2026-10-15", h: "", assunto: "retorno com o gerente de frota" },
    eventos: [{ d: "2026-10-08", h: "10:00", canal: "telefone", dir: "eu", res: "conversou", memo: "Pediu pra ligar depois do dia 15." }] }),
  _neg({ id: 22, dona: "jul", empresa: "Construtora Pilar Forte", razao: "Pilar Forte Engenharia Ltda", cnpj: _cnpj("369147250001"), cidade: "Santo André", produto: "S500", litros: 8000, etapa: "proposta", conversa: true,
    contato: { nome: "Márcia Leal", tel: "(11) 98111-4040", email: "compras@pilarforte.exemplo" }, fonte: "site", prox: { d: "2026-10-20", h: "11:00", assunto: "retorno da proposta" },
    eventos: [{ d: "2026-10-16", h: "16:00", canal: "email", dir: "eu", res: "pediu_proposta", memo: "Proposta #93 enviada." }] }),
  _neg({ id: 23, dona: "jul", empresa: "Mineradora Itapeva Sul", razao: "Itapeva Sul Mineração Ltda", cnpj: _cnpj("471258360001"), cidade: "Embu das Artes", produto: "S500", litros: 9000, etapa: "contato", contato: { nome: "Paulo Reis", tel: "(11) 4704-2299", email: "" }, fonte: "lista", fonteDet: "lista própria de mineradoras", prox: null,
    eventos: [{ d: "2026-10-09", h: "09:00", canal: "telefone", dir: "eu", res: "sem_resposta", memo: "" }] }),
  _neg({ id: 24, dona: "jul", empresa: "Agropecuária Ibiúna Verde", cliente: 7, cidade: "Ibiúna", produto: "S500", litros: 3000, comodato: true, etapa: "proposta", conversa: true, visita: true, visitaNota: "Conhecer a fazenda nova, ver acesso de caminhão.",
    contato: { nome: "Sr. Valter", tel: "(15) 99711-0303", email: "" }, prox: { d: "2026-10-22", h: "10:00", assunto: "retorno da proposta" },
    eventos: [{ d: "2026-10-19", h: "15:00", canal: "whatsapp", dir: "cliente", res: "pediu_proposta", memo: "Quer tanque na fazenda nova." }] }),
  // ── Camila
  _neg({ id: 31, dona: "cam", empresa: "Hospital Vida Plena ABC", razao: "Hospital Vida Plena ABC S.A.", cnpj: _cnpj("582471930001"), cidade: "São Caetano do Sul", produto: "S10", litros: 3000, etapa: "contato", conversa: true,
    contato: { nome: "Daniela Rocha", tel: "(11) 4220-1500", email: "" }, fonte: "indicacao", fonteDet: "cliente Real Paulista", prox: { d: "2026-10-21", h: "11:00", assunto: "visita técnica do gerador" },
    eventos: [{ d: "2026-10-20", h: "14:00", canal: "telefone", dir: "eu", res: "conversou", memo: "" }, { d: "2026-10-19", h: "09:30", canal: "email", dir: "eu", res: "sem_resposta", memo: "" }] }),
  _neg({ id: 32, dona: "cam", empresa: "Transportes Real Paulista", razao: "Real Paulista Transportes Ltda", cnpj: _cnpj("693582410001"), cidade: "Barueri", produto: "S10", litros: 25000, etapa: "proposta", conversa: true,
    contato: { nome: "Roberto Faria", tel: "(11) 98222-7070", email: "roberto@realpaulista.exemplo" }, fonte: "linkedin", prox: { d: "2026-10-27", h: "", assunto: "retorno da proposta" },
    eventos: [{ d: "2026-10-20", h: "10:00", canal: "email", dir: "eu", res: "pediu_proposta", memo: "Proposta #94 enviada." }, { d: "2026-10-19", h: "11:00", canal: "telefone", dir: "eu", res: "conversou", memo: "" }] }),
  _neg({ id: 33, dona: "cam", empresa: "Usina de Asfalto Rodoanel", razao: "Rodoanel Asfaltos Ltda", cnpj: _cnpj("714825930001"), cidade: "Embu das Artes", produto: "S500", litros: 11000, etapa: "contato", contato: { nome: "Nelson Prado", tel: "(11) 4781-3030", email: "" }, fonte: "outra", fonteDet: "feira de asfalto", prox: null,
    eventos: [{ d: "2026-10-20", h: "15:00", canal: "whatsapp", dir: "eu", res: "sem_resposta", memo: "" }] }),
];

// Consulta à Receita (mock): CNPJs de exemplo pro [+ Negócio].
window.RECEITA = {
  [cnpjDv("335577990001")]: { razao: "Condomínio Empresarial Alpha Park", fantasia: "Alpha Park", endereco: "Al. Rio Negro, 1500 — Alphaville — Barueri/SP — 06454-000", cidade: "Barueri", situacao: "ATIVA" },
};
window.CNPJ_EXEMPLO_NOVO = cnpjFmt(cnpjDv("335577990001"));
window.CNPJ_EXEMPLO_CLIENTE = window.CLIENTES[3].cnpj; // Irmãos Sabiá, já da carteira

// ════════════════════════════════════════════════════════════════════════════
// v2 — Cliente e prospect = MESMA ficha (CONTAS). Negócio = no máximo um aberto por conta.
// Os arrays acima (CLIENTES, NEGOCIOS) seguem como fonte; montarContas() junta tudo.
// ════════════════════════════════════════════════════════════════════════════

// Números do BI por cliente (fictícios): segmento, cliente desde, ciclo de compra (dias), tanques em comodato, 12 meses.
window.BI_EXTRA = {
  1: { segmento: "Concreto", desde: 2020, ciclo: 7, tanques: 2, l12: 251000, r12: 1556000, comodatoEquip: ["Tanque 15 m³ · Usina Carapicuíba", "Tanque 15 m³ · Usina Osasco"], proxEntrega: { d: "2026-10-23", litros: 6000, rota: "Rota Oeste 2" } },
  2: { segmento: "Concreto", desde: 2022, ciclo: 10, tanques: 1, l12: 108000, r12: 664000, comodatoEquip: ["Tanque 15 m³ · Guarulhos"], proxEntrega: null },
  3: { segmento: "Construção", desde: 2023, ciclo: 10, tanques: 0, l12: 70000, r12: 423000, comodatoEquip: [], proxEntrega: null },
  4: { segmento: "Transporte", desde: 2019, ciclo: 12, tanques: 1, l12: 162000, r12: 1004000, comodatoEquip: ["Tanque 30 m³ · Garagem Osasco"], proxEntrega: { d: "2026-10-24", litros: 5000, rota: "Rota Oeste 1" } },
  5: { segmento: "Varejo", desde: 2024, ciclo: 14, tanques: 1, l12: 19800, r12: 125000, comodatoEquip: ["Tanque 5 m³ · Gerador loja"], proxEntrega: null },
  6: { segmento: "Transporte", desde: 2018, ciclo: 3, tanques: 2, l12: 368000, r12: 2262000, comodatoEquip: ["Tanque 30 m³ · Garagem Pirituba", "Tanque 30 m³ · Garagem Lapa"], proxEntrega: { d: "2026-10-22", litros: 10000, rota: "Rota Capital" } },
  7: { segmento: "Agro", desde: 2021, ciclo: 12, tanques: 1, l12: 61000, r12: 362000, comodatoEquip: ["Tanque 15 m³ · Sede"], proxEntrega: null },
  8: { segmento: "Locação de máquinas", desde: 2022, ciclo: 7, tanques: 0, l12: 90000, r12: 545000, comodatoEquip: [], proxEntrega: null },
};
// Segmento dos prospects (id do negócio de origem).
window.SEG_PROSPECT = { 14: "Construção", 15: "Serviços", 1: "Transporte", 3: "Varejo", 5: "Hospital", 6: "Data center", 8: "Indústria", 9: "Transporte", 10: "Mineração", 11: "Frigorífico", 12: "Guindastes", 13: "Transporte",
  21: "Transporte", 22: "Construção", 23: "Mineração", 31: "Hospital", 32: "Transporte", 33: "Asfalto" };

// Pessoas da empresa (além do contato principal que vem do negócio). papel: principal | decisor | compras | financeiro | operacional.
window.PESSOAS_EXTRA = {
  1: [{ nome: "Marcos Ribeiro", papel: "compras", tel: "(11) 98134-5520", email: "marcos.compras@concretiza.exemplo", prefere: "whatsapp", principal: true },
      { nome: "Sílvia Toledo", papel: "decisor", tel: "(11) 4198-2200", email: "diretoria@concretiza.exemplo", prefere: "email" },
      { nome: "Jair (pátio)", papel: "operacional", tel: "(11) 99310-4471", email: "", prefere: "whatsapp" }],
  2: [{ nome: "Ademir Paiva", papel: "decisor", tel: "(11) 97455-2000", email: "", prefere: "telefone" }],
  3: [{ nome: "Lívia Campos", papel: "financeiro", tel: "", email: "financeiro@horizonteverde.exemplo", prefere: "email" }],
  4: [{ nome: "Sebastião Sabiá", papel: "decisor", tel: "(11) 97700-1212", email: "", prefere: "whatsapp", principal: true }, { nome: "Kátia (escritório)", papel: "financeiro", tel: "(11) 3602-1000", email: "kat@irmaossabia.exemplo", prefere: "email" }],
  5: [{ nome: "Sr. Antônio", papel: "decisor", tel: "(11) 4185-3030", email: "", prefere: "telefone", principal: true }],
  6: [{ nome: "Fábio Nunes", papel: "decisor", tel: "(11) 98800-6000", email: "frota@viacaojp.exemplo", prefere: "email", principal: true }, { nome: "Carla Mendes", papel: "compras", tel: "(11) 3871-2000", email: "compras@viacaojp.exemplo", prefere: "email" }],
  8: [{ nome: "Irene Couto", papel: "compras", tel: "(11) 4447-0909", email: "", prefere: "whatsapp", principal: true }],
  105: [{ nome: "Dr. Roberto Lemos", papel: "decisor", tel: "", email: "diretoria@hsantaclara.exemplo", prefere: "email" }],
  110: [{ nome: "Neusa (financeiro)", papel: "financeiro", tel: "(11) 4419-2020", email: "", prefere: "telefone" }],
};

// Meta do mês por vendedora (litros) — realizado vem do BI (faturado no mês).
window.META = {
  fer: { meta: 180000, real: 112000, s10: 86000, s500: 26000 },
  jul: { meta: 150000, real: 97000, s10: 61000, s500: 36000 },
  cam: { meta: 120000, real: 58000, s10: 49000, s500: 9000 },
};
window.TABELA = { S10: 6.32, S500: 6.05 }; // preço de tabela (R$/L) pro "estimado" do prospect

// Caixa da vendedora (WhatsApp do chip dela + e-mail dela). conta = id da conta (cliente id | 100 + id do negócio do prospect).
window.CONVERSAS = [
  { id: 1, dona: "fer", canal: "whatsapp", nome: "Marcos Ribeiro", conta: 1, hora: "09:12", dia: "2026-10-21", naoLidas: 2,
    msgs: [{ dir: "eu", h: "17:52", d: "2026-10-20", t: "Marcos, recebi seu e-mail. Vou ver o prazo de 28 dias e o tanque de 30 m³ e te retorno amanhã." },
      { dir: "cliente", h: "09:10", t: "Bom dia Fernanda!" },
      { dir: "cliente", h: "09:12", t: "Conseguiu ver o prazo? A diretoria quer decidir até sexta." }] },
  { id: 2, dona: "fer", canal: "email", nome: "Patrícia Gomes", conta: 105, hora: "08:40", dia: "2026-10-21", naoLidas: 1, assunto: "RE: Tabela de diesel S10 — gerador",
    msgs: [{ dir: "eu", h: "15:00", d: "2026-10-17", t: "Patrícia, segue a tabela de diesel S10 para o gerador, com entrega quinzenal. Fico à disposição." },
      { dir: "cliente", h: "08:40", t: "Fernanda, bom dia. Recebemos. O contrato atual vai até o fim de novembro; perto disso a comissão abre cotação e te chamo. Vocês fazem entrega aos sábados?" }] },
  { id: 3, dona: "fer", canal: "whatsapp", nome: "+55 11 97321-4480", conta: null, hora: "08:05", dia: "2026-10-21", naoLidas: 1, desconhecido: true,
    msgs: [{ dir: "cliente", h: "08:05", t: "Bom dia, peguei seu contato com o Hélio da Atlas. Vocês entregam diesel em Alphaville? Temos 3 geradores no condomínio." }] },
  { id: 4, dona: "fer", canal: "whatsapp", nome: "Anderson Viana", conta: 3, hora: "11:20", dia: "2026-10-20", naoLidas: 0,
    msgs: [{ dir: "cliente", h: "11:10", d: "2026-10-20", t: "Fernanda, começamos a terraplanagem na Granja Viana dia 03/11." },
      { dir: "cliente", h: "11:15", d: "2026-10-20", t: "Vamos precisar de diesel no canteiro, umas 2 entregas por semana." },
      { dir: "eu", h: "11:20", d: "2026-10-20", t: "Ótimo! Te ligo amanhã à tarde pra combinar volume e acesso." }] },
  { id: 5, dona: "fer", canal: "whatsapp", nome: "Wagner Teles", conta: 101, hora: "16:10", dia: "2026-10-20", naoLidas: 0,
    msgs: [{ dir: "eu", h: "16:10", d: "2026-10-20", t: "Wagner, boa tarde! Sou a Fernanda, da Disbra. Te mandei a tabela de outubro do S10 por e-mail semana passada. Conseguiu ver? Consigo frete CIF pra Vila Maria." }] },
  { id: 6, dona: "fer", canal: "whatsapp", nome: "Hélio Bastos", conta: 112, hora: "16:50", dia: "2026-10-19", naoLidas: 0, fechada: true,
    msgs: [{ dir: "cliente", h: "16:40", d: "2026-10-19", t: "Fernanda, fechado. Pode programar 5.000 L pra semana que vem." },
      { dir: "eu", h: "16:50", d: "2026-10-19", t: "Que ótimo, Hélio! Vou te mandar a ficha de cadastro e já programo a entrega." }] },
  { id: 7, dona: "fer", canal: "email", nome: "Fábio Nunes", conta: 6, hora: "14:30", dia: "2026-10-08", naoLidas: 0, fechada: true, assunto: "Renovação do contrato de fornecimento",
    msgs: [{ dir: "cliente", h: "14:30", d: "2026-10-08", t: "Fernanda, como falamos na reunião: o contrato vence em dezembro. Me manda a proposta de renovação em novembro." }] },
  { id: 8, dona: "jul", canal: "whatsapp", nome: "Sr. Valter", conta: 7, hora: "10:05", dia: "2026-10-21", naoLidas: 1,
    msgs: [{ dir: "cliente", h: "10:05", t: "Juliana, a fazenda nova fica pronta em novembro. Dá pra mandar o tanque antes?" }] },
  { id: 9, dona: "cam", canal: "email", nome: "Daniela Rocha", conta: 131, hora: "14:10", dia: "2026-10-20", naoLidas: 0, assunto: "Visita técnica — gerador",
    msgs: [{ dir: "eu", h: "14:10", d: "2026-10-20", t: "Daniela, confirmando a visita técnica de amanhã às 11h para ver o gerador." }] },
];
// conversa → evento automático da Atividade (os eventos de WhatsApp/e-mail que já existiam passam a apontar pra conversa).
window.LIGA_CONV = { "1|2026-10-20|17:30": null, "3|2026-10-20|11:15": 4, "101|2026-10-20|16:10": 5, "105|2026-10-17|15:00": 2, "112|2026-10-19|16:45": 6, "7|2026-10-19|15:00": 8 };


// ════════════════════════════════════════════════════════════════════════════
// v3 — Campanhas (lista de trabalho dela; a campanha mora no NEGÓCIO) + carteira completa (39 clientes).
// Os números da visão por campanha batem com a SPEC_V3 §5. Linhas geradas de forma determinística.
// ════════════════════════════════════════════════════════════════════════════
window.CAMPANHAS = [
  { id: "lc", nome: "Lista Carapicuíba", tipo: "lista", fonte: "lista", data: "2026-10-05" },
  { id: "re", nome: "Reativação out/26", tipo: "reativação", fonte: null, data: "2026-10-01" },
  { id: "in", nome: "Indicação", tipo: "indicação", fonte: "indicacao", data: "2026-09-15" },
  { id: "wa", nome: "WhatsApp (nº novo)", tipo: "whatsapp", fonte: "whatsapp_numero_novo", data: "2026-09-01" },
];
// Bloco do PWA que não sai dos dados acima (fictício, por vendedora)
window.PWA_EXTRA = {
  fer: { posit: 71, positDe: [10, 14], volDia: 4100, volVar: 6, cliAt: 31, cliVar: -2 },
  jul: { posit: 64, positDe: [9, 14], volDia: 3600, volVar: -3, cliAt: 27, cliVar: 1 },
  cam: { posit: 58, positDe: [7, 12], volDia: 2900, volVar: 4, cliAt: 22, cliVar: 0 },
};
window.TANQUES_MES = [{ conta: 1, m3: 15, d: "2026-10-17", local: "Usina Osasco" }];
(function gerarCarteira() {
  const TIPOS = ["Transportes", "Construtora", "Mercado", "Serralheria", "Logística", "Terraplenagem", "Locadora", "Cerâmica", "Metalúrgica", "Condomínio", "Granja", "Pedreira", "Gráfica", "Lavanderia", "Distribuidora", "Usina", "Clínica", "Fazenda"];
  const NOMES = ["Aldeia", "Cruzeiro", "Belval", "Bom Jesus", "São Pedro", "Vila Dirce", "Ariston", "Novo Horizonte", "Santa Terezinha", "Ipê Roxo", "Bandeirantes", "Monte Azul", "Três Irmãos", "Primavera", "Boa Vista", "Rio Cotia", "Tamboré", "Itapevi", "Jardim Marilu", "Parque Roseira", "Gopiúva", "Cidade Ariston", "Vila Silviânia", "Pq. Santa Tereza"];
  const SEG = { Transportes: "Transporte", Construtora: "Construção", Mercado: "Varejo", Serralheria: "Indústria", Logística: "Transporte", Terraplenagem: "Construção", Locadora: "Locação de máquinas", Cerâmica: "Indústria", Metalúrgica: "Indústria", Condomínio: "Condomínio", Granja: "Agro", Pedreira: "Mineração", Gráfica: "Indústria", Lavanderia: "Serviços", Distribuidora: "Comércio", Usina: "Concreto", Clínica: "Saúde", Fazenda: "Agro" };
  const PRIM = ["Carlos", "Simone", "Roberto", "Aline", "Jefferson", "Mônica", "Diego", "Vera", "Marcelo", "Tatiane", "Rogério", "Fabiana", "Edson", "Cristina", "Wellington", "Juliana", "Sérgio", "Priscila", "Adriano", "Lúcia"];
  const SOB = ["Almeida", "Barros", "Cardoso", "Duarte", "Esteves", "Farias", "Godoy", "Henriques", "Lacerda", "Macedo", "Nogueira", "Pacheco", "Queiroz", "Rezende", "Siqueira", "Tavares"];
  const CID_LC = ["Carapicuíba", "Carapicuíba", "Carapicuíba", "Cotia", "Barueri", "Osasco", "Jandira", "Itapevi"];
  const CID = ["Osasco", "Barueri", "Cotia", "São Paulo", "Santana de Parnaíba", "Jandira", "Itapevi", "Carapicuíba", "Taboão da Serra", "Embu das Artes"];
  let k = 0;
  const nome = () => { const i = k++; return `${TIPOS[(i * 5) % TIPOS.length]} ${NOMES[(i * 7 + Math.floor(i / 24)) % NOMES.length]}`; };
  const pessoa = (i) => ({ nome: `${PRIM[i % PRIM.length]} ${SOB[(i * 3) % SOB.length]}`, tel: `(11) 9${String(8100 + i * 37).padStart(4, "0")}-${String(1000 + i * 53).slice(-4)}`, email: "" });
  const UTEIS = ["2026-10-22", "2026-10-23", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-11-03", "2026-11-04", "2026-11-05"];
  const HORAS = ["09:00", "10:30", "14:00", "", "15:30", "11:00", "16:00"];
  const ASSUNTO = ["retorno da tabela", "falar com o decisor", "mandar tabela", "retorno da proposta", "acompanhar consumo"];
  const prox = (i, assunto) => ({ d: UTEIS[i % UTEIS.length], h: HORAS[i % HORAS.length], assunto: assunto || ASSUNTO[i % ASSUNTO.length], canal: ["telefone", "whatsapp", "telefone", "email"][i % 4] });
  const evPassado = ["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-19", "2026-10-20"];
  let nid = 200, cid = 41;
  const cnpjDe = (n) => _cnpj(String(500000000000 + n * 7919).slice(0, 8) + "0001");
  const negP = (camp, etapa, i, o = {}) => { const id = nid++, nm = nome(), cidade = (camp === "lc" ? CID_LC : CID)[i % 8], p = pessoa(id);
    const ev = etapa === "sem" ? [] : etapa === "contato" ? [{ d: evPassado[i % 6], h: "10:" + String(10 + i).slice(-2), canal: camp === "wa" ? "whatsapp" : "telefone", dir: camp === "wa" ? "cliente" : "eu", res: o.res || (i % 3 ? "conversou" : "sem_resposta"), memo: o.memo || (camp === "wa" ? "Chegou pelo WhatsApp pedindo preço." : i % 3 ? "Falou que compra de posto; topou receber tabela." : "Ninguém atendeu.") }]
      : [{ d: o.evd || evPassado[(i + 2) % 6], h: "15:20", canal: "email", dir: "eu", res: "pediu_proposta", memo: `Proposta #${95 + i} enviada.` }, { d: "2026-10-09", h: "11:00", canal: "telefone", dir: "eu", res: "conversou", memo: "" }];
    ev.push({ d: CAMPANHAS.find((c) => c.id === camp).data, h: "", sistema: camp === "lc" ? "Negócio criado (importado da Lista Carapicuíba)" : camp === "wa" ? "Prospect cadastrado a partir da conversa (número novo)" : "Negócio criado (indicação)" });
    NEGOCIOS.push(_neg({ id, dona: "fer", empresa: nm, razao: nm + " Ltda", cnpj: cnpjDe(id), cidade, produto: i % 3 ? "S10" : "S500", litros: 1500 + ((i * 1300) % 9000), etapa: etapa === "sem" ? "contato" : etapa, conversa: etapa !== "sem" && (etapa === "proposta" || i % 3 > 0), campanha: camp,
      contato: { ...p, email: etapa === "proposta" ? `compras@${nm.split(" ")[1].toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}.exemplo` : "" }, prox: etapa === "sem" ? null : o.prox !== undefined ? o.prox : prox(i), eventos: ev, motivo: o.motivo || "", concorrente: o.conc || "", etapaV4: o.etapaV4, previsaoNec: o.previsaoNec || "" }));
    SEG_PROSPECT[id] = SEG[nm.split(" ")[0]]; return id; };
  // cliente da carteira (BI). dias = dias sem comprar; ciclo = intervalo médio.
  const cli = (dias, ciclo, o = {}) => { const id = cid++, nm = o.nome || nome(), p = pessoa(id + 300), consumo = o.consumo || 1200 + ((id * 2300) % 14000);
    CLIENTES.push({ id, dona: "fer", eraLead: o.eraLead || null, nome: nm, razao: nm + " Ltda", cnpj: cnpjDe(id + 900), cidade: CID[id % CID.length], consumo, produto: id % 3 ? "S10" : "S500", ultimo: somaD(HOJE, -dias), vencidos: 0, titulos: 0, limite: 50000 + (id % 5) * 30000, prox: o.prox || null, eventos: o.eventos || [] });
    BI_EXTRA[id] = { segmento: SEG[nm.split(" ")[0]], desde: o.desde || 2019 + (id % 6), primeira: o.primeira || null, ciclo, tanques: id % 4 === 0 ? 1 : 0, l12: consumo * 11, r12: consumo * 11 * 6.1, comodatoEquip: id % 4 === 0 ? ["Tanque 5 m³ · Pátio"] : [], proxEntrega: null };
    PESSOAS_EXTRA[id] = [{ nome: p.nome, papel: "compras", tel: p.tel, email: "", prefere: "whatsapp", principal: true }]; return id; };
  const somaD = (s, n) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d) + n * 864e5).toISOString().slice(0, 10); };
  const negC = (cliId, camp, etapa, i, o = {}) => { const id = nid++;
    const ev = etapa === "sem" ? [] : [{ d: o.evd || evPassado[i % 6], h: "09:4" + (i % 10), canal: "telefone", dir: "eu", res: etapa === "perdido" ? "recusou" : etapa === "fechado" ? "fechou" : etapa === "proposta" ? "pediu_proposta" : i % 2 ? "conversou" : "sem_resposta", memo: etapa === "fechado" ? "Voltou a comprar: pedido de reativação." : etapa === "perdido" ? "Fechou com outro fornecedor." : "" }];
    ev.push({ d: "2026-10-01", h: "", sistema: "Negócio criado (Reativação out/26)" });
    NEGOCIOS.push(_neg({ id, dona: "fer", empresa: "", cliente: cliId, produto: "S10", litros: 2000 + ((i * 900) % 6000), etapa: etapa === "sem" ? "contato" : etapa, conversa: etapa !== "sem" && i % 2 > 0, campanha: camp, contato: null,
      prox: etapa === "sem" || etapa === "fechado" || etapa === "perdido" ? null : o.prox || prox(i + 3, "retomar compras"), eventos: ev, motivo: etapa === "perdido" ? "Ficou com o atual" : "", etapaV4: o.etapaV4 })); };
  // ── Lista Carapicuíba: 21 sem contato · 9 em contato · 3 proposta · 2 viraram cliente (+ DataSul, Bom Preço, Plásticos Cotia, Serra Azul, Ligeira Sul)
  for (let i = 0; i < 23; i++) negP("lc", "sem", i);
  window.FEITO_INICIAL = negP("lc", "contato", 0, { prox: { d: "2026-10-22", h: "10:00", assunto: "tentar de novo", canal: "telefone" } }); // ligou 08:30 hoje, não atendeu
  NEGOCIOS[NEGOCIOS.length - 1].eventos.unshift({ d: HOJE, h: "08:30", canal: "telefone", dir: "eu", res: "sem_resposta", memo: "Caixa postal." });
  for (let i = 1; i < 9; i++) negP("lc", "contato", i, i === 2 ? { prox: null, etapaV4: "qualificado", previsaoNec: "2026-10", memo: "Compra diesel pro gerador; pediu pra ligar em outubro, quando renova o contrato." } : {});
  negP("lc", "proposta", 0, { evd: "2026-10-14" }); negP("lc", "proposta", 1, { evd: "2026-10-19" }); negP("lc", "proposta", 2, { evd: "2026-10-20" });
  for (const [i, prim] of [[0, "2026-10-03"], [1, "2026-10-15"]]) { const c = cli(5 + i, 10, { desde: 2026, primeira: prim, consumo: i ? 2500 : 6000, eraLead: { fonte: "lista", campanha: "lc" } }); NEGOCIOS.push(_neg({ id: nid++, dona: "fer", cliente: c, produto: "S10", litros: i ? 2500 : 6000, etapa: "fechado", conversa: true, campanha: "lc", contato: null, prox: null,
    eventos: [{ d: prim, h: "11:00", canal: "telefone", dir: "eu", res: "fechou", memo: "1º pedido faturado." }, { d: "2026-10-05", h: "", sistema: "Negócio criado (importado da Lista Carapicuíba)" }] })); }
  // ── Reativação out/26: 15 clientes parados da carteira (3 sem contato · 6 contato · 2 proposta · 3 voltaram · 1 perdido)
  const r = [];
  for (let i = 0; i < 15; i++) r.push(cli(i < 3 ? 1 + i * 2 : 64 + i * 9, 15 + (i % 3) * 5, { nome: { 7: "Gráfica Novo Horizonte", 8: "Cerâmica Aldeia" }[i] }));
  for (let i = 0; i < 3; i++) negC(r[i], "re", "fechado", i, { evd: somaD(HOJE, -(1 + i * 2)) });
  for (let i = 3; i < 6; i++) negC(r[i], "re", "sem", i);
  negC(r[6], "re", "contato", 6, { prox: { d: "2026-10-19", h: "", assunto: "retomar compras", canal: "telefone" } });          // atrasado
  negC(r[7], "re", "contato", 7, { prox: { d: HOJE, h: "11:00", assunto: "retomar compras — ligar pro dono", canal: "telefone" } }); // hoje
  negC(r[8], "re", "contato", 8, { evd: "2026-10-13", etapaV4: "qualificado", prox: { d: "2026-10-19", h: "", assunto: "voltar a comprar — obra nova", canal: "telefone" } });
  for (let i = 9; i < 12; i++) negC(r[i], "re", "contato", i);
  negC(r[12], "re", "proposta", 12, { evd: "2026-10-19" }); negC(r[13], "re", "proposta", 13, { evd: "2026-10-20" }); negC(r[14], "re", "perdido", 14);
  // ── Indicação: + 1 em contato, + 1 virou cliente (Rota Bandeirante, Santa Clara, Juqueri e Atlas já estão)
  negP("in", "contato", 4);
  { const c = cli(8, 14, { desde: 2026, primeira: "2026-09-22", consumo: 3000, eraLead: { fonte: "indicacao", campanha: "in" } }); NEGOCIOS.push(_neg({ id: nid++, dona: "fer", cliente: c, produto: "S10", litros: 3000, etapa: "fechado", conversa: true, campanha: "in", contato: null, prox: null, eventos: [{ d: "2026-09-22", h: "10:00", canal: "telefone", dir: "cliente", res: "fechou", memo: "Indicação do Hélio (Atlas)." }] })); }
  // ── WhatsApp (nº novo): + 4 contato · 1 proposta · 1 cliente · 2 perdidos (Tietê Express já está)
  for (let i = 5; i < 9; i++) negP("wa", "contato", i);
  negP("wa", "proposta", 3, { evd: "2026-10-20" });
  { const c = cli(12, 12, { desde: 2026, primeira: "2026-09-10", consumo: 1800, eraLead: { fonte: "whatsapp_numero_novo", campanha: "wa" } }); NEGOCIOS.push(_neg({ id: nid++, dona: "fer", cliente: c, produto: "S500", litros: 1800, etapa: "fechado", conversa: true, campanha: "wa", contato: null, prox: null, eventos: [{ d: "2026-09-10", h: "15:00", canal: "whatsapp", dir: "cliente", res: "fechou", memo: "Chegou pelo número novo e fechou." }] })); }
  negP("wa", "perdido", 9, { prox: null, motivo: "Preço", conc: "Ipiranga" }); negP("wa", "perdido", 10, { prox: null, motivo: "Sem demanda" });
  NEGOCIOS.filter((n) => n.etapa === "perdido" && n.campanha === "wa").forEach((n) => { n.eventos.unshift({ d: "2026-10-08", h: "10:00", canal: "whatsapp", dir: "cliente", res: "recusou", memo: "" }); });
  // ── Resto da carteira (sem campanha): 4 prontos pra pedir · 3 esfriando · 2 inativos · 5 em dia
  for (const [dias, ciclo] of [[5, 7], [10, 9], [12, 11], [14, 13], [25, 10], [30, 12], [33, 14], [75, 15], [90, 20], [2, 7], [3, 10], [4, 14], [1, 5], [5, 12]]) cli(dias, ciclo);
})();

// Junta CLIENTES + NEGOCIOS numa conta por empresa.
window.montarContas = function () {
  const cl = (x) => JSON.parse(JSON.stringify(x));
  const contas = CLIENTES.map((c) => ({ id: c.id, tipo: "cliente", dona: c.dona, nome: c.nome, razao: c.razao, cnpj: c.cnpj, cidade: c.cidade, produto: c.produto,
    eraLead: c.eraLead || null, bi: { consumo: c.consumo, ultimo: c.ultimo, vencidos: c.vencidos, titulos: c.titulos, limite: c.limite, ...BI_EXTRA[c.id] }, segmento: BI_EXTRA[c.id]?.segmento || "",
    prox: cl(c.prox), eventos: cl(c.eventos), neg: null, pessoas: cl(PESSOAS_EXTRA[c.id] || []), gescor: null }));
  for (const n of NEGOCIOS) {
    let c = n.cliente ? contas.find((x) => x.id === n.cliente) : null;
    if (!c) { c = { id: 100 + n.id, tipo: "prospect", dona: n.dona, nome: n.empresa, razao: n.razao, cnpj: n.cnpj, cidade: n.cidade, produto: n.produto, endereco: n.endereco || "",
      bi: null, segmento: SEG_PROSPECT[n.id] || "", prox: null, eventos: [], neg: null, pessoas: cl(PESSOAS_EXTRA[100 + n.id] || []), gescor: n.gescor || null,
      fonte: n.fonte || CAMPANHAS.find((k) => k.id === n.campanha)?.fonte || "outra", fonteDet: n.fonteDet || "" }; contas.push(c); }
    // etapas v4: Novo → Contatado → Qualificado → Proposta → Ganho | Perdido (não atendeu não move)
    const etapa = n.etapaV4 || (n.etapa === "fechado" ? "ganho" : n.etapa === "contato" ? (n.conversa ? "contatado" : "novo") : n.etapa);
    const ganhoEv = n.eventos.find((e) => e.res === "fechou");
    // quem moveu por último: o último evento com resultado (WhatsApp/e-mail = V3; telefone/reunião = ela); ganho de cliente que já comprou = GESCOR
    const ultRes = n.eventos.find((e) => e.res), movPor = etapa === "ganho" && c.tipo === "cliente" ? "gescor" : ultRes && (ultRes.canal === "whatsapp" || ultRes.canal === "email") ? "v3" : "ela";
    const mov = ultRes || etapa === "ganho" ? { por: movPor, d: n.ganhoEm || ultRes?.d || "2026-10-01", h: ultRes?.h || "" } : null;
    c.neg = { campanha: n.campanha || "", etapa, previsaoNec: n.previsaoNec || "", ganhoEm: etapa === "ganho" ? n.ganhoEm || ganhoEv?.d || "2026-10-01" : "", mov, conversa: n.conversa, produto: n.produto, litros: n.litros, comodato: n.comodato, previsao: n.previsao, concorrente: n.concorrente, motivo: n.motivo, visita: n.visita, visitaNota: n.visitaNota, visitaFeita: false };
    if (n.prox) c.prox = cl(n.prox);
    c.eventos.push(...cl(n.eventos));
    if (n.contato && !c.pessoas.some((p) => p.nome === n.contato.nome)) c.pessoas.unshift({ nome: n.contato.nome, papel: "principal", tel: n.contato.tel, email: n.contato.email, prefere: n.contato.email && !n.contato.tel.startsWith("(11) 9") ? "email" : "whatsapp", principal: true });
  }
  // Caixa de entrada: lead que nunca teve contato nem agendamento ainda não está no funil
  for (const c of contas) if (c.tipo === "prospect" && c.neg?.etapa === "novo" && !c.prox && !c.eventos.some((e) => !e.sistema)) { c.neg.etapa = "caixa"; c.neg.mov = null; }
  // classificação da caixa (segmento · consumo · produto · vale contato?) — alguns já classificados
  contas.filter((c) => c.neg?.etapa === "caixa").forEach((c, i) => { c.cls = { vale: i < 4 ? "sim" : i === 4 ? "nao" : null }; if (i >= 6) { c.neg.litros = 0; c.segmento = i % 3 ? c.segmento : ""; } });
  for (const c of contas) {
    for (const e of c.eventos) if (!e.sistema && (e.canal === "whatsapp" || e.canal === "email")) { e.auto = true; const k = `${c.id}|${e.d}|${e.h}`; if (LIGA_CONV[k]) e.conv = LIGA_CONV[k]; }
    c.eventos.sort((a, b) => (b.d + (b.h || "")).localeCompare(a.d + (a.h || "")));
  }
  // Mensagem nova que chegou hoje = evento automático ainda sem resultado.
  for (const v of CONVERSAS) if (v.conta && v.naoLidas) {
    const c = contas.find((x) => x.id === v.conta), ult = v.msgs[v.msgs.length - 1];
    c.eventos.unshift({ d: v.dia, h: ult.h, canal: v.canal, dir: "cliente", res: null, memo: "", auto: true, conv: v.id });
  }
  return contas;
};
