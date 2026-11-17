/* To Do List – mutations */
'use strict';

/* ================= mutations ================= */
function saveTask(t) { S.tasks[t.id] = t; persist('tasks/' + t.id, t); render(); }
function delTask(id) { delete S.tasks[id]; persist('tasks/' + id, null); render(); }
function saveNote(n) { S.notes[n.id] = n; persist('notes/' + n.id, n); render(); }
function delNote(id) { delete S.notes[id]; persist('notes/' + id, null); render(); }
let metaTimer = 0;
function saveMeta() {
  scheduleCache();
  clearTimeout(metaTimer);
  metaTimer = setTimeout(() => { metaTimer = 0; persist('meta', { lists: S.lists, settings: S.settings, profile: S.profile }); }, 400);
  render();
}
function setSetting(k, v) { S.settings = { ...S.settings, [k]: v }; if (UI.view === 'prefs') UI.headKey = ''; saveMeta(); }

function toggleTask(id, el) {
  const t0 = S.tasks[id]; if (!t0) return;
  if (!t0.done) {
    playSound('done'); buzz(1);
    let finish = () => {
      if (t0.repeat && t0.repeat !== 'none' && t0.due) {
        const doneCopy = { ...clean(t0), id: newId(), done: true, doneAt: Date.now(), repeat: 'none', repeatOf: t0.id };
        let nd = nextDate(t0.due, t0.repeat);
        while (nd < today()) nd = nextDate(nd, t0.repeat);
        const next = { ...clean(t0), due: nd, subtasks: (t0.subtasks || []).map(s => ({ ...s, done: false })) };
        saveTask(doneCopy); saveTask(next);
        toast(`Done. Next one: ${dueText(next)}`, 'Undo', () => { delTask(doneCopy.id); saveTask(clean(t0)); });
      } else {
        const t = { ...clean(t0), done: true, doneAt: Date.now() };
        saveTask(t);
        toast(`“${t.title}” completed`, 'Undo', () => saveTask({ ...clean(t0) }));
      }
    };
    const finish0 = finish;
    finish = () => { finish0(); const td = today(); if (t0.due && t0.due <= td && !pending().some(x => x.due && x.due <= td)) setTimeout(celebrate, 350); };
    if (el) { el.classList.add('leaving'); const c = $('.chk', el); if (c) c.classList.add('on'); setTimeout(finish, 260); } else finish();
  } else {
    const t = { ...clean(t0), done: false }; delete t.doneAt; saveTask(t);
  }
}

function celebrate() {
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  const box = document.createElement('div'); box.className = 'confetti';
  const cols = ['#1463C4', '#F2B04A', '#4CD394', '#D6336C', '#8E44AD', '#5EA3FF'];
  for (let i = 0; i < 46; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * 0.35 + 's';
    p.style.setProperty('--dx', (Math.random() * 140 - 70) + 'px'); p.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
    box.appendChild(p);
  }
  $('#app').appendChild(box); setTimeout(() => box.remove(), 2600);
  if (S.settings.sound !== 'off') playSound('chime'); toast('All done for today. Great work!');
}
