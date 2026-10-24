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
}
