// ── Modais ──────────────────────────────────────────────────────────────────
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
// Próximo contato: obrigatório, com atalhos. o = { hoje2h, ciclo (dias), canal (valor do canal previsto ou null = sem seletor) }
function blocoProximo(p, opcional, erro, o = {}) {
  const at = (modo, rot, d) => `<button type="button" data-acao="prox-atalho" data-v="${modo}" class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${p.modo === modo ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"}">${rot}${d ? ` <span class="font-normal opacity-75">${d}</span>` : ""}</button>`;
  return `<div class="rounded-xl border ${erro ? "border-error-300 dark:border-error-500/50" : "border-gray-200 dark:border-gray-700"} p-3">
    <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Próximo contato ${opcional ? `<span class="font-normal text-gray-400">(opcional — o negócio vai ser encerrado)</span>` : `<span class="text-error-500">*</span>`}</p>
    <div class="flex flex-wrap gap-1.5">${o.previsao ? at("previsao", "na previsão", mesTxt(o.previsao)) : ""}${o.hoje2h ? at("hoje2h", "hoje +2h", maisHoras(agora(), 2)) : ""}${at("amanha", "amanhã", diaCurto(AMANHA()))}${at("3du", "+3 dias úteis", diaCurto(MAIS3()))}${o.ciclo ? at("ciclo", `ciclo: ${o.ciclo} d`) : ""}${at("data", "data…")}</div>
    ${p.modo === "data" ? `<input type="date" id="p-d" data-mp="d" value="${p.d || ""}" min="${HOJE}" class="${UI.campo} mt-2 sm:w-48">` : ""}
    ${p.modo === "previsao" ? `<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">→ sem data: o Qualificado fica "quando precisar ~${mesTxt(o.previsao)}" e volta em Ações sugeridas nesse mês.</p>${erroTxt(erro)}</div>` : `
    <div class="mt-2 grid grid-cols-[7rem_minmax(0,1fr)] gap-2"><input type="time" id="p-h" data-mp="h" value="${p.h || ""}" class="${UI.campo}" aria-label="Hora (opcional)">
      <input type="text" id="p-a" data-mp="assunto" value="${esc(p.assunto)}" list="assuntos" placeholder="assunto (ex.: retorno da proposta)" class="${UI.campo}"></div>
    ${o.canal ? `<div class="mt-2 flex flex-wrap items-center gap-2"><label for="p-canal" class="text-sm text-gray-600 dark:text-gray-300">Canal previsto</label><select id="p-canal" data-mp="canal" class="${UI.campo.replace("w-full ", "")} w-auto py-1.5">${[["telefone", "Telefone"], ["whatsapp", "WhatsApp"], ["email", "E-mail"], ["reuniao", "Reunião"]].map(([k, r]) => `<option value="${k}" ${p.canal === k ? "selected" : ""}>${r}</option>`).join("")}</select></div>` : ""}
    <datalist id="assuntos"><option value="retorno da proposta"><option value="mandar tabela"><option value="falar com o decisor"><option value="fechar comodato"><option value="confirmar 1º pedido"><option value="acompanhar consumo"><option value="tentar de novo"></datalist>
    ${p.d ? `<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">→ ${["hoje", "amanhã"].includes(rotData(p.d)) ? rotData(p.d) + ", " : ""}${diaCurto(p.d)}${p.h ? " às " + p.h : ""}</p>` : ""}${erroTxt(erro)}</div>`}`;
}
const proxVazio = (assunto = "", canal = "telefone") => ({ d: "", h: "", assunto, modo: null, canal });
const proxFinal = (p, canal) => p.d ? { d: p.d, h: p.h || "", assunto: p.assunto || "retorno", canal: canal || p.canal || "telefone" } : null;
function validarProx(m, opcional) {
  if (m.prox.modo === "previsao") { m.erroProx = ""; return true; }
  if (!m.prox.d && !opcional) { m.erroProx = "Todo contato termina com o próximo: escolha um atalho ou uma data."; return false; }
  if (m.prox.d && m.prox.d < HOJE) { m.erroProx = "A data do próximo contato já passou."; return false; }
  m.erroProx = ""; return true;
}
const cicloDe = (c) => c?.tipo === "cliente" && c.bi?.ciclo ? c.bi.ciclo : null;

