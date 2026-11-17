/* To Do List – rendering */
'use strict';

/* ================= rendering ================= */
let rq = 0;
function render() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; doRender(); }); }
function doRender() {
  renderAuth();
  renderAddApp();
  if (UI.list !== 'all' && !S.lists.find(l => l.id === UI.list)) { UI.list = 'all'; UI.headKey = ''; }
  applyTheme();
  renderSide();
  renderTop();
  const key = UI.view + '|' + UI.list;
  if (key !== UI.headKey) { UI.headKey = key; renderHead(); }
  renderBody();
  $$('#bnav button').forEach(b => b.classList.toggle('on', b.dataset.id === UI.view));
  const fab = $('#fab');
  fab.style.display = (UI.view === 'prefs' || UI.view === 'progress') ? 'none' : '';
  fab.setAttribute('aria-label', UI.view === 'notes' ? 'Add new note' : 'Add new task');
  setSync();
}
function renderSide() {
  const p = pending();
  const td = today();
  const cnt = id => p.filter(t => t.listId === id).length;
  const late = p.filter(isLate).length;
  const todayN = p.filter(t => t.due && t.due <= td).length;
  const doneN = Object.values(S.tasks).filter(t => t.done).length;
  const it = (act, id, icon, name, n, on, extra = '') => `<button class="nav-item ${on ? 'on' : ''}" data-act="${act}" data-id="${esc(id)}">${icon}<span class="t">${esc(name)}</span>${extra}${n ? `<span class="badge num">${n}</span>` : ''}</button>`;
  const tv = UI.view === 'tasks';
  $('#side').innerHTML = `
    <div class="brand">${S.profile ? `<div class="avatar big" style="--ac:${esc(S.profile.color)}">${esc(initials(S.profile.name))}</div><h1>${esc(S.profile.name)}</h1><small>${esc(S.profile.email || 'My account')}</small>` : `<img class="brand-logo" src="icons/logo.png" alt="" width="64" height="64"><h1>To Do List</h1><small>Tasks, lists &amp; notes</small>`}</div>
    <nav class="nav" aria-label="Views">
      ${it('list', 'all', ic('home'), 'All Lists', p.length, tv && UI.list === 'all', late ? `<span class="badge red num" title="Overdue">${late}</span>` : '')}
      ${it('list', 'today', ic('sun'), 'Today', todayN, false)}
    </nav>
    <div class="nav-label"><span>My lists</span><button data-act="newlist" aria-label="Create a new list" title="New list">${ic('plus', 'sm')}</button></div>
    <nav class="nav" aria-label="Lists">
      ${S.lists.map(l => it('list', l.id, `<i class="dot" style="background:${esc(l.color)}"></i>`, l.name, cnt(l.id), tv && UI.list === l.id)).join('')}
      ${it('list', 'finished', ic('done'), 'Finished', doneN, false)}
    </nav>
    <div class="side-foot">
      ${it('view', 'prefs', ic('sliders'), 'Settings', 0, UI.view === 'prefs')}
      ${S.profile ? `<button class="nav-item" data-act="logout">${ic('logout')}<span class="t">Log out</span></button>` : ''}
      <div class="sync" id="sync"></div>
    </div>`;
}
function renderTop() {
  let title = 'Tasks', sub = '';
  if (UI.view === 'tasks') {
    sub = UI.list === 'all' ? 'All Lists' : listById(UI.list).name;
    if (UI.query) sub = `Search: “${UI.query}”`;
  } else if (UI.view === 'notes') { title = 'Notes'; sub = UI.query ? `Search: “${UI.query}”` : 'Lists, photos & places'; }
  else if (UI.view === 'calendar') { title = 'Calendar'; sub = fmtDate(UI.calSel, true); }
  else if (UI.view === 'progress') { title = 'Progress'; sub = 'How you’re doing'; }
  else if (UI.view === 'prefs') { title = 'Settings'; sub = 'General, reminders & backup'; }
  $('#sortBtn').style.display = UI.view === 'tasks' ? '' : 'none';
  $('#topTitle').textContent = title;
  $('#topSub').textContent = sub;
}

