import './styles.css';
import {
  loadCardDraft,
  saveCardDraft,
  buildCommCard,
  renderCardProgress,
  spawnDust,
} from './lib/shared.js';

const $ = (id) => document.getElementById(id);

spawnDust($('dust-engrave'), { density: 0.35, focal: 'top' });

renderCardProgress($('cp-engrave'), 2);

let card = loadCardDraft();

$('engrave-name').value = card.name;
$('engrave-group').value = card.group;
$('btn-engrave-next').classList.toggle('glow', card.name.length > 0);

const wrap = $('engrave-preview');
wrap.innerHTML = '';
wrap.appendChild(buildCommCard(card, { sealed: false }));

const engraveName = $('engrave-name');
const engraveGroup = $('engrave-group');
const btnEngraveNext = $('btn-engrave-next');

const updateEngravePreview = () => {
  card = {
    ...loadCardDraft(),
    name: engraveName.value,
    group: engraveGroup.value,
  };
  saveCardDraft(card);
  wrap.innerHTML = '';
  wrap.appendChild(buildCommCard(card, { sealed: false }));
  btnEngraveNext.classList.toggle('glow', engraveName.value.trim().length > 0);
};

engraveName.addEventListener('input', updateEngravePreview);
engraveGroup.addEventListener('input', updateEngravePreview);

$('btn-engrave-next')?.addEventListener('click', () => {
  saveCardDraft({
    ...loadCardDraft(),
    name: engraveName.value.trim(),
    group: engraveGroup.value.trim(),
  });
  window.location.href = 'seal.html';
});
