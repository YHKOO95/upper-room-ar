import { targets } from '../targets.js';

export const TARGET_TOTAL = targets.length;
export const SEAL_STAGE_FRAC = Array.from(
  { length: TARGET_TOTAL },
  (_, i) => 0.22 + ((0.94 - 0.22) * i) / Math.max(1, TARGET_TOTAL - 1),
);
export const STORAGE_KEY = 'upper-room-ar-found';
export const CARD_SESSION_KEY = 'upper-room-ar-card';
export const HOLD_MS = 1500;
export const PROMPTS = [
  '매일 아침, 창문을 열고 무릎을 꿇는다',
  '두려운 자리에서도 하나님을 선택한다',
  '기도를 시작하는 그 순간, 하늘이 움직인다',
  '지혜로운 자는 별처럼 영원토록 빛난다',
];

export function loadFoundIndices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return new Set();
    const valid = new Set(targets.map((t) => t.index));
    return new Set(arr.filter((i) => valid.has(i)));
  } catch {
    return new Set();
  }
}

export function saveFoundIndices(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function loadCardDraft() {
  try {
    const raw = sessionStorage.getItem(CARD_SESSION_KEY);
    if (!raw) return { resolution: '', name: '', group: '' };
    const o = JSON.parse(raw);
    return {
      resolution: typeof o.resolution === 'string' ? o.resolution : '',
      name: typeof o.name === 'string' ? o.name : '',
      group: typeof o.group === 'string' ? o.group : '',
    };
  } catch {
    return { resolution: '', name: '', group: '' };
  }
}

export function saveCardDraft(card) {
  sessionStorage.setItem(CARD_SESSION_KEY, JSON.stringify(card));
}

export function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function stationGlyphSVG(kind, size = 64, glow = false) {
  const w = glow ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)';
  const c = '#F5C26B';
  const s = size;
  const common = `width="${s}" height="${s}" viewBox="0 0 64 64" fill="none"`;
  switch (kind) {
    case 'window':
      return `<svg ${common}>
        <rect x="12" y="14" width="40" height="36" rx="2" stroke="${w}" stroke-width="1.2" fill="rgba(255,255,255,0.04)"/>
        <line x1="32" y1="14" x2="32" y2="50" stroke="${w}" stroke-width="0.8"/>
        <line x1="12" y1="32" x2="52" y2="32" stroke="${w}" stroke-width="0.8"/>
        ${glow ? `<rect x="13" y="15" width="18" height="16" fill="${c}" opacity="0.18"/><rect x="33" y="15" width="18" height="16" fill="${c}" opacity="0.18"/><rect x="13" y="33" width="18" height="16" fill="${c}" opacity="0.10"/><rect x="33" y="33" width="18" height="16" fill="${c}" opacity="0.10"/>` : ''}
        <line x1="8" y1="50" x2="56" y2="50" stroke="${w}" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
    case 'book':
      return `<svg ${common}>
        <path d="M16 10 Q14 10 14 12 L14 52 Q14 54 16 54 L48 54 Q50 54 50 52 L50 12 Q50 10 48 10 Z" stroke="${w}" stroke-width="1.2" fill="rgba(255,255,255,0.04)"/>
        <line x1="24" y1="10" x2="24" y2="54" stroke="${w}" stroke-width="0.8"/>
        <line x1="30" y1="22" x2="44" y2="22" stroke="${w}" stroke-width="0.7" stroke-opacity="0.6"/>
        <line x1="30" y1="29" x2="44" y2="29" stroke="${w}" stroke-width="0.7" stroke-opacity="0.6"/>
        <line x1="30" y1="36" x2="44" y2="36" stroke="${w}" stroke-width="0.7" stroke-opacity="0.6"/>
        ${glow ? `<line x1="37" y1="16" x2="37" y2="42" stroke="${c}" stroke-width="1.4" opacity="0.7"/><line x1="30" y1="28" x2="44" y2="28" stroke="${c}" stroke-width="1.4" opacity="0.7"/>` : ''}
      </svg>`;
    case 'star':
      return `<svg ${common}>
        <polygon points="32,9 36.4,22.2 50.5,22.2 39.5,30.3 43.5,43.5 32,35.7 20.5,43.5 24.5,30.3 13.5,22.2 27.6,22.2" stroke="${w}" stroke-width="1.2" fill="${glow ? `rgba(245,194,107,0.25)` : 'rgba(255,255,255,0.05)'}"/>
        ${glow ? `<polygon points="32,9 36.4,22.2 50.5,22.2 39.5,30.3 43.5,43.5 32,35.7 20.5,43.5 24.5,30.3 13.5,22.2 27.6,22.2" fill="${c}" style="filter:blur(7px);opacity:0.28"/>` : ''}
        <circle cx="13" cy="18" r="1.4" fill="${w}" opacity="${glow ? 0.9 : 0.4}"/>
        <circle cx="51" cy="14" r="1" fill="${w}" opacity="${glow ? 0.8 : 0.35}"/>
        <circle cx="9" cy="46" r="1" fill="${w}" opacity="${glow ? 0.7 : 0.3}"/>
        <circle cx="53" cy="50" r="1.4" fill="${w}" opacity="${glow ? 0.8 : 0.4}"/>
      </svg>`;
    case 'lamp':
      return `<svg ${common}>
        <line x1="32" y1="10" x2="32" y2="22" stroke="${w}" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M20 22 L44 22 L39 46 L25 46 Z" stroke="${w}" stroke-width="1.2" fill="${glow ? `rgba(245,194,107,0.2)` : 'rgba(255,255,255,0.05)'}"/>
        ${glow ? `<ellipse cx="32" cy="24" rx="13" ry="3.5" fill="${c}" opacity="0.22" style="filter:blur(4px)"/>` : ''}
        <line x1="25" y1="46" x2="39" y2="46" stroke="${w}" stroke-width="1"/>
        <circle cx="32" cy="25" r="${glow ? 3.5 : 2.5}" fill="${glow ? c : 'rgba(255,255,255,0.3)'}" stroke="${w}" stroke-width="0.6"/>
      </svg>`;
    case 'flag':
      return `<svg ${common}>
        <line x1="20" y1="12" x2="20" y2="52" stroke="${w}" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="20" cy="12" r="3.2" fill="${glow ? c : 'rgba(255,255,255,0.15)'}" stroke="${w}" stroke-width="0.8"/>
        <path d="M22 18 L22 40 L48 29 Z" stroke="${w}" stroke-width="1.1" fill="${glow ? 'rgba(185,28,28,0.35)' : 'rgba(255,255,255,0.06)'}"/>
        ${glow ? `<path d="M23 20 L23 36 L42 28 Z" fill="${c}" opacity="0.25"/>` : ''}
      </svg>`;
    default:
      return `<svg ${common}><circle cx="32" cy="32" r="16" stroke="${w}" stroke-width="1.2"/></svg>`;
  }
}

export function spawnDust(container, { density = 1, focal = 'top' } = {}) {
  if (!container) return;
  let s = 9301;
  const rng = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const count = Math.round(220 * density);
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const r1 = rng(),
      r2 = rng(),
      r3 = rng(),
      r4 = rng();
    const xBias = focal === 'top' ? 0.5 + (r1 - 0.5) * (0.4 + r2 * 0.9) : r1;
    const yBias = focal === 'top' ? r2 * r2 * 0.85 + 0.05 : r2;
    const sz = 0.4 + r3 * r3 * 3.2;

    const dot = document.createElement('div');
    dot.className = 'star-dot';
    dot.style.cssText = [
      `left:${xBias * 100}%`,
      `top:${yBias * 100}%`,
      `width:${sz}px`,
      `height:${sz}px`,
      `opacity:${0.15 + r4 * 0.85}`,
      r3 > 0.93 ? `animation:twinkle ${2 + (i % 5) * 0.4}s ease-in-out ${(i % 10) * 0.1}s infinite` : '',
    ].join(';');
    frag.appendChild(dot);
  }
  container.appendChild(frag);
}

export function renderCardProgress(containerEl, activeStep) {
  if (!containerEl) return;
  containerEl.innerHTML = '';
  [1, 2, 3].forEach((n, i) => {
    const dot = document.createElement('div');
    dot.className = `cp-dot${n < activeStep ? ' done' : n === activeStep ? ' active' : ''}`;
    dot.textContent = n < activeStep ? '✓' : String(n);
    containerEl.appendChild(dot);
    if (i < 2) {
      const line = document.createElement('div');
      line.className = `cp-line${n < activeStep ? ' done' : ''}`;
      containerEl.appendChild(line);
    }
  });
}

/** @param {import('../targets.js').targets[number]} t */
export function buildCommCard(cardData, { sealed = false, litCount = TARGET_TOTAL, serial = '' } = {}) {
  const today = getTodayStr();
  const resolution = cardData.resolution ?? '';
  const name = cardData.name ?? '';
  const group = cardData.group ?? '';

  const el = document.createElement('div');
  el.className = 'comm-card';

  const starBg = document.createElement('div');
  starBg.className = 'card-star-bg';
  spawnDust(starBg, { density: 0.45, focal: 'top' });
  el.appendChild(starBg);

  ['tl', 'tr', 'br', 'bl'].forEach((pos) => {
    const c = document.createElement('div');
    c.className = `card-corner card-corner-${pos}`;
    el.appendChild(c);
  });

  el.insertAdjacentHTML(
    'beforeend',
    `
    <div class="card-top-lbl">2026 · ONNURI JOSHUA · VISANG</div>
    <div class="card-title-block">
      <div class="card-title-main">UPPER ROOM</div>
      <div class="card-title-sub">다락방의 빛이 모였습니다</div>
    </div>
    <div class="card-center-glow${sealed ? ' sealed' : ''}"></div>
  `,
  );

  const glyphsRow = document.createElement('div');
  glyphsRow.className = 'card-glyphs-row';
  targets.forEach((t, i) => {
    const lit = i < litCount;
    const item = document.createElement('div');
    item.className = `card-glyph-item${lit ? ' lit' : ''}`;
    item.innerHTML = `
      <div class="card-glyph-box">${stationGlyphSVG(t.glyph, 28, lit)}</div>
      <div class="card-glyph-num">${t.num}</div>
      <div class="card-glyph-name">${t.title}</div>
    `;
    glyphsRow.appendChild(item);
  });
  el.appendChild(glyphsRow);

  const divider = document.createElement('div');
  divider.className = 'card-divider';
  divider.innerHTML = `<div class="card-divider-line"></div>`;

  if (resolution) {
    divider.insertAdjacentHTML(
      'beforeend',
      `
      <div class="card-verse-area">
        <div class="card-res-label">MY RESOLUTION</div>
        <div class="card-res-text">"${resolution}"</div>
        <div class="card-daniel-ref">DANIEL 9:23</div>
      </div>
    `,
    );
  } else {
    divider.insertAdjacentHTML(
      'beforeend',
      `
      <div class="card-verse-area">
        <div class="card-verse-text">"네 자리에서 켜진 빛이<br>다락방에 모였습니다"</div>
        <div class="card-verse-ref-lbl">DANIEL 9:23</div>
      </div>
    `,
    );
  }
  el.appendChild(divider);

  el.insertAdjacentHTML(
    'beforeend',
    `
    <div class="card-sig">
      <div>
        <div class="card-sig-lbl">PILGRIM</div>
        <div class="card-sig-name${name ? ' filled' : ''}">${name || '익명의 순례자'}</div>
        ${group ? `<div class="card-sig-group">${group}</div>` : ''}
      </div>
      <div style="text-align:right">
        ${serial ? `<div class="card-sig-serial">${serial}</div>` : ''}
        <div class="card-sig-lbl">DATE</div>
        <div class="card-sig-date">${today}</div>
      </div>
    </div>
  `);

  return el;
}
