// Text inside the listing preview card, one block per language (the page header and the bottom
// button stay Thai on every tab), so the Thai page is all Thai,
// the English page all English and the Chinese page all Chinese. Add a key to all three.
import { TERMS } from './options.js';

export const LANGS = [['th', 'ไทย'], ['en', 'English'], ['zh', '中文']];
export const HTML_LANG = { th: 'th', en: 'en', zh: 'zh-Hans' };

export const UI = {
  th: {
    perNight: 'บาท/คืน', range: 'ช่วง', rooms: 'ห้องพัก', amenities: 'สิ่งอำนวยความสะดวก',
    roomLine: (n, c, p) => `${n} × ${c} ห้อง · ${p} บาท/คืน`,
    tip: ph => `💡 ราคาที่ AI แนะนำจากข้อมูลของคุณ · ติดต่อ ${ph}`,
    approved: '✓ คุณอนุมัติประกาศนี้แล้ว',
    photo: n => `รูปที่ ${n}`,
  },
  en: {
    perNight: 'THB / night', range: 'Range', rooms: 'Rooms', amenities: 'Amenities',
    roomLine: (n, c, p) => `${n} × ${c} · ${p} THB / night`,
    tip: ph => `💡 Rate suggested by AI from the details you gave · Contact ${ph}`,
    approved: '✓ You have approved this listing',
    photo: n => `Photo ${n}`,
  },
  zh: {
    perNight: '泰铢/晚', range: '区间', rooms: '客房', amenities: '设施',
    roomLine: (n, c, p) => `${n} × ${c}间 · ${p}泰铢/晚`,
    tip: ph => `💡 根据您提供的信息推荐的价格 · 联系电话 ${ph}`,
    approved: '✓ 您已批准此房源',
    photo: n => `第${n}张照片`,
  },
};

// A form choice or owner-typed term in the page language. Falls back to the Thai original
// only when nothing is known (e.g. the AI did not translate a custom entry).
export const term = (t, lang, draft) => lang === 'th' ? t
  : (TERMS[t] && TERMS[t][lang]) || (draft && draft['tr_' + lang] && draft['tr_' + lang][t]) || t;

// The place name in the page language (the draft carries location_en / location_zh).
export const place = (intake, draft, lang) => lang === 'th' ? intake.location : (draft && draft['location_' + lang]) || intake.location;
