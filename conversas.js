const aVencer = (c) => ({ qtd: 2, valor: Math.round(c.bi.consumo * 3.05) });

// ── Conversas = V3 de hoje, só as caixas dela ───────────────────────────────
const CAIXA = { fer: "(11) 99000-0412 · fernanda@disbra.exemplo", jul: "(11) 99000-0415 · juliana@disbra.exemplo", cam: "(11) 99000-0418 · camila@disbra.exemplo" };
function convsDaVista() {
  const cs = meus(S.conv).sort((a, b) => (b.dia + b.hora).localeCompare(a.dia + a.hora));
  return { nao: cs.filter((v) => !v.fechada && v.naoLidas > 0), minhas: cs.filter((v) => !v.fechada), tudo: cs };
}
function linhaConversa(v) {
  const c = v.conta ? conta(v.conta) : null, nl = !v.fechada && v.naoLidas > 0, ult = v.msgs[v.msgs.length - 1] || { t: "" };
  const nome = v.desconhecido ? v.nome : v.nome;
  return `<li><a href="#/conversas/${v.id}" class="flex items-center gap-4 rounded-lg border border-gray-200 p-3 transition-colors dark:border-gray-800 ${nl ? "border-l-4 border-l-brand-500 bg-brand-50/40 hover:bg-brand-50/70 dark:border-l-brand-400 dark:bg-brand-500/10 dark:hover:bg-brand-500/15" : "bg-white hover:bg-gray-50 dark:bg-white/[0.03] dark:hover:bg-white/5"}">
    <span class="relative flex-shrink-0">${avatar(c ? c.nome : "?", "h-10 w-10 text-sm")}<span class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-gray-400 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-700">${v.canal === "email" ? ic("mail", "h-2.5 w-2.5") : icWa("h-2.5 w-2.5")}</span></span>
    <div class="min-w-0 flex-1 overflow-hidden">
      <div class="flex flex-wrap items-center gap-1.5"><span class="truncate text-sm tracking-tight ${nl ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-800 dark:text-white/90"}">${esc(v.canal === "email" && v.assunto ? v.assunto : nome)}</span>
        ${v.desconhecido ? pill("número novo", COR.aviso) : c ? tipoPill(c) : ""}${v.fechada ? pill("fechada", COR.cinza) : ""}</div>
      <p class="mt-0.5 truncate text-sm text-gray-700 dark:text-gray-300">${c ? `${esc(c.nome)} · ${esc(c.cidade)}` : `<span class="text-gray-400 dark:text-gray-500">sem empresa</span>`}</p>
      <p class="mt-1 flex items-center gap-1 truncate text-xs ${nl ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 opacity-70 dark:text-gray-300"}">
        ${ult.dir === "eu" ? `<span class="flex-shrink-0 text-blue-500 dark:text-blue-400">✓✓</span>` : ""}<span class="truncate"><span class="text-gray-400">"</span>${esc(ult.t)}<span class="text-gray-400">"</span></span>
        <span class="ml-1 flex-shrink-0 font-mono text-[11px] text-gray-400 dark:text-gray-500">${dm(v.dia)} ${v.hora}</span></p></div>
    <div class="flex flex-shrink-0 flex-col items-end gap-1.5">${nl ? `<span class="inline-flex h-6 items-center justify-center whitespace-nowrap rounded-full bg-brand-500 px-2.5 text-xs font-bold text-white">${v.naoLidas === 1 ? "1 nova" : v.naoLidas + " novas"}</span>` : ""}
      ${sup() && !S.sel ? `<span class="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/10 dark:text-warning-400">👤 ${vend(v.dona).curto}</span>` : ""}</div></a></li>`;
}
function telaConversas() {
  const g = convsDaVista(), lista = g[S.convVista];
  const q = norm(S.convQ), filtrada = !q ? lista : lista.filter((v) => norm(v.nome + " " + (v.assunto || "") + " " + (v.conta ? conta(v.conta).nome : "")).includes(q));
  const cont = (n, on) => `<span class="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${on ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}">${n}</span>`;
  const vistas = `<div class="${V.segment}">${[["nao", "Não lidas"], ["minhas", "Minhas"], ["tudo", "Tudo"]].map(([k, r]) => `<button type="button" data-acao="conv-vista" data-v="${k}" class="${S.convVista === k ? V.segment_on : V.segment_off}">${r}${cont(g[k].length, S.convVista === k)}</button>`).join("")}</div>`;
  const caixa = sup() ? (S.sel ? `caixa de ${vend(S.sel).curto} · ${CAIXA[S.sel]}` : "as caixas da equipe (só leitura pro supervisor)") : `só as caixas dela: ${icWa("inline h-3 w-3")} ${CAIXA[S.como].replace(" · ", ` · ${ic("mail", "inline h-3 w-3")} `)}`;
  return tituloPagina("Conversas", caixa, seletorVendedora()) + `<div class="${UI.card}">
    <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">${vistas}
      <div class="relative ml-auto w-full sm:w-[220px]"><span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">${ic("busca", "h-3.5 w-3.5")}</span><input type="search" id="busca-conv" data-input="convq" value="${esc(S.convQ)}" placeholder="Buscar conversa…" class="${V.input} pl-8"></div></div>
    ${filtrada.length ? `<ul class="space-y-2 p-3">${filtrada.map(linhaConversa).join("")}</ul>` : vazio(S.convVista === "nao" ? "Nenhuma conversa não lida." : "Nenhuma conversa.")}</div>`;
}

