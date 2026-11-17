/* To Do List – events */
'use strict';

/* ================= events ================= */
document.addEventListener('click', async e => {
  if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act;
  const row = a.closest('.task');
  const tid = row && row.dataset.id;
  switch (act) {
    case 'openside': $('#app').classList.add('open'); break;
    case 'closeside': $('#app').classList.remove('open'); break;
    case 'list': go('tasks', a.dataset.id); break;
    case 'view': go(a.dataset.id); break;
    case 'togglesearch': UI.searchOpen = !UI.searchOpen; $('#searchBox').classList.toggle('open', UI.searchOpen); if (UI.searchOpen) $('#search').focus(); break;
    case 'clearsearch': $('#search').value = ''; UI.query = ''; $('#searchBox').classList.remove('has'); render(); break;
    case 'quicktheme': setSetting('theme', document.documentElement.classList.contains('dark') ? 'light' : 'dark'); break;
    case 'fab': UI.view === 'notes' ? openNoteEditor(null, '') : openTaskEditor(null, UI.view === 'calendar' ? { due: UI.calSel } : {}); break;
    case 'toggle': if (tid) toggleTask(tid, S.tasks[tid] && !S.tasks[tid].done ? row : null); break;
    case 'opentask': if (tid && S.tasks[tid]) openTaskEditor(S.tasks[tid]); break;
    case 'deltask': if (tid && S.tasks[tid]) { const t = clean(S.tasks[tid]); delTask(tid); toast(`Deleted “${t.title}”`, 'Undo', () => saveTask(t)); } break;
    case 'tab': {
      const tb = a.dataset.tab;
      if (UI.view !== 'tasks' || (UI.list !== 'all' && tb !== 'todo' && tb !== 'done')) { UI.list = 'all'; UI.view = 'tasks'; setHash(); }
      if (UI.list === 'all') UI.tab = tb; else UI.ltab = tb;
      render(); const ts = $('.tabs'); if (ts && $('#content').scrollTop > ts.offsetTop) $('#content').scrollTop = Math.max(0, ts.offsetTop - 14);
      break; }
    case 'cyclesort': {
      const order = [['due', 'Due date'], ['priority', 'Priority'], ['newest', 'Newest first'], ['az', 'A to Z']];
      const i = order.findIndex(o => o[0] === S.settings.sort);
      const nx = order[(i + 1) % order.length];
      setSetting('sort', nx[0]); toast('Sorted by ' + nx[1]); break; }
    case 'peek': { const f = document.getElementById(a.dataset.for); if (!f) break; const show = f.type === 'password'; f.type = show ? 'text' : 'password'; a.innerHTML = ic(show ? 'eyeoff' : 'eye'); a.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); break; }
    case 'installapp': installApp(); break;
    case 'addapp': if (installEvt) installApp(); else openInstallHelp(); break;
    case 'hideaddapp': UI.installHidden = true; try { sessionStorage.setItem('tdl-install-hide', '1'); } catch (err) {} render(); break;
    case 'authgo': UI.authScreen = a.dataset.to; render(); break;
    case 'logout': if (await confirmBox('Log out?', 'Your tasks stay saved. You\u2019ll need your password to log back in.', 'Log out', false)) logout(); break;
    case 'editprofile': openProfileEditor(); break;
    case 'pfcolor': UI.edit.color = a.dataset.v; $$('#pfColors .sw').forEach(b => b.classList.toggle('on', b === a)); break;
    case 'changepw': openPwChange(); break;
    case 'toggledone': UI.showDone[UI.list] = !UI.showDone[UI.list]; render(); break;
    case 'clearsamples': {
      Object.values(S.tasks).filter(t => t.sample).forEach(t => { delete S.tasks[t.id]; persist('tasks/' + t.id, null); });
      Object.values(S.notes).filter(n => n.sample).forEach(n => { delete S.notes[n.id]; persist('notes/' + n.id, null); });
      render(); toast('Samples removed. Your lists are ready.'); break; }
    case 'hidesamplebanner': setSetting('hideSampleBanner', true); break;
    case 'newlist': openListEditor(null); break;
    case 'editlist': openListEditor(listById(UI.list)); break;
    case 'lcolor': UI.edit.list.color = a.dataset.v; $$('#lColors .sw').forEach(b => b.classList.toggle('on', b === a)); break;
    case 'dellist': {
      const l = listById(UI.list); const n = Object.values(S.tasks).filter(t => t.listId === l.id).length;
      if (await confirmBox(`Delete “${l.name}”?`, n ? `Its ${n} task${n > 1 ? 's' : ''} will move to Default.` : 'This list is empty.')) {
        Object.values(S.tasks).filter(t => t.listId === l.id).forEach(t => saveTask({ ...clean(t), listId: 'default' }));
        S.lists = S.lists.filter(x => x.id !== l.id); UI.list = 'all'; UI.headKey = ''; saveMeta();
      } break; }
    case 'sharelist': {
      const l = listById(UI.list); const items = Object.values(S.tasks).filter(t => t.listId === l.id && !t.done).sort(sorter());
      copyText(`${l.name}\n` + items.map(t => `☐ ${t.title}${t.due ? ` (${dueText(t)})` : ''}`).join('\n'), `${l.name} copied. Paste it anywhere to share.`); break; }
    case 'checkall': {
      const items = Object.values(S.tasks).filter(t => t.listId === UI.list && !t.done);
      if (!items.length) { toast('Everything here is already done.'); break; }
      const before = items.map(clean);
      items.forEach(t => saveTask({ ...clean(t), done: true, doneAt: Date.now() }));
      toast(`${items.length} marked done`, 'Undo', () => before.forEach(saveTask)); break; }
    case 'clearfinished': {
      const d = Object.values(S.tasks).filter(t => t.done);
      if (!d.length) { toast('No finished tasks to clear.'); break; }
      if (await confirmBox('Clear finished tasks?', `${d.length} finished task${d.length > 1 ? 's' : ''} will be deleted for good.`, 'Clear all')) { d.forEach(t => delTask(t.id)); UI.headKey = ''; render(); }
      break; }
    case 'confirm': { const r = UI.confirmRes; UI.confirmRes = null; closeDlg(); r && r(a.dataset.v === '1'); break; }
    case 'dlgclose': closeDlg(); break;
    case 'mic': micClick(a); break;
    case 'pri': setPri(a.dataset.v); break;
    case 'qdate': $('#fDate').value = a.dataset.v === '' ? '' : addDays(today(), +a.dataset.v); if (a.dataset.v === '') { $('#fTime').value = ''; $('#fRepeat').value = 'none'; } break;
    case 'subadd': addSub(); break;
    case 'subtoggle': { const i = +a.closest('.sub').dataset.i; UI.edit.t.subtasks[i].done = !UI.edit.t.subtasks[i].done; renderSubs(); break; }
    case 'subdel': { const i = +a.closest('.sub').dataset.i; UI.edit.t.subtasks.splice(i, 1); renderSubs(); break; }
    case 'taskdelete': { const t = clean(S.tasks[UI.edit.t.id] || UI.edit.t); closeDlg(); delTask(t.id); toast(`Deleted “${t.title}”`, 'Undo', () => saveTask(t)); break; }
    case 'taskdup': { const t = { ...clean(UI.edit.t), id: newId(), title: ($('#fTitle').value.trim() || UI.edit.t.title) + ' (copy)', done: false, createdAt: Date.now() }; delete t.doneAt; closeDlg(); saveTask(t); toast('Task duplicated'); break; }
    case 'newnote': openNoteEditor(null, a.dataset.kind); break;
    case 'opennote': if (e.target.closest('.nitem')) break; openNoteEditor(S.notes[a.dataset.id]); break;
    case 'nitem': { e.stopPropagation(); const card = a.closest('.note'); const n0 = S.notes[card.dataset.id]; if (!n0) break; const n = clean(n0); const it = n.items.find(x => x.id === a.dataset.item); if (it) { it.done = !it.done; if (it.done) playSound('done'); saveNote(n); } break; }
    case 'ncolor': UI.edit.note.color = a.dataset.v; $$('#nColors .sw').forEach(b => b.classList.toggle('on', b === a)); break;
    case 'npin': UI.edit.note.pinned = !UI.edit.note.pinned; a.style.background = UI.edit.note.pinned ? 'rgba(255,255,255,.22)' : ''; break;
    case 'ndelete': { const n = clean(S.notes[UI.edit.note.id]); closeDlg(); delNote(n.id); toast('Note deleted', 'Undo', () => saveNote(n)); break; }
    case 'nshow': { const v = a.dataset.v; const box = $(v === 'list' ? '#nListBox' : v === 'photo' ? '#nImgBox' : '#nPlaceBox'); box.hidden = false; if (v === 'photo' && !UI.edit.note.image) $('#filePhoto').click(); else (v === 'list' ? $('#nItemNew') : $('#nPlace')).focus(); break; }
    case 'nitemadd': addNoteItem(); break;
    case 'nitoggle': { const i = +a.closest('.sub').dataset.i; UI.edit.note.items[i].done = !UI.edit.note.items[i].done; renderNoteItems(); break; }
    case 'nidel': { const i = +a.closest('.sub').dataset.i; UI.edit.note.items.splice(i, 1); renderNoteItems(); break; }
    case 'pickphoto': $('#filePhoto').click(); break;
    case 'rmphoto': UI.edit.note.image = ''; renderNoteImg(); break;
    case 'ntotasks': {
      const n = collectNote(); const items = n.items.filter(i => !i.done);
      if (!items.length) { $('#nListBox').hidden = false; toast('Add some checklist items first.'); break; }
      const target = S.lists.find(l => l.name.toLowerCase() === (n.title || '').toLowerCase().replace(/ list$/, '')) || S.lists.find(l => l.id === 'shopping') || S.lists[0];
      items.forEach((it, i) => saveTask({ id: newId() + i, title: it.t, listId: target.id, due: '', time: '', repeat: 'none', priority: 0, notes: '', subtasks: [], done: false, createdAt: Date.now() + i }));
      toast(`${items.length} item${items.length > 1 ? 's' : ''} added to ${target.name}`, 'Open', () => { closeDlg(); go('tasks', target.id); });
      break; }
    case 'calday': UI.calSel = a.dataset.date; if (UI.calSel.slice(0, 7) !== UI.calMonth) UI.calMonth = UI.calSel.slice(0, 7); render(); break;
    case 'calprev': case 'calnext': { const [y, m] = UI.calMonth.split('-').map(Number); const d = new Date(y, m - 1 + (act === 'calnext' ? 1 : -1), 1); UI.calMonth = dstr(d).slice(0, 7); render(); break; }
    case 'caltoday': UI.calMonth = today().slice(0, 7); UI.calSel = today(); render(); break;
    case 'addonday': openTaskEditor(null, { due: UI.calSel }); break;
    case 'set': { let v = a.dataset.v; if (['weekStart', 'vibStrength'].includes(a.dataset.k)) v = +v; setSetting(a.dataset.k, v); if (a.dataset.k === 'vibStrength') buzz(1); break; }
    case 'testsound': ensureAudio(); playSound(S.settings.sound === 'off' ? 'popcorn' : S.settings.sound); buzz(2); break;
    case 'showsummary': openSummary(); break;
    case 'summarygo': closeDlg(); go('tasks', 'today'); break;
    case 'asknotif': try { const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Notifications are on.' : 'Notifications are blocked here. Reminders will still pop up in the app.'); } catch (err) { toast('Notifications are blocked here. Reminders will still pop up in the app.'); } UI.headKey = ''; render(); break;
    case 'export': doExport(a.dataset.fmt); break;
    case 'copybackup': copyText(backupJSON(), 'Backup copied. Paste it into a .json file to keep it.'); break;
    case 'import': $('#fileImport').click(); break;
  }
});
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
  if (e.key === 'Enter' && e.target.id === 'fSubNew') { e.preventDefault(); addSub(); return; }
  if (e.key === 'Enter' && e.target.id === 'nItemNew') { e.preventDefault(); addNoteItem(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && !typing && e.target.matches('[data-act="opentask"],[data-act="opennote"]')) { e.preventDefault(); e.target.click(); return; }
  if (UI.authMode || typing || dlg.open || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'n' || e.key === 'N') { e.preventDefault(); $('#fab').click(); }
  else if (e.key === '/') { e.preventDefault(); UI.searchOpen = true; $('#searchBox').classList.add('open'); $('#search').focus(); }
  else if (/^[1-5]$/.test(e.key)) go(VIEWS[+e.key - 1]);
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const id = e.target.id;
  if (id === 'loginEmptyForm') {
    if (!$('#leUser').value.trim() || !$('#lePw').value) authErr('Enter your email and password.');
    else authErr('No account found with these details. Tap Create account to make one.');
  }
  else if (id === 'signupForm') doSignup();
  else if (id === 'loginForm') doLogin();
  else if (id === 'resetForm') doReset();
  else if (id === 'profileForm') {
    const name = $('#pfName').value.trim(), email = $('#pfEmail').value.trim();
    if (!name) { $('#pfErr').textContent = 'Please enter your name.'; return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#pfErr').textContent = 'That email doesn\u2019t look right.'; return; }
    S.profile = { ...S.profile, name, email, color: UI.edit.color };
    closeDlg(); UI.headKey = ''; saveMeta(); toast('Profile updated');
  } else if (id === 'pwForm') {
    (async () => {
      const old = $('#cpOld').value, n1 = $('#cpNew').value, n2 = $('#cpNew2').value;
      if ((await hashPw(old, S.profile.salt)) !== S.profile.hash) { $('#pfErr').textContent = 'Current password is wrong.'; return; }
      if (n1.length < 6) { $('#pfErr').textContent = 'New password needs at least 6 characters.'; return; }
      if (n1 !== n2) { $('#pfErr').textContent = 'The two new passwords don\u2019t match.'; return; }
      const { salt, hash } = await newProfilePw(n1);
      S.profile = { ...S.profile, salt, hash }; setSess(!!LS.get(SESS));
      closeDlg(); saveMeta(); toast('Password changed');
    })();
  }
  else if (id === 'taskForm') submitTask();
  else if (id === 'listForm') submitList();
  else if (id === 'noteEdForm') submitNote();
  else if (id === 'quickForm') {
    const inp = $('#quickInput'); const raw = inp.value.trim(); if (!raw) return;
    const r = parseQuick(raw); if (!r.title) { toast('Add a task name as well.'); return; }
    const listId = r.listId || defaultListForNew();
    const t = { id: newId(), title: r.title, listId, due: r.due || (UI.list === 'all' && UI.tab === 'today' ? today() : ''), time: r.time || '', repeat: r.repeat || 'none', priority: r.priority || 0, notes: '', subtasks: [], done: false, createdAt: Date.now() };
    saveTask(t); inp.value = ''; inp.focus();
    const bits = [t.due && dueText(t), t.repeat !== 'none' && REPEATS[t.repeat], t.priority && PRI[t.priority] + ' priority', listId !== UI.list && listById(listId).name].filter(Boolean);
    toast(`Added “${t.title}”${bits.length ? ' · ' + bits.join(' · ') : ''}`, 'Edit', () => S.tasks[t.id] && openTaskEditor(S.tasks[t.id]));
  } else if (id === 'noteForm') {
    const inp = $('#noteInput'); const v = inp.value.trim(); if (!v) return;
    const lines = v.split('\n');
    saveNote({ id: newId(), title: lines.length > 1 ? lines[0] : '', body: lines.length > 1 ? lines.slice(1).join('\n') : v, color: COLORS[Math.floor(Math.random() * COLORS.length)], items: [], image: '', place: '', pinned: false, createdAt: Date.now() });
    inp.value = ''; toast('Note saved');
  }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if (t.id === 'fBatchToggle') { UI.edit.batch = t.checked; $('#fSingle').hidden = t.checked; $('#fMulti').hidden = !t.checked; $('#fTitleLbl').textContent = t.checked ? 'Add many items at once' : 'What is to be done?'; $('#fTitleLbl').setAttribute('for', t.checked ? 'fBatch' : 'fTitle'); (t.checked ? $('#fBatch') : $('#fTitle')).focus(); if (t.checked && $('#fTitle').value.trim()) $('#fBatch').value = $('#fTitle').value.trim() + '\n'; }
  else if (t.id === 'setSound') { setSetting('sound', t.value); playSound(t.value); }
  else if (t.id === 'setVib') setSetting('vibration', t.checked);
  else if (t.id === 'setRemember' && S.profile) { S.profile = { ...S.profile, rememberLogin: t.checked }; UI.headKey = ''; saveMeta(); toast(t.checked ? 'You\u2019ll stay logged in.' : 'You\u2019ll be asked for your password next time.'); }
  else if (t.id === 'setSum') setSetting('daySummary', t.checked);
  else if (t.id === 'setSumTime') { setSetting('summaryTime', t.value || '08:00'); if (t.value > nowHM()) setSetting('lastSummary', ''); }
  else if (t.id === 'filePhoto') {
    const f = t.files && t.files[0]; t.value = '';
    if (!f || !UI.edit || !UI.edit.note) return;
    try { UI.edit.note.image = await readImage(f); $('#nImgBox').hidden = false; renderNoteImg(); } catch (err) { toast('That photo couldn’t be read. Try a JPG or PNG.'); }
  } else if (t.id === 'fileImport') { const f = t.files && t.files[0]; t.value = ''; if (f) importFile(f); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'search') {
    UI.query = t.value; $('#searchBox').classList.toggle('has', !!t.value);
    if (t.value && UI.view !== 'tasks' && UI.view !== 'notes') { UI.view = 'tasks'; UI.list = 'all'; setHash(); }
    render();
  } else if (t.dataset.sub != null && UI.edit && UI.edit.t) UI.edit.t.subtasks[+t.dataset.sub].t = t.value;
  else if (t.dataset.nitem != null && UI.edit && UI.edit.note) UI.edit.note.items[+t.dataset.nitem].t = t.value;
  else if (t.id === 'nPlace') updatePlaceLink();
});
document.addEventListener('pointerdown', () => ensureAudio(), { once: true });

