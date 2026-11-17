/* To Do List – cloud (artifact db) */
'use strict';

/* ================= cloud (artifact db) ================= */
const Cloud = { on: false, state: 'connecting', meta: null, ready: false, confirmed: false, uploading: false, pending: {}, order: [], pumping: false, snapTasks: null, snapNotes: null };
let Dict = null, Downloads = null;

function persist(key, data) {
  scheduleCache();
  if (!Cloud.on) return;
  if (!(key in Cloud.pending)) Cloud.order.push(key);
  Cloud.pending[key] = data === null ? { del: true } : { data: clean(data) };
  pump();
}
function refFor(key) {
  if (key === 'meta') return Cloud.meta;
  const [c, id] = key.split('/');
  return Cloud.meta.collection(c).doc(id);
}
async function writeOne(key, p) {
  const ref = refFor(key);
  const go = () => p.del ? ref.delete() : ref.set(p.data);
  try { await go(); }
  catch (e) {
    const code = e && e.code;
    if (code === 'unavailable' || code === 'resource_exhausted') {
      await sleep(700 + Math.random() * 900);
      try { await go(); } catch (e2) { onWriteError(e2); }
    } else onWriteError(e);
  }
}
async function pump() {
  if (Cloud.pumping) return;
  Cloud.pumping = true; setSync();
  while (Cloud.order.length && Cloud.on) {
    const key = Cloud.order.shift();
    const p = Cloud.pending[key];
    delete Cloud.pending[key];
    if (p) await writeOne(key, p);
  }
  Cloud.pumping = false; setSync();
}
const drained = () => new Promise(r => { const ch = () => (!Cloud.pumping && !Cloud.order.length) ? r() : setTimeout(ch, 150); ch(); });
function onWriteError(e) {
  const code = e && e.code;
  if (code === 'quota_exceeded') { toast('Storage is full. Delete some old notes or photos, then try again.'); return; }
  if (code === 'invalid_argument' || code === 'revoked' || code === 'not_granted' || code === 'capability_disabled' || code === 'capability_removed') {
    goLocal('Couldn’t save to your account here, so changes are now saved in this browser.');
  }
}
function goLocal(msg) {
  Cloud.on = false; Cloud.state = 'local'; Cloud.order = []; Cloud.pending = {};
  cacheKey = 'tdl-local';
  scheduleCache();
  if (msg) toast(msg);
  setSync(); render(); dataReady();
}
function setSync() {
  const el = $('#sync'); if (!el) return;
  let cls = '', txt = '';
  if (Cloud.state === 'connecting') { cls = 'busy'; txt = 'Connecting to your account…'; }
  else if (Cloud.state === 'local') { cls = 'warn'; txt = 'Saved in this browser only'; }
  else if (Cloud.state === 'offline') { cls = 'warn'; txt = 'Can’t reach your account. Showing the saved copy.'; }
  else if (Cloud.pumping) { cls = 'busy'; txt = 'Saving…'; }
  else { cls = 'ok'; txt = 'Synced to your Claude account'; }
  el.className = 'sync ' + cls; el.innerHTML = `<i></i><span>${txt}</span>`;
}

async function connect() {
  const C = window.claude;
  if (!C || typeof C.use !== 'function') { goLocal(); return; }
  C.use('dictation').then(d => { if (d) setupDictation(d); }).catch(() => {});
  C.use('downloads').then(d => { Downloads = d || null; if (UI.view === 'prefs') { UI.headKey = ''; render(); } }).catch(() => {});
  let db = null, user = null, uidv = null;
  try { [db, user] = await Promise.all([C.use('db'), C.use('user')]); } catch (e) {}
  if (db && user) { try { uidv = await user.id(); } catch (e) {} }
  if (!db || !uidv) { goLocal(); return; }
  Cloud.on = true; Cloud.state = 'connecting';
  cacheKey = 'tdl-cache:' + uidv; LS.set('tdl-last', cacheKey);
  const cached = LS.get(cacheKey);
  if (cached) { loadInto(cached); render(); }
  try {
    Cloud.meta = db.doc('data/users/' + uidv + '/app');
    const timer = setTimeout(() => { if (!Cloud.confirmed) { Cloud.state = 'offline'; setSync(); dataReady(); render(); } }, 10000);
    const onErr = e => { clearTimeout(timer); if (e && e.code === 'revoked') goLocal(); else { Cloud.state = 'offline'; setSync(); } };
    Cloud.meta.onSnapshot(s => onMeta(s, timer), onErr);
    Cloud.meta.collection('tasks').onSnapshot(s => { Cloud.snapTasks = s; applySnaps(); }, onErr);
    Cloud.meta.collection('notes').onSnapshot(s => { Cloud.snapNotes = s; applySnaps(); }, onErr);
  } catch (e) { goLocal(); }
}
function onMeta(s, timer) {
  if (!s.metadata.fromCache && !Cloud.confirmed) { Cloud.confirmed = true; clearTimeout(timer); if (Cloud.state !== 'local') Cloud.state = 'cloud'; setSync(); }
  if (!s.exists) {
    if (s.metadata.fromCache || Cloud.ready) return;
    Cloud.ready = true; firstCloudInit(); return;
  }
  const d = s.data();
  if (!metaTimer && !('meta' in Cloud.pending)) {
    S.lists = Array.isArray(d.lists) && d.lists.length ? clean(d.lists) : S.lists;
    S.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
    S.profile = d.profile || null;
    if (UI.view === 'prefs') UI.headKey = '';
  }
  const wasReady = Cloud.ready;
  Cloud.ready = true;
  applySnaps();
  if (!wasReady) dataReady();
  scheduleCache(); render();
}
async function firstCloudInit() {
  // New account: bring over anything kept in this browser, or start with sample data
  const local = LS.get('tdl-local');
  if (local && (Object.keys(local.tasks || {}).length || Object.keys(local.notes || {}).length)) loadInto(local);
  else loadInto(seedData());
  Cloud.uploading = true; render();
  persist('meta', { lists: S.lists, settings: S.settings, profile: S.profile });
  Object.values(S.tasks).forEach(t => persist('tasks/' + t.id, t));
  Object.values(S.notes).forEach(n => persist('notes/' + n.id, n));
  await drained();
  Cloud.uploading = false;
  dataReady(); render();
}
function applySnaps() {
  if (!Cloud.ready || Cloud.uploading) return;
  if (Cloud.snapTasks) S.tasks = Object.fromEntries(Cloud.snapTasks.docs.map(d => [d.id, d.data()]));
  if (Cloud.snapNotes) S.notes = Object.fromEntries(Cloud.snapNotes.docs.map(d => [d.id, d.data()]));
  for (const k in Cloud.pending) {
    const p = Cloud.pending[k]; const [c, id] = k.split('/');
    const bag = c === 'tasks' ? S.tasks : c === 'notes' ? S.notes : null;
    if (!bag) continue;
    if (p.del) delete bag[id]; else bag[id] = p.data;
  }
  scheduleCache(); render();
}
