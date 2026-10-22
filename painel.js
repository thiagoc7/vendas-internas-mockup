// ── Vendas = UMA página com abas Resumo · Agenda · Leads · Clientes (+ Equipe pro supervisor) — SPEC_V4 §2–§4, §9 ────
const cardTopo = (titulo, extra = "") => `<div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800"><h2 class="${UI.h2}">${titulo}</h2>${extra}</div>`;
const corNum = (n, tom) => ({ erro: "text-error-600 dark:text-error-400", aviso: "text-warning-600 dark:text-warning-400", brand: "text-brand-600 dark:text-brand-400", ok: "text-success-600 dark:text-success-400", neutro: "text-gray-800 dark:text-white" }[n ? tom : "neutro"]);
const linkMod = (txt) => `<span class="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-brand-500 dark:text-brand-400">${txt}${ic("dir", "h-3 w-3")}</span>`;
const pedirVendedora = (oque) => `<div class="${UI.card} p-5 text-center"><p class="text-sm text-gray-700 dark:text-gray-200">${oque} é de uma vendedora: escolha quem.</p>
  <div class="mt-3 flex flex-wrap justify-center gap-2">${VENDEDORAS.map((v) => `<button type="button" data-acao="sel" data-v="${v.id}" class="${UI.btnSm}">${avatar(v.nome, "h-5 w-5 text-[0.6rem]")}${v.curto}</button>`).join("")}</div></div>`;

// ── Agenda › Hoje (= Meu dia do v3): ATRASADOS → HOJE por hora → SEM PRÓXIMO → FEITO riscado ──
function itensMeuDia() {
  const cs = meus(S.contas), convs = meus(S.conv).filter((v) => !v.fechada), usados = new Set(), it = [];
  for (const v of convs.filter((x) => x.naoLidas > 0)) { const c = v.conta ? conta(v.conta) : null;
    it.push({ k: "nova", v, c, s: "hoje", h: v.hora, ag: c?.prox && c.prox.d <= HOJE ? c.prox : null }); if (c) usados.add(c.id); }
  for (const c of cs) if (!usados.has(c.id) && c.prox && c.prox.d <= HOJE) { it.push({ k: "ag", c, s: c.prox.d < HOJE ? "atrasado" : "hoje", h: c.prox.h || "99" }); usados.add(c.id); }
  for (const v of convs.filter((x) => !x.naoLidas && x.conta && !usados.has(x.conta))) { const ms = v.msgs.filter((x) => !x.sis), ult = ms[ms.length - 1];
    if (!ult || ult.dir !== "eu") continue; const d = ult.d || v.dia, n = uteisEntre(d, HOJE);
    if (n >= (v.canal === "email" ? 2 : 1)) { it.push({ k: "esp", v, c: conta(v.conta), s: "hoje", h: "zz", dias: n, desde: d }); usados.add(v.conta); } }
  for (const c of cs) if (!usados.has(c.id) && situacao(c) === "sem") it.push({ k: "sem", c, s: "sem", h: ultimoContato(c)?.d || "" });
  const r = { atrasado: 0, hoje: 1, sem: 2 };
  return it.sort((a, b) => (r[a.s] - r[b.s]) || (a.s === "atrasado" ? (a.c.prox.d + a.h).localeCompare(b.c.prox.d + b.h) : a.h.localeCompare(b.h)));
}
const contagemMeuDia = (it) => ({ atr: it.filter((i) => i.s === "atrasado").length, hoje: it.filter((i) => i.s === "hoje").length, sem: it.filter((i) => i.s === "sem").length });
const linhaBase = (quando, corpo, botoes, extra = "") => `<li class="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 dark:border-gray-800 dark:bg-transparent ${extra}">
  <span class="w-14 shrink-0 self-start pt-0.5 text-xs sm:w-[4.5rem] sm:self-center sm:pt-0">${quando}</span><div class="min-w-0 flex-1">${corpo}</div>${botoes ? `<div class="flex w-full flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:w-auto sm:shrink-0">${botoes}</div>` : ""}</li>`;
const nomeLinha = (c, extra = "") => `<p class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm sm:flex-nowrap"><a href="#/clientes/${c.id}" class="min-w-0 max-w-full truncate font-medium text-gray-800 hover:text-brand-500 sm:shrink dark:text-white">${esc(c.nome)}</a><span class="shrink-0">${etapaPill(c) || tipoPill(c)}</span>${extra ? `<span class="min-w-0 basis-full truncate text-xs text-gray-500 sm:basis-auto sm:shrink-[10] dark:text-gray-400">${extra}</span>` : ""}</p>`;
const donaMini = (id) => sup() && !S.sel ? `<span class="text-xs text-gray-400">${vend(id).curto}</span>` : "";
// botões pelo canal previsto (o previsto vai primeiro, em destaque). E-mail só quando o previsto é e-mail.
function botoesContato(c) {
  const prev = canalPrevisto(c), p = pessoaPrincipal(c), cel = p?.tel && /\(\d\d\) 9/.test(p.tel);
  const ligar = (pri) => p?.tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" class="${pri ? UI.btnPSm : UI.btnSm}">${ic("fone", "h-3.5 w-3.5")}Ligar</button>` : "";
  const wa = (pri) => cel || prev === "whatsapp" ? waDrop(c, pri ? UI.btnPSm : UI.btnSm) : "";
  const mail = (pri) => `<button type="button" data-acao="email" data-v="${c.id}" class="${pri ? UI.btnPSm : UI.btnSm}">${ic("mail", "h-3.5 w-3.5")}E-mail</button>`;
  const seg = (h) => h ? `<span class="hidden sm:contents">${h}</span>` : "";
  if (prev === "email") return mail(true) + seg(ligar(false));
  if (prev === "whatsapp") return wa(true) + seg(ligar(false));
  return ligar(true) + seg(wa(false));
}
function linhaMeuDia(i) {
  const ro = sup();
  if (i.k === "nova") { const v = i.v, c = i.c, n = v.naoLidas === 1 ? "1 nova" : `${v.naoLidas} novas`;
    const corpo = c ? nomeLinha(c, `${v.canal === "email" ? "e-mail · " : ""}<b class="font-semibold text-brand-600 dark:text-brand-400">${n}</b>${i.ag ? ` · tinha contato ${i.ag.h || "hoje"}` : ""}`)
      : `<p class="flex min-w-0 flex-wrap items-center gap-1.5 text-sm"><span class="truncate font-medium text-gray-800 dark:text-white">${esc(v.nome)}</span>${pill("número novo", COR.aviso)}<span class="truncate text-xs font-semibold text-brand-600 dark:text-brand-400">${n}</span></p>`;
    return linhaBase(`<span class="font-mono font-medium text-gray-700 dark:text-gray-200">${v.hora}</span>`, corpo, `${donaMini(v.dona)}<a href="#/conversas/${v.id}" class="${UI.btnPSm}">Abrir</a>`); }
  const c = i.c;
  if (i.k === "esp") return linhaBase(`<span class="text-gray-500 dark:text-gray-400">${rotData(i.desde)}</span>`, nomeLinha(c, `esperando resposta · ${i.dias} d · ${CANAL[i.v.canal].nome}, eu falei por último`),
    `${donaMini(c.dona)}<a href="#/conversas/${i.v.id}" class="${ro ? UI.btnSm : UI.btnPSm}">Cobrar</a>${ro ? "" : adiarDrop(c, UI.btnSm)}`);
  if (i.k === "sem") { const u = ultimoContato(c);
    return linhaBase(`<span class="text-warning-600 dark:text-warning-400">${ic("alerta", "inline h-3.5 w-3.5")}</span>`, nomeLinha(c, `último ${u ? rotData(u.d) : "—"} · ${fonteTxt(c)}`),
      `${donaMini(c.dona)}${ro ? `<a href="#/clientes/${c.id}" class="${UI.btnSm}">Ficha</a>` : `<button type="button" data-acao="agendar" data-v="${c.id}" class="${UI.btnPSm}">${ic("cal", "h-3.5 w-3.5")}Agendar</button>`}`); }
  const atr = i.s === "atrasado";
  const quando = atr ? `<span class="inline-flex items-center gap-1 font-medium text-error-600 dark:text-error-400">${ic("alerta", "h-3.5 w-3.5")}${c.prox.d === somaDias(HOJE, -1) ? "ontem" : diaCurto(c.prox.d)}${c.prox.h ? " " + c.prox.h : ""}</span>`
    : `<span class="font-mono font-medium text-gray-700 dark:text-gray-200">${c.prox.h || "dia"}</span>`;
  const botoes = ro ? `${donaMini(c.dona)}<a href="#/clientes/${c.id}" class="${UI.btnSm}">Ficha</a>`
    : `${botoesContato(c)}<span class="mx-0.5 hidden h-4 w-px bg-gray-200 sm:inline-block dark:bg-gray-700"></span><button type="button" data-acao="registrar" data-v="${c.id}" class="${UI.btnSm}">Registrar</button>${adiarDrop(c, UI.btnSm)}`;
  return linhaBase(quando, nomeLinha(c, `<span class="inline-flex items-center gap-1">${icCanal(canalPrevisto(c), "h-3 w-3")}${esc(c.prox.assunto)}</span>`), botoes, `${atr ? "border-error-200 dark:border-error-500/30" : ""} ${S.flash === c.id ? "ring-2 ring-brand-300 dark:ring-brand-500/50" : ""}`);
}
const FILTRO_HOJE = { atrasado: ["atrasados", (i) => i.s === "atrasado"], hoje: ["de hoje", (i) => i.s === "hoje"], sem: ["sem próximo", (i) => i.s === "sem"],
  telefone: ["ligações", (i) => i.k === "ag" && canalPrevisto(i.c) === "telefone"], whatsapp: ["WhatsApp", (i) => i.k === "ag" && canalPrevisto(i.c) === "whatsapp"], email: ["e-mail", (i) => i.k === "ag" && canalPrevisto(i.c) === "email"] };
