// Generates placeholder demo photos in the browser, so no big image files are committed.
// Owner: C. Put real, resized photos in public/demo-photos/ later and swap this out.
const SCENES = [
  { t: 'ห้องนอน', c: ['#f6d365', '#fda085'] },
  { t: 'ห้องน้ำ', c: ['#a1c4fd', '#c2e9fb'] },
  { t: 'วิวทุ่งนา', c: ['#84fab0', '#8fd3f4'] },
  { t: 'มุมนั่งเล่น', c: ['#fbc2eb', '#a6c1ee'] },
  { t: 'ทางเข้าบ้าน', c: ['#ffecd2', '#fcb69f'] },
];

export async function demoPhotoFiles() {
  return Promise.all(
    SCENES.map(async (s, i) => {
      const c = document.createElement('canvas');
      c.width = 1280;
      c.height = 853;
      const g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 1280, 853);
      gr.addColorStop(0, s.c[0]);
      gr.addColorStop(1, s.c[1]);
      g.fillStyle = gr;
      g.fillRect(0, 0, 1280, 853);
      g.fillStyle = 'rgba(255,255,255,.92)';
      g.textAlign = 'center';
      g.font = 'bold 110px "Noto Sans Thai", system-ui, sans-serif';
      g.fillText(s.t, 640, 440);
      g.font = '38px "Noto Sans Thai", system-ui, sans-serif';
      g.fillText('รูปตัวอย่าง (แทนที่ด้วยรูปจริง)', 640, 520);
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
      return new File([blob], `demo-${i + 1}.jpg`, { type: 'image/jpeg' });
    }),
  );
}
