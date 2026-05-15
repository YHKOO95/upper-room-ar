import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { spawnDust } from '../lib/shared.js';

export function PermPage() {
  const nav = useNavigate();
  const dustRef = useRef(null);
  useEffect(() => {
    if (dustRef.current) spawnDust(dustRef.current, { density: 0.55, focal: 'top' });
  }, []);

  return (
    <div id="s-perm" className="screen active">
      <div className="stardust" id="dust-perm" ref={dustRef} />
      <div className="perm-step">
        <span className="pill dim">STEP 01 / 02</span>
      </div>
      <div className="perm-center">
        <div className="perm-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="#F5C26B" strokeWidth="1.4" />
            <circle cx="12" cy="12.5" r="3.5" stroke="#F5C26B" strokeWidth="1.4" />
            <rect x="8" y="3" width="8" height="3" rx="1" stroke="#F5C26B" strokeWidth="1.4" />
          </svg>
        </div>
        <h2 className="perm-title">카메라 안내</h2>
        <p className="perm-desc">
          표식을 찾는 <strong>스캔 화면</strong>에서만 카메라가 켜집니다.
          <br />
          브라우저에서 카메라 허용을 물으면 허용해 주세요.
          <br />
          <span className="perm-note">사진은 저장되거나 전송되지 않습니다.</span>
        </p>
      </div>
      <div className="screen-bottom">
        <button type="button" className="btn-primary glow" onClick={() => nav('/hub')}>
          다음 →
        </button>
        <div className="btn-ghost-row">
          <button type="button" className="btn-ghost" onClick={() => nav('/hub')}>
            나중에
          </button>
        </div>
      </div>
    </div>
  );
}
