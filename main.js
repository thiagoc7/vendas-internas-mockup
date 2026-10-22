// ── Render / rotas / eventos ────────────────────────────────────────────────
function reiniciar() {
  const como = S?.como === "sup" ? "sup" : "fer";
  S = { como, contas: montarContas(), conv: clone(CONVERSAS), camps: clone(CAMPANHAS), modal: null, menu: false, tela: "vendas", vAba: "resumo", id: null, sel: "", exp: {}, drop: null, relogio: 0, seqConv: 100,
    agAba: "hoje", agFiltro: "", feitos: [{ id: 100 + FEITO_INICIAL, h: "08:30", txt: "ligação · não atendeu · próximo: amanhã 10:00" }], deItem: null,
    convVista: "minhas", convQ: "", buscaQ: "", aba: "atividade", semana: 0, agSel: null, seq: 500, entrouComo: false, rascunho: {}, erpAberto: true,
    sugFiltro: "", sugSel: [], gaveta: false, resDia: HOJE, resSel: null, flash: null, proxFoco: false, proxFechado: false,
    funVista: "etapa", funFonte: "", funCamp: "", funCel: "", funFech: { novo: true }, caixaSel: null, caixaIdx: 0, editPrev: false, leadVista: "caixa", cliVista: "todos", cliQ: "", leadFonte: "", leadCamp: "", leadCid: "", leadSemCls: false,
    imp: null, fonteAtraso: true, checando: null,
    importacoes: [{ id: 1, d: "2026-10-05", h: "", fonte: "lista", camp: "Lista Carapicuíba", origem: "planilha (XLSX)", total: 44, aceitos: 40, ids: [], desfeita: false },
      { id: 2, d: "2026-09-01", h: "", fonte: "whatsapp_numero_novo", camp: "WhatsApp (nº novo)", origem: "API (Central V3)", total: 9, aceitos: 9, ids: [], desfeita: false }] };
  S.imp = impVazio();
  sincronizarMockbar(); rotear();
}
function tela() {
  switch (S.tela) {
    case "conversas": return telaConversas();
    case "conversa": return telaConversa(S.id);
    case "cliente": return telaCliente(S.id);
    default: return telaVendas();
  }
}
const MODAIS = { reg: modalRegistrar, agenda: modalAgendar, novo: modalNovo, perder: modalPerder, gescor: modalGescor, vincular: modalVincular, pessoa: modalPessoa, negocio: modalNegocio, descartar: modalDescartar, fontes: modalFontes };
function render() {
  const ativo = document.activeElement, idAtivo = ativo?.id, pos = ativo?.selectionStart;
  const modalScroll = document.querySelector("#modal-raiz .overflow-y-auto")?.scrollTop, gavScroll = document.querySelector("[aria-label='Montar agenda'] .overflow-y-auto")?.scrollTop;
  const tl = document.getElementById("timeline"), tlNoFim = !tl || tl.scrollHeight - tl.scrollTop - tl.clientHeight < 40;
  document.documentElement.style.setProperty("--barra", document.querySelector(".mockbar").offsetHeight + "px");
  const corpo = S.tela === "conversa" ? `<main class="flex flex-col">${tela()}</main>` : `<main><div class="mx-auto max-w-screen-2xl p-4 md:p-6">${tela()}</div></main>`;
  document.getElementById("app").innerHTML = sidebar() + `<div class="relative flex min-h-screen flex-col lg:ml-[290px]">${header()}${corpo}</div>` + gaveta();
  const m = S.modal;
  document.getElementById("modal-raiz").innerHTML = m ? MODAIS[m.tipo](m) : "";
  document.body.style.overflow = m || S.gaveta ? "hidden" : "";
  if (modalScroll && m && !S.modalTopo) { const el = document.querySelector("#modal-raiz .overflow-y-auto"); if (el) el.scrollTop = modalScroll; }
  if (gavScroll) { const el = document.querySelector("[aria-label='Montar agenda'] .overflow-y-auto"); if (el) el.scrollTop = gavScroll; }
  S.modalTopo = false;
  const tl2 = document.getElementById("timeline"); if (tl2 && (tlNoFim || S.rolarFim)) tl2.scrollTop = tl2.scrollHeight; S.rolarFim = false;
  if (idAtivo) { const el = document.getElementById(idAtivo); if (el && el !== document.body) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (_) {} } }
}
function rotear() {
  let [caminho, qs] = location.hash.replace(/^#\/?/, "").split("?"); const q = new URLSearchParams(qs || "");
  const h = caminho.split("/").filter(Boolean);
  // redirects do v3: #/painel → Resumo (aba=semana → Agenda › Semana) · #/agenda → Agenda · #/clientes → Funil (vista=hora → Hora de chamar, vista=prospect → Leads)
  const troca = (x) => { history.replaceState(null, "", x); return rotear(); };
  if (!h[0]) return troca("#/vendas");
  if (h[0] === "painel") return troca(q.get("aba") === "semana" ? "#/vendas/agenda?aba=semana" : "#/vendas");
  if (h[0] === "agenda") return troca("#/vendas/agenda" + (qs ? "?" + qs : ""));
  if (h[0] === "clientes" && !h[1]) { const v = q.get("vista"); return troca(v === "hora" ? "#/vendas/clientes?vista=hora" : v === "prospect" ? "#/vendas/leads?vista=funil" : q.get("porcampanha") ? "#/vendas/leads?vista=funil&por=fonte" : q.get("etapa") === "sem" ? "#/vendas/leads?vista=caixa" : "#/vendas/clientes"); }
  // v4.1: a aba Funil virou a vista Funil de Leads; Hora de chamar foi pra Clientes
  if (h[0] === "vendas" && h[1] === "funil") { const v = q.get("vista"); return troca(v === "hora" ? "#/vendas/clientes?vista=hora" : v === "arquivo" ? "#/vendas/leads?vista=arquivo" : v === "fonte" ? "#/vendas/leads?vista=funil&por=fonte" : "#/vendas/leads?vista=funil"); }
  if (h[0] === "vendas" && h[1] === "leads" && !h[2] && q.get("f")) { const f = q.get("f"), mapa = { sem: "caixa", caixa: "caixa", funil: "funil", ganhos: "ganhos", perdidos: "arquivo" }; q.delete("f"); q.set("vista", mapa[f] || "caixa"); return troca("#/vendas/leads?" + q.toString()); }
  const antes = location.hash.split("?")[0];
  S.id = h[1] && h[0] !== "vendas" ? Number(h[1]) : null;
  S.tela = h[0] === "conversas" && h[1] ? "conversa" : h[0] === "conversas" ? "conversas" : h[0] === "clientes" ? "cliente" : h[0] === "equipe" ? "equipe" : "vendas";
  if (S.tela === "equipe") S.vAba = "equipe";
  if (S.tela === "vendas") {
    S.vAba = h[1] === "agenda" ? "agenda" : h[1] === "clientes" ? "clientes" : h[1] === "leads" ? (h[2] === "importar" ? "importar" : "leads") : "resumo";
    if (S.vAba === "agenda") { S.agAba = q.get("aba") === "semana" ? "semana" : "hoje"; S.agFiltro = q.get("f") || ""; }
    if (S.vAba === "leads") { S.leadVista = q.get("vista") || "caixa"; S.funVista = q.get("por") === "fonte" ? "fonte" : "etapa"; S.funCel = ""; S.exp.arq = false; if (qs) { S.leadCamp = q.get("campanha") || ""; S.leadFonte = q.get("fonte") || ""; } }
    if (S.vAba === "clientes") { S.cliVista = q.get("vista") || "todos"; S.exp.cli = false; }
  }
  if (antes !== S.ultimaRota && Date.now() - (toast.em || 0) > 150) document.getElementById("toast").classList.add("hidden"); // toast de outro fluxo não vaza pra rota nova
  if (antes !== S.ultimaRota) { S.caixaSel = null; S.caixaIdx = 0; S.editPrev = false; S.agSel = null; S.resSel = null; S.proxFoco = false; S.gaveta = false; if (!S.manterFlash) S.flash = null; if (S.tela === "cliente") S.aba = "atividade"; }
  S.ultimaRota = antes; S.manterFlash = false;
  S.conv.forEach((v) => { if (!(S.tela === "conversa" && v.id === S.id)) v.msgs.forEach((x) => delete x.nova); });
  if (S.tela === "conversa") { const v = conversa(S.id); if (v && v.naoLidas && !sup()) { v.msgs.slice(-v.naoLidas).forEach((x) => (x.nova = true)); v.naoLidas = 0; } S.rolarFim = true; }
  S.menu = false; S.modal = null; S.drop = null; render(); window.scrollTo(0, 0);
}
const ir = (hash) => { if (location.hash === hash) rotear(); else location.hash = hash; };
function toast(t) { toast.em = Date.now(); const el = document.getElementById("toast"); el.innerHTML = t; el.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.add("hidden"), 3500); }
function sincronizarMockbar() {
  const sel = document.getElementById("como");
  sel.querySelectorAll("option[data-extra]").forEach((o) => o.remove());
  if (S.como !== "fer" && S.como !== "sup") { const o = document.createElement("option"); o.value = S.como; o.dataset.extra = "1"; o.textContent = `${vend(S.como).curto} (via Entrar como)`; sel.appendChild(o); }
  sel.value = S.como;
}
const abrirModal = (o) => { S.modal = o; S.modalTopo = true; render(); };
function enviar(id) {
  const v = conversa(id), t = (S.rascunho[id] || "").trim();
  if (!t) return toast("Escreva a resposta primeiro.");
  if (v.fechada) { v.fechada = false; v.msgs.push({ sis: true, d: HOJE, h: agora(), t: `Reaberto por ${vend(v.dona).curto}` }); }
  tick(); v.msgs.push({ dir: "eu", d: HOJE, h: agora(), t }); v.dia = HOJE; v.hora = agora(); v.naoLidas = 0; S.rascunho[id] = "";
  const c = v.conta ? conta(v.conta) : null;
  if (c && !c.eventos.some((e) => e.conv === v.id && !e.res)) c.eventos.unshift({ d: HOJE, h: agora(), canal: v.canal, dir: "eu", res: null, memo: "", auto: true, conv: v.id });
  // fase anda sozinha: 1ª mensagem dela pela V3 a um lead Novo (ou da caixa) → Contatado, "movido pela V3"
  const moveu = c && (c.neg?.etapa === "novo" || naCaixa(c)) && moverEtapa(c, "contatado", "v3", "1ª mensagem dela pela Central");
  // enviou a partir do item da agenda: o contato agendado de hoje está feito
  let concluiu = false;
  if (c && S.deItem === c.id && c.prox && c.prox.d <= HOJE) { const t0 = c.prox; c.prox = null; concluiu = true; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Contato agendado concluído (${t0.assunto}) pelo ${CANAL[v.canal].nome}` }); feito(c.id, `${CANAL[v.canal].nome} · ${esc(t0.assunto)} · enviado`); }
  S.deItem = null;
  S.rolarFim = true; render(); toast(`${concluiu ? "Enviado · o contato agendado de hoje ficou feito" : c ? "Enviado pelo chip dela · a Atividade da ficha atualiza o ticket" : "Enviado pelo chip dela"}${moveu ? " · etapa → Contatado (movido pela V3)" : ""}`);
}

// WhatsApp: na Central (abre/começa a conversa dela na V3) ou no WhatsApp Web do chip dela (SPEC_V3 §10)
function waCentral(c) {
  let v = S.conv.filter((x) => x.conta === c.id && x.canal === "whatsapp").sort((a, b) => Number(a.fechada) - Number(b.fechada))[0];
  if (!v) { const p = pessoaPrincipal(c); v = { id: ++S.seqConv, dona: c.dona, canal: "whatsapp", nome: p?.nome || c.nome, conta: c.id, hora: agora(), dia: HOJE, naoLidas: 0,
    msgs: [{ sis: true, d: HOJE, h: agora(), t: "Conversa nova · fora da janela de 24 h: a V3 oferece um template pro 1º envio" }] }; S.conv.push(v); }
  S.deItem = c.prox && c.prox.d <= HOJE ? c.id : null;
  ir(`#/conversas/${v.id}`); setTimeout(() => document.getElementById("composer")?.focus(), 50);
}
function waWeb(c) {
  tick();
  const p = pessoaPrincipal(c), link = waLink(p?.tel || "");
  let v = S.conv.find((x) => x.conta === c.id && x.canal === "whatsapp" && !x.fechada);
  if (!v) { v = { id: ++S.seqConv, dona: c.dona, canal: "whatsapp", nome: p?.nome || c.nome, conta: c.id, hora: agora(), dia: HOJE, naoLidas: 0, msgs: [] }; S.conv.push(v); }
  v.msgs.push({ dir: "eu", d: HOJE, h: agora(), t: "(mandado pelo WhatsApp Web do chip dela — chega aqui pelo eco da coexistência, origem celular)" }); v.dia = HOJE; v.hora = agora();
  const ev = c.eventos.find((e) => e.conv === v.id && !e.res);
  if (ev) ev.web = true; else c.eventos.unshift({ d: HOJE, h: agora(), canal: "whatsapp", dir: "eu", res: null, memo: "", auto: true, conv: v.id, web: true });
  const tinha = c.prox && c.prox.d <= HOJE ? c.prox : null;
  const moveu = (c.neg?.etapa === "novo" || naCaixa(c)) && moverEtapa(c, "contatado", "v3", "1ª mensagem dela pelo WhatsApp Web (eco)");
  if (tinha) { c.prox = null; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Contato agendado concluído (${tinha.assunto}) pelo WhatsApp Web` }); }
  feito(c.id, `WhatsApp Web${tinha ? ` · ${esc(tinha.assunto)}` : ""} · amanhã vira "esperando resposta" se ninguém responder`);
  render(); toast(`Abre ${link} numa aba nova${tinha ? " · item marcado como feito" : " · entrou na Atividade"}${moveu ? " · etapa → Contatado (movido pela V3)" : ""}`);
}
function adiar(c, modo) {
  if (modo === "data") return abrirModal({ tipo: "agenda", id: c.id, adiar: true, prox: { ...proxVazio(c.prox?.assunto || "cobrar resposta"), h: c.prox?.h || "", modo: "data" }, canal: canalPrevisto(c) });
  tick(); const antes = c.prox, d = modo === "amanha" ? AMANHA() : MAIS3();
  c.prox = { d, h: antes?.h || "", assunto: antes?.assunto || "cobrar resposta", canal: antes?.canal || (convAberta(c)?.canal ?? "whatsapp") };
  c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Adiado: ${antes ? rotProx(antes) : "esperando resposta"} → ${rotProx(c.prox)}` });
  render(); toast(`Adiado pra ${rotProx(c.prox)} — sai de hoje, está na Agenda › Semana`);
}
function proxDiaUtil(d, k) { let x = d; do { x = somaDias(x, k); } while ([0, 6].includes(dow(x))); return x; }
function converterGescor(c) {
  c.tipo = "cliente"; c.eraLead = { fonte: c.fonte, campanha: c.neg.campanha };
  c.bi = { consumo: c.neg.litros || 2000, ultimo: HOJE, vencidos: 0, titulos: 0, limite: 50000, segmento: c.segmento, desde: 2026, primeira: HOJE, ciclo: 14, tanques: 0, l12: c.neg.litros || 2000, r12: (c.neg.litros || 2000) * 6.2, comodatoEquip: [], proxEntrega: null };
  c.neg.mov = { por: "gescor", d: HOJE, h: agora() };
  c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Achou o CNPJ no BI: cadastrado no rep 0412 (o seu) · virou Cliente · GESCOR", mov: "gescor" });
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-acao]");
  if (S.drop && !e.target.closest(`[data-drop="${S.drop}"]`)) { S.drop = null; if (!el) return render(); }
  if (!el) return;
  const a = el.dataset.acao, v = el.dataset.v, m = S.modal;
  if ((a === "fundo" || a === "fundo-gaveta") && !("fundo" in e.target.dataset)) return;
  if (a !== "drop") S.drop = null;
  switch (a) {
    case "drop": S.drop = S.drop === v ? null : v; return render();
    case "ag-aba": S.agAba = v; S.agFiltro = ""; history.replaceState(null, "", v === "semana" ? "#/vendas/agenda?aba=semana" : "#/vendas/agenda"); S.ultimaRota = "#/vendas/agenda"; return render();
    case "gaveta": case "fundo-gaveta": S.gaveta = a === "gaveta" ? !S.gaveta : false; return render();
    case "sug": { const [id, modo, k] = v.split("|"); return agendarSug(conta(id), modo, k); }
    case "sug-sel": S.sugSel = S.sugSel.includes(Number(v)) ? S.sugSel.filter((x) => x !== Number(v)) : [...S.sugSel, Number(v)]; return render();
    case "sug-limpar": S.sugSel = []; return render();
    case "sug-lote": { const sg = sugestoes(), ids = [...S.sugSel]; ids.forEach((id) => { const s = sg.find((x) => x.c?.id === id); if (s) agendarSug(s.c, v, s.k, true); }); S.sugSel = []; S.flash = ids[0];
      render(); return toast(`${ids.length} agendados pra ${v === "hoje" ? "hoje (sem hora, no topo do dia)" : rotData(AMANHA())}`); }
    case "sug-filtro": S.sugFiltro = v; S.exp.sug = false; return render();
    case "lote-leads": { const i = v.lastIndexOf("|"); return loteLeads(v.slice(0, i), v.slice(i + 1)); }
    case "nao-falar": { const [id, motivo] = v.split("|"), c = conta(id); c.naoFalarAte = somaDias(HOJE, 30); c.naoFalarN = (c.naoFalarN || 0) + 1;
      c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Não falar por 30 d · ${motivo}` }); render();
      return toast(c.naoFalarN >= 2 && aberto(c) ? `${esc(c.nome)}: 2ª vez "não falar" — vale marcar Perdido na ficha?` : `${esc(c.nome)} some das sugestões até ${dm(c.naoFalarAte)} (${motivo})`); }
    case "res-dia": S.resDia = v === "0" ? HOJE : proxDiaUtil(S.resDia, Number(v)); S.resSel = null; return render();
    case "tl-sel": S.resSel = S.resSel === Number(v) ? null : Number(v); S.flash = null; return render();
    case "levar-atrasados": { const l = meus(S.contas).filter((c) => c.prox && c.prox.d < HOJE); tick(); l.forEach((c) => { const antes = rotProx(c.prox); c.prox = { ...c.prox, d: AMANHA() }; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Levado pra amanhã (era ${antes})` }); });
      render(); return toast(`${l.length} atrasados levados pra ${rotData(AMANHA())} · dia fechado`); }
    case "fun-vista": S.funVista = v; S.funCel = ""; history.replaceState(null, "", v === "fonte" ? "#/vendas/leads?vista=funil&por=fonte" : "#/vendas/leads?vista=funil"); S.ultimaRota = "#/vendas/leads"; return render();
    case "fun-foco": S.funVista = "etapa"; S.funCel = ""; S.funFech = Object.fromEntries(ETAPAS_FUNIL.map(([k]) => [k, k !== v])); render(); return document.getElementById("sec-" + v)?.scrollIntoView({ block: "start" });
    case "lead-vista": S.leadVista = v; S.funCel = ""; S.exp.arq = false; S.caixaSel = null; S.caixaIdx = 0; history.replaceState(null, "", v === "caixa" ? "#/vendas/leads" : `#/vendas/leads?vista=${v}`); S.ultimaRota = "#/vendas/leads"; render(); return window.scrollTo(0, 0);
    case "cli-vista": S.cliVista = v; S.exp.cli = false; history.replaceState(null, "", v === "todos" ? "#/vendas/clientes" : `#/vendas/clientes?vista=${v}`); S.ultimaRota = "#/vendas/clientes"; render(); return window.scrollTo(0, 0);
    case "fontes-sug": return abrirModal({ tipo: "fontes" });
    case "fun-cel": S.funCel = v; return render();
    case "fun-fech": S.funFech[v] = !S.funFech[v]; return render();
    case "caixa-sel": S.caixaSel = Number(v); S.drop = null; render(); if (innerWidth < 1024) window.scrollTo(0, 0); return;
    case "caixa-nav": return navCaixa(Number(v));
    case "caixa-voltar": S.caixaSel = null; return render();
    case "prev-editar": S.editPrev = !S.editPrev; render(); if (S.editPrev) document.getElementById("prev-nec")?.focus(); return;
    case "lead-semcls": S.leadSemCls = !S.leadSemCls; return render();
    case "cls-vale": { const [id, x] = v.split("|"), c = conta(id); c.cls ||= {}; c.cls.vale = c.cls.vale === x ? null : x; return render(); }
    case "cls-prod": { const [id, x] = v.split("|"); conta(id).neg.produto = x; return render(); }
    case "caixa-agendar": { const c = conta(v), p = pessoaPrincipal(c); return abrirModal({ tipo: "agenda", id: c.id, prox: proxVazio("1º contato"), canal: p?.tel && /\(\d\d\) 9/.test(p.tel) ? "whatsapp" : "telefone" }); }
    case "descartar": return abrirModal({ tipo: "descartar", id: Number(v), motivo: "" });
    case "salvar-descartar": { if (!m.motivo) { m.erro = true; return render(); } const c = conta(m.id); tick(); c.neg.motivo = m.motivo; c.neg.descartado = true; c.prox = null; moverEtapa(c, "perdido", "ela", `descartado da caixa · ${m.motivo}`);
      S.modal = null; render(); return toast(`${esc(c.nome)} descartado · foi pro Arquivo (Leads › Arquivo)`); }
    case "path": { const [id, et] = v.split("|"); return abrirRegistrar(Number(id), null, false, false, ETAPA_RES[et]); }
    case "fonte-atraso": S.fonteAtraso = !S.fonteAtraso; render(); return toast(`Em atraso ${S.fonteAtraso ? "ligado" : "desligado"} nas Ações sugeridas da equipe`);
    case "proposta-app": { const c = conta(v); tick(); c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Proposta #1441 gerada pelo app (PDF comercial)" });
      const mv = aberto(c) && RANK[c.neg.etapa] < RANK.proposta && moverEtapa(c, "proposta", "proposta", "#1441 gerada pro CNPJ");
      render(); return toast(`(mockup) Abre Propostas com o CNPJ da ficha · proposta #1441${mv ? " · etapa → Proposta (movido pela proposta)" : ""}`); }
    case "pedido-app": { const c = conta(v); if (c.tipo === "cliente" && !aberto(c)) return toast("(mockup) Abre Pedidos internos · anotar pedido pra este cliente.");
      tick(); c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Pedido #1290 anotado no app (5.000 L)" }); const mv = aberto(c) && moverEtapa(c, "ganho", "pedido", "pedido #1290 anotado"); c.prox = null;
      render(); return toast(mv ? `Pedido anotado · etapa → Ganho (movido pelo pedido)${c.tipo === "prospect" ? " · Aguardando GESCOR" : ""}` : "Pedido anotado."); }
    case "ja-cadastrei": { const c = conta(v); S.checando = c.id; c.gescorSolicitado = HOJE; render();
      return setTimeout(() => { S.checando = null; converterGescor(c); render(); toast(`${esc(c.nome)} achado no BI (rep 0412) · virou Cliente com o negócio · saiu de Leads e está em Clientes`); }, 1300); }
    case "ligar": return abrirRegistrar(Number(v), null, false, true);
    case "wa-central": return waCentral(conta(v));
    case "wa-web": return waWeb(conta(v));
    case "email": { const c = conta(v), cv = S.conv.find((x) => x.conta === c.id && x.canal === "email"); if (cv) { S.deItem = c.prox && c.prox.d <= HOJE ? c.id : null; return ir(`#/conversas/${cv.id}`); }
      const p = c.pessoas.find((x) => x.email); return toast(p ? `(mockup) E-mail novo pra ${p.email} — a V3 abre o composer na caixa dela (e-mail só formaliza proposta).` : "Ninguém com e-mail nesta ficha — adicione em Pessoas."); }
    case "adiar": { const [id, modo] = v.split("|"); return adiar(conta(id), modo); }
    case "pwa": return toast(`(mockup) Abre ${PWA_DESTINO[v]} — a página que já existe, recortada pela carteira de ${quemRecorte()}.`);
    case "negocio-novo": return abrirModal({ tipo: "negocio", id: null, conta: "", produto: "S10", litros: "2000", comodato: false, conc: "", campanha: "", prox: proxVazio("1º contato do negócio") });
    case "menu": S.menu = !S.menu; return render();
    case "fundo": case "fechar": S.modal = null; return render();
    case "expandir": S.exp[v] = !S.exp[v]; return render();
    case "sel": S.sel = v; return render();
    case "conv-vista": S.convVista = v; return render();
    case "aba": S.aba = v; return render();
    case "semana": S.semana = v === "0" ? 0 : S.semana + Number(v); S.agSel = null; return render();
    case "ag-sel": S.agSel = S.agSel === Number(v) ? null : Number(v); return render();
    case "ir": if (!e.target.closest("a")) ir(v); return;
    case "fazer": case "registrar": return abrirRegistrar(Number(v));
    case "resultado": return abrirRegistrar(null, Number(el.dataset.conv));
    case "fechar-agendar": return abrirRegistrar(null, Number(el.dataset.conv), true);
    case "agendar": { const c = conta(v); return abrirModal({ tipo: "agenda", id: c.id, prox: proxVazio(c.prox?.assunto || (recompra(c) ? "hora de pedir" : naCaixa(c) || semContato(c) ? "1º contato" : "")), canal: canalPrevisto(c) }); }
    case "agendar-novo": return abrirModal({ tipo: "agenda", id: null, conta: "", prox: proxVazio(""), canal: "telefone" });
    case "m-set": m[el.dataset.campo] = v; if (el.dataset.campo === "res") { m.erroRes = false; m.erroProx = ""; if (v === "qualificado") m.prox.modo = "previsao"; else if (m.prox.modo === "previsao") m.prox.modo = null; } return render();
    case "prox-atalho": { m.prox.modo = v; m.erroProx = "";
      if (v === "hoje2h") { m.prox.d = HOJE; m.prox.h = maisHoras(agora(), 2); }
      else if (v === "previsao") { m.prox.d = ""; m.prox.h = ""; }
      else if (v === "ciclo") { const c = conta(m.id || m.conta); let d = somaDias(c.bi.ultimo, c.bi.ciclo); if (d <= HOJE) d = AMANHA(); while ([0, 6].includes(dow(d))) d = somaDias(d, 1); m.prox.d = d; }
      else m.prox.d = v === "amanha" ? AMANHA() : v === "3du" ? MAIS3() : (m.prox.d || "");
      render(); if (v === "data") document.getElementById("p-d")?.focus(); return; }
    case "salvar-reg": return salvarRegistro();
    case "salvar-agenda": return salvarAgenda();
    case "novo-lead": return abrirNovoLead(el.dataset.conv ? Number(el.dataset.conv) : null, el.dataset.q || "");
    case "cnpj-exemplo": Object.assign(m, { cnpj: v === "novo" ? CNPJ_EXEMPLO_NOVO : (S.contas.find((c) => c.id === 4) || S.contas[0]).cnpj, erro: "", receita: null, ja: null }); render(); return consultar();
    case "consultar": return consultar();
    case "salvar-novo": return salvarNovo();
    case "perder": { const c = conta(v); return abrirModal({ tipo: "perder", id: c.id, motivo: "", conc: c.neg?.concorrente || "" }); }
    case "salvar-perder": { if (!m.motivo) { m.erro = true; return render(); } const c = conta(m.id); tick(); Object.assign(c.neg, { motivo: m.motivo, concorrente: m.conc }); c.prox = null;
      moverEtapa(c, "perdido", "ela", `${m.motivo}${m.conc ? " · " + m.conc : ""}`); S.modal = null; toast("Negócio marcado como perdido · foi pro Arquivo."); return render(); }
    case "abrir-negocio": { const c = conta(v), n = novoNeg(c); return abrirModal({ tipo: "negocio", id: c.id, produto: n.produto, litros: String(n.litros), comodato: false, conc: "", campanha: recompra(c) && recompra(c) !== "pronto" ? "re" : "", prox: proxVazio("1º contato do negócio") }); }
    case "salvar-negocio": { const c = conta(m.id || m.conta), l = Number(soDig(m.litros)); m.erro = !l; m.erroConta = !c; if (!c) return render(); const ok = c.prox || validarProx(m, false); if (m.erro || !ok) return render();
      tick(); c.neg = novoNeg(c, { produto: m.produto, litros: l, comodato: m.comodato, concorrente: m.conc, campanha: m.campanha || "", mov: { por: "ela", d: HOJE, h: agora() } }); if (!c.prox) c.prox = proxFinal(m.prox);
      c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Negócio aberto · ${litros(l)}/mês ${m.produto}${m.comodato ? " + comodato" : ""} · etapa Novo` }); S.modal = null; toast("Negócio aberto · etapa Novo"); return render(); }
    case "visita": { const c = conta(v); c.neg.visita = !c.neg.visita; c.neg.visitaFeita = false; if (c.neg.visita) c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Visita solicitada ao supervisor" });
      toast(c.neg.visita ? "Visita solicitada — aparece em Equipe pro supervisor." : "Pedido de visita retirado."); render(); if (c.neg.visita) document.getElementById("visita-nota")?.focus(); return; }
    case "visita-feita": { const c = conta(v); c.neg.visitaFeita = true; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Visita marcada como atendida por ${SUPERVISOR.curto}` }); toast(`Visita de ${c.nome} marcada como atendida.`); return render(); }
    case "gescor": return abrirModal({ tipo: "gescor", id: Number(v) });
    case "copiar-ficha": return copiar(fichaGescor(conta(v)).map(([k, x]) => `${k}: ${x || "—"}`).join("\n"));
    case "vincular": return abrirModal({ tipo: "vincular", id: Number(v) });
    case "vincular-cli": { const cv = conversa(S.modal.conv || S.modal.id), c = conta(v); ligarConversa(cv, c, ""); S.modal = null; toast(`Número vinculado a ${c.nome}.`); return ir(`#/conversas/${cv.id}`); }
    case "ignorar": S.conv = S.conv.filter((x) => x.id !== Number(v)); toast("Conversa ignorada (sai da caixa)."); return ir("#/conversas");
    case "enviar": return enviar(Number(el.dataset.conv));
    case "reabrir-conv": { const cv = conversa(v); cv.fechada = false; cv.msgs.push({ sis: true, d: HOJE, h: agora(), t: `Reaberto por ${vend(cv.dona).curto}` }); S.rolarFim = true; return render(); }
    case "modulo": { const c = el.dataset.conta ? conta(el.dataset.conta) : null; return toast(`(mockup) Abre ${MOD_NOME[v]} — a tela que já existe — filtrada por ${c ? c.nome : sup() && !S.sel ? "toda a equipe" : `carteira de ${vend(S.sel || S.como).curto}`}.`); }
    case "mock": return toast(`(mockup) ${v}`);
    case "pedir-credito": { const c = conta(v); c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Análise de crédito pedida" }); toast("Análise de crédito pedida — abre em Crédito com o CNPJ da ficha."); return render(); }
    case "pessoa": return abrirModal({ tipo: "pessoa", id: Number(v), nome: "", tel: "", email: "", papel: "decisor", prefere: "whatsapp" });
    case "salvar-pessoa": { if (!m.nome.trim() || (!soDig(m.tel) && !m.email.trim())) { m.erro = true; return render(); } conta(m.id).pessoas.push({ nome: m.nome.trim(), papel: m.papel, tel: m.tel, email: m.email, prefere: m.prefere }); S.modal = null; toast("Pessoa adicionada."); return render(); }
    case "entrar-como": S.como = v; S.entrouComo = true; S.sel = ""; sincronizarMockbar(); return ir("#/vendas");
    case "sair-como": S.como = "sup"; S.entrouComo = false; sincronizarMockbar(); return ir("#/equipe");
    // importação
    case "imp-exemplo": { const i = S.imp; i.texto = exemploImport(); if (!i.fonte) i.fonte = "lista"; if (!i.camp) i.camp = "Lista Cotia nov/26"; i.erro = {}; return render(); }
    case "imp-ia": { const i = S.imp; i.erro = {}; if (!i.fonte) i.erro.fonte = true; if (!i.camp.trim()) i.erro.camp = true; if (!i.texto.trim()) i.erro.texto = "Cole a lista ou suba um arquivo."; if (Object.keys(i.erro).length) return render();
      i.ia = true; render(); return setTimeout(() => { i.ia = false; impIrConferir(normalizarTexto(i.texto)); }, 1200); }
    case "imp-formato": return impIrConferir(lerFormato(S.imp.texto));
    case "imp-linha": S.imp.linhas[Number(v)].imp = !S.imp.linhas[Number(v)].imp; return render();
    case "imp-todos": { const t = !S.imp.linhas.every((l) => l.imp); S.imp.linhas.forEach((l) => (l.imp = t)); return render(); }
    case "imp-receita": { const i = S.imp; i.receita = true; render();
      return setTimeout(() => { i.linhas.forEach((l, k) => { const s = situacaoImp(l, k, i.linhas); if (!l.cnpj || !cnpjValido(l.cnpj) || s[3]) return; const r = RECEITA[soDig(l.cnpj)];
          l.razao = r ? r.razao : `${l.empresa || "Empresa " + soDig(l.cnpj).slice(0, 4)} Ltda`; if (!l.empresa) l.empresa = r?.fantasia || l.razao; if (!l.cidade) l.cidade = r?.cidade || "Cotia"; l.rec = true; });
        i.receita = false; render(); toast("Receita: razão social e cidade preenchidas nas linhas com CNPJ (em verde)"); }, 900); }
    case "imp-exp": { const ab = S.imp.aberta || (S.imp.aberta = {}); ab[v] = !ab[v]; return render(); }
    case "imp-voltar": S.imp.passo = 1; return render();
    case "imp-confirmar": return impConfirmar();
    case "imp-dist": return impDistribuir(v);
    case "imp-nova": S.imp = impVazio(); return render();
    case "imp-desfazer": { const h = S.importacoes.find((x) => x.id === Number(v)); S.contas = S.contas.filter((c) => !h.ids.includes(c.id)); h.desfeita = true; render(); return toast(`Importação desfeita · ${h.ids.length} leads removidos`); }
  }
});
document.addEventListener("toggle", (e) => { if (e.target.dataset?.erp) S.erpAberto = e.target.open; if (e.target.dataset?.prox) S.proxFechado = !e.target.open; }, true);
document.addEventListener("change", (e) => {
  if (e.target.id === "imp-arq" && e.target.files?.length) { const i = S.imp; i.texto = exemploImport(); if (!i.fonte) i.fonte = "lista"; if (!i.camp) i.camp = e.target.files[0].name.replace(/\.\w+$/, ""); render(); toast(`(mockup) Lido ${esc(e.target.files[0].name)} · ${i.texto.split("\n").length} linhas`); }
});
document.addEventListener("input", (e) => {
  const t = e.target, m = S.modal, k = t.dataset.input;
  if (k === "busca") { S.buscaQ = t.value; return render(); }
  if (k === "cli-q") { S.cliQ = t.value; S.exp.cli = false; return render(); }
  if (k === "convq") { S.convQ = t.value; return render(); }
  if (k === "fun-fonte") { S.funFonte = t.value; S.funCel = ""; return render(); }
  if (k === "fun-camp") { S.funCamp = t.value; S.funCel = ""; return render(); }
  if (k === "lead-fonte") { S.leadFonte = t.value; return render(); }
  if (k === "lead-camp") { S.leadCamp = t.value; return render(); }
  if (k === "lead-cid") { S.leadCid = t.value; return render(); }
  if (k === "cls") { const c = conta(t.dataset.v); if (t.dataset.k === "litros") c.neg.litros = Number(soDig(t.value)) || 0; else c.segmento = t.value; return render(); }
  if (k === "prev-nec") { const c = conta(t.dataset.v); if (c.neg) c.neg.previsaoNec = t.value; S.editPrev = false; toast(`Previsão de necessidade: ${mesTxt(t.value) || "—"}`); return render(); }
  if (k === "imp") { S.imp[t.dataset.k] = t.value; if (t.tagName === "SELECT") S.imp.erro = {}; return render(); }
  if (k === "imp-cel") { if (t.dataset.maskc === "cnpj") t.value = cnpjMask(t.value); S.imp.linhas[Number(t.dataset.v)][t.dataset.k] = t.value; return render(); }
  if (k === "composer") { S.rascunho[S.id] = t.value; return; }
  if (k === "visita-nota") { conta(t.dataset.v).neg.visitaNota = t.value; return; }
  if (!m) return;
  if (t.dataset.mask === "cnpj") t.value = cnpjMask(t.value);
  if (t.dataset.mask === "tel") { const d = soDig(t.value).slice(0, 11); t.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d; }
  if (t.dataset.m) { m[t.dataset.m] = t.type === "checkbox" ? t.checked : t.value; if (t.type === "checkbox" || t.tagName === "SELECT" || t.type === "month" || t.type === "date" || t.dataset.m === "litros") render(); return; }
  if (t.dataset.mc) { m.contato[t.dataset.mc] = t.value; return; }
  if (t.dataset.mp) { m.prox[t.dataset.mp] = t.value; if (t.dataset.mp === "d") { m.erroProx = ""; render(); } }
  if (t.dataset.mp === "canal") render();
});
function navCaixa(d) { const l = listaCaixa(); if (!l.length) return; const i = Math.max(0, Math.min(l.length - 1, S.caixaIdx + d)); S.caixaSel = l[i].id; S.caixaIdx = i; render();
  document.querySelector(`[data-acao=caixa-sel][data-v="${l[i].id}"]`)?.scrollIntoView({ block: "nearest" }); }
