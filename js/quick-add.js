/* To Do List – quick add parser */
'use strict';

/* ================= quick add parser ================= */
function parseQuick(text) {
  let s = ' ' + text + ' ';
  const r = {};
  const take = (re, fn) => { s = s.replace(re, (...m) => { const v = fn(...m); return v === false ? m[0] : ' '; }); };
  take(/\s!(high|h|3)(?=\s)/i, () => { r.priority = 3; });
  take(/\s!(medium|med|m|2)(?=\s)/i, () => { r.priority = 2; });
  take(/\s!(low|l|1)(?=\s)/i, () => { r.priority = 1; });
  take(/\s#([\w-]+)(?=\s)/, (m, n) => { const l = S.lists.find(x => x.name.toLowerCase() === n.toLowerCase()); if (!l) return false; r.listId = l.id; });
  take(/\s(every\s+day|daily)(?=\s)/i, () => { r.repeat = 'daily'; });
  take(/\s(every\s+weekday|weekdays)(?=\s)/i, () => { r.repeat = 'weekdays'; });
  take(/\s(every\s+week|weekly)(?=\s)/i, () => { r.repeat = 'weekly'; });
  take(/\s(every\s+month|monthly)(?=\s)/i, () => { r.repeat = 'monthly'; });
  take(/\s(every\s+year|yearly)(?=\s)/i, () => { r.repeat = 'yearly'; });
  take(/\s(today|tonight)(?=\s)/i, () => { r.due = today(); });
  take(/\s(tomorrow|tmrw|tmr)(?=\s)/i, () => { r.due = addDays(today(), 1); });
  take(/\snext\s+week(?=\s)/i, () => { r.due = addDays(today(), 7); });
  take(/\s(?:on\s+)?(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)(?:day|nesday|urday|sday)?(?=\s)/i, (m, w) => {
    const idx = WDL.findIndex(x => x.startsWith(w.toLowerCase().slice(0, 3)));
    if (idx < 0) return false;
    let d = addDays(today(), 1); while (pd(d).getDay() !== idx) d = addDays(d, 1); r.due = d;
  });
  const setT = (h, mi, ap) => {
    h = +h; mi = +(mi || 0);
    if (ap) { ap = ap.toLowerCase(); if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0; }
    if (h > 23 || mi > 59) return false;
    r.time = `${pad(h)}:${pad(mi)}`;
  };
  take(/\s(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)(?=\s)/i, (m, h, mi, ap) => setT(h, mi, ap));
  if (!r.time) take(/\s(?:at\s+)?(\d{1,2}):(\d{2})(?=\s)/i, (m, h, mi) => setT(h, mi));
  if (!r.time) take(/\sat\s+(\d{1,2})(?=\s)/i, (m, h) => setT(h, 0));
  r.title = s.trim().replace(/\s+/g, ' ');
  if ((r.time || (r.repeat && r.repeat !== 'none')) && !r.due) r.due = (r.time && r.time <= nowHM()) ? addDays(today(), 1) : today();
  return r;
}
