/* --------------------------------------------------------------------------
   Z-A-S Shared Universal Script
   -------------------------------------------------------------------------- */

/* --- Favorites Storage Helpers --- */
function getFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .map(entry => {
        if (typeof entry === 'string') {
          return { slug: entry, savedAt: null };
        }
        if (!entry || typeof entry !== 'object' || !entry.slug) {
          return null;
        }
        return {
          slug: String(entry.slug),
          savedAt: entry.savedAt || null
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function setFavorites(arr) {
  localStorage.setItem('favorites', JSON.stringify(arr));
}



function getFavoriteEntry(slug) {
  return getFavorites().find(item => item.slug === slug) || null;
}

function isFavorite(slug) {
  return !!getFavoriteEntry(slug);
}

function toggleFavorite(slug) {
  if (!slug) return null;
  let favs = getFavorites();
  const existing = favs.find(item => item.slug === slug);

  if (existing) {
    favs = favs.filter(item => item.slug !== slug);
  } else {
    favs.push({ slug, savedAt: new Date().toISOString() });
  }

  setFavorites(favs);
  const entry = getFavoriteEntry(slug);
  document.dispatchEvent(new CustomEvent('favorites:changed', {
    detail: { slug, isFavorite: !!entry, entry }
  }));
  return entry;
}

function formatSavedSince(savedAt) {
  if (!savedAt) return 'Saved to favorites';
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return 'Saved to favorites';
  return `Saved since ${date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })}`;
}

function updateFavoriteButton(btn) {
  if (!btn) return;
  const slug = btn.dataset.favoriteSlug;
  const favEntry = getFavoriteEntry(slug);
  const active = !!favEntry;
  const label = active ? 'Remove from Favorites' : 'Add to Favorites';
  const showText = btn.dataset.showText === 'true';

  btn.innerHTML = `${active ? ICONS.bookmarkHeartFill : ICONS.bookmarkHeart}${showText ? `<span class="action-label">${active ? 'Favorited' : 'Favorite'}</span>` : ''}`;
  btn.classList.toggle('active', active);
  btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  btn.setAttribute('aria-label', label);
  btn.title = active ? formatSavedSince(favEntry.savedAt) : label;
}

function renderFavoriteButton(slug, extraClass = '') {
  return `
    <button type="button" class="favorite-btn fav-btn ${extraClass}" data-favorite-slug="${slug}" aria-label="Add to Favorites" title="Add to Favorites">
      ${ICONS.bookmarkHeart}
    </button>
  `;
}

function renderFavoriteActionButton(slug, extraClass = '') {
  const active = isFavorite(slug);
  return `
    <button type="button" class="btn compact-action-btn favorite-action-btn ${active ? 'active' : ''} ${extraClass}" data-favorite-slug="${slug}" data-show-text="true" aria-pressed="${active ? 'true' : 'false'}" title="${active ? 'Remove from Favorites' : 'Add to Favorites'}">
      ${active ? ICONS.bookmarkHeartFill : ICONS.bookmarkHeart}
      <span class="action-label">${active ? 'Favorited' : 'Favorite'}</span>
    </button>
  `;
}

function bindFavoriteButtons(root = document) {
  root.querySelectorAll('[data-favorite-slug]').forEach(updateFavoriteButton);
}

/* --- Read History Storage Helpers --- */
function getReadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem('readHistory') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .map(entry => {
        if (typeof entry === 'string') {
          return {
            slug: entry,
            progress: 0,
            markedRead: false,
            firstReadAt: null,
            lastReadAt: null,
            readAt: null
          };
        }
        if (!entry || typeof entry !== 'object' || !entry.slug) return null;
        const progress = Number(entry.progress || 0);
        return {
          slug: String(entry.slug),
          progress: Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0)),
          markedRead: !!entry.markedRead,
          firstReadAt: entry.firstReadAt || entry.savedAt || null,
          lastReadAt: entry.lastReadAt || entry.updatedAt || null,
          readAt: entry.readAt || null
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function setReadHistory(arr) {
  localStorage.setItem('readHistory', JSON.stringify(arr));
}

function getReadHistoryEntry(slug) {
  return getReadHistory().find(item => item.slug === slug) || null;
}

function upsertReadHistory(slug, patch = {}) {
  if (!slug) return null;
  const now = new Date().toISOString();
  const history = getReadHistory();
  const index = history.findIndex(item => item.slug === slug);
  const previous = index >= 0 ? history[index] : null;
  const next = {
    slug,
    progress: 0,
    markedRead: false,
    firstReadAt: now,
    lastReadAt: now,
    readAt: null,
    ...(previous || {}),
    ...patch
  };

  if (!next.firstReadAt) next.firstReadAt = now;
  next.lastReadAt = now;
  next.progress = Math.max(0, Math.min(100, Number(next.progress || 0)));

  const without = history.filter(item => item.slug !== slug);
  setReadHistory([next, ...without].slice(0, 30));
  document.dispatchEvent(new CustomEvent('readhistory:changed', { detail: { slug, entry: next } }));
  return next;
}

function markArticleRead(slug) {
  if (!slug) return null;
  const now = new Date().toISOString();
  return upsertReadHistory(slug, { progress: 100, markedRead: true, readAt: now });
}

function markArticleUnread(slug) {
  if (!slug) return null;
  return upsertReadHistory(slug, { progress: 0, markedRead: false, readAt: null });
}

function removeReadHistory(slug) {
  if (!slug) return;
  const next = getReadHistory().filter(item => item.slug !== slug);
  setReadHistory(next);
  document.dispatchEvent(new CustomEvent('readhistory:changed', { detail: { slug, entry: null, removed: true } }));
}

function formatReadSince(dateString) {
  if (!dateString) return 'Recently opened';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recently opened';
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function hasUnreadArticles() {
  const history = getReadHistory();
  return history.some(item => !item.markedRead);
}

function renderReadStatus(slug, extraClass = '', options = {}) {
  const entry = getReadHistoryEntry(slug);
  if (!entry) return '';
  if (entry.markedRead) {
    if (options.hideIfMarkedRead) return '';
    return `<span class="read-status read-status-complete ${extraClass}"><span aria-hidden="true">${TABLER_ICONS.check}</span> Read</span>`;
  }
  const pct = Math.round(entry.progress || 0);
  if (pct <= 0) return '';
  return `
    <div class="read-status ${extraClass}" title="${pct}% read">
      <div class="read-progress-track" aria-hidden="true">
        <span style="width:${pct}%"></span>
      </div>
      <small>${pct}% read</small>
    </div>
  `;
}

function renderMarkReadButton(slug, extraClass = '') {
  const entry = getReadHistoryEntry(slug);
  const done = !!(entry && entry.markedRead);
  const nearlyDone = !!(entry && !entry.markedRead && entry.progress >= 99);
  return `
    <button type="button" class="btn compact-action-btn mark-read-btn ${done ? 'btn-read-complete' : 'btn-outline-themed'} ${nearlyDone ? 'read-cta-pulse' : ''} ${extraClass}" data-mark-read-slug="${slug}" aria-pressed="${done ? 'true' : 'false'}" title="${done ? 'Marked as read' : 'Mark as read'}">
      <span aria-hidden="true">${done ? TABLER_ICONS.circleCheck : TABLER_ICONS.check}</span>
      <span class="action-label">${done ? 'Read' : 'Mark as read'}</span>
    </button>
  `;
}

function renderUnreadButton(slug, label = 'Mark as Unread', extraClass = '') {
  return `
    <button type="button" class="btn compact-action-btn btn-outline-themed unread-btn ${extraClass}" data-unread-slug="${slug}" title="${label}">
      <span aria-hidden="true">${TABLER_ICONS.unread}</span>
      <span class="action-label">${label}</span>
    </button>
  `;
}

function renderRemoveHistoryButton(slug, extraClass = '') {
  return `
    <button type="button" class="btn compact-action-btn btn-danger-themed remove-history-btn ${extraClass}" data-remove-history-slug="${slug}" title="Remove from history">
      <span aria-hidden="true">${TABLER_ICONS.trash}</span>
      <span class="action-label">Remove from history</span>
    </button>
  `;
}

function updateMarkReadButton(btn) {
  if (!btn) return;
  const slug = btn.dataset.markReadSlug;
  const entry = getReadHistoryEntry(slug);
  const done = !!(entry && entry.markedRead);
  const nearlyDone = !!(entry && !entry.markedRead && entry.progress >= 99);
  btn.classList.toggle('btn-read-complete', done);
  btn.classList.toggle('btn-outline-themed', !done);
  btn.classList.toggle('read-cta-pulse', nearlyDone);
  btn.setAttribute('aria-pressed', done ? 'true' : 'false');
  btn.title = done ? 'Marked as read' : 'Mark as read';
  btn.innerHTML = `<span aria-hidden="true">${done ? TABLER_ICONS.circleCheck : TABLER_ICONS.check}</span> <span class="action-label">${done ? 'Read' : 'Mark as read'}</span>`;
}
function bindMarkReadButtons(root = document) {
  root.querySelectorAll('[data-mark-read-slug]').forEach(updateMarkReadButton);
}

function parseArticleDate(str) {
  if (!str) return 0;
  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(str)) {
    const parts = str.split('/');
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
    return new Date(`${y}-${m}-${d}`).getTime() || 0;
  }
  return new Date(str).getTime() || 0;
}

function articleSnippet(content, maxChars = 150) {
  const tmp = document.createElement('div');
  tmp.innerHTML = content || '';
  return (tmp.textContent || tmp.innerText || '').trim().slice(0, maxChars) + '...';
}

function staggerFadeChildren(root = document) {
  const groups = root.querySelectorAll('.stagger-children');
  groups.forEach(group => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty('--fade-delay', `${Math.min(index * 0.1, 0.8)}s`);
      child.classList.add('fade-in');
    });
  });

  root.querySelectorAll('.fade-in').forEach((el, index) => {
    if (!el.style.getPropertyValue('--fade-delay') && el.parentElement && !el.parentElement.classList.contains('stagger-children')) {
      el.style.setProperty('--fade-delay', `${Math.min((index % 8) * 0.04, 0.28)}s`);
    }
    el.classList.add('visible');
  });
}

function tablerIcon(name, body, size = 18) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="tabler-icon icon-tabler-${name}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

const TABLER_ICONS = {
  search: tablerIcon('search', '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="m21 21l-6 -6"/>'),
  bookmark: tablerIcon('bookmark', '<path d="M18 7a3 3 0 0 0 -3 -3h-6a3 3 0 0 0 -3 3v13l6 -3l6 3z"/>'),
  bookmarkHeart: tablerIcon('bookmark-heart', '<path d="M18 7a3 3 0 0 0 -3 -3h-6a3 3 0 0 0 -3 3v13l6 -3l6 3z"/><path d="M12 10.5a1.5 1.5 0 0 0 -2.5 -1.1c-1.4 1.2 .5 3.1 2.5 4.6c2 -1.5 3.9 -3.4 2.5 -4.6a1.5 1.5 0 0 0 -2.5 1.1"/>'),
  bookmarkHeartFill: tablerIcon('bookmark-heart-filled', '<path fill="currentColor" stroke="none" d="M9 2a4 4 0 0 0 -4 4v15a1 1 0 0 0 1.555 .832l5.445 -3.63l5.445 3.63a1 1 0 0 0 1.555 -.832v-15a4 4 0 0 0 -4 -4zm3 7.5a2.5 2.5 0 0 1 3.5 3.57l-.11 .12l-3.04 2.85a.5 .5 0 0 1 -.68 0l-3.06 -2.85a2.5 2.5 0 0 1 3.39 -3.69z"/>'),
  check: tablerIcon('check', '<path d="M5 12l5 5l9 -9"/>', 16),
  circleCheck: tablerIcon('circle-check', '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>', 16),
  help: tablerIcon('help-circle', '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 17v.01"/><path d="M12 13.5a1.5 1.5 0 1 0 -1.5 -1.5"/>'),
  arrowUp: tablerIcon('arrow-up', '<path d="M12 5l0 14"/><path d="M18 11l-6 -6"/><path d="M6 11l6 -6"/>', 20),
  arrowLeft: tablerIcon('arrow-left', '<path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/>', 20),
  arrowRight: tablerIcon('arrow-right', '<path d="M5 12l14 0"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/>'),
  unread: tablerIcon('rotate-clockwise', '<path d="M4.05 11a8 8 0 1 1 .5 4"/><path d="M4 16v-5h5"/>', 16),
  trash: tablerIcon('trash', '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 13h12l1 -13"/><path d="M9 7l1 -3h4l1 3"/>', 16),
  article: tablerIcon('article', '<path d="M15 5l0 2"/><path d="M15 11l0 2"/><path d="M15 17l0 .01"/><path d="M5 5l5 0"/><path d="M5 11l5 0"/><path d="M5 17l5 0"/>'),
  brightness: tablerIcon('sun-moon', '<path d="M12 3c.132 0 .263 .003 .393 .008a7.5 7.5 0 0 0 8.599 8.599a7.5 7.5 0 1 1 -8.984 -8.6z"/><path d="M17 4a2 2 0 1 0 0 4a2 2 0 0 0 0 -4"/>', 20),
  command: tablerIcon('command', '<path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10"/>', 14),
  key: tablerIcon('key', '<path d="M16 8a4 4 0 1 0 -8 0a4 4 0 0 0 8 0z"/><path d="M12 12l-8 8"/><path d="M7 17l-3 -3"/><path d="M10 14l3 3"/>', 14),
  keyboard: tablerIcon('keyboard', '<path d="M2 5m0 4a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v6a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4z"/><path d="M6 9l.01 0"/><path d="M10 9l.01 0"/><path d="M14 9l.01 0"/><path d="M18 9l.01 0"/><path d="M8 13l.01 0"/><path d="M12 13l.01 0"/><path d="M16 13l.01 0"/><path d="M8 17l8 0"/>', 16),
  menu: tablerIcon('menu-2', '<path d="M4 6l16 0"/><path d="M4 12l16 0"/><path d="M4 18l16 0"/>', 22),
  x: tablerIcon('x', '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>', 20)
};
const ICONS = TABLER_ICONS;

function isMacOS() {
  if (typeof navigator === 'undefined') return false;
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '';
  return /Mac|iPod|iPhone|iPad/i.test(platform);
}

function legacyGetModKeyLabel() {
  return isMacOS() ? '⌘' : 'Ctrl';
}

function legacyGetModKeySvg() {
  if (isMacOS()) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="kbd-mod-icon" aria-label="Command key"><path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10"/></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="kbd-mod-icon" aria-label="Ctrl key"><path d="M6 15l6 -6l6 6"/></svg>`;
}

function legacyRenderKbdCue(keyCombo) {
  const modSvg = getModKeySvg();
  const modLabel = getModKeyLabel();
  return `<kbd class="kbd-badge">${modSvg}<span>${modLabel} + ${keyCombo}</span></kbd>`;
}

const LEGACY_TABLER_ICONS = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.707 20.293l-5.395-5.395a8.026 8.026 0 1 0-1.414 1.414l5.395 5.395a1 1 0 0 0 1.414-1.414zM4 10a6 6 0 1 1 6 6 6.007 6.007 0 0 1-6-6z"/></svg>`,
  bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2a5 5 0 0 1 5 5v14a1 1 0 0 1 -1.555 .832l-5.445 -3.63l-5.444 3.63a1 1 0 0 1 -1.55 -.72l-.006 -.112v-14a5 5 0 0 1 5 -5h4z"/></svg>`,
  bookmarkFill: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2a5 5 0 0 1 5 5v14a1 1 0 0 1 -1.555 .832l-5.445 -3.63l-5.444 3.63a1 1 0 0 1 -1.55 -.72l-.006 -.112v-14a5 5 0 0 1 5 -5h4z"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.707 6.293a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1 -1.414 0l-5 -5a1 1 0 0 1 1.414 -1.414l4.293 4.293l9.293 -9.293a1 1 0 0 1 1.414 0"/></svg>`,
  circleCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324a10 10 0 0 1 15 -8.66zm-1.293 6.953a1 1 0 0 0 -1.414 -1.414l-3.293 3.292l-1.293 -1.292a1 1 0 1 0 -1.414 1.414l2 2a1 1 0 0 0 1.414 0l4 -4z"/></svg>`,
  help: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3.34a10 10 0 1 1 -10 17.32a10 10 0 0 1 10 -17.32m-5 12.66a1 1 0 0 0 -.993 .883l-.007 .127a1 1 0 0 0 1.993 .117l.007 -.127a1 1 0 0 0 -1 -1m1.173 -9.856a3.6 3.6 0 0 0 -3.97 1.252a1 1 0 0 0 1.512 1.304l.082 -.096a1.6 1.6 0 1 1 1.846 2.462a2.49 2.49 0 0 0 -1.641 2.49a1 1 0 0 0 1.996 .004v-.117a.5 .5 0 0 1 .259 -.466l.075 -.034a3.61 3.61 0 0 0 2.338 -3.47a3.6 3.6 0 0 0 -2.497 -3.329"/></svg>`,
  arrowUp: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10.586 3l-6.586 6.586a2 2 0 0 0 -.434 2.18l.068 .145a2 2 0 0 0 1.78 1.089h2.586v7a2 2 0 0 0 2 2h4l.15 -.005a2 2 0 0 0 1.85 -1.995l-.001 -7h2.587a2 2 0 0 0 1.414 -3.414l-6.586 -6.586a2 2 0 0 0 -2.828 0z"/></svg>`,
  unread: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10a1 1 0 0 0 -2 0a8 8 0 1 1 -2.343 -5.657l-1.657 1.657a1 1 0 0 0 .707 1.707h4a1 1 0 0 0 1 -1v-4a1 1 0 0 0 -1.707 -.707l-1.42 1.42a9.97 9.97 0 0 0 -6.58 -2.42z"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-1v12a2 2 0 0 1 -1.85 1.995l-.15 .005h-10a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-12h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h16zm-10 4a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1zm4 0a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1zm2 -7a1 1 0 0 1 .993 .883l.007 .117v1h-14v-1a1 1 0 0 1 .883 -.993l.117 -.007h4a1 1 0 0 1 .883 -.883l.007 -.117h2a1 1 0 0 1 .883 .883l.007 .117h4z"/></svg>`,
  article: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2zm-2 10h-10a1 1 0 0 0 0 2h10a1 1 0 0 0 0 -2zm0 -4h-10a1 1 0 0 0 0 2h10a1 1 0 0 0 0 -2z"/></svg>`,
  brightness: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-9 1.732a8 8 0 0 0 4.001 14.928l-.001 -16a8 8 0 0 0 -4 1.072"/></svg>`,
  command: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10"/></svg>`
};
const LEGACY_ICONS = LEGACY_TABLER_ICONS;