/* ---- swipe a task: right = done, left = delete ---- */
let sw = null, suppressClick = false;
const SW_T = 90;
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('.task');
  if (!t || e.button > 0 || e.target.closest('.chk,.acts')) return;
  sw = { el: t, wrap: t.parentElement, x: e.clientX, y: e.clientY, dx: 0, active: false, id: e.pointerId };
});
document.addEventListener('pointermove', e => {
  if (!sw || e.pointerId !== sw.id) return;
  const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
  if (!sw.active) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { sw = null; return; }
    if (Math.abs(dx) < 10) return;
    sw.active = true; sw.el.classList.add('dragging');
    try { sw.el.setPointerCapture(e.pointerId); } catch (err) {}
  }
  sw.dx = dx;
  sw.el.style.transform = `translateX(${dx}px)`;
  sw.wrap.dataset.dir = dx > 0 ? 'r' : 'l';
  const go = Math.abs(dx) > SW_T;
  if (go !== sw.wrap.classList.contains('go')) { sw.wrap.classList.toggle('go', go); if (go) buzz(1); }
});
function swEnd(e) {
  if (!sw || (e && e.pointerId !== sw.id)) return;
  const s = sw; sw = null;
  if (!s.active) return;
  suppressClick = true; setTimeout(() => { suppressClick = false; }, 60);
  const id = s.el.dataset.id;
  s.el.classList.remove('dragging');
  const reset = () => { s.el.style.transform = ''; delete s.wrap.dataset.dir; s.wrap.classList.remove('go'); };
  if (s.dx > SW_T && S.tasks[id]) { reset(); toggleTask(id, !S.tasks[id].done ? s.el : null); }
  else if (s.dx < -SW_T && S.tasks[id]) {
    s.el.style.transform = 'translateX(-110%)';
    setTimeout(() => { const t = clean(S.tasks[id]); delTask(id); toast(`Deleted “${t.title}”`, 'Undo', () => saveTask(t)); }, 180);
  } else { reset(); }
}
document.addEventListener('pointerup', swEnd);
document.addEventListener('pointercancel', swEnd);
