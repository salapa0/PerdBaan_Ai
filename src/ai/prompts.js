<<<<<<< HEAD
// Prompts. Owner: B (AI and logic)
import { labelOf, provinceOf } from '../data/shapes.js';

const LANG_NAME = { th: 'Thai (ภาษาไทย)', en: 'English', zh: 'Simplified Chinese (简体中文)' };

export function listingPrompt(lang, a) {
  const labels = (a.highlights || []).map((k) => labelOf(k, 'en')).filter(Boolean).join(', ') || 'none given';
  const prov = provinceOf(a.place);
  return `You write accommodation listings for Agoda for small rural Thai homestays.
Write in ${LANG_NAME[lang]}. Tone: warm, honest, specific. Short sentences.
Rules:
- Use ONLY the facts below. Do not invent facilities, distances, awards or reviews.
- No superlatives like "best" or "No.1". No phone numbers, LINE IDs, emails or links.
- Keep the property name as given (Thai name). You may add a romanised form once in the description.

Facts:
- Property name (Thai): ${a.name}
- Location: ${a.place}${prov ? ` (${prov.en} Province)` : ''}
- Rooms: ${a.rooms}
- Max guests: ${a.guests}
- Starting price: ${a.price} THB per night
- Highlights: ${labels}
- Owner's own words (Thai): ${a.story || 'none'}

Return ONLY a JSON object with exactly these string keys:
{"title": "max 60 characters", "summary": "1-2 sentences", "description": "3 short paragraphs separated by blank lines, 250-600 characters in total"}`;
}

export function coachPrompt(step, listing, question, hasImage) {
  return `You are a patient coach helping a rural Thai homestay owner register their property on Agoda.
Reply in simple, polite Thai, at most 4 short lines. Say exactly what to click or type next. Do not invent screen names you cannot see.
Current step: ${step.title} – ${step.what}
${hasImage ? 'The owner attached a screenshot of their screen. Describe what you see in one line, then tell them the next action.' : 'No screenshot was attached.'}
${question ? `Owner's question: ${question}` : 'Owner asked for help with this step.'}
Property name: ${listing?.th?.title || ''}`;
=======
// Prompts. Instructions in English (small models follow them more reliably); output in Thai/English.
export const listingSystem = `You write short, honest accommodation listings for small rural Thai homestays that will be posted on Agoda.
Rules:
- Output ONLY the JSON object required by the schema. No extra text.
- title_th and desc_th MUST be in natural Thai. title_en and desc_en MUST be in natural English.
- Do NOT invent facilities, awards, distances, or numbers that are not in the input.
- No exaggerated claims ("best", "number 1", "world-class"). Warm, specific, plain language.
- Do NOT put phone numbers, LINE IDs, emails, or links inside the descriptions.
- title_th <= 60 chars, title_en <= 70 chars. desc_th about 350-650 Thai characters, desc_en about 450-850 characters.
- highlights: 3 to 5 short points, each with a Thai (th) and English (en) version.
- price_reason_th: one or two Thai sentences explaining the suggested nightly price band, based on the owner's own price (not market data).`;

export function listingUser(input) {
  return `Homestay data (JSON):\n${JSON.stringify(input, null, 2)}\n\nSuggested price band: ${input.priceBand.low}-${input.priceBand.high} THB, suggested ${input.priceBand.value} THB.\nWrite the listing now as the JSON object.`;
}

export const translateSystem = `You are a professional translator. Translate the given Thai/English homestay listing fields into natural Simplified Chinese (zh-CN).
Output ONLY the JSON object required by the schema. Keep it faithful and natural; do not add new facts.`;

export function translateUser(draft) {
  return `Translate these into Simplified Chinese:\n${JSON.stringify({
    title: draft.title_en,
    description: draft.desc_en,
    highlights: (draft.highlights || []).map(h => h.en),
  }, null, 2)}\nReturn title_zh, desc_zh, and highlights_zh (same order and count as highlights).`;
}

export function screenPrompt(screenList) {
  return `This is a screenshot of a hotel partner sign-up website (for listing a property). Which ONE of these known screens is it? Reply with the matching screen_id and your confidence 0-1.\nKnown screens:\n${screenList.join('\n')}\nIf none match, use screen_id "unknown".`;
}

export const rewriteSystem = `You rewrite ONE field of a Thai homestay listing based on the owner's short request.
Keep the same language as the original field, stay honest (no invented facts), no exaggerated claims, no contact details or links. Output ONLY the JSON object {"value": "..."}.`;

export function rewriteUser(field, current, request_th) {
  return `Field: ${field}\nCurrent value:\n${current}\n\nOwner's request (Thai):\n${request_th}\n\nReturn the improved value.`;
>>>>>>> 447771f9d51be470a567afa55bbb068f5d6b55bb
}