// Registrar contato (um modal só, dois jeitos de abrir — SPEC_V3 §4.3). O resultado move a etapa (SPEC_V4 §12).
function abrirRegistrar(id, convId = null, fecharConv = false, ligar = false, resPre = null) {
  const v = convId ? conversa(convId) : null, c = conta(id || v.conta), pp = pessoaPrincipal(c);
  const proxNec = c.neg?.previsaoNec || "2026-11";
  S.modal = { tipo: "reg", id: c.id, conv: v ? v.id : null, modo: v ? "resultado" : "contato", fecharConv, ligar, canal: v ? v.canal : "telefone", falei: pp?.nome || "",
    res: resPre, memo: "", motivo: "", conc: c.neg?.concorrente || "", prevNec: proxNec, prox: { ...proxVazio(c.prox?.assunto || "", c.prox?.canal || canalPrevisto(c)), modo: resPre === "qualificado" ? "previsao" : null } };
  S.modalTopo = true; render();
}
const encerra = (m, c) => (aberto(c) || naCaixa(c)) && (m.res === "fechou" || m.res === "recusou");
function efeitoEtapa(m, c) {
  const alvo = RES_ETAPA[m.res];
  if (!c.neg || (!aberto(c) && !naCaixa(c))) return m.res === "pediu_proposta" ? "abre um negócio já em <b>Proposta</b>" : m.res === "qualificado" ? "abre um negócio em <b>Qualificado</b>" : "";
  if (!alvo) return naCaixa(c) ? "sai da caixa de entrada → <b>Novo</b> (não atendeu não avança)" : "não atendeu <b>não move</b> a etapa";
  if (alvo === "perdido") return "negócio → <b>Perdido</b> (vai pro Arquivo)";
  if (!naCaixa(c) && RANK[alvo] <= RANK[c.neg.etapa]) return `continua em <b>${ETAPA_NOME[c.neg.etapa]}</b>`;
  return `${ETAPA_NOME[naCaixa(c) ? "caixa" : c.neg.etapa]} → <b>${ETAPA_NOME[alvo]}</b>${alvo === "ganho" && c.tipo === "prospect" ? " · fica Aguardando GESCOR" : ""}`;
}
function modalRegistrar(m) {
  const c = conta(m.id), v = m.conv ? conversa(m.conv) : null, enc = encerra(m, c), pp = pessoaPrincipal(c);
  const fone = m.ligar && pp?.tel ? `<button type="button" data-acao="mock" data-v="No celular/softphone o número já disca: ${esc(pp.tel)}." class="flex w-full items-center text-left gap-3 rounded-xl border border-brand-200 bg-brand-25 px-3 py-2.5 dark:border-brand-500/30 dark:bg-brand-500/10">
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">${ic("fone", "h-4 w-4")}</span><span class="min-w-0"><span class="block text-lg font-semibold text-gray-800 dark:text-white">${esc(pp.tel)}</span><span class="block text-xs text-gray-500 dark:text-gray-400">${esc(pp.nome)} · toque pra discar · depois registre aqui embaixo</span></span></button>` : "";
  const origem = v ? `<div class="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm dark:bg-white/[0.04]"><span class="text-green-600 dark:text-emerald-300">${icCanal(v.canal)}</span><span class="font-medium text-gray-800 dark:text-white">${CANAL[v.canal].nome} · ${esc(v.nome)}</span>
      <span class="ml-auto text-xs text-gray-400">vem do ticket — já está na Atividade</span></div>`
    : `${fone}<div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}">Canal</label>${escolha([["telefone", `${ic("fone", "h-4 w-4")}Telefone`], ["reuniao", "Reunião"], ["outro", "Outro"]], m.canal, "canal")}</div>
      ${c.pessoas.length ? `<div><label class="${UI.rotulo}" for="m-falei">Quem</label><select id="m-falei" data-m="falei" class="${UI.campo}">${c.pessoas.map((p) => `<option value="${esc(p.nome)}" ${m.falei === p.nome ? "selected" : ""}>${esc(p.nome)}${p.papel !== "principal" ? ` (${PAPEL[p.papel] || p.papel})` : ""}</option>`).join("")}<option value="—">ninguém / recepção</option></select></div>` : ""}</div>`;
  const ef = m.res ? efeitoEtapa(m, c) : "";
  const corpo = `<div class="space-y-4">${origem}
    <div><label class="${UI.rotulo}">Resultado <span class="text-error-500">*</span></label>${escolha(Object.entries(RES).map(([k, r]) => [k, k === "sem_resposta" && v ? "Sem resposta" : r[0]]), m.res, "res")}${erroTxt(m.erroRes && "Escolha o resultado.")}
      ${ef ? `<p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">→ ${ef}</p>` : ""}</div>
    ${m.res === "qualificado" ? `<div class="rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-500/30 dark:bg-purple-500/10"><label for="m-prevnec" class="text-sm font-medium text-gray-800 dark:text-white">Previsão de necessidade <span class="text-error-500">*</span></label>
      <input type="month" id="m-prevnec" data-m="prevNec" value="${esc(m.prevNec)}" min="2026-10" class="${UI.campo} mt-1 sm:w-48"><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Quando ele vai precisar. Sem data marcada, volta como sugestão de Prospecção nesse mês.</p></div>` : ""}
    ${m.res === "recusou" && (aberto(c) || naCaixa(c)) ? `<div class="grid grid-cols-1 gap-2 rounded-xl border border-error-200 bg-error-50 p-3 sm:grid-cols-2 dark:border-error-500/30 dark:bg-error-500/10"><select data-m="motivo" id="m-motivo" class="${UI.campo} ${m.erroMotivo ? "border-error-400" : ""}"><option value="">Motivo… *</option>${MOTIVOS.map((o) => `<option ${m.motivo === o ? "selected" : ""}>${o}</option>`).join("")}</select><input type="text" id="m-conc" data-m="conc" value="${esc(m.conc)}" placeholder="concorrente (opcional)" class="${UI.campo}"></div>` : ""}
    <div><label class="${UI.rotulo}" for="m-memo">Resuminho</label><textarea id="m-memo" data-m="memo" rows="2" placeholder="O que ficou combinado?" class="${UI.campo}">${esc(m.memo)}</textarea></div>
    ${blocoProximo(m.prox, enc, m.erroProx, { hoje2h: true, ciclo: cicloDe(c), canal: true, previsao: m.res === "qualificado" ? m.prevNec : null })}</div>`;
  const titulo = m.fecharConv ? "Fechar e agendar retorno" : m.modo === "resultado" ? "Registrar resultado" : m.ligar ? "Ligar e registrar" : "Registrar contato";
  return casca(titulo, `${esc(c.nome)}${c.neg ? ` · ${ETAPA_NOME[c.neg.etapa]}` : ""}${c.prox ? ` · ${esc(c.prox.assunto)}` : ""}`, corpo, `${cancelar}<button type="button" data-acao="salvar-reg" class="${UI.btnP}">${m.fecharConv ? "Fechar atendimento" : "Salvar"}</button>`);
}
const feito = (id, txt) => S.feitos.push({ id, h: agora(), txt });
function salvarRegistro() {
  const m = S.modal, c = conta(m.id), enc = encerra(m, c);
  m.erroRes = !m.res; m.erroMotivo = enc && m.res === "recusou" && !m.motivo;
  const okProx = validarProx(m, enc);
  if (m.erroRes || m.erroMotivo || !okProx) return render();
  tick();
  const memo = m.memo.trim(), notas = [];
  const pend = m.conv ? c.eventos.find((e) => e.conv === m.conv && !e.res) : null;
  if (pend) Object.assign(pend, { res: m.res, memo });
  else c.eventos.unshift({ d: HOJE, h: agora(), canal: m.canal, dir: "eu", res: m.res, memo: m.falei && m.falei !== "—" && !m.conv ? `Falei com ${m.falei}. ${memo}`.trim() : memo, auto: !!m.conv, ...(m.conv ? { conv: m.conv } : {}) });
  c.prox = m.prox.modo === "previsao" ? null : proxFinal(m.prox, m.prox.canal);
  const alvo = RES_ETAPA[m.res];
  if (c.neg && (aberto(c) || naCaixa(c))) {
    if (alvo === "perdido") { Object.assign(c.neg, { motivo: m.motivo, concorrente: m.conc || c.neg.concorrente }); moverEtapa(c, "perdido", "ela", `${m.motivo}${m.conc ? " · " + m.conc : ""}`); notas.push("→ Perdido"); }
    else if (alvo && (naCaixa(c) || RANK[alvo] > RANK[c.neg.etapa])) { moverEtapa(c, alvo, "ela"); notas.push(`→ ${ETAPA_NOME[alvo]}`); if (m.res === "conversou" || m.res === "qualificado") c.neg.conversa = true; }
    else if (naCaixa(c)) { moverEtapa(c, "novo", "ela"); notas.push("→ Novo"); }
  } else if (m.res === "pediu_proposta" || m.res === "qualificado") {
    c.neg = novoNeg(c, { etapa: alvo, conversa: true }); c.neg.mov = { por: "ela", d: HOJE, h: agora() };
    c.eventos.unshift({ d: HOJE, h: agora(), sistema: `Negócio aberto em ${ETAPA_NOME[alvo]} · ela`, mov: "ela" }); notas.push(`negócio aberto em ${ETAPA_NOME[alvo]}`);
  }
  if (m.res === "qualificado" && c.neg) c.neg.previsaoNec = m.prevNec;
  const canalTxt = m.conv ? CANAL[conversa(m.conv).canal].nome : { telefone: "ligação", reuniao: "reunião", outro: "contato" }[m.canal];
  feito(c.id, `${canalTxt} · ${(m.conv && m.res === "sem_resposta" ? "sem resposta" : RES[m.res][0]).toLowerCase()}${c.prox ? ` · próximo: ${rotProx(c.prox)}` : m.res === "qualificado" ? ` · previsão ${mesTxt(m.prevNec)}` : ""}`);
  if (m.conv) { const v = conversa(m.conv); v.naoLidas = 0; v.msgs.forEach((x) => delete x.nova);
    if (m.fecharConv) { v.fechada = true; v.msgs.push({ sis: true, d: HOJE, h: agora(), t: `Fechado por ${vend(v.dona).curto} · ${RES[m.res][0]}${c.prox ? ` · retorno ${rotProx(c.prox)}` : ""}` }); S.proxFoco = true; } }
  S.modal = null;
  toast(`${m.fecharConv ? "Atendimento fechado" : "Registrado"}${notas.length ? " · " + notas.join(" · ") : ""}${c.prox ? ` · próximo: ${rotProx(c.prox)}` : m.res === "qualificado" ? ` · quando precisar ~${mesTxt(m.prevNec)}` : ""}${m.fecharConv ? " · o próximo da agenda está em destaque" : ""}`);
  render();
}
const novoNeg = (c, o = {}) => ({ campanha: "", etapa: "novo", conversa: false, produto: c.produto || "S10", litros: c.tipo === "cliente" ? Math.round(c.bi.consumo / 2 / 500) * 500 : 2000, comodato: false, previsao: "", previsaoNec: "", concorrente: "", motivo: "", visita: false, visitaNota: "", visitaFeita: false, mov: null, ganhoEm: "", ...o });

// Agendar / Reagendar
function modalAgendar(m) {
  const c = m.id ? conta(m.id) : null;
  const empresa = c ? "" : `<div><label class="${UI.rotulo}" for="ag-conta">Empresa <span class="text-error-500">*</span></label><select id="ag-conta" data-m="conta" class="${UI.campo} ${m.erroConta ? "border-error-400" : ""}"><option value="">Escolha…</option>${meus(S.contas).sort((a, b) => a.nome.localeCompare(b.nome)).map((x) => `<option value="${x.id}" ${String(m.conta) === String(x.id) ? "selected" : ""}>${esc(x.nome)}${x.prox ? ` (próximo: ${rotProx(x.prox)})` : ""}</option>`).join("")}</select>${erroTxt(m.erroConta && "Escolha a empresa.")}</div>`;
  const corpo = `<div class="space-y-4">${empresa}${blocoProximo(m.prox, false, m.erroProx, { ciclo: cicloDe(c) })}
    <div><label class="${UI.rotulo}">Canal previsto</label>${escolha([["telefone", "Telefone"], ["whatsapp", "WhatsApp"], ["email", "E-mail"], ["reuniao", "Reunião"]], m.canal, "canal")}</div></div>`;
  return casca(c ? (m.adiar ? "Adiar" : c.prox ? "Reagendar próximo contato" : "Agendar próximo contato") : "Agendar", c ? `${esc(c.nome)}${c.prox ? ` · hoje: ${rotProx(c.prox)}` : ""}` : "um próximo contato na agenda dela", corpo, `${cancelar}<button type="button" data-acao="salvar-agenda" class="${UI.btnP}">Agendar</button>`);
}
function salvarAgenda() {
  const m = S.modal, c = conta(m.id || m.conta);
  m.erroConta = !c; const ok = validarProx(m, false);
  if (!c || !ok) return render();
  tick(); const antes = c.prox; c.prox = proxFinal(m.prox, m.canal);
  const saiuCaixa = naCaixa(c) && moverEtapa(c, "novo", "ela", "agendou o 1º contato"); if (saiuCaixa || c.prox.d === HOJE) S.flash = c.id;
  if (antes) c.eventos.unshift({ d: HOJE, h: agora(), sistema: `${m.adiar ? "Adiado" : "Reagendado"}: ${rotProx(antes)} → ${rotProx(c.prox)}` });
  S.modal = null; toast(`${m.adiar ? "Adiado" : "Próximo contato"}: ${rotProx(c.prox)} · ${c.prox.assunto}${saiuCaixa ? " · saiu da caixa de entrada e entrou no funil como Novo" : c.prox.d === HOJE ? " — está na agenda de hoje" : " — está na Agenda › Semana"}`); render();
}

const selCampanha = (m, id) => `<div><label class="${UI.rotulo}" for="${id}">Campanha <span class="font-normal text-gray-400">(opcional)</span></label><select id="${id}" data-m="campanha" class="${UI.campo}"><option value="">—</option>${S.camps.map((k) => `<option value="${k.id}" ${m.campanha === k.id ? "selected" : ""}>${esc(k.nome)}</option>`).join("")}</select></div>`;
// Novo lead (Leads, busca ou triagem da Central): CNPJ → Receita preenche · fonte obrigatória · 1º contato opcional (sem ele, cai na caixa de entrada)
function abrirNovoLead(convId, q = "") {
  const v = convId ? conversa(convId) : null;
  S.modal = { tipo: "novo", cnpj: soDig(q).length === 14 ? cnpjMask(q) : "", consultando: false, receita: null, ja: null, empresa: soDig(q).length ? "" : q, cidade: "", endereco: "",
    contato: { nome: "", tel: v ? v.nome.replace(/^\+55 (\d{2}) /, "($1) ") : "", email: "" }, wa: true, fonte: v ? "whatsapp_numero_novo" : "", campanha: v ? "wa" : "", obs: v ? v.msgs[0]?.t || "" : "", primeiro: "", pData: "", conv: v ? v.id : null };
  S.modalTopo = true; render(); setTimeout(() => document.getElementById("n-cnpj")?.focus(), 30);
}
function modalNovo(m) {
  const ja = m.ja ? conta(m.ja) : null, at = (k, r) => `<button type="button" data-acao="m-set" data-campo="primeiro" data-v="${k}" class="rounded-lg border px-3 py-1.5 text-sm font-medium ${m.primeiro === k ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"}">${r}</button>`;
  const corpo = `<div class="space-y-4">
    <div><label class="${UI.rotulo}" for="n-cnpj">CNPJ <span class="font-normal text-gray-400">(a Receita preenche razão social, endereço e cidade)</span></label>
      <div class="flex gap-2"><input id="n-cnpj" data-m="cnpj" data-mask="cnpj" inputmode="numeric" value="${esc(m.cnpj)}" placeholder="00.000.000/0000-00" class="${UI.campo} ${m.erro ? "border-error-400" : ""}" ${m.consultando ? "disabled" : ""}>
      <button type="button" data-acao="consultar" class="${UI.btn} shrink-0" ${m.consultando ? "disabled" : ""}>${m.consultando ? `<span class="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></span>Receita…` : "Consultar"}</button></div>${erroTxt(m.erro)}
      ${!m.receita && !m.consultando ? `<p class="mt-1 text-xs text-gray-400">Exemplos: <button type="button" data-acao="cnpj-exemplo" data-v="novo" class="underline">empresa nova</button> · <button type="button" data-acao="cnpj-exemplo" data-v="cliente" class="underline">já é cliente</button></p>` : ""}
      ${m.receita ? `<p class="mt-1.5 text-xs text-success-700 dark:text-success-400">${ic("check", "inline h-3.5 w-3.5")} Receita · ${m.receita.situacao} · ${esc(m.receita.razao)} · ${esc(m.receita.endereco)}</p>` : ""}
      ${ja ? `<p class="mt-1.5 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300">${ja.dona === S.como ? `Já é ${ja.tipo === "cliente" ? "cliente" : "lead"} seu: <a href="#/clientes/${ja.id}" class="font-semibold underline">${esc(ja.nome)}</a>. Uma empresa = uma ficha.` : `Já é ${ja.tipo === "cliente" ? "cliente" : "lead"} da ${vend(ja.dona).curto} — fale com o supervisor.`}</p>` : ""}</div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="n-emp">Empresa <span class="text-error-500">*</span></label><input id="n-emp" data-m="empresa" value="${esc(m.empresa)}" placeholder="nome fantasia" class="${UI.campo} ${m.erroEmp ? "border-error-400" : ""}">${erroTxt(m.erroEmp && "Diga a empresa.")}</div>
      <div><label class="${UI.rotulo}" for="n-cid">Cidade</label><input id="n-cid" data-m="cidade" value="${esc(m.cidade)}" class="${UI.campo}"></div></div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="n-nome">Contato</label><input id="n-nome" data-mc="nome" value="${esc(m.contato.nome)}" placeholder="nome" class="${UI.campo}"></div>
      <div><label class="${UI.rotulo}" for="n-tel">Telefone</label><input id="n-tel" data-mc="tel" data-mask="tel" value="${esc(m.contato.tel)}" placeholder="(11) 9…" inputmode="tel" class="${UI.campo}">
        <label class="mt-1 flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><input type="checkbox" data-m="wa" ${m.wa ? "checked" : ""} class="h-3.5 w-3.5 rounded">é WhatsApp</label></div></div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="n-fonte">Fonte <span class="text-error-500">*</span></label><select id="n-fonte" data-m="fonte" class="${UI.campo} ${m.erroFonte ? "border-error-400" : ""}"><option value="">De onde veio?</option>${Object.entries(FONTES).map(([k, r]) => `<option value="${k}" ${m.fonte === k ? "selected" : ""}>${r}</option>`).join("")}</select>${erroTxt(m.erroFonte && "A fonte é obrigatória.")}</div>
      ${selCampanha(m, "n-camp")}</div>
    <div><label class="${UI.rotulo}" for="n-obs">Observação</label><textarea id="n-obs" data-m="obs" rows="2" class="${UI.campo}" placeholder="ex.: 3 geradores no condomínio">${esc(m.obs)}</textarea></div>
    <div class="rounded-xl border border-gray-200 p-3 dark:border-gray-700"><p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white">1º contato</p><div class="flex flex-wrap gap-1.5">${at("hoje", "hoje")}${at("amanha", `amanhã <span class="font-normal opacity-75">${diaCurto(AMANHA())}</span>`)}${at("data", "data…")}${at("", "depois")}</div>
      ${m.primeiro === "data" ? `<input type="date" id="n-d" data-m="pData" value="${m.pData}" min="${HOJE}" class="${UI.campo} mt-2 sm:w-48">` : ""}
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">${m.primeiro ? "→ cria o agendamento já e o lead entra no funil como <b>Novo</b>." : "→ sem 1º contato, o lead vai pra <b>caixa de entrada</b> (Leads) e aparece nas Ações sugeridas."}</p></div></div>`;
  return casca("Novo lead", "uma ficha igual à de cliente, com o chip Lead", corpo, `${cancelar}<button type="button" data-acao="salvar-novo" class="${UI.btnP}" ${ja ? "disabled" : ""}>Criar lead</button>`, "max-w-2xl");
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
  const d = m.primeiro === "hoje" ? HOJE : m.primeiro === "amanha" ? AMANHA() : m.primeiro === "data" ? m.pData : "";
  const v = m.conv ? conversa(m.conv) : null; tick();
  const c = { id: ++S.seq, tipo: "prospect", dona: S.como, nome: m.empresa.trim(), razao: m.receita?.razao || m.empresa.trim(), cnpj: m.cnpj || "—", cidade: m.cidade || "—", endereco: m.endereco, produto: "S10", bi: null, segmento: "", gescor: null, fonte: m.fonte, fonteDet: "", obs: m.obs, cls: { vale: null },
    pessoas: m.contato.nome || m.contato.tel ? [{ nome: m.contato.nome.trim() || "contato", papel: "principal", tel: m.contato.tel, email: "", prefere: m.wa ? "whatsapp" : "telefone", principal: true }] : [],
    neg: novoNeg({ produto: "S10", tipo: "prospect" }, { litros: 0, campanha: m.campanha, etapa: d ? "novo" : "caixa", mov: d ? { por: "ela", d: HOJE, h: agora() } : null }),
    prox: d ? { d, h: d === HOJE ? slotLivre(HOJE) : "", assunto: "1º contato", canal: m.wa ? "whatsapp" : "telefone" } : null,
    eventos: [{ d: HOJE, h: agora(), sistema: `Lead cadastrado · fonte ${FONTES[m.fonte]}${v ? " · a partir da conversa" : ""}${d ? "" : " · caixa de entrada"}` }] };
  if (v) ligarConversa(v, c, m.contato.nome.trim());
  S.contas.push(c); S.modal = null; if (d === HOJE) S.flash = c.id;
  toast(d ? `Lead criado · 1º contato ${rotProx(c.prox)} · entrou no funil como Novo` : "Lead criado · está na caixa de entrada (Leads)");
  ir(v ? `#/conversas/${v.id}` : `#/clientes/${c.id}`);
}

