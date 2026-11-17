/* To Do List – reminders, sound, vibration */
'use strict';

/* ================= reminders, sound, vibration ================= */
let actx = null;
function ensureAudio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
  if (actx && actx.state === 'suspended') actx.resume().catch(() => {});
  return actx;
}
function playSound(kind) {
  const snd = kind === 'done' ? (S.settings.sound === 'off' ? 'off' : 'done') : (kind || S.settings.sound);
  if (snd === 'off') return;
  const a = ensureAudio(); if (!a) return;
  const n = a.currentTime;
  const tone = (f, t0, d, type = 'sine', g = 0.2) => {
    try {
      const o = a.createOscillator(), gn = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, n + t0);
      gn.gain.setValueAtTime(0.0001, n + t0); gn.gain.exponentialRampToValueAtTime(g, n + t0 + 0.01); gn.gain.exponentialRampToValueAtTime(0.0001, n + t0 + d);
      o.connect(gn); gn.connect(a.destination); o.start(n + t0); o.stop(n + t0 + d + 0.03);
    } catch (e) {}
  };
  if (snd === 'popcorn') [0, 0.11, 0.19, 0.33, 0.41].forEach((t, i) => tone(820 + (i % 3) * 170, t, 0.06, 'triangle', 0.28));
  else if (snd === 'chime') { tone(784, 0, 0.7, 'sine', 0.22); tone(1175, 0.2, 0.9, 'sine', 0.18); }
  else if (snd === 'bell') { tone(1046, 0, 1.2, 'sine', 0.26); tone(2093, 0, 0.5, 'sine', 0.06); }
  else if (snd === 'done') { tone(660, 0, 0.1, 'triangle', 0.12); tone(990, 0.07, 0.16, 'triangle', 0.12); }
}
function buzz(level) {
  if (!S.settings.vibration || !navigator.vibrate) return;
  const k = S.settings.vibStrength || 3;
  try { navigator.vibrate(level === 1 ? 20 * k : [90 * k, 80, 90 * k]); } catch (e) {}
}
let fired = new Set(LS.get('tdl-fired') || []);
function checkReminders() {
  const now = Date.now();
  for (const t of Object.values(S.tasks)) {
    if (t.done || !t.due || !t.time) continue;
    const at = new Date(`${t.due}T${t.time}:00`).getTime();
    const key = `${t.id}@${t.due}T${t.time}`;
    if (at <= now && now - at < 5 * 60000 && !fired.has(key)) {
      fired.add(key);
      LS.set('tdl-fired', Array.from(fired).slice(-300));
      fireReminder(t);
    }
  }
  daySummaryCheck();
}
function fireReminder(t) {
  playSound(); buzz(2);
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification(t.title, { body: dueText(t) }); } catch (e) {}
  toast(`<b>${esc(t.title)}</b>${esc(dueText(t))}`, 'Done', () => toggleTask(t.id), { persist: true, cls: 'rem', html: true, extra: ['Snooze 10 min', () => snooze(t.id, 10)] });
}
function snooze(id, mins) {
  const t0 = S.tasks[id]; if (!t0) return;
  const d = new Date(Date.now() + mins * 60000);
  saveTask({ ...clean(t0), due: dstr(d), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` });
  toast(`Snoozed until ${fmtTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`);
}
let isDataReady = false;
function dataReady() { if (isDataReady) return; isDataReady = true; render(); setTimeout(daySummaryCheck, 1200); }
function daySummaryCheck() {
  if (!isDataReady || !S.settings.daySummary || UI.authMode) return;
  const td = today();
  if (S.settings.lastSummary === td || nowHM() < (S.settings.summaryTime || '08:00')) return;
  if ($('#dlg').open) return;
  setSetting('lastSummary', td);
  openSummary();
}
