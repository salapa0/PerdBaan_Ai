// Staff console: shows the AI draft and automated checks, then watches the owner approval and Agoda sign-up.
// Staff no longer gate the draft — the AI draft goes straight to the owner, who is the only approver.
import { state, conn } from '../state.js';
import { $, esc } from '../ui/dom.js';
import { allAmenities } from '../data/options.js';
import { platforms, getPlatform } from '../data/platforms.js';
import { runChecks } from '../rules/runChecks.js';

export function renderChecks() {
  if (!state.draft || !$('#checks')) return;
  const f = runChecks(state.draft, state.intake), bad = f.some(x => x.level === 'error');
  $('#checks').innerHTML = f.length ? f.map(x => `<div class="ck ${x.level}">${x.level === 'error' ? '✗' : '!'} ${x.id} ${esc(x.msg)}</div>`).join('') : `<div class="ck ok">✓ ผ่านทุกข้อ</div>`;
  const b = $('#approve'); if (b) b.disabled = bad;
}

// One status line per platform (live / connecting / waiting / not started).
function connLines() {
  return `<p class="muted">ช่องทาง: ${platforms.map(p => {
    const c = conn(p.id), n = p.screens.length;
    const st = c.live ? 'ขึ้นจริง ✓' : c.linkSent ? 'รอยืนยัน' : (c.step > 1 || c.coach) ? `${Math.min(c.step, n)}/${n}` : '—';
    return `${esc(p.short || p.name)}: ${st}`;
  }).join(' · ')}</p>`;
}

export function renderConsole() {
  const s = state, st = s.step;
  $('#console-owner').textContent = s.intake.name ? `${s.intake.name} · ${s.intake.location}` : '—';
  $('#ollama-light').className = 'light ' + (s.ollama ? 'light-green' : 'light-red');
  $('#ollama-label').textContent = 'Ollama · ' + (s.mode === 'live' ? 'Live' : 'Saved');
  let h = '';
  const idle = ['chat', 'review', 'form'].includes(st);
  if (st === 'writing') h = `<div class="spin"></div><p class="muted center">AI กำลังเขียน…</p><button class="btn ghost" data-a="stop">หยุด AI ใช้คำตอบที่บันทึกไว้ (Shift+F)</button>`;
  else if (!s.draft) h = `<p class="muted">รอเจ้าของบ้านพักกรอกข้อมูล</p><button class="btn ghost" data-a="loadDemo">โหลดบ้านตัวอย่าง (Shift+L)</button>`;
  else {
    h = `<span class="tag ${s.source === 'Live AI' ? 'tag-live' : ''}">${esc(s.source)}</span><div id="checks" class="checks"></div><p class="muted">ห้อง ${s.intake.totalRooms} · ${esc(s.intake.rooms.map(r => `${r.name} ×${r.count} (${r.price}฿)`).join(', '))}<br>สิ่งอำนวยความสะดวก: ${esc(allAmenities(s.intake).join(', ') || '—')}<br>รูปที่พัก: ${(s.intake.photos || []).length} รูป</p>`;
    if (idle && !s.approved) h += `<p class="muted">AI ส่งตัวอย่างให้เจ้าของแล้ว · รอเจ้าของอนุมัติ</p>`;
    else if (st === 'preview') h += `<p class="muted">เจ้าของกำลังดูตัวอย่าง</p>`;
    else if (st === 'connections' || idle) h += `<p class="muted">เจ้าของอนุมัติแล้ว รอเริ่มเชื่อมต่อช่องทาง</p>` + connLines();
    else if (st === 'coach') {
      const p = getPlatform(s.active), c = conn(), n = p.screens.length;
      h += `<p class="muted">เชื่อมต่อ ${esc(p.short || p.name)} · ขั้นที่ ${Math.min(c.step, n)}${c.step > n ? ' (วางลิงก์)' : '/' + n} · ลิงก์: ${c.linkSent ? 'ได้รับแล้ว ✓' : 'ยังไม่ได้รับ'}</p>`
        + `<button class="btn" data-a="simulateAgoda" ${c.linkSent && !c.live ? '' : 'disabled'}>${esc(p.verify.btn)} (Shift+A)</button>` + connLines();
    }
    else h += connLines() + `<button class="btn ghost" data-a="reset">Reset (Shift+R)</button>`;
  }
  $('#console-body').innerHTML = h; renderChecks();
}
