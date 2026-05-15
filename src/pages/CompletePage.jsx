import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { targets } from '../targets.js';
import { TARGET_TOTAL, stationGlyphSVG, spawnDust } from '../lib/shared.js';

export function CompletePage() {
  const nav = useNavigate();
  const dustRef = useRef(null);
  const tot = String(TARGET_TOTAL).padStart(2, '0');

  useEffect(() => {
    if (dustRef.current) spawnDust(dustRef.current, { density: 1.4, focal: 'top' });
  }, []);

  const reset = () => {
    try {
      localStorage.removeItem('upper-room-ar-found');
      sessionStorage.removeItem('upper-room-ar-card');
    } catch {}
    nav('/');
  };

  return (
    <div id="s-complete" className="screen active">
      <div className="stardust" id="dust-complete" ref={dustRef} />
      <div className="wg wg-lg" style={{ top: '36%' }} />
      <div className="complete-top">
        <span className="pill" id="complete-pill">
          {tot} / {tot} · COMPLETE
        </span>
      </div>
      <div className="complete-ht">
        <div className="ht-xl">
          THE LIGHT
          <br />
          HAS COME
        </div>
      </div>
      <div className="complete-glyphs" id="complete-glyphs">
        {targets.map((t) => (
          <div
            key={t.slug}
            className="complete-glyph-box"
            dangerouslySetInnerHTML={{ __html: stationGlyphSVG(t.glyph, 40, true) }}
          />
        ))}
      </div>
      <p className="complete-desc">
        네 자리에서 이어진 빛이 다락방에 모였습니다.
        <br />
        오늘 밤, 같은 자리에서 무릎을 꿇어보아요.
      </p>
      <div className="screen-bottom">
        <button type="button" className="btn-primary glow" onClick={() => nav('/reflect')}>
          기념 카드 만들기 →
        </button>
        <div className="btn-ghost-row">
          <button type="button" className="btn-ghost" onClick={reset}>
            처음으로
          </button>
        </div>
      </div>
    </div>
  );
}
