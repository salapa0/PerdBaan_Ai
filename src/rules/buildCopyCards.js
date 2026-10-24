// Builds the "tap to copy" cards for a platform's sign-up screens.
// The per-platform mapping lives in src/data/platforms.js — this just dispatches to it.
import { getPlatform } from '../data/platforms.js';
export function buildCopyCards(draft, intake, platform = 'agoda') {
  return getPlatform(platform).cards(draft, intake);
}
