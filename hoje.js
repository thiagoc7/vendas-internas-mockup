// ── Vendas = abas Hoje · Prospects · Clientes (+ Equipe e ⚙ Prazos pro supervisor) — SPEC_V5 §1, §2, §7, §8 ──
const cardTopo = (titulo, extra = "") => `<div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800"><h2 class="${UI.h2}">${titulo}</h2>${extra}</div>`;
const pedirVendedora = (oque) => `<div class="${UI.card} p-5 text-center"><p class="text-sm text-gray-700 dark:text-gray-200">${oque} é de uma vendedora: escolha quem.</p>
  <div class="mt-3 flex flex-wrap justify-center gap-2">${VENDEDORAS.map((v) => `<button type="button" data-acao="sel" data-v="${v.id}" class="${UI.btnSm}">${avatar(v.nome, "h-5 w-5 text-[0.6rem]")}${v.curto}</button>`).join("")}</div></div>`;
const todasEquipe = () => sup() && !S.sel;
const icBtn = "flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-brand-300";

// ── Hoje: Atendimento (V3 dela) · Prospects · Clientes · Em atraso · Atrasados (recolhido) · Feito ──
function atendimentoHoje() {
  const out = [];
  for (const v of meus(S.conv).filter((x) => !x.fechada)) {
    const ms = v.msgs.filter((x) => !x.sis), ult = ms[ms.length - 1]; if (!ult) continue;
    const d = ult.d || v.dia, n = uteisEntre(d, HOJE), c = v.conta ? conta(v.conta) : null;
    if (v.naoLidas > 0) out.push({ k: "nova", v, c, h: v.hora });
    else if (ult.dir === "eu" && n >= P(v.canal === "email" ? "espMail" : "espWa")) out.push({ k: "esperando", v, c, dias: n, h: "y" });
    else if (ult.dir === "cliente" && n >= 1) out.push({ k: "parada", v, c, dias: n, h: "z" });
  }
  const ordem = { nova: 0, parada: 1, esperando: 2 };
  return out.sort((a, b) => ordem[a.k] - ordem[b.k] || a.h.localeCompare(b.h));
}
const blocoDe = (c) => ehProspect(c) || c.prox?.tipo === "satisf" ? "prospects" : c.prox?.tipo === "titulo" ? "atraso" : "clientes";
const ordemHora = (a, b) => (a.prox.h || "99").localeCompare(b.prox.h || "99") || a.nome.localeCompare(b.nome);
function itensHoje(dia = HOJE) {
  const cs = meus(S.contas), r = { atend: [], prospects: [], clientes: [], atraso: [], atrasados: [], usados: new Set() };
  if (dia === HOJE) { r.atend = atendimentoHoje(); r.atend.forEach((i) => i.c && r.usados.add(i.c.id)); }
  for (const c of cs) {
    if (!c.prox || r.usados.has(c.id)) continue;
    if (dia === HOJE && c.prox.d < HOJE) r.atrasados.push(c);
    else if (c.prox.d === dia) r[blocoDe(c)].push(c);
  }
  ["prospects", "clientes", "atraso"].forEach((k) => r[k].sort(ordemHora)); r.atrasados.sort((a, b) => a.prox.d.localeCompare(b.prox.d));
  return r;
}
const contagemHoje = (r) => ({ atr: r.atrasados.length, hoje: r.atend.length + r.prospects.length + r.clientes.length + r.atraso.length });
// o porquê da linha (uma frase, dado — não ajuda)
function porque(c) {
  const p = c.prox;
  if (p.tipo === "cobrar" && c.prop) return `cobrar proposta #${c.prop.n}, enviada ${dm(c.prop.d)}${c.prop.vista ? " · visualizada" : ""}`;
  if (p.tipo === "primeiro") return `1º contato · ${fonteTxt(c, true)} · entrou ${dm(c.entrou)}`;
  if (p.tipo === "satisf") return `satisfação · 1ª entrega ${dm(c.bi.primeira)}`;
  if (p.tipo === "titulo") return `${reais(c.bi.vencidos).replace(",00", "")} vencido · ${c.bi.titulos} ${c.bi.titulos === 1 ? "título" : "títulos"} · há ${diasAtras(c.bi.ultimo) - 14} d`;
  if (p.tipo === "janela") return `a cada ${c.bi.ciclo} d · última compra ${dm(c.bi.ultimo)} (${diasAtras(c.bi.ultimo)} d)`;
  if (!ehProspect(c) && c.ctipo === "esporadico") { const n = diasSemContato(c); return `${esc(p.assunto)}${n != null ? ` · último contato há ${n} d` : ""}`; }
  return esc(p.assunto);
}
const chipLinha = (c) => ehProspect(c) ? `${sitPill(c)}${perdeuPill(c)}` : c.prox?.tipo === "satisf" ? pill("Cliente novo", COR.ambar) : c.sit ? sitPill(c) : pill(CTIPO[c.ctipo], COR.cinza);
const donaMini = (id) => todasEquipe() ? `<span class="text-xs text-gray-400">${vend(id).curto}</span>` : "";
// ações da linha: 1 primária (o canal previsto) · Registrar · Adiar ▾ · o outro canal como ícone no hover
function acoesLinha(c, chave) {
  if (sup()) return `${donaMini(c.dona)}<a href="#/fichas/${c.id}" class="${UI.btnSm}">Ficha</a>`;
  const p = pessoaPrincipal(c), prev = canalPrevisto(c), tel = !!p?.tel;
  const ligarP = `<button type="button" data-acao="ligar" data-v="${c.id}" class="${UI.btnPSm}">${ic("fone", "h-3.5 w-3.5")}Ligar</button>`;
  const waP = waDrop(c, UI.btnPSm, "right-0", `${icWa("h-3.5 w-3.5")}WhatsApp`, `wa:${chave}:${c.id}`);
  const ligarI = tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" title="Ligar" aria-label="Ligar" class="${icBtn}">${ic("fone", "h-4 w-4")}</button>` : "";
  const waI = waDrop(c, `${icBtn}" title="WhatsApp" aria-label="WhatsApp`, "right-0", icWa("h-4 w-4"), `wai:${chave}:${c.id}`, false);
  const outro = prev === "whatsapp" || !tel ? ligarI : waI, abertoDrop = S.drop && S.drop.endsWith(`:${chave}:${c.id}`);
  return `<span class="flex items-center ${abertoDrop ? "" : "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"}">${outro}</span>${prev === "whatsapp" || !tel ? waP : ligarP}
    <button type="button" data-acao="registrar" data-v="${c.id}" class="${UI.btnSm}">Registrar</button>${drop(`ad:${chave}:${c.id}`, `${ic("relogio", "h-3.5 w-3.5")}<span class="sr-only sm:not-sr-only">Adiar</span>`, `${UI.btnSm}" title="Adiar`, itensData(c.id, "", false).map((x, i) => i === 0 ? [x[0], `${c.id}|amanha|`, `amanhã <span class="text-xs text-gray-400">${diaCurto(AMANHA())}</span>`] : x).slice(0, 4), "right-0", true)}`;
}
const linhaLi = (corpo, acoes, extra = "") => `<li class="group flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 ${extra}"><div class="min-w-0 flex-1 basis-60">${corpo}</div>${acoes ? `<div class="flex shrink-0 flex-wrap items-center justify-end gap-1.5 max-sm:w-full">${acoes}</div>` : ""}</li>`;
function linhaHoje(c, chave, atr = false) {
  const p = c.prox, hora = atr ? `<span class="shrink-0 text-xs font-medium text-error-600 dark:text-error-400">${p.d === somaDias(HOJE, -1) ? "ontem" : diaCurto(p.d)}</span>` : p.h ? `<span class="shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400">${p.h}</span>` : "";
  const corpo = `<p class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">${hora}<a href="#/fichas/${c.id}" class="min-w-0 truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</a><span class="flex shrink-0 gap-1">${chipLinha(c)}</span></p>
    <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">${porque(c)}${p.por === "sistema" ? ` <span class="text-gray-400">· sistema</span>` : ""}</p>`;
  return linhaLi(corpo, acoesLinha(c, chave), S.flash === c.id ? "bg-brand-25 dark:bg-brand-500/10" : "");
}
function linhaAtend(i) {
  const v = i.v, c = i.c, motivo = i.k === "nova" ? `<b class="font-semibold text-brand-600 dark:text-brand-400">${v.naoLidas === 1 ? "1 nova" : v.naoLidas + " novas"}</b>` : i.k === "esperando" ? `esperando resposta há ${i.dias} d` : `parada há ${i.dias} d · cliente falou por último`;
  const tinha = c?.prox && c.prox.d <= HOJE ? ` · tinha contato ${c.prox.d < HOJE ? "atrasado" : "hoje" + (c.prox.h ? " " + c.prox.h : "")}` : "";
  const ult = v.msgs.filter((x) => !x.sis).slice(-1)[0];
  const corpo = `<p class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm"><span class="shrink-0 text-gray-400">${v.canal === "email" ? ic("mail", "h-4 w-4") : icWa("h-4 w-4")}</span>${c ? `<a href="#/fichas/${c.id}" class="min-w-0 truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white">${esc(c.nome)}</a>${tipoPill(c)}` : `<span class="min-w-0 truncate font-medium text-gray-800 dark:text-white">${esc(v.nome)}</span>${pill("número novo", COR.aviso)}`}</p>
    <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">${motivo}${tinha} · <span class="italic">“${esc(ult.t)}”</span></p>`;
  return linhaLi(corpo, `${donaMini(v.dona)}<a href="#/conversas/${v.id}" class="${sup() ? UI.btnSm : UI.btnPSm}">Abrir</a>`);
}
const bloco = (titulo, n, linhas, rodape = "") => n ? `<section class="${UI.card}"><h2 class="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">${titulo}<span class="font-normal text-gray-400">· ${n}</span></h2><ul class="divide-y divide-gray-100 dark:divide-gray-800">${linhas}</ul>${rodape}</section>` : "";
function avisoClientes() {
  const cl = meus(S.contas).filter((c) => c.tipo === "cliente" && !c.prox);
  const rec = cl.filter((c) => recompra(c) === "pronto").length, esp = cl.filter(esporAtrasado).length;
  if (!rec && !esp) return "";
  return `<div class="flex flex-wrap gap-x-3 border-t border-gray-100 px-4 py-2 text-xs dark:border-gray-800">${rec ? `<a href="#/vendas/clientes?aba=recorrentes" class="${V.link}">${rec} ${rec === 1 ? "recorrente" : "recorrentes"} na janela</a>` : ""}${rec && esp ? `<span class="text-gray-300 dark:text-gray-600">·</span>` : ""}${esp ? `<a href="#/vendas/clientes?aba=esporadicos" class="${V.link}">${esp} ${esp === 1 ? "esporádico" : "esporádicos"} sem contato há ${P("espor")} d+</a>` : ""}<a href="#/vendas/clientes" class="${V.link}">→ Clientes</a></div>`;
}
function telaHoje() {
  if (todasEquipe()) return `<div class="space-y-4">${pedirVendedora("O dia")}${faixaNumeros()}</div>`;
  const dia = S.dia, ehHoje = dia === HOJE, r = itensHoje(dia), n = contagemHoje(r);
  const feitos = ehHoje ? S.feitos.filter((x) => escopo().includes(conta(x.id)?.dona)).sort((a, b) => a.h.localeCompare(b.h))
    : dia < HOJE ? meus(S.contas).flatMap((c) => c.eventos.filter((e) => e.d === dia && !e.sistema && e.dir === "eu").map((e) => ({ id: c.id, h: e.h, txt: `${CANAL[e.canal].nome.toLowerCase()} · ${e.res ? resRot(e).toLowerCase() : "enviado"}` }))).sort((a, b) => a.h.localeCompare(b.h)) : [];
  const nav = (d, icone, rot, off) => `<button type="button" data-acao="dia" data-v="${d}" ${off ? "disabled" : ""} aria-label="${rot}" title="${rot}" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">${ic(icone, "h-4 w-4")}</button>`;
  const topo = `<div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2"><h2 class="text-lg font-semibold text-gray-800 dark:text-white">${ehHoje ? "Hoje" : rotData(dia).replace(/^./, (x) => x.toUpperCase())} · ${diaCurto(dia)}</h2>
    <span class="flex items-center gap-1.5">${nav(-1, "esq", "Dia anterior")}${nav(1, "dir", "Próximo dia")}${ehHoje ? "" : `<button type="button" data-acao="dia" data-v="0" class="${V.btn_ghost}">voltar pra hoje</button>`}</span>
    <span class="ml-auto text-sm text-gray-500 dark:text-gray-400">${ehHoje ? `<b class="${n.atr ? "text-error-600 dark:text-error-400" : "text-gray-400"}">${n.atr}</b> atrasados · <b class="text-gray-800 dark:text-white">${n.hoje}</b> hoje · <b class="text-success-600 dark:text-success-400">${feitos.length}</b> feitos` : dia > HOJE ? `<b class="text-gray-800 dark:text-white">${n.hoje}</b> agendados` : `<b>${feitos.length}</b> contatos`}</span></div>`;
  const atrasados = ehHoje && r.atrasados.length ? `<details class="${UI.card}" ${S.atrAberto ? "open" : ""} data-atr="1"><summary class="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-2.5"><span class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-error-600 dark:text-error-400">${ic(S.atrAberto ? "baixo" : "dir", "h-3.5 w-3.5")}Atrasados<span class="font-normal">· ${r.atrasados.length}</span></span>
      ${sup() ? "" : `<button type="button" data-acao="levar-atrasados" class="ml-auto ${UI.btnSm}">Levar todos pra amanhã</button>`}</summary><ul class="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">${r.atrasados.map((c) => linhaHoje(c, "atr", true)).join("")}</ul></details>` : "";
  const feito = feitos.length ? `<section class="${UI.card}"><h2 class="border-b border-gray-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">${ehHoje ? "Feito hoje" : "Feito"} <span class="font-normal text-gray-400">· ${feitos.length}</span></h2>
    <ul class="divide-y divide-gray-100 dark:divide-gray-800">${feitos.map((x) => { const c = conta(x.id); return `<li class="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 dark:text-gray-500"><span class="font-mono text-xs">${x.h}</span><a href="#/fichas/${c.id}" class="min-w-0 truncate line-through decoration-gray-300 hover:text-brand-500 dark:decoration-gray-600">${esc(c.nome)}</a><span class="hidden min-w-0 truncate text-xs sm:inline">${x.txt}</span><span class="ml-auto shrink-0 text-success-500">${ic("check", "h-4 w-4")}</span></li>`; }).join("")}</ul></section>` : "";
  const blocos = [
    bloco("Atendimento", r.atend.length, r.atend.map(linhaAtend).join("")),
    bloco("Prospects", r.prospects.length, r.prospects.map((c) => linhaHoje(c, "p")).join("")),
    bloco("Clientes", r.clientes.length, r.clientes.map((c) => linhaHoje(c, "c")).join(""), ehHoje ? avisoClientes() : ""),
    bloco("Em atraso", r.atraso.length, r.atraso.map((c) => linhaHoje(c, "a")).join("")),
  ].join("");
  const nada = !blocos && !atrasados && !feito ? `<div class="${UI.card}">${vazio(dia > HOJE ? "Nada agendado pra esse dia." : "Nada pra hoje.")}</div>` : "";
  return `${topo}<div class="space-y-3">${blocos}${!blocos && ehHoje && avisoClientes() ? `<section class="${UI.card}">${avisoClientes()}</section>` : ""}${atrasados}${feito}${nada}</div>${ehHoje ? `<div class="mt-4">${faixaNumeros()}</div>` : ""}`;
}

