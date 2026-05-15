import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { targets } from '../targets.js';
import { TARGET_TOTAL, loadFoundIndices, stationGlyphSVG, spawnDust } from '../lib/shared.js';
import { getScanHtmlHref } from '../scanHref.js';

export function HubPage() {
  const nav = useNavigate();
  const dustRef = useRef(null);
  const scanHref = getScanHtmlHref();
  const [found, setFound] = useState(() => loadFoundIndices());

  useEffect(() => {
    if (dustRef.current) spawnDust(dustRef.current, { density: 0.6, focal: 'top' });
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') setFound(loadFoundIndices());
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const count = found.size;
  const tot = String(TARGET_TOTAL).padStart(2, '0');

  return (
    <div id="s-hub" className="screen active">
      <div className="stardust" id="dust-hub" ref={dustRef} />
      <div className="hub-scroll">
        <div className="hub-header-row">
          <span className="pill">UPPER ROOM · AR</span>
          <span className="mono-sm" id="hub-count">
            {String(count).padStart(2, '0')} / {tot}
          </span>
        </div>
        <h1 className="hub-title">네 개의 표식</h1>
        <p className="hub-desc">사랑홀 로비 곳곳에 숨겨진 표식을 찾아 카메라로 비춰보세요.</p>
        <div className="hub-progress-bar">
          <div className="hub-progress-fill" id="hub-fill" style={{ width: `${(count / TARGET_TOTAL) * 100}%` }} />
        </div>
        <div className="hub-list" id="hub-list">
          {targets.map((t) => {
            const isFound = found.has(t.index);
            return (
              <div
                key={t.slug}
                role="button"
                tabIndex={0}
                className={`hub-card${isFound ? ' found' : ''}`}
                onClick={() => {
                  if (isFound) nav(`/detail?target=${encodeURIComponent(t.slug)}`);
                  else window.location.href = scanHref;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isFound) nav(`/detail?target=${encodeURIComponent(t.slug)}`);
                    else window.location.href = scanHref;
                  }
                }}
              >
                <div
                  className="hub-card-icon"
                  dangerouslySetInnerHTML={{ __html: stationGlyphSVG(t.glyph, 36, isFound) }}
                />
                <div className="hub-card-body">
                  <div className="hub-card-top">
                    <span className="hub-card-num">{t.num}</span>
                    <span className="hub-card-title">{t.title}</span>
                    <span className="hub-card-en">{t.en}</span>
                  </div>
                  <p className="hub-card-sub">
                    {isFound ? `발견됨 · ${t.verseRef}` : `힌트 · ${t.hint}`}
                  </p>
                </div>
                <div className="hub-card-arrow">{isFound ? '✓' : '→'}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="hub-cta">
        <button
          type="button"
          className="btn-primary glow"
          onClick={() => {
            if (count >= TARGET_TOTAL) nav('/complete');
            else window.location.href = scanHref;
          }}
        >
          {count >= TARGET_TOTAL ? '다락방의 빛 보기 →' : '카메라로 찾기'}
        </button>
      </div>
    </div>
  );
}
