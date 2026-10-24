// Builds the "tap to copy" cards for each Agoda sign-up screen.
export function buildCopyCards(draft, intake) {
  const c = [];
  c.push({ screen: 'property', label: 'ชื่อที่พัก (EN)', value: draft.title_en });
  c.push({ screen: 'property', label: 'ชื่อที่พัก (TH)', value: draft.title_th });
  c.push({ screen: 'location', label: 'ที่อยู่', value: intake.location });
  c.push({ screen: 'location', label: 'เบอร์โทร', value: intake.contact.phone });
  c.push({ screen: 'location', label: 'หมุดแผนที่', value: 'ปักหมุดตรงทางเข้าบ้านพัก', hintOnly: true });
  intake.rooms.forEach(r => c.push({ screen: 'rooms', label: `${r.name} ราคา/คืน`, value: String(r.price) }));
  c.push({ screen: 'description', label: 'คำอธิบาย (EN)', value: draft.desc_en });
  c.push({ screen: 'description', label: 'คำอธิบาย (TH)', value: draft.desc_th });
  return c;
}