document.addEventListener("keydown", (e) => {
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && S.tela === "vendas" && S.vAba === "leads" && S.leadVista === "caixa" && !S.modal && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); return navCaixa(e.key === "ArrowDown" ? 1 : -1); }
  if (e.key === "Escape" && (S.modal || S.drop || S.gaveta)) { if (S.modal) S.modal = null; else if (S.drop) S.drop = null; else S.gaveta = false; render(); }
  if (e.key === "Enter" && e.target.id === "n-cnpj") consultar();
  if (e.key === "Enter" && !e.shiftKey && e.target.id === "composer") { e.preventDefault(); enviar(S.id); }
});
window.addEventListener("hashchange", rotear);
window.addEventListener("resize", () => document.documentElement.style.setProperty("--barra", document.querySelector(".mockbar").offsetHeight + "px"));
document.getElementById("como").addEventListener("change", (e) => { S.como = e.target.value; S.entrouComo = false; S.sel = ""; sincronizarMockbar(); ir("#/vendas"); });
document.getElementById("dark").addEventListener("change", (e) => document.documentElement.classList.toggle("dark", e.target.checked));
document.getElementById("large").addEventListener("change", (e) => { document.documentElement.classList.toggle("large", e.target.checked); render(); });
document.getElementById("reiniciar").addEventListener("click", () => { reiniciar(); toast("Recomeçado: dados do início."); });
reiniciar();
