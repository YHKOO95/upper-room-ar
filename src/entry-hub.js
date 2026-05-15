import './styles.css';
import { targets } from './targets.js';
import {
  TARGET_TOTAL,
  loadFoundIndices,
  stationGlyphSVG,
  spawnDust,
} from './lib/shared.js';

const $ = (id) => document.getElementById(id);

spawnDust($('dust-hub'), { density: 0.6, focal: 'top' });

function renderHub() {
  const found = loadFoundIndices();
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
        window.location.href = `detail.html?target=${t.slug}`;
      } else {
        window.location.href = 'scan.html';
      }
    });
    list.appendChild(card);
  });
}

$('btn-hub-scan')?.addEventListener('click', () => {
  const found = loadFoundIndices();
  if (found.size >= TARGET_TOTAL) {
    window.location.href = 'complete.html';
  } else {
    window.location.href = 'scan.html';
  }
});

renderHub();
