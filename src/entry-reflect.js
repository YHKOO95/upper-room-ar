import './styles.css';
import {
  PROMPTS,
  loadCardDraft,
  saveCardDraft,
  renderCardProgress,
  spawnDust,
} from './lib/shared.js';

const $ = (id) => document.getElementById(id);

spawnDust($('dust-reflect'), { density: 0.5, focal: 'top' });

let promptIdx = 0;
let promptTimer = null;

const card = loadCardDraft();

function updateReflectPlaceholder() {
  const ph = $('reflect-ph');
  if (ph && !$('reflect-text').value) {
    ph.textContent = `예: ${PROMPTS[promptIdx]}`;
  }
}

renderCardProgress($('cp-reflect'), 1);

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

$('btn-reflect-next')?.addEventListener('click', () => {
  clearInterval(promptTimer);
  saveCardDraft({
    ...loadCardDraft(),
    resolution: $('reflect-text').value.trim(),
  });
  window.location.href = 'engrave.html';
});

$('btn-reflect-skip')?.addEventListener('click', () => {
  clearInterval(promptTimer);
  saveCardDraft({
    ...loadCardDraft(),
    resolution: '',
  });
  window.location.href = 'engrave.html';
});
