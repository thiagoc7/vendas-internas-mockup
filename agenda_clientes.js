// ── Vendas › Funil (negócios abertos por etapa) e Vendas › Leads (caixa de entrada + leads dela) — SPEC_V4 §5, §6, §12 ──
const RECOMPRA = { pronto: ["Prontos pra pedir", "dentro da janela de recompra"], esfriando: ["Esfriando", "passou 1,5× do intervalo"], inativo: ["Inativos", "mais de 60 dias sem comprar"] };
const todasEquipe = () => sup() && !S.sel;
const colVend = (c) => todasEquipe() ? `<td class="${UI.td}">${donaTxt(c.dona)}</td>` : "";
const thVend = () => todasEquipe() ? `<th class="${UI.th}">Vendedora</th>` : "";
const chaveFonte = (c) => c.neg?.campanha ? "c:" + c.neg.campanha : fonteDe(c) ? "f:" + fonteDe(c) : null;
const nomeChave = (k) => k.startsWith("c:") ? campanha(k.slice(2)).nome : FONTES[k.slice(2)];
function passaFiltroFonte(c, fonte, camp) {
  if (fonte && (fonte === "carteira" ? !!fonteDe(c) : fonteDe(c) !== fonte && campanha(c.neg?.campanha)?.fonte !== fonte)) return false;
  if (camp && c.neg?.campanha !== camp) return false;
  return true;
}
const selFonte = (id, val, acao) => `<select id="${id}" data-input="${acao}" class="${UI.campo.replace("w-full ", "")} w-auto py-1.5"><option value="">Fonte: todas</option>${Object.entries(FONTES).map(([k, r]) => `<option value="${k}" ${val === k ? "selected" : ""}>${r}</option>`).join("")}${acao === "fun-fonte" ? `<option value="carteira" ${val === "carteira" ? "selected" : ""}>Carteira (cliente)</option>` : ""}</select>`;
const selCamp = (id, val, acao) => `<select id="${id}" data-input="${acao}" class="${UI.campo.replace("w-full ", "")} w-auto py-1.5"><option value="">Campanha: todas</option>${S.camps.map((k) => `<option value="${k.id}" ${val === k.id ? "selected" : ""}>${esc(k.nome)}</option>`).join("")}</select>`;
const ultTxt = (c) => { const u = ultimoContato(c); return u ? `<span class="inline-flex items-center gap-1 whitespace-nowrap">${rotData(u.d)}<span class="text-gray-400">${icCanal(u.canal, "h-3.5 w-3.5")}</span></span>` : `<span class="text-gray-400">—</span>`; };
const litrosTxt = (c) => litrosDe(c) ? num(litrosDe(c)) : "—";
// Funil: linha única. Ações = ícones discretos (aparecem no hover no desktop, sempre no celular); [Hoje][Amanhã] só quando "sem próximo".
const icBtn = "flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-brand-300";
function rapidoFunil(c) {
  if (sup() || !aberto(c) || situacao(c) !== "sem") return "";
  return `<button type="button" data-acao="sug" data-v="${c.id}|hoje|parado" class="${UI.btnPSm}">Hoje</button><button type="button" data-acao="sug" data-v="${c.id}|amanha|parado" class="${UI.btnSm}">Amanhã</button>`;
}
function iconesFunil(c) {
  if (sup() || !aberto(c)) return "";
  const p = pessoaPrincipal(c);
  return `${p?.tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" title="Ligar" aria-label="Ligar" class="${icBtn}">${ic("fone", "h-4 w-4")}</button>` : ""}${drop(`wa:${c.id}`, icWa("h-4 w-4"), `${icBtn}" title="WhatsApp" aria-label="WhatsApp`, [["wa-central", c.id, "na Central", "abre a conversa dela na V3"], ["wa-web", c.id, "no WhatsApp Web", "manda pelo chip dela · entra na Atividade"]], "right-0", false)}`;
}
// chip do tipo; "quem moveu" fica no tooltip (e na ficha)
const chipFunil = (c) => { const t = c.neg?.etapa === "ganho" || c.tipo === "cliente" ? tipoPill(c) : pill("lead", COR.roxo), m = movTxt(c); return m ? `<span title="${ETAPA_NOME[c.neg.etapa]} · ${m}" class="shrink-0 cursor-help">${t}</span>` : `<span class="shrink-0">${t}</span>`; };
const fonteCurta = (c) => { const t = fonteTxt(c), curto = t.replace(/\s*<span[^>]*>.*?<\/span>/, ""); return curto !== t ? `<span title="${t.replace(/<[^>]+>/g, "")}" class="cursor-help">${curto}</span>` : t; };
const nomeFunil = (c, tag = "a") => `<span class="flex min-w-0 items-center gap-1.5"><${tag} ${tag === "a" ? `href="#/clientes/${c.id}"` : ""} title="${esc(c.nome)}" class="min-w-0 truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</${tag}>${chipFunil(c)}</span>`;
function tabelaNegocios(lista) {
  const tab = `<div class="hidden md:block"><table class="w-full table-fixed"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Empresa</th><th class="${UI.th} w-32">Fonte</th><th class="${UI.th} hidden w-28 xl:table-cell">Último</th><th class="${UI.th} w-48">Próximo</th><th class="${UI.th} w-20 text-right">L/mês</th>${todasEquipe() ? `<th class="${UI.th} w-32">Vendedora</th>` : ""}<th class="w-56"><span class="sr-only">Ações</span></th></tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${lista.map((c) => { const aberta = S.drop === `wa:${c.id}`; return `<tr class="group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5" data-acao="ir" data-v="#/clientes/${c.id}">
      <td class="px-4 py-2 text-sm">${nomeFunil(c)}</td><td class="truncate px-4 py-2 text-xs text-gray-600 dark:text-gray-300">${fonteCurta(c)}</td><td class="hidden px-4 py-2 text-sm text-gray-700 xl:table-cell dark:text-gray-300">${ultTxt(c)}</td><td class="whitespace-nowrap px-4 py-2 text-sm">${c.neg.etapa === "ganho" ? `<span class="text-xs text-gray-500">ganho ${rotData(c.neg.ganhoEm)}</span>` : proxTxt(c, true)}</td>
      <td class="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">${litrosTxt(c)}</td>${colVend(c)}<td class="overflow-hidden whitespace-nowrap py-1.5 pl-2 pr-3"><span class="flex items-center justify-end gap-1">${rapidoFunil(c)}<span class="flex items-center ${aberta ? "" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"}">${iconesFunil(c)}</span></span></td></tr>`; }).join("")}</tbody></table></div>`;
  const cards = `<ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${lista.map((c) => `<li class="px-4 py-2.5"><div class="flex items-center gap-2"><a href="#/clientes/${c.id}" class="min-w-0 flex-1 text-sm">${nomeFunil(c, "span")}</a><span class="flex shrink-0 items-center">${iconesFunil(c)}</span></div>
    <div class="mt-0.5 flex items-center gap-2"><p class="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400">${fonteCurta(c)} · ${c.neg.etapa === "ganho" ? "ganho " + rotData(c.neg.ganhoEm) : proxTxt(c, true)} · ${litrosTxt(c)} L${todasEquipe() ? ` · ${vend(c.dona).curto}` : ""}</p></div>${rapidoFunil(c) ? `<div class="mt-1.5 flex justify-end gap-1">${rapidoFunil(c)}</div>` : ""}</li>`).join("")}</ul>`;
  return tab + cards;
}
const NOTA_ETAPA = { novo: "Novo: só quem já teve alguma ação; sem contato fica em Leads", ganho: "Ganho: últimos 7 dias; fica com Aguardando GESCOR até virar Cliente" };
function porEtapa(base) {
  const secoes = ETAPAS.map(([k, r]) => [k, r, base.filter((c) => c.neg?.etapa === k && (k === "ganho" ? ganhoRecente(c) : aberto(c) && !semContato(c))).sort((a, b) => ordemProx(a, b) || a.nome.localeCompare(b.nome))]);
  return secoes.map(([k, r, l]) => { const fech = S.funFech[k], L = l.reduce((a, c) => a + litrosDe(c), 0);
    return `<div class="border-b border-gray-100 last:border-0 dark:border-gray-800"><button type="button" data-acao="fun-fech" data-v="${k}" ${NOTA_ETAPA[k] ? `title="${NOTA_ETAPA[k]}"` : ""} class="flex w-full items-center gap-2 bg-gray-50 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 dark:bg-white/[0.02] dark:text-gray-300 dark:hover:bg-white/5">
      ${ic(fech ? "dir" : "baixo", "h-3.5 w-3.5")}${r}${k === "ganho" ? " · 7 dias" : ""}<span class="font-normal text-gray-400">· ${l.length} · ${num(L)} L/mês</span></button>
      ${fech ? "" : l.length ? tabelaNegocios(l) : `<p class="px-4 py-3 text-xs text-gray-400">Ninguém nesta etapa.</p>`}</div>`; }).join("");
}
function porFonte(base) {
  const COLS = [["caixa", "Caixa"], ["novo", "Novo"], ["contatado", "Contatado"], ["qualificado", "Qualif."], ["proposta", "Proposta"], ["ganho", "Ganho"], ["perdido", "Perdido"]];
  const chaves = [...new Set(base.map(chaveFonte).filter(Boolean))].sort((a, b) => (a[0] === b[0] ? 0 : a[0] === "c" ? -1 : 1));
  const linhas = chaves.map((k) => { const cs = base.filter((c) => chaveFonte(c) === k && c.neg), n = (e) => cs.filter((c) => c.neg.etapa === e).length, conv = cs.length ? Math.round((n("ganho") / cs.length) * 100) : 0; return { k, cs, n, conv }; });
  const cel = (k, e, n) => `<td class="${UI.td} text-center">${n ? `<button type="button" data-acao="fun-cel" data-v="${k}|${e}" class="min-w-8 rounded-lg px-2 py-1 font-semibold text-gray-800 hover:bg-brand-50 hover:text-brand-600 dark:text-white dark:hover:bg-brand-500/10">${n}</button>` : `<span class="text-gray-300 dark:text-gray-600">0</span>`}</td>`;
  return `<div class="hidden md:block"><table class="min-w-full"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Fonte · campanha</th><th class="${UI.th} text-center">Lista</th>${COLS.map(([, r]) => `<th class="${UI.th} text-center">${r}</th>`).join("")}<th class="${UI.th} text-right">Conv.</th></tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${linhas.map(({ k, cs, n, conv }) => `<tr><td class="${UI.td}"><p class="font-medium text-gray-800 dark:text-white">${esc(nomeChave(k))}</p><p class="text-xs text-gray-400">${k.startsWith("c:") ? `campanha · ${FONTES[campanha(k.slice(2)).fonte] || "clientes da carteira"} · desde ${dm(campanha(k.slice(2)).data)}` : "fonte, sem campanha"}</p></td>
      ${cel(k, "", cs.length)}${COLS.map(([e]) => cel(k, e, n(e))).join("")}<td class="${UI.td} text-right font-semibold ${conv >= 20 ? "text-success-600 dark:text-success-400" : "text-gray-700 dark:text-gray-200"}">${conv}%</td></tr>`).join("")}</tbody></table></div>
    <ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${linhas.map(({ k, cs, n, conv }) => `<li class="px-4 py-3"><div class="flex items-center justify-between gap-2"><button type="button" data-acao="fun-cel" data-v="${k}|" class="truncate text-left text-sm font-medium text-gray-800 dark:text-white">${esc(nomeChave(k))} <span class="text-gray-400">· ${cs.length}</span></button><span class="text-sm font-semibold text-gray-700 dark:text-gray-200">${conv}%</span></div>
      <div class="mt-2 grid grid-cols-7 gap-1 text-center">${COLS.map(([e, r]) => `<button type="button" data-acao="fun-cel" data-v="${k}|${e}" class="rounded-lg bg-gray-50 py-1.5 dark:bg-white/[0.03]"><span class="block text-sm font-semibold ${n(e) ? "text-gray-800 dark:text-white" : "text-gray-300 dark:text-gray-600"}">${n(e)}</span><span class="block truncate text-[9px] text-gray-500 dark:text-gray-400">${r}</span></button>`).join("")}</div></li>`).join("")}</ul>
    <p class="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400 dark:border-gray-800">Clique num número pra ver a lista. Conv. = ganhos ÷ lista. A campanha mora no negócio (por isso Reativação tem clientes da carteira).</p>`;
}
function telaFunil() {
  const base = meus(S.contas).filter((c) => passaFiltroFonte(c, S.funFonte, S.funCamp));
  const ab = base.filter((c) => aberto(c) && !semContato(c)), n = (e) => ab.filter((c) => c.neg.etapa === e).length;
  const ganhoMes = base.filter((c) => c.neg?.etapa === "ganho" && (c.neg.ganhoEm || "") >= "2026-10-01").length, perdMes = base.filter((c) => c.neg?.etapa === "perdido" && c.eventos.some((e) => e.d >= "2026-10-01")).length;
  const hora = base.filter((c) => !!recompra(c)), arq = base.filter((c) => c.neg?.etapa === "perdido");
  const resumo = `<p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-300">${["novo", "contatado", "qualificado", "proposta"].map((e) => `<span>${ETAPA_NOME[e]} <b class="text-gray-800 dark:text-white">${n(e)}</b></span>`).join(`<span class="text-gray-300">·</span>`)}<span class="text-gray-300">‖</span><span>Ganho mês <b class="text-success-600 dark:text-success-400">${ganhoMes}</b></span><span>Perdido mês <b class="text-error-600 dark:text-error-400">${perdMes}</b></span></p>`;
  const vistas = [["etapa", "Por etapa", null], ["fonte", "Por fonte", null], ["hora", "Hora de chamar", hora.length], ["arquivo", "Arquivo", arq.length]];
  let corpo;
  if (S.funCel) { const [k, e] = S.funCel.split("|"), l = base.filter((c) => chaveFonte(c) === k && c.neg && (!e || c.neg.etapa === e));
    corpo = `<div class="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-brand-25 px-4 py-2 text-sm dark:border-gray-800 dark:bg-brand-500/5"><span class="text-gray-700 dark:text-gray-200"><b>${esc(nomeChave(k))}</b>${e ? ` · etapa <b>${ETAPA_NOME[e] || "Caixa"}</b>` : " · todos"} · ${l.length}</span><button type="button" data-acao="fun-cel" data-v="" class="ml-auto inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">${ic("esq", "h-3.5 w-3.5")}voltar pra visão por fonte</button></div>${l.length ? tabelaNegocios(l) : vazio("Ninguém.")}`; }
  else if (S.funVista === "fonte") corpo = porFonte(base);
  else if (S.funVista === "hora") corpo = hora.length ? tabelaHora(hora) : vazio("Ninguém na hora de chamar.");
  else if (S.funVista === "arquivo") corpo = arq.length ? tabelaArquivo(arq) : vazio("Nada no arquivo.");
  else corpo = porEtapa(base);
  return `<section class="${UI.card} overflow-hidden"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">${resumo}<div class="flex flex-wrap gap-2">${selFonte("fun-fonte", S.funFonte, "fun-fonte")}${selCamp("fun-camp", S.funCamp, "fun-camp")}</div></div>
    <div class="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">${vistas.map(([k, r, nn]) => chipF(!S.funCel && S.funVista === k, "fun-vista", k, r, nn)).join("")}</div>${corpo}</section>`;
}
function tabelaArquivo(lista) {
  return `<div class="hidden md:block"><table class="min-w-full"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Empresa</th><th class="${UI.th}">Motivo</th><th class="${UI.th}">Concorrente</th><th class="${UI.th}">Fonte</th>${thVend()}</tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${lista.map((c) => `<tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5" data-acao="ir" data-v="#/clientes/${c.id}"><td class="${UI.td}"><a href="#/clientes/${c.id}" class="font-medium text-gray-800 dark:text-white">${esc(c.nome)}</a><span class="ml-2">${c.neg.descartado ? pill("descartado da caixa", COR.cinza) : tipoPill(c)}</span></td>
      <td class="${UI.td}">${esc(c.neg.motivo || "—")}</td><td class="${UI.td}">${esc(c.neg.concorrente || "—")}</td><td class="${UI.td} text-xs">${fonteTxt(c)}</td>${colVend(c)}</tr>`).join("")}</tbody></table></div>
    <ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${lista.map((c) => `<li><a href="#/clientes/${c.id}" class="block px-4 py-3"><span class="text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</span><span class="block text-xs text-gray-500 dark:text-gray-400">${esc(c.neg.motivo || "—")}${c.neg.concorrente ? ` · ${esc(c.neg.concorrente)}` : ""}</span></a></li>`).join("")}</ul>`;
}

