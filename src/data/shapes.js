// Shared data shapes. Owner: C (content and data). Change only after telling the team.
// Updated 24 Oct to match the shapes the prototype code actually uses
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