function renderHead() {
  const h = $('#vhead');
  if (UI.view === 'tasks') {
    const real = S.lists.find(l => l.id === UI.list);
    const top = real ? `<div class="listhead"><h3><i class="dot" style="background:${esc(real.color)}"></i>${esc(real.name)}</h3>
      <button class="iconbtn" data-act="sharelist" title="Copy list as text" aria-label="Copy list as text">${ic('copy')}</button>
      <button class="iconbtn" data-act="checkall" title="Mark all as done" aria-label="Mark all as done">${ic('checkall')}</button>
      <button class="iconbtn" data-act="editlist" title="Rename or recolor list" aria-label="Rename or recolor list">${ic('edit')}</button>
      ${real.id !== 'default' ? `<button class="iconbtn danger" data-act="dellist" title="Delete list" aria-label="Delete list">${ic('trash')}</button>` : ''}</div>` : '<div id="heroSlot" style="display:flex;flex-direction:column;gap:12px"></div>';
    h.innerHTML = `${top}
      <form class="card quick" id="quickForm" autocomplete="off">
        <input id="quickInput" placeholder="Add a task, e.g. Call mom 6pm" aria-label="Quick add task. You can type dates like tomorrow 6pm, !high, #Work or every month.">
        <button type="button" class="iconbtn mic" data-act="mic" data-for="quickInput" aria-label="Speak your task">${ic('mic')}</button>
        <button type="submit" class="btn primary" aria-label="Add task">${ic('plus')}</button>
      </form>
      <div id="tabSlot" style="display:contents"></div>`;
  } else if (UI.view === 'notes') {
    h.innerHTML = `
      <form class="card notebar" id="noteForm" autocomplete="off">
        <input id="noteInput" placeholder="Add a quick note…" aria-label="Quick note">
        <button type="button" class="iconbtn mic" data-act="mic" data-for="noteInput" aria-label="Speak your note">${ic('mic')}</button>
        <button type="button" class="iconbtn" data-act="newnote" data-kind="list" title="New checklist" aria-label="New checklist">${ic('checklist')}</button>
        <button type="button" class="iconbtn" data-act="newnote" data-kind="photo" title="New photo note" aria-label="New photo note">${ic('image')}</button>
        <button type="button" class="iconbtn" data-act="newnote" data-kind="place" title="New place" aria-label="New place">${ic('mappin')}</button>
      </form>`;
  } else if (UI.view === 'prefs') {
    h.innerHTML = prefsHTML();
  } else h.innerHTML = '';
}

