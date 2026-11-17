/* To Do List – derived */
'use strict';

/* ================= derived ================= */
const listById = id => S.lists.find(l => l.id === id) || S.lists[0];
const pending = () => Object.values(S.tasks).filter(t => !t.done);
function matchQ(t, q) {
  return (t.title || '').toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q) || (t.subtasks || []).some(s => (s.t || '').toLowerCase().includes(q));
}
function sorter() {
  const s = S.settings.sort;
  const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (a.time || '99').localeCompare(b.time || '99') || (b.priority || 0) - (a.priority || 0) || (a.createdAt || 0) - (b.createdAt || 0);
  if (s === 'priority') return (a, b) => (b.priority || 0) - (a.priority || 0) || byDue(a, b);
  if (s === 'newest') return (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
  if (s === 'az') return (a, b) => (a.title || '').localeCompare(b.title || '');
  return byDue;
}
function groupOf(t) {
  if (!t.due) return 'nodate';
  if (isLate(t)) return 'overdue';
  const td = today();
  if (t.due === td) return 'today';
  if (t.due === addDays(td, 1)) return 'tomorrow';
  if (t.due <= addDays(td, 6)) return 'week';
  return 'later';
}
const GROUPS = [['overdue', 'Overdue'], ['today', 'Today'], ['tomorrow', 'Tomorrow'], ['week', 'This week'], ['later', 'Later'], ['nodate', 'No date']];
