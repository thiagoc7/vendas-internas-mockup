// ── Modelo v5 (SPEC_V5 + FLUXO.md, 22/10) ────────────────────────────────────
// Prospect (termo único): Novo · Em contato · Proposta · Descartado. Ganhou → vira Cliente novo.
// Cliente (BI): Novo (< 3 compras) · Recorrente (ciclo regular) · Esporádico (sem ciclo confiável); Em atraso e Comodato parado são recortes.
// Regra que amarra: todo prospect ativo tem uma data de próximo contato; muda só quem marca (ela ou o sistema). Toda baixa agenda o próximo.

// conversa "parada" (cliente falou por último, ela leu e não respondeu) — exemplo do 3º tipo do bloco Atendimento
CONVERSAS.push({ id: 10, dona: "fer", canal: "whatsapp", nome: "Sebastião Sabiá", conta: 4, hora: "17:20", dia: "2026-10-19", naoLidas: 0,
  msgs: [{ dir: "eu", h: "16:05", d: "2026-10-19", t: "Sebastião, a entrega de sexta ficou pras 07h, tudo certo?" }, { dir: "cliente", h: "17:20", d: "2026-10-19", t: "Certo. E me manda a tabela de novembro quando sair, por favor." }] });

// ⚙ Prazos (supervisor): número + unidade + a partir de quê. Quem marca: sistema.
const PRAZOS = [
  ["primeiro", "1º contato de prospect novo", "d", "sem ação depois de entrar"],
  ["cobranca", "Cobrança de proposta", "d úteis", "depois do envio · antes, se visualizada"],
  ["depois", "Retorno de quem perdeu ou ficou pra depois", "d", "sugerido · ela ajusta"],
  ["satisf", "Satisfação após a 1ª entrega", "d úteis", "data da entrega no BI"],
  ["retNovo", "Retorno de cliente novo", "d", "depois da 1ª entrega"],
  ["espor", "Esporádico sem contato", "d", "desde o último contato"],
  ["espWa", "Esperando resposta · WhatsApp", "d útil", "ela falou por último"],
  ["espMail", "Esperando resposta · e-mail", "d úteis", "ela falou por último"],
];
const PRAZO0 = { primeiro: 3, cobranca: 2, depois: 60, satisf: 3, retNovo: 30, espor: 45, espWa: 1, espMail: 2 };
const P = (k) => (S?.prazos || PRAZO0)[k];