function blocoMeuDia() {
  const f = FILTRO_HOJE[S.agFiltro], it = itensMeuDia().filter((i) => !f || f[1](i)), feitos = f ? [] : S.feitos.filter((x) => escopo().includes(conta(x.id)?.dona)).sort((a, b) => a.h.localeCompare(b.h));
  const grupo = (titulo, n, linhas, tom = "") => linhas ? `<li class="px-1 pt-2 text-[11px] font-medium uppercase tracking-wider ${tom || "text-gray-400 dark:text-gray-500"}">${titulo}${n != null ? ` · ${n}` : ""}</li>${linhas}` : "";
  const de = (s) => it.filter((i) => i.s === s);
  const novos = f ? [] : meus(S.contas).filter((c) => situacao(c) === "novo" && !c.prox);
  const linhaNovos = novos.length && !sup() ? `<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400"><span class="w-[4.5rem] shrink-0">·</span><span class="min-w-0 flex-1">${novos.length} ainda sem 1º contato (não cobram "sem próximo": estão em Leads e nas Ações sugeridas)</span>
    <a href="#/vendas/leads?vista=caixa" class="${UI.link} text-xs">Ver em Leads ›</a></li>` : "";
  const linhaFeito = (x) => { const c = conta(x.id); return `<li class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 opacity-60 dark:border-gray-800 dark:bg-white/[0.02]">
    <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-success-500 bg-success-500 text-white">${ic("check", "h-3 w-3")}</span>
    <p class="min-w-0 flex-1 truncate text-sm text-gray-500 line-through dark:text-gray-500"><span class="font-mono text-xs">${x.h}</span> ${esc(c.nome)} · ${x.txt}</p></li>`; };
  const linhas = grupo("Atrasados", de("atrasado").length, de("atrasado").map(linhaMeuDia).join(""), "text-error-500 dark:text-error-400")
    + grupo("Hoje", de("hoje").length, de("hoje").map(linhaMeuDia).join(""))
    + grupo("Sem próximo contato", de("sem").length, de("sem").map(linhaMeuDia).join(""), "text-warning-600 dark:text-warning-400") + linhaNovos
    + grupo("Feito hoje", feitos.length, feitos.map(linhaFeito).join(""));
  const banner = f ? `<div class="mb-2 flex flex-wrap items-center gap-2 rounded-lg bg-brand-25 px-3 py-2 text-sm dark:bg-brand-500/5"><span class="text-gray-700 dark:text-gray-200">Só <b>${f[0]}</b></span><a href="#/vendas/agenda" class="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">${ic("x", "h-3.5 w-3.5")}ver tudo</a></div>` : "";
  const nAtr = itensMeuDia().filter((i) => i.s === "atrasado" && i.k === "ag").length, nFeito = S.feitos.filter((x) => escopo().includes(conta(x.id)?.dona)).length;
  const rodape = sup() ? "" : `<div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800"><span class="${V.muted}">Feito hoje · <b class="text-gray-700 dark:text-gray-200">${nFeito}</b></span>
    <button type="button" data-acao="levar-atrasados" class="${UI.btnSm}" ${nAtr ? "" : "disabled"}>${ic("dir", "h-3.5 w-3.5")}Levar atrasados pra amanhã${nAtr ? ` (${nAtr})` : ""}</button></div>`;
  return banner + (it.length || feitos.length ? `<ul class="space-y-1.5">${linhas}</ul>` : `<p class="py-4 text-sm text-gray-500 dark:text-gray-400">Nada aqui.</p>`) + rodape;
}

