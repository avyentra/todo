/* To Do List – state */
'use strict';

/* ================= state ================= */
const DEFAULT_SETTINGS = { theme: 'system', timeFmt: '12', weekStart: 0, sound: 'popcorn', vibration: true, vibStrength: 3, daySummary: true, summaryTime: '08:00', lastSummary: '', sort: 'due', hideSampleBanner: false };
const DEFAULT_LISTS = [
  { id: 'default', name: 'Default', color: '#1463C4' },
  { id: 'personal', name: 'Personal', color: '#8E44AD' },
  { id: 'shopping', name: 'Shopping', color: '#E07B00' },
  { id: 'wishlist', name: 'Wishlist', color: '#D6336C' },
  { id: 'work', name: 'Work', color: '#0F9D7A' }
];
const S = { lists: [], settings: { ...DEFAULT_SETTINGS }, tasks: {}, notes: {}, profile: null };
const UI = { view: 'tasks', list: 'all', query: '', calMonth: today().slice(0, 7), calSel: today(), headKey: '', showDone: {}, searchOpen: false, tab: 'today', ltab: 'todo' };

function seedData() {
  const t = today(), now = Date.now();
  let fri = t; while (pd(fri).getDay() !== 5 || fri === t) fri = addDays(fri, 1);
  const mk = (title, o = {}) => ({ id: newId() + Math.random().toString(36).slice(2, 4), title, listId: 'default', due: '', time: '', repeat: 'none', priority: 0, notes: '', subtasks: [], done: false, createdAt: now, sample: true, ...o });
  const tasks = [
    mk('Call Chris', { listId: 'work', due: t, time: '09:00', priority: 2 }),
    mk('Meeting with PR department', { listId: 'work', due: t, time: '12:00', notes: 'Bring the Q4 launch timeline.', subtasks: [{ id: 's1', t: 'Draft talking points', done: true }, { id: 's2', t: 'Share deck', done: false }] }),
    mk('Pay bills', { listId: 'personal', due: t, time: '18:00', repeat: 'monthly', priority: 3 }),
    mk('Visit dentist', { listId: 'personal', due: addDays(t, 1), time: '17:00' }),
    mk('Book restaurant for Friday', { due: fri, time: '15:00' }),
    ...['Avocado', 'Butter', 'Coffee', 'Eggs', 'Green tea', 'Milk'].map(x => mk(x, { listId: 'shopping' })),
    mk('Noise-cancelling headphones', { listId: 'wishlist', priority: 1 }),
    mk('Water the plants', { due: addDays(t, -1), done: true, doneAt: now - 86400000 })
  ];
  const notes = [
    { id: newId() + 'a', title: "Today's meeting", body: 'Meeting with Jarry (client) at 10:30.\nDiscuss pricing and next milestones.', color: '#D6336C', items: [], image: '', place: '', pinned: true, createdAt: now, sample: true },
    { id: newId() + 'b', title: 'Shopping list', body: '', color: '#2E86AB', items: [{ id: 'n1', t: 'Milk', done: false }, { id: 'n2', t: 'Fruits', done: false }, { id: 'n3', t: 'Tooth paste', done: false }, { id: 'n4', t: 'Oil', done: true }, { id: 'n5', t: 'Cheese', done: true }], image: '', place: '', pinned: false, createdAt: now - 1000, sample: true },
    { id: newId() + 'c', title: 'Lake club', body: 'Sunday breakfast spot.', color: '#0F9D7A', items: [], image: '', place: 'Sukhna Lake, Sector 1, Chandigarh, India', pinned: false, createdAt: now - 2000, sample: true }
  ];
  return { lists: clean(DEFAULT_LISTS), settings: { ...DEFAULT_SETTINGS, lastSummary: t }, tasks: Object.fromEntries(tasks.map(x => [x.id, x])), notes: Object.fromEntries(notes.map(x => [x.id, x])) };
}
function loadInto(d) {
  S.lists = Array.isArray(d.lists) && d.lists.length ? clean(d.lists) : clean(DEFAULT_LISTS);
  if (!S.lists.find(l => l.id === 'default')) S.lists.unshift(clean(DEFAULT_LISTS[0]));
  S.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
  S.profile = d.profile || null;
  S.tasks = d.tasks ? { ...d.tasks } : {};
  S.notes = d.notes ? { ...d.notes } : {};
}