function getModKeyLabel() {
  return isMacOS() ? 'Cmd' : 'Ctrl';
}

function getModKeyName() {
  return isMacOS() ? 'Command' : 'Control';
}

function getModKeyIcon() {
  return isMacOS() ? TABLER_ICONS.command : TABLER_ICONS.key;
}

function renderKeyToken(key) {
  const normalized = String(key).trim().toLowerCase();
  const isArrowUp = normalized === 'arrowup' || normalized === 'up';
  return `<span class="kbd-key">${isArrowUp ? TABLER_ICONS.arrowUp : key}</span>`;
}

function renderKbdCue(keyCombo) {
  const keys = String(keyCombo).split('+').map(key => key.trim()).filter(Boolean);
  const keyName = keys.join(' plus ');
  return `<kbd class="kbd-badge" aria-label="${getModKeyName()} plus ${keyName}"><span class="kbd-mod-icon">${getModKeyIcon()}</span><span class="kbd-key kbd-mod-label">${getModKeyLabel()}</span>${keys.map(key => `<span class="kbd-plus" aria-hidden="true">+</span>${renderKeyToken(key)}`).join('')}</kbd>`;
}

function renderStandaloneKeyCue(key) {
  return `<kbd class="kbd-badge kbd-badge-single" aria-label="${key}">${renderKeyToken(key)}</kbd>`;
}

