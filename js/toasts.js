/* To Do List – toasts */
'use strict';

/* ================= toasts ================= */
function toast(msg, actLabel, actFn, opt = {}) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + (opt.cls || '');
  el.innerHTML = `<div class="msg">${opt.html ? msg : esc(msg)}</div>`;
  const close = () => { el.remove(); };
  const addBtn = (label, fn) => { const b = document.createElement('button'); b.textContent = label; b.onclick = () => { close(); fn(); }; el.appendChild(b); };
  if (opt.extra) addBtn(opt.extra[0], opt.extra[1]);
  if (actLabel) addBtn(actLabel, actFn);
  const x = document.createElement('button'); x.className = 'x'; x.setAttribute('aria-label', 'Dismiss'); x.innerHTML = ic('x', 'sm'); x.onclick = close; el.appendChild(x);
  box.appendChild(el);
  while (box.children.length > 2) box.firstChild.remove();
  if (!opt.persist) setTimeout(close, actLabel ? 6000 : 3500);
}
