import './styles.css';
import { targets } from './targets.js';

const storageKey = 'upper-room-ar-found-targets';
const scene = document.querySelector('#ar-scene');
const startButton = document.querySelector('#start-button');
const foundCount = document.querySelector('#found-count');
const targetMessage = document.querySelector('#target-message');
const discovered = new Set(readFoundTargets());

let messageTimer;

syncProgress();
bindTargetEvents();
bindStartButton();

function bindStartButton() {
  startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    startButton.textContent = '카메라 준비 중...';

    try {
      await scene.systems['mindar-image-system'].start();
      document.body.classList.add('is-ar-running');
      startButton.classList.add('is-hidden');
    } catch (error) {
      console.error(error);
      startButton.disabled = false;
      startButton.textContent = 'AR 다시 시작하기';
      showMessage('카메라 권한 또는 이미지 타겟 파일을 확인해주세요.');
    }
  });
}

function bindTargetEvents() {
  targets.forEach((target) => {
    const entity = document.querySelector(`[data-target-index="${target.index}"]`);

    entity.addEventListener('targetFound', () => {
      if (!discovered.has(target.index)) {
        discovered.add(target.index);
        saveFoundTargets();
        syncProgress();
      }

      showMessage(`${target.title}: ${target.message} 오브제를 누르면 자세히 볼 수 있어요.`);
      navigator.vibrate?.(80);
    });

    entity.querySelectorAll('.clickable').forEach((clickableObject) => {
      clickableObject.addEventListener('click', () => {
        window.location.href = `/detail.html?target=${target.slug}`;
      });
    });

    entity.addEventListener('click', () => {
      window.location.href = `/detail.html?target=${target.slug}`;
    });

    entity.addEventListener('targetLost', () => {
      showMessage('좋아요. 다른 숨겨진 오브제를 찾아보세요.', 1600);
    });
  });
}

function readFoundTargets() {
  try {
    const savedValue = localStorage.getItem(storageKey);
    return savedValue ? JSON.parse(savedValue) : [];
  } catch {
    return [];
  }
}

function saveFoundTargets() {
  localStorage.setItem(storageKey, JSON.stringify([...discovered]));
}

function syncProgress() {
  foundCount.textContent = discovered.size.toString();

  targets.forEach((target) => {
    const statusItem = document.querySelector(`[data-target-status="${target.index}"]`);
    statusItem.classList.toggle('is-found', discovered.has(target.index));
  });

  if (discovered.size === targets.length) {
    showMessage('축하합니다. 4개의 AR 조각을 모두 발견했어요!');
  }
}

function showMessage(message, duration = 3200) {
  window.clearTimeout(messageTimer);
  targetMessage.textContent = message;
  targetMessage.classList.add('is-visible');

  messageTimer = window.setTimeout(() => {
    targetMessage.classList.remove('is-visible');
  }, duration);
}
