/* To Do List – dialogs */
'use strict';

/* ================= dialogs ================= */
const dlg = $('#dlg');
function openDlg(html) { dlg.innerHTML = html; if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } } }
function closeDlg() { if (Dict && dictState === 'listening') Dict.stop().catch(() => {}); try { dlg.close(); } catch (e) { dlg.removeAttribute('open'); } dlg.innerHTML = ''; UI.edit = null; }
dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });
dlg.addEventListener('close', () => { dlg.innerHTML = ''; UI.edit = null; });

function confirmBox(title, body, okLabel = 'Delete', danger = true) {
  return new Promise(res => {
    UI.confirmRes = res;
    openDlg(`<div class="sheet" style="max-width:420px;margin:auto"><div class="sheet-body"><h2 style="font-size:18px">${esc(title)}</h2><p style="margin:0;color:var(--muted)">${esc(body)}</p></div>
      <div class="sheet-foot"><button class="btn ghost" data-act="confirm" data-v="0">Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-act="confirm" data-v="1">${esc(okLabel)}</button></div></div>`);
  });
}

function defaultListForNew() { return S.lists.find(l => l.id === UI.list) ? UI.list : 'default'; }
function openTaskEditor(t0, opts = {}) {
  const isNew = !t0;
  const t = t0 ? clean(t0) : { id: newId(), title: opts.title || '', listId: defaultListForNew(), due: opts.due != null ? opts.due : (UI.list === 'all' && UI.tab === 'today' ? today() : ''), time: '', repeat: 'none', priority: 0, notes: '', subtasks: [], done: false, createdAt: Date.now() };
  t.subtasks = t.subtasks || [];
  UI.edit = { t, isNew, batch: false };
  openDlg(`<form class="sheet" id="taskForm" autocomplete="off">
    <div class="sheet-head"><button type="button" class="iconbtn" data-act="dlgclose" aria-label="Back">${ic('back')}</button><h2>${isNew ? 'New task' : 'Edit task'}</h2>
      ${!isNew ? `<button type="button" class="iconbtn" data-act="taskdup" aria-label="Duplicate task" title="Duplicate">${ic('copy')}</button><button type="button" class="iconbtn" data-act="taskdelete" aria-label="Delete task" title="Delete">${ic('trash')}</button>` : ''}</div>
    <div class="sheet-body">
      <div class="box accent">
        <label class="lbl" for="fTitle" id="fTitleLbl">What is to be done?</label>
        <div class="row" id="fSingle"><input id="fTitle" class="inp" placeholder="e.g. Pay bills"><button type="button" class="iconbtn mic" data-act="mic" data-for="fTitle" aria-label="Speak the task">${ic('mic')}</button></div>
        <div id="fMulti" hidden><textarea id="fBatch" class="inp" rows="6" placeholder="One item per line&#10;Avocado&#10;Butter&#10;Coffee"></textarea></div>
        ${isNew ? `<label class="switch-row" for="fBatchToggle"><span>Add in batch mode<small>One task per line. Great for shopping lists.</small></span><input type="checkbox" id="fBatchToggle" class="switch"></label>` : ''}
      </div>
      <div class="grid2">
        <div><label class="lbl" for="fList">List</label><select id="fList">${S.lists.map(l => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></div>
        <div><span class="lbl">Priority</span><div class="seg" id="fPri">${PRI.map((p, i) => `<button type="button" data-act="pri" data-v="${i}">${p === 'Medium' ? 'Med' : p}</button>`).join('')}</div></div>
      </div>
      <div class="box">
        <span class="lbl" style="margin:0">${ic('bell', 'sm')} Due date &amp; reminder</span>
        <div class="grid2"><input type="date" id="fDate" class="inp" aria-label="Due date"><input type="time" id="fTime" class="inp" aria-label="Reminder time"></div>
        <div class="chips"><button type="button" class="chip" data-act="qdate" data-v="0">Today</button><button type="button" class="chip" data-act="qdate" data-v="1">Tomorrow</button><button type="button" class="chip" data-act="qdate" data-v="7">Next week</button><button type="button" class="chip" data-act="qdate" data-v="">No date</button></div>
        <label class="lbl" for="fRepeat" style="margin:4px 0 0">${ic('repeat', 'sm')} Repeat</label>
        <select id="fRepeat">${Object.entries(REPEATS).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
        <p class="hint" style="margin:0">With a time set, a reminder rings in this app while it’s open.</p>
      </div>
      <div><label class="lbl" for="fNotes">Notes</label><textarea id="fNotes" class="inp" rows="3" placeholder="Add details, links or an address"></textarea></div>
      <div><span class="lbl">Subtasks</span><div class="subs" id="fSubs"></div>
        <div class="row" style="margin-top:6px"><input id="fSubNew" class="inp" placeholder="Add a subtask and press Enter"><button type="button" class="iconbtn" data-act="subadd" aria-label="Add subtask">${ic('plus')}</button></div></div>
    </div>
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="dlgclose">Cancel</button><button type="submit" class="btn primary">${isNew ? 'Add task' : 'Save'}</button></div>
  </form>`);
  $('#fTitle').value = t.title; $('#fList').value = t.listId in Object.fromEntries(S.lists.map(l => [l.id, 1])) ? t.listId : 'default';
  $('#fDate').value = t.due || ''; $('#fTime').value = t.time || ''; $('#fRepeat').value = t.repeat || 'none'; $('#fNotes').value = t.notes || '';
  setPri(t.priority || 0); renderSubs();
  if (isNew) setTimeout(() => $('#fTitle') && $('#fTitle').focus(), 50);
}
function setPri(v) { if (!UI.edit) return; UI.edit.t.priority = +v; $$('#fPri button').forEach(b => b.classList.toggle('on', +b.dataset.v === +v)); }
function renderSubs() {
  const box = $('#fSubs'); if (!box || !UI.edit) return;
  box.innerHTML = UI.edit.t.subtasks.map((s, i) => `<div class="sub ${s.done ? 'on' : ''}" data-i="${i}"><button type="button" class="chk ${s.done ? 'on' : ''}" data-act="subtoggle" aria-label="Toggle subtask">${ic('check')}</button><input class="inp grow" data-sub="${i}" value="${esc(s.t)}" aria-label="Subtask"><button type="button" class="iconbtn danger" data-act="subdel" aria-label="Remove subtask">${ic('x', 'sm')}</button></div>`).join('');
}
function addSub() {
  const inp = $('#fSubNew'); const v = inp.value.trim(); if (!v || !UI.edit) return;
  UI.edit.t.subtasks.push({ id: newId(), t: v, done: false }); inp.value = ''; renderSubs(); inp.focus();
}
function submitTask() {
  const E = UI.edit; if (!E) return;
  const base = E.t;
  base.listId = $('#fList').value; base.due = $('#fDate').value; base.time = $('#fTime').value; base.repeat = $('#fRepeat').value; base.notes = $('#fNotes').value.trim();
  base.subtasks = base.subtasks.filter(s => (s.t || '').trim());
  if ((base.time || base.repeat !== 'none') && !base.due) base.due = today();
  if (E.batch) {
    const lines = $('#fBatch').value.split('\n').map(x => x.trim()).filter(Boolean);
    if (!lines.length) { $('#fBatch').focus(); return; }
    lines.forEach((line, i) => saveTask({ ...clean(base), id: newId() + i, title: line, subtasks: [], createdAt: Date.now() + i }));
    closeDlg(); toast(`${lines.length} item${lines.length > 1 ? 's' : ''} added to ${listById(base.listId).name}`);
    return;
  }
  base.title = $('#fTitle').value.trim();
  if (!base.title) { $('#fTitle').focus(); toast('Give the task a name first.'); return; }
  delete base.sample;
  saveTask(base); closeDlg();
  if (E.isNew) toast(`Added to ${listById(base.listId).name}${base.due ? ' · ' + dueText(base) : ''}`);
}

