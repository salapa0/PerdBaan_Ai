export const TH = /[\u0E00-\u0E7F]/, ZH = /[\u4E00-\u9FFF]/;
export function validateDraft(d) {
  const bad = [];
  for (const k of ['title_th', 'desc_th']) if (!TH.test(d[k] || '')) bad.push(k);
  for (const k of ['title_en', 'desc_en']) if (!d[k] || TH.test(d[k]) || ZH.test(d[k])) bad.push(k);
  for (const k of ['title_zh', 'desc_zh']) if (!ZH.test(d[k] || '')) bad.push(k);
  return { ok: bad.length === 0, bad };
}