function shortDate(s) {
  const t = today();
  if (s === t) return 'Today';
  if (s === addDays(t, 1)) return 'Tomorrow';
  if (s === addDays(t, -1)) return 'Yesterday';
  if (s > t && s <= addDays(t, 6)) return WD[pd(s).getDay()];
  const d = pd(s); return `${MON[d.getMonth()]} ${d.getDate()}`;
}
function taskRow(t, showList) {
  const l = listById(t.listId);
  const late = isLate(t);
  const subs = t.subtasks || [];
  const meta = [];
  if (showList && l) meta.push(`<span class="lp" style="--lc:${esc(l.color)}">${esc(l.name)}</span>`);
  if (t.done && t.doneAt) meta.push(`<span class="m">${ic('check', 'sm')} ${esc(shortDate(dstr(new Date(t.doneAt))))}</span>`);
  if (t.repeat && t.repeat !== 'none') meta.push(`<span class="m" title="${esc(REPEATS[t.repeat])}">${ic('repeat', 'sm')}</span>`);
  if (subs.length) meta.push(`<span class="m">${ic('checklist', 'sm')} <span class="num">${subs.filter(s => s.done).length}/${subs.length}</span></span>`);
  if (t.notes) meta.push(`<span class="m" title="Has notes">${ic('lines', 'sm')}</span>`);
  let when = '';
  if (!t.done && t.due) when = t.time ? `<b>${esc(fmtTime(t.time))}</b>${t.due !== today() ? `<small>${esc(shortDate(t.due))}</small>` : ''}` : `<b>${esc(shortDate(t.due))}</b>`;
  return `<div class="swipe"><div class="swbg"><span class="l">${ic('check')} ${t.done ? 'Not done' : 'Done'}</span><span class="r">Delete ${ic('trash')}</span></div><div class="task ${t.priority ? 'pr' + t.priority : ''} ${t.done ? 'done' : ''}" data-id="${esc(t.id)}">
    <button class="chk ${t.done ? 'on' : ''}" data-act="toggle" aria-label="${t.done ? 'Mark as not done' : 'Mark as done'}: ${esc(t.title)}${t.priority ? ', ' + PRI[t.priority] + ' priority' : ''}">${ic('check')}</button>
    <div class="tbody" data-act="opentask" role="button" tabindex="0"><div class="ttl">${esc(t.title)}</div>${meta.length ? `<div class="meta">${meta.join('')}</div>` : ''}</div>
    ${when ? `<div class="when ${late ? 'late' : ''}" data-act="opentask">${when}</div>` : ''}
    <div class="acts"><button class="iconbtn danger" data-act="deltask" aria-label="Delete task">${ic('trash', 'sm')}</button></div>
  </div></div>`;
}
const emptyArt = `<svg class="ill" viewBox="0 0 150 110" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".55"><path d="M30 100c2-30 8-55 22-74M30 30c8-8 22-10 30-4M30 30c-8-6-20-4-26 2M30 30c4-10 14-16 24-14"/><path d="M120 100c-2-30-8-55-22-74M120 30c-8-8-22-10-30-4M120 30c8-6 20-4 26 2M120 30c-4-10-14-16-24-14"/><path d="M40 66c20 16 50 16 70 0"/><path d="M10 102h130"/></g><circle cx="75" cy="52" r="17" stroke-width="3" style="fill:var(--surface);stroke:var(--accent)"/><path d="M67 52l6 6 10-11" fill="none" style="stroke:var(--accent)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function renderBody() {
  const b = $('#vbody');
  if (UI.view === 'tasks') {
    b.innerHTML = tasksBody();
    const k = UI.list + '|' + UI.tab + '|' + UI.ltab;
    if (k !== UI.animKey) { UI.animKey = k; $$('.swipe', b).forEach((el, i) => { el.style.animationDelay = Math.min(i, 8) * 35 + 'ms'; el.classList.add('in'); }); }
  }
  else if (UI.view === 'notes') b.innerHTML = notesBody();
  else if (UI.view === 'calendar') b.innerHTML = calendarBody();
  else if (UI.view === 'progress') b.innerHTML = progressBody();
  else b.innerHTML = '';
}

function heroHTML() {
  const td = today(), p = pending();
  const late = p.filter(isLate).length;
  const dueToday = p.filter(t => t.due === td && !isLate(t)).length;
  const doneToday = Object.values(S.tasks).filter(t => t.done && t.doneAt && dstr(new Date(t.doneAt)) === td).length;
  const upcoming = p.filter(t => t.due && t.due > td).length;
  const total = doneToday + late + dueToday;
  const pct = total ? Math.round(doneToday / total * 100) : 100;
  const C = 2 * Math.PI * 25;
  const d = new Date(), h = d.getHours();
  return `<section class="hero">
    <div><span class="hello">${h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'}${S.profile ? ', ' + esc(S.profile.name.split(' ')[0]) : ''}</span>
      <b class="hdate">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]}, ${d.getDate()} ${MONL[d.getMonth()]}</b>
      <span class="hsub">${!total ? 'Nothing due today. Enjoy!' : doneToday === total ? 'All done for today. Great work!' : doneToday ? `${doneToday} of ${total} done. Keep going!` : `${total} task${total > 1 ? 's' : ''} to go today`}</span></div>
    <svg class="ring" viewBox="0 0 62 62" role="img" aria-label="${pct}% of today done"><circle cx="31" cy="31" r="25" fill="none" stroke-width="7" style="stroke:rgba(255,255,255,.22)"/><circle cx="31" cy="31" r="25" fill="none" stroke-width="7" stroke-linecap="round" transform="rotate(-90 31 31)" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}" style="stroke:#fff"/><text x="31" y="36" text-anchor="middle" font-size="14" font-weight="700" style="fill:#fff">${pct}%</text></svg>
    <div class="hstats">
      <button class="hs ${late ? 'red' : ''}" data-act="tab" data-tab="today"><b>${late}</b>Overdue</button>
      <button class="hs" data-act="tab" data-tab="today"><b>${dueToday}</b>Today</button>
      <button class="hs" data-act="tab" data-tab="upcoming"><b>${upcoming}</b>Upcoming</button>
    </div></section>`;
}
function groupsHTML(list, keys, showList) {
  let out = '';
  for (const [k, label] of GROUPS) {
    if (!keys.includes(k)) continue;
    const items = list.filter(t => groupOf(t) === k);
    const gi = { overdue: 'alert', today: 'sun', tomorrow: 'clock', week: 'cal', later: 'cal', nodate: 'lines' }[k];
    if (items.length) out += `<section class="group ${k}"><h4>${ic(gi, 'sm')}${label} <span class="n num">${items.length}</span></h4>${items.map(t => taskRow(t, showList)).join('')}</section>`;
  }
  return out;
}
function doneHTML(done) {
  const td = today(), yd = addDays(td, -1);
  const gk = t => { const d = t.doneAt ? dstr(new Date(t.doneAt)) : ''; return d === td ? 'Today' : d === yd ? 'Yesterday' : d >= addDays(td, -6) ? 'Earlier this week' : 'Older'; };
  let out = `<div class="row"><span class="grow" style="font-size:13px;color:var(--muted)">Swipe right on a task to bring it back.</span><button class="btn sm danger" data-act="clearfinished">${ic('trash', 'sm')} Clear all</button></div>`;
  for (const g of ['Today', 'Yesterday', 'Earlier this week', 'Older']) {
    const items = done.filter(t => gk(t) === g);
    if (items.length) out += `<section class="group"><h4>${g} <span class="n num">${items.length}</span></h4>${items.map(t => taskRow(t, true)).join('')}</section>`;
  }
  return out;
}
const emptyCard = (title, sub) => `<div class="card empty">${emptyArt}<b>${title}</b><span>${sub}</span></div>`;
function tasksBody() {
  const q = UI.query.trim().toLowerCase();
  const all = Object.values(S.tasks);
  const td = today();
  const real = S.lists.find(l => l.id === UI.list);
  const hs = $('#heroSlot'); if (hs) hs.innerHTML = heroHTML();
  const slot = $('#tabSlot');
  let out = '';
  const samples = all.some(t => t.sample) || Object.values(S.notes).some(n => n.sample);
  if (samples && !S.settings.hideSampleBanner && !q) out += `<div class="slim">${ic('flag', 'sm')}<span>Showing sample tasks</span><button data-act="clearsamples">Remove</button><button data-act="hidesamplebanner" aria-label="Keep samples and hide this">${ic('x', 'sm')}</button></div>`;

  // search: one combined result list, no tabs
  if (q) {
    if (slot) slot.innerHTML = '';
    const hits = all.filter(t => (!real || t.listId === real.id) && matchQ(t, q)).sort(sorter());
    const open = hits.filter(t => !t.done), done = hits.filter(t => t.done);
    if (open.length) out += groupsHTML(open, GROUPS.map(g => g[0]), !real);
    if (done.length) out += `<section class="group"><h4>Done <span class="n num">${done.length}</span></h4>${done.map(t => taskRow(t, !real)).join('')}</section>`;
    const nq = Object.values(S.notes).filter(n => noteMatch(n, q));
    if (nq.length) out += `<section class="group"><h4>Notes <span class="n num">${nq.length}</span></h4><div class="masonry">${nq.map(noteCard).join('')}</div></section>`;
    if (!hits.length && !nq.length) out += `<div class="card empty"><b>Nothing matches “${esc(UI.query)}”</b><span>Try a different word.</span></div>`;
    return out;
  }

  const pend = all.filter(t => !t.done && (!real || t.listId === real.id)).sort(sorter());
  const done = all.filter(t => t.done && (!real || t.listId === real.id)).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  let tabs, cur;
  if (real) {
    tabs = [['todo', 'To do', pend.length], ['done', 'Done', done.length]];
    cur = UI.ltab;
  } else {
    const tl = pend.filter(t => t.due && t.due <= td);
    tabs = [['today', 'Today', tl.length, tl.some(isLate)], ['upcoming', 'Upcoming', pend.filter(t => t.due && t.due > td).length], ['someday', 'Someday', pend.filter(t => !t.due).length], ['done', 'Done', done.length]];
    cur = UI.tab;
  }
  if (slot) {
    const sig = tabs.map(x => x[0]).join(',');
    let box = $('.tabs', slot);
    if (!box || box.dataset.sig !== sig) {
      slot.innerHTML = `<div class="tabs" role="tablist" aria-label="Task tabs" data-sig="${sig}" style="--n:${tabs.length}">${tabs.map(([id]) => `<button class="tab" role="tab" data-act="tab" data-tab="${id}"></button>`).join('')}</div>`;
      box = $('.tabs', slot);
    }
    tabs.forEach(([id, l, n, red], i) => {
      const b = box.children[i];
      b.classList.toggle('on', cur === id); b.setAttribute('aria-selected', cur === id);
      b.innerHTML = `${l}${n ? `<span class="${red && cur !== id ? 'red' : ''}">${n}</span>` : ''}`;
      if (cur === id) box.style.setProperty('--i', i);
    });
  }

  if (cur === 'done') return out + (done.length ? doneHTML(done) : emptyCard('Nothing finished yet', 'Tick off a task and it will show up here.'));
  if (real) {
    if (!pend.length) return out + emptyCard('All done here', 'Add something above, or enjoy the free time.');
    return out + (pend.every(t => !t.due) ? `<section class="group">${pend.map(t => taskRow(t, false)).join('')}</section>` : groupsHTML(pend, GROUPS.map(g => g[0]), false));
  }
  if (cur === 'today') {
    const list = pend.filter(t => t.due && t.due <= td);
    return out + (list.length ? groupsHTML(list, ['overdue', 'today'], true) : emptyCard('Nothing to do today', 'Enjoy your free time, or check Upcoming.'));
  }
  if (cur === 'upcoming') {
    const list = pend.filter(t => t.due && t.due > td);
    return out + (list.length ? groupsHTML(list, ['tomorrow', 'week', 'later'], true) : emptyCard('Nothing coming up', 'Tasks with a future date show up here.'));
  }
  const list = pend.filter(t => !t.due);
  return out + (list.length ? `<section class="group">${list.map(t => taskRow(t, true)).join('')}</section>` : emptyCard('No someday tasks', 'Tasks without a date land here.'));
}

function noteMatch(n, q) {
  return [n.title, n.body, n.place, ...(n.items || []).map(i => i.t)].some(x => (x || '').toLowerCase().includes(q));
}
function noteCard(n) {
  const items = n.items || [];
  const shown = items.slice(0, 8);
  return `<article class="note" style="--nc:${esc(n.color || '#1463C4')}" data-id="${esc(n.id)}" data-act="opennote" tabindex="0">
    ${n.title ? `<h5><span>${esc(n.title)}</span>${n.pinned ? ic('pin', 'sm') : ''}</h5>` : (n.pinned ? `<h5><span></span>${ic('pin', 'sm')}</h5>` : '')}
    ${n.image ? `<img src="${esc(n.image)}" alt="${esc(n.title || 'Photo note')}">` : ''}
    ${n.body ? `<p>${esc(n.body)}</p>` : ''}
    ${items.length ? `<div class="nitems">${shown.map(i => `<button class="nitem ${i.done ? 'on' : ''}" data-act="nitem" data-item="${esc(i.id)}"><span class="chk ${i.done ? 'on' : ''}">${ic('check')}</span><span>${esc(i.t)}</span></button>`).join('')}${items.length > shown.length ? `<small style="color:var(--muted)">+${items.length - shown.length} more</small>` : ''}</div>` : ''}
    ${n.place ? `<div class="place">${ic('mappin', 'sm')}<span>${esc(n.place)}</span></div>` : ''}
    <div class="nfoot"><span>${esc(fmtDate(dstr(new Date(n.createdAt || Date.now())), true))}</span>${items.length ? `<span class="num">${items.filter(i => i.done).length}/${items.length}</span>` : ''}</div>
  </article>`;
}
function notesBody() {
  const q = UI.query.trim().toLowerCase();
  let notes = Object.values(S.notes);
  if (q) notes = notes.filter(n => noteMatch(n, q));
  notes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (!notes.length) return q ? `<div class="card empty"><b>No notes match “${esc(UI.query)}”</b></div>` : `<div class="card empty">${emptyArt}<b>Save anything that comes to mind</b><span>Type a quick note above, or start a checklist, photo or place.</span></div>`;
  const pinned = notes.filter(n => n.pinned), rest = notes.filter(n => !n.pinned);
  let out = '';
  if (pinned.length) out += `<div class="section-title">Pinned</div><div class="masonry">${pinned.map(noteCard).join('')}</div>`;
  if (rest.length) out += `${pinned.length ? '<div class="section-title">Others</div>' : ''}<div class="masonry">${rest.map(noteCard).join('')}</div>`;
  return out;
}

function calendarBody() {
  const [y, m] = UI.calMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const ws = +S.settings.weekStart || 0;
  const start = new Date(first); start.setDate(1 - ((first.getDay() - ws + 7) % 7));
  const td = today();
  const byDay = {};
  for (const t of Object.values(S.tasks)) {
    const d = t.done ? (t.due || (t.doneAt ? dstr(new Date(t.doneAt)) : '')) : t.due;
    if (d) (byDay[d] = byDay[d] || []).push(t);
  }
  let cells = '';
  for (let i = 0; i < 7; i++) cells += `<div class="wd">${WD[(i + ws) % 7]}</div>`;
  const d = new Date(start);
  for (let i = 0; i < 42; i++) {
    const s = dstr(d);
    const items = byDay[s] || [];
    const dots = items.slice(0, 4).map(t => `<i class="${t.done ? 'done' : isLate(t) ? 'late' : ''}"></i>`).join('') + (items.length > 4 ? `+${items.length - 4}` : '');
    cells += `<button class="cday ${d.getMonth() !== m - 1 ? 'out' : ''} ${s === td ? 'today' : ''} ${s === UI.calSel ? 'sel' : ''}" data-act="calday" data-date="${s}" aria-label="${esc(fmtDate(s, true))}, ${items.length} tasks"><span class="d">${d.getDate()}</span><span class="dots">${dots}</span></button>`;
    d.setDate(d.getDate() + 1);
  }
  const sel = (byDay[UI.calSel] || []).slice().sort((a, b) => (a.done - b.done) || (a.time || '99').localeCompare(b.time || '99'));
  return `
    <div class="calhead">
      <button class="iconbtn" data-act="calprev" aria-label="Previous month">${ic('cl')}</button>
      <h3>${MONL[m - 1]} ${y}</h3>
      <button class="btn sm" data-act="caltoday">Today</button>
      <button class="iconbtn" data-act="calnext" aria-label="Next month">${ic('cr')}</button>
    </div>
    <div class="cal">${cells}</div>
    <section class="group">
      <div class="row"><h4 class="grow" style="margin:6px 2px 0;font-size:15px;color:var(--ink)">${esc(fmtDate(UI.calSel, true))} <span class="n num" style="color:var(--muted);font-weight:600">${sel.length}</span></h4><button class="btn sm primary" data-act="addonday">${ic('plus', 'sm')} Add task</button></div>
      ${sel.length ? sel.map(t => taskRow(t, true)).join('') : `<div class="card empty" style="padding:20px"><span>No tasks on this day.</span></div>`}
    </section>`;
}

function progressBody() {
  const all = Object.values(S.tasks);
  const td = today();
  const p = all.filter(t => !t.done), done = all.filter(t => t.done);
  const late = p.filter(isLate).length;
  const doneToday = done.filter(t => t.doneAt && dstr(new Date(t.doneAt)) === td).length;
  const rate = all.length ? Math.round(done.length / all.length * 100) : 0;
  const days = []; for (let i = 6; i >= 0; i--) days.push(addDays(td, -i));
  const counts = days.map(d => done.filter(t => t.doneAt && dstr(new Date(t.doneAt)) === d).length);
  let streak = 0; { let d = td; const has = x => done.some(t => t.doneAt && dstr(new Date(t.doneAt)) === x); if (!has(d)) d = addDays(d, -1); while (has(d)) { streak++; d = addDays(d, -1); } }
  const max = Math.max(4, ...counts);
  const W = 560, H = 200, pl = 28, pb = 26, pt = 14, bw = (W - pl - 10) / 7;
  const step = max <= 4 ? 1 : Math.ceil(max / 4);
  const top = Math.ceil(max / step) * step;
  let grid = '';
  for (let v = 0; v <= top; v += step) { const yy = pt + (H - pt - pb) * (1 - v / top); grid += `<line x1="${pl}" x2="${W - 6}" y1="${yy}" y2="${yy}" style="stroke:var(--line)" stroke-width="1"/><text x="${pl - 6}" y="${yy + 4}" text-anchor="end" font-size="11" style="fill:var(--muted)">${v}</text>`; }
  const bars = counts.map((c, i) => { const h = (H - pt - pb) * c / top; const x = pl + i * bw + bw * 0.22; const w = bw * 0.56; const yy = H - pb - h; const isT = i === 6;
    return `<rect x="${x}" y="${yy}" width="${w}" height="${Math.max(h, 0)}" rx="5" style="fill:var(--accent)" opacity="${isT ? 1 : .55}"/>${c ? `<text x="${x + w / 2}" y="${yy - 5}" text-anchor="middle" font-size="11" font-weight="700" style="fill:var(--ink)">${c}</text>` : ''}<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" font-size="11" style="fill:var(--muted)" font-weight="${isT ? 700 : 400}">${isT ? 'Today' : WD[pd(days[i]).getDay()]}</text>`; }).join('');
  const lists = S.lists.map(l => { const lt = all.filter(t => t.listId === l.id); const ld = lt.filter(t => t.done).length; const pc = lt.length ? Math.round(ld / lt.length * 100) : 0;
    return `<div class="bar-row"><span style="display:flex;align-items:center;gap:8px;min-width:0"><i style="width:9px;height:9px;border-radius:3px;background:${esc(l.color)};flex:none"></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.name)}</span></span><div class="bar"><i style="width:${pc}%;background:${esc(l.color)}"></i></div><span class="pct">${ld}/${lt.length}</span></div>`; }).join('');
  return `
    <div class="tiles">
      <div class="card tile"><span class="v">${p.length}</span><span class="k">To do</span></div>
      <div class="card tile red"><span class="v">${late}</span><span class="k">Overdue</span></div>
      <div class="card tile green"><span class="v">${doneToday}</span><span class="k">Done today</span></div>
      <div class="card tile"><span class="v">${streak}<small style="font-size:14px;color:var(--muted)"> day${streak === 1 ? '' : 's'}</small></span><span class="k">Streak</span></div>
    </div>
    <div class="card panel chart"><h3>Completed in the last 7 days</h3><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tasks completed per day over the last 7 days: ${counts.join(', ')}">${grid}${bars}</svg></div>
    <div class="card panel"><div class="row"><h3 class="grow">Progress by list</h3><span style="color:var(--muted);font-size:13.5px">${rate}% of all tasks done</span></div><div class="bars">${lists}</div></div>`;
}

