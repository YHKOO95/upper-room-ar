import './styles.css';
import {
  TARGET_TOTAL,
  SEAL_STAGE_FRAC,
  HOLD_MS,
  loadCardDraft,
  buildCommCard,
  renderCardProgress,
  spawnDust,
  getTodayStr,
} from './lib/shared.js';

const $ = (id) => document.getElementById(id);

spawnDust($('dust-seal'), { density: 0.6, focal: 'top' });

let sealSealed = false;
let sealProgress = 0;
let sealRaf = null;
let sealT0 = 0;
let sealSerial = '';

function setSealProgress(p) {
  sealProgress = p;
  const C = 276.46;
  $('seal-ring').style.strokeDashoffset = String(C * (1 - p));
  $('seal-ring').style.transition = p === 0 ? 'stroke-dashoffset 280ms ease' : 'none';

  const inner = $('seal-inner');
  inner.style.background = `radial-gradient(circle, rgba(245,194,107,${0.25 + p * 0.55}) 0%, rgba(245,194,107,0.05) 70%)`;
  inner.style.boxShadow = `0 0 ${20 + p * 40}px rgba(245,194,107,${0.3 + p * 0.4})`;

  const litCount = SEAL_STAGE_FRAC.filter((s) => p >= s).length;
  const items = document.querySelectorAll('#seal-card-wrap .card-glyph-item');
  items.forEach((item, i) => {
    item.classList.toggle('lit', i < litCount);
  });
  const glow = document.querySelector('#seal-card-wrap .card-center-glow');
  if (glow) glow.classList.toggle('sealed', litCount === TARGET_TOTAL);

  const wg = $('wg-seal');
  if (wg) wg.style.opacity = String(0.5 + p * 0.5);

  const scale = 0.62 + p * 0.04;
  const wrap = $('seal-card-wrap');
  wrap.style.marginBottom = `${Math.round(-460 * (1 - scale))}px`;
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
  btn.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      onStart();
    },
    { passive: false },
  );
  btn.addEventListener('touchend', onCancel);
  btn.addEventListener('touchcancel', onCancel);
}

async function onSealComplete() {
  const card = loadCardDraft();
  sealSealed = true;
  $('seal-inner').textContent = 'SEALED';
  $('seal-lbl').textContent = '03 · SEALED';

  const wrap = $('seal-card-wrap');
  wrap.style.transform = 'scale(0.66)';
  wrap.style.marginBottom = `${Math.round(-460 * (1 - 0.66))}px`;
  wrap.style.filter = 'drop-shadow(0 0 30px rgba(245,194,107,0.35))';

  const oldCard = wrap.querySelector('.comm-card');
  if (oldCard) oldCard.remove();
  const newCard = buildCommCard(card, { sealed: true, litCount: TARGET_TOTAL, serial: sealSerial });
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

// ── 초기화 ─────────────────────────────────────────────────────
sealSerial = `No. ${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')} / 2026`;

renderCardProgress($('cp-seal'), 3);

const card = loadCardDraft();
const wrap = $('seal-card-wrap');
wrap.innerHTML = '';
wrap.appendChild(buildCommCard(card, { sealed: false, litCount: 0 }));
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

bindSealButton();

$('btn-seal-back')?.addEventListener('click', () => {
  if (!sealSealed) window.location.href = 'engrave.html';
});

$('btn-seal-share')?.addEventListener('click', () => shareSealCard());

$('btn-seal-reset')?.addEventListener('click', () => {
  try {
    localStorage.removeItem('upper-room-ar-found');
    sessionStorage.removeItem('upper-room-ar-card');
  } catch {}
  window.location.href = 'index.html';
});
