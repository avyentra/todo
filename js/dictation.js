/* To Do List – dictation */
'use strict';

/* ================= dictation ================= */
let dictTarget = null, dictBase = '', dictState = 'idle';
const joinTxt = (a, b) => (a && b) ? (a.replace(/\s+$/, '') + ' ' + b.trim()) : (a || b || '');
function setupDictation(d) {
  Dict = d;
  document.documentElement.classList.add('has-mic');
  d.onPartial(({ text }) => { if (dictTarget) dictTarget.value = joinTxt(dictBase, text); });
  d.onFinal(({ text }) => { if (dictTarget) { dictBase = joinTxt(dictBase, text); dictTarget.value = dictBase; dictTarget.dispatchEvent(new Event('input', { bubbles: true })); } });
  d.onState(({ state }) => { dictState = state; $$('.mic').forEach(b => b.classList.toggle('on', state === 'listening' && dictTarget && b.dataset.for === dictTarget.id)); });
}
function micClick(btn) {
  if (!Dict) return;
  const target = document.getElementById(btn.dataset.for);
  if (!target) return;
  if (dictState === 'listening') { const same = dictTarget === target; Dict.stop().catch(() => {}); if (same) return; }
  dictTarget = target; dictBase = target.value;
  Dict.start().catch(e => {
    const code = (e && e.code) || e;
    if (code === 'not_granted') { document.documentElement.classList.remove('has-mic'); Dict = null; toast('Microphone access was declined. You can keep typing.'); }
  });
  target.focus();
}