// ── Agenda › Semana (igual ao v3): seg–sex, sem repetir Atrasados/Sem próximo ──
function itemAgenda(c, denso) {
  const sel = S.agSel === c.id, conv = convDaConta(c).find((v) => !v.fechada), feito = c.prox.d < HOJE;
  return `<li class="rounded-lg border ${sel ? "border-brand-300 bg-brand-25 dark:border-brand-500/40 dark:bg-brand-500/10" : "border-gray-200 bg-white hover:border-brand-200 dark:border-gray-800 dark:bg-white/[0.03]"} ${feito ? "opacity-60" : ""} transition-colors"><button type="button" data-acao="ag-sel" data-v="${c.id}" class="block w-full px-2.5 py-1.5 text-left">
      <p class="flex items-center gap-1.5 text-xs"><span class="font-mono font-semibold text-gray-700 dark:text-gray-200">${c.prox.h || "dia"}</span><span class="text-gray-400">${icCanal(canalPrevisto(c), "h-3.5 w-3.5")}</span>${sup() && !S.sel ? `<span class="ml-auto text-[11px] text-gray-400">${vend(c.dona).curto}</span>` : ""}</p>
      <p class="mt-0.5 ${denso ? "line-clamp-2" : "truncate"} text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</p><p class="${denso ? "line-clamp-2" : "truncate"} text-xs text-gray-500 dark:text-gray-400">${esc(c.prox.assunto)}</p></button>
    ${sel ? `<div class="flex flex-wrap gap-1.5 border-t border-gray-200 px-2.5 py-2 dark:border-gray-700">${sup() ? "" : `<button type="button" data-acao="registrar" data-v="${c.id}" class="${UI.btnPSm}">Registrar</button><button type="button" data-acao="agendar" data-v="${c.id}" class="${UI.btnSm}">Reagendar</button>`}
      ${conv ? `<a href="#/conversas/${conv.id}" class="${UI.btnSm}">Abrir conversa</a>` : ""}<a href="#/clientes/${c.id}" class="${UI.btnSm}">Ficha</a></div>` : ""}</li>`;
}
function blocoSemana() {
  const seg = somaDias(SEG_SEMANA, 7 * S.semana), dias = [0, 1, 2, 3, 4].map((k) => somaDias(seg, k));
  // atrasados ficam em Hoje: aqui só o que está marcado de hoje em diante
  const cs = meus(S.contas).filter((c) => c.prox && c.prox.d >= HOJE);
  const doDia = (d) => cs.filter((c) => c.prox.d === d).sort((a, b) => (a.prox.h || "99").localeCompare(b.prox.h || "99"));
  const btnNav = (v, rot, i) => `<button type="button" data-acao="semana" data-v="${v}" aria-label="${rot}" class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">${ic(i, "h-4 w-4")}</button>`;
  const nav = `<div class="flex items-center gap-1">${btnNav(-1, "Semana anterior", "esq")}<span class="min-w-[8.5rem] text-center text-sm font-semibold text-gray-800 dark:text-white">${dm(dias[0])} – ${dm(dias[4])}${S.semana === 0 ? ` <span class="font-normal text-brand-500">· esta semana</span>` : ""}</span>${btnNav(1, "Próxima semana", "dir")}
    ${S.semana ? `<button type="button" data-acao="semana" data-v="0" class="ml-1 text-xs font-medium text-brand-500">Ir pra hoje</button>` : ""}</div>`;
  const vazioDia = (d) => d < HOJE ? "passou" : "—";
  const grade = `<div class="hidden grid-cols-5 gap-2 lg:grid">${dias.map((d) => { const its = doDia(d), hoje = d === HOJE;
    return `<div class="min-w-0 rounded-xl border ${hoje ? "border-brand-300 bg-brand-25/60 dark:border-brand-500/40 dark:bg-brand-500/5" : "border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-white/[0.02]"} p-2">
      <p class="mb-1.5 flex items-baseline justify-between px-0.5"><span class="text-sm font-semibold ${hoje ? "text-brand-600 dark:text-brand-400" : "text-gray-800 dark:text-white"}">${hoje ? "Hoje" : SEM3[dow(d)]} <span class="font-normal text-gray-400">${dm(d)}</span></span><span class="text-xs text-gray-400">${its.length || ""}</span></p>
      ${its.length ? `<ul class="space-y-1.5">${its.map((c) => itemAgenda(c, true)).join("")}</ul>` : `<p class="px-1 py-4 text-center text-xs text-gray-400">${vazioDia(d)}</p>`}</div>`; }).join("")}</div>`;
  const lista = `<div class="space-y-4 lg:hidden">${dias.filter((d) => d >= HOJE || S.semana > 0).map((d) => { const its = doDia(d), hoje = d === HOJE;
    return `<div><p class="mb-1.5 text-sm font-semibold ${hoje ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-200"}">${hoje ? "Hoje · " : ""}${SEM3[dow(d)]} ${dm(d)}</p>
      ${its.length ? `<ul class="space-y-1.5">${its.map((c) => itemAgenda(c, false)).join("")}</ul>` : `<p class="rounded-lg border border-dashed border-gray-200 px-3 py-2.5 text-center text-xs text-gray-400 dark:border-gray-800">Nada agendado</p>`}</div>`; }).join("")}</div>`;
  return `<div class="mb-3 flex flex-wrap items-center justify-between gap-2">${nav}<span class="flex items-center gap-2"><span class="hidden ${V.muted} md:inline">toque no item: registrar, reagendar, conversa, ficha</span>${sup() ? "" : `<button type="button" data-acao="agendar-novo" class="${UI.btnPSm}">${ic("mais", "h-3.5 w-3.5")}Agendar</button>`}</span></div>${grade}${lista}
    <p class="mt-3 text-xs text-gray-400">Atrasados e sem próximo ficam em Hoje.</p>`;
}

