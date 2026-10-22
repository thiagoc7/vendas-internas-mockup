// ── Modais (v5) ─────────────────────────────────────────────────────────────
function casca(tituloTxt, sub, corpo, rodape, largura = "max-w-xl") {
  return `<div class="fixed inset-0 z-[99999] flex items-stretch justify-center sm:items-center sm:p-4" data-acao="fundo">
    <div data-fundo class="absolute inset-0 bg-gray-900/50 dark:bg-black/60"></div>
    <div class="relative flex max-h-full w-full ${largura} flex-col overflow-hidden border-gray-200 bg-white shadow-xl sm:max-h-[90vh] sm:rounded-2xl sm:border dark:border-gray-700 dark:bg-gray-900" role="dialog" aria-modal="true">
      <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-3 dark:border-gray-700">
        <div class="min-w-0"><h3 class="text-base font-semibold text-gray-800 dark:text-white">${tituloTxt}</h3>${sub ? `<p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">${sub}</p>` : ""}</div>
        <button type="button" data-acao="fechar" aria-label="Fechar" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">${ic("x", "h-5 w-5")}</button></div>
      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">${corpo}</div>
      ${rodape ? `<div class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">${rodape}</div>` : ""}
    </div></div>`;
}
const escolha = (opcoes, atual, campo) => `<div class="flex flex-wrap gap-1.5">${opcoes.map(([v, rot]) => `<button type="button" data-acao="m-set" data-campo="${campo}" data-v="${v}" class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${atual === v ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"}">${rot}</button>`).join("")}</div>`;
const erroTxt = (t) => t ? `<p class="mt-1 text-xs font-medium text-error-600 dark:text-error-400">${t}</p>` : "";
const cancelar = `<button type="button" data-acao="fechar" class="${UI.btn}">Cancelar</button>`;

// Próximo contato: obrigatório, com atalhos. "sistema" = data que o prazo automático definiu (dá pra trocar).
const ATALHOS = { hoje2h: () => ["hoje +2h", maisHoras(agora(), 2)], amanha: () => ["amanhã", diaCurto(AMANHA())], "3du": () => ["+3 dias úteis", diaCurto(MAIS3())], d30: () => ["30 dias", diaCurto(util(somaDias(HOJE, 30)))], d60: () => ["60 dias", diaCurto(util(somaDias(HOJE, 60)))], data: () => ["data…", ""] };
const util = (d) => { let x = d; while ([0, 6].includes(dow(x))) x = somaDias(x, 1); return x; };
function blocoProximo(m, lista, o = {}) {
  const p = m.prox, at = (modo, [rot, d]) => `<button type="button" data-acao="prox-atalho" data-v="${modo}" class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${p.modo === modo ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"}">${rot}${d ? ` <span class="font-normal opacity-75">${d}</span>` : ""}</button>`;
  const sis = o.sistema;
  return `<div class="rounded-xl border ${m.erroProx ? "border-error-300 dark:border-error-500/50" : "border-gray-200 dark:border-gray-700"} p-3">
    <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Próximo contato <span class="text-error-500">*</span></p>
    <div class="flex flex-wrap gap-1.5">${sis ? at("sistema", [`sistema: ${esc(sis.rot)}`, diaCurto(sis.d)]) : ""}${lista.map((k) => k === "ciclo" ? (o.ciclo ? at("ciclo", [`ciclo ${o.ciclo} d`, diaCurto(util(somaDias(HOJE, o.ciclo)))]) : "") : at(k, ATALHOS[k]())).join("")}</div>
    ${p.modo === "data" ? `<input type="date" id="p-d" data-mp="d" value="${p.d || ""}" min="${HOJE}" class="${UI.campo} mt-2 sm:w-48">` : ""}
    <div class="mt-2 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)_9rem]"><input type="time" id="p-h" data-mp="h" value="${p.h || ""}" class="${UI.campo}" aria-label="Hora (opcional)">
      <input type="text" id="p-a" data-mp="assunto" value="${esc(p.assunto)}" placeholder="assunto" class="${UI.campo}" aria-label="Assunto">
      <select id="p-canal" data-mp="canal" class="${UI.campo} col-span-2 sm:col-span-1" aria-label="Canal previsto">${[["telefone", "Telefone"], ["whatsapp", "WhatsApp"], ["email", "E-mail"], ["reuniao", "Reunião"]].map(([k, r]) => `<option value="${k}" ${p.canal === k ? "selected" : ""}>${r}</option>`).join("")}</select></div>
    ${erroTxt(m.erroProx)}</div>`;
}
const proxVazio = (assunto = "", canal = "telefone") => ({ d: "", h: "", assunto, modo: null, canal });
function validarProx(m) {
  if (!m.prox.d) { m.erroProx = "Escolha quando é o próximo contato."; return false; }
  if (m.prox.d < HOJE) { m.erroProx = "Essa data já passou."; return false; }
  m.erroProx = ""; return true;
}

// ── Registrar contato (modal único, SPEC_V5 §9): resultados conforme a situação; próximo obrigatório; descartar e ganhou o sistema define ──
const ATALHOS_RES = { nao_atendeu: ["hoje2h", "amanha", "3du", "data"], falar_depois: ["amanha", "3du", "d30", "d60", "data"], cobrar_de_novo: ["amanha", "3du", "data"], conversou: ["amanha", "3du", "ciclo", "d30", "data"], gerar_proposta: ["amanha", "3du", "data"], pediu_proposta: ["amanha", "3du", "data"], perdeu: ["3du", "d30", "data"], ganhou: [] };
function proxSistema(m, c) {
  const r = m.res;
  if (r === "gerar_proposta" || r === "pediu_proposta") return { d: diasUteis(HOJE, P("cobranca")), rot: "cobrar proposta", assunto: `cobrar proposta #${S.seqProp}`, tipo: "cobrar" };
  if (r === "perdeu" && (m.depois === "contato" || !ehProspect(c))) return { d: util(somaDias(HOJE, P("depois"))), rot: `voltar em ${P("depois")} d`, assunto: "voltar a oferecer", tipo: "depois" };
  if (r === "ganhou") return { d: diasUteis(AMANHA(), P("satisf")), rot: "satisfação", assunto: "satisfação da 1ª entrega", tipo: "satisf" };
  if (c.fila?.length && c.prox?.tipo === "satisf" && (r === "conversou" || r === "nao_atendeu")) return r === "conversou" ? { ...c.fila[0], rot: "retorno" } : null;
  return null;
}
const semProximo = (m, c) => m.res === "descartar" || (m.res === "perdeu" && ehProspect(c) && m.depois === "descartar");
function aplicarSistema(m, c) { const s = proxSistema(m, c); if (s && !semProximo(m, c)) Object.assign(m.prox, { modo: "sistema", d: s.d, h: "", assunto: s.assunto }); else if (m.prox.modo === "sistema") Object.assign(m.prox, { modo: null, d: "" }); }
function abrirRegistrar(id, convId = null, fecharConv = false, ligar = false, resPre = null) {
  const v = convId ? conversa(convId) : null, c = conta(id || v.conta), pp = pessoaPrincipal(c);
  S.modal = { tipo: "reg", id: c.id, conv: v ? v.id : null, modo: v ? "resultado" : "contato", fecharConv, ligar, canal: v ? v.canal : "telefone", falei: pp?.nome || "", res: null, memo: "",
    motivo: "", conc: c.concorrente || "", comodTem: null, comodDe: "", comodLit: "", depois: "contato", prox: proxVazio(c.prox?.assunto && c.prox.tipo !== "cobrar" && c.prox.tipo !== "primeiro" ? c.prox.assunto : "", c.prox?.canal || canalPrevisto(c)) };
  if (resPre && resultadosDe(c).includes(resPre)) { S.modal.res = resPre; aplicarSistema(S.modal, c); }
  S.modalTopo = true; render();
}
function modalRegistrar(m) {
  const c = conta(m.id), v = m.conv ? conversa(m.conv) : null, pp = pessoaPrincipal(c), sis = proxSistema(m, c), sem = semProximo(m, c);
  const fone = m.ligar && pp?.tel ? `<button type="button" data-acao="mock" data-v="No celular/softphone o número já disca: ${esc(pp.tel)}." class="flex w-full items-center gap-3 rounded-xl border border-brand-200 bg-brand-25 px-3 py-2.5 text-left dark:border-brand-500/30 dark:bg-brand-500/10">
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">${ic("fone", "h-4 w-4")}</span><span class="min-w-0"><span class="block text-lg font-semibold text-gray-800 dark:text-white">${esc(pp.tel)}</span><span class="block text-xs text-gray-500 dark:text-gray-400">${esc(pp.nome)} · toque pra discar</span></span></button>` : "";
  const origem = v ? `<div class="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm dark:bg-white/[0.04]"><span class="text-green-600 dark:text-emerald-300">${icCanal(v.canal)}</span><span class="font-medium text-gray-800 dark:text-white">${CANAL[v.canal].nome} · ${esc(v.nome)}</span></div>`
    : `${fone}<div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}">Canal</label>${escolha([["telefone", `${ic("fone", "h-4 w-4")}Telefone`], ["reuniao", "Reunião"]], m.canal, "canal")}</div>
      ${c.pessoas.length ? `<div><label class="${UI.rotulo}" for="m-falei">Falei com</label><select id="m-falei" data-m="falei" class="${UI.campo}">${c.pessoas.map((p) => `<option value="${esc(p.nome)}" ${m.falei === p.nome ? "selected" : ""}>${esc(p.nome)}${p.papel !== "principal" ? ` (${PAPEL[p.papel] || p.papel})` : ""}</option>`).join("")}<option value="—">ninguém / recepção</option></select></div>` : ""}</div>`;
  const resOps = resultadosDe(c).map((k) => [k, k === "nao_atendeu" && v ? "Sem resposta" : RES[k][0]]);
  const perdeu = m.res === "perdeu" ? `<div class="space-y-3 rounded-xl border border-error-200 bg-error-50/60 p-3 dark:border-error-500/30 dark:bg-error-500/10">
      <div><p class="${UI.rotulo}">Motivo <span class="text-error-500">*</span></p>${escolha(MOTIVOS_PERDA, m.motivo, "motivo")}${erroTxt(m.erroMotivo && "Escolha o motivo.")}</div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="m-conc">Concorrente</label><input id="m-conc" data-m="conc" value="${esc(m.conc)}" placeholder="ex.: Vibra, Ipiranga" class="${UI.campo}"></div>
        <div><p class="${UI.rotulo}">Comodato da concorrência?</p>${escolha([["sim", "Sim"], ["nao", "Não"]], m.comodTem, "comodTem")}</div></div>
      ${m.comodTem === "sim" ? `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="m-comodde">De quem</label><input id="m-comodde" data-m="comodDe" value="${esc(m.comodDe || m.conc)}" class="${UI.campo}"></div><div><label class="${UI.rotulo}" for="m-comodl">Litros (tanque)</label><input id="m-comodl" data-m="comodLit" inputmode="numeric" value="${esc(m.comodLit)}" placeholder="ex.: 15000" class="${UI.campo}"></div></div>` : ""}
      ${ehProspect(c) ? `<div><p class="${UI.rotulo}">E agora?</p>${escolha([["contato", `Em contato · volta em ${P("depois")} d`], ["descartar", "Descartar"]], m.depois, "depois")}</div>` : ""}</div>` : "";
  const desc = m.res === "descartar" ? `<div class="rounded-xl border border-error-200 bg-error-50/60 p-3 dark:border-error-500/30 dark:bg-error-500/10"><p class="${UI.rotulo}">Motivo <span class="text-error-500">*</span></p>${escolha(MOTIVOS_DESC, m.motivo, "motivo")}${erroTxt(m.erroMotivo && "Escolha o motivo.")}</div>` : "";
  const prox = !m.res ? "" : sem ? `<p class="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-600 dark:bg-white/[0.04] dark:text-gray-300">Sem próximo contato · vai pra Descartados</p>`
    : m.res === "ganhou" ? `<div class="rounded-xl border border-success-200 bg-success-50 px-3 py-2.5 text-sm dark:border-success-500/30 dark:bg-success-500/10"><p class="font-semibold text-success-800 dark:text-success-300">Vira Cliente novo</p><p class="mt-0.5 text-success-700 dark:text-success-400">sistema: satisfação ${diaCurto(sis.d)} · retorno ${diaCurto(somaDias(AMANHA(), P("retNovo")))}</p></div>`
    : blocoProximo(m, ATALHOS_RES[m.res] || ["amanha", "3du", "data"], { sistema: sis, ciclo: c.bi?.ciclo });
  const corpo = `<div class="space-y-4">${origem}
    <div><label class="${UI.rotulo}">Resultado <span class="text-error-500">*</span></label>${escolha(resOps, m.res, "res")}${erroTxt(m.erroRes && "Escolha o resultado.")}</div>
    ${perdeu}${desc}
    <div><label class="${UI.rotulo}" for="m-memo">Resumo</label><textarea id="m-memo" data-m="memo" rows="2" placeholder="O que ficou combinado?" class="${UI.campo}">${esc(m.memo)}</textarea></div>${prox}</div>`;
  const titulo = m.fecharConv ? "Fechar e agendar retorno" : m.modo === "resultado" ? "Registrar resultado" : m.ligar ? "Ligar e registrar" : "Registrar contato";
  return casca(titulo, `${esc(c.nome)} · ${ehProspect(c) ? SIT[c.sit] : c.sit ? `Cliente · ${SIT[c.sit]}` : `Cliente ${CTIPO[c.ctipo].toLowerCase()}`}`, corpo, `${cancelar}<button type="button" data-acao="salvar-reg" class="${UI.btnP}">${m.fecharConv ? "Fechar atendimento" : "Salvar"}</button>`);
}
const feito = (id, txt) => S.feitos.push({ id, h: agora(), txt });
function salvarRegistro() {
  const m = S.modal, c = conta(m.id), sis = proxSistema(m, c), sem = semProximo(m, c);
  m.erroRes = !m.res; m.erroMotivo = (m.res === "perdeu" || m.res === "descartar") && !m.motivo;
  const okProx = !m.res || sem || m.res === "ganhou" || validarProx(m);
  if (m.erroRes || m.erroMotivo || !okProx) return render();
  tick();
  const memo = m.memo.trim(), notas = [], antes = c.sit;
  const pend = m.conv ? c.eventos.find((e) => e.conv === m.conv && !e.res) : null;
  if (pend) Object.assign(pend, { res: m.res, memo });
  else c.eventos.unshift({ d: HOJE, h: agora(), canal: m.canal, dir: "eu", res: m.res, memo: m.falei && m.falei !== "—" && !m.conv ? `Falei com ${m.falei}. ${memo}`.trim() : memo, auto: !!m.conv, ...(m.conv ? { conv: m.conv } : {}) });
  const doSistema = m.prox.modo === "sistema" && sis;
  const novoProx = () => ({ d: m.prox.d, h: m.prox.h || "", assunto: m.prox.assunto || (doSistema ? sis.assunto : "retorno"), canal: m.prox.canal || "telefone", tipo: doSistema ? sis.tipo : m.res === "cobrar_de_novo" ? "cobrar" : "contato", por: doSistema ? "sistema" : "ela" });
  if (doSistema && sis.tipo === "retNovo") c.fila.shift();
  switch (m.res) {
    case "gerar_proposta": case "pediu_proposta": {
      const n = String(S.seqProp++); c.prop = { n, d: HOJE, vista: false }; c.sit = "proposta";
      c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Proposta #${n} gerada pelo app (PDF comercial)` });
      c.prox = novoProx(); if (doSistema) c.prox.assunto = `cobrar proposta #${n}`; notas.push(`→ Proposta #${n}`); break; }
    case "descartar": c.sit = "descartado"; c.desc = { d: HOJE, motivo: m.motivo }; c.prox = null; c.fila = null; notas.push("→ Descartados"); break;
    case "ganhou": virarCliente(c, AMANHA()); c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Ganhou → Cliente novo · satisfação ${diaCurto(c.prox.d)} e retorno ${diaCurto(c.fila[0].d)} pelo sistema` }); notas.push("virou Cliente novo"); break;
    case "perdeu": {
      c.perdas = [{ d: HOJE, motivo: m.motivo, conc: m.conc.trim(), comod: m.comodTem === "sim" ? { tem: true, de: (m.comodDe || m.conc).trim(), litros: Number(soDig(m.comodLit)) || 0 } : { tem: false }, obs: memo }, ...(c.perdas || [])];
      if (!ehProspect(c)) { c.sit = null; c.prox = novoProx(); notas.push("negócio perdido"); }
      else if (m.depois === "descartar") { c.sit = "descartado"; c.desc = { d: HOJE, motivo: m.motivo === "nao_diesel" ? "nao_diesel" : m.motivo }; c.prox = null; notas.push("→ Descartados"); }
      else { c.sit = "contato"; c.prox = novoProx(); notas.push("→ Em contato · já perdeu proposta"); }
      break; }
    case "falar_depois": if (c.sit === "novo") { c.sit = "contato"; notas.push("→ Em contato"); } c.prox = novoProx(); break;
    default: c.prox = novoProx();
  }
  if (antes !== c.sit && c.sit) c.eventos.unshift({ d: HOJE, h: agora(), sistema: `${SIT[antes] || "Cliente"} → ${SIT[c.sit]} · ela` });
  const canalTxt = m.conv ? CANAL[conversa(m.conv).canal].nome.toLowerCase() : { telefone: "ligação", reuniao: "reunião" }[m.canal];
  feito(c.id, `${canalTxt} · ${RES[m.res][0].toLowerCase()}${c.prox ? ` · próximo ${rotProx(c.prox)}` : ""}`);
  if (m.conv) { const v = conversa(m.conv); v.naoLidas = 0; v.msgs.forEach((x) => delete x.nova);
    if (m.fecharConv) { v.fechada = true; v.msgs.push({ sis: true, d: HOJE, h: agora(), t: `Fechado por ${vend(v.dona).curto} · ${RES[m.res][0]}${c.prox ? ` · retorno ${rotProx(c.prox)}` : ""}` }); S.proxFoco = true; } }
  S.modal = null; S.flash = c.id;
  toast(`${m.fecharConv ? "Atendimento fechado" : "Registrado"}${notas.length ? " · " + notas.join(" · ") : ""}${c.prox ? ` · próximo ${rotProx(c.prox)}${c.prox.por === "sistema" ? " (sistema)" : ""}` : ""}`);
  render();
}

// Agendar / Reagendar / Reativar (escolher data)
function modalAgendar(m) {
  const c = conta(m.id);
  return casca(m.reativar ? "Reativar prospect" : c.prox ? "Reagendar" : "Agendar", `${esc(c.nome)}${c.prox ? ` · hoje: ${rotProx(c.prox)}` : ""}`, blocoProximo(m, ["amanha", "3du", "d30", "data"]),
    `${cancelar}<button type="button" data-acao="salvar-agenda" class="${UI.btnP}">${m.reativar ? "Reativar" : "Agendar"}</button>`, "max-w-lg");
}
function salvarAgenda() {
  const m = S.modal, c = conta(m.id);
  if (!validarProx(m)) return render();
  tick(); const antes = c.prox;
  c.prox = { d: m.prox.d, h: m.prox.h || "", assunto: m.prox.assunto || "contato", canal: m.prox.canal, tipo: antes?.tipo || (c.sit === "novo" ? "primeiro" : "contato"), por: "ela" };
  if (m.reativar) { c.sit = c.eventos.some((e) => !e.sistema) ? "contato" : "novo"; c.desc = null; c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Reativado → ${SIT[c.sit]} · ela` }); }
  else c.eventos.unshift({ d: HOJE, h: agora(), sistema: antes ? `Reagendado: ${rotProx(antes)} → ${rotProx(c.prox)}` : `Próximo contato: ${rotProx(c.prox)}` });
  S.modal = null; S.flash = c.id; render(); toast(`${esc(c.nome)}: ${m.reativar ? `reativado (${SIT[c.sit]}) · ` : ""}próximo ${rotProx(c.prox)}`);
}

