import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { findTargetBySlug } from '../targets.js';
import { TARGET_TOTAL, loadFoundIndices } from '../lib/shared.js';
import { getScanHtmlHref } from '../scanHref.js';

export function DetailPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('target');
  const target = findTargetBySlug(slug);
  const foundSet = loadFoundIndices();
  const foundCount = foundSet.size;
  const scanHref = getScanHtmlHref();

  useEffect(() => {
    document.body.classList.add('detail-page');
    return () => document.body.classList.remove('detail-page');
  }, []);

  useEffect(() => {
    if (target) document.title = `${target.title} | 비상수련회 AR`;
    else document.title = '오브제를 찾을 수 없어요';
  }, [target]);

  if (!target) {
    return (
      <main id="detail-root" className="detail-shell" aria-live="polite">
        <Link className="back-link" to="/hub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          허브로 돌아가기
        </Link>
        <article className="detail-card">
          <div className="detail-eyebrow">AR OBJECT</div>
          <h1 className="detail-title">오브제를 찾을 수 없어요</h1>
          <p className="detail-copy">다시 스캔 화면에서 발견한 오브제를 눌러주세요.</p>
        </article>
      </main>
    );
  }

  return (
    <main id="detail-root" className="detail-shell" aria-live="polite">
      <Link className="back-link" to="/hub">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        허브로 돌아가기
      </Link>
      <article className="detail-card">
        <div className="detail-eyebrow">AR OBJECT {target.num}</div>
        <h1 className="detail-title">{target.title}</h1>
        <p className="detail-en">{target.en}</p>
        <p className="detail-sub-title">{target.detailTitle}</p>
        <p className="detail-copy">{target.detail}</p>

        <div className="detail-audio">
          <button type="button" className="detail-audio-play" aria-label="묵상 가이드 재생">
            ▶
          </button>
          <div className="detail-audio-info">
            <div className="detail-audio-label">묵상 가이드</div>
            <div className="detail-audio-meta">2 MIN · 준비 중</div>
          </div>
          <div className="detail-audio-dur">02:00</div>
        </div>

        <div className="detail-reflection">
          <div className="detail-reflection-label">REFLECTION</div>
          <p className="detail-reflection-text">{target.reflection}</p>
        </div>

        <blockquote>
          <p>{target.verse}</p>
          <cite>{target.verseRef}</cite>
        </blockquote>
      </article>

      <div className="detail-actions">
        {foundCount >= TARGET_TOTAL ? (
          <Link className="detail-btn-primary" to="/complete">
            완성된 다락방 보기
          </Link>
        ) : (
          <a className="detail-btn-primary" href={scanHref}>
            다음 표식 찾기 ({foundCount}/{TARGET_TOTAL})
          </a>
        )}
        <Link className="detail-btn-ghost" to="/hub">
          허브로 돌아가기
        </Link>
      </div>
    </main>
  );
}
