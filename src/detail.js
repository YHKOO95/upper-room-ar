import './styles.css';
import { findTargetBySlug, targets } from './targets.js';

const TARGET_TOTAL = targets.length;

const params = new URLSearchParams(window.location.search);
const target = findTargetBySlug(params.get('target'));
const root = document.querySelector('#detail-root');

if (target) {
  document.title = `${target.title} | 비상수련회 AR`;
  renderDetail(target);
} else {
  renderNotFound();
}

function renderDetail(t) {
  const foundRaw = localStorage.getItem('upper-room-ar-found');
  const foundSet = new Set(foundRaw ? JSON.parse(foundRaw) : []);
  const foundCount = foundSet.size;

  root.innerHTML = `
    <a class="back-link" href="index.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      AR 화면으로 돌아가기
    </a>
    <article class="detail-card">
      <div class="detail-eyebrow">AR OBJECT ${t.num}</div>
      <h1 class="detail-title">${t.title}</h1>
      <p class="detail-en">${t.en}</p>
      <p class="detail-sub-title">${t.detailTitle}</p>
      <p class="detail-copy">${t.detail}</p>

      <div class="detail-audio">
        <button class="detail-audio-play" aria-label="묵상 가이드 재생">▶</button>
        <div class="detail-audio-info">
          <div class="detail-audio-label">묵상 가이드</div>
          <div class="detail-audio-meta">2 MIN · 준비 중</div>
        </div>
        <div class="detail-audio-dur">02:00</div>
      </div>

      <div class="detail-reflection">
        <div class="detail-reflection-label">REFLECTION</div>
        <p class="detail-reflection-text">${t.reflection}</p>
      </div>

      <blockquote>
        <p>${t.verse}</p>
        <cite>${t.verseRef}</cite>
      </blockquote>
    </article>

    <div class="detail-actions">
      <a class="detail-btn-primary" href="index.html">
        ${foundCount >= TARGET_TOTAL ? '완성된 다락방 보기' : `다음 표식 찾기 (${foundCount}/${TARGET_TOTAL})`}
      </a>
      <a class="detail-btn-ghost" href="index.html">AR 화면으로 돌아가기</a>
    </div>
  `;
}

function renderNotFound() {
  document.title = '오브제를 찾을 수 없어요';
  root.innerHTML = `
    <a class="back-link" href="index.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      AR 화면으로 돌아가기
    </a>
    <article class="detail-card">
      <div class="detail-eyebrow">AR OBJECT</div>
      <h1 class="detail-title">오브제를 찾을 수 없어요</h1>
      <p class="detail-copy">다시 AR 화면에서 발견한 오브제를 눌러주세요.</p>
    </article>
  `;
}
