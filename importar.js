// ── Prospects › Importar em 3 passos (como v4): entrada → conferir → importado (entra em Prospects › Novos) ──
const CAMPOS_IMP = [["cnpj", "CNPJ", "w-40"], ["empresa", "Empresa", "w-52"], ["contato", "Contato", "w-28"], ["telefone", "Telefone", "w-32"], ["email", "E-mail", "w-36"], ["cidade", "Cidade", "w-28"], ["obs", "Obs", "w-32"]];
const CIDADES_SP = ["Carapicuíba", "Cotia", "Barueri", "Osasco", "Jandira", "Itapevi", "São Paulo", "Santana de Parnaíba", "Embu das Artes", "Taboão da Serra", "Guarulhos"];
const impVazio = () => ({ passo: 1, fonte: "", camp: "", texto: "", linhas: [], ia: false, receita: false, erro: {}, criados: [], dist: null });
function exemploImport() {
  const c = (n) => S.contas.find((x) => x.nome === n)?.cnpj || "";
  return [`Padaria e Confeitaria Pão Nosso - Sr. Jair - (11) 98888-1111 - Carapicuíba - gerador da padaria`,
    `${cnpjFmt(cnpjDv("661122330001"))} Condomínio Parque Roseira, síndica Marta, 11 97654-3210, Barueri`,
    `Transportadora Bela Vista; Rose; (11) 97777-2222; rose@belavista.exemplo; Jandira; 12 caminhões`,
    `${c("DataSul Data Center")} DataSul — Eduardo — 11 99820-3315`,
    `${c("Agropecuária Ibiúna Verde")} Agropecuária Ibiúna Verde - Valter - (15) 99711-0303`,
    `${c("Usina de Asfalto Rodoanel")} Usina Rodoanel; Nelson; 11 4781-3030`,
    `12.345.678/0001-00 Metalúrgica Primavera - Cláudia - (11) 96543-2100 - Cotia`,
    `Serralheria Boa Vista - Márcio - Itapevi (sem telefone, só passou na porta)`,
    `${cnpjFmt(cnpjDv("448812350001"))} - Lavanderia Industrial Gopiúva - Sandra - (11) 98123-4455`,
    `Locadora de Máquinas Ipê Roxo / Fábio / (11) 99234-0101 / Osasco`,
    `${cnpjFmt(cnpjDv("552019870001"))} Granja Três Irmãos, Sr. Kenji, 11 4777-8800, Cotia, 2 geradores`,
    `Clínica Monte Azul - Dra. Helena - (11) 3699-1200 - Carapicuíba`].join("\n");
}
// "IA" do mockup: lê texto solto linha a linha (no app é o Sonnet via AI::Track, feature vendas_importacao)
function normalizarTexto(txt) {
  return txt.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const cnpj = (l.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/) || [""])[0], email = (l.match(/[\w.+-]+@[\w.-]+\.\w+/) || [""])[0];
    let resto = l.replace(cnpj, " ").replace(email, " ");
    const telM = resto.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/), tel = telM ? telM[0] : ""; resto = resto.replace(tel, " ");
    const partes = resto.split(/\s[-–—/]\s|[;,|]/).map((x) => x.trim()).filter(Boolean);
    const cidade = partes.find((p) => CIDADES_SP.includes(p)) || "";
    const sobra = partes.filter((p) => p !== cidade), obs = sobra.slice(2).join(" · ").replace(/[()]/g, "");
    const d = soDig(tel);
    return { cnpj: cnpj ? cnpjMask(cnpj) : "", empresa: sobra[0] || "", contato: (sobra[1] || "").replace(/^síndic[oa]\s+/i, ""), telefone: d.length >= 10 ? (d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`) : "", email, cidade, obs, dona: S.como === "sup" ? "fer" : S.como };
  });
}
function lerFormato(txt) {
  const ls = txt.split("\n").map((l) => l.trim()).filter(Boolean); if (!ls.length) return [];
  if (ls[0].startsWith("[")) { try { return JSON.parse(txt).map((o) => ({ cnpj: o.cnpj || "", empresa: o.empresa || "", contato: o.contato || "", telefone: o.telefone || "", email: o.email || "", cidade: o.cidade || "", obs: o.obs || "", dona: S.como === "sup" ? "fer" : S.como })); } catch (_) { return null; } }
  const sep = ls[0].includes(";") ? ";" : ",", cab = ls[0].toLowerCase().split(sep).map((x) => x.trim());
  if (!cab.includes("empresa")) return null;
  return ls.slice(1).map((l) => { const v = l.split(sep), o = {}; cab.forEach((k, i) => (o[k] = (v[i] || "").trim())); return { cnpj: o.cnpj || "", empresa: o.empresa || "", contato: o.contato || "", telefone: o.telefone || "", email: o.email || "", cidade: o.cidade || "", obs: o.obs || "", dona: S.como === "sup" ? "fer" : S.como }; });
}
// situação de cada linha: ok · já é cliente/prospect de alguém · duplicado na lista · CNPJ inválido · sem telefone
function situacaoImp(l, i, linhas) {
  if (l.cnpj && !cnpjValido(l.cnpj)) return ["CNPJ inválido", COR.erro, false];
  const tel = soDig(l.telefone), ja = S.contas.find((c) => (l.cnpj && soDig(c.cnpj) === soDig(l.cnpj)) || (tel.length >= 10 && c.pessoas.some((p) => soDig(p.tel) === tel)));
  if (ja) { const meu = ja.dona === (S.como === "sup" ? l.dona : S.como), q = ja.tipo === "cliente" ? "cliente" : "prospect";
    return [meu ? `já é seu ${q}` : `já é ${q} da ${vend(ja.dona).curto}`, meu ? COR.cinza : COR.aviso, false, ja.id]; }
  const j = linhas.findIndex((x) => (l.cnpj && soDig(x.cnpj) === soDig(l.cnpj)) || (tel && soDig(x.telefone) === tel));
  if (j >= 0 && j < i) return ["repetido na lista", COR.aviso, false];
  if (!tel && !l.email) return ["sem telefone", COR.aviso, true];
  return ["ok", COR.ok, true];
}
function stepper(p) {
  const passo = (n, r) => `<li class="flex items-center gap-2"><span class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${p > n ? "bg-brand-500 text-white" : p === n ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500 dark:bg-brand-500/20 dark:text-brand-200" : "bg-gray-100 text-gray-400 dark:bg-white/5"}">${p > n ? ic("check", "h-3.5 w-3.5") : n}</span><span class="text-sm font-medium ${p >= n ? "text-gray-800 dark:text-white" : "text-gray-400"}">${r}</span></li>`;
  return `<ol class="flex flex-wrap items-center gap-x-3 gap-y-2">${passo(1, "Entrada")}<li class="hidden h-px w-10 bg-gray-200 sm:block dark:bg-gray-700"></li>${passo(2, "Conferir")}<li class="hidden h-px w-10 bg-gray-200 sm:block dark:bg-gray-700"></li>${passo(3, "Importado")}</ol>`;
}
function passo1(m) {
  const camps = S.camps.filter((k) => k.fonte).map((k) => `<option value="${esc(k.nome)}">`).join("");
  return `<div class="space-y-4"><div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div><label class="${UI.rotulo}" for="imp-fonte">Fonte <span class="text-error-500">*</span></label><select id="imp-fonte" data-input="imp" data-k="fonte" class="${UI.campo} ${m.erro.fonte ? "border-error-400" : ""}"><option value="">De onde veio a lista?</option>${Object.entries(FONTES).map(([k, r]) => `<option value="${k}" ${m.fonte === k ? "selected" : ""}>${r}</option>`).join("")}</select>${erroTxt(m.erro.fonte && "A fonte é obrigatória.")}</div>
      <div><label class="${UI.rotulo}" for="imp-camp">Campanha / nome da lista <span class="text-error-500">*</span></label><input id="imp-camp" data-input="imp" data-k="camp" list="imp-camps" value="${esc(m.camp)}" placeholder="ex.: Lista Cotia nov/26" class="${UI.campo} ${m.erro.camp ? "border-error-400" : ""}"><datalist id="imp-camps">${camps}</datalist>${erroTxt(m.erro.camp && "Dê um nome à lista (vira a campanha).")}</div></div>
    <div><div class="mb-1.5 flex flex-wrap items-center justify-between gap-2"><label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="imp-texto">Cole a lista (texto solto, planilha copiada, CSV ou JSON)</label><button type="button" data-acao="imp-exemplo" class="${UI.link} text-xs">colar exemplo</button></div>
      <textarea id="imp-texto" data-input="imp" data-k="texto" rows="9" placeholder="uma empresa por linha, do jeito que veio: nome, contato, telefone, CNPJ, cidade…" class="${UI.campo} font-mono text-xs ${m.erro.texto ? "border-error-400" : ""}">${esc(m.texto)}</textarea>${erroTxt(m.erro.texto)}
      <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><label class="${UI.btnSm} cursor-pointer">${ic("subir", "h-3.5 w-3.5")}Subir CSV / XLSX / JSON<input type="file" id="imp-arq" accept=".csv,.xlsx,.json,.txt" class="hidden"></label><span>${m.texto ? `${m.texto.split("\n").filter((x) => x.trim()).length} linhas` : ""}</span></div></div>
    <div class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800"><span class="mr-auto text-xs text-gray-400">Formato já pronto: cabeçalho <span class="font-mono">cnpj,empresa,contato,telefone,email,cidade,obs</span></span>
      <button type="button" data-acao="imp-formato" class="${UI.btn}">Já está no formato</button><button type="button" data-acao="imp-ia" class="${UI.btnP}" ${m.ia ? "disabled" : ""}>${m.ia ? `<span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>Sonnet organizando…` : `${ic("ia", "h-4 w-4")}Entender com IA`}</button></div></div>`;
}
function passo2(m) {
  const sit = m.linhas.map((l, i) => situacaoImp(l, i, m.linhas)), marc = m.linhas.filter((l) => l.imp).length;
  const dup = sit.filter((s) => s[3] || s[0] === "repetido na lista").length, inv = sit.filter((s) => s[0] === "CNPJ inválido").length, semTel = sit.filter((s) => s[0] === "sem telefone").length;
  const campo = (l, i, [k, , w]) => `<input id="imp-${k}-${i}" data-input="imp-cel" data-v="${i}" data-k="${k}" value="${esc(l[k])}" ${k === "cnpj" ? `data-maskc="cnpj"` : ""} class="${V.input.replace("w-full ", "")} ${w} py-1 ${k === "empresa" && !l.empresa ? "border-warning-300" : ""} ${l.rec && (k === "empresa" || k === "cidade") ? "bg-success-50/60 dark:bg-success-500/10" : ""}">`;
  const vendSel = (l, i) => sup() ? `<select data-input="imp-cel" data-v="${i}" data-k="dona" class="${V.input.replace("w-full ", "")} w-28 py-1">${VENDEDORAS.map((v) => `<option value="${v.id}" ${l.dona === v.id ? "selected" : ""}>${v.curto}</option>`).join("")}</select>` : "";
  const pillSit = (s) => s[3] ? `<a href="#/fichas/${s[3]}" class="hover:underline">${pill(s[0], s[1])}</a>` : pill(s[0], s[1]);
  // tabela enxuta: CNPJ · Empresa · Contato · Telefone · Cidade · Situação; e-mail, obs (e vendedora, no supervisor) no ▸ da linha
  const VIS = CAMPOS_IMP.filter(([k]) => !["email", "obs"].includes(k)), EXTRA = CAMPOS_IMP.filter(([k]) => ["email", "obs"].includes(k)), ab = m.aberta || (m.aberta = {});
  const W = { cnpj: "w-40", empresa: "", contato: "w-28", telefone: "w-32", cidade: "w-28" };
  const temExtra = (l) => !!(l.email || l.obs);
  const btnExp = (i, l) => `<button type="button" data-acao="imp-exp" data-v="${i}" aria-expanded="${!!ab[i]}" aria-label="E-mail e observação" title="E-mail e observação" class="relative flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200">${ic(ab[i] ? "baixo" : "dir", "h-4 w-4")}${temExtra(l) && !ab[i] ? `<span class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-500"></span>` : ""}</button>`;
  const extras = (l, i, pre = "imp") => `<div class="grid grid-cols-1 gap-2 ${sup() ? "sm:grid-cols-[1fr_2fr_auto]" : "sm:grid-cols-[1fr_2fr]"}">${EXTRA.map(([k, r]) => `<label class="min-w-0 text-[11px] text-gray-500 dark:text-gray-400">${r}${campo(l, i, [k, r, "w-full"]).replace(`id="imp-${k}-${i}"`, `id="${pre}-${k}-${i}"`)}</label>`).join("")}${sup() ? `<label class="text-[11px] text-gray-500 dark:text-gray-400">Vendedora${vendSel(l, i)}</label>` : ""}</div>`;
  const tab = `<div class="hidden rounded-xl border border-gray-200 xl:block dark:border-gray-800"><table class="w-full table-fixed"><thead><tr class="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]"><th class="w-10 px-3 py-2.5 text-left"><input type="checkbox" data-acao="imp-todos" ${marc === m.linhas.length ? "checked" : ""} aria-label="Marcar todos" class="h-4 w-4 rounded border-gray-300"></th>${VIS.map(([k, r]) => `<th class="${UI.th} ${W[k]} px-1.5">${r}</th>`).join("")}<th class="${UI.th} w-44 px-2">Situação</th><th class="w-9"></th></tr></thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">${m.linhas.map((l, i) => `<tr class="${l.imp ? "" : "bg-gray-50/70 opacity-70 dark:bg-white/[0.02]"}"><td class="px-3 py-1.5"><input type="checkbox" data-acao="imp-linha" data-v="${i}" ${l.imp ? "checked" : ""} aria-label="Importar linha ${i + 1}" class="h-4 w-4 rounded border-gray-300"></td>${VIS.map((f) => `<td class="px-1 py-1.5">${campo(l, i, [f[0], f[1], "w-full"])}</td>`).join("")}<td class="truncate px-2 py-1.5">${pillSit(sit[i])}</td><td class="pr-2">${btnExp(i, l)}</td></tr>
      ${ab[i] ? `<tr class="bg-gray-50/60 dark:bg-white/[0.02]"><td></td><td colspan="${VIS.length + 2}" class="px-1 pb-2.5 pt-1">${extras(l, i)}</td></tr>` : ""}`).join("")}</tbody></table></div>`;
  const cards = `<ul class="space-y-2 xl:hidden">${m.linhas.map((l, i) => `<li class="rounded-xl border border-gray-200 p-3 dark:border-gray-800 ${l.imp ? "" : "opacity-70"}"><div class="flex items-center gap-2"><input type="checkbox" data-acao="imp-linha" data-v="${i}" ${l.imp ? "checked" : ""} aria-label="Importar linha ${i + 1}" class="h-4 w-4 shrink-0 rounded border-gray-300"><span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-white">${esc(l.empresa || "(sem nome)")}</span><span class="max-w-[50%] shrink-0 truncate">${pillSit(sit[i])}</span></div>
    <div class="mt-2 grid grid-cols-2 gap-1.5">${VIS.map((f) => `<label class="min-w-0 text-[11px] text-gray-500 dark:text-gray-400 ${f[0] === "empresa" ? "col-span-2" : ""}">${f[1]}${campo(l, i, [f[0], f[1], "w-full"]).replace(`id="imp-${f[0]}-${i}"`, `id="impm-${f[0]}-${i}"`)}</label>`).join("")}</div>
    <button type="button" data-acao="imp-exp" data-v="${i}" class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">${ic(ab[i] ? "baixo" : "dir", "h-3.5 w-3.5")}e-mail e observação${temExtra(l) && !ab[i] ? `<span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>` : ""}</button>${ab[i] ? `<div class="mt-1.5">${extras(l, i, "impm")}</div>` : ""}</li>`).join("")}</ul>`;
  return `<div class="space-y-3"><div class="flex flex-wrap items-center justify-between gap-2"><p class="text-sm text-gray-700 dark:text-gray-200"><b>${m.linhas.length}</b> linhas · <b class="text-success-600 dark:text-success-400">${marc}</b> importam · ${dup} duplicados · ${inv} inválidos${semTel ? ` · ${semTel} sem telefone` : ""}</p>
      <button type="button" data-acao="imp-receita" class="${UI.btnSm}" ${m.receita ? "disabled" : ""}>${m.receita ? `<span class="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></span>consultando a Receita…` : `${ic("id", "h-3.5 w-3.5")}Completar pela Receita`}</button></div>
    <p class="text-xs text-gray-500 dark:text-gray-400">Fonte <b>${FONTES[m.fonte]}</b> · campanha <b>${esc(m.camp)}</b> · duplicados e inválidos vêm desmarcados.</p>
    ${tab}${cards}
    <div class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800"><button type="button" data-acao="imp-voltar" class="${UI.btn} mr-auto">${ic("esq", "h-4 w-4")}Voltar</button><button type="button" data-acao="imp-confirmar" class="${UI.btnP}" ${marc ? "" : "disabled"}>Confirmar importação de ${marc}</button></div></div>`;
}
function passo3(m) {
  const n = m.criados.length, d = m.dist;
  return `<div class="space-y-4"><div class="rounded-xl border border-success-200 bg-success-50 p-4 dark:border-success-500/30 dark:bg-success-500/10"><p class="flex items-center gap-2 text-base font-semibold text-success-800 dark:text-success-300">${ic("check", "h-5 w-5")}${n} prospects em Novos</p>
      <p class="mt-1 text-sm text-success-700 dark:text-success-400">Fonte ${FONTES[m.fonte]} · campanha ${esc(m.camp)}</p>
      <a href="#/vendas/prospects?aba=novos" class="${UI.btnP} mt-3">Abrir Novos</a></div>
    ${sup() ? "" : `<div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800"><p class="text-sm font-semibold text-gray-800 dark:text-white">1º contato</p>
      ${d ? `<p class="mt-2 text-sm text-gray-700 dark:text-gray-200">${d}</p>`
        : `<div class="mt-3 flex flex-wrap gap-2"><button type="button" data-acao="imp-dist" data-v="pordia" class="${UI.btnP}">5 por dia a partir de amanhã</button><button type="button" data-acao="imp-dist" data-v="hoje" class="${UI.btn}">todos hoje</button><button type="button" data-acao="imp-dist" data-v="depois" class="${UI.btn}">o sistema marca em ${P("primeiro")} d</button></div>`}</div>`}
    <button type="button" data-acao="imp-nova" class="${UI.link} text-sm">Importar outra lista</button></div>`;
}
function telaImportar() {
  const m = S.imp;
  const hist = `<section class="${UI.card} mt-4 overflow-hidden">${cardTopo("Importações", `<span class="${V.muted}">desfazer até 24 h</span>`)}<ul class="divide-y divide-gray-100 dark:divide-gray-800">${S.importacoes.map((h) => `<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm ${h.desfeita ? "opacity-50" : ""}"><span class="w-20 shrink-0 text-xs text-gray-500 dark:text-gray-400">${rotData(h.d)}${h.d === HOJE ? " " + h.h : ""}</span>
    <span class="min-w-0 flex-1 truncate"><b class="font-medium text-gray-800 dark:text-white">${esc(h.camp)}</b> <span class="text-xs text-gray-400">· ${FONTES[h.fonte]} · ${h.origem}</span></span><span class="text-xs text-gray-600 dark:text-gray-300">${h.aceitos} de ${h.total} aceitos</span>
    ${h.desfeita ? pill("desfeita", COR.cinza) : h.d === HOJE && !sup() ? `<button type="button" data-acao="imp-desfazer" data-v="${h.id}" class="${UI.btnSm}">desfazer</button>` : ""}</li>`).join("")}</ul>
    </section>`;
  return `<div class="mb-3 flex flex-wrap items-center justify-between gap-2"><a href="#/vendas/prospects?aba=novos" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400">${ic("esq", "h-4 w-4")}Prospects</a></div>
    <section class="${UI.card} overflow-hidden"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800"><h2 class="text-base font-semibold text-gray-800 dark:text-white">Importar prospects</h2>${stepper(m.passo)}</div>
      <div class="p-4">${m.passo === 1 ? passo1(m) : m.passo === 2 ? passo2(m) : passo3(m)}</div></section>${hist}`;
}
function impIrConferir(linhas) {
  const m = S.imp; m.erro = {};
  if (!m.fonte) m.erro.fonte = true; if (!m.camp.trim()) m.erro.camp = true; if (!m.texto.trim()) m.erro.texto = "Cole a lista ou suba um arquivo.";
  if (Object.keys(m.erro).length) return render();
  if (linhas === null) { m.erro.texto = "Não reconheci o formato: falta o cabeçalho cnpj,empresa,… — use Entender com IA."; return render(); }
  m.linhas = linhas; m.linhas.forEach((l, i) => { l.imp = situacaoImp(l, i, m.linhas)[2]; }); m.passo = 2; render(); window.scrollTo(0, 0);
}
function impConfirmar() {
  const m = S.imp, sel = m.linhas.filter((l) => l.imp); if (!sel.length) return;
  let camp = S.camps.find((k) => norm(k.nome) === norm(m.camp.trim()));
  if (!camp) { camp = { id: "k" + (++S.seq), nome: m.camp.trim(), tipo: m.fonte, fonte: m.fonte, data: HOJE }; S.camps.push(camp); }
  tick(); const imp = { id: ++S.seq, d: HOJE, h: agora(), fonte: m.fonte, camp: camp.nome, origem: "texto colado", total: m.linhas.length, aceitos: sel.length, ids: [], desfeita: false };
  sel.forEach((l) => { const c = { id: ++S.seq, tipo: "prospect", dona: sup() ? l.dona : S.como, nome: l.empresa || "(sem nome)", razao: l.razao || l.empresa, cnpj: l.cnpj || "—", cidade: l.cidade || "—", produto: "S10", bi: null, segmento: "", fonte: m.fonte, fonteDet: "", obs: l.obs,
      camp: camp.id, litros: 0, sit: "novo", entrou: HOJE, perdas: [], prox: null, importacao: imp.id,
      pessoas: l.contato || l.telefone || l.email ? [{ nome: l.contato || "contato", papel: "principal", tel: l.telefone, email: l.email, prefere: /\(\d\d\) 9/.test(l.telefone) ? "whatsapp" : l.telefone ? "telefone" : "email", principal: true }] : [],
      eventos: [{ d: HOJE, h: agora(), sistema: `Importado · ${camp.nome} (${FONTES[m.fonte]})` }] };
    S.contas.push(c); imp.ids.push(c.id); });
  S.importacoes.unshift(imp); Object.assign(m, { passo: 3, criados: imp.ids, campId: camp.id, dist: null }); render(); window.scrollTo(0, 0);
}
function impDistribuir(modo) {
  const m = S.imp, cs = m.criados.map((id) => conta(id)).filter(Boolean);
  if (modo === "depois") { m.dist = `Sem data por enquanto: se ninguém agir, o sistema marca o 1º contato em ${diaCurto(somaDias(HOJE, P("primeiro")))}.`; return render(); }
  const dias = {}; tick();
  cs.forEach((c, i) => { const d = modo === "hoje" ? HOJE : diasUteis(HOJE, 1 + Math.floor(i / 5)); c.prox = { d, h: "", assunto: "1º contato", canal: "whatsapp", tipo: "primeiro", por: "ela" }; dias[d] = (dias[d] || 0) + 1; });
  m.dist = `${cs.length} agendados: ${Object.entries(dias).map(([d, n]) => `<b>${n}</b> ${diaCurto(d)}`).join(" · ")}`; render();
}