function openListEditor(l0) {
  const l = l0 ? clean(l0) : { id: newId(), name: '', color: COLORS[S.lists.length % COLORS.length] };
  UI.edit = { list: l, isNew: !l0 };
  openDlg(`<form class="sheet" id="listForm" autocomplete="off" style="max-width:440px;margin:auto">
    <div class="sheet-head"><button type="button" class="iconbtn" data-act="dlgclose" aria-label="Back">${ic('back')}</button><h2>${l0 ? 'Edit list' : 'New list'}</h2></div>
    <div class="sheet-body"><div><label class="lbl" for="lName">List name</label><input id="lName" class="inp" placeholder="e.g. Groceries" maxlength="40"></div>
      <div><span class="lbl">Color</span><div class="swatches" id="lColors">${COLORS.map(c => `<button type="button" class="sw ${c === l.color ? 'on' : ''}" style="--c:${c}" data-act="lcolor" data-v="${c}" aria-label="Color ${c}"></button>`).join('')}</div></div></div>
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="dlgclose">Cancel</button><button type="submit" class="btn primary">${l0 ? 'Save' : 'Create list'}</button></div></form>`);
  $('#lName').value = l.name; setTimeout(() => $('#lName') && $('#lName').focus(), 50);
}
function submitList() {
  const E = UI.edit; if (!E || !E.list) return;
  const name = $('#lName').value.trim(); if (!name) { $('#lName').focus(); return; }
  const l = { ...E.list, name };
  const i = S.lists.findIndex(x => x.id === l.id);
  S.lists = i >= 0 ? S.lists.map(x => x.id === l.id ? l : x) : [...S.lists, l];
  closeDlg(); UI.view = 'tasks'; UI.list = l.id; UI.headKey = ''; setHash(); saveMeta();
}

