/* To Do List – export / import */
'use strict';

/* ================= export / import ================= */
function backupJSON() {
  return JSON.stringify({ app: 'to-do-list', version: 1, exportedAt: new Date().toISOString(), lists: S.lists, settings: S.settings, tasks: Object.values(S.tasks), notes: Object.values(S.notes) }, null, 2);
}
function tasksCSV() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Title', 'List', 'Due date', 'Time', 'Repeat', 'Priority', 'Done', 'Notes', 'Subtasks'].map(q).join(',')];
  Object.values(S.tasks).sort(sorter()).forEach(t => rows.push([t.title, listById(t.listId).name, t.due, t.time, REPEATS[t.repeat || 'none'], PRI[t.priority || 0], t.done ? 'Yes' : 'No', t.notes, (t.subtasks || []).map(s => (s.done ? '[x] ' : '[ ] ') + s.t).join('; ')].map(q).join(',')));
  return rows.join('\n');
}
async function doExport(fmt) {
  if (!Downloads) return;
  try {
    await Downloads.save({ filename: `to-do-list-${today()}.${fmt}`, data: fmt === 'csv' ? tasksCSV() : backupJSON() });
    toast('Backup saved.');
  } catch (e) {
    const c = e && e.code;
    if (c === 'declined') return;
    if (c === 'rate_limited') toast('A save prompt is already open.');
    else { Downloads = null; UI.headKey = ''; render(); toast('Downloads aren’t available here. Use Copy backup instead.'); }
  }
}
async function importFile(file) {
  try {
    const d = JSON.parse(await file.text());
    if (!d || (!Array.isArray(d.tasks) && !Array.isArray(d.notes))) throw new Error('bad');
    if (Array.isArray(d.lists)) {
      const ids = new Set(S.lists.map(l => l.id));
      const add = d.lists.filter(l => l && l.id && l.name && !ids.has(l.id));
      if (add.length) S.lists = [...S.lists, ...add];
      saveMeta();
    }
    let n = 0;
    (d.tasks || []).forEach(t => { if (t && t.id && t.title) { if (!S.lists.find(l => l.id === t.listId)) t.listId = 'default'; S.tasks[t.id] = t; persist('tasks/' + t.id, t); n++; } });
    (d.notes || []).forEach(x => { if (x && x.id) { S.notes[x.id] = x; persist('notes/' + x.id, x); n++; } });
    render(); toast(`Restored ${n} item${n === 1 ? '' : 's'}.`);
  } catch (e) { toast('That file isn’t a To Do List backup. Choose the .json file you downloaded from Settings.'); }
}
async function copyText(txt, okMsg) {
  try { await navigator.clipboard.writeText(txt); toast(okMsg); }
  catch (e) { toast('Copying was blocked here. Select the text and copy it yourself.'); }
}
