// Mockup Vendas Internas v5 (22/10/2026) — barra Vendas · Conversas; Vendas = Hoje · Prospects · Clientes (+ Equipe e ⚙ Prazos pro supervisor). Estrutura = ../SPEC_V5.md (manda sobre tudo).
// Visual: casca/tokens da V3 (app/helpers/whatsapp/v3/atendimento_helper.rb UI) + blocos da dash do CRM PWA (crm/dashboard/_*).
// Nada é salvo: tudo vive em memória (S); F5 ou "recomeçar" volta ao início.

// Tokens da dash do PWA / páginas de BI
const UI = {
  card: "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]",
  btn: "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]",
  btnSm: "inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]",
  btnP: "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50",
  btnPSm: "inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-600",
  btnOk: "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-success-300 px-3 py-1.5 text-sm font-medium text-success-700 hover:bg-success-50 dark:border-success-500/40 dark:text-success-400 dark:hover:bg-success-500/10",
  btnPerigo: "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-error-300 px-3 py-1.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-error-500/40 dark:text-error-400 dark:hover:bg-error-500/10",
  campo: "w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white",
  rotulo: "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300",
  th: "whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400",
  td: "px-4 py-3 text-sm text-gray-700 dark:text-gray-300",
  muted: "text-sm text-gray-500 dark:text-gray-400",
  secao: "text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500",
  link: "cursor-pointer text-left font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400",
  h2: "text-sm font-semibold text-gray-800 dark:text-white",
  badge: "ml-1 inline-flex items-center justify-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
};
// Tokens da V3 (copiados do helper)
const V = {
  btn_primary: "inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600",
  btn_secondary: "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5",
  btn_ghost: "cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200",
  link: "cursor-pointer text-xs font-medium text-brand-600 hover:underline dark:text-brand-200",
  section_title: "mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400",
  dl_row: "grid grid-cols-[96px_1fr] items-center gap-3 py-1.5",
  dt: "text-xs text-gray-500 dark:text-gray-400",
  dd: "min-w-0 text-xs text-gray-700 dark:text-gray-200",
  segment: "inline-flex flex-wrap rounded-lg bg-gray-100 p-0.5 dark:bg-white/5",
  segment_on: "inline-flex cursor-pointer items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white",
  segment_off: "inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
  muted: "text-xs text-gray-500 dark:text-gray-400",
  input: "w-full rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white",
  erp: "rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800",
  erp_h: "mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400",
};
const IC = {
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  id: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z",
  cal: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  busca: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  mais: "M12 4.5v15m7.5-7.5h-15",
  x: "M6 18L18 6M6 6l12 12",
  esq: "M15.75 19.5L8.25 12l7.5-7.5",
  dir: "M8.25 4.5l7.5 7.5-7.5 7.5",
  alerta: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  casa: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  grafico: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  doc: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  chat: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  menu: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  caminhao: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  mail: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  fone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  check: "M4.5 12.75l6 6 9-13.5",
  copiar: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75",
  pino: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  sai: "M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25",
  entra: "M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25",
  enviar: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
  pasta: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z",
  escudo: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  tanque: "m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  raio: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  pessoaMais: "M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z",
  externo: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
  baixo: "M19.5 8.25l-7.5 7.5-7.5-7.5",
  relogio: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  refazer: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
  pausa: "M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  funil: "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z",
  subir: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
  ia: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  dinheiro: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z",
  ocultar: "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88",
  cima: "M4.5 15.75l7.5-7.5 7.5 7.5",
  pontos: "M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  engrenagem: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
};
const ic = (k, css = "h-5 w-5") => `<svg class="${css} flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${IC[k]}"/></svg>`;
const icWa = (css = "h-3.5 w-3.5") => `<svg class="${css} flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>`;
const icCanal = (canal, css = "h-4 w-4") => canal === "whatsapp" ? icWa(css) : ic(CANAL[canal].ic, css);

