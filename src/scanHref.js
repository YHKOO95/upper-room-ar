/** 스캔 전용 정적 페이지 (8th Wall). `scan.html`과 같은 디렉터리 */
export function getScanHtmlHref() {
  const base = import.meta.env.BASE_URL ?? './';
  return `${base}scan.html`.replace(/([^:]\/)\/+/g, '$1');
}

/** React 앱(동일 디렉터리): `.../scan.html` 기준으로 `.../#/detail?target=` */
export function getDetailHashHref(slug) {
  const u = new URL('.', window.location.href);
  u.hash = `#/detail?target=${encodeURIComponent(slug)}`;
  return u.href;
}

export function getHubHashHref() {
  const u = new URL('.', window.location.href);
  u.hash = '#/hub';
  return u.href;
}
