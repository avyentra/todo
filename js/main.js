/* To Do List – boot */
'use strict';

/* ================= boot ================= */
try { new MutationObserver(() => applyTheme()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) {}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme()); } catch (e) {}
(function boot() {
  const last = LS.get('tdl-last');
  const cached = (typeof last === 'string' && LS.get(last)) || LS.get('tdl-local');
  if (cached) loadInto(cached); else { loadInto(seedData()); LS.set('tdl-local', { lists: S.lists, settings: S.settings, profile: S.profile, tasks: S.tasks, notes: S.notes }); }
  readHash();
  doRender();
  setInterval(checkReminders, 20000);
  setInterval(() => { if (!dlg.open && !document.activeElement.matches('input,textarea,select')) render(); }, 60000);
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) {}
  setTimeout(connect, 0);
})();
