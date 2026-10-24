<<<<<<< HEAD
// Shared data shapes. Update this file whenever a format changes.
// Matches the shapes the prototype code uses
// (flat per-language fields like title_th, rich room objects, contact as an object).

/**
 * What the owner fills in (intake form). Example: src/data/demoHomestay.js
 * @typedef {Object} Intake
 * @property {{name:string, village:string, district:string, province:string, address:string, postcode:string}} place
 * @property {{name:string}} owner                         contact person
 * @property {Room[]} rooms
 * @property {{id:string, slot:string}[]} photos            ids; the image files live in IndexedDB (src/photos.js)
 * @property {{facilities:string[], meal:string, nearby:string[], nearbyOther:string,
 *             checkin:string, checkout:string, smoking:boolean, pets:boolean, quietAfter:string, note:string}} answers
 * @property {{phone:string, email:string, line:string, licence:string}} contact
 * @property {boolean} pdpa                                 consent checkbox
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {string} type          option id from src/data/options.js (double, twin, family, dorm, floor)
 * @property {string} name
 * @property {number} count         number of rooms of this type
 * @property {{type:string, qty:number}[]} beds
 * @property {number} maxGuests
 * @property {number} price         THB per night
 * @property {'private'|'shared'} bathroom
 * @property {boolean} aircon
 */

/**
 * What the AI writes (listing draft). Example: src/data/savedDraft.js
 * @typedef {Object} Draft
 * @property {string} title_th  @property {string} title_en  @property {string} title_zh
 * @property {string} desc_th   @property {string} desc_en   @property {string} desc_zh
 * @property {{th:string, en:string, zh:string}[]} highlights    3-5 items
 * @property {{value:number, low:number, high:number, reason_th:string}} price
 * @property {{id:string, level:'error'|'warning', field:string, message_th:string}[]} flags
 */

/**
 * One field to copy into Agoda's sign-up, in Agoda's order (built by src/rules/buildCopyCards.js).
 * @typedef {Object} CopyCard
 * @property {string} id  @property {string} screen  @property {string} screen_th
 * @property {string} agodaField  @property {string} label_th  @property {string} value
 * @property {number} order  @property {boolean} hintOnly
 */

export const EMPTY_INTAKE = {
  place: { name: '', village: '', district: '', province: '', address: '', postcode: '' },
  owner: { name: '' },
  rooms: [],
  photos: [],
  answers: { facilities: [], meal: 'breakfast_incl', nearby: [], nearbyOther: '', checkin: '14:00', checkout: '11:00', smoking: false, pets: false, quietAfter: '22:00', note: '' },
  contact: { phone: '', email: '', line: '', licence: '' },
  pdpa: false,
};

export const EMPTY_DRAFT = {
  title_th: '', title_en: '', title_zh: '',
  desc_th: '', desc_en: '', desc_zh: '',
  highlights: [],
  price: { value: 0, low: 0, high: 0, reason_th: '' },
  flags: [],
};
=======
// Agreed data shapes. Everyone codes against these. Tell the team before changing.
// Owner: C (content and data)

export const LANGS = ['th', 'en', 'zh'];
export const LANG_LABEL = { th: 'ไทย', en: 'English', zh: '中文' };

/**
 * @typedef {Object} Answers  what the owner told us in the chat
 * @property {string} name          property name (Thai)
 * @property {string} place         "ต.ปัว อ.ปัว จ.น่าน"
 * @property {number} rooms
 * @property {number} guests        max guests
 * @property {number} price         THB per night, starting price
 * @property {string[]} highlights  keys of HIGHLIGHTS
 * @property {string} [story]       owner's own words (Thai)
 * @property {number} photoCount
 */

/**
 * @typedef {Object} LangListing
 * @property {string} title
 * @property {string} summary
 * @property {string} description
 * @property {string[]} highlights   labels in this language
 * @property {boolean} [storyUntranslated]  true when a template could not translate the owner's story
 */

/**
 * @typedef {Object} Listing
 * @property {LangListing} th
 * @property {LangListing} en
 * @property {LangListing} zh
 * @property {{source: Object<string,{kind:'ai'|'saved'|'template', model?:string}>, at:number, aiUp:boolean}} meta
 */