function openNoteEditor(n0, kind) {
  const n = n0 ? clean(n0) : { id: newId(), title: '', body: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], items: kind === 'list' ? [] : [], image: '', place: '', pinned: false, createdAt: Date.now() };
  n.items = n.items || [];
  UI.edit = { note: n, isNew: !n0, kind: kind || '' };
  const showList = n.items.length || kind === 'list';
  const showImg = n.image || kind === 'photo';
  const showPlace = n.place || kind === 'place';
  openDlg(`<form class="sheet" id="noteEdForm" autocomplete="off">
    <div class="sheet-head"><button type="button" class="iconbtn" data-act="dlgclose" aria-label="Back">${ic('back')}</button><h2>${n0 ? 'Edit note' : kind === 'list' ? 'New checklist' : kind === 'photo' ? 'New photo note' : kind === 'place' ? 'New place' : 'New note'}</h2>
      <button type="button" class="iconbtn" data-act="npin" aria-label="Pin note" title="Pin to top" id="nPinBtn" style="${n.pinned ? 'background:rgba(255,255,255,.22)' : ''}">${ic('pin')}</button>
      ${n0 ? `<button type="button" class="iconbtn" data-act="ndelete" aria-label="Delete note" title="Delete">${ic('trash')}</button>` : ''}</div>
    <div class="sheet-body">
      <input id="nTitle" class="inp" placeholder="Title" style="font-weight:700;font-size:16px" aria-label="Note title">
      <div class="swatches" id="nColors">${COLORS.map(c => `<button type="button" class="sw ${c === n.color ? 'on' : ''}" style="--c:${c}" data-act="ncolor" data-v="${c}" aria-label="Color ${c}"></button>`).join('')}</div>
      <div class="row" style="align-items:flex-start"><textarea id="nBody" class="inp" rows="${showList || showImg ? 2 : 5}" placeholder="Write something…" aria-label="Note text"></textarea><button type="button" class="iconbtn mic" data-act="mic" data-for="nBody" aria-label="Speak your note">${ic('mic')}</button></div>
      <div id="nListBox" ${showList ? '' : 'hidden'}><span class="lbl">Checklist</span><div class="subs" id="nItems"></div>
        <div class="row" style="margin-top:6px"><input id="nItemNew" class="inp" placeholder="Add an item and press Enter"><button type="button" class="iconbtn" data-act="nitemadd" aria-label="Add item">${ic('plus')}</button></div></div>
      <div id="nImgBox" ${showImg ? '' : 'hidden'}><span class="lbl">Photo</span><div id="nImg"></div></div>
      <div id="nPlaceBox" ${showPlace ? '' : 'hidden'}><label class="lbl" for="nPlace">Place</label><input id="nPlace" class="inp" placeholder="Address or place name"><p class="hint" id="nPlaceLink"></p></div>
      <div class="chips">
        <button type="button" class="chip" data-act="nshow" data-v="list">${ic('checklist', 'sm')} Checklist</button>
        <button type="button" class="chip" data-act="nshow" data-v="photo">${ic('image', 'sm')} Photo</button>
        <button type="button" class="chip" data-act="nshow" data-v="place">${ic('mappin', 'sm')} Place</button>
        <button type="button" class="chip" data-act="ntotasks">${ic('plus', 'sm')} Send checklist to a task list</button>
      </div>
    </div>
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="dlgclose">Cancel</button><button type="submit" class="btn primary">Save note</button></div></form>`);
  $('#nTitle').value = n.title; $('#nBody').value = n.body; $('#nPlace').value = n.place;
  renderNoteItems(); renderNoteImg(); updatePlaceLink();
  if (kind === 'photo' && !n.image) $('#filePhoto').click();
  else setTimeout(() => { const f = kind === 'list' ? $('#nItemNew') : kind === 'place' ? $('#nPlace') : $('#nTitle'); f && f.focus(); }, 50);
}
function renderNoteItems() {
  const box = $('#nItems'); if (!box || !UI.edit || !UI.edit.note) return;
  box.innerHTML = UI.edit.note.items.map((s, i) => `<div class="sub ${s.done ? 'on' : ''}" data-i="${i}"><button type="button" class="chk ${s.done ? 'on' : ''}" data-act="nitoggle" aria-label="Toggle item">${ic('check')}</button><input class="inp grow" data-nitem="${i}" value="${esc(s.t)}" aria-label="Checklist item"><button type="button" class="iconbtn danger" data-act="nidel" aria-label="Remove item">${ic('x', 'sm')}</button></div>`).join('');
}
function renderNoteImg() {
  const box = $('#nImg'); if (!box || !UI.edit) return;
  const img = UI.edit.note.image;
  box.innerHTML = img ? `<div class="imgprev"><img src="${esc(img)}" alt="Note photo"></div><div class="row" style="margin-top:8px"><button type="button" class="btn sm" data-act="pickphoto">${ic('image', 'sm')} Replace</button><button type="button" class="btn sm danger" data-act="rmphoto">Remove</button></div>`
    : `<button type="button" class="btn sm" data-act="pickphoto">${ic('image', 'sm')} Choose or take a photo</button>`;
}
function updatePlaceLink() {
  const v = ($('#nPlace') || {}).value || ''; const el = $('#nPlaceLink'); if (!el) return;
  el.innerHTML = v.trim() ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.trim())}" target="_blank" rel="noopener">Open in Google Maps</a>` : 'Type an address to get a map link.';
}
function addNoteItem() {
  const inp = $('#nItemNew'); const v = inp.value.trim(); if (!v || !UI.edit) return;
  v.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => UI.edit.note.items.push({ id: newId() + Math.random().toString(36).slice(2, 4), t: x, done: false }));
  inp.value = ''; renderNoteItems(); inp.focus();
}
function collectNote() {
  const n = UI.edit.note;
  n.title = $('#nTitle').value.trim(); n.body = $('#nBody').value.trim(); n.place = $('#nPlace').value.trim();
  n.items = n.items.filter(i => (i.t || '').trim());
  return n;
}
function submitNote() {
  if (!UI.edit || !UI.edit.note) return;
  const n = collectNote();
  if (!n.title && !n.body && !n.items.length && !n.image && !n.place) { closeDlg(); return; }
  delete n.sample;
  saveNote(n); closeDlg();
}
function readImage(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const img = new Image(); img.onload = () => {
      const max = 1000, s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      let q = 0.75, out = c.toDataURL('image/jpeg', q);
      while (out.length > 180000 && q > 0.35) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
      res(out);
    }; img.onerror = rej; img.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}

