// Map draft + intake to Agoda sign-up copy cards, in Agoda's screen/field order.
import { agodaScreens } from '../data/agodaFields.js';
import { enLabel } from '../data/options.js';

export function buildCopyCards(draft, intake) {
  const cards = [];
  let order = 0;
  for (const screen of agodaScreens) {
    if (screen.repeatPerRoom) {
      (intake.rooms || []).forEach((room, idx) => {
        for (const f of screen.fields) {
          let value = '';
          try { value = f.from(room, intake, draft); } catch { value = ''; }
          cards.push({
            id: `${screen.screen}:${idx}:${f.agodaField}`,
            screen: screen.screen, screen_th: screen.name_th,
            agodaField: `${f.agodaField} (${room.name || enLabel('room', room.type)})`,
            label_th: `${f.label_th} — ${room.name || enLabel('room', room.type)}`,
            value: String(value ?? ''), order: order++, hintOnly: !!f.hintOnly,
          });
        }
      });
    } else {
      for (const f of screen.fields) {
        let value = '';
        try { value = f.from(draft, intake); } catch { value = ''; }
        cards.push({
          id: `${screen.screen}:${f.agodaField}`,
          screen: screen.screen, screen_th: screen.name_th,
          agodaField: f.agodaField, label_th: f.label_th,
          value: String(value ?? ''), order: order++, hintOnly: !!f.hintOnly,
        });
      }
    }
  }
  return cards;
}