/**
 * @typedef {Object} State
 * @property {'chat'|'preview'|'connect'|'live'} tab
 * @property {'intake'|'generating'|'preview'|'connect'|'submitted'|'live'} stage
 * @property {number} qIndex
 * @property {Answers} answers
 * @property {{from:'bot'|'me', text:string}[]} chat
 * @property {Listing|null} listing
 * @property {boolean} approved
 * @property {{done: Object<string,boolean>, coach: Object<string,{from:'bot'|'me',text:string,src?:string}[]>}} connect
 * @property {boolean} submitted   owner says everything is sent to Agoda
 * @property {boolean} live        staff confirmed it is live
 * @property {{lang?:string}|null} busy
 * @property {{t:number,msg:string}[]} log
 */

export function newState() {
  return {
    tab: 'chat',
    stage: 'intake',
    qIndex: 0,
    answers: {},
    chat: [],
    listing: null,
    approved: false,
    connect: { done: {}, coach: {} },
    submitted: false,
    live: false,
    busy: null,
    log: [],
  };
}

export const HIGHLIGHTS = [
  { key: 'mountain', th: 'วิวภูเขา', en: 'mountain views', zh: '山景' },
  { key: 'rice', th: 'ทุ่งนาเขียวขจี', en: 'green rice fields', zh: '绿色稻田' },
  { key: 'food', th: 'อาหารพื้นเมืองฝีมือเจ้าของบ้าน', en: 'home-cooked local food', zh: '房东亲手烹制的地道本地菜' },
  { key: 'community', th: 'กิจกรรมชุมชน', en: 'village activities', zh: '乡村社区体验活动' },
  { key: 'aircon', th: 'ห้องปรับอากาศ', en: 'air-conditioned rooms', zh: '空调客房' },
  { key: 'parking', th: 'ที่จอดรถ', en: 'parking', zh: '停车位' },
  { key: 'temple', th: 'ใกล้วัดและตลาดชุมชน', en: 'close to the temple and local market', zh: '靠近寺庙和当地市集' },
  { key: 'family', th: 'เหมาะกับครอบครัว', en: 'family friendly', zh: '适合家庭入住' },
  { key: 'wifi', th: 'Wi-Fi ฟรี', en: 'free Wi-Fi', zh: '免费无线网络' },
];

export const PROVINCES = {
  'น่าน': { en: 'Nan', zh: '南府' },
  'เชียงใหม่': { en: 'Chiang Mai', zh: '清迈' },
  'เชียงราย': { en: 'Chiang Rai', zh: '清莱' },
  'แม่ฮ่องสอน': { en: 'Mae Hong Son', zh: '夜丰颂' },
  'ลำปาง': { en: 'Lampang', zh: '南邦' },
  'ลำพูน': { en: 'Lamphun', zh: '南奔' },
  'แพร่': { en: 'Phrae', zh: '帕府' },
  'พะเยา': { en: 'Phayao', zh: '帕尧' },
  'เลย': { en: 'Loei', zh: '黎府' },
  'สุโขทัย': { en: 'Sukhothai', zh: '素可泰' },
  'กาญจนบุรี': { en: 'Kanchanaburi', zh: '北碧' },
  'ราชบุรี': { en: 'Ratchaburi', zh: '叻武里' },
  'ตราด': { en: 'Trat', zh: '特拉特' },
  'จันทบุรี': { en: 'Chanthaburi', zh: '尖竹汶' },
  'นครศรีธรรมราช': { en: 'Nakhon Si Thammarat', zh: '洛坤' },
};

/** Find the province named inside a free-text place. Returns {th,en,zh} or null. */
export function provinceOf(place = '') {
  for (const [th, v] of Object.entries(PROVINCES)) {
    if (place.includes(th)) return { th, ...v };
  }
  return null;
}

export const labelOf = (key, lang) => HIGHLIGHTS.find((h) => h.key === key)?.[lang];
>>>>>>> parent of 1b829a5 (ver1 of 1)