// ── Ações sugeridas (= Montar agenda, ESTRATEGIA §3). Quem já tem contato agendado não aparece. ──
const SUG = {
  proposta: { g: "negocio", ic: "refazer", cor: "text-brand-500 dark:text-brand-300", rot: "proposta sem resposta", assunto: "cobrar a proposta" },
  parado: { g: "negocio", ic: "pausa", cor: "text-warning-500 dark:text-warning-400", rot: "funil parado", assunto: "retomar o negócio" },
  hora: { g: "negocio", ic: "relogio", cor: "text-brand-500 dark:text-brand-300", rot: "hora de chamar", assunto: "hora de pedir" },
  caixa: { g: "prospeccao", ic: "users", cor: "text-purple-500 dark:text-purple-300", rot: "caixa de entrada", assunto: "1º contato" },
  novos: { g: "prospeccao", ic: "users", cor: "text-purple-500 dark:text-purple-300", rot: "sem 1º contato", assunto: "1º contato" },
  previsao: { g: "prospeccao", ic: "cal", cor: "text-purple-500 dark:text-purple-300", rot: "previsão chegou", assunto: "previsão de necessidade chegou" },
  esperando: { g: "atendimento", ic: "chat", cor: "text-sky-500 dark:text-sky-300", rot: "esperando resposta", assunto: "cobrar resposta" },
  atraso: { g: "atendimento", ic: "dinheiro", cor: "text-error-500 dark:text-error-400", rot: "em atraso", assunto: "título vencido" },
};
// de onde vem cada sugestão (modal "de onde vêm ⓘ" e tooltip do ícone): [chave, nome, regra em uma frase, origem do dado]
const FONTES_SUG = [
  ["hora", "Hora de chamar", "Intervalo médio entre compras × dias desde a última (a mesma conta do card “prontos pra pedir” da dash do PWA); só cliente com ciclo regular, 3+ compras no ano.", "BI · vendas da carteira dela"],
  ["proposta", "Proposta sem resposta", "Proposta feita por ela, enviada há 3+ dias e sem desfecho.", "Propostas do app"],
  ["atraso", "Em atraso", "Título vencido na carteira dela.", "Cobrança do BI"],
  ["esperando", "Esperando resposta", "Conversa aberta na caixa dela em que a última mensagem é dela há 1 dia útil (WhatsApp) ou 2 (e-mail).", "Central V3"],
  ["parado", "Funil parado", "Lead ou negócio aberto sem próximo contato e sem conversa aberta.", "Negócios (novo)"],
  ["caixa", "Leads sem 1º contato", "Leads na caixa de entrada, uma linha por campanha.", "Leads (novo)"],
  ["previsao", "Previsão chegou", "Qualificado “quando precisar” cujo mês de necessidade chegou.", "Negócios (novo)"],
  ["novos", "Campanha sem 1º contato", "Cliente da carteira posto numa campanha (ex.: Reativação) que ainda não recebeu contato.", "Campanhas (novo)"],
];
const fonteSug = (k) => FONTES_SUG.find(([x]) => x === k);
const GRUPOS_SUG = [["", "Todas"], ["negocio", "Negócio"], ["prospeccao", "Prospecção"], ["atendimento", "Atendimento"]];
const livreSug = (c) => !c.prox && !(c.naoFalarAte && c.naoFalarAte > HOJE);
function sugestoes() {
  const cs = meus(S.contas), out = [], usados = new Set();
  const add = (k, c, porque, x = {}) => { if (usados.has(c.id) || !livreSug(c)) return; usados.add(c.id); out.push({ k, c, porque, ...x }); };
  for (const c of cs) if (propostaSemResposta(c)) { const u = ultimoContato(c), n = propostasDe(c).slice(-1)[0]?.n; add("proposta", c, `proposta${n ? " #" + n : ""} enviada ${dm(u.d)}, sem resposta há ${diasAtras(u.d)} d`); }
  for (const v of meus(S.conv).filter((x) => !x.fechada && !x.naoLidas && x.conta)) { const c = conta(v.conta), ms = v.msgs.filter((x) => !x.sis), ult = ms[ms.length - 1];
    if (!ult || ult.dir !== "eu") continue; const n = uteisEntre(ult.d || v.dia, HOJE);
    if (n >= (v.canal === "email" ? 2 : 1)) add("esperando", c, `você falou por último há ${n} d (${CANAL[v.canal].nome})`, { v }); }
  if (S.fonteAtraso) for (const c of cs) if (c.tipo === "cliente" && c.bi.vencidos > 0) add("atraso", c, `${reaisK(c.bi.vencidos)} vencido · ${c.bi.titulos} ${c.bi.titulos === 1 ? "título" : "títulos"}`);
  for (const c of cs) if (c.tipo === "cliente" && ["pronto", "esfriando"].includes(recompra(c))) add("hora", c, `compra a cada ${c.bi.ciclo} d, última ${dm(c.bi.ultimo)}${recompra(c) === "esfriando" ? " · esfriando" : ""}`);
  for (const c of cs) if (situacao(c) === "sem") { const u = ultimoContato(c); add("parado", c, `${ETAPA_NOME[c.neg.etapa]}, sem próximo desde ${u ? dm(u.d) : "—"}`); }
  for (const c of cs) if (previsaoChegou(c)) add("previsao", c, `qualificado · previsão de necessidade ${mesTxt(c.neg.previsaoNec)} chegou`);
  // leads na caixa de entrada e clientes de campanha sem 1º contato: uma linha por campanha (ou fonte)
  const grupos = {};
  for (const c of cs) if (livreSug(c) && (naCaixa(c) || semContato(c))) { const k = (naCaixa(c) ? "caixa" : "novos") + ":" + (c.neg.campanha || "f-" + c.fonte); (grupos[k] ||= []).push(c); }
  for (const [k, lista] of Object.entries(grupos)) { const [tipo, cp] = k.split(":"), camp = campanha(cp), nome = camp ? camp.nome : FONTES[cp.slice(2)] || "outras fontes";
    out.push({ k: tipo, grupo: k, lista, nome, porque: tipo === "caixa" ? `${lista.length} leads · ${esc(nome)}${camp ? ` · desde ${dm(camp.data)}` : ""}` : `${lista.length} clientes da ${esc(nome)} ainda sem 1º contato` }); }
  return out;
}
const contaSug = (l) => Object.fromEntries(GRUPOS_SUG.map(([g]) => [g, l.filter((s) => !g || SUG[s.k].g === g).length]));
// Linha = ícone · empresa + chip · porquê em cinza · uma ação primária ([Hoje], ou [Cobrar] quando esperando resposta) + [Amanhã] + ▾ (resto)
const NAO_FALAR = (id) => [["-", "", "Não falar por 30 dias"], ["nao-falar", `${id}|já resolvido`, "já resolvido"], ["nao-falar", `${id}|não é alvo`, "não é alvo"], ["nao-falar", `${id}|depois do mês`, "depois do mês"]];
function linhaSug(s) {
  const ro = sup(), m = SUG[s.k], b = UI.btnSm, f = fonteSug(s.k), ico = `<span title="${f[1]} · ${f[3]}" class="flex h-8 w-8 shrink-0 cursor-help items-center justify-center rounded-full bg-gray-50 ${m.cor} dark:bg-white/5">${ic(m.ic, "h-4 w-4")}</span>`;
  const mais = (chave, itens) => drop(chave, `<span class="sr-only">Mais opções</span>`, `${b} px-1.5`, itens);
  if (s.lista) {
    const caixa = s.k === "caixa", href = caixa ? `#/vendas/leads?vista=caixa${s.lista[0].neg.campanha ? "&campanha=" + s.lista[0].neg.campanha : ""}` : "#/vendas/clientes?vista=negociacao";
    const botoes = ro ? "" : `<button type="button" data-acao="lote-leads" data-v="${s.grupo}|pordia" class="${b}">5 por dia</button>${mais(`lote:${s.grupo}`, [["lote-leads", `${s.grupo}|hoje`, "5 hoje", "entram no topo da agenda de hoje"], ["ir", href, caixa ? "Abrir a caixa de entrada" : "Ver em Clientes"]])}`;
    return `<li class="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5">${ico}<a href="${href}" class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white">${caixa ? `${s.lista.length} leads na caixa de entrada` : `${s.lista.length} sem 1º contato`}</p><p class="truncate text-xs text-gray-500 dark:text-gray-400">${s.porque}</p></a>
      ${botoes ? `<div class="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto">${botoes}</div>` : ""}</li>`;
  }
  const c = s.c, esp = s.k === "esperando", v = (modo) => `${c.id}|${modo}|${s.k}`;
  const menu = [...(esp ? [["sug", v("hoje"), "Hoje", "próximo horário livre"]] : []), ["sug", v("3du"), "+3 dias úteis", diaCurto(MAIS3())], ["sug", v("data"), "Escolher data…"], ...NAO_FALAR(c.id)];
  const botoes = ro ? "" : `${esp ? `<a href="#/conversas/${s.v.id}" class="${UI.btnPSm}">Cobrar</a>` : `<button type="button" data-acao="sug" data-v="${v("hoje")}" class="${UI.btnPSm}">Hoje</button>`}<button type="button" data-acao="sug" data-v="${v("amanha")}" class="${b}">Amanhã</button>${mais(`sug:${c.id}`, menu)}`;
  return `<li class="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5">${ico}
    <div class="min-w-0 flex-1"><p class="flex min-w-0 items-center gap-1.5 text-sm"><a href="#/clientes/${c.id}" class="truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</a><span class="shrink-0">${c.tipo === "cliente" ? tipoPill(c) : etapaPill(c)}</span>${donaMini(c.dona)}</p><p class="truncate text-xs text-gray-500 dark:text-gray-400" title="${m.rot} · ${s.porque}"><span class="${m.cor}">${m.rot}</span> · ${s.porque}</p></div>
    ${botoes ? `<div class="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto">${botoes}</div>` : ""}</li>`;
}
function blocoSugestoes(naGaveta = false) {
  const todas = sugestoes(), n = contaSug(todas), l = todas.filter((s) => !S.sugFiltro || SUG[s.k].g === S.sugFiltro), lim = naGaveta ? 99 : 6;
  const chips = `<div class="flex flex-wrap gap-1.5">${GRUPOS_SUG.map(([g, r]) => chipF(S.sugFiltro === g, "sug-filtro", g, r, n[g])).join("")}</div>`;
  return `<section class="${UI.card} overflow-hidden">${cardTopo(`Ações sugeridas <span class="${UI.badge}">${n[""]}</span>`, `<button type="button" data-acao="fontes-sug" class="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">de onde vêm${ic("info", "h-4 w-4")}</button>`)}
    <div class="border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">${chips}</div>
    ${l.length ? `<ul class="divide-y divide-gray-100 dark:divide-gray-800">${corta("sug", l, lim).map(linhaSug).join("")}</ul>${naGaveta ? "" : verTodos("sug", l.length, lim)}` : vazio("Nada sugerido — tudo que precisa de contato já está na agenda.")}</section>`;
}
// Escolher Hoje/Amanhã/+3 d/Data cria o agendamento (Hoje = próximo horário livre, pra cair na linha do tempo da direita)
function slotLivre(d) {
  const ocup = new Set(meus(S.contas).filter((c) => c.prox?.d === d).map((c) => c.prox.h));
  let [hh, mm] = (d === HOJE ? agora() : "08:30").split(":").map(Number); let m = hh * 60 + mm; m = Math.ceil((m + 1) / 30) * 30;
  for (; m <= 17 * 60 + 30; m += 30) { const h = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; if (!ocup.has(h)) return h; }
  return "";
}
function canalSug(c, k, v) {
  if (k === "esperando" && v) return v.canal;
  if (k === "caixa" || k === "novos") return "whatsapp";
  const u = ultimoContato(c); return u && ["telefone", "whatsapp", "email"].includes(u.canal) ? u.canal : canalPrevisto(c);
}
function agendarSug(c, modo, k, silencioso = false) {
  const s = sugestoes().find((x) => x.c?.id === c.id), assunto = SUG[k]?.assunto || "contato", canal = canalSug(c, k, s?.v);
  if (modo === "data") return abrirModal({ tipo: "agenda", id: c.id, prox: { ...proxVazio(assunto), modo: "data" }, canal });
  tick(); const d = modo === "hoje" ? HOJE : modo === "amanha" ? AMANHA() : MAIS3();
  c.prox = { d, h: modo === "hoje" && !silencioso ? slotLivre(HOJE) : "", assunto, canal };
  if (naCaixa(c)) moverEtapa(c, "novo", "ela", "agendou o 1º contato");
  c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Agendado pelas Ações sugeridas: ${rotProx(c.prox)} · ${assunto}` });
  S.flash = c.id; S.sugSel = S.sugSel.filter((x) => x !== c.id);
  if (!silencioso) { render(); toast(`${esc(c.nome)}: ${rotProx(c.prox)} · ${d === HOJE ? "está na agenda da direita" : "está na Agenda › Semana"}`); }
}
function loteLeads(grupo, modo) {
  const s = sugestoes().find((x) => x.grupo === grupo); if (!s) return;
  const lista = [...s.lista].sort((a, b) => a.nome.localeCompare(b.nome)), dias = {};
  const pega = modo === "hoje" ? lista.slice(0, 5) : lista;
  pega.forEach((c, i) => { const d = modo === "hoje" ? HOJE : diasUteis(HOJE, 1 + Math.floor(i / 5)); c.prox = { d, h: "", assunto: "1º contato", canal: "whatsapp" };
    if (naCaixa(c)) moverEtapa(c, "novo", "ela", "agendou o 1º contato"); c.eventos.unshift({ d: HOJE, h: agora(), sistema: `1º contato agendado: ${rotProx(c.prox)}` }); dias[d] = (dias[d] || 0) + 1; });
  tick(); render();
  toast(modo === "hoje" ? `5 de ${esc(s.nome)} na agenda de hoje (no topo, "dia") · saíram da caixa e entraram no funil como Novo` : `${pega.length} de ${esc(s.nome)}: ${Object.entries(dias).map(([d, n]) => `${n} ${diaCurto(d)}`).join(" · ")} — veja em Agenda › Semana`);
}

// ── Agenda do dia na coluna da direita: linha do tempo 08–18 h ──
const horaDe = (h) => Math.min(18, Math.max(8, Number(h.slice(0, 2))));
function itensDoDia(d) {
  const out = [];
  for (const c of meus(S.contas)) if (c.prox?.d === d) out.push({ t: "ag", h: c.prox.h, c });
  if (d === HOJE) {
    for (const v of meus(S.conv)) if (!v.fechada && v.naoLidas > 0) out.push({ t: "nova", h: v.hora, v, c: v.conta ? conta(v.conta) : null });
    for (const f of S.feitos) { const c = conta(f.id); if (c && escopo().includes(c.dona)) out.push({ t: "feito", h: f.h, c, txt: f.txt }); }
  }
  return out.sort((a, b) => (a.h || "").localeCompare(b.h || ""));
}
// Item da linha do tempo: a hora fica só na coluna da esquerda; dentro, ícone do canal + empresa + assunto curto (pre = data, nos atrasados)
function itemTL(i, pre = "") {
  const preH = pre ? `<span class="shrink-0 text-[11px] font-medium text-error-600 dark:text-error-400">${pre}</span>` : "";
  if (i.t === "feito") return `<li class="flex min-w-0 items-center gap-1.5 px-1.5 py-0.5 text-xs text-gray-400 line-through dark:text-gray-500"><span class="text-success-500">${ic("check", "h-3 w-3")}</span><span class="truncate">${esc(i.c.nome)}</span></li>`;
  if (i.t === "nova") return `<li><a href="#/conversas/${i.v.id}" class="flex min-w-0 items-center gap-1.5 rounded-md bg-brand-50 px-1.5 py-1 text-xs hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20"><span class="text-green-600 dark:text-emerald-300">${i.v.canal === "email" ? ic("mail", "h-3 w-3") : icWa("h-3 w-3")}</span>
    <span class="min-w-0 truncate font-medium text-gray-800 dark:text-white">${esc(i.c ? i.c.nome : i.v.nome)}</span><span class="ml-auto shrink-0 rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">nova</span></a></li>`;
  const c = i.c, sel = S.resSel === c.id, fl = S.flash === c.id;
  const acoes = sel ? `<div class="flex flex-wrap gap-1 border-t border-gray-100 px-1.5 py-1.5 dark:border-gray-700">${sup() ? "" : `${botoesContato(c)}<button type="button" data-acao="registrar" data-v="${c.id}" class="${UI.btnSm}">Registrar</button>${adiarDrop(c, UI.btnSm)}`}${convAberta(c) ? `<a href="#/conversas/${convAberta(c).id}" class="${UI.btnSm}">Abrir</a>` : ""}<a href="#/clientes/${c.id}" class="${UI.btnSm}">Ficha</a></div>` : "";
  return `<li class="rounded-md border ${fl ? "border-brand-300 bg-brand-25 ring-2 ring-brand-200 dark:border-brand-500/50 dark:bg-brand-500/10 dark:ring-brand-500/30" : sel ? "border-brand-200 bg-white dark:border-brand-500/40 dark:bg-white/[0.03]" : "border-gray-200 bg-white hover:border-brand-200 dark:border-gray-700 dark:bg-white/[0.03]"}">
    <button type="button" data-acao="tl-sel" data-v="${c.id}" title="${c.prox?.h ? c.prox.h + " · " : ""}${esc(c.prox?.assunto || "")}" class="flex w-full min-w-0 items-center gap-1.5 px-1.5 py-1 text-left text-xs">${preH}<span class="text-gray-400">${icCanal(canalPrevisto(c), "h-3 w-3")}</span>
      <span class="min-w-0 shrink-0 truncate font-medium text-gray-800 dark:text-white" style="max-width:60%">${esc(c.nome)}</span>${fl ? `<span class="ml-auto shrink-0 rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">agendado</span>` : `<span class="min-w-0 truncate text-[11px] text-gray-400">${esc(c.prox?.assunto || "")}</span>`}</button>${acoes}</li>`;
}
function blocoAgendaDia() {
  const d = S.resDia, its = itensDoDia(d), semHora = its.filter((i) => !i.h), comHora = its.filter((i) => i.h), hoje = d === HOJE, ag = agora();
  const atras = hoje ? meus(S.contas).filter((c) => c.prox && c.prox.d < HOJE).sort((a, b) => a.prox.d.localeCompare(b.prox.d)) : [];
  const nav = (v, rot, i) => `<button type="button" data-acao="res-dia" data-v="${v}" aria-label="${rot}" class="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5">${ic(i, "h-4 w-4")}</button>`;
  const marca = `<li class="flex items-center gap-1.5 py-0.5" aria-label="agora"><span class="h-2 w-2 rounded-full bg-error-500"></span><span class="h-px flex-1 bg-error-400"></span><span class="font-mono text-[10px] font-medium text-error-500">${ag}</span></li>`;
  const rot = (txt, cor) => `<span class="w-9 shrink-0 text-[11px] leading-6 ${cor}">${txt}</span>`;
  let linhas = "";
  if (semHora.length) linhas += `<div class="flex gap-2 border-b border-gray-100 py-1 dark:border-gray-800">${rot("dia", "font-medium uppercase text-gray-400")}<ul class="min-w-0 flex-1 space-y-1">${semHora.map((i) => itemTL(i)).join("")}</ul></div>`;
  for (let H = 8; H <= 18; H++) {
    const l = comHora.filter((i) => horaDe(i.h) === H), aqui = hoje && horaDe(ag) === H;
    let corpo = "";
    if (aqui) { const antes = l.filter((i) => i.h <= ag), depois = l.filter((i) => i.h > ag); corpo = antes.map((i) => itemTL(i)).join("") + marca + depois.map((i) => itemTL(i)).join(""); } else corpo = l.map((i) => itemTL(i)).join("");
    const vazia = !l.length && !aqui, hh = String(H).padStart(2, "0");
    // hora vazia = linha fina (só o rótulo); com item = linha normal
    linhas += vazia ? `<div class="hidden h-5 items-center gap-2 border-b border-gray-100 last:border-0 lg:flex dark:border-gray-800"><span class="w-9 shrink-0 font-mono text-[10px] text-gray-300 dark:text-gray-600">${hh}</span></div>`
      : `<div class="flex gap-2 border-b border-gray-100 py-1 last:border-0 dark:border-gray-800">${rot(hh + ":00", `font-mono ${aqui ? "font-semibold text-error-500" : "text-gray-400"}`)}<ul class="min-w-0 flex-1 space-y-1">${corpo}</ul></div>`;
  }
  const vazioDia = !its.length && !hoje ? `<p class="py-6 text-center text-xs text-gray-400">${d < HOJE ? "Dia que passou — o que não foi feito está nos atrasados." : "Nada marcado neste dia."}</p>` : "";
  return `<section class="${UI.card} overflow-hidden"><div class="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800"><h2 class="${UI.h2}">Agenda</h2>
      <div class="flex items-center gap-0.5">${nav(-1, "Dia anterior", "esq")}<span class="min-w-[6.5rem] text-center text-sm font-medium ${hoje ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-200"}">${hoje ? "hoje · " : ""}${SEM3[dow(d)]} ${dm(d)}</span>${nav(1, "Próximo dia", "dir")}</div></div>
    <div class="px-3 py-1">${vazioDia || linhas}</div>
    ${atras.length ? `<div class="border-t border-gray-100 dark:border-gray-800"><button type="button" data-acao="expandir" data-v="atr" class="flex w-full items-center gap-1.5 px-4 py-2 text-left text-xs font-medium text-error-600 hover:bg-gray-50 dark:text-error-400 dark:hover:bg-white/[0.03]">${ic("alerta", "h-3.5 w-3.5")}${atras.length} atrasados de ontem e antes<span class="ml-auto">${ic(S.exp.atr ? "baixo" : "dir", "h-3.5 w-3.5")}</span></button>
      ${S.exp.atr ? `<ul class="space-y-1 px-3 pb-2">${atras.map((c) => itemTL({ t: "ag", c }, diaCurto(c.prox.d).slice(4))).join("")}</ul>` : ""}</div>` : ""}
    <div class="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">${!hoje ? `<button type="button" data-acao="res-dia" data-v="0" class="text-xs font-medium text-brand-500">voltar pra hoje</button>` : `<span class="text-[11px] text-gray-400">toque no item pra agir</span>`}<a href="#/vendas/agenda" class="${UI.btnSm}">Ampliar agenda</a></div></section>`;
}

// ── Suas tarefas de hoje (contagens clicáveis → Agenda › Hoje filtrada) ──
function blocoTarefas() {
  const it = itensMeuDia(), n = contagemMeuDia(it), ag = it.filter((i) => i.k === "ag"), can = (k) => ag.filter((i) => canalPrevisto(i.c) === k).length;
  const msgs = naoLidasTotal(), caixa = meus(S.contas).filter(naCaixa).length;
  const tile = (f, num, rot, tom) => `<a href="#/vendas/agenda?f=${f}" class="rounded-xl border border-gray-200 px-3 py-2.5 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"><p class="text-2xl font-bold ${num ? tom : "text-gray-400"}">${num}</p><p class="text-xs text-gray-500 dark:text-gray-400">${rot}</p></a>`;
  const canal = (k, i, rot) => can(k) ? `<a href="#/vendas/agenda?f=${k}" class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10">${i}${can(k)} ${rot(can(k))}</a>` : "";
  return `<section class="${UI.card} overflow-hidden">${cardTopo("Suas tarefas de hoje", `<a href="#/vendas/agenda" class="${V.link}">Agenda › Hoje</a>`)}
    <div class="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">${tile("atrasado", n.atr, "atrasados", "text-error-600 dark:text-error-400")}${tile("hoje", n.hoje, "hoje", "text-gray-800 dark:text-white")}${tile("sem", n.sem, "sem próximo", "text-warning-600 dark:text-warning-400")}</div>
    <div class="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">${canal("telefone", ic("fone", "h-3.5 w-3.5"), (k) => k === 1 ? "ligação" : "ligações")}${canal("whatsapp", icWa("h-3.5 w-3.5"), () => "WhatsApp")}${canal("email", ic("mail", "h-3.5 w-3.5"), () => "e-mail")}
      <span class="flex flex-wrap gap-x-3 gap-y-1 sm:ml-auto">${msgs ? `<a href="#/conversas" class="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">${ic("chat", "h-3.5 w-3.5")}${msgs} ${msgs === 1 ? "mensagem nova" : "mensagens novas"} na Central ›</a>` : ""}
      ${caixa ? `<a href="#/vendas/leads?vista=caixa" class="inline-flex items-center gap-1 text-xs font-medium text-purple-700 hover:underline dark:text-purple-300">${ic("users", "h-3.5 w-3.5")}${caixa} leads na caixa de entrada ›</a>` : ""}</span></div></section>`;
}

