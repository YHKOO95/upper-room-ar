import './styles.css';
import { findTargetBySlug } from './targets.js';

const params = new URLSearchParams(window.location.search);
const target = findTargetBySlug(params.get('target'));
const detailRoot = document.querySelector('#detail-root');

if (target) {
  document.title = `${target.title} | AR 오브제 설명`;
  renderTargetDetail(target);
} else {
  renderNotFound();
}

function renderTargetDetail(targetDetail) {
  detailRoot.innerHTML = `
    <a class="back-link" href="/">AR 화면으로 돌아가기</a>
    <article class="detail-card">
      <p class="eyebrow">AR OBJECT ${targetDetail.index + 1}</p>
      <h1>${targetDetail.title}</h1>
      <p class="detail-title">${targetDetail.detailTitle}</p>
      <p class="detail-copy">${targetDetail.detail}</p>
      <blockquote>
        <p>${targetDetail.verse}</p>
        <cite>${targetDetail.verseRef}</cite>
      </blockquote>
    </article>
  `;
}

function renderNotFound() {
  document.title = '오브제를 찾을 수 없어요';
  detailRoot.innerHTML = `
    <a class="back-link" href="/">AR 화면으로 돌아가기</a>
    <article class="detail-card">
      <p class="eyebrow">AR OBJECT</p>
      <h1>오브제를 찾을 수 없어요</h1>
      <p class="detail-copy">다시 AR 화면에서 발견한 오브제를 눌러주세요.</p>
    </article>
  `;
}
