/* To Do List – helpers */
'use strict';

/* ================= helpers ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = (n, cls = '') => `<svg class="i ${cls}"><use href="#i-${n}"/></svg>`;
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clean = o => JSON.parse(JSON.stringify(o));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dstr(new Date());
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return dstr(d); };
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WDL = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (S.settings.timeFmt === '24') return `${pad(h)}:${pad(m)}`;
  return `${(h % 12) || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}
function fmtDate(s, long) {
  if (!s) return '';
  const t = today();
  if (s === t) return 'Today';
  if (s === addDays(t, 1)) return 'Tomorrow';
  if (s === addDays(t, -1)) return 'Yesterday';
  const d = pd(s);
  const base = `${WD[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;
  return d.getFullYear() !== new Date().getFullYear() || long ? `${base}, ${d.getFullYear()}` : base;
}
const dueText = t => [fmtDate(t.due), fmtTime(t.time)].filter(Boolean).join(', ');
function isLate(t) {
  if (t.done || !t.due) return false;
  const td = today();
  return t.due < td || (t.due === td && t.time && t.time <= nowHM());
}
function nextDate(due, rule) {
  const d = pd(due);
  if (rule === 'daily') d.setDate(d.getDate() + 1);
  else if (rule === 'weekdays') { do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6); }
  else if (rule === 'weekly') d.setDate(d.getDate() + 7);
  else if (rule === 'monthly') { const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + 1); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); }
  else if (rule === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return dstr(d);
}
const REPEATS = { none: 'Does not repeat', daily: 'Every day', weekdays: 'Every weekday (Mon–Fri)', weekly: 'Once a week', monthly: 'Once a month', yearly: 'Once a year' };
const PRI = ['None', 'Low', 'Medium', 'High'];
const COLORS = ['#1463C4', '#8E44AD', '#E07B00', '#D6336C', '#0F9D7A', '#C9302C', '#2E86AB', '#6B7A8F'];
