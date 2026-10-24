// Validate an AI draft; bad fields are replaced one-by-one from the saved draft.
const hasThai = (s) => /[฀-๿]/.test(s || '');
const hasCJK = (s) => /[一-鿿]/.test(s || '');
const len = (s) => (s || '').length;

const LIMITS = { title_th: 60, title_en: 70, desc_th: 700, desc_en: 900, title_zh: 60, desc_zh: 900 };

export function validateDraft(d) {
  const bad = [];
  const over = (f) => len(d[f]) > LIMITS[f] * 1.5;

  if (!d.title_th || !hasThai(d.title_th) || over('title_th')) bad.push('title_th');
  if (!d.desc_th || !hasThai(d.desc_th) || over('desc_th')) bad.push('desc_th');
  if (!d.title_en || hasThai(d.title_en) || over('title_en')) bad.push('title_en');
  if (!d.desc_en || hasThai(d.desc_en) || over('desc_en')) bad.push('desc_en');

  const hl = d.highlights || [];
  if (hl.length < 3 || hl.length > 5) bad.push('highlights');

  return { ok: bad.length === 0, bad };
}

export function validateZh(d) {
  const bad = [];
  if (!d.title_zh || !hasCJK(d.title_zh)) bad.push('title_zh');
  if (!d.desc_zh || !hasCJK(d.desc_zh)) bad.push('desc_zh');
  return { ok: bad.length === 0, bad };
}
