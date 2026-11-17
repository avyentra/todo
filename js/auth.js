/* To Do List – account / login */
'use strict';

/* ================= account / login ================= */
const initials = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + ':' + pw);
  try {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h1 = 5381, h2 = 52711; for (const c of data) { h1 = (h1 * 33 ^ c) >>> 0; h2 = (h2 * 31 + c) >>> 0; }
    return 'x' + h1.toString(16) + h2.toString(16);
  }
}
const SESS = 'tdl-session';
function getSess() { try { return JSON.parse(sessionStorage.getItem(SESS)) || LS.get(SESS); } catch (e) { return LS.get(SESS); } }
function setSess(remember) {
  const v = JSON.stringify({ u: String(S.profile.createdAt), k: S.profile.hash.slice(0, 16) });
  try { sessionStorage.setItem(SESS, v); } catch (e) {}
  if (remember) { try { localStorage.setItem(SESS, v); } catch (e) {} } else { try { localStorage.removeItem(SESS); } catch (e) {} }
  UI.unlocked = true;
}
function clearSess() { try { sessionStorage.removeItem(SESS); } catch (e) {} try { localStorage.removeItem(SESS); } catch (e) {} UI.unlocked = false; }
function sessOk() {
  if (!S.profile) return false;
  if (UI.unlocked) return true;
  const ss = getSess();
  return !!(ss && ss.u === String(S.profile.createdAt) && ss.k === S.profile.hash.slice(0, 16));
}
function authModeNow() {
  if (!isDataReady) return 'splash';
  if (sessOk()) return '';
  const m = UI.authScreen || 'welcome';
  return m === 'reset' && !S.profile ? 'login' : m;
}
function renderAuth() {
  const mode = authModeNow();
  const box = $('#auth');
  if (mode === UI.authMode && (mode !== '' || box.hidden)) return;
  UI.authMode = mode;
  if (!mode) { box.hidden = true; box.innerHTML = ''; return; }
  if (dlg.open) closeDlg();
  $('#app').classList.remove('open');
  box.hidden = false;
  const top = (title, sub, back = 'welcome') => `<div class="auth-top"><button type="button" class="iconbtn auth-back" data-act="authgo" data-to="${back}" aria-label="Back">${ic('back')}</button><img class="auth-logo" src="icons/logo.png" alt="To Do List logo" width="96" height="96"><h1>${title}</h1><p>${sub}</p></div>`;
  const pwField = (id, label, auto, ph) => `<div class="fld"><label for="${id}">${label}</label><div class="pw"><input id="${id}" class="inp" type="password" autocomplete="${auto}" placeholder="${ph}" required><button type="button" class="iconbtn" data-act="peek" data-for="${id}" aria-label="Show password">${ic('eye')}</button></div></div>`;
  if (mode === 'welcome') {
    box.innerHTML = `<div class="welcome">
      <img class="auth-logo" src="icons/logo.png" alt="To Do List logo" width="96" height="96">
      <div><h1>To Do List</h1><p class="tag">Plan your day, tick it off and enjoy your free time.</p></div>
      <ul class="feats">
        <li><span class="fi">${ic('sun')}</span><span><b>Today at a glance</b><small>Overdue, today and upcoming in tabs</small></span></li>
        <li><span class="fi">${ic('bell')}</span><span><b>Reminders that repeat</b><small>Daily, weekly or monthly, with sound</small></span></li>
        <li><span class="fi">${ic('note')}</span><span><b>Lists, notes &amp; photos</b><small>Shopping lists, checklists and places</small></span></li>
      </ul>
      <div class="wbtns">
        <button class="btn white" data-act="authgo" data-to="signup">Create account</button>
        <button class="btn outline" data-act="authgo" data-to="login">I already have an account</button>
      </div></div>`;
  } else if (mode === 'splash') {
    box.innerHTML = `<div class="splash"><img class="auth-logo" src="icons/logo.png" alt="To Do List logo" width="96" height="96"><span>Loading your tasks…</span></div>`;
  } else if (mode === 'signup') {
    box.innerHTML = `${top('To Do List', 'Plan your day, tick it off, enjoy your free time.')}
      <form class="auth-card" id="signupForm" autocomplete="on" novalidate>
        <h2>Create your account</h2><p class="lead">Takes 20 seconds. Your tasks stay private to you.</p>
        ${S.profile ? `<p class="note">You already have an account as <b>${esc(S.profile.name)}</b>. A new account replaces that login, and your tasks stay. <button type="button" class="linkbtn" data-act="authgo" data-to="login">Log in instead</button></p>` : ''}
        <div class="fld"><label for="suName">Your name</label><input id="suName" class="inp" autocomplete="name" placeholder="e.g. Rahul Sharma" maxlength="40" required></div>
        <div class="fld"><label for="suEmail">Email <span style="font-weight:500;color:var(--muted)">(optional)</span></label><input id="suEmail" class="inp" type="email" autocomplete="email" placeholder="you@example.com"></div>
        ${pwField('suPw', 'Password', 'new-password', 'At least 6 characters')}
        ${pwField('suPw2', 'Confirm password', 'new-password', 'Type it again')}
        <p class="err" id="authErr" role="alert"></p>
        <button class="btn primary" type="submit">Create account</button>
        <div style="text-align:center;font-size:14px;color:var(--muted)">Already have an account? <button type="button" class="linkbtn" data-act="authgo" data-to="login">Log in</button></div>
      </form>`;
    setTimeout(() => { const f = $('#suName'); f && f.focus(); }, 60);
  } else if (mode === 'login' && !S.profile) {
    box.innerHTML = `${top('Welcome back', 'Log in to see your tasks.')}
      <form class="auth-card" id="loginEmptyForm" autocomplete="on" novalidate>
        <h2>Log in</h2>
        <div class="fld"><label for="leUser">Email or name</label><input id="leUser" class="inp" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="you@example.com"></div>
        ${pwField('lePw', 'Password', 'current-password', 'Your password')}
        <label class="remember"><input type="checkbox" checked> Keep me logged in on this device</label>
        <p class="err" id="authErr" role="alert"></p>
        <button class="btn primary" type="submit">Log in</button>
        <div style="text-align:center;font-size:14px;color:var(--muted)">New here? <button type="button" class="linkbtn" data-act="authgo" data-to="signup">Create account</button></div>
      </form>`;
    setTimeout(() => { const f = $('#leUser'); f && f.focus(); }, 60);
  } else if (mode === 'login') {
    const pf = S.profile;
    box.innerHTML = `${top('Welcome back', 'Log in to see your tasks.')}
      <form class="auth-card" id="loginForm" autocomplete="on" novalidate>
        <div class="who"><div class="avatar" style="--ac:${esc(pf.color)}">${esc(initials(pf.name))}</div><div><b>${esc(pf.name)}</b><small>${esc(pf.email || 'My account')}</small></div></div>
        ${pwField('liPw', 'Password', 'current-password', 'Your password')}
        <label class="remember"><input type="checkbox" id="liRemember" checked> Keep me logged in on this device</label>
        <p class="err" id="authErr" role="alert"></p>
        <button class="btn primary" type="submit">Log in</button>
        <div style="text-align:center"><button type="button" class="linkbtn" data-act="authgo" data-to="reset">Forgot password?</button></div>
        <div style="text-align:center;font-size:14px;color:var(--muted)">New here? <button type="button" class="linkbtn" data-act="authgo" data-to="signup">Create account</button></div>
      </form>`;
    setTimeout(() => { const f = $('#liPw'); f && f.focus(); }, 60);
  } else if (mode === 'reset') {
    box.innerHTML = `${top('Reset password', 'Set a new password for ' + esc(S.profile.name), 'login')}
      <form class="auth-card" id="resetForm" autocomplete="off" novalidate>
        <p class="lead" style="margin:0">Your tasks are stored in your own Claude account, so you can set a new password here. Nothing will be deleted.</p>
        ${pwField('rsPw', 'New password', 'new-password', 'At least 6 characters')}
        ${pwField('rsPw2', 'Confirm new password', 'new-password', 'Type it again')}
        <p class="err" id="authErr" role="alert"></p>
        <button class="btn primary" type="submit">Save and log in</button>
        <div style="text-align:center"><button type="button" class="linkbtn" data-act="authgo" data-to="login">Back to log in</button></div>
      </form>`;
    setTimeout(() => { const f = $('#rsPw'); f && f.focus(); }, 60);
  }
}
function authErr(msg) {
  const e = $('#authErr'); if (e) e.textContent = msg;
  const card = $('.auth-card'); if (card && msg) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
}
async function newProfilePw(pw) { const salt = newId() + newId(); return { salt, hash: await hashPw(pw, salt) }; }
async function doSignup() {
  const name = $('#suName').value.trim(), email = $('#suEmail').value.trim();
  const pw = $('#suPw').value, pw2 = $('#suPw2').value;
  if (!name) return authErr('Please enter your name.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authErr('That email doesn’t look right.');
  if (pw.length < 6) return authErr('Password needs at least 6 characters.');
  if (pw !== pw2) return authErr('The two passwords don’t match.');
  const { salt, hash } = await newProfilePw(pw);
  S.profile = { name, email, salt, hash, color: COLORS[Math.floor(Math.random() * 6)], createdAt: Date.now() };
  setSess(true);
  clearTimeout(metaTimer); metaTimer = 0;
  persist('meta', { lists: S.lists, settings: S.settings, profile: S.profile });
  UI.view = 'tasks'; UI.list = 'all'; UI.tab = 'today'; UI.headKey = ''; setHash();
  render(); toast(`Welcome, ${name.split(' ')[0]}! Your account is ready.`);
}
async function doLogin() {
  const pw = $('#liPw').value;
  const pf = S.profile;
  if (!pw) return authErr('Enter your password.');
  const h = await hashPw(pw, pf.salt);
  if (h !== pf.hash) { $('#liPw').value = ''; return authErr('Wrong password. Try again.'); }
  setSess($('#liRemember').checked);
  UI.view = 'tasks'; UI.list = 'all'; UI.tab = 'today'; UI.headKey = ''; setHash();
  render(); toast(`Welcome back, ${pf.name.split(' ')[0]}!`);
  setTimeout(daySummaryCheck, 900);
}
async function doReset() {
  const pw = $('#rsPw').value, pw2 = $('#rsPw2').value;
  if (pw.length < 6) return authErr('Password needs at least 6 characters.');
  if (pw !== pw2) return authErr('The two passwords don’t match.');
  const { salt, hash } = await newProfilePw(pw);
  S.profile = { ...S.profile, salt, hash };
  UI.authScreen = 'welcome'; setSess(true); UI.authMode = 'x';
  persist('meta', { lists: S.lists, settings: S.settings, profile: S.profile });
  render(); toast('Password changed. You’re logged in.');
}
function logout() { clearSess(); UI.authScreen = 'welcome'; UI.authMode = 'x'; render(); }
function openProfileEditor() {
  const pf = S.profile;
  openDlg(`<form class="sheet" id="profileForm" autocomplete="off"><div class="sheet-head"><button type="button" class="iconbtn" data-act="dlgclose" aria-label="Back">${ic('back')}</button><h2>Edit profile</h2></div>
    <div class="sheet-body"><div class="fld"><label for="pfName">Name</label><input id="pfName" class="inp" maxlength="40"></div>
    <div class="fld"><label for="pfEmail">Email (optional)</label><input id="pfEmail" class="inp" type="email"></div>
    <div><span class="lbl">Avatar color</span><div class="swatches" id="pfColors">${COLORS.map(c => `<button type="button" class="sw ${c === pf.color ? 'on' : ''}" style="--c:${c}" data-act="pfcolor" data-v="${c}" aria-label="Color ${c}"></button>`).join('')}</div></div>
    <p class="err" id="pfErr"></p></div>
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="dlgclose">Cancel</button><button type="submit" class="btn primary">Save</button></div></form>`);
  UI.edit = { color: pf.color };
  $('#pfName').value = pf.name; $('#pfEmail').value = pf.email || '';
}
function openPwChange() {
  openDlg(`<form class="sheet" id="pwForm" autocomplete="off"><div class="sheet-head"><button type="button" class="iconbtn" data-act="dlgclose" aria-label="Back">${ic('back')}</button><h2>Change password</h2></div>
    <div class="sheet-body">
      <div class="fld"><label for="cpOld">Current password</label><input id="cpOld" class="inp" type="password" autocomplete="current-password"></div>
      <div class="fld"><label for="cpNew">New password</label><input id="cpNew" class="inp" type="password" autocomplete="new-password" placeholder="At least 6 characters"></div>
      <div class="fld"><label for="cpNew2">Confirm new password</label><input id="cpNew2" class="inp" type="password" autocomplete="new-password"></div>
      <p class="err" id="pfErr"></p></div>
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="dlgclose">Cancel</button><button type="submit" class="btn primary">Change password</button></div></form>`);
}
