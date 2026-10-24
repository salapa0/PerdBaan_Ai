// Screenshot coach logic: Qwen-VL via Ollama, saved answers as fallback. Owner: B (AI and logic)
import { getConfig } from './config.js';
import { ping, generate, blobToBase64 } from './ollama.js';
import { coachPrompt } from './prompts.js';

/**
 * @param {{step:Object, listing:Object|null, question?:string, image?:Blob}} p
 * @returns {Promise<{text:string, src:'ai'|'saved'}>}
 */
export async function askCoach({ step, listing, question = '', image = null }) {
  const status = await ping();
  if (status.ok) {
    try {
      const images = image ? [await blobToBase64(image)] : undefined;
      const text = await generate({
        model: getConfig().models.vision,
        prompt: coachPrompt(step, listing, question, !!image),
        images,
      });
      return { text: text.trim(), src: 'ai' };
    } catch (e) {
      console.warn('[coach] AI failed, using saved answer', e);
    }
  }
  return { text: image ? step.coach.withImage : step.coach.noImage, src: 'saved' };
}