function setupFavoriteButton(slug) {
  const btn = document.getElementById('fav-btn');
  if (!btn || !slug) return;
  btn.dataset.favoriteSlug = slug;
  updateFavoriteButton(btn);
}

/* --- Scroll Helpers --- */
window.scrollToTop = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* --- Main Initialization --- */
document.addEventListener('DOMContentLoaded', () => {
  // Fade-in animations
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  if (typeof staggerFadeChildren === 'function') staggerFadeChildren(document);

  // Loading spinner hide
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');

  // Scroll to top button visibility
  window.addEventListener('scroll', () => {
    const scrollBtn = document.getElementById("scrollBtn");
    if (scrollBtn) {
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollBtn.style.display = "inline-flex";
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.style.display = "none";
        scrollBtn.classList.remove('visible');
      }
    }

    // Scroll progress bar
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
      scrollProgress.style.width = scrollPercentage + '%';
    }
  });

  // Create scroll progress bar if missing
  if (!document.getElementById('scrollProgress')) {
    const el = document.createElement('div');
    el.id = 'scrollProgress';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.height = '5px';
    el.style.background = 'linear-gradient(90deg, var(--linkactive), var(--linkhover))';
    el.style.zIndex = '1045';
    el.style.transition = 'width 0.1s ease';
    document.body.prepend(el);
  }

  // Intersection observer for sliding elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.slide-in-left, .slide-in-right').forEach(el => observer.observe(el));

  /* --- Modal Wiring (Event Delegation for Opener & Action Buttons) --- */
  document.addEventListener('click', (e) => {
    const favoriteBtn = e.target.closest('[data-favorite-slug]');
    if (favoriteBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(favoriteBtn.dataset.favoriteSlug);
      updateFavoriteButton(favoriteBtn);
    }

    const markReadBtn = e.target.closest('[data-mark-read-slug]');
    if (markReadBtn) {
      e.preventDefault();
      e.stopPropagation();
      markArticleRead(markReadBtn.dataset.markReadSlug);
      updateMarkReadButton(markReadBtn);
    }

    const unreadBtn = e.target.closest('[data-unread-slug]');
    if (unreadBtn) {
      e.preventDefault();
      e.stopPropagation();
      markArticleUnread(unreadBtn.dataset.unreadSlug);
    }

    const removeHistoryBtn = e.target.closest('[data-remove-history-slug]');
    if (removeHistoryBtn) {
      e.preventDefault();
      e.stopPropagation();
      removeReadHistory(removeHistoryBtn.dataset.removeHistorySlug);
    }

    // Opener: Reset Favorites Modal
    if (e.target.closest('#openResetFavorites')) {
      const modalEl = document.getElementById('confirmFavoritesModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
      }
    }

    // Opener: Reset All Local Data Modal
    if (e.target.closest('#openResetStorage')) {
      const modalEl = document.getElementById('confirmStorageModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
      }
    }

    // Action: Confirm Clear Favorites
    if (e.target.closest('#resetFavorites')) {
      setFavorites([]);
      const modalEl = document.getElementById('confirmFavoritesModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      document.dispatchEvent(new CustomEvent('favorites:cleared'));
      alert('Favorites cleared.');
      if (window.location.pathname.toLowerCase().includes('favorites')) {
        window.location.reload();
      }
    }

    // Action: Confirm Reset Storage
    if (e.target.closest('#resetStorage')) {
      try { localStorage.clear(); } catch { }
      const modalEl = document.getElementById('confirmStorageModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      alert('All local site data cleared. Reloading page.');
      window.location.reload();
    }
  });

  document.addEventListener('favorites:changed', (event) => {
    const slug = event.detail && event.detail.slug;
    const buttons = slug
      ? Array.from(document.querySelectorAll('[data-favorite-slug]')).filter(btn => btn.dataset.favoriteSlug === slug)
      : Array.from(document.querySelectorAll('[data-favorite-slug]'));
    buttons.forEach(updateFavoriteButton);
  });

  document.addEventListener('readhistory:changed', (event) => {
    const slug = event.detail && event.detail.slug;
    const buttons = slug
      ? Array.from(document.querySelectorAll('[data-mark-read-slug]')).filter(btn => btn.dataset.markReadSlug === slug)
      : Array.from(document.querySelectorAll('[data-mark-read-slug]'));
    buttons.forEach(updateMarkReadButton);
  });

  /* --- Global Keyboard Shortcuts --- */
  document.addEventListener('keydown', (event) => {
    const tag = (event.target && event.target.tagName) || '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
      if (event.key === 'Escape') {
        event.target.blur();
      }
      return;
    }

    const hasModifier = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const key = event.key.toLowerCase();

    // Escape closes modals and sidebars without modifier
    if (key === 'escape') {
      if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('.modal.show, .offcanvas.show').forEach((el) => {
          const inst = bootstrap.Modal.getInstance(el) || bootstrap.Offcanvas.getInstance(el);
          if (inst) inst.hide();
        });
      }
      if (window.closeCanvasModal) window.closeCanvasModal();
      return;
    }

    if (!hasModifier) return; // Require Ctrl or Cmd for all other shortcuts

    // Ctrl/Cmd + ArrowUp: Scroll to top
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Ctrl/Cmd + H: Continue Reading Sidebar
    if (key === 'h') {
      event.preventDefault();
      const continueBtn = document.getElementById('continueReadingHeaderBtn') || document.querySelector('.continue-toggle');
      if (continueBtn) {
        continueBtn.click();
      } else {
        const panelEl = document.getElementById('continueReadingPanel');
        if (panelEl && typeof bootstrap !== 'undefined') {
          const panel = bootstrap.Offcanvas.getInstance(panelEl) || new bootstrap.Offcanvas(panelEl);
          panel.toggle();
        }
      }
      return;
    }

    // Ctrl/Cmd + K or Ctrl/Cmd + S: Focus Search Input
    if (key === 'k' || key === 's') {
      if (!isShift) {
        const searchInput = document.getElementById('searchbar');
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        return;
      }
    }

    // Ctrl/Cmd + Shift + F: Clear Favorites Modal
    if (key === 'f' && isShift) {
      event.preventDefault();
      if (window.openResetFavoritesModal) {
        window.openResetFavoritesModal();
      } else {
        const favModalEl = document.getElementById('confirmFavoritesModal');
        if (favModalEl && typeof bootstrap !== 'undefined') {
          const instance = bootstrap.Modal.getInstance(favModalEl) || new bootstrap.Modal(favModalEl);
          instance.show();
        }
      }
      return;
    }

    // Ctrl/Cmd + Shift + R: Reset Storage Modal
    if (key === 'r' && isShift) {
      event.preventDefault();
      if (window.openResetStorageModal) {
        window.openResetStorageModal();
      } else {
        const storageModalEl = document.getElementById('confirmStorageModal');
        if (storageModalEl && typeof bootstrap !== 'undefined') {
          const instance = bootstrap.Modal.getInstance(storageModalEl) || new bootstrap.Modal(storageModalEl);
          instance.show();
        }
      }
      return;
    }

    // Ctrl/Cmd + / or Ctrl/Cmd + Shift + K: Shortcuts Guide Modal
    if (key === '/' || (key === 'k' && isShift)) {
      event.preventDefault();
      if (window.openShortcutsModal) {
        window.openShortcutsModal();
      } else {
        const heroModalEl = document.getElementById('heroModal');
        if (heroModalEl && typeof bootstrap !== 'undefined') {
          const instance = bootstrap.Modal.getInstance(heroModalEl) || new bootstrap.Modal(heroModalEl);
          instance.show();
        }
      }
      return;
    }

    // Ctrl/Cmd + Shift + D: Dark mode toggle
    if (key === 'd' && isShift) {
      event.preventDefault();
      document.body.classList.toggle('darkmode');
      localStorage.setItem('theme', document.body.classList.contains('darkmode') ? 'dark' : 'light');
      return;
    }
  });

});

