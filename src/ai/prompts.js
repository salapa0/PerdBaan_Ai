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
}
