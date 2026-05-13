import './styles.css';
import { XR8Promise } from '@8thwall/engine-binary';
import { targets } from './targets.js';

// ── Constants ──────────────────────────────────────────────────
const TARGET_TOTAL = targets.length;
const SEAL_STAGE_FRAC = Array.from(
  { length: TARGET_TOTAL },
  (_, i) => 0.22 + ((0.94 - 0.22) * i) / Math.max(1, TARGET_TOTAL - 1),
);
const STORAGE_KEY = 'upper-room-ar-found';
const HOLD_MS = 1500;
const PROMPTS = [
  '매일 아침, 창문을 열고 무릎을 꿇는다',
  '두려운 자리에서도 하나님을 선택한다',
  '기도를 시작하는 그 순간, 하늘이 움직인다',
  '지혜로운 자는 별처럼 영원토록 빛난다',
];

// ── DOM helpers ────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const scene = document.querySelector('#ar-scene');

// ── App state ──────────────────────────────────────────────────
let found = new Set(readFoundTargets());
let curIdx = null;
let card = { resolution: '', name: '', group: '' };
let promptIdx = 0;
let promptTimer = null;
let sealProgress = 0;
let sealSealed = false;
let sealRaf = null;
let sealT0 = 0;
let sealSerial = '';

// ── Boot ───────────────────────────────────────────────────────
initDust();
renderHub();
renderCompleteGlyphs();
bindButtons();
bindAREvents();
configureEightWallImageTargets();

window.addEventListener('resize', () => {
  if (scene?.classList?.contains('ar-active')) resizeARScene();
});
window.addEventListener('orientationchange', () => {
  window.setTimeout(() => {
    if (scene?.classList?.contains('ar-active')) resizeARScene();
  }, 400);
});

const returnScreen = sessionStorage.getItem('upper-room-ar-return');
if (returnScreen) {
  sessionStorage.removeItem('upper-room-ar-return');
  if (returnScreen === 'scanner') {
    startScanner();
  } else {
    showScreen(returnScreen);
  }
} else {
  showScreen('splash');
}

// ─────────────────────────────────────────────────────────────
// Screen management
// ─────────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const el = $(`s-${name}`);
  if (el) el.classList.add('active');

  const arActive = name === 'scanner' || name === 'revealed';
  scene.classList.toggle('ar-active', arActive);
}

// ─────────────────────────────────────────────────────────────
// Button bindings
// ─────────────────────────────────────────────────────────────
function bindButtons() {
  // Splash
  $('btn-start').addEventListener('click', () => showScreen('perm'));

  // Permission: 카메라는 첫 스캔 시 브라우저·8th Wall 플로우에서 요청됩니다.
  $('btn-perm-go').addEventListener('click', () => showScreen('hub'));
  $('btn-perm-skip').addEventListener('click', () => showScreen('hub'));

  // Hub
  $('btn-hub-scan').addEventListener('click', () => {
    if (found.size >= TARGET_TOTAL) {
      showScreen('complete');
    } else {
      startScanner();
    }
  });

  // Scanner back
  $('btn-scan-back').addEventListener('click', () => {
    showScreen('hub');
  });

  // Revealed close
  $('btn-reveal-close').addEventListener('click', () => {
    showScreen('hub');
  });

  // Complete
  $('btn-make-card').addEventListener('click', () => enterCardReflect());
  $('btn-complete-reset').addEventListener('click', () => {
    found.clear();
    saveFoundTargets();
    card = { resolution: '', name: '', group: '' };
    renderHub();
    showScreen('splash');
  });

  // Card Reflect
  $('btn-reflect-back').addEventListener('click', () => showScreen('complete'));
  $('btn-reflect-next').addEventListener('click', () => {
    card.resolution = $('reflect-text').value.trim();
    enterCardEngrave();
  });
  $('btn-reflect-skip').addEventListener('click', () => {
    card.resolution = '';
    enterCardEngrave();
  });

  const reflectTA = $('reflect-text');
  const reflectPh = $('reflect-ph');
  const reflectCnt = $('reflect-cnt');
  const btnReflectNext = $('btn-reflect-next');

  reflectTA.addEventListener('input', () => {
    const len = reflectTA.value.length;
    reflectPh.style.display = len > 0 ? 'none' : '';
    reflectCnt.textContent = `${len}/40`;
    reflectCnt.classList.toggle('near', len >= 36);
    btnReflectNext.classList.toggle('glow', len > 0);
  });

  // Card Engrave
  $('btn-engrave-back').addEventListener('click', () => showScreen('reflect'));
  $('btn-engrave-next').addEventListener('click', () => {
    card.name = $('engrave-name').value.trim();
    card.group = $('engrave-group').value.trim();
    enterCardSeal();
  });

  const engraveName = $('engrave-name');
  const engraveGroup = $('engrave-group');
  const btnEngraveNext = $('btn-engrave-next');

  const updateEngravePreview = () => {
    card.name = engraveName.value;
    card.group = engraveGroup.value;
    const wrap = $('engrave-preview');
    wrap.innerHTML = '';
    wrap.appendChild(buildCommCard({ sealed: false }));
    btnEngraveNext.classList.toggle('glow', engraveName.value.trim().length > 0);
  };
  engraveName.addEventListener('input', updateEngravePreview);
  engraveGroup.addEventListener('input', updateEngravePreview);

  // Card Seal
  $('btn-seal-back').addEventListener('click', () => {
    if (!sealSealed) showScreen('engrave');
  });
  $('btn-seal-reset').addEventListener('click', () => {
    found.clear();
    saveFoundTargets();
    card = { resolution: '', name: '', group: '' };
    renderHub();
    showScreen('splash');
  });
  $('btn-seal-share').addEventListener('click', () => shareSealCard());

  bindSealButton();
}

