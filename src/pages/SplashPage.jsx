import { useNavigate } from 'react-router-dom';

export function SplashPage() {
  const nav = useNavigate();
  return (
    <div id="s-splash" className="screen active">
      <div className="splash-top">
        <span className="pill">2026 · ONNURI JOSHUA</span>
      </div>
      <div className="splash-logo-area">
        <img src={`${import.meta.env.BASE_URL}upper-room-logo.png`} alt="UPPER ROOM" className="splash-logo" />
        <p className="splash-tagline">비상수련회 · AR 컨텐츠</p>
      </div>
      <div className="splash-bottom">
        <p className="splash-desc">
          사랑홀 로비 곳곳에 숨겨진 네 개의 표식을
          <br />
          카메라로 비춰보세요
        </p>
        <button type="button" className="btn-primary glow" onClick={() => nav('/perm')}>
          시작하기 →
        </button>
        <p className="splash-verse">
          <span className="mono-sm">DANIEL 6:10</span>
        </p>
      </div>
    </div>
  );
}