// ── Números do mês: uma faixa compacta (cada número abre a página que já existe ou a aba certa) ──
function uteisAte(fim) { let d = HOJE, k = 0; while (d < fim) { d = somaDias(d, 1); if (dow(d) && dow(d) !== 6) k++; } return k; }
const quemRecorte = () => todasEquipe() ? "a equipe" : vend(S.sel || S.como).curto;
const PWA_DESTINO = { vendas: "/vendas", cobranca: "/cobranca?modo=vencidos", comodato: "/comodato", propostas: "/documents/propostas?situacao=aguardando" };
function faixaNumeros() {
  const ids = escopo(), m = ids.reduce((a, id) => ({ meta: a.meta + META[id].meta, real: a.real + META[id].real }), { meta: 0, real: 0 }), pct = Math.round((m.real / m.meta) * 100);
  const cs = meus(S.contas), venc = cs.filter(emAtraso), vencR = venc.reduce((a, c) => a + c.bi.vencidos, 0);
  const pw = ids.map((id) => PWA_EXTRA[id]), posit = Math.round(pw.reduce((a, x) => a + x.posit, 0) / pw.length);
  const psr = cs.filter((c) => c.sit === "proposta" && c.prop && uteisEntre(c.prop.d, HOJE) >= P("cobranca")).length;
  const novosMes = cs.filter((c) => ehProspect(c) && (c.entrou || "") >= "2026-10-01").length;
  const item = (acao, v, rot, valor, sub, cor = "text-gray-800 dark:text-white") => `<button type="button" data-acao="${acao}" data-v="${v}" class="min-w-0 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"><p class="truncate text-[11px] font-medium text-gray-500 dark:text-gray-400">${rot}</p><p class="mt-0.5 flex items-baseline gap-1.5 whitespace-nowrap"><span class="text-base font-bold ${cor}">${valor}</span><span class="truncate text-xs text-gray-400">${sub}</span></p></button>`;
  return `<section class="${UI.card} p-1.5"><div class="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
    ${item("pwa", "vendas", "Meta out/26", `${pct}%`, `${num(Math.round(m.real / 1000))} / ${num(m.meta / 1000)} mil L`, pct >= 70 ? "text-success-600 dark:text-success-400" : "text-gray-800 dark:text-white")}
    ${item("pwa", "cobranca", "Em atraso", venc.length, reaisK(vencR), venc.length ? "text-error-600 dark:text-error-400" : undefined)}
    ${item("pwa", "comodato", "Positivação comodato", `${posit}%`, `${comodTotal(ids)} tanques`)}
    ${item("ir", "#/vendas/prospects?aba=proposta", "Propostas sem resposta", psr, `${P("cobranca")}+ d úteis`, psr ? "text-warning-600 dark:text-warning-400" : undefined)}
    <div class="col-span-2 sm:col-span-1">${item("ir", "#/vendas/prospects?aba=novos", "Prospects novos no mês", novosMes, "entraram em out")}</div></div></section>`;
}
const comodTotal = (ids) => ids.reduce((a, id) => a + PWA_EXTRA[id].positDe[1], 0);