// ─────────────────────────────────────────────────────────────
// AR / 8th Wall
// ─────────────────────────────────────────────────────────────
async function configureEightWallImageTargets() {
  const load = async () => {
    try {
      const XR8 = await XR8Promise;
      const base = import.meta.env.BASE_URL ?? './';
      const jsonData = await Promise.all(
        targets.map((t) =>
          fetch(`${base}image-targets/${t.imageTargetName}.json`).then((r) => {
            if (!r.ok) throw new Error(`${t.imageTargetName}: ${r.status}`);
            return r.json();
          }),
        ),
      );
      XR8.XrController.configure({ imageTargetData: jsonData });
    } catch (e) {
      console.error('[8th Wall] image target configure failed', e);
    }
  };
  if (window.XR8) void load();
  else window.addEventListener('xrloaded', () => void load(), { once: true });
}

function resizeARScene() {
  if (scene?.resize) scene.resize();
}

function bindAREvents() {
  targets.forEach((t) => {
    const entity = document.querySelector(`[data-target-index="${t.index}"]`);
    if (!entity) return;

    entity.addEventListener('xrextrasfound', () => {
      if (!found.has(t.index)) {
        found.add(t.index);
        saveFoundTargets();
        renderHub();
      }
      curIdx = t.index;
      showRevealedOverlay(t);
      navigator.vibrate?.(80);
    });

    entity.addEventListener('xrextraslost', () => {
      if (document.getElementById('s-revealed')?.classList.contains('active')) {
        showScreen('scanner');
      }
    });

    entity.querySelectorAll('.clickable').forEach((el) => {
      el.addEventListener('click', () => {
        sessionStorage.setItem('upper-room-ar-return', 'scanner');
        window.location.href = `detail.html?target=${t.slug}`;
      });
    });
  });
}

function startScanner() {
  const statusPill = $('scan-status-text');
  const vf = $('viewfinder');
  statusPill.textContent = '표식을 찾는 중…';
  statusPill.classList.remove('locked');
  vf.classList.remove('locked');

  showScreen('scanner');
  requestAnimationFrame(() => {
    resizeARScene();
    requestAnimationFrame(resizeARScene);
  });

  const run = () => {
    resizeARScene();
    requestAnimationFrame(() => requestAnimationFrame(resizeARScene));
  };

  if (scene.hasLoaded) run();
  else scene.addEventListener('loaded', () => run(), { once: true });
}

function showRevealedOverlay(target) {
  $('reveal-num-pill').textContent = `${target.num} · DISCOVERED`;

  const statusPill = $('scan-status-text');
  statusPill.textContent = '발견!';
  statusPill.classList.add('locked');
  $('viewfinder').classList.add('locked');

  $('reveal-card').innerHTML = `
    <div class="reveal-title-row">
      <span class="reveal-title">${target.title}</span>
      <span class="reveal-en">${target.en}</span>
    </div>
    <p class="reveal-detail">${target.detail}</p>
    <div class="reveal-footer">
      <span class="reveal-verse-ref">${target.verseRef.toUpperCase()}</span>
      <button class="reveal-detail-btn" onclick="sessionStorage.setItem('upper-room-ar-return','scanner');location.href='detail.html?target=${target.slug}'">자세히 →</button>
    </div>
  `;
  showScreen('revealed');
}

