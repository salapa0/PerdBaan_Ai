// Agoda's sign-up screens, in order. Agoda is now one of several platforms (see platforms.js);
// this backward-compatible view keeps older imports (and test.html) working.
import { getPlatform } from './platforms.js';
export const agodaScreens = getPlatform('agoda').screens.map(s => ({ screen: s.screen, title: s.title, agoda: s.field }));