// ── Busca (nome, CNPJ, telefone) no topo das três abas ──
function blocoBusca() {
  const q = norm(S.buscaQ).trim(), qd = soDig(S.buscaQ);
  const res = !q ? [] : meus(S.contas).filter((c) => norm(c.nome + " " + c.razao + " " + c.cidade).includes(q) || (qd.length >= 4 && (soDig(c.cnpj).includes(qd) || c.pessoas.some((p) => soDig(p.tel).includes(qd))))).slice(0, 6);
  return `<div class="relative"><span class="pointer-events-none absolute left-3 top-2.5 text-gray-400">${ic("busca", "h-4 w-4")}</span>
    <input type="search" id="busca-vendas" data-input="busca" value="${esc(S.buscaQ)}" placeholder="Buscar nome, CNPJ ou telefone" autocomplete="off" class="${UI.campo} bg-white pl-9 dark:bg-gray-900">
    ${q ? `<ul class="absolute inset-x-0 top-full z-40 mt-1 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:divide-gray-800 dark:border-gray-700 dark:bg-gray-900">${res.map((c) => `<li><a href="#/fichas/${c.id}" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
        <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-800 dark:text-white">${esc(c.nome)}</p><p class="text-xs text-gray-500 dark:text-gray-400">${c.cnpj} · ${esc(c.cidade)}</p></div>${tipoPill(c)}</a></li>`).join("")}
      ${!res.length ? `<li class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Nada na ${sup() ? "carteira da equipe" : "sua carteira"}. ${sup() ? "" : `<button type="button" data-acao="novo-prospect" data-q="${esc(S.buscaQ)}" class="${UI.link}">Cadastrar como prospect →</button>`}</li>` : ""}</ul>` : ""}</div>`;
}