// ── Números do PWA (cada card linka pra página BI dela, recortada pela carteira) ──
function uteisAte(fim) { let d = HOJE, k = 0; while (d < fim) { d = somaDias(d, 1); if (dow(d) && dow(d) !== 6) k++; } return k; }
const quemRecorte = () => sup() && !S.sel ? "a equipe" : vend(S.sel || S.como).curto;
function statLink(acao, v, rotulo, numero, sub, destino, tom = "neutro") {
  return `<button type="button" data-acao="${acao}" data-v="${v}" class="flex min-w-0 flex-col items-start rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/5">
    <p class="text-xs font-medium text-gray-500 dark:text-gray-400">${rotulo}</p><p class="mt-1 text-xl font-bold ${tom}">${numero}</p><p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${sub}</p>${linkMod(destino)}</button>`;
}
function blocosPWA() {
  const ids = escopo(), m = ids.reduce((a, id) => ({ meta: a.meta + META[id].meta, real: a.real + META[id].real, s10: a.s10 + META[id].s10, s500: a.s500 + META[id].s500 }), { meta: 0, real: 0, s10: 0, s500: 0 });
  const pct = Math.round((m.real / m.meta) * 100), falta = Math.max(0, m.meta - m.real), dias = uteisAte("2026-10-31"), ritmo = Math.round((m.real / 15) * 22 / 1000) * 1000;
  const barra = pct >= 100 ? "bg-success-500" : pct >= 70 ? "bg-gradient-to-r from-brand-400 to-brand-500" : "bg-brand-400";
  const cs = meus(S.contas), cli = cs.filter((c) => c.tipo === "cliente");
  const venc = cli.filter((c) => c.bi.vencidos > 0), vencR = venc.reduce((a, c) => a + c.bi.vencidos, 0);
  const pw = ids.map((id) => PWA_EXTRA[id]), posit = Math.round(pw.reduce((a, x) => a + x.posit, 0) / pw.length), positDe = pw.reduce((a, x) => [a[0] + x.positDe[0], a[1] + x.positDe[1]], [0, 0]);
  const psr = cs.filter(propostaSemResposta).length, prontos = cli.filter((c) => recompra(c) === "pronto").length, esfriando = cli.filter((c) => recompra(c) === "esfriando").length;
  const leadsMes = cs.filter((c) => c.tipo === "prospect" && ([...c.eventos].reverse()[0]?.d || "") >= "2026-10-01"), naCx = leadsMes.filter(naCaixa).length;
  const abertos = cli.filter((c) => (c.bi.primeira || "").startsWith("2026-10")), tanques = TANQUES_MES.filter((t) => ids.includes(conta(t.conta).dona));
  const lista = (titulo, itens, vazioTxt) => `<div class="${UI.card} overflow-hidden">${cardTopo(`${titulo}${itens.length ? ` <span class="${UI.badge}">${itens.length}</span>` : ""}`)}${itens.length ? `<ul class="divide-y divide-gray-100 dark:divide-gray-800">${itens.join("")}</ul>` : vazio(vazioTxt)}</div>`;
  const li = (c, sub) => `<li><a href="#/clientes/${c.id}" class="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</p><p class="text-xs text-gray-500 dark:text-gray-400">${sub}</p></div>${chevronDir}</a></li>`;
  return `<section class="mt-4 space-y-3"><p class="${UI.secao} px-1">Números do mês${sup() && !S.sel ? " · equipe" : ""}</p>
    <button type="button" data-acao="pwa" data-v="vendas" class="block w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/5">
      <div class="mb-3 flex items-center justify-between gap-2"><h2 class="${UI.h2}">Meta do mês (out/2026)</h2><span class="inline-flex items-center gap-0.5 text-xs font-medium text-brand-500 dark:text-brand-400">Vendas${ic("dir", "h-3 w-3")}</span></div>
      <div class="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div class="h-full rounded-full ${barra}" style="width:${Math.min(pct, 100)}%"></div><span class="absolute inset-y-0 w-px bg-gray-400" style="left:${Math.round((15 / 22) * 100)}%"></span></div>
      <div class="mt-2 flex flex-wrap items-baseline gap-x-2"><span class="text-lg font-bold text-gray-800 dark:text-white">${litros(m.real)}</span><span class="text-sm text-gray-500 dark:text-gray-400">/ ${litros(m.meta)}</span><span class="ml-auto text-sm font-semibold ${pct >= 70 ? "text-warning-500" : "text-gray-500 dark:text-gray-400"}">${pct}%</span></div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">S10 ${litros(m.s10)} · S500 ${litros(m.s500)} · faltam ${litros(falta)} em ${dias} dias úteis · no ritmo fecha em ~${litros(ritmo)}</p></button>
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
      ${statLink("pwa", "cobranca", "Em atraso", `${venc.length} <span class="text-sm font-normal">clientes</span>`, reaisK(vencR), "Cobrança", corNum(venc.length, "erro"))}
      ${statLink("pwa", "comodato", "Positivação comodato", `${posit}%`, `${positDe[0]} de ${positDe[1]}`, "Comodato", posit >= 80 ? corNum(1, "ok") : posit >= 50 ? corNum(1, "aviso") : corNum(0))}
      ${statLink("pwa", "propostas", "Propostas sem resposta", psr, "aguardando há 3+ dias", "Propostas", corNum(psr, "aviso"))}
      ${statLink("ir", "#/vendas/leads", "Leads novos no mês", leadsMes.length, `${naCx} na caixa de entrada`, "Leads", corNum(leadsMes.length, "brand"))}
      <div class="col-span-2 grid lg:col-span-1">${statLink("ir", "#/vendas/clientes?vista=hora", "Prontos pra pedir", prontos, `${esfriando} esfriando`, "Hora de chamar", corNum(prontos, "brand"))}</div></div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      ${lista("Clientes abertos no mês", abertos.map((c) => li(c, `${litros(c.bi.consumo)}/mês · desde ${dm(c.bi.primeira)}`)), "Nenhum cliente novo este mês.")}
      ${lista("Tanques instalados no mês", tanques.map((t) => li(conta(t.conta), `${t.m3} m³ · ${esc(t.local)} · ${dm(t.d)}`)), "Nenhum tanque instalado este mês.")}</div></section>`;
}
const PWA_DESTINO = { vendas: "/vendas", cobranca: "/cobranca?modo=vencidos", comodato: "/comodato", propostas: "/documents/propostas?situacao=aguardando" };