// conversa de número desconhecido passa a ser da conta: vira evento automático (sem resultado ainda)
function ligarConversa(v, c, nome) {
  Object.assign(v, { conta: c.id, desconhecido: false, nome: nome || v.nome });
  const ult = v.msgs[v.msgs.length - 1];
  c.eventos.unshift({ d: v.dia, h: ult.h, canal: v.canal, dir: ult.dir, res: null, memo: "", auto: true, conv: v.id });
  if (!c.pessoas.some((p) => soDig(p.tel) && v.nome.includes(soDig(p.tel).slice(-4)))) { /* telefone já veio no contato do prospect */ }
}

// Marcar perdido
function modalPerder(m) {
  const c = conta(m.id);
  return casca("Marcar perdido", esc(c.nome), `<div class="space-y-3"><div><label class="${UI.rotulo}" for="p-motivo">Motivo <span class="text-error-500">*</span></label>
    <select id="p-motivo" data-m="motivo" class="${UI.campo} ${m.erro ? "border-error-400" : ""}"><option value="">Escolha…</option>${MOTIVOS.map((o) => `<option ${m.motivo === o ? "selected" : ""}>${o}</option>`).join("")}</select>${erroTxt(m.erro && "Escolha o motivo.")}</div>
    <div><label class="${UI.rotulo}" for="p-conc">Concorrente <span class="font-normal text-gray-400">(opcional)</span></label><input id="p-conc" data-m="conc" value="${esc(m.conc)}" placeholder="ex.: Vibra, Ipiranga, Raízen" class="${UI.campo}"></div>
    <p class="text-xs text-gray-400">O próximo contato agendado sai da agenda. A ficha continua (dá pra abrir outro negócio depois).</p></div>`,
    `${cancelar}<button type="button" data-acao="salvar-perder" class="${UI.btnPerigo}">Marcar perdido</button>`, "max-w-md");
}
// Converter em cliente: ficha pronta pro GESCOR
function fichaGescor(c) {
  const p = pessoaPrincipal(c);
  return [["Razão social", c.razao], ["CNPJ", c.cnpj], ["Endereço", c.endereco || `(endereço da Receita) — ${c.cidade}/SP`], ["Cidade", c.cidade], ["Contato", p?.nome], ["Telefone", p?.tel], ["E-mail", p?.email],
    ["Produto", c.neg?.produto || c.produto], ["Volume estimado", c.neg ? `${litros(c.neg.litros)}/mês` : "—"], ["Representante", `${vend(c.dona).nome} (rep. GESCOR 0412)`]];
}
function modalGescor(m) {
  const c = conta(m.id), f = fichaGescor(c);
  const corpo = `<p class="mb-3 ${UI.muted}">Receita + contato, prontos pra ${vend(c.dona).curto} cadastrar no GESCOR com o representante dela.</p>
    <dl class="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">${f.map(([k, v]) => `<div class="grid grid-cols-[8rem_minmax(0,1fr)] gap-2 px-3 py-2 text-sm"><dt class="text-gray-500 dark:text-gray-400">${k}</dt><dd class="break-words text-gray-800 dark:text-gray-100">${esc(v || "—")}</dd></div>`).join("")}</dl>
    <p class="mt-3 text-xs text-gray-400">Quando o sync do BI achar este CNPJ na carteira dela, a ficha vira Cliente sozinha (o chip muda e aparecem os números do BI).</p>`;
  return casca("Ficha pra GESCOR", esc(c.nome), corpo,
    `<button type="button" data-acao="copiar-ficha" data-v="${c.id}" class="${UI.btn}">${ic("copiar", "h-4 w-4")}Copiar</button><button type="button" data-acao="fechar" class="${UI.btnP}">Ok</button>`);
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
function modalNegocio(m) {
  const c = m.id ? conta(m.id) : null;
  const empresa = c ? "" : `<div><label class="${UI.rotulo}" for="ng-conta">Empresa <span class="text-error-500">*</span></label><select id="ng-conta" data-m="conta" class="${UI.campo} ${m.erroConta ? "border-error-400" : ""}"><option value="">Escolha (clientes e leads sem negócio aberto)…</option>${meus(S.contas).filter((x) => !aberto(x)).sort((a, b) => a.nome.localeCompare(b.nome)).map((x) => `<option value="${x.id}" ${String(m.conta) === String(x.id) ? "selected" : ""}>${esc(x.nome)} · ${x.tipo === "cliente" ? "cliente" : "lead"}</option>`).join("")}</select>${erroTxt(m.erroConta && "Escolha a empresa.")}
    <p class="mt-1 text-xs text-gray-400">Empresa nova? Use <b>+ Novo lead</b> (em Leads).</p></div>`;
  return casca("Abrir negócio", `${c ? esc(c.nome) + " · " : ""}no máximo um aberto por empresa`, `<div class="space-y-4">${empresa}<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div><p class="${UI.rotulo}">Produto</p>${escolha([["S10", "S10"], ["S500", "S500"]], m.produto, "produto")}</div>
      <div><label class="${UI.rotulo}" for="ng-litros">Litros/mês</label><input id="ng-litros" data-m="litros" inputmode="numeric" value="${esc(m.litros)}" class="${UI.campo} ${m.erro ? "border-error-400" : ""}">${erroTxt(m.erro && "Quantos litros?")}</div>
      <div><p class="${UI.rotulo}">Comodato</p><label class="flex cursor-pointer items-center gap-2 py-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" data-m="comodato" ${m.comodato ? "checked" : ""} class="h-4 w-4 rounded">tanque</label></div></div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label class="${UI.rotulo}" for="ng-conc">Concorrente hoje <span class="font-normal text-gray-400">(opcional)</span></label><input id="ng-conc" data-m="conc" value="${esc(m.conc)}" placeholder="ex.: Vibra" class="${UI.campo}"></div>${selCampanha(m, "ng-camp")}</div>
    ${c?.prox ? `<p class="${UI.muted}">Próximo contato continua: ${rotProx(c.prox)} · ${esc(c.prox.assunto)}</p>` : blocoProximo(m.prox, false, m.erroProx, { canal: true, ciclo: cicloDe(c) })}</div>`,
    `${cancelar}<button type="button" data-acao="salvar-negocio" class="${UI.btnP}">Abrir negócio</button>`, "max-w-lg");
}
function copiar(texto) {
  const ok = () => toast("Ficha copiada — cole no cadastro do GESCOR.");
  const fallback = () => { const t = document.createElement("textarea"); t.value = texto; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (_) {} t.remove(); ok(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(ok, fallback); else fallback();
}

// Descartar da caixa de entrada: motivo → Arquivo
const MOTIVOS_DESC = ["Não usa diesel / não é alvo", "Fora da região de entrega", "Dados ruins (sem contato)", "Já é atendido por outra vendedora", "Outro"];
function modalDescartar(m) {
  const c = conta(m.id);
  return casca("Descartar lead", esc(c.nome), `<div class="space-y-3"><div><label class="${UI.rotulo}" for="d-motivo">Motivo <span class="text-error-500">*</span></label>
    <select id="d-motivo" data-m="motivo" class="${UI.campo} ${m.erro ? "border-error-400" : ""}"><option value="">Escolha…</option>${MOTIVOS_DESC.map((o) => `<option ${m.motivo === o ? "selected" : ""}>${o}</option>`).join("")}</select>${erroTxt(m.erro && "Escolha o motivo.")}</div>
    <p class="text-xs text-gray-400">Sai da caixa de entrada e vai pro Arquivo do Funil (dá pra reabrir pela ficha).</p></div>`,
    `${cancelar}<button type="button" data-acao="salvar-descartar" class="${UI.btnPerigo}">Descartar</button>`, "max-w-md");
}
