// ── Ficha (prospect e cliente, mesma página) — SPEC_V5 §5 ──
const ABAS = [["atividade", "Atividade"], ["pedidos", "Pedidos"], ["propostas", "Propostas"], ["credito", "Crédito"], ["pasta", "Pasta"], ["cadastro", "Cadastro"]];
const MOD_NOME = { pedidos: "Pedidos", propostas: "Propostas", credito: "Crédito", pasta: "Pasta do cliente", cadastro: "Ficha BI" };
const abrirEm = (m, c) => `<button type="button" data-acao="modulo" data-v="${m}" data-conta="${c.id}" class="inline-flex items-center gap-1 text-sm ${UI.link}">abrir em ${MOD_NOME[m]} ${ic("externo", "h-3.5 w-3.5")}</button>`;
const embedTopo = (mod, c, botao = "") => `<div class="mb-3 flex flex-wrap items-center justify-end gap-3">${botao}${abrirEm(mod, c)}</div>`;
function notasBI(c) {
  if (c.tipo !== "cliente" || !c.bi.ultimo) return [];
  const ciclo = c.bi.ciclo || 20, por = Math.max(500, Math.round(c.bi.consumo / (30 / ciclo) / 500) * 500);
  return [0, 1, 2].slice(0, Math.max(1, Math.min(3, c.bi.compras))).map((i) => { const d = somaDias(c.bi.ultimo, -i * ciclo); return { nf: 48210 + c.id * 37 - i * 11, d, litros: por, valor: por * (TABELA[c.produto] - 0.12) }; });
}
const precoAcordado = (c) => ({ produto: c.produto, preco: TABELA[c.produto] - 0.12, cond: c.bi.limite >= 200000 ? "28 dias" : "14 dias" });
function propostasDe(c) {
  const ps = [];
  [...c.eventos].reverse().forEach((e) => { const m = /Proposta #(\d+)/.exec(e.memo || e.sistema || ""); if (m && !ps.some((p) => p.n === m[1])) ps.push({ n: m[1], d: e.d, canal: e.canal || "email", texto: (e.memo || e.sistema).replace(/^Proposta #\d+\s*(enviada|gerada)?[^:]*:?\s*/i, "") }); });
  ps.forEach((p) => { const perda = (c.perdas || []).find((x) => x.d >= p.d); p.st = c.prop?.n === p.n && c.sit === "proposta" ? (c.prop.vista ? ["visualizada", COR.brand] : ["sem resposta", COR.aviso]) : perda ? ["perdida", COR.erro] : c.tipo === "cliente" ? ["ganha", COR.ok] : ["encerrada", COR.cinza]; });
  return ps.reverse();
}
function abaConteudo(c) {
  const ehCli = c.tipo === "cliente";
  switch (S.aba) {
    case "pedidos": {
      const ns = notasBI(c), peds = ehCli ? [...(c.bi.proxEntrega ? [{ n: 1291, d: c.bi.proxEntrega.d, litros: c.bi.proxEntrega.litros, st: ["programado", COR.aviso] }] : []), ...ns.map((x, i) => ({ n: 1270 - i * 9, d: x.d, litros: x.litros, st: ["faturado", COR.ok], nf: x.nf }))] : [];
      return embedTopo("pedidos", c, ehCli && !sup() ? `<button type="button" data-acao="modulo" data-v="pedidos" data-conta="${c.id}" class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}Anotar pedido</button>` : "")
        + (peds.length ? `<ul class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${peds.map((p) => `<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm"><span class="font-mono text-xs text-gray-400">#${p.n}</span><span class="font-medium text-gray-800 dark:text-white">${litros(p.litros)} ${c.produto}</span><span class="text-xs text-gray-500 dark:text-gray-400">${rotData(p.d)}${p.nf ? ` · NF ${p.nf}` : ""}</span><span class="ml-auto">${pill(p.st[0], p.st[1])}</span></li>`).join("")}</ul>` : `<p class="${UI.muted}">Nenhum pedido.</p>`);
    }
    case "propostas": {
      const ps = propostasDe(c);
      return embedTopo("propostas", c, sup() ? "" : `<button type="button" data-acao="proposta-app" data-v="${c.id}" class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}Nova proposta</button>`)
        + (ps.length ? `<ul class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${ps.map((p) => `<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm"><span class="font-semibold text-gray-800 dark:text-white">#${p.n}</span><span class="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400">${rotData(p.d)} · ${CANAL[p.canal].nome}${p.texto ? " · " + esc(p.texto) : ""}</span>${pill(p.st[0], p.st[1])}<button type="button" data-acao="mock" data-v="Abre o PDF da proposta #${p.n}." class="${UI.btnSm}">PDF</button></li>`).join("")}</ul>` : `<p class="${UI.muted}">Nenhuma proposta ainda.</p>`);
    }
    case "credito":
      return embedTopo("credito", c) + (ehCli ? `<div class="grid grid-cols-1 gap-3 sm:grid-cols-3"><div class="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><p class="text-xs text-gray-500 dark:text-gray-400">Limite (GESCOR)</p><p class="text-lg font-bold text-gray-800 dark:text-white">${reais(c.bi.limite).replace(",00", "")}</p></div>
          <div class="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><p class="text-xs text-gray-500 dark:text-gray-400">Última análise</p><p class="text-sm font-semibold text-gray-800 dark:text-white">#${170 + c.id} · ${dm("2026-08-12")}</p><p class="mt-0.5">${pill("Aprovado", COR.ok)}</p></div>
          <div class="rounded-xl border p-3 ${c.bi.vencidos ? "border-error-200 dark:border-error-800" : "border-gray-200 dark:border-gray-800"}"><p class="text-xs text-gray-500 dark:text-gray-400">Vencidos</p><p class="text-lg font-bold ${c.bi.vencidos ? "text-error-600 dark:text-error-400" : "text-success-600 dark:text-success-400"}">${c.bi.vencidos ? reais(c.bi.vencidos) : "Em dia"}</p></div></div>`
        : `<div class="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700"><p class="text-sm text-gray-700 dark:text-gray-200">Nenhuma análise pra este CNPJ.</p>${sup() ? "" : `<button type="button" data-acao="pedir-credito" data-v="${c.id}" class="mt-3 ${UI.btnSm}">Pedir análise de crédito</button>`}</div>`);
    case "pasta": {
      if (!ehCli) return embedTopo("pasta", c) + `<p class="${UI.muted}">${ic("pasta", "inline h-4 w-4")} A Pasta abre quando virar cliente.</p>`;
      const docs = [["Contrato social.pdf", "2026-03-02"], ["Cartão CNPJ.pdf", "2026-03-02"], ...(c.bi.tanques ? [["Contrato de comodato (D4Sign).pdf", "2025-11-18"]] : []), ["Ficha cadastral GESCOR.pdf", `${c.bi.desde}-02-10`]];
      return embedTopo("pasta", c, sup() ? "" : `<button type="button" data-acao="mock" data-v="Enviar arquivo pra Pasta do cliente." class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}Arquivo</button>`)
        + `<ul class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${docs.map(([n, d]) => `<li class="flex items-center gap-3 px-3 py-2.5 text-sm"><span class="text-gray-400">${ic("doc", "h-4 w-4")}</span><span class="min-w-0 flex-1 truncate text-gray-800 dark:text-gray-100">${n}</span><span class="text-xs text-gray-400">${dm(d)}/${d.slice(2, 4)}</span></li>`).join("")}</ul>`;
    }
    case "cadastro": {
      const pp = pessoaPrincipal(c);
      const linhas = [["Razão social", c.razao], ["CNPJ", c.cnpj], ["Cidade", c.cidade], ["Endereço", c.endereco || `(endereço da Receita) — ${c.cidade}/SP`], ["Segmento", c.segmento],
        ...(ehCli ? [["Representante", `${vend(c.dona).nome} (0412)`], ["Condição", precoAcordado(c).cond], ["Cliente desde", String(c.bi.desde)]] : [["Situação", "prospect — fora do GESCOR"]]), ["Contato principal", pp ? `${pp.nome} · ${pp.tel || pp.email}` : "—"]];
      return embedTopo("cadastro", c) + `<dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">${linhas.map(([k, v]) => `<div class="grid grid-cols-[8rem_minmax(0,1fr)] gap-2 px-3 py-2 text-sm"><dt class="text-gray-500 dark:text-gray-400">${k}</dt><dd class="break-words text-gray-800 dark:text-gray-100">${esc(v || "—")}</dd></div>`).join("")}</dl>`;
    }
    default: return atividade(c);
  }
}
const FROTA = { Transporte: "frota de caminhões", Construção: "máquinas no canteiro", Hospital: "gerador", "Data center": "geradores", Indústria: "caldeira / empilhadeiras", Varejo: "geradores das lojas", Mineração: "escavadeiras e caminhões", Frigorífico: "câmaras frias + caminhões", Guindastes: "guindastes", Agro: "tratores", Concreto: "betoneiras e usina", Asfalto: "usina de asfalto", Serviços: "caldeira", "Locação de máquinas": "máquinas locadas", Condomínio: "geradores", Saúde: "gerador", Comércio: "gerador" };
const botaoTopo = "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5";
// Perdido bem registrado: motivo · concorrente · comodato da concorrência (sim/não · de quem · litros) · obs; histórico se mais de uma
function blocoPerdido(c) {
  if (!c.perdas?.length) return "";
  const [u, ...ant] = c.perdas;
  const dl = (k, v) => `<div class="${V.dl_row}"><dt class="${V.dt}">${k}</dt><dd class="${V.dd}">${v}</dd></div>`;
  const comod = (x) => x.comod?.tem ? `<span class="font-medium text-error-700 dark:text-error-300">sim</span> · ${esc(x.comod.de)}${x.comod.litros ? ` · ${num(x.comod.litros)} L` : ""}` : "não";
  return `<div class="${UI.card} border-error-200 p-4 dark:border-error-500/30"><div class="flex flex-wrap items-center justify-between gap-2"><h4 class="text-xs font-semibold uppercase tracking-wide text-error-600 dark:text-error-400">Perdido · ${rotData(u.d)}</h4>${c.sit !== "descartado" ? pill(c.sit === "contato" ? "voltou pra Em contato" : SIT[c.sit], COR.cinza) : ""}</div>
    <dl class="mt-1">${dl("Motivo", motivoTxt(u.motivo))}${dl("Concorrente", esc(u.conc || "—"))}${dl("Comodato deles", comod(u))}${u.obs ? dl("Obs.", esc(u.obs)) : ""}</dl>
    ${ant.length ? `<p class="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">Antes: ${ant.map((x) => `${dm(x.d)}/${x.d.slice(2, 4)} · ${motivoTxt(x.motivo).toLowerCase()}${x.conc ? " · " + esc(x.conc) : ""}${x.comod?.tem ? " · comodato " + esc(x.comod.de) : ""}`).join(" — ")}</p>` : ""}</div>`;
}
// Desempenho recente (cliente): média 12 m · último mês (L e L/dia útil) · tendência · prazo médio de pagamento e tendência · última compra
function blocoDesempenho(c) {
  if (c.tipo !== "cliente") return "";
  const tile = (rot, val, sub, cor = "") => `<div class="min-w-0 rounded-xl border border-gray-200 p-2.5 dark:border-gray-800"><p class="truncate text-[11px] text-gray-500 dark:text-gray-400">${rot}</p><p class="mt-0.5 truncate text-base font-bold text-gray-800 dark:text-white ${cor}">${val}</p><p class="truncate text-[11px] text-gray-500 dark:text-gray-400">${sub}</p></div>`;
  if (c.ctipo === "novo") return `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Desempenho recente</h4><div class="grid grid-cols-2 gap-2 2xl:grid-cols-4">${tile("1ª entrega", c.bi.primeira ? dm(c.bi.primeira) : "—", c.bi.compras ? `${c.bi.compras} ${c.bi.compras === 1 ? "compra" : "compras"}` : "programada")}${tile("Volume até agora", litros(c.bi.l12), `previsto ${litros(c.bi.consumo)}/mês`)}${tile("Prazo de pagamento", precoAcordado(c).cond, "combinado")}${tile("Histórico", "—", "cresce depois")}</div></div>`;
  const media = Math.round(c.bi.l12 / 12), t = ((c.id * 7) % 31) - 13, ult = Math.round(media * (1 + t / 100) / 100) * 100, pd = 14 + (c.id % 4) * 4, pt = (c.id % 5) - 2;
  const seta = (x, bomSubir = true) => x === 0 ? `<span class="text-gray-400">=</span>` : `<span class="${(x > 0) === bomSubir ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}">${x > 0 ? "↑" : "↓"}</span>`;
  return `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Desempenho recente</h4><div class="grid grid-cols-2 gap-2 2xl:grid-cols-4">
    ${tile("Média mensal 12 m", litros(media), `${num(Math.round(media / 21))} L/dia útil`)}
    ${tile("Último mês (set)", `${litros(ult)} ${seta(t)}`, `${num(Math.round(ult / 22))} L/dia útil · ${t > 0 ? "+" : ""}${t}%`)}
    ${tile("Prazo médio de pagamento", `${pd} d ${seta(pt, false)}`, pt ? `${pt > 0 ? "+" : ""}${pt} d em 3 meses` : "estável")}
    ${tile("Última compra", c.bi.ultimo ? dm(c.bi.ultimo) : "—", c.bi.ultimo ? `há ${diasAtras(c.bi.ultimo)} d${c.bi.ciclo ? ` · ciclo ${c.bi.ciclo} d` : ""}` : "")}</div></div>`;
}
function telaFicha(id) {
  const c = conta(id);
  if (!c || !escopo().includes(c.dona)) return `<div class="${UI.card}">${vazio("Ficha não encontrada (ou não é da sua carteira).")}</div>`;
  const ehCli = c.tipo === "cliente", ro = sup(), p = pessoaPrincipal(c);
  const chips = [tipoPill(c), ehCli ? (c.ctipo !== "novo" ? pill(CTIPO[c.ctipo], COR.cinza) : "") : sitPill(c), perdeuPill(c),
    fonteDe(c) ? pill(`fonte: ${fonteTxt(c, true)}`, COR.cinza) : "", emAtraso(c) ? pill(reaisK(c.bi.vencidos) + " vencido", COR.erro) : "", ro ? pill(vend(c.dona).curto, COR.cinza) : ""].join("");
  const mais = drop(`mais:${c.id}`, `${ic("pontos", "h-4 w-4")}<span class="hidden sm:inline">mais</span>`, botaoTopo, [["email", c.id, "E-mail"], ["proposta-app", c.id, "Gerar proposta"], ["pedir-credito", c.id, "Pedir crédito"], ["modulo", "pedidos", "Anotar pedido"], ["visita", c.id, c.visita && !c.visitaFeita ? "Retirar pedido de visita" : "Pedir visita"]]).replace('data-acao="modulo" data-v="pedidos"', `data-acao="modulo" data-v="pedidos" data-conta="${c.id}"`);
  const botoes = ro ? "" : `<div class="flex flex-wrap items-center gap-2">${p?.tel ? `<button type="button" data-acao="ligar" data-v="${c.id}" class="${UI.btnP}">${ic("fone", "h-4 w-4")}Ligar</button>` : ""}${waDrop(c, botaoTopo, "right-0", `${icWa("h-4 w-4")}WhatsApp`, `wa:topo:${c.id}`)}
    <button type="button" data-acao="registrar" data-v="${c.id}" class="${botaoTopo}">${ic("doc", "h-4 w-4")}Registrar</button>${mais}</div>`;
  const volta = ehCli ? ["#/vendas/clientes", "Clientes"] : [`#/vendas/prospects?aba=${{ novo: "novos", contato: "contato", proposta: "proposta", descartado: "descartados" }[c.sit]}`, "Prospects"];
  const topo = `<div class="${UI.card} mb-4 p-4"><a href="${volta[0]}" class="mb-1 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-500 dark:text-gray-400">${ic("esq", "h-3.5 w-3.5")}${volta[1]}</a>
    <div class="flex flex-wrap items-start justify-between gap-3"><div class="min-w-0"><h1 class="text-xl font-semibold text-gray-800 dark:text-white">${esc(c.nome)}</h1><p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${esc(c.razao)} · CNPJ ${c.cnpj} · ${esc(c.cidade)}</p>
      <div class="mt-2 flex flex-wrap gap-1.5">${chips}</div></div>${botoes}</div>
    <div class="mt-4">${pathV5(c)}</div>${c.sit && ehCli ? `<p class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">Negócio aberto${c.camp ? ` · ${esc(campanha(c.camp)?.nome || "")}` : ""}: ${sitPill(c)}${c.prop && c.sit === "proposta" ? ` proposta #${c.prop.n} · ${dm(c.prop.d)}` : ""}</p>` : ""}</div>`;
  // esquerda: Pessoas · Informações
  const pessoas = `<div class="${UI.card} overflow-hidden">${cardTopo(`Pessoas <span class="${UI.badge}">${c.pessoas.length}</span>`, ro ? "" : `<button type="button" data-acao="pessoa" data-v="${c.id}" class="${UI.btnSm}">${ic("mais", "h-3.5 w-3.5")}pessoa</button>`)}
    <ul class="divide-y divide-gray-100 dark:divide-gray-800">${c.pessoas.map((x) => `<li class="px-4 py-2.5"><p class="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-white">${esc(x.nome)}${papelPill(x)}${x.principal ? pill("principal", COR.brand) : ""}</p>
      <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400">${x.tel ? `<span>${esc(x.tel)}</span>` : ""}${x.email ? `<span class="truncate">${esc(x.email)}</span>` : ""}<span class="inline-flex items-center gap-1 text-gray-400">prefere ${icCanal(x.prefere === "email" ? "email" : x.prefere === "telefone" ? "telefone" : "whatsapp", "h-3 w-3")}</span></p></li>`).join("") || `<li class="px-4 py-3 ${UI.muted}">Ninguém cadastrado.</li>`}</ul></div>`;
  const info = [["Segmento", c.segmento || "—"], ["Frota / equip.", FROTA[c.segmento] || "—"], ["Consumo est.", litrosDe(c) ? `${litros(litrosDe(c))}/mês` : "—"], ["Produto", c.produto], ["Comodato", ehCli && c.bi.tanques ? `${c.bi.tanques} tanque(s)` : c.comodato ? "quer tanque" : "não"],
    ["Concorrente", esc(c.concorrente || c.perdas?.[0]?.conc || "—")], ["Fonte", fonteDe(c) ? fonteTxt(c) : "carteira (BI)"], ["Campanha", campanha(campanhaDe(c)) ? esc(campanha(campanhaDe(c)).nome) : "—"], ["Obs.", esc(c.visitaNota || c.obs || "—")]];
  const informacoes = `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Informações</h4><dl>${info.map(([k, v]) => `<div class="${V.dl_row}"><dt class="${V.dt}">${k}</dt><dd class="${V.dd}">${v}</dd></div>`).join("")}</dl></div>`;
  const esq = `<div class="space-y-4">${pessoas}${informacoes}</div>`;
  // centro: Perdido · Desempenho · abas
  const abas = `<div class="no-scrollbar flex gap-0.5 overflow-x-auto border-b border-gray-200 px-1.5 dark:border-gray-800">${ABAS.map(([k, r]) => `<button type="button" data-acao="aba" data-v="${k}" class="shrink-0 whitespace-nowrap border-b-2 px-2 py-2.5 text-[13px] font-medium transition-colors ${S.aba === k ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}">${r}</button>`).join("")}</div>`;
  const centro = `<div class="space-y-4">${blocoPerdido(c)}${blocoDesempenho(c)}<div class="${UI.card} overflow-hidden">${abas}<div class="p-4">${abaConteudo(c)}</div></div></div>`;
  // direita: próximo fixado · conversas abertas · comodato/entrega
  const abertas = convDaConta(c).filter((v) => !v.fechada), bi = c.bi;
  const dir = `<div class="space-y-4">${cartaoProximo(c)}
    ${abertas.length ? `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Em aberto na V3</h4><ul class="space-y-1.5">${abertas.map((v) => `<li><a href="#/conversas/${v.id}" class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5"><span class="text-gray-400">${v.canal === "email" ? ic("mail", "h-3.5 w-3.5") : icWa("h-3.5 w-3.5")}</span><span class="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-200">${esc(v.assunto || v.nome)}</span>${v.naoLidas ? `<span class="rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">${v.naoLidas}</span>` : ""}</a></li>`).join("")}</ul></div>` : ""}
    ${ehCli && (bi.comodatoEquip.length || bi.proxEntrega) ? `<div class="${UI.card} p-4"><h4 class="${V.section_title}">Comodato · entrega</h4>${bi.comodatoEquip.length ? `<ul class="space-y-1 text-xs">${bi.comodatoEquip.map((e) => `<li class="flex items-center gap-2 text-gray-700 dark:text-gray-200">${ic("tanque", "h-3.5 w-3.5 text-gray-400")}<span class="truncate">${esc(e)}</span></li>`).join("")}</ul>` : ""}
      ${bi.proxEntrega ? `<p class="${bi.comodatoEquip.length ? "mt-2 border-t border-gray-100 pt-2 dark:border-gray-800" : ""} text-xs">${ic("caminhao", "inline h-3.5 w-3.5 text-gray-400")} <span class="font-medium text-gray-800 dark:text-white">${rotData(bi.proxEntrega.d)}</span> · ${litros(bi.proxEntrega.litros)} · ${bi.proxEntrega.rota}</p>` : ""}</div>` : ""}</div>`;
  return topo + `<div class="grid grid-cols-1 gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_16rem] xl:grid-cols-[17rem_minmax(0,1fr)_18rem]"><div class="order-2 lg:order-1">${esq}</div><div class="order-3 min-w-0 lg:order-2">${centro}</div><div class="order-1 lg:order-3">${dir}</div></div>`;
}
