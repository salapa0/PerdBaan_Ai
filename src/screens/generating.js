// S3 — "AI is writing your listing". Drives the pipeline and shows live progress.
import { h, icon, TEXT } from '../ui/ui.js';
import { getState, setState } from '../state.js';
import { botSay } from '../ui/chat.js';
import { generateListing, useSavedNow } from '../ai/generateListing.js';

let running = false;
let ckEls = [];
let counterEl = null;
let elapsedEl = null;
let savedLinkEl = null;
let startTs = 0;
let elapsedTimer = null;

export function generatingScreen() {
  const checklist = h('div', { class: 'checklist' });
  ckEls = TEXT.gen.steps.map((label, i) => {
    const mk = h('div', { class: 'mk' }, '');
    const row = h('div', { class: 'ck' }, mk, h('span', {}, label));
    checklist.append(row);
    return row;
  });
  counterEl = h('div', { class: 'gen-meta' }, '');
  elapsedEl = h('div', { class: 'gen-meta' }, '0 วินาที');
  savedLinkEl = h('button', { class: 'gen-saved', hidden: true, on: { click: () => useSavedNow() } }, TEXT.gen.useSaved);

  const node = h('div', { class: 'gen' },
    h('div', { class: 'spin' }),
    h('h3', {}, 'AI กำลังเขียนประกาศของคุณ'),
    checklist,
    counterEl,
    elapsedEl,
    savedLinkEl,
  );

  // auto-start (also covers a reload landing on this stage)
  if (!running) setTimeout(startGeneration, 50);
  return node;
}

function setStep(n) {
  // steps are 1..5 → checklist rows 0..4 (step 1 marks row0 active; completing advances)
  ckEls.forEach((row, i) => {
    row.classList.remove('active', 'done');
    if (i < n - 1) { row.classList.add('done'); row.querySelector('.mk').replaceChildren(icon('check', 13)); }
    else if (i === n - 1) { row.classList.add('active'); row.querySelector('.mk').textContent = ''; }
    else row.querySelector('.mk').textContent = '';
  });
}

export async function startGeneration() {
  if (running) return;
  running = true;
  startTs = Date.now();
  setStep(1);
  elapsedTimer = setInterval(() => {
    if (elapsedEl) elapsedEl.textContent = Math.round((Date.now() - startTs) / 1000) + ' วินาที';
    if (savedLinkEl && Date.now() - startTs > 60000) savedLinkEl.hidden = false;
  }, 500);

  try {
    const { draft, draftMeta, copyCards } = await generateListing(
      getState().intake,
      (step) => setStep(step),
      { onToken: (chars) => { if (counterEl) counterEl.textContent = TEXT.gen.writing(chars); } },
    );
    // mark all done
    ckEls.forEach(r => { r.classList.remove('active'); r.classList.add('done'); r.querySelector('.mk').replaceChildren(icon('check', 13)); });
    setState({ draft, draftMeta, copyCards, stage: 'review', review: { ...getState().review, status: 'needs_review' } });
    await botSay(TEXT.afterSubmit);
  } catch (e) {
    console.error('generation failed', e);
    setState({ stage: 'review' });
    await botSay(TEXT.afterSubmit);
  } finally {
    clearInterval(elapsedTimer);
    running = false;
  }
}