// ── Casca da página Vendas ──
function telaVendas() {
  const nome = sup() ? SUPERVISOR.curto : vend(S.como).curto;
  const abas = [["hoje", "Hoje", "vendas"], ["prospects", "Prospects", "vendas/prospects"], ["clientes", "Clientes", "vendas/clientes"], ...(sup() ? [["equipe", "Equipe", "equipe"]] : [])];
  const ativa = S.vAba === "importar" ? "prospects" : S.vAba;
  const tab = ([k, r, rota]) => `<a href="#/${rota}" class="shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${ativa === k ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}">${r}</a>`;
  const prazos = sup() ? `<a href="#/prazos" title="Prazos automáticos" aria-label="Prazos" class="mb-1 flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-medium ${S.vAba === "prazos" ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}">${ic("engrenagem", "h-4 w-4")}<span class="hidden sm:inline">Prazos</span></a>` : "";
  const corpo = { hoje: telaHoje, prospects: telaProspects, clientes: telaClientes, importar: telaImportar, equipe: telaEquipe, prazos: telaPrazos }[S.vAba]();
  const temSel = sup() && ["hoje", "prospects", "clientes"].includes(S.vAba);
  return `<div class="mx-auto max-w-[80rem]">
    <div class="flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-xl font-bold text-gray-800 dark:text-white">Olá, ${nome}</h1><p class="text-sm text-gray-500 dark:text-gray-400">${sup() ? "Supervisor" : "rep 0412"} · vendas internas</p></div><div class="w-full sm:w-80">${blocoBusca()}</div></div>
    <div class="mb-4 mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-gray-200 dark:border-gray-800"><nav class="no-scrollbar -mb-px flex items-end gap-5 overflow-x-auto">${abas.map(tab).join("")}</nav><div class="flex items-center gap-2 pb-1.5">${temSel ? seletorVendedora() : ""}${prazos}</div></div>
    ${corpo}</div>`;
}

