document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('read-history-container');
  if (!container || typeof getReadHistory !== 'function') return;

  function loadHistoryList() {
    const history = getReadHistory();
    if (!history.length) {
      container.innerHTML = `
        <div class="empty-state text-center py-4">
          <p class="mb-2">No read history yet.</p>
          <a href="Discover.html" class="btn btn-accent btn-sm">Start reading</a>
        </div>
      `;
      return;
    }

    const recent = history.slice(0, 10);
    container.innerHTML = recent.map(() => `
      <article class="read-history-item placeholder-glow mb-3 p-3 rounded border" aria-hidden="true">
        <span class="placeholder col-7 mb-2"></span>
        <span class="placeholder col-4 mb-2"></span>
        <span class="placeholder col-12"></span>
      </article>
    `).join('');

    Promise.all(
      recent.map(entry =>
        fetch(`articles/${encodeURIComponent(entry.slug)}.json`)
          .then(r => r.ok ? r.json() : null)
          .then(article => article ? ({ ...article, ...entry }) : null)
          .catch(() => null)
      )
    )
      .then(items => {
        const valid = items.filter(Boolean);
        if (!valid.length) {
          container.innerHTML = '<p class="mb-0">Read history could not be loaded right now.</p>';
          return;
        }

        container.innerHTML = valid.map(item => `
          <article class="read-history-item fade-in mb-3 p-3 rounded border">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <a href="article.html?slug=${encodeURIComponent(item.slug)}" class="text-decoration-none">
                <h3 class="h5 mb-1 text-main">${item.title || 'Untitled article'}</h3>
              </a>
              ${typeof renderRemoveHistoryButton === 'function' ? renderRemoveHistoryButton(item.slug) : ''}
            </div>
            <div class="d-flex flex-wrap justify-content-between gap-2 small text-secondary mb-2">
              <span>${item.date || 'Unknown date'}</span>
              <span>Last opened ${formatReadSince(item.lastReadAt || item.firstReadAt)}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 pt-2 border-top">
              ${renderReadStatus(item.slug)}
              <a href="article.html?slug=${encodeURIComponent(item.slug)}" class="btn btn-accent btn-sm ms-auto">
                Continue reading ${typeof TABLER_ICONS !== 'undefined' ? TABLER_ICONS.arrowRight : ''}
              </a>
            </div>
          </article>
        `).join('');

        if (typeof staggerFadeChildren === 'function') staggerFadeChildren(container);
      })
      .catch(() => {
        container.innerHTML = '<p class="mb-0">Read history could not be loaded right now.</p>';
      });
  }

  loadHistoryList();
  document.addEventListener('readhistory:changed', loadHistoryList);
});

