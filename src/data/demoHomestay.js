export const demoHomestay = {
  name: 'บ้านสวนริมน่าน',
  location: 'อ.ภูเพียง จ.น่าน',
  contact: { phone: '081-234-5678' },
  totalRooms: 3,
  rooms: [
    { id: 'r1', name: 'ห้องริมน้ำ', price: 790, count: 2 },
    { id: 'r2', name: 'ห้องสวน', price: 690, count: 1 },
  ],
  amenities: ['Wi-Fi', 'ที่จอดรถ', 'อาหารเช้า', 'ระเบียง/วิวริมน้ำ'],
  amenityOtherOn: false,
  amenityOther: '',
  features: 'อาหารเช้าพื้นเมือง บรรยากาศเงียบสงบ',
  // Placeholder photos in public/demo-photos/ (swap for real ones with the same file names).
  photos: ['01-front', '02-bedroom', '03-bathroom', '04-view', '05-food', '06-activity'].map(n => `public/demo-photos/${n}.jpg`),
};
