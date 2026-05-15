import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TARGET_TOTAL,
  SEAL_STAGE_FRAC,
  HOLD_MS,
  loadCardDraft,
  buildCommCard,
  renderCardProgress,
  spawnDust,
  getTodayStr,
} from '../lib/shared.js';

export function SealPage() {
  const nav = useNavigate();
  const dustRef = useRef(null);
  const cpRef = useRef(null);
  const wrapRef = useRef(null);
  const ringRef = useRef(null);
  const innerRef = useRef(null);
  const wgRef = useRef(null);
  const hintRef = useRef(null);
  const btnAreaRef = useRef(null);
  const doneRef = useRef(null);
  const toastRef = useRef(null);
  const lblRef = useRef(null);
  const shareBtnRef = useRef(null);

  const [sealSealed, setSealSealed] = useState(false);
  const sealedRef = useRef(false);
  sealedRef.current = sealSealed;

  const sealSerialRef = useRef('');
  const sealProgressRef = useRef(0);
  const sealRafRef = useRef(null);
  const sealT0Ref = useRef(0);

  const showToast = useCallback(() => {
    toastRef.current?.classList.add('visible');
    setTimeout(() => toastRef.current?.classList.remove('visible'), 3000);
  }, []);

  const setSealProgress = useCallback((p) => {
    sealProgressRef.current = p;
    const C = 276.46;
    const ring = ringRef.current;
    if (ring) {
      ring.style.strokeDashoffset = String(C * (1 - p));
      ring.style.transition = p === 0 ? 'stroke-dashoffset 280ms ease' : 'none';
    }
    const inner = innerRef.current;
    if (inner) {
      inner.style.background = `radial-gradient(circle, rgba(245,194,107,${0.25 + p * 0.55}) 0%, rgba(245,194,107,0.05) 70%)`;
      inner.style.boxShadow = `0 0 ${20 + p * 40}px rgba(245,194,107,${0.3 + p * 0.4})`;
    }
    const litCount = SEAL_STAGE_FRAC.filter((s) => p >= s).length;
    const items = wrapRef.current?.querySelectorAll('.card-glyph-item') ?? [];
    items.forEach((item, i) => {
      item.classList.toggle('lit', i < litCount);
    });
    const glow = wrapRef.current?.querySelector('.card-center-glow');
    glow?.classList.toggle('sealed', litCount === TARGET_TOTAL);
    if (wgRef.current) wgRef.current.style.opacity = String(0.5 + p * 0.5);
    const scale = 0.62 + p * 0.04;
    if (wrapRef.current) {
      wrapRef.current.style.marginBottom = `${Math.round(-460 * (1 - scale))}px`;
    }
  }, []);

  const captureAndSave = useCallback(
    async (cardEl) => {
      if (!cardEl || !window.htmlToImage) {
        showToast();
        return;
      }
      try {
        const today = getTodayStr();
        const dataUrl = await window.htmlToImage.toPng(cardEl, {
          pixelRatio: 3,
          backgroundColor: '#000',
          cacheBust: true,
        });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `upper-room-${today.replace(/\./g, '')}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        console.warn('capture failed', e);
      }
      showToast();
    },
    [showToast],
  );

  const completingRef = useRef(false);

  const onSealComplete = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    sealedRef.current = true;

    const card = loadCardDraft();
    setSealSealed(true);
    if (innerRef.current) innerRef.current.textContent = 'SEALED';
    if (lblRef.current) lblRef.current.textContent = '03 · SEALED';

    const wrap = wrapRef.current;
    if (wrap) {
      wrap.style.transform = 'scale(0.66)';
      wrap.style.marginBottom = `${Math.round(-460 * (1 - 0.66))}px`;
      wrap.style.filter = 'drop-shadow(0 0 30px rgba(245,194,107,0.35))';
      wrap.querySelector('.comm-card')?.remove();
      wrap.appendChild(
        buildCommCard(card, { sealed: true, litCount: TARGET_TOTAL, serial: sealSerialRef.current }),
      );
    }
    if (hintRef.current) hintRef.current.style.display = 'none';
    if (btnAreaRef.current) btnAreaRef.current.style.display = 'none';
    if (doneRef.current) doneRef.current.style.display = 'flex';
    if (navigator.share && shareBtnRef.current) shareBtnRef.current.style.display = 'block';

    await new Promise((r) => setTimeout(r, 800));
    const el = wrapRef.current?.querySelector('.comm-card');
    if (el) await captureAndSave(el);
  }, [captureAndSave]);

  const sealTick = useCallback(
    (now) => {
      const elapsed = now - sealT0Ref.current;
      const p = Math.min(1, elapsed / HOLD_MS);
      setSealProgress(p);
      if (p >= 1) {
        sealRafRef.current = null;
        void onSealComplete();
      } else {
        sealRafRef.current = requestAnimationFrame(sealTick);
      }
    },
    [setSealProgress, onSealComplete],
  );

  useEffect(() => {
    if (dustRef.current) spawnDust(dustRef.current, { density: 0.6, focal: 'top' });
  }, []);

  useEffect(() => {
    sealSerialRef.current = `No. ${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')} / 2026`;
    if (cpRef.current) renderCardProgress(cpRef.current, 3);
    const wrap = wrapRef.current;
    if (wrap) {
      const card = loadCardDraft();
      wrap.innerHTML = '';
      wrap.appendChild(buildCommCard(card, { sealed: false, litCount: 0 }));
      wrap.style.transform = 'scale(0.62)';
      wrap.style.marginBottom = '-175px';
      wrap.style.filter = 'none';
    }
    if (lblRef.current) lblRef.current.textContent = '03 · SEAL';
    if (innerRef.current) innerRef.current.textContent = 'HOLD';
    if (hintRef.current) hintRef.current.style.display = '';
    if (btnAreaRef.current) btnAreaRef.current.style.display = '';
    if (doneRef.current) doneRef.current.style.display = 'none';
    toastRef.current?.classList.remove('visible');
    setSealProgress(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    const btn = document.getElementById('seal-btn');
    if (!btn) return;

    const onStart = () => {
      if (sealedRef.current) return;
      sealT0Ref.current = performance.now() - sealProgressRef.current * HOLD_MS;
      sealRafRef.current = requestAnimationFrame(sealTick);
    };
    const onCancel = () => {
      if (sealedRef.current) return;
      if (sealRafRef.current) cancelAnimationFrame(sealRafRef.current);
      sealRafRef.current = null;
      setSealProgress(0);
    };

    btn.addEventListener('mousedown', onStart);
    btn.addEventListener('mouseup', onCancel);
    btn.addEventListener('mouseleave', onCancel);
    const ts = (e) => {
      e.preventDefault();
      onStart();
    };
    btn.addEventListener('touchstart', ts, { passive: false });
    btn.addEventListener('touchend', onCancel);
    btn.addEventListener('touchcancel', onCancel);

    return () => {
      btn.removeEventListener('mousedown', onStart);
      btn.removeEventListener('mouseup', onCancel);
      btn.removeEventListener('mouseleave', onCancel);
      btn.removeEventListener('touchstart', ts);
      btn.removeEventListener('touchend', onCancel);
      btn.removeEventListener('touchcancel', onCancel);
      if (sealRafRef.current) cancelAnimationFrame(sealRafRef.current);
    };
  }, [sealTick, setSealProgress]);

  const shareSealCard = async () => {
    const cardEl = wrapRef.current?.querySelector('.comm-card');
    if (!navigator.share || !cardEl || !window.htmlToImage) return;
    try {
      const dataUrl = await window.htmlToImage.toPng(cardEl, { pixelRatio: 3, backgroundColor: '#000' });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'upper-room.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Upper Room', text: '다락방의 빛이 모였습니다.' });
      } else {
        await navigator.share({ title: 'Upper Room', text: '다락방의 빛이 모였습니다.' });
      }
    } catch {}
  };

  const resetAll = () => {
    try {
      localStorage.removeItem('upper-room-ar-found');
      sessionStorage.removeItem('upper-room-ar-card');
    } catch {}
    nav('/');
  };

  return (
    <div id="s-seal" className="screen active">
      <div className="stardust" id="dust-seal" ref={dustRef} />
      <div className="wg wg-lg" id="wg-seal" ref={wgRef} style={{ top: '32%', opacity: 0.5, transition: 'opacity 200ms' }} />
      <div className="card-progress" id="cp-seal" ref={cpRef} />
      <div className="card-bar">
        <button type="button" className="card-back" id="btn-seal-back" onClick={() => !sealSealed && nav('/engrave')} disabled={sealSealed}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          뒤로
        </button>
        <span className="card-step-lbl" id="seal-lbl" ref={lblRef}>
          03 · SEAL
        </span>
      </div>
      <div className="seal-card-wrap" id="seal-card-wrap" ref={wrapRef} />
      <div className="seal-hint" id="seal-hint" ref={hintRef}>
        아래 원을 <strong>꾹 눌러</strong> 빛을 봉인해주세요.
      </div>
      <div className="seal-btn-area" id="seal-btn-area" ref={btnAreaRef}>
        <div className="seal-btn" id="seal-btn">
          <svg className="seal-svg" width="116" height="116" viewBox="0 0 116 116">
            <circle cx="58" cy="58" r="44" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
            <circle
              ref={ringRef}
              id="seal-ring"
              cx="58"
              cy="58"
              r="44"
              stroke="#F5C26B"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="276.46"
              strokeDashoffset="276.46"
            />
          </svg>
          <div className="seal-inner" id="seal-inner" ref={innerRef}>
            HOLD
          </div>
        </div>
      </div>
      <div className="seal-done" id="seal-done" ref={doneRef} style={{ display: 'none' }}>
        <p className="seal-done-title">봉인이 완료되었습니다</p>
        <p className="seal-done-sub">당신의 카드는 이미 다락방에 한 장 걸렸어요.</p>
        <button type="button" className="btn-secondary" id="btn-seal-share" ref={shareBtnRef} style={{ display: 'none' }} onClick={() => shareSealCard()}>
          공유하기
        </button>
        <div className="btn-ghost-row">
          <button type="button" className="btn-ghost" id="btn-seal-reset" onClick={resetAll}>
            처음으로
          </button>
        </div>
      </div>
      <div className="seal-toast" id="seal-toast" ref={toastRef}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L10 17L19 7" stroke="#1a0e00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        사진 앱에 저장되었어요
      </div>
    </div>
  );
}