// ─────────────────────────────────────────────────────────────
// Hub rendering
// ─────────────────────────────────────────────────────────────
function renderHub() {
  const count = found.size;
  const tot = String(TARGET_TOTAL).padStart(2, '0');
  $('hub-count').textContent = `${String(count).padStart(2, '0')} / ${tot}`;
  $('hub-fill').style.width = `${(count / TARGET_TOTAL) * 100}%`;

  const btnScan = $('btn-hub-scan');
  btnScan.textContent = count >= TARGET_TOTAL ? '다락방의 빛 보기 →' : '카메라로 찾기';

  const list = $('hub-list');
  list.innerHTML = '';
  targets.forEach((t) => {
    const isFound = found.has(t.index);
    const card = document.createElement('div');
    card.className = `hub-card${isFound ? ' found' : ''}`;
    card.innerHTML = `
      <div class="hub-card-icon">${stationGlyphSVG(t.glyph, 36, isFound)}</div>
      <div class="hub-card-body">
        <div class="hub-card-top">
          <span class="hub-card-num">${t.num}</span>
          <span class="hub-card-title">${t.title}</span>
          <span class="hub-card-en">${t.en}</span>
        </div>
        <p class="hub-card-sub">${isFound ? `발견됨 · ${t.verseRef}` : `힌트 · ${t.hint}`}</p>
      </div>
      <div class="hub-card-arrow">${isFound ? '✓' : '→'}</div>
    `;
    card.addEventListener('click', () => {
      if (isFound) {
        sessionStorage.setItem('upper-room-ar-return', 'hub');
        window.location.href = `detail.html?target=${t.slug}`;
      } else {
        startScanner();
      }
    });
    list.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────
// Complete screen glyphs
// ─────────────────────────────────────────────────────────────
function renderCompleteGlyphs() {
  const container = $('complete-glyphs');
  container.innerHTML = '';
  targets.forEach((t) => {
    const box = document.createElement('div');
    box.className = 'complete-glyph-box';
    box.innerHTML = stationGlyphSVG(t.glyph, 40, true);
    container.appendChild(box);
  });
}

// ─────────────────────────────────────────────────────────────
// Card flow: Reflect
// ─────────────────────────────────────────────────────────────
function enterCardReflect() {
  renderCardProgress('cp-reflect', 1);

  const ta = $('reflect-text');
  ta.value = card.resolution;
  $('reflect-ph').style.display = card.resolution ? 'none' : '';
  $('reflect-cnt').textContent = `${card.resolution.length}/40`;
  $('btn-reflect-next').classList.toggle('glow', card.resolution.length > 0);

  clearInterval(promptTimer);
  promptIdx = 0;
  updateReflectPlaceholder();
  promptTimer = setInterval(() => {
    promptIdx = (promptIdx + 1) % PROMPTS.length;
    updateReflectPlaceholder();
  }, 2800);

  showScreen('reflect');
}

function updateReflectPlaceholder() {
  const ph = $('reflect-ph');
  if (ph && !$('reflect-text').value) {
    ph.textContent = `예: ${PROMPTS[promptIdx]}`;
  }
}

// ─────────────────────────────────────────────────────────────
// Card flow: Engrave
// ─────────────────────────────────────────────────────────────
function enterCardEngrave() {
  clearInterval(promptTimer);
  renderCardProgress('cp-engrave', 2);

  $('engrave-name').value = card.name;
  $('engrave-group').value = card.group;
  $('btn-engrave-next').classList.toggle('glow', card.name.length > 0);

  const wrap = $('engrave-preview');
  wrap.innerHTML = '';
  wrap.appendChild(buildCommCard({ sealed: false }));

  showScreen('engrave');
}

// ─────────────────────────────────────────────────────────────
// Card flow: Seal
// ─────────────────────────────────────────────────────────────
function enterCardSeal() {
  sealSealed = false;
  sealProgress = 0;
  sealSerial = `No. ${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')} / 2026`;

  renderCardProgress('cp-seal', 3);

  const wrap = $('seal-card-wrap');
  wrap.innerHTML = '';
  wrap.appendChild(buildCommCard({ sealed: false, litCount: 0 }));
  wrap.style.transform = 'scale(0.62)';
  wrap.style.marginBottom = '-175px';
  wrap.style.filter = 'none';

  $('seal-lbl').textContent = '03 · SEAL';
  $('seal-inner').textContent = 'HOLD';
  $('seal-hint').style.display = '';
  $('seal-btn-area').style.display = '';
  $('seal-done').style.display = 'none';
  $('seal-toast').classList.remove('visible');
  setSealProgress(0);

  showScreen('seal');
}

function bindSealButton() {
  const btn = $('seal-btn');

  const onStart = () => {
    if (sealSealed) return;
    sealT0 = performance.now() - sealProgress * HOLD_MS;
    sealRaf = requestAnimationFrame(sealTick);
  };
  const onCancel = () => {
    if (sealSealed) return;
    cancelAnimationFrame(sealRaf);
    sealRaf = null;
    setSealProgress(0);
  };

  btn.addEventListener('mousedown', onStart);
  btn.addEventListener('mouseup', onCancel);
  btn.addEventListener('mouseleave', onCancel);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(); }, { passive: false });
  btn.addEventListener('touchend', onCancel);
  btn.addEventListener('touchcancel', onCancel);
}

function sealTick(now) {
  const elapsed = now - sealT0;
  const p = Math.min(1, elapsed / HOLD_MS);
  setSealProgress(p);
  if (p >= 1) {
    sealRaf = null;
    onSealComplete();
  } else {
    sealRaf = requestAnimationFrame(sealTick);
  }
}

function setSealProgress(p) {
  sealProgress = p;
  const C = 276.46;
  $('seal-ring').style.strokeDashoffset = String(C * (1 - p));
  $('seal-ring').style.transition = p === 0 ? 'stroke-dashoffset 280ms ease' : 'none';

  const inner = $('seal-inner');
  inner.style.background = `radial-gradient(circle, rgba(245,194,107,${0.25 + p * 0.55}) 0%, rgba(245,194,107,0.05) 70%)`;
  inner.style.boxShadow = `0 0 ${20 + p * 40}px rgba(245,194,107,${0.3 + p * 0.4})`;

  // light up glyphs progressively
  const litCount = SEAL_STAGE_FRAC.filter((s) => p >= s).length;
  updateSealCard(litCount);

  // glow intensity on window element
  const wg = $('wg-seal');
  if (wg) wg.style.opacity = String(0.5 + p * 0.5);

  // sync negative margin with interpolated scale (0.62 → 0.66 at p=1)
  const scale = 0.62 + p * 0.04;
  const wrap = $('seal-card-wrap');
  wrap.style.marginBottom = `${Math.round(-460 * (1 - scale))}px`;
}

function updateSealCard(litCount) {
  const items = document.querySelectorAll('#seal-card-wrap .card-glyph-item');
  items.forEach((item, i) => {
    item.classList.toggle('lit', i < litCount);
  });
  const glow = document.querySelector('#seal-card-wrap .card-center-glow');
  if (glow) glow.classList.toggle('sealed', litCount === TARGET_TOTAL);
}

async function onSealComplete() {
  sealSealed = true;
  $('seal-inner').textContent = 'SEALED';
  $('seal-lbl').textContent = '03 · SEALED';

  const wrap = $('seal-card-wrap');
  wrap.style.transform = 'scale(0.66)';
  wrap.style.marginBottom = `${Math.round(-460 * (1 - 0.66))}px`;
  wrap.style.filter = 'drop-shadow(0 0 30px rgba(245,194,107,0.35))';

  // Update card to fully sealed state
  const oldCard = wrap.querySelector('.comm-card');
  if (oldCard) oldCard.remove();
  const newCard = buildCommCard({ sealed: true, litCount: TARGET_TOTAL, serial: sealSerial });
  wrap.appendChild(newCard);

  $('seal-hint').style.display = 'none';
  $('seal-btn-area').style.display = 'none';
  $('seal-done').style.display = 'flex';

  if (navigator.share) {
    $('btn-seal-share').style.display = 'block';
  }

  await new Promise((r) => setTimeout(r, 800));
  await captureAndSave(newCard);
}

async function captureAndSave(cardEl) {
  if (!cardEl || !window.htmlToImage) {
    showToast();
    return;
  }
  try {
    const today = getTodayStr();
    const dataUrl = await window.htmlToImage.toPng(cardEl, {
      pixelRatio: 3,
      backgroundColor: '#000',
      cacheBust: true,
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `upper-room-${today.replace(/\./g, '')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    console.warn('capture failed', e);
  }
  showToast();
}

async function shareSealCard() {
  if (!navigator.share) return;
  const cardEl = document.querySelector('#seal-card-wrap .comm-card');
  if (!cardEl || !window.htmlToImage) return;
  try {
    const dataUrl = await window.htmlToImage.toPng(cardEl, { pixelRatio: 3, backgroundColor: '#000' });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'upper-room.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Upper Room', text: '다락방의 빛이 모였습니다.' });
    } else {
      await navigator.share({ title: 'Upper Room', text: '다락방의 빛이 모였습니다.' });
    }
  } catch {}
}

function showToast() {
  const toast = $('seal-toast');
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ─────────────────────────────────────────────────────────────
// Commemorative card builder
// ─────────────────────────────────────────────────────────────
function buildCommCard({ sealed = false, litCount = TARGET_TOTAL, serial = '' } = {}) {
  const today = getTodayStr();
  const resolution = card.resolution;
  const name = card.name;
  const group = card.group;

  const el = document.createElement('div');
  el.className = 'comm-card';

  // star bg
  const starBg = document.createElement('div');
  starBg.className = 'card-star-bg';
  spawnDust(starBg, { density: 0.45, focal: 'top', dim: false });
  el.appendChild(starBg);

  // corner ticks
  ['tl', 'tr', 'br', 'bl'].forEach((pos) => {
    const c = document.createElement('div');
    c.className = `card-corner card-corner-${pos}`;
    el.appendChild(c);
  });

  // top label
  el.insertAdjacentHTML('beforeend', `
    <div class="card-top-lbl">2026 · ONNURI JOSHUA · VISANG</div>
    <div class="card-title-block">
      <div class="card-title-main">UPPER ROOM</div>
      <div class="card-title-sub">다락방의 빛이 모였습니다</div>
    </div>
    <div class="card-center-glow${sealed ? ' sealed' : ''}"></div>
  `);

  // glyphs
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

  // verse / resolution area
  const divider = document.createElement('div');
  divider.className = 'card-divider';
  divider.innerHTML = `<div class="card-divider-line"></div>`;

  if (resolution) {
    divider.insertAdjacentHTML('beforeend', `
      <div class="card-verse-area">
        <div class="card-res-label">MY RESOLUTION</div>
        <div class="card-res-text">"${resolution}"</div>
        <div class="card-daniel-ref">DANIEL 9:23</div>
      </div>
    `);
  } else {
    divider.insertAdjacentHTML('beforeend', `
      <div class="card-verse-area">
        <div class="card-verse-text">"네 자리에서 켜진 빛이<br>다락방에 모였습니다"</div>
        <div class="card-verse-ref-lbl">DANIEL 9:23</div>
      </div>
    `);
  }
  el.appendChild(divider);

  // signature
  el.insertAdjacentHTML('beforeend', `
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

// ─────────────────────────────────────────────────────────────
// Card progress dots
// ─────────────────────────────────────────────────────────────
function renderCardProgress(containerId, activeStep) {
  const el = $(containerId);
  el.innerHTML = '';
  [1, 2, 3].forEach((n, i) => {
    const dot = document.createElement('div');
    dot.className = `cp-dot${n < activeStep ? ' done' : n === activeStep ? ' active' : ''}`;
    dot.textContent = n < activeStep ? '✓' : String(n);
    el.appendChild(dot);
    if (i < 2) {
      const line = document.createElement('div');
      line.className = `cp-line${n < activeStep ? ' done' : ''}`;
      el.appendChild(line);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Station glyph SVGs
// ─────────────────────────────────────────────────────────────
function stationGlyphSVG(kind, size = 64, glow = false) {
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
    default:
      return `<svg ${common}><circle cx="32" cy="32" r="16" stroke="${w}" stroke-width="1.2"/></svg>`;
  }
}

// ─────────────────────────────────────────────────────────────
// StarDust particles
// ─────────────────────────────────────────────────────────────
function initDust() {
  spawnDust($('dust-perm'), { density: 0.55, focal: 'top' });
  spawnDust($('dust-hub'), { density: 0.6, focal: 'top' });
  spawnDust($('dust-complete'), { density: 1.4, focal: 'top' });
  spawnDust($('dust-reflect'), { density: 0.5, focal: 'top' });
  spawnDust($('dust-engrave'), { density: 0.35, focal: 'top' });
  spawnDust($('dust-seal'), { density: 0.6, focal: 'top' });
}

function spawnDust(container, { density = 1, focal = 'top' } = {}) {
  if (!container) return;
  let s = 9301;
  const rng = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const count = Math.round(220 * density);
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const r1 = rng(), r2 = rng(), r3 = rng(), r4 = rng();
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

// ─────────────────────────────────────────────────────────────
// Persistence helpers
// ─────────────────────────────────────────────────────────────
function readFoundTargets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    const valid = new Set(targets.map((t) => t.index));
    return arr.filter((i) => valid.has(i));
  } catch {
    return [];
  }
}

function saveFoundTargets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...found]));
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

