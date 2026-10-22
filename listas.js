// ── Prospects (abas = situações = o funil) e Clientes (carteira do BI) — SPEC_V5 §3, §4 ──
// Toda linha tem o controle do próximo contato: com data → "agendado · sex 23/10 · ela" + Reagendar ▾; sem data → [Hoje] [Amanhã] [Outro dia ▾].
const colVend = (c) => todasEquipe() ? `<td class="px-4 py-2">${donaTxt(c.dona)}</td>` : "";
const thVend = (w = "w-32") => todasEquipe() ? `<th class="${UI.th} ${w}">Vendedora</th>` : "";
const selCss = () => `${UI.campo.replace("w-full ", "")} w-auto shrink-0 py-1.5`;
const ultTxt = (c) => { const u = ultimoContato(c); return u ? `<span class="inline-flex items-center gap-1 whitespace-nowrap">${rotData(u.d)}<span class="text-gray-400">${icCanal(u.canal, "h-3.5 w-3.5")}</span></span>` : `<span class="text-gray-400">—</span>`; };
// ícones de canal: no hover (desktop), sempre no celular
function iconesLinha(c, chave) {
  if (sup()) return "";
  const p = pessoaPrincipal(c);
  return `${p?.tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" title="Ligar" aria-label="Ligar" class="${icBtn}">${ic("fone", "h-4 w-4")}</button>` : ""}${waDrop(c, `${icBtn}" title="WhatsApp" aria-label="WhatsApp`, "right-0", icWa("h-4 w-4"), `wai:${chave}:${c.id}`, false)}`;
}
const hoverIcones = (c, chave) => { const ab = S.drop && S.drop.endsWith(`:${chave}:${c.id}`); return `<span class="flex items-center justify-end ${ab ? "" : "md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"}">${iconesLinha(c, chave)}</span>`; };
const nomeCel = (c, extra = "") => `<a href="#/fichas/${c.id}" title="${esc(c.nome)}" class="block truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</a><span class="flex min-w-0 items-center gap-1.5"><span class="truncate text-xs text-gray-400">${esc(c.cidade)}</span>${extra}</span>`;
const linhaFlash = (c) => S.flash === c.id ? "bg-brand-25 dark:bg-brand-500/10" : "";

