// Offline-friendly placeholder art. In production these are replaced by real
// studio photos of the house models and the merchant's flat-lay garment shots.

function esc(s = '') {
  return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

const SKIN = {
  فاتح: '#e9c9a8',
  متوسط: '#cca07a',
  حنطي: '#c79a72',
  داكن: '#8a5a3b',
};

// A stylized portrait card for a house model.
export function modelPortraitSVG(model) {
  const skin = SKIN[model.skin_tone] || '#cd9f79';
  const hijab = !!model.hijab;
  const cloth = hijab ? '#3a3f4b' : '#f3e7d6';
  const bg1 = '#171512';
  const bg2 = '#2a231a';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.6">
      <stop offset="0" stop-color="#d9b25e" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#d9b25e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  <rect width="600" height="800" fill="url(#glow)"/>
  <!-- shoulders / clothing -->
  <path d="M120 800 C150 620 230 560 300 560 C370 560 450 620 480 800 Z" fill="${cloth}"/>
  <!-- neck -->
  <rect x="270" y="470" width="60" height="120" rx="26" fill="${skin}"/>
  <!-- head -->
  <ellipse cx="300" cy="360" rx="112" ry="132" fill="${skin}"/>
  ${hijab
    ? `<path d="M300 210 C205 210 176 320 182 400 C188 470 210 520 236 556 L236 470 C236 380 250 300 300 300 C350 300 364 380 364 470 L364 556 C390 520 412 470 418 400 C424 320 395 210 300 210 Z" fill="#2c303a"/>`
    : `<path d="M300 214 C214 214 190 320 196 404 C200 462 214 500 214 500 L214 380 C214 300 250 262 300 262 C350 262 386 300 386 380 L386 500 C386 500 400 462 404 404 C410 320 386 214 300 214 Z" fill="#241a12"/>`}
  <!-- simple facial hints -->
  <ellipse cx="262" cy="352" rx="10" ry="7" fill="#2a1c12"/>
  <ellipse cx="338" cy="352" rx="10" ry="7" fill="#2a1c12"/>
  <path d="M280 410 q20 16 40 0" stroke="#7a4b34" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="742" text-anchor="middle" font-family="Segoe UI, Tahoma, sans-serif"
        font-size="34" fill="#f0e2c6" font-weight="700">${esc(model.name)}</text>
  <text x="300" y="778" text-anchor="middle" font-family="Segoe UI, Tahoma, sans-serif"
        font-size="20" fill="#c9a24a">${esc(model.ethnicity || '')}${hijab ? ' · محجّبة' : ''}</text>
</svg>`;
}

// A flat-lay garment placeholder used when a demo product has no real photo.
export function garmentSVG(title, category = 'top', color = '#b98fb0') {
  const shape = {
    dress: `<path d="M230 150 L370 150 L410 250 L360 280 L360 620 L240 620 L240 280 L190 250 Z" fill="${color}"/>`,
    abaya: `<path d="M250 140 L350 140 L430 640 L170 640 Z" fill="${color}"/>`,
    bottom: `<path d="M235 180 L365 180 L360 620 L315 620 L300 360 L285 620 L240 620 Z" fill="${color}"/>`,
    accessory: `<circle cx="300" cy="360" r="150" fill="none" stroke="${color}" stroke-width="34"/>`,
    top: `<path d="M225 175 L375 175 L420 245 L370 285 L370 520 L230 520 L230 285 L180 245 Z" fill="${color}"/>`,
  }[category] || `<rect x="220" y="200" width="160" height="320" rx="24" fill="${color}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720">
  <rect width="600" height="720" fill="#f6f3ee"/>
  ${shape}
  <text x="300" y="686" text-anchor="middle" font-family="Segoe UI, Tahoma, sans-serif"
        font-size="26" fill="#3a352e" font-weight="600">${esc(title)}</text>
</svg>`;
}

// Composited "try-on result" used by the mock AI provider (offline). The real
// providers (FASHN/Replicate) return a photorealistic PNG instead.
export function tryonPreviewSVG(model, { title = '', category = 'top', accent = '#b98fb0', pose = 'بورتريه' } = {}) {
  const skin = SKIN[model.skin_tone] || '#cd9f79';
  const hijab = !!model.hijab;
  const garment = {
    dress: `<path d="M150 800 C170 470 240 430 300 430 C360 430 430 470 450 800 Z" fill="${accent}"/>`,
    abaya: `<path d="M170 800 L235 430 L365 430 L430 800 Z" fill="${accent}"/>`,
    bottom: `<path d="M215 800 L235 540 L365 540 L385 800 Z" fill="${accent}"/><path d="M120 560 C150 480 235 460 300 460 C365 460 450 480 480 560 L470 620 L130 620 Z" fill="#e9dfce"/>`,
    accessory: `<path d="M120 800 C150 560 230 500 300 500 C370 500 450 560 480 800 Z" fill="#e9dfce"/><path d="M262 560 q38 60 76 0" stroke="${accent}" stroke-width="16" fill="none"/>`,
    top: `<path d="M130 720 C160 500 235 460 300 460 C365 460 440 500 470 720 L470 800 L130 800 Z" fill="${accent}"/>`,
  }[category] || `<path d="M150 800 C170 500 240 460 300 460 C360 460 430 500 450 800 Z" fill="${accent}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141210"/><stop offset="1" stop-color="#241d15"/></linearGradient>
    <radialGradient id="g2" cx="0.5" cy="0.3" r="0.6"><stop offset="0" stop-color="#d9b25e" stop-opacity="0.28"/><stop offset="1" stop-color="#d9b25e" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="600" height="800" fill="url(#bg2)"/><rect width="600" height="800" fill="url(#g2)"/>
  ${garment}
  <rect x="272" y="380" width="56" height="120" rx="24" fill="${skin}"/>
  <ellipse cx="300" cy="300" rx="104" ry="122" fill="${skin}"/>
  ${hijab
    ? `<path d="M300 168 C212 168 186 268 192 342 C197 402 214 446 236 476 L236 396 C236 314 250 244 300 244 C350 244 364 314 364 396 L364 476 C386 446 403 402 408 342 C414 268 388 168 300 168 Z" fill="#2c303a"/>`
    : `<path d="M300 176 C220 176 196 268 202 344 C206 396 214 426 214 426 L214 320 C214 250 250 214 300 214 C350 214 386 250 386 320 L386 426 C386 426 394 396 398 344 C404 268 380 176 300 176 Z" fill="#241a12"/>`}
  <ellipse cx="266" cy="298" rx="9" ry="6" fill="#2a1c12"/><ellipse cx="334" cy="298" rx="9" ry="6" fill="#2a1c12"/>
  <path d="M282 346 q18 14 36 0" stroke="#7a4b34" stroke-width="4" fill="none" stroke-linecap="round"/>
  <g>
    <rect x="24" y="24" width="150" height="44" rx="22" fill="#000" opacity="0.5"/>
    <circle cx="48" cy="46" r="12" fill="#d9b25e"/>
    <text x="70" y="52" font-family="Segoe UI, Tahoma, sans-serif" font-size="18" fill="#f0e2c6" font-weight="700">معاينة AI</text>
  </g>
  <text x="300" y="770" text-anchor="middle" font-family="Segoe UI, Tahoma, sans-serif" font-size="20" fill="#e9dcc0">${esc(model.name)} · ${esc(pose)}</text>
</svg>`;
}

export function svgDataUri(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// Deterministic accent colour from a string (used by the mock preview).
export function accentFrom(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const hues = ['#b98fb0', '#7fa8b9', '#c9a24a', '#9db98f', '#c98f8f', '#8f93c9'];
  return hues[h % hues.length];
}
