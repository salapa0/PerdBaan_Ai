// S7 — go live: set Agoda live, post the live card + follow-up into the chat.
import { money, TEXT } from '../ui/ui.js';
import { getState, setState } from '../state.js';
import { botSay } from '../ui/chat.js';
import { photoURL } from '../photos.js';
import { sampleListingLink } from '../data/demoHomestay.js';

export async function goLive() {
  const s = getState();
  const intake = s.intake;
  const price = s.draft?.price?.value;
  const front = (intake?.photos || []).find(p => p.slot === 'front') || (intake?.photos || [])[0];
  let thumb = 'public/demo-photos/01-front.jpg';
  if (front) { const u = await photoURL(front.id); if (u) thumb = u; }

  setState({
    agoda: { ...s.agoda, status: 'live', step: 6, liveAt: Date.now(), listingUrl: s.agoda.listingUrl || sampleListingLink },
    stage: 'live',
  });

  await botSay({
    card: {
      kind: 'live',
      title: intake?.place?.name || 'ที่พักของคุณ',
      body: (price ? money(price) + ' ' + TEXT.preview.perNight : ''),
      thumb,
      buttons: [
        { label: TEXT.live.view, action: 'open_agoda_listing' },
        { label: TEXT.live.share, action: 'share_listing' },
      ],
    },
  }, 300);
  await botSay(TEXT.liveFollow);
}
