/* To Do List – theme */
'use strict';

/* ================= theme ================= */
function applyTheme() {
  const p = S.settings.theme;
  let dark;
  if (p === 'dark') dark = true;
  else if (p === 'light') dark = false;
  else { const host = document.documentElement.getAttribute('data-theme'); dark = host ? host === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  document.documentElement.classList.toggle('dark', dark);
  const tb = $('#themeBtn'); if (tb) tb.innerHTML = ic(dark ? 'sun' : 'moon');
  return dark;
}
