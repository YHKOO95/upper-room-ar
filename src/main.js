import './styles.css';

const targets = [
  {
    index: 0,
    title: '빛의 문',
    message: '첫 번째 AR 조각을 발견했어요. 하나님이 여시는 길을 기억하세요.',
  },
  {
    index: 1,
    title: '말씀의 검',
    message: '두 번째 AR 조각을 발견했어요. 말씀으로 다시 일어서는 시간입니다.',
  },
  {
    index: 2,
    title: '기도의 불씨',
    message: '세 번째 AR 조각을 발견했어요. 작은 기도가 큰 불씨가 됩니다.',
  },
  {
    index: 3,
    title: '비상의 깃발',
    message: '네 번째 AR 조각을 발견했어요. 이제 함께 비상할 준비가 됐습니다.',
  },
];

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

      showMessage(`${target.title}: ${target.message}`);
      navigator.vibrate?.(80);
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