// ── ⚙ Prazos (supervisor): telinha única ──
function telaPrazos() {
  const ro = !sup();
  return `<section class="${UI.card} max-w-3xl">${cardTopo("Prazos automáticos", `<span class="${V.muted}">quem marca: sistema</span>`)}
    <ul class="divide-y divide-gray-100 dark:divide-gray-800">${PRAZOS.map(([k, nome, un, quando]) => `<li class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"><div class="min-w-0 flex-1 basis-56"><p class="text-sm font-medium text-gray-800 dark:text-white">${nome}</p><p class="text-xs text-gray-500 dark:text-gray-400">${quando}</p></div>
      <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><input type="number" min="1" max="365" id="prazo-${k}" data-input="prazo" data-k="${k}" value="${P(k)}" ${ro ? "disabled" : ""} class="${UI.campo.replace("w-full ", "")} w-20 py-1.5 text-right"><span class="w-14">${un}</span></label>
      ${P(k) !== PRAZO0[k] ? `<span class="text-xs text-warning-600 dark:text-warning-400" title="padrão ${PRAZO0[k]}">alterado</span>` : `<span class="w-[3.25rem]"></span>`}</li>`).join("")}</ul></section>`;
}

// ── Equipe (supervisor) ──
function linhasEquipe() {
  return VENDEDORAS.map((v) => { const cs = S.contas.filter((c) => c.dona === v.id);
    return { v, atr: cs.filter((c) => c.prox && c.prox.d < HOJE).length, hoje: cs.filter((c) => c.prox?.d === HOJE).length, novos: cs.filter((c) => ativo(c) && c.sit === "novo").length,
      prop: cs.filter((c) => c.sit === "proposta").length, ganhos: cs.filter((c) => (c.ganhoEm || "") >= "2026-10-01").length,
      perd: cs.filter((c) => (c.perdas || []).some((p) => p.d >= "2026-10-01") || (c.desc?.d || "") >= "2026-10-01").length, vis: cs.filter((c) => c.visita && !c.visitaFeita).length }; });
}
function blocoEquipeTabela() {
  const n = (k, tom) => `<span class="text-base font-semibold ${k ? tom : "text-gray-400"}">${k}</span>`, ls = linhasEquipe();
  const cols = [["Atrasados", "atr", "text-error-600 dark:text-error-400"], ["Hoje", "hoje", "text-gray-800 dark:text-white"], ["Prospects novos", "novos", "text-purple-700 dark:text-purple-300"], ["Propostas abertas", "prop", "text-brand-600 dark:text-brand-400"], ["Ganhos mês", "ganhos", "text-success-600 dark:text-success-400"], ["Perdidos mês", "perd", "text-error-600 dark:text-error-400"], ["Visitas pedidas", "vis", "text-warning-600 dark:text-warning-400"]];
  const tabela = `<div class="hidden overflow-x-auto md:block"><table class="min-w-full"><thead><tr class="border-b border-gray-100 dark:border-gray-800"><th class="${UI.th}">Vendedora</th>${cols.map(([r]) => `<th class="${UI.th} text-center">${r}</th>`).join("")}<th class="${UI.th}"></th></tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${ls.map((l) => `<tr><td class="${UI.td} font-medium text-gray-800 dark:text-white"><button type="button" data-acao="sel-hoje" data-v="${l.v.id}" class="hover:text-brand-500">${donaTxt(l.v.id)}</button></td>
      ${cols.map(([, k, t]) => `<td class="${UI.td} text-center">${n(l[k], t)}</td>`).join("")}<td class="${UI.td} text-right"><button type="button" data-acao="entrar-como" data-v="${l.v.id}" class="${UI.btnSm}">Entrar como</button></td></tr>`).join("")}</tbody></table></div>
    <ul class="divide-y divide-gray-100 md:hidden dark:divide-gray-800">${ls.map((l) => `<li class="px-4 py-3"><div class="flex items-center justify-between gap-2">${donaTxt(l.v.id)}<button type="button" data-acao="entrar-como" data-v="${l.v.id}" class="${UI.btnSm}">Entrar como</button></div>
      <dl class="mt-2 grid grid-cols-4 gap-1.5 text-center">${cols.map(([r, k, t]) => `<div class="rounded-lg bg-gray-50 py-1.5 dark:bg-white/[0.03]"><dd>${n(l[k], t)}</dd><dt class="truncate px-0.5 text-[10px] text-gray-500 dark:text-gray-400">${r}</dt></div>`).join("")}</dl></li>`).join("")}</ul>`;
  return `<div class="${UI.card} overflow-hidden">${cardTopo("Equipe", `<span class="${V.muted}">outubro</span>`)}${tabela}</div>`;
}
function blocoVisitas() {
  const vis = S.contas.filter((c) => c.visita && !c.visitaFeita), feitas = S.contas.filter((c) => c.visitaFeita);
  return `<div class="${UI.card} overflow-hidden">${cardTopo(`Visitas pedidas <span class="${UI.badge}">${vis.length}</span>`)}
    ${vis.length ? `<ul class="divide-y divide-gray-100 dark:divide-gray-800">${vis.map((c) => `<li class="flex flex-wrap items-start gap-3 px-4 py-3"><div class="min-w-0 flex-1"><a href="#/fichas/${c.id}" class="${UI.link} text-sm">${esc(c.nome)}</a>
        <p class="text-xs text-gray-500 dark:text-gray-400">${ic("pino", "inline h-3 w-3")} ${esc(c.cidade)} · ${vend(c.dona).curto} · ${litros(litrosDe(c))}/mês</p>${c.visitaNota ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${esc(c.visitaNota)}</p>` : ""}</div>
        <button type="button" data-acao="visita-feita" data-v="${c.id}" class="${UI.btnSm}">${ic("check", "h-3.5 w-3.5")}Marcar atendida</button></li>`).join("")}</ul>` : vazio("Nenhuma visita pedida.")}
    ${feitas.length ? `<p class="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 dark:border-gray-800">Atendidas: ${feitas.map((c) => esc(c.nome)).join(" · ")}</p>` : ""}</div>`;
}
const telaEquipe = () => !sup() ? `<div class="${UI.card}">${vazio("Só o supervisor vê a Equipe.")}</div>` : `<div class="space-y-4">${blocoEquipeTabela()}${blocoVisitas()}</div>`;