function blocoBusca() {
  const q = norm(S.buscaQ).trim(), qd = soDig(S.buscaQ);
  const res = !q ? [] : meus(S.contas).filter((c) => norm(c.nome + " " + c.razao + " " + c.cidade).includes(q) || (qd.length >= 4 && (soDig(c.cnpj).includes(qd) || c.pessoas.some((p) => soDig(p.tel).includes(qd))))).slice(0, 6);
  return `<div class="relative"><span class="pointer-events-none absolute left-3 top-2.5 text-gray-400">${ic("busca", "h-4 w-4")}</span>
    <input type="search" id="busca-vendas" data-input="busca" value="${esc(S.buscaQ)}" placeholder="Buscar nome, CNPJ ou telefone…" autocomplete="off" class="${UI.campo} bg-white pl-9 dark:bg-gray-900">
    ${q ? `<ul class="absolute inset-x-0 top-full z-40 mt-1 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:divide-gray-800 dark:border-gray-700 dark:bg-gray-900">${res.map((c) => `<li><a href="#/clientes/${c.id}" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
        <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</p><p class="text-xs text-gray-500 dark:text-gray-400">${c.cnpj} · ${esc(c.cidade)}</p></div>${tipoPill(c)}</a></li>`).join("")}
      ${!res.length ? `<li class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Nada na ${sup() ? "carteira da equipe" : "sua carteira"}. ${sup() ? "" : `<button type="button" data-acao="novo-lead" data-q="${esc(S.buscaQ)}" class="${UI.link}">Cadastrar como lead →</button>`}</li>` : ""}</ul>` : ""}</div>`;
}