// ── Prospects ──
const ABAS_PROSP = [["novos", "Novos", (c) => c.sit === "novo"], ["contato", "Em contato", (c) => c.sit === "contato"], ["proposta", "Proposta", (c) => c.sit === "proposta"], ["descartados", "Descartados", (c) => c.sit === "descartado"]];
const prospectsBase = () => meus(S.contas).filter(ehProspect).filter((c) => (!S.pFonte || c.fonte === S.pFonte || campanha(c.camp)?.fonte === S.pFonte) && (!S.pCamp || c.camp === S.pCamp));
const ordemProspect = (a, b) => (a.prox?.d || "9999") .localeCompare(b.prox?.d || "9999") || (a.prox?.h || "99").localeCompare(b.prox?.h || "99") || a.nome.localeCompare(b.nome);
function propTxt(c) {
  if (!c.prop) return `<span class="text-gray-400">—</span>`;
  return `<span class="whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">#${c.prop.n} <span class="text-xs text-gray-400">· ${dm(c.prop.d)}</span></span>${c.prop.vista ? `<span class="block text-xs text-success-600 dark:text-success-400">visualizada</span>` : `<span class="block text-xs text-gray-400">${uteisEntre(c.prop.d, HOJE)} ${uteisEntre(c.prop.d, HOJE) === 1 ? "d útil" : "d úteis"}</span>`}`;
}
function tabelaProspects(l, aba) {
  const ch = aba;
  if (aba === "descartados") {
    const tab = `<table class="hidden w-full table-fixed md:table"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Empresa</th><th class="${UI.th} w-44">Motivo</th><th class="${UI.th} w-36">Concorrente</th><th class="${UI.th} w-28">Quando</th>${thVend()}<th class="w-28"></th></tr></thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${l.map((c) => `<tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5" data-acao="ir" data-v="#/fichas/${c.id}"><td class="px-4 py-2 text-sm">${nomeCel(c)}</td><td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">${motivoTxt(c.desc?.motivo)}</td><td class="truncate px-4 py-2 text-sm text-gray-700 dark:text-gray-300">${esc(c.perdas?.[0]?.conc || "—")}</td><td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">${rotData(c.desc?.d)}</td>${colVend(c)}<td class="px-3 py-2 text-right">${proxCtl(c)}</td></tr>`).join("")}</tbody></table>`;
    const cards = `<ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${l.map((c) => `<li class="flex items-center gap-3 px-4 py-2.5"><div class="min-w-0 flex-1"><a href="#/fichas/${c.id}" class="block truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</a><p class="truncate text-xs text-gray-500 dark:text-gray-400">${motivoTxt(c.desc?.motivo)}${c.perdas?.[0]?.conc ? ` · ${esc(c.perdas[0].conc)}` : ""} · ${rotData(c.desc?.d)}</p></div>${proxCtl(c)}</li>`).join("")}</ul>`;
    return tab + cards;
  }
  const meio = aba === "proposta" ? `<th class="${UI.th} w-32">Proposta</th>` : `<th class="${UI.th} w-36">Fonte</th><th class="${UI.th} hidden w-32 xl:table-cell">Último contato</th>`;
  const tab = `<table class="hidden w-full table-fixed md:table"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Empresa</th>${meio}<th class="${UI.th} w-[17rem]">Próximo</th><th class="${UI.th} w-20 text-right">L/mês</th>${thVend()}<th class="w-20"><span class="sr-only">Canais</span></th></tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${l.map((c) => `<tr class="group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${linhaFlash(c)}" data-acao="ir" data-v="#/fichas/${c.id}">
      <td class="px-4 py-2 text-sm">${nomeCel(c, perdeuPill(c))}</td>
      ${aba === "proposta" ? `<td class="px-4 py-2">${propTxt(c)}</td>` : `<td class="truncate px-4 py-2 text-xs text-gray-600 dark:text-gray-300" title="${esc(fonteTxt(c).replace(/<[^>]+>/g, ""))}">${fonteTxt(c, true)}</td><td class="hidden px-4 py-2 text-sm text-gray-700 xl:table-cell dark:text-gray-300">${ultTxt(c)}</td>`}
      <td class="px-4 py-2">${proxCtl(c, "", ch)}</td><td class="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">${c.litros ? num(c.litros) : "—"}</td>${colVend(c)}<td class="py-1.5 pl-1 pr-3">${hoverIcones(c, ch)}</td></tr>`).join("")}</tbody></table>`;
  const cards = `<ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${l.map((c) => `<li class="px-4 py-2.5 ${linhaFlash(c)}"><div class="flex items-center gap-2"><a href="#/fichas/${c.id}" class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</a>${perdeuPill(c)}<span class="flex shrink-0 items-center">${iconesLinha(c, ch + "m")}</span></div>
    <p class="truncate text-xs text-gray-500 dark:text-gray-400">${esc(c.cidade)} · ${aba === "proposta" && c.prop ? `#${c.prop.n} · ${dm(c.prop.d)}${c.prop.vista ? " · visualizada" : ""}` : fonteTxt(c, true)}${c.litros ? ` · ${num(c.litros)} L` : ""}${todasEquipe() ? ` · ${vend(c.dona).curto}` : ""}</p><div class="mt-1.5">${proxCtl(c, "", ch + "m")}</div></li>`).join("")}</ul>`;
  return tab + cards;
}
function telaProspects() {
  const base = prospectsBase(), aba = ABAS_PROSP.find(([k]) => k === S.pAba) || ABAS_PROSP[0], [k, , f] = aba;
  const l = base.filter(f).sort(k === "descartados" ? (a, b) => (b.desc?.d || "").localeCompare(a.desc?.d || "") : ordemProspect);
  const sel = (id, val, ops, rot) => `<select id="${id}" data-input="${id}" class="${selCss()}"><option value="">${rot}</option>${ops.map(([v, r]) => `<option value="${v}" ${val === v ? "selected" : ""}>${r}</option>`).join("")}</select>`;
  const botoes = sup() ? "" : `<a href="#/vendas/prospects/importar" class="${UI.btnSm} py-1.5">${ic("subir", "h-3.5 w-3.5")}Importar</a><button type="button" data-acao="novo-prospect" class="${UI.btnPSm} py-1.5">${ic("mais", "h-3.5 w-3.5")}Novo prospect</button>`;
  const lim = 40, corpo = !l.length ? vazio("Ninguém aqui.") : tabelaProspects(corta("pro", l, lim), k) + verTodos("pro", l.length, lim);
  return `<div class="mb-3 flex flex-wrap items-center justify-between gap-2"><div class="flex flex-wrap gap-1.5">${ABAS_PROSP.map(([v, r, ff]) => chipF(k === v, "p-aba", v, r, base.filter(ff).length)).join("")}</div><div class="flex flex-wrap gap-2">${botoes}</div></div>
    <section class="${UI.card}"><div class="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">${sel("p-fonte", S.pFonte, Object.entries(FONTES), "Fonte: todas")}${sel("p-camp", S.pCamp, S.camps.filter((x) => x.fonte).map((x) => [x.id, esc(x.nome)]), "Campanha: todas")}<span class="ml-auto shrink-0 whitespace-nowrap pl-2 ${V.muted}">${l.length} ${l.length === 1 ? "prospect" : "prospects"}</span></div>${corpo}</section>`;
}

