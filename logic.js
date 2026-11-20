/* Pure helpers, also tested with Node.js. */
(function (root) {
  'use strict';
  function parseTime(input) {
    if (input === undefined || input === null || input === '') return null;
    let s = String(input).trim().toLowerCase();
    if (/^\d+$/.test(s)) return Number(s);
    if (/^\d+(?::\d{1,2}){1,2}$/.test(s)) {
      const parts = s.split(':').map(Number);
      if (parts.some((p, i) => i && p > 59)) return null;
      return parts.reduce((v, p) => v * 60 + p, 0);
    }
    const m = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (m && (m[1] || m[2] || m[3])) return Number(m[1] || 0)*3600 + Number(m[2] || 0)*60 + Number(m[3] || 0);
    return null;
  }
  function fmt(s) {
    s = Math.max(0, Math.floor(Number(s) || 0));
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return (h ? `${h}:${String(m).padStart(2,'0')}` : String(m)) + ':' + String(sec).padStart(2,'0');
  }
  function extract(str) {
    const txt = String(str || '').replace(/&amp;/g,'&');
    const matches = txt.match(/https?:\/\/[^\s<>"'，。；、]+/gi) || [];
    for (let raw of matches) {
      raw = raw.replace(/[)\]}，。；、!?]+$/g, '');
      let u;
      try { u = new URL(raw); } catch (_) { continue; }
      const host = u.hostname.toLowerCase();
      const yt = host === 'youtube.com' || host.endsWith('.youtube.com');
      const short = host === 'youtu.be' || host === 'www.youtu.be';
      if (u.protocol !== 'https:' && u.protocol !== 'http:') continue;
      let id = null;
      if (short) id = u.pathname.split('/')[1];
      else if (yt) {
        if (u.pathname === '/watch') id = u.searchParams.get('v');
        else if (/^\/(shorts|live|embed|v)\//.test(u.pathname)) id = u.pathname.split('/')[2];
      }
      if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) continue;
      const timestamp = [u.searchParams.get('t'), u.searchParams.get('start'), u.searchParams.get('time_continue')].find(v => v !== null);
      const sec = timestamp !== undefined ? parseTime(timestamp) : null;
      const hashMatch = u.hash.match(/(?:^#|[&?])(?:t|start)=([^&]+)/);
      const fromHash = hashMatch ? parseTime(decodeURIComponent(hashMatch[1])) : null;
      return { id, seconds: sec !== null ? sec : fromHash, url: `https://www.youtube.com/watch?v=${id}` };
    }
    return null;
  }
  function link(id, seconds) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}&t=${Math.max(0,Math.floor(Number(seconds)||0))}s`;
  }
  const api = {parseTime, fmt, extract, link};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PodcastLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
