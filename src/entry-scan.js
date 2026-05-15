import './styles.css';
import { XR8Promise } from '@8thwall/engine-binary';
import { targets, imageTargetNamesForStation } from './targets.js';
import { loadFoundIndices, saveFoundIndices } from './lib/shared.js';

const $ = (id) => document.getElementById(id);
const scene = document.querySelector('#ar-scene');

let found = loadFoundIndices();
let curIdx = null;

function showScanLayer(mode) {
  const scan = $('s-scanner');
  const rev = $('s-revealed');
  if (mode === 'revealed') {
    scan.classList.remove('active');
    rev.classList.add('active');
  } else {
    rev.classList.remove('active');
    scan.classList.add('active');
  }
}

async function configureEightWallImageTargets() {
  const load = async () => {
    try {
      const XR8 = await XR8Promise;
      const base = import.meta.env.BASE_URL ?? './';
      const names = targets.flatMap((t) => imageTargetNamesForStation(t.stationNum));
      const jsonData = await Promise.all(
        names.map((name) =>
          fetch(`${base}image-targets/${name}.json`).then((r) => {
            if (!r.ok) throw new Error(`${name}: ${r.status}`);
            return r.json();
          }),
        ),
      );
      for (const d of jsonData) {
        if (d.imagePath && typeof d.imagePath === 'string' && !/^https?:\/\//i.test(d.imagePath)) {
          d.imagePath = new URL(d.imagePath, window.location.href).href;
        }
      }
      XR8.XrController.configure({ imageTargetData: jsonData });
      console.info('[8th Wall] imageTargetData:', jsonData.length, jsonData.map((x) => x.name).join(', '));

      if (new URLSearchParams(window.location.search).has('ardebug')) {
        scene?.addEventListener('xrimagefound', (e) =>
          console.info('[AR] xrimagefound', e.detail?.name, e.detail),
        );
        scene?.addEventListener('xrimagelost', (e) => console.info('[AR] xrimagelost', e.detail?.name));
      }
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
    const entities = document.querySelectorAll(`[data-target-index="${t.index}"]`);
    if (!entities.length) return;

    entities.forEach((entity) => {
      entity.addEventListener('xrextrasfound', () => {
        if (!found.has(t.index)) {
          found.add(t.index);
          saveFoundIndices(found);
        }
        curIdx = t.index;
        showRevealedOverlay(t);
        navigator.vibrate?.(80);
      });

      entity.addEventListener('xrextraslost', () => {
        if (document.getElementById('s-revealed')?.classList.contains('active')) {
          showScannerChrome();
        }
      });

      entity.querySelectorAll('.clickable').forEach((el) => {
        el.addEventListener('click', () => {
          window.location.href = `detail.html?target=${t.slug}`;
        });
      });
    });
  });
}

function showScannerChrome() {
  const statusPill = $('scan-status-text');
  const vf = $('viewfinder');
  statusPill.textContent = '표식을 찾는 중…';
  statusPill.classList.remove('locked');
  vf.classList.remove('locked');
  showScanLayer('scanner');
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
      <button type="button" class="reveal-detail-btn" id="btn-reveal-detail-inline">자세히 →</button>
    </div>
  `;
  $('btn-reveal-detail-inline')?.addEventListener('click', () => {
    window.location.href = `detail.html?target=${target.slug}`;
  });
  showScanLayer('revealed');
}

function bootScannerUi() {
  showScannerChrome();
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

configureEightWallImageTargets();
bindAREvents();
bootScannerUi();

$('btn-scan-back')?.addEventListener('click', () => {
  window.location.href = 'hub.html';
});

$('btn-reveal-close')?.addEventListener('click', () => {
  window.location.href = 'hub.html';
});

$('btn-reveal-expand')?.addEventListener('click', () => {
  if (curIdx == null) return;
  const t = targets.find((x) => x.index === curIdx);
  if (!t) return;
  window.location.href = `detail.html?target=${t.slug}`;
});

window.addEventListener('resize', () => resizeARScene());
window.addEventListener('orientationchange', () => {
  window.setTimeout(() => resizeARScene(), 400);
});