// ── Clientes ──
const ABAS_CLI = [
  ["todos", "Todos", () => true],
  ["novos", "Novos", (c) => c.ctipo === "novo"],
  ["recorrentes", "Recorrentes", (c) => c.ctipo === "recorrente"],
  ["esporadicos", "Esporádicos", (c) => c.ctipo === "esporadico"],
  ["atraso", "Em atraso", emAtraso],
  ["comodato", "Comodato parado", comodatoParado],
];
const ORDEM_REC = { pronto: 0, esfriando: 1, inativo: 2 };
const ORDEM_CLI = {
  todos: (a, b) => a.nome.localeCompare(b.nome),
  novos: (a, b) => (b.bi.primeira || "").localeCompare(a.bi.primeira || ""),
  recorrentes: (a, b) => (ORDEM_REC[recompra(a)] ?? 3) - (ORDEM_REC[recompra(b)] ?? 3) || diasAtras(b.bi.ultimo) / b.bi.ciclo - diasAtras(a.bi.ultimo) / a.bi.ciclo,
  esporadicos: (a, b) => (diasSemContato(b) ?? 999) - (diasSemContato(a) ?? 999),
  atraso: (a, b) => b.bi.vencidos - a.bi.vencidos,
  comodato: (a, b) => diasAtras(b.bi.ultimo) - diasAtras(a.bi.ultimo),
};
function cicloTxt(c) {
  if (c.ctipo === "novo") return `<span class="text-gray-600 dark:text-gray-300">cliente novo · 1ª entrega ${dm(c.bi.primeira)}</span>`;
  if (c.ctipo === "recorrente") return `<span class="text-gray-600 dark:text-gray-300">a cada ${c.bi.ciclo} d</span>`;
  const n = diasSemContato(c);
  return `<span class="${n != null && n >= P("espor") ? "font-medium text-warning-600 dark:text-warning-400" : "text-gray-600 dark:text-gray-300"}">${n == null ? "sem contato registrado" : `último contato há ${n} d`}</span>`;
}
function ultimaCompra(c) {
  if (!c.bi.ultimo) return `<span class="text-gray-400">—</span>`;
  const r = recompra(c), d = diasAtras(c.bi.ultimo);
  return `<span class="whitespace-nowrap ${r ? SIT_REC[r][1] + " font-medium" : "text-gray-700 dark:text-gray-300"}">${dm(c.bi.ultimo)} <span class="font-normal text-gray-400">· ${d} d</span>${r === "esfriando" || r === "inativo" ? ` ${ic("alerta", "inline h-3.5 w-3.5")}` : ""}</span>`;
}
function situacaoCli(c) {
  const out = [];
  if (c.ctipo === "novo") out.push(pill("novo", COR.ambar));
  else if (c.ctipo === "recorrente") { const r = recompra(c); out.push(r ? `<span class="text-xs font-medium ${SIT_REC[r][1]}">${SIT_REC[r][0]}</span>` : `<span class="text-xs text-gray-500 dark:text-gray-400">em dia</span>`); }
  else out.push(`<span class="text-xs ${esporAtrasado(c) ? "font-medium text-warning-600 dark:text-warning-400" : "text-gray-500 dark:text-gray-400"}">esporádico</span>`);
  if (c.sit) out.push(sitPill(c));
  else if (c.voltou) out.push(pill("voltou a comprar", COR.ok));
  if (emAtraso(c)) out.push(pill(reaisK(c.bi.vencidos) + " vencido", COR.erro));
  if (comodatoParado(c) && S.cAba === "comodato") out.push(pill(`comodato · ${diasAtras(c.bi.ultimo)} d`, COR.brand));
  return out.join("");
}
const CTX_CLI = { atraso: "atraso", recorrentes: "recorrentes" };
function tabelaClientes(l, aba) {
  const ch = "c" + aba, ctx = CTX_CLI[aba] || "";
  const tab = `<table class="hidden w-full table-fixed md:table"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Empresa</th><th class="${UI.th} w-24 text-right">Consumo</th><th class="${UI.th} w-36">Ciclo / contato</th><th class="${UI.th} w-28">Última compra</th><th class="${UI.th} w-[17rem]">Próximo</th><th class="${UI.th} w-36">Situação</th>${thVend()}<th class="w-16"><span class="sr-only">Canais</span></th></tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${l.map((c) => `<tr class="group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${linhaFlash(c)}" data-acao="ir" data-v="#/fichas/${c.id}">
      <td class="px-4 py-2 text-sm">${nomeCel(c)}</td><td class="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">${num(c.bi.consumo)} <span class="text-xs text-gray-400">L</span></td>
      <td class="px-4 py-2 text-xs">${cicloTxt(c)}</td><td class="px-4 py-2 text-sm">${ultimaCompra(c)}</td><td class="px-4 py-2">${proxCtl(c, ctx, ch)}</td>
      <td class="px-3 py-2"><span class="flex flex-wrap items-center gap-1">${situacaoCli(c)}</span></td>${colVend(c)}<td class="py-1.5 pl-1 pr-3">${hoverIcones(c, ch)}</td></tr>`).join("")}</tbody></table>`;
  const cards = `<ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${l.map((c) => `<li class="px-4 py-2.5 ${linhaFlash(c)}"><div class="flex items-center gap-2"><a href="#/fichas/${c.id}" class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</a><span class="flex shrink-0 items-center">${iconesLinha(c, ch + "m")}</span></div>
    <p class="truncate text-xs text-gray-500 dark:text-gray-400">${esc(c.cidade)} · ${num(c.bi.consumo)} L/mês · ${cicloTxt(c).replace(/<[^>]+>/g, "")}${c.bi.ultimo ? ` · última ${dm(c.bi.ultimo)}` : ""}${todasEquipe() ? ` · ${vend(c.dona).curto}` : ""}</p>
    <div class="mt-1 flex flex-wrap items-center gap-1">${situacaoCli(c)}</div><div class="mt-1.5">${proxCtl(c, ctx, ch + "m")}</div></li>`).join("")}</ul>`;
  return tab + cards;
}
function telaClientes() {
  const base = meus(S.contas).filter((c) => c.tipo === "cliente"), aba = ABAS_CLI.find(([k]) => k === S.cAba) || ABAS_CLI[0], [k, , f] = aba;
  const l = base.filter(f).sort(ORDEM_CLI[k]);
  const lim = 40, corpo = !l.length ? vazio("Ninguém aqui.") : tabelaClientes(corta("cli", l, lim), k) + verTodos("cli", l.length, lim);
  return `<div class="mb-3 flex flex-wrap gap-1.5">${ABAS_CLI.map(([v, r, ff]) => chipF(k === v, "c-aba", v, r, base.filter(ff).length)).join("")}</div>
    <section class="${UI.card}">${corpo}</section>`;
}
