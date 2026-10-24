// Canvas photo helpers: load, brighten+crop, resize, base64.
export function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function canvasToBlob(canvas, quality = 0.85) {
  return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', quality));
}

// Brighten + centre-crop to 4:3. Returns a NEW blob; caller keeps the original for before/after.
export async function brighten(blob) {
  const img = await loadImage(blob);
  const targetRatio = 4 / 3;
  let sw = img.width, sh = img.height;
  let sx = 0, sy = 0;
  if (sw / sh > targetRatio) { const nw = sh * targetRatio; sx = (sw - nw) / 2; sw = nw; }
  else { const nh = sw / targetRatio; sy = (sh - nh) / 2; sh = nh; }
  const outW = Math.min(1600, sw);
  const outH = outW / targetRatio;
  const canvas = document.createElement('canvas');
  canvas.width = outW; canvas.height = outH;
  const ctx = canvas.getContext('2d');
  ctx.filter = 'brightness(1.12) contrast(1.06) saturate(1.05)';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  return canvasToBlob(canvas, 0.85);
}

// Resize keeping aspect ratio, max width maxW.
export async function resize(blob, maxW = 1600) {
  const img = await loadImage(blob);
  if (img.width <= maxW) return blob;
  const scale = maxW / img.width;
  const canvas = document.createElement('canvas');
  canvas.width = maxW; canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, 0.85);
}

// FileReader → base64 (no data: prefix), for the vision model.
export function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(',')[1] || '');
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}
