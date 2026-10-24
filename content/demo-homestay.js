// Demo homestay. Owner: C (content and data)
// Fictional property for the demo. Replace with a real, consenting owner if you have one.
export const DEMO_ANSWERS = {
  name: 'บ้านสวนลุงแดง',
  place: 'ต.ปัว อ.ปัว จ.น่าน',
  rooms: 4,
  guests: 10,
  price: 900,
  highlights: ['mountain', 'rice', 'food', 'community', 'parking', 'wifi'],
  story: 'บ้านไม้สองชั้นกลางทุ่งนา ลุงแดงกับป้าแต๋วทำอาหารเหนือให้แขกทุกเช้า พาเดินชมนาและเรียนทอผ้าที่หมู่บ้าน',
  photoCount: 5,
};

export const isDemo = (a) => a?.name === DEMO_ANSWERS.name;