// ── Datas ───────────────────────────────────────────────────────────────────
const dN = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const dS = (n) => new Date(n * 864e5).toISOString().slice(0, 10);
const somaDias = (s, k) => dS(dN(s) + k);
const dow = (s) => new Date(dN(s) * 864e5).getUTCDay();
const SEM3 = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const dm = (s) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;
const diasUteis = (s, k) => { let d = s; while (k > 0) { d = somaDias(d, 1); if (dow(d) !== 0 && dow(d) !== 6) k--; } return d; };
const rotData = (s) => { if (!s) return "—"; const k = dN(s) - dN(HOJE); if (k === 0) return "hoje"; if (k === 1) return "amanhã"; if (k === -1) return "ontem"; return `${SEM3[dow(s)]} ${dm(s)}`; };
const rotProx = (p) => p ? `${rotData(p.d)}${p.h ? " " + p.h : ""}` : "—";
const diasAtras = (s) => dN(HOJE) - dN(s);
const diaCurto = (d) => `${SEM3[dow(d)]} ${dm(d)}`;
const AMANHA = () => diasUteis(HOJE, 1), MAIS3 = () => diasUteis(HOJE, 3);
const SEG_SEMANA = "2026-10-19";
// Relógio do mockup: começa 09:30 e anda 3 min a cada ação (prints determinísticos; "hoje +2h" = 11:30…).
const agora = () => { const m = 9 * 60 + 30 + (S?.relogio || 0) * 3; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
const tick = () => { S.relogio = (S.relogio || 0) + 1; };
const maisHoras = (h, n) => { const [a, b] = h.split(":").map(Number), m = Math.min(a * 60 + b + n * 60, 19 * 60); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
const uteisEntre = (a, b) => { let d = a, k = 0; while (d < b) { d = somaDias(d, 1); if (dow(d) !== 0 && dow(d) !== 6) k++; } return k; };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const num = (n) => Number(n).toLocaleString("pt-BR");
const litros = (n) => n ? `${num(n)} L` : "—";
const reais = (n) => `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const reaisK = (n) => n >= 1e6 ? `R$ ${(n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi` : `R$ ${num(Math.round(n / 1000))} mil`;
const soDig = (s) => (s || "").replace(/\D/g, "");
const cnpjMask = (v) => { const d = soDig(v).slice(0, 14); return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2"); };
const cnpjValido = (v) => { const d = soDig(v); return d.length === 14 && !/^(\d)\1+$/.test(d) && cnpjDv(d.slice(0, 12)) === d; };

// ── Estado ──────────────────────────────────────────────────────────────────
let S;
const clone = (x) => JSON.parse(JSON.stringify(x));
const sup = () => S.como === "sup";
const vend = (id) => VENDEDORAS.find((v) => v.id === id);
const conta = (id) => S.contas.find((c) => c.id === Number(id));
const conversa = (id) => S.conv.find((c) => c.id === Number(id));
// quem está no escopo da tela: a vendedora logada, ou (supervisor) a escolhida no seletor / todas
const escopo = () => sup() ? (S.sel ? [S.sel] : VENDEDORAS.map((v) => v.id)) : [S.como];
const meus = (lista) => lista.filter((x) => escopo().includes(x.dona));
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const mesTxt = (ym) => ym ? `${MESES[Number(ym.slice(5, 7)) - 1]}/${ym.slice(2, 4)}` : "";
const convAberta = (c) => S.conv.find((v) => v.conta === c.id && !v.fechada);
const campanha = (id) => id ? (S?.camps || CAMPANHAS).find((x) => x.id === id) : null;
const ultimoContato = (c) => c.eventos.find((e) => !e.sistema);
const convDaConta = (c) => S.conv.filter((v) => v.conta === c.id).sort((a, b) => (b.dia + b.hora).localeCompare(a.dia + a.hora));
const pessoaPrincipal = (c) => c.pessoas.find((p) => p.principal) || c.pessoas[0];
const naoLidasTotal = () => meus(S.conv).reduce((a, v) => a + (v.fechada ? 0 : v.naoLidas), 0);

// ── Pílulas e textos ────────────────────────────────────────────────────────
const pill = (txt, cor) => `<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${cor}">${txt}</span>`;
const COR = {
  cinza: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  ok: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  erro: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
  aviso: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  ambar: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  roxo: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
};
const produtoPill = (p) => pill(p, p === "S10" ? COR.brand : COR.ok);
const CANAL = { whatsapp: { nome: "WhatsApp", ic: "chat" }, email: { nome: "E-mail", ic: "mail" }, telefone: { nome: "Telefone", ic: "fone" }, reuniao: { nome: "Reunião", ic: "users" }, outro: { nome: "Outro", ic: "doc" } };
const DIR = { eu: "eu falei", cliente: "cliente falou" };
const PAPEL = { principal: "principal", decisor: "decisor", compras: "compras", financeiro: "financeiro", operacional: "operacional" };
const iniciais = (nome) => esc(nome.replace(/^\+\d+\s*/, "").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?");
const avatar = (nome, css = "h-8 w-8 text-xs") => `<span class="flex ${css} flex-shrink-0 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">${iniciais(nome)}</span>`;
const donaTxt = (id) => `<span class="inline-flex items-center gap-2">${avatar(vend(id).nome, "h-6 w-6 text-[0.625rem]")}${vend(id).curto}</span>`;
const vazio = (txt) => `<div class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">${txt}</div>`;
const chevronDir = `<svg class="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
const chipF = (on, acao, v, rot, n, extra = "") => `<button type="button" data-acao="${acao}" data-v="${v}" ${extra} class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors ${on ? "border-brand-500 bg-brand-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5"}">${rot}${n != null ? `<span class="${on ? "text-white/80" : "text-gray-400"}">${n}</span>` : ""}</button>`;
const segV3 = (opcoes, atual, acao) => `<div class="${V.segment}">${opcoes.map(([v, rot]) => `<button type="button" data-acao="${acao}" data-v="${v}" class="${atual === v ? V.segment_on : V.segment_off}">${rot}</button>`).join("")}</div>`;
const verTodos = (bloco, total, mostrando) => total > mostrando || S.exp[bloco] ? `<button type="button" data-acao="expandir" data-v="${bloco}" class="w-full border-t border-gray-100 px-4 py-2.5 text-center text-xs font-medium text-brand-500 hover:bg-gray-50 dark:border-gray-800 dark:text-brand-400 dark:hover:bg-white/[0.03]">${S.exp[bloco] ? "mostrar menos" : `ver todos (${total})`}</button>` : "";
const corta = (bloco, lista, n) => S.exp[bloco] ? lista : lista.slice(0, n);
const CHEV = ["polygon(0 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,0 100%)", "polygon(0 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,0 100%,10px 50%)", "polygon(0 0,100% 0,100% 100%,0 100%,10px 50%)"];

// ── Atividade (linha do tempo) ──────────────────────────────────────────────
function eventoHtml(e, c, compacto = false) {
  if (e.sistema && e.mov) return `<li class="flex items-center gap-3"><span class="flex ${compacto ? "h-6 w-6" : "h-8 w-8"} shrink-0 items-center justify-center rounded-full ${e.mov === "v3" ? "bg-green-50 text-green-600 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"}">${ic("dir", "h-3.5 w-3.5")}</span><p class="text-xs font-medium text-gray-700 dark:text-gray-200">${esc(e.sistema)} <span class="font-normal text-gray-400">· ${rotData(e.d)} ${e.h || ""}</span></p></li>`;
  if (e.sistema) return `<li class="flex gap-3"><span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" style="margin-left:${compacto ? 7 : 11}px;margin-right:${compacto ? 3 : 5}px"></span><p class="text-xs italic text-gray-500 dark:text-gray-400">${e.h ? e.h + " · " : ""}${esc(e.sistema)}</p></li>`;
  const tam = compacto ? "h-6 w-6" : "h-8 w-8";
  const tk = e.auto ? ticket(e) : null;
  const resultado = e.res ? pill(resRot(e), RES[e.res][1]) : tk?.aberto ? pill("em aberto", COR.cinza) : "";
  const origem = e.auto && tk?.v ? `<a href="#/conversas/${tk.v.id}" class="text-xs text-gray-400 hover:text-brand-500 hover:underline">abrir conversa ›</a>` : "";
  const quem = tk ? `<span class="text-xs text-gray-500 dark:text-gray-400">${tk.n} ${tk.n === 1 ? "msg" : "msgs"} · ${tk.periodo} · ${tk.quem}</span>` : `<span class="inline-flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">${ic(e.dir === "eu" ? "sai" : "entra", "h-3 w-3")}${DIR[e.dir]}</span>`;
  return `<li class="flex gap-3"><span class="flex ${tam} shrink-0 items-center justify-center rounded-full ${e.auto ? "bg-green-50 text-green-600 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300"}">${icCanal(e.canal, compacto ? "h-3.5 w-3.5" : "h-4 w-4")}</span>
    <div class="min-w-0 flex-1"><p class="flex flex-wrap items-center gap-x-2 gap-y-1 ${compacto ? "text-xs" : "text-sm"}"><span class="font-medium text-gray-800 dark:text-white">${CANAL[e.canal].nome}${e.web ? ` <span class="font-normal text-gray-400">· pelo WhatsApp Web</span>` : ""}</span>
      ${quem}${resultado}${e.quem ? pill(`${esc(e.quem)} · ${["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][dow(e.d)]}`, COR.aviso) : ""}<span class="ml-auto text-xs text-gray-400">${compacto && e.d !== HOJE ? rotData(e.d) + " " : ""}${e.h}</span></p>
    ${e.memo ? `<p class="mt-0.5 ${compacto ? "line-clamp-2 text-xs" : "text-sm"} text-gray-600 dark:text-gray-300">${esc(e.memo)}</p>` : ""}${origem}</div></li>`;
}
// WhatsApp/e-mail = UM evento por ticket (episódio), atualizado a cada mensagem (SPEC_V3 §4)
function ticket(e) {
  const v = e.conv ? conversa(e.conv) : null;
  if (v) { const ms = v.msgs.filter((x) => !x.sis), ult = ms[ms.length - 1], ini = ms[0]?.d || v.dia, fim = ult?.d || v.dia;
    return { v, n: ms.length, periodo: ini === fim ? dm(fim) : `${ini.slice(8, 10)}–${dm(fim)}`, quem: ult?.dir === "eu" ? (ult.quem ? `${ult.quem} falou por último` : "eu falei por último") : "cliente falou por último", aberto: !v.fechada }; }
  const ini = e.ini || e.d;
  return { v: null, n: e.n || 1, periodo: ini === e.d ? dm(e.d) : `${ini.slice(8, 10)}–${dm(e.d)}`, quem: e.quem ? `${e.quem} falou por último` : e.dir === "eu" ? "eu falei por último" : "cliente falou por último", aberto: false };
}
function atividade(c) {
  const grupos = {}; c.eventos.forEach((e) => (grupos[e.d] ||= []).push(e));
  const dias = Object.keys(grupos).sort().reverse();
  return dias.length ? `<div class="space-y-5">${dias.map((d) => `<div><p class="mb-2 ${UI.secao}">${rotData(d)}${["hoje", "ontem"].includes(rotData(d)) ? ` · ${dm(d)}` : ""}</p>
    <ul class="space-y-3">${grupos[d].sort((a, b) => (b.h || "").localeCompare(a.h || "")).map((e) => eventoHtml(e, c)).join("")}</ul></div>`).join("")}</div>` : `<p class="${UI.muted}">Nenhum contato ainda.</p>`;
}

// ── Casca: sidebar (a do admin, com o menu de Vendas Internas) + header ─────
function itemMenu(nome, icone, ativo, rota, badge = 0) {
  return `<li><a href="#/${rota}" class="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${ativo ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"}">
    <span class="${ativo ? "text-brand-500 dark:text-brand-400" : "text-indigo-500 dark:text-indigo-400"}">${ic(icone)}</span><span class="whitespace-nowrap">${nome}</span>
    ${badge ? `<span class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">${badge}</span>` : ""}</a></li>`;
}
function sidebar() {
  const t = S.tela;
  const itens = itemMenu("Vendas", "grafico", t === "vendas" || t === "ficha" || t === "equipe" || t === "prazos", "vendas") + itemMenu("Conversas", "chat", t === "conversas" || t === "conversa", "conversas", naoLidasTotal());
  return `<aside class="fixed left-0 z-[9999] flex w-[290px] flex-col overflow-y-hidden border-r border-gray-200 bg-white px-5 transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 ${S.menu ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0" style="top:var(--barra,0px);height:calc(100dvh - var(--barra,0px))">
    <div class="flex items-center justify-between gap-2 pb-7 pt-8">
      <span class="flex items-center gap-3"><svg class="h-8 w-8 flex-shrink-0 text-brand-500" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span class="whitespace-nowrap text-xl font-bold text-gray-800 dark:text-white">Diesel BI</span></span>
      <button type="button" data-acao="menu" aria-label="Fechar menu" class="text-gray-500 hover:text-gray-700 lg:hidden dark:text-gray-400">${ic("x", "h-6 w-6")}</button>
    </div>
    <nav class="no-scrollbar flex flex-col overflow-y-auto pb-8">
      <h3 class="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Vendas Internas</h3>
      <ul class="mb-6 flex flex-col gap-1">${itens}</ul>
    </nav></aside>
    <div data-acao="menu" class="fixed inset-0 z-[9998] bg-gray-900/50 lg:hidden ${S.menu ? "" : "hidden"}"></div>`;
}
const NOME_TELA = { vendas: "Vendas", conversas: "Conversas", conversa: "Conversas", ficha: "Vendas", equipe: "Vendas", prazos: "Vendas" };
function header() {
  const quem = sup() ? SUPERVISOR.nome : vend(S.como).nome;
  return `<header class="sticky top-0 z-[999] flex w-full flex-col border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div class="flex h-[60px] grow items-center gap-1.5 px-4 lg:px-6">
      <button type="button" data-acao="menu" aria-label="Abrir menu" class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800">${ic("menu")}</button>
      <nav class="flex min-w-0 items-center gap-1 text-sm"><span class="hidden rounded-lg px-2 py-1.5 text-gray-600 sm:inline dark:text-gray-400">Vendas Internas</span><span class="hidden text-gray-400 sm:inline">/</span><span class="truncate px-2 py-1.5 font-medium text-gray-800 dark:text-white">${NOME_TELA[S.tela]}</span></nav>
      <span class="ml-auto flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><span class="hidden sm:inline">${esc(quem)}${sup() ? ` <span class="text-gray-400">· supervisor</span>` : ""}</span>${avatar(quem, "h-9 w-9 text-sm")}</span>
    </div>
    ${!sup() && S.entrouComo ? `<div class="flex flex-wrap items-center gap-2 border-t border-warning-200 bg-warning-50 px-4 py-2 text-sm text-warning-800 lg:px-6 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-300">${ic("users", "h-4 w-4")}Você entrou como <b>${vend(S.como).curto}</b> — vê exatamente o que ela vê.<button type="button" data-acao="sair-como" class="font-semibold underline">Voltar a supervisor</button></div>` : ""}
  </header>`;
}
const tituloPagina = (t, sub = "", botoes = "") => `<div class="mb-5 flex flex-wrap items-end justify-between gap-3"><div class="min-w-0"><h2 class="text-2xl font-semibold text-gray-800 dark:text-white">${t}</h2>${sub ? `<p class="mt-0.5 ${V.muted}">${sub}</p>` : ""}</div><div class="flex shrink-0 flex-wrap items-center gap-2">${botoes}</div></div>`;
// seletor do supervisor: Todas | Fernanda | Juliana | Camila
const seletorVendedora = () => sup() ? segV3([["", "Todas"], ...VENDEDORAS.map((v) => [v.id, v.curto])], S.sel, "sel") : "";

// ── Entrar em contato: botões por canal (Meu dia, ficha, Clientes) ─────────
// menu suspenso (um aberto por vez: S.drop)
function drop(chave, rotulo, css, itens, lado = "right-0", seta = true, wrap = "relative inline-flex") {
  return `<div class="${wrap}" data-drop="${chave}"><button type="button" data-acao="drop" data-v="${chave}" aria-expanded="${S.drop === chave}" class="${css}">${rotulo}${seta ? ic("baixo", "h-3 w-3") : ""}</button>
    ${S.drop === chave ? `<div class="absolute ${lado} top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">${itens.map(([acao, v, txt, sub]) => acao === "-" ? `<p class="mt-1 border-t border-gray-100 px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:border-gray-700">${txt}</p>` :
      `<button type="button" data-acao="${acao}" data-v="${v}" class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5">${txt}${sub ? `<span class="block text-xs text-gray-400">${sub}</span>` : ""}</button>`).join("")}</div>` : ""}</div>`;
}
const waDrop = (c, css, lado = "right-0", rot = `${icWa("h-3.5 w-3.5")}WhatsApp`, chave = `wa:${c.id}`, seta = true) => drop(chave, rot, css, [["wa-central", c.id, "na Central", "abre a conversa dela na V3"], ["wa-web", c.id, "no WhatsApp Web", "manda pelo chip dela · entra na Atividade"]], lado, seta);