// ── Casca da página Vendas: saudação + busca, abas, seletor do supervisor ──
const ABAS_VENDAS = [["resumo", "Resumo", "vendas"], ["agenda", "Agenda", "vendas/agenda"], ["leads", "Leads", "vendas/leads"], ["clientes", "Clientes", "vendas/clientes"]];
function telaVendas() {
  const nome = sup() ? SUPERVISOR.curto : vend(S.como).curto, abas = [...ABAS_VENDAS, ...(sup() ? [["equipe", "Equipe", "equipe"]] : [])];
  const ativa = S.vAba === "importar" ? "leads" : S.vAba;
  const tab = ([k, r, rota]) => `<a href="#/${rota}" class="shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${ativa === k ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}">${r}</a>`;
  const corpo = { resumo: telaResumo, agenda: telaAgenda, leads: telaLeads, clientes: telaClientes, importar: telaImportar, equipe: telaEquipe }[S.vAba]();
  return `<div class="mx-auto max-w-[80rem]">
    <div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-xl font-bold text-gray-800 dark:text-white">Olá, ${nome}</h1><p class="text-sm text-gray-500 dark:text-gray-400">${sup() ? "Supervisor · vendas internas" : "rep 0412 · vendas internas"} · qua 21/10</p></div><div class="w-full sm:w-80">${blocoBusca()}</div></div>
    <div class="mb-4 mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-200 dark:border-gray-800"><nav class="no-scrollbar -mb-px flex gap-5 overflow-x-auto">${abas.map(tab).join("")}</nav>${sup() ? `<div class="pb-2">${seletorVendedora()}</div>` : ""}</div>
    ${corpo}</div>`;
}
function telaResumo() {
  if (sup() && !S.sel) return `<div class="space-y-4">${blocoEquipeTabela()}${pedirVendedora("A agenda do dia e as Ações sugeridas")}</div>${blocosPWA()}`;
  return `<div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
    <div class="min-w-0 lg:col-span-2">${blocoTarefas()}</div>
    <div class="min-w-0 lg:col-start-3 lg:row-span-2 lg:row-start-1">${blocoAgendaDia()}</div>
    <div class="min-w-0 lg:col-span-2 lg:row-start-2">${blocoSugestoes()}</div></div>${blocosPWA()}`;
}
function telaAgenda() {
  if (sup() && !S.sel) return pedirVendedora("A agenda");
  const sub = segV3([["hoje", "Hoje"], ["semana", "Semana"]], S.agAba, "ag-aba");
  const bts = sup() ? "" : `<button type="button" data-acao="gaveta" class="${UI.btnSm} py-1.5">${ic("ia", "h-3.5 w-3.5")}Montar agenda <span class="text-gray-400">${sugestoes().length}</span></button><button type="button" data-acao="agendar-novo" class="${UI.btnPSm} py-1.5">${ic("mais", "h-3.5 w-3.5")}Agendar</button>`;
  return `<section class="${UI.card}"><div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">${sub}<div class="flex flex-wrap gap-2">${bts}</div></div>
    <div class="p-3 sm:p-4">${S.agAba === "semana" ? blocoSemana() : blocoMeuDia()}</div></section>`;
}
// gaveta "Montar agenda" (Agenda): a mesma lista das Ações sugeridas
const gaveta = () => S.gaveta ? `<div class="fixed inset-0 z-[99990]" data-acao="fundo-gaveta"><div data-fundo class="absolute inset-0 bg-gray-900/40 dark:bg-black/60"></div>
  <aside class="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-gray-50 shadow-xl dark:bg-gray-950" role="dialog" aria-label="Montar agenda"><div class="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"><div><h3 class="text-base font-semibold text-gray-800 dark:text-white">Montar agenda</h3><p class="${V.muted}">escolha quando falar com cada um — some da lista e entra na agenda</p></div>
    <button type="button" data-acao="gaveta" aria-label="Fechar" class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">${ic("x", "h-5 w-5")}</button></div>
    <div class="min-h-0 flex-1 overflow-y-auto p-3">${blocoSugestoes(true)}</div></aside></div>` : "";

