// Shared data shapes. Owner: C (content and data). Agree these first, then code against them.
// Source: docs/demo-mvp-scope-local.md ("Shared data shapes"). Change only after telling the team.

/**
 * What the owner fills in (intake form).
 * @typedef {Object} Intake
 * @property {string} owner               owner name
 * @property {Object} place               place details (name, address or village, map text)
 * @property {Room[]} rooms
 * @property {string[]} photos            photo ids (the files live in IndexedDB)
 * @property {Object<string, any>} answers  tap-to-answer questions: facilities, meals, nearby, house rules
 * @property {string} contact             phone
 */

/**
 * @typedef {Object} Room
 * @property {string} type
 * @property {number} beds
 * @property {number} price               THB per night
 * @property {number} maxGuests
 */

/**
 * What the AI writes (listing draft).
 * @typedef {Object} Draft
 * @property {{th: string, en: string, zh: string}} title
 * @property {{th: string, en: string, zh: string}} desc
 * @property {string[]} highlights
 * @property {{value: number, reason: string}} price
 * @property {string[]} flags             check results (missing price, too few photos, banned claims...)
 */

/**
 * One field to copy into Agoda's sign-up, in Agoda's order.
 * @typedef {Object} CopyCard
 * @property {string} id
 * @property {string} agodaField
 * @property {string} value
 * @property {number} order
 */

export const EMPTY_INTAKE = {
  owner: '',
  place: {},
  rooms: [],
  photos: [],
  answers: {},
  contact: '',
};

export const EMPTY_DRAFT = {
  title: { th: '', en: '', zh: '' },
  desc: { th: '', en: '', zh: '' },
  highlights: [],
  price: { value: 0, reason: '' },
  flags: [],
};