function prefsHTML() {
  const s = S.settings;
  const seg = (k, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" class="${String(s[k]) === String(v) ? 'on' : ''}" data-act="set" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  let notif = 'unsupported';
  try { if ('Notification' in window) notif = Notification.permission; } catch (e) {}
  return `
  ${S.profile ? `<section class="card set-card"><h3>Account</h3>
    <div class="set-row"><div class="avatar" style="--ac:${esc(S.profile.color)}">${esc(initials(S.profile.name))}</div><div class="txt"><b>${esc(S.profile.name)}</b><small>${esc(S.profile.email || 'No email added')}</small></div><button class="btn sm" data-act="editprofile">${ic('edit', 'sm')} Edit</button></div>
    <div class="set-row"><span class="ic">${ic('lock')}</span><div class="txt"><b>Password</b><small>Used when you log in</small></div><button class="btn sm" data-act="changepw">Change</button></div>
    <div class="set-row"><span class="ic">${ic('logout')}</span><div class="txt"><b>Log out</b><small>Your tasks stay saved</small></div><button class="btn sm danger" data-act="logout">Log out</button></div>
  </section>` : ''}
  <section class="card set-card"><h3>App</h3>
    <div class="set-row"><span class="ic">${ic('download')}</span><div class="txt"><b>Home screen icon</b><small>${isStandalone() ? 'Installed. You opened the app from its icon.' : installEvt ? 'Install it to open from an icon like any other app.' : isIOS && !inClaude() ? 'In Safari tap Share, then Add to Home Screen.' : inClaude() ? 'Inside Claude it opens from this page. To get a phone icon, put the downloaded app folder on a website (see its README), open it on your phone and tap Install.' : 'Open this page in Chrome on your phone, then use the menu and choose Install app or Add to Home screen.'}</small></div>${installEvt && !isStandalone() ? '<button class="btn sm primary" data-act="installapp">Install</button>' : ''}</div>
    ${S.profile ? `<div class="set-row"><span class="ic">${ic('lock')}</span><div class="txt"><b>Stay logged in</b><small>Skip the password when you open the app</small></div><input type="checkbox" class="switch" id="setRemember" ${S.profile.rememberLogin ? 'checked' : ''} aria-label="Stay logged in"></div>` : ''}
  </section>
  <section class="card set-card"><h3>General</h3>
    <div class="set-row"><span class="ic">${ic('sun')}</span><div class="txt"><b>Theme</b><small>System follows your device or Claude’s setting</small></div>${seg('theme', [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']])}</div>
    <div class="set-row"><span class="ic">${ic('clock')}</span><div class="txt"><b>Time format</b><small>${s.timeFmt === '24' ? '18:00' : '6:00 PM'}</small></div>${seg('timeFmt', [['12', '12-hour'], ['24', '24-hour']])}</div>
    <div class="set-row"><span class="ic">${ic('cal')}</span><div class="txt"><b>First day of week</b><small>Used in the calendar</small></div>${seg('weekStart', [[0, 'Sunday'], [1, 'Monday']])}</div>
  </section>
  <section class="card set-card"><h3>Reminders</h3>
    <div class="set-row"><span class="ic">${ic('music')}</span><div class="txt"><b>Sound</b><small>Plays when a reminder is due</small></div>
      <select id="setSound" aria-label="Reminder sound">${[['popcorn', 'Popcorn (default)'], ['chime', 'Chime'], ['bell', 'Bell'], ['off', 'No sound']].map(([v, l]) => `<option value="${v}" ${s.sound === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <button class="btn sm" data-act="testsound">Test</button></div>
    <div class="set-row"><span class="ic">${ic('vibrate')}</span><div class="txt"><b>Vibration</b><small>On phones that support it</small></div><input type="checkbox" class="switch" id="setVib" ${s.vibration ? 'checked' : ''} aria-label="Vibration">
      ${s.vibration ? `<div style="flex-basis:100%;display:flex;justify-content:flex-end">${seg('vibStrength', [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']])}</div>` : ''}</div>
    <div class="set-row"><span class="ic">${ic('sum')}</span><div class="txt"><b>Day summary</b><small>A rundown of today’s tasks when you open the app after this time</small></div><input type="checkbox" class="switch" id="setSum" ${s.daySummary ? 'checked' : ''} aria-label="Day summary">
      ${s.daySummary ? `<div style="flex-basis:100%;display:flex;justify-content:flex-end;gap:8px"><input type="time" id="setSumTime" class="inp" value="${esc(s.summaryTime)}" aria-label="Day summary time"><button class="btn sm" data-act="showsummary">Show now</button></div>` : ''}</div>
    <div class="set-row"><span class="ic">${ic('bell')}</span><div class="txt"><b>Browser notifications</b><small>${notif === 'granted' ? 'On. You’ll also get a system notification.' : notif === 'denied' ? 'Blocked in this browser. Reminders still pop up inside the app.' : notif === 'unsupported' ? 'Not available here. Reminders pop up inside the app.' : 'Optional. Reminders always pop up inside the app while it’s open.'}</small></div>${notif === 'default' ? '<button class="btn sm" data-act="asknotif">Turn on</button>' : ''}</div>
  </section>
  <section class="card set-card"><h3>Data &amp; backup</h3>
    <div class="set-row"><span class="ic">${ic('cloud')}</span><div class="txt"><b>Storage</b><small>${Cloud.on ? 'Your tasks are saved to your Claude account and follow you to any device.' : 'Your tasks are saved in this browser. Download a backup to keep them safe.'}</small></div></div>
    <div class="set-row"><span class="ic">${ic('download')}</span><div class="txt"><b>Backup</b><small>Everything as one JSON file, or tasks as a CSV for spreadsheets</small></div>
      ${Downloads ? `<button class="btn sm" data-act="export" data-fmt="json">${ic('download', 'sm')} JSON</button><button class="btn sm" data-act="export" data-fmt="csv">${ic('download', 'sm')} CSV</button>` : `<button class="btn sm" data-act="copybackup">${ic('copy', 'sm')} Copy backup</button>`}</div>
    <div class="set-row"><span class="ic">${ic('upload')}</span><div class="txt"><b>Restore</b><small>Load a JSON backup. Items are added or updated, nothing is removed.</small></div><button class="btn sm" data-act="import">${ic('upload', 'sm')} Choose file</button></div>
    <div class="set-row"><span class="ic">${ic('trash')}</span><div class="txt"><b>Clear finished tasks</b><small>${Object.values(S.tasks).filter(t => t.done).length} finished</small></div><button class="btn sm danger" data-act="clearfinished">Clear</button></div>
  </section>
  <section class="card set-card"><h3>Keyboard shortcuts</h3>
    <div class="set-row"><span class="ic">${ic('key')}</span><div class="txt"><small><span class="kbd">N</span> new task or note &nbsp; <span class="kbd">/</span> search &nbsp; <span class="kbd">1</span>–<span class="kbd">5</span> Tasks, Notes, Calendar, Progress, Settings &nbsp; <span class="kbd">Esc</span> close</small></div></div>
  </section>`;
}
