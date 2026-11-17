/* To Do List – routing */
'use strict';

/* ================= routing ================= */
const VIEWS = ['tasks', 'notes', 'calendar', 'progress', 'prefs'];
function setHash() { const h = UI.view === 'tasks' ? '' : UI.view; try { if (location.hash.slice(1) !== h) history.replaceState(null, '', h ? '#' + h : location.pathname + location.search); } catch (e) { try { location.hash = h; } catch (e2) {} } }
function readHash() { const h = (location.hash || '').slice(1); if (VIEWS.includes(h)) UI.view = h; }
window.addEventListener('hashchange', () => { readHash(); render(); });
function go(view, list) {
  if (list === 'today') { list = 'all'; UI.tab = 'today'; }
  else if (list === 'finished') { list = 'all'; UI.tab = 'done'; }
  if (list && list !== UI.list) UI.ltab = 'todo';
  UI.view = view; if (list) UI.list = list;
  if (view === 'prefs') UI.headKey = '';
  $('#app').classList.remove('open');
  setHash(); render();
  $('#content').scrollTop = 0;
}