// Novo prospect: CNPJ → Receita · fonte obrigatória · depois "O que fazer agora? Ligar · WhatsApp · Deixar como novo"
function abrirNovoProspect(convId, q = "") {
  const v = convId ? conversa(convId) : null;
  S.modal = { tipo: "novo", cnpj: soDig(q).length === 14 ? cnpjMask(q) : "", consultando: false, receita: null, ja: null, empresa: soDig(q).length ? "" : q, cidade: "", endereco: "",
    contato: { nome: "", tel: v ? v.nome.replace(/^\+55 (\d{2}) /, "($1) ") : "", email: "" }, wa: true, fonte: v ? "whatsapp_numero_novo" : "", campanha: v ? "wa" : "", obs: v ? v.msgs[0]?.t || "" : "", conv: v ? v.id : null, criado: null };
  S.modalTopo = true; render(); setTimeout(() => document.getElementById("n-cnpj")?.focus(), 30);
}
function modalNovo(m) {
  if (m.criado) { const c = conta(m.criado);
    return casca("O que fazer agora?", `${esc(c.nome)} · Prospect novo · ${FONTES[c.fonte]}`, `<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
      ${pessoaPrincipal(c)?.tel ? `<button type="button" data-acao="np-ligar" data-v="${c.id}" class="${UI.btnP} py-3">${ic("fone", "h-4 w-4")}Ligar</button>` : ""}
      <button type="button" data-acao="np-wa" data-v="${c.id}" class="${UI.btn} py-3">${icWa("h-4 w-4")}WhatsApp</button>
      <button type="button" data-acao="np-deixar" data-v="${c.id}" class="${UI.btn} py-3">Deixar como novo</button></div>`, "", "max-w-lg"); }
  const ja = m.ja ? conta(m.ja) : null;
  const corpo = `<div class="space-y-4">
    <div><label class="${UI.rotulo}" for="n-cnpj">CNPJ</label>
      <div class="flex gap-2"><input id="n-cnpj" data-m="cnpj" data-mask="cnpj" inputmode="numeric" value="${esc(m.cnpj)}" placeholder="00.000.000/0000-00" class="${UI.campo} ${m.erro ? "border-error-400" : ""}" ${m.consultando ? "disabled" : ""}>
      <button type="button" data-acao="consultar" class="${UI.btn} shrink-0" ${m.consultando ? "disabled" : ""}>${m.consultando ? `<span class="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></span>Receita…` : "Consultar Receita"}</button></div>${erroTxt(m.erro)}
      ${!m.receita && !m.consultando ? `<p class="mt-1 text-xs text-gray-400">Exemplos: <button type="button" data-acao="cnpj-exemplo" data-v="novo" class="underline">empresa nova</button> · <button type="button" data-acao="cnpj-exemplo" data-v="cliente" class="underline">já é cliente</button></p>` : ""}
      ${m.receita ? `<p class="mt-1.5 text-xs text-success-700 dark:text-success-400">${ic("check", "inline h-3.5 w-3.5")} Receita · ${m.receita.situacao} · ${esc(m.receita.razao)} · ${esc(m.receita.endereco)}</p>` : ""}
      ${ja ? `<p class="mt-1.5 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300">${ja.dona === S.como ? `Já é ${ja.tipo === "cliente" ? "cliente" : "prospect"} seu: <a href="#/fichas/${ja.id}" class="font-semibold underline">${esc(ja.nome)}</a>.` : `Já é ${ja.tipo === "cliente" ? "cliente" : "prospect"} da ${vend(ja.dona).curto} — fale com o supervisor.`}</p>` : ""}</div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="n-emp">Empresa <span class="text-error-500">*</span></label><input id="n-emp" data-m="empresa" value="${esc(m.empresa)}" placeholder="nome fantasia" class="${UI.campo} ${m.erroEmp ? "border-error-400" : ""}">${erroTxt(m.erroEmp && "Diga a empresa.")}</div>
      <div><label class="${UI.rotulo}" for="n-cid">Cidade</label><input id="n-cid" data-m="cidade" value="${esc(m.cidade)}" class="${UI.campo}"></div></div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="n-nome">Contato</label><input id="n-nome" data-mc="nome" value="${esc(m.contato.nome)}" placeholder="nome" class="${UI.campo}"></div>
      <div><label class="${UI.rotulo}" for="n-tel">Telefone</label><input id="n-tel" data-mc="tel" data-mask="tel" value="${esc(m.contato.tel)}" placeholder="(11) 9…" inputmode="tel" class="${UI.campo}">
        <label class="mt-1 flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><input type="checkbox" data-m="wa" ${m.wa ? "checked" : ""} class="h-3.5 w-3.5 rounded">é WhatsApp</label></div></div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="n-fonte">Fonte <span class="text-error-500">*</span></label><select id="n-fonte" data-m="fonte" class="${UI.campo} ${m.erroFonte ? "border-error-400" : ""}"><option value="">De onde veio?</option>${Object.entries(FONTES).map(([k, r]) => `<option value="${k}" ${m.fonte === k ? "selected" : ""}>${r}</option>`).join("")}</select>${erroTxt(m.erroFonte && "A fonte é obrigatória.")}</div>
      <div><label class="${UI.rotulo}" for="n-camp">Campanha</label><select id="n-camp" data-m="campanha" class="${UI.campo}"><option value="">—</option>${S.camps.filter((k) => k.fonte).map((k) => `<option value="${k.id}" ${m.campanha === k.id ? "selected" : ""}>${esc(k.nome)}</option>`).join("")}</select></div></div>
    <div><label class="${UI.rotulo}" for="n-obs">Observação</label><textarea id="n-obs" data-m="obs" rows="2" class="${UI.campo}" placeholder="ex.: 3 geradores no condomínio">${esc(m.obs)}</textarea></div></div>`;
  return casca("Novo prospect", "", corpo, `${cancelar}<button type="button" data-acao="salvar-novo" class="${UI.btnP}" ${ja ? "disabled" : ""}>Criar prospect</button>`, "max-w-2xl");
}

function consultar() {
  const m = S.modal;
  if (!cnpjValido(m.cnpj)) { m.erro = soDig(m.cnpj).length < 14 ? "CNPJ incompleto." : "CNPJ inválido (dígito verificador não confere)."; return render(); }
  m.erro = ""; m.consultando = true; render();
  setTimeout(() => {
    if (S.modal !== m) return;
    const d = soDig(m.cnpj), ja = S.contas.find((c) => soDig(c.cnpj) === d);
    m.ja = ja ? ja.id : null; m.consultando = false;
    m.receita = RECEITA[d] || { razao: "Comercial Exemplo de Combustíveis Ltda", fantasia: "Comercial Exemplo", endereco: "Rua do Exemplo, 100 — Centro — São Paulo/SP — 01000-000", cidade: "São Paulo", situacao: "ATIVA" };
    if (!m.empresa) m.empresa = m.receita.fantasia || m.receita.razao; m.cidade = m.receita.cidade; m.endereco = m.receita.endereco;
    render(); setTimeout(() => document.getElementById("n-nome")?.focus(), 30);
  }, 800);
}

function salvarNovo() {
  const m = S.modal;
  m.erroEmp = !m.empresa.trim(); m.erroFonte = !m.fonte;
  if (m.erroEmp || m.erroFonte || m.ja) return render();
  const v = m.conv ? conversa(m.conv) : null; tick();
  const c = { id: ++S.seq, tipo: "prospect", dona: S.como, nome: m.empresa.trim(), razao: m.receita?.razao || m.empresa.trim(), cnpj: m.cnpj || "—", cidade: m.cidade || "—", endereco: m.endereco, produto: "S10", bi: null, segmento: "", fonte: m.fonte, fonteDet: "", obs: m.obs,
    camp: m.campanha, litros: 0, sit: "novo", entrou: HOJE, perdas: [], prox: null,
    pessoas: m.contato.nome || m.contato.tel ? [{ nome: m.contato.nome.trim() || "contato", papel: "principal", tel: m.contato.tel, email: "", prefere: m.wa ? "whatsapp" : "telefone", principal: true }] : [],
    eventos: [{ d: HOJE, h: agora(), sistema: `Prospect cadastrado · fonte ${FONTES[m.fonte]}${v ? " · a partir da conversa" : ""}` }] };
  if (v) ligarConversa(v, c, m.contato.nome.trim());
  S.contas.push(c); m.criado = c.id; render();
}

// conversa de número desconhecido passa a ser da conta: vira evento automático (sem resultado ainda)
function ligarConversa(v, c, nome) {
  Object.assign(v, { conta: c.id, desconhecido: false, nome: nome || v.nome });
  const ult = v.msgs[v.msgs.length - 1];
  c.eventos.unshift({ d: v.dia, h: ult.h, canal: v.canal, dir: ult.dir, res: null, memo: "", auto: true, conv: v.id });
  if (!c.pessoas.some((p) => soDig(p.tel) && v.nome.includes(soDig(p.tel).slice(-4)))) { /* telefone já veio no contato do prospect */ }
}



function modalVincular(m) {
  const cs = meus(S.contas).sort((a, b) => a.nome.localeCompare(b.nome));
  return casca("Vincular a cliente", esc(conversa(m.id).nome), `<p class="mb-3 ${UI.muted}">De qual ficha da sua carteira é esse número?</p>
    <ul class="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">${cs.map((c) => `<li><button type="button" data-acao="vincular-cli" data-v="${c.id}" class="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"><span class="font-medium text-gray-800 dark:text-white">${esc(c.nome)}</span><span class="flex items-center gap-2 text-xs text-gray-400">${esc(c.cidade)} ${tipoPill(c)}</span></button></li>`).join("")}</ul>`, "", "max-w-md");
}
function modalPessoa(m) {
  return casca("Nova pessoa", esc(conta(m.id).nome), `<div class="space-y-3"><div class="grid grid-cols-1 gap-2 sm:grid-cols-2"><input id="pe-nome" data-m="nome" value="${esc(m.nome)}" placeholder="nome" class="${UI.campo} ${m.erro ? "border-error-400" : ""}"><input id="pe-tel" data-m="tel" data-mask="tel" value="${esc(m.tel)}" placeholder="telefone" inputmode="tel" class="${UI.campo}"></div>
    <input id="pe-email" data-m="email" value="${esc(m.email)}" placeholder="e-mail" class="${UI.campo}">${erroTxt(m.erro && "Nome e telefone ou e-mail.")}
    <div><p class="${UI.rotulo}">Papel</p>${escolha([["decisor", "Decisor"], ["compras", "Compras"], ["financeiro", "Financeiro"], ["operacional", "Operacional"]], m.papel, "papel")}</div>
    <div><p class="${UI.rotulo}">Prefere</p>${escolha([["whatsapp", "WhatsApp"], ["email", "E-mail"], ["telefone", "Telefone"]], m.prefere, "prefere")}</div></div>`,
    `${cancelar}<button type="button" data-acao="salvar-pessoa" class="${UI.btnP}">Adicionar</button>`, "max-w-md");
}