function openSummary() {
  const td = today();
  const p = pending().filter(t => t.due && t.due <= td).sort(sorter());
  const late = p.filter(t => t.due < td || isLate(t));
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  openDlg(`<div class="sheet" style="max-width:460px;margin:auto"><div class="sheet-head"><h2>${ic('sum', 'sm')} ${hello}</h2><button type="button" class="iconbtn" data-act="dlgclose" aria-label="Close">${ic('x')}</button></div>
    <div class="sheet-body"><p style="margin:0;font-size:16px">${p.length ? `You have <b>${p.length}</b> task${p.length > 1 ? 's' : ''} for today${late.length ? `, <b style="color:var(--danger)">${late.length} overdue</b>` : ''}.` : 'Nothing due today. Enjoy your free time.'}</p>
    ${p.length ? `<ul class="sumlist">${p.slice(0, 8).map(t => `<li><span>${esc(t.title)}</span><span class="${isLate(t) ? '' : ''}" style="${isLate(t) ? 'color:var(--danger)' : ''}">${esc(t.time ? fmtTime(t.time) : fmtDate(t.due))}</span></li>`).join('')}</ul>${p.length > 8 ? `<small style="color:var(--muted)">and ${p.length - 8} more</small>` : ''}` : ''}</div>
    <div class="sheet-foot"><button class="btn primary" data-act="summarygo">${p.length ? 'Show today’s tasks' : 'OK'}</button></div></div>`);
}