// ── Leads: Caixa de entrada · No funil · Ganhos · Perdidos ──
const LEAD_CHIPS = [["caixa", "Caixa de entrada", (c) => naCaixa(c)], ["funil", "No funil", (c) => aberto(c)], ["ganhos", "Ganhos", (c) => c.neg?.etapa === "ganho" || (c.tipo === "cliente" && !!c.eraLead)], ["perdidos", "Perdidos", (c) => c.neg?.etapa === "perdido"]];
const SEGMENTOS = ["Transporte", "Construção", "Indústria", "Varejo", "Agro", "Mineração", "Hospital", "Data center", "Condomínio", "Serviços", "Locação de máquinas", "Comércio", "Saúde", "Concreto"];
// Caixa de entrada = lista + painel de detalhe (Pipedrive Leads Inbox / 3 colunas da V3). Classificar mora no painel.
const semClassificar = (c) => !c.cls || c.cls.vale == null || !c.segmento || !c.neg.litros;
const chipCaixa = (c) => preQualificado(c) ? pill("pré-qualificado", COR.ok) : c.cls?.vale === "nao" ? pill("não vale", COR.cinza) : semClassificar(c) ? pill("sem classificar", COR.aviso) : "";
function linhaCaixa(c, sel, explicito) {
  const p = pessoaPrincipal(c);
  return `<li><button type="button" data-acao="caixa-sel" data-v="${c.id}" class="block w-full border-l-2 px-4 py-2.5 text-left transition-colors ${sel && explicito ? "border-brand-500 bg-brand-25 dark:bg-brand-500/10" : sel ? "border-transparent hover:bg-gray-50 lg:border-brand-500 lg:bg-brand-25 dark:hover:bg-white/[0.03] lg:dark:bg-brand-500/10" : "border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]"}">
    <span class="flex min-w-0 items-center gap-1.5"><span class="min-w-0 flex-1 truncate text-sm font-medium ${sel && explicito ? "text-brand-700 dark:text-brand-300" : sel ? "text-gray-800 lg:text-brand-700 dark:text-white lg:dark:text-brand-300" : "text-gray-800 dark:text-white"}">${esc(c.nome)}</span><span class="shrink-0">${chipCaixa(c)}</span></span>
    <span class="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">${esc(c.cidade)} · ${fonteTxt(c).replace(/<[^>]+>/g, "")}${p?.tel ? ` · ${esc(p.tel)}` : ""}${todasEquipe() ? ` · ${vend(c.dona).curto}` : ""}</span></button></li>`;
}
function painelCaixa(c, l, explicito) {
  const k = c.cls || (c.cls = { vale: null }), ro = sup(), dis = ro ? "disabled" : "", i = l.indexOf(c), campo = `${V.input.replace("w-full ", "")} w-full py-1.5 text-sm`;
  const seg = `<select id="cls-s-${c.id}" data-input="cls" data-v="${c.id}" data-k="segmento" ${dis} class="${campo} ${c.segmento ? "" : "border-warning-300 dark:border-warning-500/50"}"><option value="">escolha…</option>${SEGMENTOS.map((x) => `<option ${c.segmento === x ? "selected" : ""}>${x}</option>`).join("")}</select>`;
  const lit = `<div class="relative"><input id="cls-l-${c.id}" data-input="cls" data-v="${c.id}" data-k="litros" inputmode="numeric" ${dis} value="${c.neg.litros || ""}" placeholder="0" class="${campo} pr-14 text-right ${c.neg.litros ? "" : "border-warning-300 dark:border-warning-500/50"}"><span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">L/mês</span></div>`;
  const seg2 = (acao, atual, ops) => `<div class="${V.segment} w-full flex-nowrap">${ops.map(([v, r, on]) => `<button type="button" data-acao="${acao}" data-v="${c.id}|${v}" ${dis} class="${atual === v ? (on || V.segment_on) : V.segment_off} flex-1 justify-center">${r}</button>`).join("")}</div>`;
  const prod = seg2("cls-prod", c.neg.produto, [["S10", "S10"], ["S500", "S500"]]);
  const vale = seg2("cls-vale", k.vale, [["sim", "vale", "inline-flex cursor-pointer items-center gap-1 rounded-md bg-success-500 px-2.5 py-1 text-xs font-medium text-white shadow-sm"], ["nao", "não vale", "inline-flex cursor-pointer items-center gap-1 rounded-md bg-gray-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm"]]);
  const rot = (t, f) => `<div><label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400" ${f ? `for="${f}"` : ""}>${t}</label>`;
  const nav = (d, icone, r, off) => `<button type="button" data-acao="caixa-nav" data-v="${d}" ${off ? "disabled" : ""} aria-label="${r}" title="${r} (${d < 0 ? "↑" : "↓"})" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">${ic(icone, "h-4 w-4")}</button>`;
  const pessoas = c.pessoas.map((x) => `<li class="flex items-start gap-2.5 py-2">${avatar(x.nome, "h-7 w-7 text-[11px]")}<div class="min-w-0"><p class="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-white">${esc(x.nome)}${papelPill(x)}</p><p class="truncate text-xs text-gray-500 dark:text-gray-400">${[x.tel, x.email].filter(Boolean).map(esc).join(" · ") || "sem contato"}</p></div></li>`).join("") || `<li class="py-2 ${V.muted}">Ninguém cadastrado.</li>`;
  const obs = c.obs ? `<div class="border-t border-gray-100 px-5 py-4 dark:border-gray-800"><p class="${V.section_title}">Observação</p><p class="text-sm text-gray-700 dark:text-gray-200">${esc(c.obs)}</p></div>` : "";
  return `<div class="flex items-center gap-2 border-b border-gray-100 px-5 py-2.5 dark:border-gray-800">
      ${explicito ? `<button type="button" data-acao="caixa-voltar" class="-ml-1 inline-flex items-center gap-1 text-sm text-gray-500 lg:hidden dark:text-gray-400">${ic("esq", "h-4 w-4")}Caixa</button>` : ""}
      <span class="hidden items-center gap-1.5 lg:flex">${nav(-1, "cima", "Lead anterior", i <= 0)}${nav(1, "baixo", "Próximo lead", i >= l.length - 1)}</span><span class="text-xs text-gray-400">${i + 1} de ${l.length}</span>
      <a href="#/clientes/${c.id}" class="ml-auto inline-flex items-center gap-0.5 ${V.link}">Abrir ficha${ic("dir", "h-3 w-3")}</a></div>
    <div class="px-5 pb-4 pt-4"><h3 class="flex flex-wrap items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">${esc(c.nome)}${chipCaixa(c)}</h3>
      <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${esc(c.cidade)} · ${fonteTxt(c)}${c.cnpj ? ` · CNPJ ${c.cnpj}` : ""}${todasEquipe() ? ` · ${vend(c.dona).curto}` : ""}</p></div>
    <div class="border-t border-gray-100 px-5 py-4 dark:border-gray-800"><p class="${V.section_title}">Classificação</p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">${rot("Segmento", "cls-s-" + c.id)}${seg}</div>${rot("Consumo estimado", "cls-l-" + c.id)}${lit}</div>${rot("Produto")}${prod}</div>${rot("Vale contato?")}${vale}</div></div></div>
    <div class="border-t border-gray-100 px-5 py-3 dark:border-gray-800"><p class="${V.section_title} mb-0">Contatos</p><ul class="divide-y divide-gray-100 dark:divide-gray-800">${pessoas}</ul></div>${obs}
    ${ro ? "" : `<div class="flex flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800"><button type="button" data-acao="caixa-agendar" data-v="${c.id}" class="${UI.btnP}">${ic("cal", "h-4 w-4")}Agendar contato</button><button type="button" data-acao="descartar" data-v="${c.id}" class="${UI.btn}">Descartar</button>${i < l.length - 1 ? `<button type="button" data-acao="caixa-nav" data-v="1" class="ml-auto ${V.btn_ghost}">deixar aqui · próximo ›</button>` : ""}</div>`}`;
}
// lista da caixa com os filtros de agora (usada pela tela e pelas setas ↑↓)
function listaCaixa() {
  let l = meus(S.contas).filter(ehLead).filter((c) => passaFiltroFonte(c, S.leadFonte, S.leadCamp)).filter(naCaixa);
  if (S.leadCid) l = l.filter((c) => c.cidade === S.leadCid); if (S.leadSemCls) l = l.filter(semClassificar);
  return l.sort((a, b) => a.nome.localeCompare(b.nome));
}
// lead aberto no painel: o escolhido, ou (se saiu da caixa) o que ficou na mesma posição
function caixaAtual(l) {
  if (!l.length) return null;
  let c = l.find((x) => x.id === S.caixaSel);
  if (!c) { c = l[Math.min(S.caixaIdx, l.length - 1)]; if (S.caixaSel != null) S.caixaSel = c.id; }
  S.caixaIdx = l.indexOf(c); return c;
}
function corpoCaixa(l) {
  if (!l.length) return vazio("Caixa de entrada vazia.");
  const atual = caixaAtual(l), explicito = S.caixaSel != null;
  return `<div class="lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]"><ul class="divide-y divide-gray-100 lg:border-r lg:border-gray-100 dark:divide-gray-800 lg:dark:border-gray-800">${l.map((c) => linhaCaixa(c, c === atual, explicito)).join("")}</ul>
    <div class="${explicito ? "fixed inset-0 z-[1001] overflow-y-auto bg-white dark:bg-gray-900" : "hidden"} lg:static lg:z-auto lg:block lg:overflow-visible lg:bg-transparent lg:dark:bg-transparent"><div class="lg:sticky lg:top-[72px]">${painelCaixa(atual, l, explicito)}</div></div></div>`;
}
function tabelaLeads(lista) {
  const contatoTxt = (c) => { const p = pessoaPrincipal(c); return p ? `<span class="inline-flex items-center gap-1">${esc(p.nome.split(" ")[0])}<span class="text-gray-400">${icCanal(p.prefere === "email" ? "email" : p.prefere === "telefone" ? "telefone" : "whatsapp", "h-3.5 w-3.5")}</span></span>` : "—"; };
  const etapa = (c) => c.tipo === "cliente" ? tipoPill(c) : `${etapaPill(c)}${c.neg.etapa === "ganho" ? " " + tipoPill(c) : ""}`;
  return `<div class="hidden md:block"><table class="w-full"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Empresa</th><th class="${UI.th}">Fonte · campanha</th><th class="${UI.th}">Etapa</th><th class="${UI.th} hidden lg:table-cell">Último</th><th class="${UI.th}">Próximo</th><th class="${UI.th} hidden lg:table-cell">Contato</th>${thVend()}</tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${lista.map((c) => `<tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5" data-acao="ir" data-v="#/clientes/${c.id}"><td class="${UI.td} max-w-[16rem]"><a href="#/clientes/${c.id}" class="block truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</a><span class="block truncate text-xs text-gray-400">${esc(c.cidade)}${movTxt(c) ? " · " + movTxt(c) : ""}</span></td>
      <td class="${UI.td} text-xs">${fonteTxt(c)}</td><td class="${UI.td}"><span class="flex flex-wrap gap-1">${etapa(c)}</span></td><td class="${UI.td} hidden lg:table-cell">${ultTxt(c)}</td><td class="${UI.td} whitespace-nowrap">${c.neg?.etapa === "perdido" ? `<span class="text-xs text-gray-500">${esc(c.neg.motivo)}</span>` : proxTxt(c, true)}</td><td class="${UI.td} hidden text-xs lg:table-cell">${contatoTxt(c)}</td>${colVend(c)}</tr>`).join("")}</tbody></table></div>
    <ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${lista.map((c) => `<li><a href="#/clientes/${c.id}" class="block px-4 py-3"><span class="flex items-center gap-1.5"><span class="truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</span>${etapa(c)}</span><span class="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">${fonteTxt(c)} · ${c.neg?.etapa === "perdido" ? esc(c.neg.motivo) : proxTxt(c, true)}</span></a></li>`).join("")}</ul>`;
}
function telaLeads() {
  const base = meus(S.contas).filter(ehLead).filter((c) => passaFiltroFonte(c, S.leadFonte, S.leadCamp)), chip = LEAD_CHIPS.find(([k]) => k === S.leadChip), caixa = S.leadChip === "caixa";
  const l = caixa ? listaCaixa() : base.filter(chip[2]).sort((a, b) => S.leadChip === "funil" ? ordemProx(a, b) || a.nome.localeCompare(b.nome) : a.nome.localeCompare(b.nome));
  const cidades = [...new Set(base.filter(naCaixa).map((c) => c.cidade))].sort(), sel = `${UI.campo.replace("w-full ", "")} w-auto shrink-0 py-1.5`;
  const botoes = `<button type="button" data-acao="ir" data-v="#/vendas/leads/importar" class="${UI.btn}">${ic("subir", "h-4 w-4")}Importar</button>${sup() ? "" : `<button type="button" data-acao="novo-lead" class="${UI.btnP}">${ic("mais", "h-4 w-4")}Novo lead</button>`}`;
  const filtrosCaixa = caixa ? `<select id="lead-cid" data-input="lead-cid" class="${sel}"><option value="">Cidade: todas</option>${cidades.map((x) => `<option ${S.leadCid === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>
    <label class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" data-acao="lead-semcls" ${S.leadSemCls ? "checked" : ""} class="h-4 w-4 rounded border-gray-300">sem classificar</label>` : "";
  const corpo = caixa ? corpoCaixa(l) : !l.length ? vazio("Nenhum lead aqui.") : tabelaLeads(corta("leads", l, 40)) + verTodos("leads", l.length, 40);
  return `<div class="mb-3 flex flex-wrap items-center justify-between gap-2"><div class="flex flex-wrap gap-1.5">${LEAD_CHIPS.map(([k, r, f]) => chipF(S.leadChip === k, "lead-chip", k, r, base.filter(f).length)).join("")}</div><div class="flex flex-wrap gap-2">${botoes}</div></div>
    <section class="${UI.card} overflow-clip"><div class="flex flex-wrap items-center gap-2 border-b lg:flex-nowrap border-gray-100 px-4 py-2.5 dark:border-gray-800">${selFonte("lead-fonte", S.leadFonte, "lead-fonte").replace("w-auto", "w-auto shrink-0")}${selCamp("lead-camp", S.leadCamp, "lead-camp").replace("w-auto", "w-auto shrink-0")}${filtrosCaixa}<span class="ml-auto shrink-0 whitespace-nowrap pl-2 ${V.muted}">${l.length} ${l.length === 1 ? "lead" : "leads"}</span></div>${corpo}</section>`;
}

function tabelaHora(lista) {
  const grupos = ["pronto", "esfriando", "inativo"].map((g) => [g, lista.filter((c) => recompra(c) === g).sort((a, b) => diasAtras(b.bi.ultimo) / b.bi.ciclo - diasAtras(a.bi.ultimo) / a.bi.ciclo)]).filter(([, l]) => l.length);
  const acoes = (c) => sup() ? "" : `<span class="flex items-center justify-end gap-1.5">${pessoaPrincipal(c)?.tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" class="${UI.btnSm}">${ic("fone", "h-3.5 w-3.5")}Ligar</button>` : ""}${waDrop(c, UI.btnSm)}
    ${c.prox ? `<span class="text-xs text-gray-500 dark:text-gray-400">agendado ${rotProx(c.prox)}</span>` : `<button type="button" data-acao="agendar" data-v="${c.id}" class="${UI.btnPSm}">${ic("cal", "h-3.5 w-3.5")}Agendar</button>`}</span>`;
  const tab = `<div class="hidden md:block"><table class="min-w-full"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Cliente</th><th class="${UI.th} text-right">Sem comprar</th><th class="${UI.th} text-right">Intervalo médio</th><th class="${UI.th} hidden text-right lg:table-cell">L/mês</th>${sup() ? `<th class="${UI.th}">Dona</th>` : ""}<th class="${UI.th}"></th></tr></thead>
    <tbody>${grupos.map(([g, l]) => `<tr class="bg-gray-50 dark:bg-white/[0.02]"><td colspan="6" class="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">${RECOMPRA[g][0]} · ${l.length} <span class="font-normal normal-case tracking-normal text-gray-400">— ${RECOMPRA[g][1]}</span></td></tr>
      ${l.map((c) => `<tr class="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5" data-acao="ir" data-v="#/clientes/${c.id}"><td class="${UI.td}"><a href="#/clientes/${c.id}" class="font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</a><span class="block text-xs text-gray-400">${esc(c.cidade)} · última ${dm(c.bi.ultimo)}${c.neg && aberto(c) ? ` · negócio em ${c.neg.etapa}` : ""}</span></td>
        <td class="${UI.td} whitespace-nowrap text-right font-semibold ${g === "pronto" ? "text-brand-600 dark:text-brand-400" : g === "esfriando" ? "text-warning-600 dark:text-warning-400" : "text-error-600 dark:text-error-400"}">${diasAtras(c.bi.ultimo)} d</td><td class="${UI.td} whitespace-nowrap text-right">a cada ${c.bi.ciclo} d</td>
        <td class="${UI.td} hidden whitespace-nowrap text-right lg:table-cell">${litros(c.bi.consumo)}</td>${sup() ? `<td class="${UI.td}">${donaTxt(c.dona)}</td>` : ""}<td class="${UI.td}">${acoes(c)}</td></tr>`).join("")}`).join("")}</tbody></table></div>`;
  const cards = `<div class="md:hidden">${grupos.map(([g, l]) => `<p class="bg-gray-50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">${RECOMPRA[g][0]} · ${l.length}</p><ul class="divide-y divide-gray-100 dark:divide-gray-800">${l.map((c) => `<li class="px-4 py-3">
      <a href="#/clientes/${c.id}" class="flex items-center justify-between gap-2"><span class="truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</span><span class="shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-200">${diasAtras(c.bi.ultimo)} d <span class="font-normal text-gray-400">/ ${c.bi.ciclo} d</span></span></a>
      <div class="mt-2 flex justify-end">${acoes(c)}</div></li>`).join("")}</ul>`).join("")}</div>`;
  return grupos.length ? tab + cards + `<p class="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400 dark:border-gray-800">Derivado do BI (a lista de /oportunidades do rep dela). Não cria registro: Agendar é que põe na agenda.</p>` : vazio("Ninguém na hora de chamar.");
}
// ── Ficha do cliente (= Conta do Salesforce, 3 colunas) ─────────────────────
const ABAS = [["atividade", "Atividade"], ["pedidos", "Pedidos"], ["propostas", "Propostas"], ["credito", "Crédito"], ["pasta", "Pasta"], ["cadastro", "Cadastro"]];
const MOD_NOME = { pedidos: "Pedidos", propostas: "Propostas", credito: "Crédito", pasta: "Pasta do cliente", cadastro: "Ficha BI", reativacao: "Reativação", cobranca: "Cobrança", comodato: "Comodato" };
const abrirEm = (m, c) => `<button type="button" data-acao="modulo" data-v="${m}" data-conta="${c.id}" class="inline-flex items-center gap-1 text-sm ${UI.link}">abrir em ${MOD_NOME[m]} ${ic("externo", "h-3.5 w-3.5")}</button>`;
const embedTopo = (mod, c, botao = "") => `<div class="mb-3 flex flex-wrap items-center justify-between gap-2"><p class="${V.muted}">${MOD_NOME[mod]} · <span class="font-medium text-gray-700 dark:text-gray-200">filtrado por ${esc(c.nome)}</span> <span class="ml-1 rounded border border-dashed border-gray-300 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-400 dark:border-gray-600">tela que já existe</span></p><div class="flex items-center gap-3">${botao}${abrirEm(mod, c)}</div></div>`;
function propostasDe(c) {
  const ps = [];
  [...c.eventos].reverse().forEach((e) => { const m = /Proposta #(\d+)/.exec(e.memo || e.sistema || ""); if (m && !ps.some((p) => p.n === m[1])) ps.push({ n: m[1], d: e.d, canal: e.canal || "email", texto: (e.memo || e.sistema).replace(/^Proposta #\d+\s*(enviada|gerada e enviada)?:?\s*/i, "") }); });
  ps.forEach((p) => { p.respondida = c.eventos.some((e) => e.dir === "cliente" && e.d >= p.d && e.res); });
  return ps.reverse();
}
function abaConteudo(c) {
  const ehCli = c.tipo === "cliente";
  switch (S.aba) {
    case "pedidos": {
      const ns = notasBI(c), peds = ehCli ? [{ n: 1287, d: HOJE, litros: c.neg?.litros ? 6000 : 5000, st: ["anotado", COR.aviso] }, ...ns.map((x, i) => ({ n: 1270 - i * 9, d: x.d, litros: x.litros, st: ["faturado", COR.ok], nf: x.nf }))] : [];
      return embedTopo("pedidos", c, ehCli && !sup() ? `<button type="button" data-acao="modulo" data-v="pedidos" data-conta="${c.id}" class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}Anotar pedido</button>` : "")
        + (peds.length ? `<ul class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${peds.map((p) => `<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm"><span class="font-mono text-xs text-gray-400">#${p.n}</span><span class="font-medium text-gray-800 dark:text-white">${litros(p.litros)} ${c.produto}</span><span class="text-xs text-gray-500 dark:text-gray-400">${rotData(p.d)}${p.nf ? ` · NF ${p.nf}` : ""}</span><span class="ml-auto">${pill(p.st[0], p.st[1])}</span></li>`).join("")}</ul>`
          : `<p class="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Lead não tem pedido no GESCOR ainda: "Anotar pedido" (mais ▾) marca o negócio como Ganho e pede o cadastro.</p>`);
    }
    case "propostas": {
      const ps = propostasDe(c);
      return embedTopo("propostas", c, sup() ? "" : `<button type="button" data-acao="modulo" data-v="propostas" data-conta="${c.id}" class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}Nova proposta</button>`)
        + (ps.length ? `<ul class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${ps.map((p) => `<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm"><span class="font-semibold text-gray-800 dark:text-white">#${p.n}</span><span class="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400">${rotData(p.d)} · ${CANAL[p.canal].nome} · ${esc(p.texto) || "PDF comercial"}</span>${p.respondida ? pill("respondida", COR.brand) : pill("sem resposta", COR.aviso)}<button type="button" data-acao="mock" data-v="Abre o PDF da proposta #${p.n}." class="${UI.btnSm}">PDF</button></li>`).join("")}</ul>` : `<p class="${UI.muted}">Nenhuma proposta ainda.</p>`);
    }
    case "credito":
      return embedTopo("credito", c) + (ehCli ? `<div class="grid grid-cols-1 gap-3 sm:grid-cols-3"><div class="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><p class="text-xs text-gray-500 dark:text-gray-400">Limite (GESCOR)</p><p class="text-lg font-bold text-gray-800 dark:text-white">${reais(c.bi.limite).replace(",00", "")}</p></div>
          <div class="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><p class="text-xs text-gray-500 dark:text-gray-400">Última análise</p><p class="text-sm font-semibold text-gray-800 dark:text-white">#${170 + c.id} · ${dm("2026-08-12")}</p><p class="mt-0.5">${pill("Aprovado", COR.ok)}</p></div>
          <div class="rounded-xl border p-3 ${c.bi.vencidos ? "border-error-200 dark:border-error-800" : "border-gray-200 dark:border-gray-800"}"><p class="text-xs text-gray-500 dark:text-gray-400">Vencidos</p><p class="text-lg font-bold ${c.bi.vencidos ? "text-error-600 dark:text-error-400" : "text-success-600 dark:text-success-400"}">${c.bi.vencidos ? reais(c.bi.vencidos) : "Em dia"}</p></div></div>`
        : `<div class="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700"><p class="text-sm text-gray-700 dark:text-gray-200">Nenhuma análise pra este CNPJ.</p><p class="mt-1 ${UI.muted}">A análise (Serasa + InfoSimples + Direct Data) nasce com o CNPJ da ficha.</p>${sup() ? "" : `<button type="button" data-acao="pedir-credito" data-v="${c.id}" class="mt-3 ${UI.btnSm}">Pedir análise de crédito</button>`}</div>`);
    case "pasta": {
      if (!ehCli) return embedTopo("pasta", c) + `<div class="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">${ic("pasta", "inline h-4 w-4")} A Pasta do cliente (#950) fica disponível quando virar cliente no GESCOR.</div>`;
      const docs = ehCli ? [["Contrato social.pdf", "2026-03-02"], ["Cartão CNPJ.pdf", "2026-03-02"], ...(c.bi.tanques ? [["Contrato de comodato (D4Sign).pdf", "2025-11-18"]] : []), ["Ficha cadastral GESCOR.pdf", `${c.bi.desde}-02-10`]] : [];
      return embedTopo("pasta", c, sup() ? "" : `<button type="button" data-acao="mock" data-v="Enviar arquivo pra Pasta do cliente." class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}Arquivo</button>`)
        + `<ul class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${docs.map(([n, d]) => `<li class="flex items-center gap-3 px-3 py-2.5 text-sm"><span class="text-gray-400">${ic("doc", "h-4 w-4")}</span><span class="min-w-0 flex-1 truncate text-gray-800 dark:text-gray-100">${n}</span><span class="text-xs text-gray-400">${dm(d)}/${d.slice(2, 4)}</span></li>`).join("")}</ul>`;
    }
    case "cadastro": {
      const pp = pessoaPrincipal(c);
      const linhas = [["Razão social", c.razao], ["CNPJ", c.cnpj], ["Cidade", c.cidade], ["Endereço", c.endereco || `(endereço da Receita) — ${c.cidade}/SP`], ["Segmento", c.segmento],
        ...(ehCli ? [["Rota", c.id % 2 ? "Rota Oeste" : "Rota Capital"], ["Representante", `${vend(c.dona).nome} (0412)`], ["Condição", precoAcordado(c).cond], ["Cliente desde", String(c.bi.desde)]] : [["Situação", c.gescor ? "aguardando cadastro no GESCOR" : "lead — fora do GESCOR"]]), ["Contato principal", pp ? `${pp.nome} · ${pp.tel || pp.email}` : "—"]];
      return embedTopo("cadastro", c) + `<dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${linhas.map(([k, v]) => `<div class="grid grid-cols-[8rem_minmax(0,1fr)] gap-2 px-3 py-2 text-sm"><dt class="text-gray-500 dark:text-gray-400">${k}</dt><dd class="break-words text-gray-800 dark:text-gray-100">${esc(v || "—")}</dd></div>`).join("")}</dl>`;
    }
    default:
      return `${sup() ? "" : `<div class="mb-3 flex justify-end"><button type="button" data-acao="registrar" data-v="${c.id}" title="WhatsApp e e-mail entram sozinhos (da V3); na mão, só telefone e reunião" class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}Registrar contato</button></div>`}${atividade(c)}`;
  }
}
// ── Ficha (lead e cliente): topo com chips/fonte/botões · Pessoas · Informações · Frequência · Path · abas · coluna direita ──
const FROTA = { Transporte: "frota de caminhões", Construção: "máquinas no canteiro", Hospital: "gerador", "Data center": "geradores", Indústria: "caldeira / empilhadeiras", Varejo: "geradores das lojas", Mineração: "escavadeiras e caminhões", Frigorífico: "câmaras frias + caminhões", Guindastes: "guindastes", Agro: "tratores", Concreto: "betoneiras e usina", Asfalto: "usina de asfalto", Serviços: "caldeira", "Locação de máquinas": "máquinas locadas", Condomínio: "geradores" };
const botaoTopo = "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5";
function telaCliente(id) {
  const c = conta(id);
  if (!c || !escopo().includes(c.dona)) return `<div class="${UI.card}">${vazio("Ficha não encontrada (ou não é da sua carteira).")}</div>`;
  const ehCli = c.tipo === "cliente", n = c.neg, ro = sup(), cx = naCaixa(c), p = pessoaPrincipal(c);
  // topo
  const chips = [tipoPill(c), n && !cx && n.etapa !== "ganho" ? etapaPill(c) : "", movPill(c), cx ? pill("na caixa de entrada", COR_ETAPA.caixa) : "", preQualificado(c) ? pill("pré-qualificado", COR.ok) : "",
    ehLead(c) ? pill(`fonte: ${fonteTxt(c).replace(/<[^>]+>/g, "")}`, COR.cinza) : n?.campanha ? pill(`campanha: ${esc(campanha(n.campanha).nome)}`, COR.cinza) : "",
    n && (aberto(c) || cx) ? pill(`no funil há ${noFunilHa(c)} d`, COR.cinza) : "", ro ? pill(vend(c.dona).curto, COR.cinza) : ""].join("");
  const mais = drop(`mais:${c.id}`, `${ic("pontos", "h-4 w-4")}<span class="hidden sm:inline">mais</span>`, botaoTopo, [["email", c.id, "E-mail", "só formaliza proposta"], ["proposta-app", c.id, "Proposta", "gera o PDF comercial · move pra Proposta"], ["pedir-credito", c.id, "Pedir crédito", ""], ["pedido-app", c.id, "Anotar pedido", ehCli ? "Pedidos internos" : "move pra Ganho"], ["gescor", c.id, "Ficha pra GESCOR", ""]]);
  const botoes = ro ? "" : `<div class="flex flex-wrap items-center gap-2">${p?.tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" class="${UI.btnP}">${ic("fone", "h-4 w-4")}Ligar</button>` : ""}${waDrop(c, botaoTopo, "right-0", `${icWa("h-4 w-4")}WhatsApp`)}
    <button type="button" data-acao="registrar" data-v="${c.id}" class="${botaoTopo}">${ic("doc", "h-4 w-4")}Registrar</button>${mais}</div>`;
  const topo = `<div class="${UI.card} mb-4 p-4"><a href="#/vendas/${cx || c.tipo === "prospect" && !aberto(c) ? "leads" : "funil"}" class="mb-1 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-500 dark:text-gray-400">${ic("esq", "h-3.5 w-3.5")}${cx ? "Leads" : "Funil"}</a>
    <div class="flex flex-wrap items-start justify-between gap-3"><div class="min-w-0"><h1 class="text-xl font-semibold text-gray-800 dark:text-white">${esc(c.nome)}</h1><p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${esc(c.razao)} · CNPJ ${c.cnpj} · ${esc(c.cidade)}</p>
      <div class="mt-2 flex flex-wrap gap-1.5">${chips}</div></div>${botoes}</div></div>`;
  // esquerda: Pessoas · Informações · Frequência
  const pessoas = `<div class="${UI.card} overflow-hidden">${cardTopo(`Pessoas <span class="${UI.badge}">${c.pessoas.length}</span>`, ro ? "" : `<button type="button" data-acao="pessoa" data-v="${c.id}" class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}pessoa</button>`)}
    <ul class="divide-y divide-gray-100 dark:divide-gray-800">${c.pessoas.map((x) => `<li class="px-4 py-2.5"><p class="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-white">${esc(x.nome)}${papelPill(x)}${x.principal ? pill("principal", COR.brand) : ""}</p>
      <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400">${x.tel ? `<span>${esc(x.tel)}</span>` : ""}${x.email ? `<span class="truncate">${esc(x.email)}</span>` : ""}<span class="inline-flex items-center gap-1 text-gray-400">prefere ${icCanal(x.prefere === "email" ? "email" : x.prefere === "telefone" ? "telefone" : "whatsapp", "h-3 w-3")}</span></p></li>`).join("") || `<li class="px-4 py-3 ${UI.muted}">Ninguém cadastrado.</li>`}</ul>
    <p class="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-800">${ehCli ? "contatos do GESCOR + WhatsApp da V3" : "contatos do lead"}</p></div>`;
  const info = [["Segmento", c.segmento || "—"], ["Frota / equip.", FROTA[c.segmento] || "—"], ["Consumo est.", litrosDe(c) ? `${litros(litrosDe(c))}/mês` : "—"], ["Produto", n?.produto || c.produto], ["Comodato", n?.comodato ? "quer tanque" : ehCli && c.bi.tanques ? `${c.bi.tanques} tanque(s)` : "não"],
    ["Concorrente", n?.concorrente || "—"], ["Fonte", ehLead(c) ? fonteTxt(c) : "carteira (BI)"], ["Campanha", n?.campanha ? esc(campanha(n.campanha).nome) : "—"], ["Observações", n?.visitaNota || c.obs || "—"]];
  const informacoes = `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Informações</h4><dl>${info.map(([k, v]) => `<div class="${V.dl_row}"><dt class="${V.dt}">${k}</dt><dd class="${V.dd}">${v}</dd></div>`).join("")}</dl></div>`;
  const tile = (v, r) => `<div class="rounded-xl border border-gray-200 p-2.5 dark:border-gray-800"><p class="text-sm font-bold text-gray-800 dark:text-white">${v}</p><p class="text-[11px] text-gray-500 dark:text-gray-400">${r}</p></div>`;
  const freq = ehCli ? `<p class="text-sm text-gray-700 dark:text-gray-200">compra a cada <b>${c.bi.ciclo} d</b> · última <b>${dm(c.bi.ultimo)}</b> · próxima <b>~${dm(somaDias(c.bi.ultimo, c.bi.ciclo))}</b></p>${recompra(c) ? `<p class="mt-1">${pill(RECOMPRA[recompra(c)][0], recompra(c) === "pronto" ? COR.brand : recompra(c) === "esfriando" ? COR.aviso : COR.erro)}</p>` : ""}
      <div class="mt-3 grid grid-cols-2 gap-2">${tile(litros(c.bi.l12), "12 meses")}${tile(reaisK(c.bi.r12), "faturado 12 m")}</div>`
    : S.editPrev && !ro ? `<label for="prev-nec" class="text-sm text-gray-700 dark:text-gray-200">Previsão de necessidade</label><div class="mt-1 flex items-center gap-2"><input type="month" id="prev-nec" data-input="prev-nec" data-v="${c.id}" value="${n?.previsaoNec || ""}" class="${UI.campo} py-1.5"><button type="button" data-acao="prev-editar" class="${V.btn_ghost}">cancelar</button></div>`
    : `<div class="flex items-baseline justify-between gap-2"><p class="text-sm text-gray-700 dark:text-gray-200" title="Quando ele vai precisar de diesel. No Qualificado, faz as vezes do próximo: volta como sugestão no mês.">Previsão de necessidade: <b class="font-semibold text-gray-800 dark:text-white">${n?.previsaoNec ? mesTxt(n.previsaoNec) : "—"}</b></p>${ro ? "" : `<button type="button" data-acao="prev-editar" class="shrink-0 ${V.link}">${n?.previsaoNec ? "editar" : "definir"}</button>`}</div>`;
  const frequencia = `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Frequência</h4>${freq}</div>`;
  const esq = `<div class="space-y-4">${pessoas}${informacoes}${frequencia}</div>`;
  // centro
  let negBox;
  if (cx) negBox = `<div class="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700"><p class="text-sm font-semibold text-gray-800 dark:text-white">Na caixa de entrada · ainda fora do funil</p><p class="mt-1 ${UI.muted}">Classifique em Leads › Caixa de entrada ou decida aqui.</p>
    ${ro ? "" : `<div class="mt-3 flex flex-wrap gap-2"><button type="button" data-acao="caixa-agendar" data-v="${c.id}" class="${UI.btnP}">${ic("cal", "h-4 w-4")}Agendar contato</button><button type="button" data-acao="descartar" data-v="${c.id}" class="${UI.btn}">Descartar</button></div>`}</div>`;
  else if (ehCli && !n) negBox = `<div><p class="${UI.secao}">Cliente da carteira · sem negócio aberto</p><p class="mt-1 text-sm text-gray-700 dark:text-gray-200">Vive do ciclo de recompra: compra a cada <b>${c.bi.ciclo} d</b>, última <b>${dm(c.bi.ultimo)}</b>.</p>
    ${ro ? "" : `<div class="mt-3 flex flex-wrap gap-2"><button type="button" data-acao="agendar" data-v="${c.id}" class="${UI.btnP}">${ic("cal", "h-4 w-4")}${c.prox ? "Reagendar" : "Agendar"}</button><button type="button" data-acao="abrir-negocio" data-v="${c.id}" class="${UI.btn}">${ic("mais", "h-4 w-4")}Negócio</button></div>`}
    <p class="mt-2 text-xs text-gray-400">O Path aparece quando abrir um negócio (obra, filial, comodato, reativação).</p></div>`;
  else {
    const linha = `<p class="text-sm text-gray-700 dark:text-gray-200"><span class="font-semibold text-gray-800 dark:text-white">${litros(n.litros)}/mês</span> · ${n.produto}${n.comodato ? " · comodato" : ""}${n.previsao ? ` · prev. fechamento ${dm(n.previsao)}` : ""}${n.concorrente ? ` · hoje com ${esc(n.concorrente)}` : ""}</p>
      ${n.mov ? `<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${ETAPA_NOME[n.etapa]} · ${movTxt(c)}</p>` : ""}
      ${n.etapa === "perdido" ? `<p class="mt-1 text-sm text-error-600 dark:text-error-400">Perdido · ${esc(n.motivo)}${n.concorrente ? ` · ficou com ${esc(n.concorrente)}` : ""}</p>${ro ? "" : `<button type="button" data-acao="abrir-negocio" data-v="${c.id}" class="${UI.btn} mt-3">${ic("mais", "h-4 w-4")}Novo negócio</button>`}` : ""}
      ${n.etapa === "ganho" && c.tipo === "prospect" ? `<div class="mt-3 rounded-xl border border-warning-200 bg-warning-50 p-3 dark:border-warning-500/30 dark:bg-warning-500/10"><p class="text-sm font-semibold text-warning-800 dark:text-warning-300">Ganho · Aguardando GESCOR</p>
        <p class="mt-0.5 text-xs text-warning-700 dark:text-warning-400">${c.gescorSolicitado ? `cadastro pedido ${rotData(c.gescorSolicitado)} · o checker roda ao fim de cada sync do BI` : "Quando o cadastro aparecer no BI (CNPJ ou telefone), vira Cliente sozinho e o negócio vai junto."}</p>
        ${ro ? "" : `<div class="mt-2 flex flex-wrap gap-2"><button type="button" data-acao="ja-cadastrei" data-v="${c.id}" class="${UI.btnPSm}" ${S.checando === c.id ? "disabled" : ""}>${S.checando === c.id ? `<span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>procurando no BI…` : "Já cadastrei no GESCOR"}</button><button type="button" data-acao="gescor" data-v="${c.id}" class="${UI.btnSm}">Ficha pra GESCOR</button></div>`}</div>` : ""}
      ${n.etapa === "ganho" && c.tipo === "cliente" ? `<p class="mt-1 text-sm text-success-700 dark:text-success-400">Ganho · já é Cliente no GESCOR${n.ganhoEm ? ` (${rotData(n.ganhoEm)})` : ""}</p>` : ""}`;
    const visita = aberto(c) ? `<div class="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"><label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"><input type="checkbox" data-acao="visita" data-v="${c.id}" ${n.visita ? "checked" : ""} ${ro ? "disabled" : ""} class="h-4 w-4 rounded border-gray-300">Solicitar visita${n.visitaFeita ? ` ${pill("atendida", COR.ok)}` : ""}</label>
      ${n.visita ? `<textarea id="visita-nota" data-input="visita-nota" data-v="${c.id}" rows="2" placeholder="O que o vendedor externo precisa ver?" class="${UI.campo} mt-2" ${ro ? "disabled" : ""}>${esc(n.visitaNota)}</textarea><p class="mt-1 text-xs text-gray-400">Aparece em Equipe › Visitas pedidas (supervisor).</p>` : ""}</div>` : "";
    negBox = `${pathEtapas(c)}${aberto(c) && !ro ? `<p class="mt-1.5 text-[11px] text-gray-400" title="As fases também andam sozinhas pela V3, proposta e GESCOR">clique numa etapa pra registrar o resultado</p>` : ""}<div class="mt-3">${linha}</div>${visita}`;
  }
  const abas = `<div class="no-scrollbar flex gap-0.5 overflow-x-auto border-b border-gray-200 px-1.5 dark:border-gray-800">${ABAS.map(([k, r]) => `<button type="button" data-acao="aba" data-v="${k}" class="shrink-0 whitespace-nowrap border-b-2 px-2 py-2.5 text-[13px] font-medium transition-colors ${S.aba === k ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}">${r}</button>`).join("")}</div>`;
  const centro = `<div class="space-y-4"><div class="${UI.card} p-4">${negBox}</div><div class="${UI.card} overflow-hidden">${abas}<div class="p-4">${abaConteudo(c)}</div></div></div>`;
  // direita
  const abertas = convDaConta(c).filter((v) => !v.fechada), bi = c.bi, ns = notasBI(c);
  const dir = `<div class="space-y-4">${cartaoProximo(c)}
    <div class="${UI.card} p-4"><h4 class="${V.section_title}">Em aberto na V3</h4>${abertas.length ? `<ul class="space-y-1.5">${abertas.map((v) => `<li><a href="#/conversas/${v.id}" class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5"><span class="text-gray-400">${v.canal === "email" ? ic("mail", "h-3.5 w-3.5") : icWa("h-3.5 w-3.5")}</span><span class="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-200">${esc(v.assunto || v.nome)}</span>${v.naoLidas ? `<span class="rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">${v.naoLidas}</span>` : ""}</a></li>`).join("")}</ul>` : `<p class="${V.muted}">Nenhum atendimento aberto.</p>`}</div>
    ${ehCli ? `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Comodato · próxima entrega</h4>${bi.comodatoEquip.length ? `<ul class="space-y-1 text-xs">${bi.comodatoEquip.map((e) => `<li class="flex items-center gap-2 text-gray-700 dark:text-gray-200">${ic("tanque", "h-3.5 w-3.5 text-gray-400")}<span class="truncate">${esc(e)}</span></li>`).join("")}</ul>` : `<p class="${V.muted}">Sem comodato.</p>`}
      <p class="mt-2 border-t border-gray-100 pt-2 text-xs dark:border-gray-800">${bi.proxEntrega ? `${ic("caminhao", "inline h-3.5 w-3.5 text-gray-400")} <span class="font-medium text-gray-800 dark:text-white">${rotData(bi.proxEntrega.d)}</span> · ${litros(bi.proxEntrega.litros)} · ${bi.proxEntrega.rota}` : `<span class="text-gray-400">Nenhuma entrega programada.</span>`}</p></div>
    <div class="${UI.card} p-4"><div class="flex items-center justify-between"><h4 class="${V.section_title}">Últimas notas</h4><button type="button" data-acao="mock" data-v="Notas e boletos: o modal da V3." class="${V.link} mb-2">Todas ›</button></div><ul class="space-y-1.5 text-xs">${ns.map((x) => `<li class="flex justify-between gap-2 text-gray-700 dark:text-gray-200"><span>NF ${x.nf} · ${dm(x.d)}</span><span class="text-gray-500 dark:text-gray-400">${litros(x.litros)} · ${reaisK(x.valor)}</span></li>`).join("")}</ul></div>` : ""}</div>`;
  return topo + `<div class="grid grid-cols-1 gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_16rem] xl:grid-cols-[17rem_minmax(0,1fr)_18rem] 2xl:grid-cols-[19rem_minmax(0,1fr)_20rem]"><div class="order-2 lg:order-1">${esq}</div><div class="order-3 min-w-0 lg:order-2">${centro}</div><div class="order-1 lg:order-3">${dir}</div></div>`;
}
