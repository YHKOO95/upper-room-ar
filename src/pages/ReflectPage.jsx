import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PROMPTS, loadCardDraft, saveCardDraft, renderCardProgress, spawnDust } from '../lib/shared.js';

export function ReflectPage() {
  const nav = useNavigate();
  const dustRef = useRef(null);
  const [text, setText] = useState(() => loadCardDraft().resolution);
  const [promptIdx, setPromptIdx] = useState(0);
  const cpRef = useRef(null);

  useEffect(() => {
    if (dustRef.current) spawnDust(dustRef.current, { density: 0.5, focal: 'top' });
  }, []);

  useEffect(() => {
    if (cpRef.current) renderCardProgress(cpRef.current, 1);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPromptIdx((i) => (i + 1) % PROMPTS.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const goEngrave = (resolution) => {
    saveCardDraft({ ...loadCardDraft(), resolution });
    nav('/engrave');
  };

  return (
    <div id="s-reflect" className="screen active">
      <div className="stardust dim" id="dust-reflect" ref={dustRef} />
      <div className="wg wg-md" style={{ top: '22%' }} />
      <div className="card-progress" id="cp-reflect" ref={cpRef} />
      <div className="card-bar">
        <Link className="card-back" to="/complete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          뒤로
        </Link>
        <span className="card-step-lbl">01 · REFLECT</span>
      </div>
      <div className="card-headline">
        <div className="ht-md">
          오늘 밤,
          <br />
          무엇을 남기시겠어요?
        </div>
        <p className="card-headline-sub">한 줄로 적은 다짐이 카드에 새겨집니다.</p>
      </div>
      <div className="reflect-box">
        <textarea
          id="reflect-text"
          rows={2}
          maxLength={40}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="reflect-ph" id="reflect-ph" style={{ display: text ? 'none' : '' }}>
          예: {PROMPTS[promptIdx]}
        </div>
        <div className="reflect-footer">
          <span className="mono-sm">RESOLUTION · 다짐</span>
          <span className={`reflect-cnt${text.length >= 36 ? ' near' : ''}`} id="reflect-cnt">
            {text.length}/40
          </span>
        </div>
      </div>
      <div className="screen-bottom">
        <button
          type="button"
          className={`btn-primary${text.trim() ? ' glow' : ''}`}
          id="btn-reflect-next"
          onClick={() => goEngrave(text.trim())}
        >
          다음 →
        </button>
        <div className="btn-ghost-row">
          <button type="button" className="btn-ghost" onClick={() => goEngrave('')}>
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}
