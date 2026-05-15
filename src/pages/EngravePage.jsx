import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadCardDraft, saveCardDraft, buildCommCard, renderCardProgress, spawnDust } from '../lib/shared.js';

export function EngravePage() {
  const nav = useNavigate();
  const dustRef = useRef(null);
  const wrapRef = useRef(null);
  const cpRef = useRef(null);
  const draft = loadCardDraft();
  const [name, setName] = useState(draft.name);
  const [group, setGroup] = useState(draft.group);

  useEffect(() => {
    if (dustRef.current) spawnDust(dustRef.current, { density: 0.35, focal: 'top' });
  }, []);

  useEffect(() => {
    if (cpRef.current) renderCardProgress(cpRef.current, 2);
  }, []);

  const card = { ...loadCardDraft(), name, group };

  useEffect(() => {
    saveCardDraft(card);
    if (!wrapRef.current) return;
    wrapRef.current.innerHTML = '';
    wrapRef.current.appendChild(buildCommCard(card, { sealed: false }));
  }, [name, group]);

  return (
    <div id="s-engrave" className="screen active">
      <div className="stardust dim" id="dust-engrave" ref={dustRef} />
      <div className="card-progress" id="cp-engrave" ref={cpRef} />
      <div className="card-bar">
        <Link className="card-back" to="/reflect">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          뒤로
        </Link>
        <span className="card-step-lbl">02 · ENGRAVE</span>
      </div>
      <h2 className="engrave-title">이름과 자리를 새겨주세요</h2>
      <div className="card-preview-wrap" id="engrave-preview" ref={wrapRef} />
      <div className="engrave-inputs">
        <label className="engrave-field">
          <span className="mono-sm">NAME · 이름</span>
          <input
            id="engrave-name"
            maxLength={14}
            placeholder="이름을 적어주세요"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="engrave-field">
          <span className="mono-sm">GROUP · 소속 조</span>
          <input
            id="engrave-group"
            maxLength={14}
            placeholder="예: 다니엘 1조"
            autoComplete="off"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
        </label>
      </div>
      <div className="screen-bottom">
        <button
          type="button"
          className={`btn-primary${name.trim() ? ' glow' : ''}`}
          id="btn-engrave-next"
          onClick={() => {
            saveCardDraft({ ...loadCardDraft(), name: name.trim(), group: group.trim() });
            nav('/seal');
          }}
        >
          봉인하러 가기 →
        </button>
      </div>
    </div>
  );
}
