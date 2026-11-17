/* To Do List – local storage */
'use strict';

/* ================= local storage ================= */
const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};
let cacheKey = 'tdl-local';
let cacheTimer = 0;
function scheduleCache() {
  clearTimeout(cacheTimer);
  cacheTimer = setTimeout(() => {
    LS.set(cacheKey, { lists: S.lists, settings: S.settings, profile: S.profile, tasks: S.tasks, notes: S.notes });
  }, 300);
}
