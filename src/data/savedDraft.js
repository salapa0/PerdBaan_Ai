// Saved AI answers for the demo homestay (the fallback behind every AI call).
// Generate the real version the night before with your local models, pick the best of 3 runs,
// then hand-fix Thai/Chinese. This placeholder is complete and demo-ready.
export const savedDraft = {
  title_th: 'บ้านสวนริมธาร โฮมสเตย์ริมลำธารกลางสวนลำไย จ.น่าน',
  title_en: 'Baan Suan Rim Than — Riverside Garden Homestay in Nan',
  title_zh: '溪畔花园民宿 — 泰国北部楠府（Nan）宁静河畔之家',

  desc_th: 'บ้านสวนริมธาร โฮมสเตย์ เป็นบ้านไม้เรียบง่ายริมลำธารใสกลางสวนลำไยในอำเภอเวียงสา จังหวัดน่าน บรรยากาศเงียบสงบ ตื่นเช้ามาฟังเสียงน้ำและนกในสวน เหมาะกับคนที่อยากพักผ่อนแบบช้าๆ ใกล้ชิดธรรมชาติ ห้องพักสะอาด มีทั้งห้องคู่ ห้องครอบครัว และเรือนนอนรวมสไตล์พื้นบ้าน ทุกห้องมีน้ำอุ่นและพัดลม มื้อเช้าเป็นอาหารเหนือทำสดจากวัตถุดิบในสวน รอบที่พักมีทุ่งนา วัดเก่า และจุดชมวิวริมแม่น้ำว้าให้เดินเล่น เจ้าของยินดีพาชมสวนและแนะนำที่เที่ยวชุมชน พาสัตว์เลี้ยงมาด้วยได้',
  desc_en: 'Baan Suan Rim Than is a simple wooden homestay beside a clear stream, set in a longan orchard in Wiang Sa, Nan. Wake up to the sound of water and birdsong — an easy place to slow down and be close to nature. Rooms are clean and comfortable, from cosy doubles to a family room and a traditional shared sleeping house; every room has hot water and a fan. Breakfast is freshly cooked northern-Thai food using produce from the garden. Nearby you can wander through rice fields, visit an old temple, or watch the river from a quiet viewpoint. Your hosts are happy to show you around the orchard and share local tips. Pets are welcome.',
  desc_zh: '溪畔花园民宿是一栋朴素的木屋，坐落在泰国楠府维安萨的龙眼果园中，紧邻清澈的小溪。清晨在流水与鸟鸣中醒来，适合想要放慢脚步、亲近自然的旅人。房间干净舒适，有温馨双人房、家庭房以及传统通铺木屋，每间都配有热水和风扇。早餐是用园中食材现做的泰北料理。附近可漫步稻田、参观古寺，或在安静的观景点眺望河流。主人乐意带您参观果园并推荐当地去处。欢迎携带宠物。',

  highlights: [
    { th: 'ริมลำธารกลางสวนลำไย เงียบสงบ', en: 'Beside a stream in a longan orchard', zh: '龙眼园中的溪畔，宁静安逸' },
    { th: 'อาหารเหนือทำสดทุกเช้า', en: 'Freshly cooked northern-Thai breakfast', zh: '每日现做泰北早餐' },
    { th: 'ใกล้ทุ่งนา วัดเก่า และจุดชมวิวแม่น้ำว้า', en: 'Near rice fields, an old temple and a river viewpoint', zh: '靠近稻田、古寺与河畔观景点' },
    { th: 'พาสัตว์เลี้ยงมาได้', en: 'Pet-friendly', zh: '可携带宠物' },
  ],

  price: {
    value: 800,
    low: 700,
    high: 900,
    reason_th: 'คำนวณจากราคาห้องหลักของคุณ (790 บาท) ปัดเป็น 800 บาท/คืน ช่วงแนะนำ 700-900 บาท เผื่อปรับตามฤดูกาลและวันหยุด นี่เป็นคำแนะนำจากราคาของคุณเอง ยังไม่ใช่ราคาตลาด',
  },

  flags: [],

  // canned single-field revision for the Request-change demo
  revisions: [
    {
      field: 'desc_th',
      value: 'บ้านสวนริมธาร โฮมสเตย์ บ้านไม้ริมลำธารใสกลางสวนลำไย อ.เวียงสา จ.น่าน เงียบสงบ เป็นส่วนตัว เหมาะกับครอบครัวและคู่รักที่อยากพักผ่อนใกล้ชิดธรรมชาติ ตื่นเช้าฟังเสียงน้ำ จิบกาแฟริมระเบียง มื้อเช้าอาหารเหนือทำสดจากวัตถุดิบในสวน มีห้องคู่ ห้องครอบครัว และเรือนนอนรวม ทุกห้องมีน้ำอุ่นและพัดลม รอบบ้านมีทุ่งนา วัดเก่า และจุดชมวิวริมแม่น้ำว้า เดินเล่นได้สบาย เจ้าของเป็นกันเอง พาชมสวนและแนะนำที่เที่ยวชุมชน พาสัตว์เลี้ยงมาด้วยได้',
    },
  ],
};
