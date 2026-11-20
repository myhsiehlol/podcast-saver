(() => {
  'use strict';
  const {parseTime, fmt, extract, link} = window.PodcastLogic;
  const STORE = 'podcast-saver-v1';
  const $ = id => document.getElementById(id);
  let entries = [];
  let editId = null;
  const safeRead = () => { try { const data = JSON.parse(localStorage.getItem(STORE)); return Array.isArray(data) ? data.filter(x => x && /^[\w-]{11}$/.test(x.id)) : []; } catch { return []; } };
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(entries)); return true; } catch { notify('儲存失敗：請確認 Chrome 沒有停用網站儲存空間。', true); return false; } }
  function notify(text, error = false) { const n = $('notice'); n.textContent = text; n.className = 'notice' + (error ? ' danger' : ''); n.hidden = false; }
  function el(tag, className, content) { const x = document.createElement(tag); if (className) x.className = className; if (content !== undefined) x.textContent = content; return x; }
  function btn(text, cls, handler, title) { const b = el('button', cls, text); b.type = 'button'; if (title) b.title = title; b.addEventListener('click', handler); return b; }
  const sorted = () => [...entries].sort((a,b) => (b.updated || 0) - (a.updated || 0));
  function itemName(x) { return x.title || `YouTube · ${x.id}`; }
  function openVideo(x) { window.location.href = link(x.id, x.seconds); }
  function card(x, compact=false) {
    const wrap = el('article', compact ? 'latest-card' : 'podcast-card');
    const meta = el('div','card-meta');
    meta.append(el('div','item-title', itemName(x)), el('div','sub', `已儲存位置  ${fmt(x.seconds)}  ·  ${new Date(x.updated || Date.now()).toLocaleDateString('zh-TW')}`));
    const top = el('div', 'card-top'); top.append(el('div','art','♫'),meta); wrap.append(top);
    const controls = el('div', 'controls');
    controls.append(btn('−60秒','adjust',()=>changeTime(x,-60)),btn('−30秒','adjust',()=>changeTime(x,-30)),btn('−10秒','adjust',()=>changeTime(x,-10)),btn('+10秒','adjust',()=>changeTime(x,10)),btn('+30秒','adjust',()=>changeTime(x,30)),btn('+60秒','adjust',()=>changeTime(x,60)));
    wrap.append(controls);
    const actions = el('div','actions'); actions.append(btn('▶ 繼續播放','button primary',()=>openVideo(x)),btn('編輯','button secondary',()=>openEditor(x)));
    if (!compact) actions.append(btn('刪除','button ghost',()=>remove(x)));
    wrap.append(actions); return wrap;
  }
  function render() {
    $('count').textContent = String(entries.length);
    const list = $('items'); list.replaceChildren();
    const q = $('searchInput').value.trim().toLowerCase();
    const filtered = sorted().filter(x => `${itemName(x)} ${x.id}`.toLowerCase().includes(q));
    if (filtered.length) filtered.forEach(x=>list.append(card(x)));
    else list.append(el('p','empty', entries.length ? '找不到符合的 Podcast。' : '還沒有任何紀錄。從 YouTube 分享過來，或按「新增連結」。'));
    const latest = $('latest'); latest.replaceChildren();
    if (entries.length) latest.append(card(sorted()[0], true));
    else latest.append(el('p','empty', '第一集準備好了嗎？從 YouTube 分享影片到這裡。'));
  }
  function changeTime(x, delta) { x.seconds = Math.max(0,(Number(x.seconds)||0)+delta); x.updated = Date.now(); if (persist()) render(); }
  function remove(x) { if (!confirm(`刪除「${itemName(x)}」的進度紀錄？`)) return; entries = entries.filter(y=>y.id!==x.id); persist(); render(); notify('已刪除紀錄。'); }
  function upsert(info, title, seconds) {
    const old = entries.find(x=>x.id===info.id);
    if (old) { old.seconds = seconds; if (title) old.title = title; old.updated = Date.now(); }
    else entries.push({id:info.id,seconds,title:title || '',updated:Date.now()});
    const ok = persist(); render(); return ok;
  }
  function openEditor(x = null, sharedText = '') {
    editId = x ? x.id : null;
    $('modalTitle').textContent = x ? '編輯 Podcast' : '新增 Podcast';
    $('urlInput').value = x ? link(x.id,x.seconds) : sharedText;
    $('titleInput').value = x ? x.title || '' : '';
    $('timeInput').value = x ? fmt(x.seconds) : '';
    $('formError').textContent = '';
    $('editor').showModal();
  }
  function handleShared() {
    const u = new URL(window.location.href);
    if (!['title','text','url'].some(k=>u.searchParams.has(k))) return;
    const shared = [u.searchParams.get('url'),u.searchParams.get('text'),u.searchParams.get('title')].filter(Boolean).join('\n');
    // Clear shared URL to avoid repeated updates when page refreshes.
    history.replaceState(null,'',u.pathname);
    const result = extract(shared);
    if (!result) { notify('收到分享，但找不到有效的 YouTube 影片網址。請手動新增。',true); openEditor(null,shared); return; }
    // NEVER silently replace a previous timestamp with zero if share has no timestamp.
    if (result.seconds === null) {
      const prior = entries.find(x=>x.id===result.id);
      notify('這次分享沒有包含播放時間：請在 YouTube 分享畫面打開時間戳，或手動輸入。',true);
      openEditor(prior || null,shared);
      if (!prior) $('urlInput').value = result.url;
      return;
    }
    const old = entries.find(x=>x.id===result.id);
    const titleParam = u.searchParams.get('title') || '';
    // Most share titles are generic or unreliable; keep existing custom name.
    const name = old ? old.title : (/^(?:https?:\/\/|YouTube$)/i.test(titleParam) ? '' : titleParam.slice(0,160));
    if (upsert(result,name,result.seconds)) notify(`${old ? '已更新' : '已新增'}播放進度：${fmt(result.seconds)}。`);
  }
  $('addBtn').addEventListener('click',()=>openEditor());
  $('searchInput').addEventListener('input',render);
  $('closeEditor').addEventListener('click',()=>$('editor').close());
  $('cancelEditor').addEventListener('click',()=>$('editor').close());
  $('editorForm').addEventListener('submit', e => {
    e.preventDefault();
    const info = extract($('urlInput').value);
    if (!info) { $('formError').textContent = '請輸入有效的 YouTube 影片連結。'; return; }
    const raw = $('timeInput').value.trim();
    const sec = raw ? parseTime(raw) : info.seconds;
    if (sec === null || !Number.isFinite(sec) || sec < 0 || sec > 1e9) { $('formError').textContent = '請輸入有效的播放時間，例如 38:20 或 1:12:45。'; return; }
    if (upsert(info, $('titleInput').value.trim(), sec)) { $('editor').close(); notify(`已儲存 ${fmt(sec)}。`); }
  });
  $('helpBtn').addEventListener('click',()=>$('helpDialog').showModal());
  $('closeHelp').addEventListener('click',()=>$('helpDialog').close());
  $('doneHelp').addEventListener('click',()=>$('helpDialog').close());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  entries = safeRead(); render(); handleShared();
})();
