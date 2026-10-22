// ── Render / rotas / eventos (v5) ───────────────────────────────────────────
function reiniciar() {
  const como = S?.como === "sup" ? "sup" : "fer";
  S = { como, prazos: { ...PRAZO0 }, camps: clone(CAMPANHAS), conv: clone(CONVERSAS), modal: null, menu: false, tela: "vendas", vAba: "hoje", id: null, sel: "", exp: {}, drop: null, relogio: 0, seqConv: 100, seq: 500, seqProp: 1441,
    dia: HOJE, atrAberto: false, pAba: "novos", pFonte: "", pCamp: "", cAba: "todos", buscaQ: "", convVista: "minhas", convQ: "", aba: "atividade", entrouComo: false, rascunho: {}, erpAberto: true,
    flash: null, proxFoco: false, proxFechado: false, deItem: null, imp: null,
    feitos: [{ id: 100 + FEITO_INICIAL, h: "08:30", txt: "ligação · não atendeu · próximo amanhã 10:00" }, { id: 6, h: "09:15", txt: "ligação · conversou · próximo ter 03/11" }],
    importacoes: [{ id: 1, d: "2026-10-19", h: "", fonte: "lista", camp: "Lista Carapicuíba (lote 2)", origem: "planilha (XLSX)", total: 26, aceitos: 23, ids: [], desfeita: false },
      { id: 2, d: "2026-10-05", h: "", fonte: "lista", camp: "Lista Carapicuíba", origem: "planilha (XLSX)", total: 21, aceitos: 18, ids: [], desfeita: false }] };
  S.contas = montarV5(); S.imp = impVazio();
  sincronizarMockbar(); rotear();
}
function tela() {
  switch (S.tela) {
    case "conversas": return telaConversas();
    case "conversa": return telaConversa(S.id);
    case "ficha": return telaFicha(S.id);
    default: return telaVendas();
  }
}
const MODAIS = { reg: modalRegistrar, agenda: modalAgendar, novo: modalNovo, vincular: modalVincular, pessoa: modalPessoa };
function render() {
  const ativo = document.activeElement, idAtivo = ativo?.id, pos = ativo?.selectionStart;
  const modalScroll = document.querySelector("#modal-raiz .overflow-y-auto")?.scrollTop;
  const tl = document.getElementById("timeline"), tlNoFim = !tl || tl.scrollHeight - tl.scrollTop - tl.clientHeight < 40;
  document.documentElement.style.setProperty("--barra", document.querySelector(".mockbar").offsetHeight + "px");
  const corpo = S.tela === "conversa" ? `<main class="flex flex-col">${tela()}</main>` : `<main><div class="mx-auto max-w-screen-2xl p-4 md:p-6">${tela()}</div></main>`;
  document.getElementById("app").innerHTML = sidebar() + `<div class="relative flex min-h-screen flex-col lg:ml-[290px]">${header()}${corpo}</div>`;
  const m = S.modal;
  document.getElementById("modal-raiz").innerHTML = m ? MODAIS[m.tipo](m) : "";
  document.body.style.overflow = m ? "hidden" : "";
  if (modalScroll && m && !S.modalTopo) { const el = document.querySelector("#modal-raiz .overflow-y-auto"); if (el) el.scrollTop = modalScroll; }
  S.modalTopo = false;
  const tl2 = document.getElementById("timeline"); if (tl2 && (tlNoFim || S.rolarFim)) tl2.scrollTop = tl2.scrollHeight; S.rolarFim = false;
  if (idAtivo) { const el = document.getElementById(idAtivo); if (el && el !== document.body) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (_) {} } }
}
// rotas v5 + redirects das antigas (v4/v4.1)
function redirect(h, q, qs) {
  const LEADS = { caixa: "novos", funil: "contato", ganhos: null, arquivo: "descartados" }, CLI = { hora: "recorrentes", negociacao: "todos", atraso: "atraso", comodato: "comodato", inativos: "recorrentes" };
  if (!h[0] || h[0] === "painel" || h[0] === "agenda") return "#/vendas";
  if (h[0] === "vendas" && h[1] === "agenda") return "#/vendas";
  if (h[0] === "vendas" && h[1] === "funil") return "#/vendas/prospects?aba=contato";
  if (h[0] === "vendas" && h[1] === "leads") { if (h[2] === "importar") return "#/vendas/prospects/importar"; const v = q.get("vista") || ({ sem: "caixa", perdidos: "arquivo" }[q.get("f")] || q.get("f")) || "caixa"; return v === "ganhos" ? "#/vendas/clientes?aba=novos" : `#/vendas/prospects?aba=${LEADS[v] || "novos"}`; }
  if (h[0] === "vendas" && h[1] === "clientes" && q.get("vista")) return `#/vendas/clientes?aba=${CLI[q.get("vista")] || "todos"}`;
  if (h[0] === "clientes" && h[1]) return `#/fichas/${h[1]}`;
  if (h[0] === "clientes") return q.get("vista") === "prospect" ? "#/vendas/prospects" : "#/vendas/clientes";
  return null;
}
function rotear() {
  let [caminho, qs] = location.hash.replace(/^#\/?/, "").split("?"); const q = new URLSearchParams(qs || "");
  const h = caminho.split("/").filter(Boolean), novo = redirect(h, q, qs);
  if (novo) { history.replaceState(null, "", novo); return rotear(); }
  const antes = location.hash.split("?")[0];
  S.id = h[1] && h[0] !== "vendas" ? Number(h[1]) : null;
  S.tela = h[0] === "conversas" && h[1] ? "conversa" : h[0] === "conversas" ? "conversas" : h[0] === "fichas" ? "ficha" : "vendas";
  if (S.tela === "vendas") {
    S.vAba = h[0] === "equipe" ? "equipe" : h[0] === "prazos" ? "prazos" : h[1] === "prospects" ? (h[2] === "importar" ? "importar" : "prospects") : h[1] === "clientes" ? "clientes" : "hoje";
    if (S.vAba === "prospects") { S.pAba = q.get("aba") || "novos"; S.exp.pro = false; }
    if (S.vAba === "clientes") { S.cAba = q.get("aba") || "todos"; S.exp.cli = false; }
    if (S.vAba === "hoje") S.dia = q.get("dia") === "amanha" ? AMANHA() : HOJE;
  }
  if (antes !== S.ultimaRota && Date.now() - (toast.em || 0) > 150) document.getElementById("toast").classList.add("hidden");
  if (antes !== S.ultimaRota) { S.proxFoco = false; if (!S.manterFlash) S.flash = null; if (S.tela === "ficha") S.aba = "atividade"; }
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
const BLOCO_NOME = { prospects: "Prospects", clientes: "Clientes", atraso: "Em atraso" };
// conclui o agendamento de hoje (ou atrasado) quando ela fala pelo WhatsApp; a conversa vira "esperando resposta" se ninguém responder
function concluirPorWa(c, como) {
  if (!(c.prox && c.prox.d <= HOJE)) return false;
  const t0 = c.prox; c.prox = null; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Contato agendado concluído (${t0.assunto}) pelo ${como}` }); feito(c.id, `${como} · ${esc(t0.assunto)} · enviado`);
  if (ehProspect(c) && c.sit === "novo") { c.sit = "contato"; c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Novo → Em contato · V3" }); }
  return true;
}
function enviar(id) {
  const v = conversa(id), t = (S.rascunho[id] || "").trim();
  if (!t) return toast("Escreva a resposta primeiro.");
  if (v.fechada) { v.fechada = false; v.msgs.push({ sis: true, d: HOJE, h: agora(), t: `Reaberto por ${vend(v.dona).curto}` }); }
  tick(); v.msgs.push({ dir: "eu", d: HOJE, h: agora(), t }); v.dia = HOJE; v.hora = agora(); v.naoLidas = 0; S.rascunho[id] = "";
  const c = v.conta ? conta(v.conta) : null;
  if (c && !c.eventos.some((e) => e.conv === v.id && !e.res)) c.eventos.unshift({ d: HOJE, h: agora(), canal: v.canal, dir: "eu", res: null, memo: "", auto: true, conv: v.id });
  const concluiu = c && S.deItem === c.id && concluirPorWa(c, CANAL[v.canal].nome);
  if (c && !concluiu && ehProspect(c) && c.sit === "novo") { c.sit = "contato"; c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Novo → Em contato · V3" }); }
  S.deItem = null; S.rolarFim = true; render(); toast(concluiu ? "Enviado · o contato de hoje ficou feito" : "Enviado pelo chip dela");
}
function waCentral(c) {
  let v = S.conv.filter((x) => x.conta === c.id && x.canal === "whatsapp").sort((a, b) => Number(a.fechada) - Number(b.fechada))[0];
  if (!v) { const p = pessoaPrincipal(c); v = { id: ++S.seqConv, dona: c.dona, canal: "whatsapp", nome: p?.nome || c.nome, conta: c.id, hora: agora(), dia: HOJE, naoLidas: 0, msgs: [{ sis: true, d: HOJE, h: agora(), t: "Conversa nova · fora da janela de 24 h: a V3 oferece um template pro 1º envio" }] }; S.conv.push(v); }
  S.deItem = c.prox && c.prox.d <= HOJE ? c.id : null;
  ir(`#/conversas/${v.id}`); setTimeout(() => document.getElementById("composer")?.focus(), 50);
}
function waWeb(c) {
  tick();
  const p = pessoaPrincipal(c), link = waLink(p?.tel || "");
  let v = S.conv.find((x) => x.conta === c.id && x.canal === "whatsapp" && !x.fechada);
  if (!v) { v = { id: ++S.seqConv, dona: c.dona, canal: "whatsapp", nome: p?.nome || c.nome, conta: c.id, hora: agora(), dia: HOJE, naoLidas: 0, msgs: [] }; S.conv.push(v); }
  v.msgs.push({ dir: "eu", d: HOJE, h: agora(), t: "(mandado pelo WhatsApp Web do chip dela — chega aqui pelo eco da coexistência)" }); v.dia = HOJE; v.hora = agora();
  const ev = c.eventos.find((e) => e.conv === v.id && !e.res);
  if (ev) ev.web = true; else c.eventos.unshift({ d: HOJE, h: agora(), canal: "whatsapp", dir: "eu", res: null, memo: "", auto: true, conv: v.id, web: true });
  const tinha = concluirPorWa(c, "WhatsApp Web");
  if (!tinha && ehProspect(c) && c.sit === "novo") c.sit = "contato";
  render(); toast(`Abre ${link} numa aba nova${tinha ? " · item feito" : ""}`);
}
const chaveProx = (c) => c.prox ? c.prox.d : "";
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-acao]");
  if (S.drop && !e.target.closest(`[data-drop="${S.drop}"]`)) { S.drop = null; if (!el) return render(); }
  if (!el) return;
  const a = el.dataset.acao, v = el.dataset.v, m = S.modal;
  if (a === "fundo" && !("fundo" in e.target.dataset)) return;
  if (a !== "drop") S.drop = null;
  switch (a) {
    case "drop": S.drop = S.drop === v ? null : v; return render();
    // próximo contato (toda linha): Hoje · Amanhã · Outro dia ▾ · Reagendar ▾
    case "prox": { const [id, modo, ctx] = v.split("|"), c = conta(id);
      if (modo === "data") return abrirModal({ tipo: "agenda", id: c.id, prox: { ...proxVazio(c.prox?.assunto || (c.sit === "novo" ? "1º contato" : ""), canalPrevisto(c)), modo: "data", h: c.prox?.h || "" } });
      tick(); marcarProx(c, modo, ctx); S.flash = c.id; render();
      return toast(`${esc(c.nome)}: ${rotProx(c.prox)}${c.prox.d === HOJE ? ` · está em Hoje › ${BLOCO_NOME[blocoDe(c)]}` : ""}`); }
    case "dia": S.dia = v === "0" ? HOJE : (() => { let x = S.dia; do { x = somaDias(x, Number(v)); } while ([0, 6].includes(dow(x))); return x; })(); history.replaceState(null, "", S.dia === AMANHA() ? "#/vendas?dia=amanha" : "#/vendas"); return render();
    case "levar-atrasados": { const l = itensHoje(HOJE).atrasados; tick(); l.forEach((c) => { const antes = rotProx(c.prox); c.prox = { ...c.prox, d: AMANHA() }; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Levado pra amanhã (era ${antes})` }); });
      render(); return toast(`${l.length} atrasados levados pra ${rotData(AMANHA())}`); }
    case "p-aba": S.pAba = v; S.exp.pro = false; history.replaceState(null, "", `#/vendas/prospects?aba=${v}`); S.ultimaRota = "#/vendas/prospects"; render(); return window.scrollTo(0, 0);
    case "c-aba": S.cAba = v; S.exp.cli = false; history.replaceState(null, "", v === "todos" ? "#/vendas/clientes" : `#/vendas/clientes?aba=${v}`); S.ultimaRota = "#/vendas/clientes"; render(); return window.scrollTo(0, 0);
    case "path": { const [id, res] = v.split("|"); return abrirRegistrar(Number(id), null, false, false, res); }
    case "reativar": { const c = conta(v); return abrirModal({ tipo: "agenda", id: c.id, reativar: true, prox: proxVazio("retomar contato", canalPrevisto(c)) }); }
    case "proposta-app": return abrirRegistrar(Number(v), null, false, false, conta(v).sit === "proposta" ? null : ehProspect(conta(v)) ? "gerar_proposta" : "pediu_proposta");
    case "visita": { const c = conta(v); c.visita = !(c.visita && !c.visitaFeita); c.visitaFeita = false; c.eventos.unshift({ d: HOJE, h: agora(), sistema: c.visita ? "Visita pedida ao supervisor" : "Pedido de visita retirado" }); render(); return toast(c.visita ? "Visita pedida — aparece em Equipe pro supervisor." : "Pedido de visita retirado."); }
    case "visita-feita": { const c = conta(v); c.visitaFeita = true; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Visita marcada como atendida por ${SUPERVISOR.curto}` }); toast(`Visita de ${c.nome} marcada como atendida.`); return render(); }
    case "ligar": return abrirRegistrar(Number(v), null, false, true);
    case "wa-central": return waCentral(conta(v));
    case "wa-web": return waWeb(conta(v));
    case "email": { const c = conta(v), cv = S.conv.find((x) => x.conta === c.id && x.canal === "email"); if (cv) return ir(`#/conversas/${cv.id}`);
      const p = c.pessoas.find((x) => x.email); return toast(p ? `(mockup) E-mail novo pra ${p.email} — abre o composer da V3 na caixa dela.` : "Ninguém com e-mail nesta ficha — adicione em Pessoas."); }
    case "pwa": return toast(`(mockup) Abre ${PWA_DESTINO[v]} — a página que já existe, recortada pela carteira de ${quemRecorte()}.`);
    case "menu": S.menu = !S.menu; return render();
    case "fundo": case "fechar": { const mm = S.modal; S.modal = null; if (mm?.tipo === "novo" && mm.criado) return ir(`#/fichas/${mm.criado}`); return render(); }
    case "expandir": S.exp[v] = !S.exp[v]; return render();
    case "sel": S.sel = v; return render();
    case "sel-hoje": S.sel = v; return ir("#/vendas");
    case "conv-vista": S.convVista = v; return render();
    case "aba": S.aba = v; return render();
    case "ir": if (!e.target.closest("a")) ir(v); return;
    case "registrar": return abrirRegistrar(Number(v));
    case "resultado": return abrirRegistrar(null, Number(el.dataset.conv));
    case "fechar-agendar": return abrirRegistrar(null, Number(el.dataset.conv), true);
    case "m-set": { m[el.dataset.campo] = v; if (m.tipo === "reg" && (el.dataset.campo === "res" || el.dataset.campo === "depois")) { m.erroRes = false; m.erroProx = ""; if (el.dataset.campo === "res") m.motivo = ""; aplicarSistema(m, conta(m.id)); } return render(); }
    case "prox-atalho": { m.prox.modo = v; m.erroProx = "";
      const c = conta(m.id);
      if (v === "hoje2h") { m.prox.d = HOJE; m.prox.h = maisHoras(agora(), 2); }
      else if (v === "sistema") { const s = proxSistema(m, c); m.prox.d = s.d; m.prox.h = ""; m.prox.assunto = s.assunto; }
      else if (v === "ciclo") m.prox.d = util(somaDias(HOJE, c.bi.ciclo));
      else m.prox.d = v === "amanha" ? AMANHA() : v === "3du" ? MAIS3() : v === "d30" ? util(somaDias(HOJE, 30)) : v === "d60" ? util(somaDias(HOJE, 60)) : (m.prox.d || "");
      render(); if (v === "data") document.getElementById("p-d")?.focus(); return; }
    case "salvar-reg": return salvarRegistro();
    case "salvar-agenda": return salvarAgenda();
    case "novo-prospect": return abrirNovoProspect(el.dataset.conv ? Number(el.dataset.conv) : null, el.dataset.q || "");
    case "np-ligar": S.modal = null; return abrirRegistrar(Number(v), null, false, true);
    case "np-wa": { const c = conta(v), cv = S.conv.find((x) => x.conta === c.id); S.modal = null; return cv ? ir(`#/conversas/${cv.id}`) : waCentral(c); }
    case "np-deixar": S.modal = null; S.flash = Number(v); S.manterFlash = true; toast(`${esc(conta(v).nome)} está em Prospects › Novos`); return ir("#/vendas/prospects?aba=novos");
    case "cnpj-exemplo": Object.assign(m, { cnpj: v === "novo" ? CNPJ_EXEMPLO_NOVO : (S.contas.find((c) => c.id === 4) || S.contas[0]).cnpj, erro: "", receita: null, ja: null }); render(); return consultar();
    case "consultar": return consultar();
    case "salvar-novo": return salvarNovo();
    case "vincular": return abrirModal({ tipo: "vincular", id: Number(v) });
    case "vincular-cli": { const cv = conversa(S.modal.id), c = conta(v); ligarConversa(cv, c, ""); S.modal = null; toast(`Número vinculado a ${c.nome}.`); return ir(`#/conversas/${cv.id}`); }
    case "ignorar": S.conv = S.conv.filter((x) => x.id !== Number(v)); toast("Conversa ignorada."); return ir("#/conversas");
    case "enviar": return enviar(Number(el.dataset.conv));
    case "reabrir-conv": { const cv = conversa(v); cv.fechada = false; cv.msgs.push({ sis: true, d: HOJE, h: agora(), t: `Reaberto por ${vend(cv.dona).curto}` }); S.rolarFim = true; return render(); }
    case "modulo": { const c = el.dataset.conta ? conta(el.dataset.conta) : null; return toast(`(mockup) Abre ${MOD_NOME[v]} — a tela que já existe — filtrada por ${c ? c.nome : quemRecorte()}.`); }
    case "mock": return toast(`(mockup) ${v}`);
    case "pedir-credito": { const c = conta(v); c.eventos.unshift({ d: HOJE, h: agora(), sistema: "Análise de crédito pedida" }); toast("Análise de crédito pedida — abre em Crédito com o CNPJ da ficha."); return render(); }
    case "pessoa": return abrirModal({ tipo: "pessoa", id: Number(v), nome: "", tel: "", email: "", papel: "decisor", prefere: "whatsapp" });
    case "salvar-pessoa": { if (!m.nome.trim() || (!soDig(m.tel) && !m.email.trim())) { m.erro = true; return render(); } conta(m.id).pessoas.push({ nome: m.nome.trim(), papel: m.papel, tel: m.tel, email: m.email, prefere: m.prefere }); S.modal = null; toast("Pessoa adicionada."); return render(); }
    case "entrar-como": S.como = v; S.entrouComo = true; S.sel = ""; sincronizarMockbar(); return ir("#/vendas");
    case "sair-como": S.como = "sup"; S.entrouComo = false; sincronizarMockbar(); return ir("#/equipe");
    // importação (como v4)
    case "imp-exemplo": { const i = S.imp; i.texto = exemploImport(); if (!i.fonte) i.fonte = "lista"; if (!i.camp) i.camp = "Lista Cotia nov/26"; i.erro = {}; return render(); }
    case "imp-ia": { const i = S.imp; i.erro = {}; if (!i.fonte) i.erro.fonte = true; if (!i.camp.trim()) i.erro.camp = true; if (!i.texto.trim()) i.erro.texto = "Cole a lista ou suba um arquivo."; if (Object.keys(i.erro).length) return render();
      i.ia = true; render(); return setTimeout(() => { i.ia = false; impIrConferir(normalizarTexto(i.texto)); }, 1200); }
    case "imp-formato": return impIrConferir(lerFormato(S.imp.texto));
    case "imp-linha": S.imp.linhas[Number(v)].imp = !S.imp.linhas[Number(v)].imp; return render();
    case "imp-todos": { const t = !S.imp.linhas.every((l) => l.imp); S.imp.linhas.forEach((l) => (l.imp = t)); return render(); }
    case "imp-receita": { const i = S.imp; i.receita = true; render();
      return setTimeout(() => { i.linhas.forEach((l, k) => { const s = situacaoImp(l, k, i.linhas); if (!l.cnpj || !cnpjValido(l.cnpj) || s[3]) return; const r = RECEITA[soDig(l.cnpj)];
          l.razao = r ? r.razao : `${l.empresa || "Empresa " + soDig(l.cnpj).slice(0, 4)} Ltda`; if (!l.empresa) l.empresa = r?.fantasia || l.razao; if (!l.cidade) l.cidade = r?.cidade || "Cotia"; l.rec = true; });
        i.receita = false; render(); toast("Receita: razão social e cidade preenchidas (em verde)"); }, 900); }
    case "imp-exp": { const ab = S.imp.aberta || (S.imp.aberta = {}); ab[v] = !ab[v]; return render(); }
    case "imp-voltar": S.imp.passo = 1; return render();
    case "imp-confirmar": return impConfirmar();
    case "imp-dist": return impDistribuir(v);
    case "imp-nova": S.imp = impVazio(); return render();
    case "imp-desfazer": { const h = S.importacoes.find((x) => x.id === Number(v)); S.contas = S.contas.filter((c) => !h.ids.includes(c.id)); h.desfeita = true; render(); return toast(`Importação desfeita · ${h.ids.length} prospects removidos`); }
  }
});
document.addEventListener("toggle", (e) => { if (e.target.dataset?.erp) S.erpAberto = e.target.open; if (e.target.dataset?.prox) S.proxFechado = !e.target.open; if (e.target.dataset?.atr && S.atrAberto !== e.target.open) { S.atrAberto = e.target.open; render(); } }, true);
document.addEventListener("change", (e) => {
  if (e.target.id === "imp-arq" && e.target.files?.length) { const i = S.imp; i.texto = exemploImport(); if (!i.fonte) i.fonte = "lista"; if (!i.camp) i.camp = e.target.files[0].name.replace(/\.\w+$/, ""); render(); toast(`(mockup) Lido ${esc(e.target.files[0].name)} · ${i.texto.split("\n").length} linhas`); }
});
document.addEventListener("input", (e) => {
  const t = e.target, m = S.modal, k = t.dataset.input;
  if (k === "busca") { S.buscaQ = t.value; return render(); }
  if (k === "convq") { S.convQ = t.value; return render(); }
  if (k === "p-fonte") { S.pFonte = t.value; return render(); }
  if (k === "p-camp") { S.pCamp = t.value; return render(); }
  if (k === "prazo") { const n = Number(t.value); if (n >= 1) { S.prazos[t.dataset.k] = n; render(); } return; }
  if (k === "imp") { S.imp[t.dataset.k] = t.value; if (t.tagName === "SELECT") S.imp.erro = {}; return render(); }
  if (k === "imp-cel") { if (t.dataset.maskc === "cnpj") t.value = cnpjMask(t.value); S.imp.linhas[Number(t.dataset.v)][t.dataset.k] = t.value; return render(); }
  if (k === "composer") { S.rascunho[S.id] = t.value; return; }
  if (!m) return;
  if (t.dataset.mask === "cnpj") t.value = cnpjMask(t.value);
  if (t.dataset.mask === "tel") { const d = soDig(t.value).slice(0, 11); t.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d; }
  if (t.dataset.m) { m[t.dataset.m] = t.type === "checkbox" ? t.checked : t.value; if (t.type === "checkbox" || t.tagName === "SELECT") render(); return; }
  if (t.dataset.mc) { m.contato[t.dataset.mc] = t.value; return; }
  if (t.dataset.mp) { m.prox[t.dataset.mp] = t.value; if (t.dataset.mp === "d") { m.prox.modo = "data"; m.erroProx = ""; render(); } }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && (S.modal || S.drop)) { if (S.modal) S.modal = null; else S.drop = null; render(); }
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
