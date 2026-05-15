import './styles.css';
import { targets } from './targets.js';
import { TARGET_TOTAL, stationGlyphSVG, spawnDust } from './lib/shared.js';

const $ = (id) => document.getElementById(id);

spawnDust($('dust-complete'), { density: 1.4, focal: 'top' });

const tot = String(TARGET_TOTAL).padStart(2, '0');
$('complete-pill').textContent = `${tot} / ${tot} · COMPLETE`;

const container = $('complete-glyphs');
container.innerHTML = '';
targets.forEach((t) => {
  const box = document.createElement('div');
  box.className = 'complete-glyph-box';
  box.innerHTML = stationGlyphSVG(t.glyph, 40, true);
  container.appendChild(box);
});

$('btn-make-card')?.addEventListener('click', () => {
  window.location.href = 'reflect.html';
});

$('btn-complete-reset')?.addEventListener('click', () => {
  try {
    localStorage.removeItem('upper-room-ar-found');
    sessionStorage.removeItem('upper-room-ar-card');
  } catch {}
  window.location.href = 'index.html';
});
