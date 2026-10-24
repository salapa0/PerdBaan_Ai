// Full-state snapshots for recovery (Shift+1..7). Built from the demo homestay + saved draft.
import { CONFIG } from '../config.js';
import { demoHomestay, sampleListingLink } from './demoHomestay.js';
import { savedDraft } from './savedDraft.js';
import { buildCopyCards } from '../rules/buildCopyCards.js';
import { runChecks } from '../rules/runChecks.js';
import { TEXT } from '../ui/ui.js';

let seq = 0;
const mk = (from, kind, extra = {}) => ({ id: `snap${seq++}`, from, kind, ts: Date.now(), ...extra });

function base() {
  return {
    version: CONFIG.stateVersion,
    stage: 'chat',
    chat: [],
    intake: null,
    draft: null,
    draftMeta: { source: null, model: null, ms: 0 },
    copyCards: [],
    agoda: { status: 'not_connected', step: 0, readiness: { id: true, bank: true, phone: true, email: true }, coachLog: [], listingUrl: null, liveAt: null },
    review: { status: 'draft', editedFields: [], activeLang: 'th' },
    approval: { status: 'none' },
    settings: { aiMode: 'saved', coachMode: 'simple' },
    intakeStep: 1,
  };
}

function withDraft(s) {
  const intake = JSON.parse(JSON.stringify(demoHomestay));
  const draft = JSON.parse(JSON.stringify(savedDraft));
  draft.flags = runChecks(draft, intake);
  s.intake = intake;
  s.draft = draft;
  s.draftMeta = { source: 'saved', model: 'cached', ms: 0 };
  s.copyCards = buildCopyCards(draft, intake);
  return s;
}

const welcomeChat = () => ([
  mk('bot', 'text', { text: TEXT.welcome1 }),
  mk('bot', 'card', { card: { title: TEXT.startCard.title, body: TEXT.startCard.body, thumb: 'public/demo-photos/02-bedroom.jpg', buttons: [{ label: TEXT.startCard.btn, action: 'open_intake' }] } }),
]);

export function makeSnapshot(n) {
  let s = base();
  switch (n) {
    case 1:
      s.chat = welcomeChat();
      break;
    case 2:
      s = withDraft(base());
      s.draft = null; s.copyCards = []; s.draftMeta = { source: null, model: null, ms: 0 };
      s.stage = 'intake'; s.intakeStep = 3;
      s.chat = welcomeChat();
      break;
    case 3:
      s = withDraft(base());
      s.draft = null; s.copyCards = []; s.draftMeta = { source: null, model: null, ms: 0 };
      s.stage = 'generating';
      s.chat = welcomeChat();
      break;
    case 4:
      s = withDraft(base());
      s.stage = 'review'; s.review.status = 'approved'; s.approval = { status: 'sent' };
      s.chat = [...welcomeChat(),
        mk('bot', 'text', { text: TEXT.afterSubmit }),
        mk('bot', 'card', { card: { title: TEXT.previewReady.title, body: TEXT.previewReady.body, thumb: 'public/demo-photos/01-front.jpg', buttons: [{ label: TEXT.previewReady.btn, action: 'open_preview' }] } }),
      ];
      break;
    case 5:
      s = withDraft(base());
      s.stage = 'connections'; s.review.status = 'approved'; s.approval = { status: 'approved' };
      s.chat = [...welcomeChat(),
        mk('bot', 'text', { text: TEXT.afterApprove }),
        mk('bot', 'card', { card: { title: TEXT.conn.title, body: TEXT.conn.sub, buttons: [{ label: TEXT.goConnections, action: 'open_connections' }] } }),
      ];
      break;
    case 6:
      s = withDraft(base());
      s.stage = 'coach'; s.approval = { status: 'approved' };
      s.agoda.status = 'connecting'; s.agoda.step = 3;
      s.agoda.listingUrl = sampleListingLink;
      break;
    case 7:
      s = withDraft(base());
      s.stage = 'live'; s.approval = { status: 'approved' };
      s.agoda.status = 'live'; s.agoda.step = 6; s.agoda.liveAt = Date.now();
      s.agoda.listingUrl = sampleListingLink;
      s.chat = [...welcomeChat(),
        mk('bot', 'card', { card: { kind: 'live', title: demoHomestay.place.name, body: '฿' + savedDraft.price.value + ' ' + TEXT.preview.perNight, thumb: 'public/demo-photos/01-front.jpg', buttons: [{ label: TEXT.live.view, action: 'open_agoda_listing' }, { label: TEXT.live.share, action: 'share_listing' }] } }),
        mk('bot', 'text', { text: TEXT.liveFollow }),
      ];
      break;
    default:
      s.chat = welcomeChat();
  }
  return s;
}