// ── Conversa aberta: chat (2/3) + coluna da direita (1/3), igual à V3 ──────
function bolhas(v) {
  let dia = null, out = "";
  for (const m of v.msgs) {
    const d = m.d || v.dia;
    if (d !== dia) { out += `<div class="flex justify-center py-1"><span class="rounded-full bg-gray-100 px-3 py-0.5 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">${rotData(d)} · ${dm(d)}</span></div>`; dia = d; }
    if (m.sis) { out += `<div class="flex justify-center py-0.5"><span class="rounded-full bg-gray-100 px-3 py-0.5 text-center text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">${esc(m.t)}</span></div>`; continue; }
    const sai = m.dir === "eu", bolha = sai ? "rounded-lg rounded-tr-sm bg-green-100 text-gray-900 dark:bg-emerald-900/50 dark:text-gray-100" : m.nova ? "rounded-lg rounded-tl-sm bg-brand-50 text-gray-900 ring-1 ring-brand-200 dark:bg-brand-500/15 dark:text-white dark:ring-brand-500/30" : "rounded-lg rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/90";
    out += `<div class="flex min-w-0 flex-col py-1 [overflow-wrap:anywhere] ${sai ? "items-end" : "items-start"}"><div class="max-w-[75%] px-3 py-2 text-sm whitespace-pre-wrap ${bolha}">${esc(m.t)}</div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${sai ? vend(v.dona).curto + " · " : ""}${m.h}${sai ? ` <span class="text-blue-500">✓✓</span>` : ""}</p></div>`;
  }
  return out;
}
function chat(v) {
  const c = v.conta ? conta(v.conta) : null, ro = sup();
  const sit = v.fechada ? `<span class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"><span class="h-2 w-2 rounded-full bg-gray-400"></span>Fechada</span>`
    : `<span class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"><span class="h-2 w-2 rounded-full bg-success-500"></span>Aberta</span>`;
  const destino = v.canal === "email" ? `e-mail ${CAIXA[v.dona].split(" · ")[1]}` : `WhatsApp ${CAIXA[v.dona].split(" · ")[0]}`;
  const composer = ro ? `<div class="flex-shrink-0 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">Supervisor vê a caixa, mas quem responde é a dona. Use <b>Entrar como</b> pra ver como ela vê.</div>`
    : `<div class="flex-shrink-0 border-t border-gray-200 px-4 py-2 dark:border-gray-800"><div class="rounded-2xl border border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-1 px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400"><span class="truncate">${destino}</span><span class="truncate">→ ${esc(v.nome)}</span>${v.fechada ? `<span class="ml-auto shrink-0">atendimento fechado · responder reabre</span>` : ""}</div>
      ${v.fechada || v.desconhecido ? "" : `<div class="flex flex-wrap gap-1.5 px-3 pb-1"><button type="button" data-acao="fechar-agendar" data-conv="${v.id}" class="inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300">${ic("check", "h-3.5 w-3.5")}Fechar e agendar retorno</button></div>`}
      <textarea id="composer" data-input="composer" rows="2" placeholder="Escreva a resposta… (Enter envia)" class="block w-full resize-none border-0 bg-transparent px-4 py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white">${esc(S.rascunho[v.id] || "")}</textarea>
      <div class="flex items-center justify-between gap-2 px-2 py-1.5"><div class="flex items-center gap-0.5"><button type="button" data-acao="mock" data-v="Anexar arquivo: igual à V3." class="${V.btn_ghost}" title="Anexar">📎</button><button type="button" data-acao="mock" data-v="Respostas prontas: a base da V3." class="${V.btn_ghost}" title="Respostas prontas">⚡</button></div>
        <button type="button" data-acao="enviar" data-conv="${v.id}" class="${V.btn_primary}">${ic("enviar", "h-3.5 w-3.5")}Enviar</button></div></div></div>`;
  return `<div class="flex min-h-[28rem] flex-col overflow-hidden lg:col-span-2 lg:min-h-0 ${UI.card}">
    <div class="flex-shrink-0 border-b border-gray-200 px-4 py-2 dark:border-gray-800"><div class="flex items-center gap-2">
      <a href="#/conversas" title="Voltar para as conversas" class="${V.btn_ghost} -ml-1 flex h-8 w-8 flex-shrink-0 items-center justify-center">${ic("esq", "h-4 w-4")}</a>
      <div class="flex min-w-0 flex-1 items-center gap-2"><h5 class="min-w-[6rem] max-w-56 truncate text-sm font-medium text-gray-800 dark:text-white/90">${esc(v.canal === "email" && v.assunto ? v.assunto : v.nome)}</h5>
        ${c ? `<span class="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400">· ${esc(c.nome)}</span>` : `<span class="min-w-0 flex-1 truncate text-xs font-medium text-warning-600 dark:text-warning-400">· sem contato — identificar</span>`}
        <span class="flex-shrink-0 text-gray-400">${v.canal === "email" ? ic("mail", "h-3.5 w-3.5") : icWa("h-3.5 w-3.5")}</span><span class="hidden flex-shrink-0 text-xs font-medium text-gray-500 sm:inline dark:text-gray-400">#${v.id}</span></div>
      <div class="flex flex-shrink-0 items-center gap-2">${sit}${v.fechada && !ro ? `<button type="button" data-acao="reabrir-conv" data-v="${v.id}" class="${V.btn_secondary}">Reabrir</button>` : ""}</div></div></div>
    <div id="timeline" class="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3">${bolhas(v)}</div>${composer}</div>`;
}
function papelPill(p) { return p && p.papel !== "principal" ? pill(PAPEL[p.papel] || p.papel, p.papel === "decisor" ? COR.roxo : COR.cinza) : ""; }
function erpCard(c) {
  const n = notasBI(c), p = precoAcordado(c), av = aVencer(c);
  return `<div class="space-y-3 pt-3 text-sm">
    <div class="${V.erp}"><div class="mb-2 flex items-center justify-between gap-2"><h4 class="${V.erp_h} mb-0">Compras (12 meses)</h4><button type="button" data-acao="mock" data-v="Notas e boletos: o modal da V3." class="${V.link}">Ver notas ›</button></div>
      <dl class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs"><div><dt class="text-gray-400">Volume total</dt><dd class="font-medium text-gray-700 dark:text-gray-200">${litros(c.bi.l12)}</dd></div><div><dt class="text-gray-400">Nº compras</dt><dd class="font-medium text-gray-700 dark:text-gray-200">${c.bi.ciclo ? Math.round(365 / c.bi.ciclo) : c.bi.compras < 99 ? c.bi.compras : 9}</dd></div>
      <div><dt class="text-gray-400">${c.produto}</dt><dd class="font-medium text-gray-700 dark:text-gray-200">${litros(c.bi.l12)}</dd></div><div><dt class="text-gray-400">Última compra</dt><dd class="font-medium text-gray-700 dark:text-gray-200">${c.bi.ultimo ? `${dm(c.bi.ultimo)} · há ${diasAtras(c.bi.ultimo)} d` : "—"}</dd></div></dl></div>
    ${c.bi.comodatoEquip.length ? `<div class="${V.erp}"><h4 class="${V.erp_h}">Comodato (${c.bi.comodatoEquip.length})</h4><ul class="space-y-1 text-xs">${c.bi.comodatoEquip.map((e) => `<li class="flex justify-between gap-2 text-gray-700 dark:text-gray-200"><span class="truncate">${esc(e)}</span><span class="flex-shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">Ativo</span></li>`).join("")}</ul></div>` : ""}
    <div class="${V.erp}"><h4 class="${V.erp_h}">Financeiro</h4><div class="grid grid-cols-2 gap-2">
      <div class="rounded-lg px-3 py-2 ${c.bi.titulos ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-700/40"}"><p class="text-[11px] ${c.bi.titulos ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}">Vencido (${c.bi.titulos})</p><p class="font-semibold ${c.bi.titulos ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-200"}">${reais(c.bi.vencidos)}</p></div>
      <div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/40"><p class="text-[11px] text-gray-500 dark:text-gray-400">A vencer (${av.qtd})</p><p class="font-semibold text-gray-700 dark:text-gray-200">${reais(av.valor)}</p></div></div></div>
    <div class="${V.erp}"><h4 class="${V.erp_h}">Preço acordado</h4><table class="w-full text-xs"><thead><tr class="text-left text-gray-400"><th class="pb-1 font-medium">Produto</th><th class="pb-1 font-medium">Preço</th><th class="pb-1 font-medium">Cond.</th></tr></thead>
      <tbody><tr class="border-t border-gray-100 dark:border-gray-700"><td class="py-1 text-gray-700 dark:text-gray-200">Diesel ${p.produto}</td><td class="py-1 font-medium text-gray-800 dark:text-white">R$ ${p.preco.toFixed(4).replace(".", ",")}</td><td class="py-1 text-gray-500 dark:text-gray-400">${p.cond}</td></tr></tbody></table></div>
    <div class="${V.erp}"><h4 class="${V.erp_h}">Últimas notas</h4><ul class="space-y-1.5 text-xs">${n.map((x) => `<li class="flex items-center justify-between gap-2"><span class="text-gray-700 dark:text-gray-200">NF ${x.nf} · ${dm(x.d)} · ${litros(x.litros)}</span><span class="inline-flex shrink-0 divide-x divide-gray-300 overflow-hidden rounded-lg border border-gray-300 dark:divide-gray-700 dark:border-gray-700">${["Nota", "Boleto"].map((t) => `<button type="button" data-acao="mock" data-v="${t} da NF ${x.nf}: vai pro composer, como na V3." class="cursor-pointer px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-brand-50 dark:text-gray-300 dark:hover:bg-white/5">${t}</button>`).join("")}</span></li>`).join("")}</ul></div></div>`;
}
function interesse(c) {
  if (!c.litros) return "";
  return `<div class="rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-500/30 dark:bg-purple-500/10"><p class="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">Interesse</p>
    <p class="mt-1 text-sm font-semibold text-gray-800 dark:text-white">${litros(c.litros)}/mês · ${c.produto}${c.comodato ? " · comodato" : ""}</p></div>`;
}
// Próximos (SPEC_V5 §6): os próximos dos blocos Prospects/Clientes/Em atraso de Hoje; "Fechar e agendar retorno" põe o 1º em destaque
function blocoProximos(v) {
  if (sup()) return "";
  const r = itensHoje(HOJE), lista = [...r.prospects, ...r.clientes, ...r.atraso].filter((c) => c.id !== v.conta).sort(ordemHora);
  const foco = S.proxFoco ? lista[0] : null;
  const acao = (c) => { const prev = canalPrevisto(c), cls = `${foco?.id === c.id ? V.btn_primary : V.btn_secondary} px-2 py-1`;
    return prev === "telefone" && pessoaPrincipal(c)?.tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" class="${cls}">${ic("fone", "h-3 w-3")}Ligar</button>` : waDrop(c, cls, "right-0", icWa("h-3 w-3"), `wa:px:${c.id}`); };
  const linhas = lista.slice(0, 4).map((c) => `<li class="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 ${foco?.id === c.id ? "bg-brand-50 ring-1 ring-brand-300 dark:bg-brand-500/10 dark:ring-brand-500/40" : ""}">
    <span class="w-9 shrink-0 font-mono text-[11px] text-gray-500 dark:text-gray-400">${c.prox.h || ""}</span><span class="shrink-0 text-gray-400">${icCanal(canalPrevisto(c), "h-3 w-3")}</span>
    <a href="#/fichas/${c.id}" title="${esc(c.prox.assunto)}" class="min-w-0 flex-1 truncate text-xs font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</a><span class="flex shrink-0 items-center gap-1">${acao(c)}</span></li>`).join("");
  return `<section class="px-4 py-3"><details ${S.proxFechado ? "" : "open"} data-prox="1"><summary class="flex cursor-pointer items-center justify-between gap-2"><span class="${V.section_title} mb-0">Próximos · ${lista.length}</span><a href="#/vendas" class="${V.link}">Hoje ›</a></summary>
    ${foco ? `<p class="mt-2 rounded-lg bg-brand-500 px-2.5 py-1.5 text-xs font-medium text-white">próximo: ${esc(foco.nome)}</p>` : ""}
    ${linhas ? `<ul class="mt-2 space-y-0.5">${linhas}</ul>` : `<p class="mt-2 ${V.muted}">Nada mais pra hoje.</p>`}</details></section>`;
}
function colunaDireita(v) {
  const sec = (titulo, corpo, extra = "") => `<section class="px-4 py-4"><div class="flex items-center justify-between gap-2"><h4 class="${V.section_title}">${titulo}</h4>${extra}</div>${corpo}</section>`;
  if (v.desconhecido) return `<div class="flex min-h-0 flex-col overflow-y-auto ${UI.card}"><div class="divide-y divide-gray-100 dark:divide-gray-800">${blocoProximos(v)}
    ${sec("Quem está do outro lado", `<p class="text-sm font-medium text-gray-800 dark:text-white">${esc(v.nome)}</p>
      <div class="mt-3 flex flex-col gap-2"><button type="button" data-acao="novo-prospect" data-conv="${v.id}" class="${V.btn_primary} justify-center py-2">${ic("mais", "h-3.5 w-3.5")}Novo prospect</button>
      <button type="button" data-acao="vincular" data-v="${v.id}" class="${V.btn_secondary} justify-center py-2">Vincular a cliente</button>
      <button type="button" data-acao="ignorar" data-v="${v.id}" class="${V.btn_ghost} py-2 text-center">Ignorar</button></div>
`)}</div></div>`;
  const c = conta(v.conta), p = c.pessoas.find((x) => x.nome === v.nome) || pessoaPrincipal(c);
  const quem = sec("Quem é", `<div class="flex items-start gap-3">${avatar(v.nome, "h-9 w-9 text-xs")}<div class="min-w-0 flex-1"><p class="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-white">${esc(v.nome)} ${papelPill(p)}</p>
    <a href="#/fichas/${c.id}" class="block truncate text-xs text-gray-600 hover:text-brand-500 hover:underline dark:text-gray-300">${esc(c.nome)} · ${esc(c.cidade)}</a><div class="mt-1.5 flex flex-wrap gap-1.5">${tipoPill(c)}${c.segmento ? pill(esc(c.segmento), COR.cinza) : ""}</div></div></div>
    <dl class="mt-2"><div class="${V.dl_row}"><dt class="${V.dt}">${v.canal === "email" ? "E-mail" : "Telefone"}</dt><dd class="${V.dd} truncate">${esc(v.canal === "email" ? p?.email || "—" : p?.tel || v.nome)}</dd></div>
    <div class="${V.dl_row}"><dt class="${V.dt}">Prefere</dt><dd class="${V.dd}">${p?.prefere === "email" ? "E-mail" : p?.prefere === "telefone" ? "Telefone" : "WhatsApp"}</dd></div>${sup() ? `<div class="${V.dl_row}"><dt class="${V.dt}">Dona</dt><dd class="${V.dd}">${vend(c.dona).curto}</dd></div>` : ""}</dl>`);
  // contato agendado de hoje (ou atrasado) da empresa: "Fechar e agendar retorno" é o que conclui
  const agHoje = c.prox && c.prox.d <= HOJE ? `<p class="mb-2 flex items-center gap-1.5 text-xs ${c.prox.d < HOJE ? "text-error-600 dark:text-error-400" : "text-brand-600 dark:text-brand-300"}">${ic("cal", "h-3.5 w-3.5")}contato ${c.prox.d < HOJE ? "atrasado" : "de hoje"}: ${esc(c.prox.assunto)}</p>` : "";
  const neg = sec("Negócio", agHoje + `${ehProspect(c) || c.ctipo === "novo" ? pathV5(c, "h-7 text-xs", true) : `<p class="text-sm text-gray-700 dark:text-gray-200">Cliente ${CTIPO[c.ctipo].toLowerCase()}${c.sit ? ` · ${sitPill(c)}` : ""}</p>`}
      <dl class="mt-2">${c.litros || c.bi ? `<div class="${V.dl_row}"><dt class="${V.dt}">Volume</dt><dd class="${V.dd}">${litros(litrosDe(c))}/mês · ${c.produto}</dd></div>` : ""}<div class="${V.dl_row}"><dt class="${V.dt}">Próximo</dt><dd class="${V.dd}">${proxCtl(c, "", "cv")}</dd></div></dl>
      ${sup() ? "" : `<button type="button" data-acao="resultado" data-conv="${v.id}" class="${V.btn_primary} mt-2 w-full justify-center py-2">Registrar resultado</button>`}`,
    `<a href="#/fichas/${c.id}" class="${V.link}">Ficha ›</a>`);
  const erp = c.tipo === "cliente"
    ? `<section class="px-4 py-4"><details ${S.erpAberto ? "open" : ""} data-erp="1"><summary class="flex cursor-pointer items-center justify-between gap-2"><span class="${V.section_title} mb-0">Ficha do ERP</span><span class="text-gray-400">${ic("baixo", "h-4 w-4")}</span></summary>${erpCard(c)}</details></section>`
    : interesse(c) ? `<section class="px-4 py-4">${interesse(c)}</section>` : "";
  const acoes = sec("Ações", `<div class="flex flex-wrap gap-1.5">${[["Anotar pedido", "pedidos"], ["Proposta", "propostas"], ["Pedir crédito", "credito"]].map(([r, m]) => `<button type="button" data-acao="modulo" data-v="${m}" data-conta="${c.id}" class="${V.btn_secondary}">${r}</button>`).join("")}<a href="#/fichas/${c.id}" class="${V.btn_secondary}">Ficha completa</a></div>`);
  const evs = c.eventos.filter((e) => !e.sistema).slice(0, 3);
  const ativ = sec("Atividade", evs.length ? `<ul class="space-y-2.5">${evs.map((e) => eventoHtml(e, c, true)).join("")}</ul>` : `<p class="${V.muted}">Nenhum contato ainda.</p>`, `<a href="#/fichas/${c.id}" class="${V.link}">ver tudo ›</a>`);
  return `<div class="flex min-h-0 flex-col overflow-y-auto ${UI.card}"><div class="divide-y divide-gray-100 dark:divide-gray-800">${blocoProximos(v)}${quem}${neg}${erp}${acoes}${ativ}</div></div>`;
}
function telaConversa(id) {
  const v = conversa(id);
  if (!v || !escopo().includes(v.dona)) return `<div class="${UI.card}">${vazio("Conversa não encontrada (ou não é da sua caixa).")}</div>`;
  return `<div class="alto-conversa flex min-h-0 flex-col p-3 md:p-4"><div class="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-3">${chat(v)}${colunaDireita(v)}</div></div>`;
}