// ── Equipe (supervisor): tabela no topo do Resumo em "Todas" + aba Equipe ──
function linhasEquipe() {
  return VENDEDORAS.map((v) => { const cs = S.contas.filter((c) => c.dona === v.id), ab = cs.filter(aberto);
    return { v, atr: cs.filter((c) => situacao(c) === "atrasado").length, sem: cs.filter((c) => situacao(c) === "sem").length, sem7: contatosSemana(v.id), psr: cs.filter(propostaSemResposta).length,
      ab: ab.length, abL: ab.reduce((a, c) => a + c.neg.litros, 0), ganhos: cs.filter((c) => c.neg?.etapa === "ganho" && (c.neg.ganhoEm || "") >= "2026-10-01").length,
      caixa: cs.filter((c) => naCaixa(c) || semContato(c)).length }; });
}
function blocoEquipeTabela() {
  const n = (k, tom) => `<span class="text-base font-semibold ${k ? tom : "text-gray-400"}">${k}</span>`, ls = linhasEquipe();
  const cols = [["Atrasados", "atr", "text-error-600 dark:text-error-400"], ["Sem próximo", "sem", "text-warning-600 dark:text-warning-400"], ["Contatos sem.", "sem7", "text-gray-800 dark:text-white"], ["Prop. s/ resp.", "psr", "text-brand-600 dark:text-brand-400"], ["Abertos", "ab", "text-gray-800 dark:text-white"], ["Ganhos mês", "ganhos", "text-success-600 dark:text-success-400"], ["Sem 1º contato", "caixa", "text-purple-700 dark:text-purple-300"]];
  const val = (l, k) => k === "sem7" ? l.sem7.total : l[k];
  const tabela = `<div class="hidden overflow-x-auto md:block"><table class="min-w-full"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Vendedora</th>${cols.map(([r]) => `<th class="${UI.th} text-center">${r}</th>`).join("")}<th class="${UI.th}"></th></tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${ls.map((l) => `<tr><td class="${UI.td} font-medium text-gray-800 dark:text-white"><button type="button" data-acao="sel" data-v="${l.v.id}" class="hover:text-brand-500">${donaTxt(l.v.id)}</button></td>
      ${cols.map(([, k, t]) => `<td class="${UI.td} text-center">${n(val(l, k), t)}${k === "sem7" ? `<span class="block text-xs text-gray-400">${l.sem7.auto} V3 · ${l.sem7.manual} manuais</span>` : k === "ab" ? `<span class="block whitespace-nowrap text-xs text-gray-400">${litros(l.abL)}</span>` : ""}</td>`).join("")}
      <td class="${UI.td} text-right"><button type="button" data-acao="entrar-como" data-v="${l.v.id}" class="${UI.btnSm}">Entrar como</button></td></tr>`).join("")}</tbody></table></div>
    <ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${ls.map((l) => `<li class="px-4 py-3"><div class="flex items-center justify-between gap-2">${donaTxt(l.v.id)}<button type="button" data-acao="entrar-como" data-v="${l.v.id}" class="${UI.btnSm}">Entrar como</button></div>
      <dl class="mt-2 grid grid-cols-4 gap-1.5 text-center">${cols.map(([r, k, t]) => `<div class="rounded-lg bg-gray-50 py-1.5 dark:bg-white/[0.03]"><dd>${n(val(l, k), t)}</dd><dt class="truncate px-0.5 text-[10px] text-gray-500 dark:text-gray-400">${r}</dt></div>`).join("")}</dl></li>`).join("")}</ul>`;
  return `<div class="${UI.card} overflow-hidden">${cardTopo("Equipe", `<span class="${V.muted}">semana de seg 19/10 · contatos = conversas da V3 + registros manuais</span>`)}${tabela}</div>`;
}
function blocoVisitas() {
  const vis = S.contas.filter((c) => c.neg?.visita && !c.neg.visitaFeita && aberto(c)), feitas = S.contas.filter((c) => c.neg?.visitaFeita);
  return `<div class="${UI.card} overflow-hidden">${cardTopo(`Visitas pedidas <span class="${UI.badge}">${vis.length}</span>`, `<span class="${V.muted}">pro vendedor externo</span>`)}
    ${vis.length ? `<ul class="divide-y divide-gray-100 dark:divide-gray-800">${vis.map((c) => `<li class="flex flex-wrap items-start gap-3 px-4 py-3"><div class="min-w-0 flex-1"><a href="#/clientes/${c.id}" class="${UI.link} text-sm">${esc(c.nome)}</a>
        <p class="text-xs text-gray-500 dark:text-gray-400">${ic("pino", "inline h-3 w-3")} ${esc(c.cidade)} · ${vend(c.dona).curto} · ${litros(c.neg.litros)}/mês</p>${c.neg.visitaNota ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${esc(c.neg.visitaNota)}</p>` : ""}</div>
        <button type="button" data-acao="visita-feita" data-v="${c.id}" class="${UI.btnSm}">${ic("check", "h-3.5 w-3.5")}Marcar atendida</button></li>`).join("")}</ul>` : vazio("Nenhuma visita pedida.")}
    ${feitas.length ? `<p class="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 dark:border-gray-800">Atendidas: ${feitas.map((c) => esc(c.nome)).join(" · ")}</p>` : ""}</div>`;
}
const telaEquipe = () => !sup() ? `<div class="${UI.card}">${vazio("Só o supervisor vê a Equipe.")}</div>`
  : `<div class="space-y-4">${blocoEquipeTabela()}${blocoVisitas()}
    <div class="${UI.card} p-4"><h2 class="${UI.h2}">Fontes das Ações sugeridas</h2><p class="mt-1 ${V.muted}">As outras fontes ficam sempre ligadas. <button type="button" data-acao="fontes-sug" class="${UI.link}">de onde vêm</button></p>
      <label class="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200"><input type="checkbox" data-acao="fonte-atraso" ${S.fonteAtraso ? "checked" : ""} class="h-4 w-4 rounded border-gray-300">Em atraso (título vencido) aparece como sugestão de Atendimento</label></div></div>`;
