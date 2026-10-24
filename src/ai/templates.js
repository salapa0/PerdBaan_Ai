// Offline template listings: always work, even with no AI. Owner: B (AI and logic)
import { labelOf, provinceOf } from '../data/shapes.js';

export function templateListing(lang, a) {
  const prov = provinceOf(a.place);
  const labels = (a.highlights || []).map((k) => labelOf(k, lang)).filter(Boolean);
  const story = (a.story || '').trim();
  const n = a.rooms, g = a.guests, p = a.price;

  if (lang === 'th') {
    const para1 = `${a.name} เป็นโฮมสเตย์ที่ ${a.place} มีห้องพัก ${n} ห้อง รับแขกได้สูงสุด ${g} คน`;
    const para2 = [labels.length ? `จุดเด่นของที่พัก: ${labels.join(', ')}` : '', story].filter(Boolean).join('\n');
    return {
      title: `${a.name} – โฮมสเตย์${prov ? ` จ.${prov.th}` : ''}`,
      summary: `โฮมสเตย์ ${n} ห้อง รับแขกได้ ${g} คน${labels[0] ? ` ${labels[0]}` : ''} ราคาเริ่มต้น ${p} บาทต่อคืน`,
      description: [para1 + ` ราคาเริ่มต้น ${p} บาทต่อคืน`, para2, 'เหมาะกับผู้ที่อยากพักผ่อนเงียบๆ และสัมผัสวิถีชีวิตชนบทไทยอย่างใกล้ชิด ยินดีต้อนรับค่ะ'].filter(Boolean).join('\n\n'),
      highlights: labels,
    };
  }
  if (lang === 'en') {
    const where = prov ? `${prov.en} Province, Thailand` : a.place;
    return {
      title: `${a.name} Homestay${prov ? ` – ${prov.en}` : ''}`,
      summary: `A family-run homestay in ${where} with ${n} room${n > 1 ? 's' : ''} for up to ${g} guests. From ${p} THB per night.`,
      description: [
        `${a.name} is a small homestay in ${where}. It has ${n} room${n > 1 ? 's' : ''} and welcomes up to ${g} guests. Rates start from ${p} THB per night.`,
        labels.length ? `What you can expect: ${labels.join(', ')}.` : '',
        'It suits travellers who want a quiet stay and a close look at everyday rural life in Thailand, with a warm welcome from your hosts.',
      ].filter(Boolean).join('\n\n'),
      highlights: labels,
      storyUntranslated: !!story,
    };
  }
  const where = prov ? `泰国${prov.zh}` : a.place;
  return {
    title: `${a.name} – ${prov ? prov.zh : ''}乡村民宿`,
    summary: `位于${where}的乡村民宿，共${n}间客房，最多可住${g}人。每晚${p}泰铢起。`,
    description: [
      `${a.name}是一家位于${where}的乡村民宿，共有${n}间客房，最多可接待${g}位客人。每晚${p}泰铢起。`,
      labels.length ? `民宿特色：${labels.join('、')}。` : '',
      '适合想安静度假、近距离体验泰国乡村生活的旅客，房东会热情接待您。',
    ].filter(Boolean).join('\n\n'),
    highlights: labels,
    storyUntranslated: !!story,
  };
}