// ── Situações ──
const SIT = { novo: "Novo", contato: "Em contato", proposta: "Proposta", descartado: "Descartado" };
const COR_SIT = { novo: COR.cinza, contato: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300", proposta: COR.brand, descartado: COR.erro };
const CTIPO = { novo: "Novo", recorrente: "Recorrente", esporadico: "Esporádico" };
const ehProspect = (c) => c.tipo === "prospect";
const ativo = (c) => ehProspect(c) && c.sit !== "descartado";
const sitPill = (c) => c.sit ? pill(SIT[c.sit] + (!ehProspect(c) && c.camp === "re" ? " · Reativação" : ""), COR_SIT[c.sit]) : "";
const tipoPill = (c) => ehProspect(c) ? pill("Prospect", COR.roxo) : pill(c.ctipo === "novo" ? "Cliente novo" : "Cliente", COR.ambar);
const perdeuPill = (c) => c.perdas?.length && c.sit !== "descartado" ? pill("já perdeu proposta", COR.aviso) : "";
const FONTES = { lista: "Lista", linkedin: "LinkedIn", indicacao: "Indicação", site: "Site", whatsapp_numero_novo: "WhatsApp nº novo", outra: "Outra" };
const campanhaDe = (c) => c.camp || c.eraLead?.campanha || "";
const fonteDe = (c) => ehProspect(c) ? c.fonte : c.eraLead?.fonte || null;
function fonteTxt(c, curto = false) {
  const k = campanha(campanhaDe(c)), f = fonteDe(c);
  if (!f && !k) return "Carteira";
  const base = k && k.fonte ? k.nome : FONTES[f] || (k ? k.nome : "—");
  return !curto && c.fonteDet && !(k && k.id === "lc") ? `${base} <span class="text-gray-400">(${esc(c.fonteDet)})</span>` : base;
}

// ── Resultados do contato (SPEC_V5 §9) ──
const RES = { nao_atendeu: ["Não atendeu", COR.cinza], falar_depois: ["Falar depois", COR.brand], gerar_proposta: ["Gerar proposta", COR.roxo], descartar: ["Descartar", COR.erro],
  ganhou: ["Ganhou", COR.ok], cobrar_de_novo: ["Cobrar de novo", COR.aviso], perdeu: ["Perdeu", COR.erro], conversou: ["Conversou", COR.brand], pediu_proposta: ["Pediu proposta", COR.roxo] };
const RES_ANTIGO = { sem_resposta: "nao_atendeu", qualificado: "falar_depois", fechou: "ganhou", recusou: "perdeu" };
const resRot = (e) => e.res === "nao_atendeu" && (e.canal === "whatsapp" || e.canal === "email") ? "Sem resposta" : RES[e.res][0];
const resultadosDe = (c) => c.sit === "proposta" ? ["ganhou", "cobrar_de_novo", "perdeu"] : ehProspect(c) ? ["nao_atendeu", "falar_depois", "gerar_proposta", "descartar"] : ["conversou", "pediu_proposta", "nao_atendeu"];
const MOTIVOS_PERDA = [["preco", "Preço"], ["concorrente", "Concorrente"], ["prazo", "Prazo"], ["nao_diesel", "Não compra diesel"], ["outro", "Outro"]];
const MOTIVOS_DESC = [["nao_diesel", "Não compra diesel"], ["nao_alvo", "Não é alvo"], ["regiao", "Fora da região"], ["dados", "Dados ruins"], ["outro", "Outro"]];
const motivoTxt = (k) => (MOTIVOS_PERDA.find((x) => x[0] === k) || MOTIVOS_DESC.find((x) => x[0] === k) || [k, k])[1];

// ── Cliente ──
const SIT_REC = { pronto: ["na janela", "text-brand-600 dark:text-brand-400"], esfriando: ["esfriando", "text-warning-600 dark:text-warning-400"], inativo: ["inativo", "text-error-600 dark:text-error-400"] };
function recompra(c) {
  if (c.tipo !== "cliente" || c.ctipo !== "recorrente" || !c.bi.ultimo) return null;
  const dias = diasAtras(c.bi.ultimo), r = dias / c.bi.ciclo;
  return dias > 60 ? "inativo" : r > 1.5 ? "esfriando" : r >= 0.85 ? "pronto" : null;
}
const diasSemContato = (c) => { const u = ultimoContato(c); return u ? diasAtras(u.d) : null; };
const esporAtrasado = (c) => c.ctipo === "esporadico" && (diasSemContato(c) ?? 999) >= P("espor");
const comodatoParado = (c) => c.tipo === "cliente" && c.bi.tanques > 0 && !!c.bi.ultimo && diasAtras(c.bi.ultimo) > 21;
const emAtraso = (c) => c.tipo === "cliente" && c.bi.vencidos > 0;
const litrosDe = (c) => ehProspect(c) ? c.litros || 0 : c.bi?.consumo || 0;
const canalPadrao = (c) => ({ email: "email", telefone: "telefone" }[pessoaPrincipal(c)?.prefere] || "whatsapp");
const canalPrevisto = (c) => c.prox?.canal || canalPadrao(c);
const waLink = (tel) => `https://web.whatsapp.com/send?phone=55${soDig(tel)}`;

// virar cliente: ganhou → Cliente novo, com satisfação (N d úteis após a 1ª entrega) + retorno (N d) marcados pelo sistema
function virarCliente(c, entrega, quando = HOJE) {
  const l = c.litros || 2000;
  Object.assign(c, { tipo: "cliente", ctipo: "novo", sit: null, ganhoEm: quando, eraLead: { fonte: c.fonte, campanha: c.camp } });
  c.bi = { consumo: l, ultimo: entrega <= HOJE ? entrega : null, primeira: entrega, compras: entrega <= HOJE ? 1 : 0, ciclo: null, vencidos: 0, titulos: 0, limite: 50000, segmento: c.segmento, desde: 2026,
    tanques: c.comodato ? 1 : 0, l12: entrega <= HOJE ? Math.round(l * 0.7) : 0, r12: entrega <= HOJE ? Math.round(l * 0.7 * 6.2) : 0, comodatoEquip: [], proxEntrega: entrega > HOJE ? { d: entrega, litros: Math.round(l * 0.7 / 500) * 500, rota: "Rota Oeste 1" } : null };
  c.prox = { d: diasUteis(entrega, P("satisf")), h: "", assunto: "satisfação da 1ª entrega", canal: "telefone", tipo: "satisf", por: "sistema" };
  c.fila = [{ d: somaDias(entrega, P("retNovo")), h: "", assunto: "retorno de cliente novo", canal: "telefone", tipo: "retNovo", por: "sistema" }];
}

// ── Montagem (dados do v4 → situações do v5) ──
const ESPOR_NOMES = /^(Mercado|Condomínio|Clínica|Gráfica|Lavanderia|Fazenda|Serralheria)/;
function montarV5() {
  const cs = montarContas();
  for (const c of cs) {
    c.eventos.forEach((e) => { if (RES_ANTIGO[e.res]) e.res = RES_ANTIGO[e.res]; if (e.sistema) e.sistema = e.sistema.replace(/Lead/g, "Prospect").replace(/lead/g, "prospect"); });
    if (c.prox) c.prox = { tipo: "contato", por: "ela", ...c.prox, canal: c.prox.canal || canalPadrao(c) };
    const n = c.neg, e = n?.etapa;
    if (n) Object.assign(c, { camp: n.campanha || "", litros: n.litros, comodato: n.comodato, concorrente: n.concorrente, visita: n.visita, visitaNota: n.visitaNota, previsao: n.previsao });
    c.perdas = [];
    if (e === "perdido") { const ev = c.eventos.find((x) => x.res === "perdeu"); c.perdas.push({ d: ev?.d || "2026-10-08", motivo: n.motivo === "Preço" ? "preco" : n.motivo === "Sem demanda" ? "nao_diesel" : "concorrente", conc: n.concorrente || "", comod: { tem: false }, obs: ev?.memo || "" }); }
    const pr = c.eventos.find((x) => /Proposta #\d+/.test(x.memo || ""));
    if (pr) c.prop = { n: /#(\d+)/.exec(pr.memo)[1], d: pr.d, vista: false };
    if (c.tipo === "prospect") {
      c.produto = n.produto;
      c.sit = { caixa: "novo", novo: "novo", contatado: "contato", qualificado: "contato", proposta: "proposta", perdido: "descartado" }[e] || e;
      const criado = [...c.eventos].reverse().find((x) => x.sistema); c.entrou = criado?.d || "2026-10-05";
      if (c.sit === "descartado") c.desc = { d: c.perdas[0].d, motivo: c.perdas[0].motivo === "nao_diesel" ? "nao_diesel" : "outro" };
    } else {
      const b = c.bi;
      b.compras = !b.primeira ? 99 : b.primeira >= "2026-10-10" ? 1 : b.primeira >= "2026-10-01" ? 2 : 5;
      c.ctipo = b.compras < 3 ? "novo" : (c.id === 3 || c.id === 5 || ESPOR_NOMES.test(c.nome)) ? "esporadico" : "recorrente";
      if (c.ctipo !== "recorrente") b.ciclo = null;
      c.sit = !n ? null : e === "proposta" ? "proposta" : (e === "contatado" || e === "qualificado" || (e === "novo" && c.prox)) ? "contato" : null;
      if (e === "ganho" && n.campanha === "re") c.voltou = n.ganhoEm || c.eventos.find((x) => x.res === "ganhou")?.d;
    }
    delete c.neg;
  }
  ajustarV5(cs);
  for (const c of cs) c.eventos.sort((a, b) => (b.d + (b.h || "")).localeCompare(a.d + (a.h || "")));
  return cs;
}
function ajustarV5(cs) {
  { const vistos = new Set(); for (const c of cs) { if (vistos.has(c.nome)) { c.nome = `${c.nome.split(" ")[0]} ${c.cidade.split(" (")[0]}`; c.razao = c.nome + " Ltda"; } vistos.add(c.nome); } }
  const C = (id) => cs.find((c) => c.id === id), px = (id, o) => { const c = C(id); if (c) c.prox = { h: "", canal: canalPadrao(c), tipo: "contato", por: "ela", ...o }; };
  // ── prospects da Fernanda
  px(101, { d: "2026-10-23", assunto: "ligar pro Wagner se não responder", canal: "telefone", tipo: "retorno" });
  px(105, { d: "2026-11-23", assunto: "quando renovar o contrato (fim de nov)", canal: "email" });
  px(106, { d: HOJE, h: "09:00", assunto: "1º contato — diesel dos geradores", canal: "whatsapp", tipo: "primeiro" });
  px(108, { d: "2026-10-26", assunto: "mandar tabela e ligar de novo", canal: "telefone" });
  px(109, { d: "2026-12-01", assunto: "fim do contrato com a Raízen", canal: "whatsapp" });
  C(110).prop.vista = true;
  px(111, { d: HOJE, assunto: "cobrar proposta #1435", canal: "telefone", tipo: "cobrar", por: "sistema" });
  px(115, { d: HOJE, h: "15:30", assunto: "tentar de novo — caldeira a diesel", canal: "telefone" });
  // Ligeira Sul: perdeu proposta duas vezes (comodato da concorrência), ficou Em contato com a flag; o sistema sugeriu voltar em 60 d
  Object.assign(C(113), { sit: "contato", perdas: [
    { d: "2026-10-14", motivo: "preco", conc: "Vibra", comod: { tem: true, de: "Vibra", litros: 15000 }, obs: "Ficaram com a Vibra: R$ 0,06 abaixo da nossa. Tanque de 15 m³ deles no pátio." },
    { d: "2026-03-10", motivo: "prazo", conc: "Ipiranga", comod: { tem: false }, obs: "Queriam 35 dias; a gente dá 21." }] });
  px(113, { d: "2026-12-14", assunto: "voltar a oferecer (perdeu por preço)", canal: "telefone", tipo: "depois", por: "sistema" });
  C(113).eventos.unshift({ d: "2026-03-10", h: "15:00", canal: "telefone", dir: "cliente", res: "perdeu", memo: "Proposta #1102 perdida: prazo (queriam 35 d). Ficaram na Ipiranga." });
  // Guindastes Atlas: ganhou em 19/10, 1ª entrega 20/10 (BI) → Cliente novo com satisfação na sexta
  { const c = C(112); c.fonte = c.fonte || "indicacao"; virarCliente(c, "2026-10-20", "2026-10-19"); c.eventos.unshift({ d: "2026-10-20", h: "07:40", sistema: "1ª entrega no BI: 5.000 L (NF 48733) · satisfação e retorno agendados pelo sistema" }); }
  // Lista Carapicuíba lote 2 (entrou 19–20/10): sem data até o prazo vencer; 300 entrou 18/10 → o sistema marcou o 1º contato hoje
  for (let id = 300; id <= 322; id++) { const c = C(id); c.entrou = id === 300 ? "2026-10-18" : id < 312 ? "2026-10-19" : "2026-10-20"; }
  px(300, { d: HOJE, assunto: "1º contato", tipo: "primeiro", por: "sistema", canal: "whatsapp" });
  for (const [id, m] of [[321, "regiao"], [322, "dados"]]) Object.assign(C(id), { sit: "descartado", desc: { d: "2026-10-20", motivo: m } });
  // propostas da Lista: cobrança automática 2 d úteis após o envio
  for (const id of [332, 333, 334, 358]) { const c = C(id); px(id, { d: diasUteis(c.prop.d, PRAZO0.cobranca), assunto: `cobrar proposta #${c.prop.n}`, canal: "telefone", tipo: "cobrar", por: "sistema" }); }
  C(333).prop.vista = true;
  // WhatsApp nº novo: perdido por preço → descartado (concorrente); "sem demanda" → descartado (não compra diesel)
  Object.assign(C(360), { desc: { d: "2026-10-08", motivo: "concorrente" } }); C(360).perdas[0].comod = { tem: true, de: "Ipiranga", litros: 5000 };
  Object.assign(C(361), { desc: { d: "2026-10-08", motivo: "nao_diesel" }, perdas: [] });
  // ── clientes da Fernanda
  px(1, { ...C(1).prox, por: "ela" });
  px(2, { d: "2026-10-22", h: "15:00", assunto: "fechar comodato da bomba nova", canal: "whatsapp" });
  px(5, { d: HOJE, h: "10:00", assunto: "cobrar título vencido", canal: "telefone", tipo: "titulo" });
  px(62, { d: HOJE, assunto: "hora de pedir", canal: "whatsapp", tipo: "janela" });
  // clientes novos da Lista: 42 (1ª entrega 16/10 → satisfação hoje), 41 (satisfação feita, retorno marcado)
  { const c = C(42); c.bi.primeira = "2026-10-16"; c.bi.ultimo = "2026-10-16"; c.prox = { d: diasUteis("2026-10-16", PRAZO0.satisf), h: "", assunto: "satisfação da 1ª entrega", canal: "telefone", tipo: "satisf", por: "sistema" }; c.fila = [{ d: somaDias("2026-10-16", PRAZO0.retNovo), h: "", assunto: "retorno de cliente novo", canal: "telefone", tipo: "retNovo", por: "sistema" }]; c.ganhoEm = "2026-10-15"; }
  { const c = C(41); c.ganhoEm = "2026-10-03"; c.eventos.unshift({ d: "2026-10-08", h: "10:20", canal: "telefone", dir: "eu", res: "conversou", memo: "Satisfação: entrega no horário, motorista educado. Quer S10 também." });
    c.prox = { d: somaDias("2026-10-03", PRAZO0.retNovo), h: "", assunto: "retorno de cliente novo", canal: "telefone", tipo: "retNovo", por: "sistema" }; }
  // esporádicos: último contato (o BI não dá ciclo); um já agendado por ela
  cs.filter((c) => c.tipo === "cliente" && c.ctipo === "esporadico" && !c.eventos.some((e) => !e.sistema)).forEach((c) => c.eventos.push({ d: somaDias(HOJE, -(15 + ((c.id * 17) % 55))), h: "10:00", canal: "telefone", dir: "eu", res: "conversou", memo: "Compra quando precisa (gerador / obra)." }));
  { const e = cs.find((c) => c.dona === "fer" && c.ctipo === "esporadico" && !c.prox && c.id > 40); if (e) px(e.id, { d: "2026-10-26", assunto: "ver se precisa pro gerador", canal: "telefone" }); }
  // feito hoje cedo (Viação Jardim Paulista)
  C(6).eventos.unshift({ d: HOJE, h: "09:15", canal: "telefone", dir: "eu", res: "conversou", memo: "Confirmou a proposta de renovação pra novembro." });
  // jul/cam: Em contato sem data ganha uma (o v5 não tem "sem próximo")
  for (const c of cs) if (ativo(c) && c.sit !== "novo" && !c.prox) c.prox = { d: diasUteis(HOJE, 3 + (c.id % 4)), h: "", assunto: "retorno", canal: canalPadrao(c), tipo: "contato", por: "ela" };
}

// ── Próximo contato: controle que aparece em toda linha de Prospects e Clientes ──
const quemMarcou = (p) => p.por === "sistema" ? "sistema" : "ela";
const ROT_PROX = { cobrar: "cobrar proposta", satisf: "satisfação", retNovo: "retorno", depois: "voltar", titulo: "cobrar título" };
function proxRotulo(p) { return p.d < HOJE ? "atrasado" : ROT_PROX[p.tipo] || (p.tipo === "primeiro" && p.por === "sistema" ? "1º contato" : "agendado"); }
const itensData = (id, ctx, comHoje) => [...(comHoje ? [["prox", `${id}|hoje|${ctx}`, "hoje"], ["prox", `${id}|amanha|${ctx}`, `amanhã <span class="text-xs text-gray-400">${diaCurto(AMANHA())}</span>`]] : []),
  ["prox", `${id}|3du|${ctx}`, `+3 dias úteis <span class="text-xs text-gray-400">${diaCurto(MAIS3())}</span>`], ["prox", `${id}|semana|${ctx}`, `semana que vem <span class="text-xs text-gray-400">${diaCurto(proxSegunda())}</span>`], ["prox", `${id}|data|${ctx}`, "escolher data…"]];
function proxSegunda() { let d = somaDias(HOJE, 1); while (dow(d) !== 1) d = somaDias(d, 1); return d; }
function proxCtl(c, ctx = "", chave = "") {
  if (c.sit === "descartado") return sup() ? "" : `<button type="button" data-acao="reativar" data-v="${c.id}" class="${UI.btnSm}">Reativar</button>`;
  const p = c.prox, k = chave || ctx || "l";
  if (!p) return sup() ? `<span class="text-xs text-gray-400">sem data</span>` : `<span class="inline-flex flex-nowrap items-center gap-1"><button type="button" data-acao="prox" data-v="${c.id}|hoje|${ctx}" class="${UI.btnPSm}">Hoje</button><button type="button" data-acao="prox" data-v="${c.id}|amanha|${ctx}" class="${UI.btnSm}">Amanhã</button>${drop(`od:${k}:${c.id}`, "Outro dia", UI.btnSm, itensData(c.id, ctx, false))}</span>`;
  const atr = p.d < HOJE, hj = p.d === HOJE;
  const txt = `<span class="${atr ? "font-medium text-error-600 dark:text-error-400" : hj ? "font-medium text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-300"}">${proxRotulo(p)} · ${rotProx(p)}</span><span class="text-gray-400"> · ${quemMarcou(p)}</span>`;
  return `<span class="flex min-w-0 items-center gap-1"><span class="min-w-0 truncate text-xs" title="${esc(p.assunto)}${p.por === "sistema" ? " · marcado pelo sistema" : ""}">${txt}</span>${sup() ? "" : drop(`re:${k}:${c.id}`, `${ic("cal", "h-3.5 w-3.5")}<span class="sr-only">Reagendar</span>`, `${V.btn_ghost} inline-flex items-center gap-0.5 px-1.5 py-1" title="Reagendar`, itensData(c.id, ctx, true))}</span>`;
}
function marcarProx(c, modo, ctx = "") {
  const d = modo === "hoje" ? HOJE : modo === "amanha" ? AMANHA() : modo === "3du" ? MAIS3() : proxSegunda();
  const antes = c.prox;
  const tipo = antes?.tipo || (ctx === "atraso" || (!ehProspect(c) && ctx !== "recorrentes" && emAtraso(c) && ctx === "atraso") ? "titulo" : ehProspect(c) && c.sit === "novo" ? "primeiro" : ctx === "recorrentes" ? "janela" : "contato");
  const assunto = antes?.assunto || { titulo: "cobrar título vencido", primeiro: "1º contato", janela: "hora de pedir" }[tipo] || (c.ctipo === "esporadico" ? "ver se precisa" : "contato");
  c.prox = { d, h: modo === "hoje" ? "" : antes?.h || "", assunto, canal: antes?.canal || canalPadrao(c), tipo, por: "ela" };
  c.eventos.unshift({ d: HOJE, h: agora(), sistema: antes ? `Reagendado: ${rotProx(antes)} → ${rotProx(c.prox)}` : `Próximo contato: ${rotProx(c.prox)} · ${assunto}` });
}
// Path com setas: prospect Novo › Em contato › Proposta › Ganho | Perdido; cliente Novo › Recorrente | Esporádico
const PASSOS = [["novo", "Novo"], ["contato", "Em contato"], ["proposta", "Proposta"], ["ganho", "Ganho"]];
const RES_DO_PASSO = { contato: "falar_depois", proposta: "gerar_proposta", ganho: "ganhou" };
function pathV5(c, alto = "h-9 text-xs sm:text-sm", compacto = false) {
  const chev = (i, n) => CHEV[i === 0 ? 0 : i === n - 1 ? 2 : 1];
  const caixa = (conteudo, cor, i, n, tag = "div", extra = "") => `<${tag} ${extra} class="flex ${alto} min-w-0 flex-1 items-center justify-center gap-1 px-2 font-medium ${cor} ${i ? "-ml-1.5" : ""}" style="clip-path:${chev(i, n)}">${conteudo}</${tag === "div" ? "div" : "button"}>`;
  const corFeito = "bg-brand-500 text-white", corAtual = "bg-brand-100 text-brand-700 dark:bg-brand-500/25 dark:text-brand-200", corDepois = "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";
  if (!ehProspect(c)) {
    const passos = [["novo", "Novo"], [c.ctipo === "esporadico" ? "esporadico" : "recorrente", c.ctipo === "novo" ? "Recorrente | Esporádico" : CTIPO[c.ctipo]]], idx = c.ctipo === "novo" ? 0 : 1;
    return `<div class="flex w-full items-center">${passos.map(([k, r], i) => caixa(`${i < idx ? ic("check", "h-3.5 w-3.5") : ""}<span class="truncate">${r}</span>`, i < idx ? corFeito : i === idx ? corAtual : corDepois, i, 2)).join("")}</div>`;
  }
  const desc = c.sit === "descartado", idx = desc ? -1 : PASSOS.findIndex(([k]) => k === c.sit), pode = !compacto && !sup() && ativo(c);
  const passos = PASSOS.map(([k, r], i) => {
    const feito = i < idx, atual = i === idx, cor = desc ? "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500" : feito ? corFeito : atual ? corAtual : corDepois;
    const clic = pode && i > idx && (k !== "ganho" || c.sit === "proposta");
    const rot = compacto ? { novo: "Novo", contato: "Contato", proposta: "Prop.", ganho: "Ganho" }[k] : k === "contato" ? `<span class="sm:hidden">Contato</span><span class="hidden sm:inline">Em contato</span>` : k === "proposta" ? `<span class="sm:hidden">Prop.</span><span class="hidden sm:inline">Proposta</span>` : r;
    return caixa(`${feito ? ic("check", "h-3.5 w-3.5") : ""}<span class="truncate">${rot}</span>`, `${cor} ${clic ? "cursor-pointer hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/15" : ""}`, i, 4, clic ? "button" : "div", clic ? `type="button" data-acao="path" data-v="${c.id}|${RES_DO_PASSO[k]}" title="Registrar: ${RES[RES_DO_PASSO[k]][0].toLowerCase()}"` : k === "ganho" && pode ? `title="Ganho sai da Proposta"` : "");
  }).join("");
  const fim = desc ? `<span class="ml-2 flex ${alto} shrink-0 items-center rounded-lg bg-error-500 px-3 font-medium text-white">Descartado</span>`
    : pode ? `<button type="button" data-acao="path" data-v="${c.id}|${c.sit === "proposta" ? "perdeu" : "descartar"}" class="ml-2 flex ${alto} shrink-0 items-center rounded-lg border border-error-300 px-3 font-medium text-error-600 hover:bg-error-50 dark:border-error-500/40 dark:text-error-400 dark:hover:bg-error-500/10">Perdido</button>` : "";
  return `<div class="flex w-full items-center"><div class="flex min-w-0 flex-1">${passos}</div>${fim}</div>`;
}
// cartão do próximo contato (ficha, fixado)
function cartaoProximo(c) {
  if (c.sit === "descartado") return `<div class="${UI.card} p-4"><p class="${UI.secao}">Descartado</p><p class="mt-1 text-sm text-gray-700 dark:text-gray-200">${motivoTxt(c.desc?.motivo)} · ${rotData(c.desc?.d)}</p>${sup() ? "" : `<button type="button" data-acao="reativar" data-v="${c.id}" class="mt-3 ${UI.btnSm}">Reativar</button>`}</div>`;
  const p = c.prox;
  if (!p) return `<div class="${UI.card} p-4"><p class="${UI.secao}">Próximo contato</p><p class="mt-1 text-sm text-gray-700 dark:text-gray-200">Sem data.</p><div class="mt-3">${proxCtl(c, "", "fc")}</div></div>`;
  const atr = p.d < HOJE;
  return `<div class="rounded-2xl border p-4 ${atr ? "border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10" : "border-brand-200 bg-brand-25 dark:border-brand-500/30 dark:bg-brand-500/10"}">
    <p class="${UI.secao}">Próximo contato${atr ? ` · <span class="text-error-600 dark:text-error-400">atrasado ${diasAtras(p.d)} d</span>` : ""}</p>
    <p class="mt-1 text-lg font-semibold ${atr ? "text-error-700 dark:text-error-300" : "text-gray-800 dark:text-white"}">${p.d === HOJE || p.d === AMANHA() ? rotData(p.d) + " · " : ""}${diaCurto(p.d)}${p.h ? " · " + p.h : ""}</p>
    <p class="text-sm text-gray-700 dark:text-gray-200">${esc(p.assunto)}</p>
    <p class="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">${icCanal(p.canal, "h-3.5 w-3.5")}${CANAL[p.canal].nome} · marcado ${p.por === "sistema" ? "pelo sistema" : "por ela"}</p>
    ${c.fila?.length ? `<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">depois: ${esc(c.fila[0].assunto)} · ${diaCurto(c.fila[0].d)} · sistema</p>` : ""}
    ${sup() ? "" : `<div class="mt-3 flex flex-wrap gap-2"><button type="button" data-acao="registrar" data-v="${c.id}" class="${UI.btnPSm}">Registrar</button>${drop(`re:fc:${c.id}`, "Reagendar", UI.btnSm, itensData(c.id, "", true))}</div>`}</div>`;
}
