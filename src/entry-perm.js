import './styles.css';
import { spawnDust } from './lib/shared.js';

const $ = (id) => document.getElementById(id);

spawnDust($('dust-perm'), { density: 0.55, focal: 'top' });

$('btn-perm-go')?.addEventListener('click', () => {
  window.location.href = 'hub.html';
});
$('btn-perm-skip')?.addEventListener('click', () => {
  window.location.href = 'hub.html';
});
