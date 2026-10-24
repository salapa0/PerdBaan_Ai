// Staff console: checks the AI draft, edits it, approves it, then watches the Agoda sign-up.
import { state } from '../state.js';
import { $, esc } from '../ui/dom.js';
import { runChecks } from '../rules/runChecks.js';

const FIELDS = [['title_th', 'ชื่อ TH'], ['title_en', 'Title EN'], ['title_zh', '标题 ZH'], ['desc_th', 'คำอธิบาย TH'], ['desc_en', 'Description EN'], ['desc_zh', '描述 ZH']];

export function renderChecks() {
  if (!state.draft || !$('#checks')) return;
  const f = runChecks(state.draft, state.intake), bad = f.some(x => x.level === 'error');
  $('#checks').innerHTML = f.length ? f.map(x => `<div class="ck ${x.level}">${x.level === 'error' ? '✗' : '!'} ${x.id} ${esc(x.msg)}</div>`).join('') : `<div class="ck ok">✓ ผ่านทุกข้อ</div>`;
  const b = $('#approve'); if (b) b.disabled = bad;
}

export function renderConsole() {
  const s = state, st = s.step;
  $('#console-owner').textContent = s.intake.name ? `${s.intake.name} · ${s.intake.location}` : '—';
  $('#ollama-light').className = 'light ' + (s.ollama ? 'light-green' : 'light-red');
  $('#ollama-label').textContent = 'Ollama · ' + (s.mode === 'live' ? 'Live' : 'Saved');
  let h = '';
  if (st === 'chat' || st === 'form') h = `<p class="muted">รอเจ้าของบ้านพักกรอกข้อมูล</p><button class="btn ghost" data-a="loadDemo">โหลดบ้านตัวอย่าง (Shift+L)</button>`;
  else if (st === 'writing') h = `<div class="spin"></div><p class="muted center">AI กำลังเขียน…</p><button class="btn ghost" data-a="stop">หยุด AI ใช้คำตอบที่บันทึกไว้ (Shift+F)</button>`;
  else {
    h = `<span class="tag ${s.source === 'Live AI' ? 'tag-live' : ''}">${esc(s.source)}</span><div id="checks" class="checks"></div>`;
    if (st === 'review') h += FIELDS.map(([k, l]) => `<label for="d-${k}">${l}</label><textarea id="d-${k}" data-d="${k}" rows="${k.startsWith('desc') ? 3 : 1}">${esc(s.draft[k])}</textarea>`).join('') + `<button id="approve" class="btn" data-a="approvePreview">Approve & send preview (Shift+P)</button>`;
    else if (st === 'preview') h += `<p class="muted">ส่งตัวอย่างแล้ว รอเจ้าของอนุมัติ${s.approved ? ' · อนุมัติแล้ว' : ''}</p>`;
    else if (st === 'connections') h += `<p class="muted">เจ้าของอนุมัติแล้ว กำลังจะเริ่มสมัคร Agoda</p>`;
    else if (st === 'coach') h += `<p class="muted">เจ้าของอยู่ขั้นที่ ${Math.min(s.coachStep, 4)}${s.coachStep === 5 ? ' (วางลิงก์)' : '/4'} · ลิงก์: ${s.linkSent ? 'ได้รับแล้ว ✓' : 'ยังไม่ได้รับ'}</p><button class="btn" data-a="simulateAgoda" ${s.linkSent ? '' : 'disabled'}>Simulate Agoda approval (Shift+A)</button>`;
    else h += `<p class="ok">Agoda อนุมัติแล้ว (จำลอง)</p><button class="btn ghost" data-a="reset">Reset (Shift+R)</button>`;
  }
  $('#console-body').innerHTML = h; renderChecks();
}
