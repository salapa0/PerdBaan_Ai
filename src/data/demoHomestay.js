// One complete, fictional demo homestay (intake shape). No real person's data.
// Used by "Load demo homestay" so nothing is typed live on stage.

export const demoPhotos = [
  { id: 'demo-front', slot: 'front', file: 'public/demo-photos/01-front.jpg' },
  { id: 'demo-bedroom', slot: 'bedroom', file: 'public/demo-photos/02-bedroom.jpg' },
  { id: 'demo-bathroom', slot: 'bathroom', file: 'public/demo-photos/03-bathroom.jpg' },
  { id: 'demo-view', slot: 'view', file: 'public/demo-photos/04-view.jpg' },
  { id: 'demo-food', slot: 'food', file: 'public/demo-photos/05-food.jpg' },
  { id: 'demo-activity', slot: 'activity', file: 'public/demo-photos/06-activity.jpg' },
  { id: 'demo-extra', slot: 'extra', file: 'public/demo-photos/07-extra-dark.jpg' }, // deliberately dark → brighten demo
];

export const demoHomestay = {
  place: {
    name: 'บ้านสวนริมธาร โฮมสเตย์',
    village: 'บ้านน้ำปั้ว ต.น้ำปั้ว',
    district: 'เวียงสา',
    province: 'น่าน',
    address: '88 หมู่ 3 บ้านน้ำปั้ว ต.น้ำปั้ว อ.เวียงสา จ.น่าน',
    postcode: '55110',
  },
  owner: { name: 'คุณแสงเดือน ใจดี' },
  rooms: [
    { id: 'r1', type: 'double', name: 'ห้องริมธาร', count: 2, beds: [{ type: 'queen', qty: 1 }], maxGuests: 2, price: 790, bathroom: 'private', aircon: true },
    { id: 'r2', type: 'family', name: 'ห้องครอบครัวสวนหลัง', count: 2, beds: [{ type: 'queen', qty: 1 }, { type: 'single', qty: 2 }], maxGuests: 4, price: 1190, bathroom: 'private', aircon: true },
    { id: 'r3', type: 'floor', name: 'เรือนนอนรวมสไตล์พื้นบ้าน', count: 1, beds: [{ type: 'mattress', qty: 4 }], maxGuests: 4, price: 500, bathroom: 'shared', aircon: false },
  ],
  photos: demoPhotos.map(p => ({ id: p.id, slot: p.slot })),
  answers: {
    facilities: ['wifi', 'parking', 'hotwater', 'fan', 'kitchen', 'fridge', 'bike'],
    meal: 'breakfast_incl',
    nearby: ['rice', 'river', 'temple', 'viewpoint'],
    nearbyOther: 'จุดกางเต็นท์ริมน้ำว้า',
    checkin: '14:00',
    checkout: '11:00',
    smoking: false,
    pets: true,
    quietAfter: '22:00',
    note: 'บ้านไม้ริมลำธารกลางสวนลำไย บรรยากาศเงียบสงบ เจ้าของทำอาหารเหนือให้ชิม เหมาะกับคนอยากพักผ่อนแบบช้าๆ ใกล้ชิดธรรมชาติ',
  },
  contact: {
    phone: '0812345678',          // obviously fake
    email: 'poetbaan.demo@gmail.com',
    line: '@poetbaandemo',
    licence: 'นน 0123/2567',
  },
  pdpa: true,
};

// A realistic-looking sample listing link for coach step 6 (not a real page).
export const sampleListingLink = 'https://www.agoda.com/th-th/baan-suan-rim-than-homestay/hotel/nan-th.html';
