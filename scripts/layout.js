/* --------------------------------------------------------------------------
   Z-A-S Universal Layout & Component Injector Engine
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  function getCurrentPageKey() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('about')) return 'about';
    if (path.includes('discover')) return 'discover';
    if (path.includes('favorites')) return 'favorites';
    if (path.includes('article')) return 'article';
    if (path.includes('404')) return '404';
    return 'home'; // default index.html
  }

  const pageKey = getCurrentPageKey();

  // 1. Inject Floating Theme Switcher & Scroll to Top
  function injectFloatingControls() {
    let container = document.getElementById('site-controls');
    if (!container) {
      container = document.createElement('div');
      container.id = 'site-controls';
      document.body.appendChild(container);
    }

    const modCue = renderKbdCue('ArrowUp');
    const modText = getModKeyLabel();

    container.innerHTML = `
      <button id="theme-switch" title="Press ${modText} + Shift + D to Toggle" class="theme-switch slide-in-left" aria-label="Toggle Dark or Light Mode">
        <span class="theme-icon-dark">${TABLER_ICONS.brightness}</span>
        <span class="theme-icon-light">${TABLER_ICONS.brightness}</span>
      </button>

      <button class="slide-in-right scrolltop" onclick="scrollToTop()" id="scrollBtn" title="Go to top (${modText} + Arrow Up)" aria-label="Scroll to top">
        ${TABLER_ICONS.arrowUp}
        <span class="d-none d-md-inline-flex ms-1">${modCue}</span>
      </button>
    `;
  }

  // 2. Inject Universal Header
  function injectHeader() {
    let headerEl = document.querySelector('header');
    if (!headerEl) {
      headerEl = document.createElement('header');
      headerEl.className = 'site-header';
      document.body.prepend(headerEl);
    }

    const homeActive = pageKey === 'home' ? 'active' : '';
    const aboutActive = pageKey === 'about' ? 'active' : '';
    const discoverActive = pageKey === 'discover' ? 'active' : '';
    const favActive = pageKey === 'favorites' ? 'active' : '';

    const isArticle = pageKey === 'article';
    const hasUnread = typeof hasUnreadArticles === 'function' ? hasUnreadArticles() : false;
    const modText = typeof getModKeyLabel === 'function' ? getModKeyLabel() : 'Ctrl';

    const articleActionsHtml = isArticle ? `
      <li class="fade-in nav-item me-2" title="Add to Favorites">
        <button id="fav-btn" type="button" class="favorite-btn fav-btn" aria-label="Bookmark article" title="Add to Favorites">
          ${TABLER_ICONS.bookmark}
        </button>
      </li>
      <li class="fade-in nav-item" title="Mark article as read">
        <button id="headerMarkReadBtn" type="button" class="btn mark-read-btn btn-outline-themed btn-sm" aria-label="Mark article as read">
          <span aria-hidden="true">${TABLER_ICONS.check}</span> Mark as read
        </button>
      </li>
    ` : '';

    const continueReadingHeaderBtnHtml = `
      <li class="fade-in nav-item me-2" id="continueReadingHeaderItem" title="Continue Reading Sidebar (${modText} + H)">
        <button id="continueReadingHeaderBtn" class="btn btn-accent btn-sm d-inline-flex align-items-center gap-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#continueReadingPanel" aria-controls="continueReadingPanel">
          ${TABLER_ICONS.article}
          <span>Continue Reading</span>
          <span class="ms-1">${typeof renderKbdCue === 'function' ? renderKbdCue('H') : '<kbd class="kbd-badge">Ctrl + H</kbd>'}</span>
        </button>
      </li>
    `;

    headerEl.innerHTML = `
      <nav class="navbar navbar-expand-lg p-0">
        <div class="container d-flex header-shell flex-nowrap align-items-center gap-3">
          <a class="d-flex align-items-center text-decoration-none flex-shrink-0" href="index.html" aria-label="Z-A-S home">
            <img src="pics/Logo.svg" class="logo slide-in-left" alt="Z-A-S Logo">
          </a>

          <button class="navbar-toggler ms-auto d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#siteNavigation" aria-controls="siteNavigation" aria-expanded="false" aria-label="Toggle navigation">
            ${TABLER_ICONS.menu}
          </button>

          <div id="siteNavigation" class="collapse navbar-collapse mt-3 mt-lg-0 justify-content-lg-end">
            <div class="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3 ms-lg-auto w-100">
              <ul class="nav nav-pills header-nav justify-content-center justify-content-lg-end align-items-center stagger-children">
                <li class="fade-in nav-item" title="Home">
                  <a class="link nav-link ${homeActive}" ${homeActive ? 'id="activenav" aria-current="page"' : ''} href="index.html">Home</a>
                </li>
                <li class="fade-in nav-item" title="Learn more About us">
                  <a class="link nav-link ${aboutActive}" ${aboutActive ? 'id="activenav" aria-current="page"' : ''} href="About.html">About Us</a>
                </li>
                <li class="fade-in nav-item" title="Current | Discover">
                  <a class="link nav-link ${discoverActive}" ${discoverActive ? 'id="activenav" aria-current="page"' : ''} href="Discover.html">Discover</a>
                </li>
                <li class="fade-in nav-item" title="Check out your Saved Articles">
                  <a class="link nav-link ${favActive}" ${favActive ? 'id="activenav" aria-current="page"' : ''} href="Favorites.html">Favorites</a>
                </li>
                ${continueReadingHeaderBtnHtml}
                ${articleActionsHtml}
              </ul>

              <!-- Universal Expandable Search Bar with Keybind Cue -->
              <form id="headerSearchForm" class="header-search-form" role="search">
                <div class="search-box">
                  <input type="search" class="form-control search-input" placeholder="Search... (${modText} + K)" id="searchbar" aria-label="Search articles" autocomplete="off">
                  <button type="submit" class="btn search-btn" aria-label="Submit Search" title="Focus Search (${modText} + K)">
                    ${TABLER_ICONS.search}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </nav>
    `;

    const searchForm = document.getElementById('headerSearchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('searchbar');
        const query = searchInput ? searchInput.value.trim() : '';

        if (pageKey === 'discover') {
          // Handled in real-time by Discoversystem.js
        } else if (query) {
          window.location.href = `Discover.html?search=${encodeURIComponent(query)}`;
        } else {
          window.location.href = 'Discover.html';
        }
      });
    }
  }

  // 3. Inject Universal Footer
  function injectFooter() {
    let footerEl = document.querySelector('footer');
    if (!footerEl) {
      footerEl = document.createElement('footer');
      document.body.appendChild(footerEl);
    }
    footerEl.className = 'site-footer';

    const currentYear = new Date().getFullYear();
    const modText = typeof getModKeyLabel === 'function' ? getModKeyLabel() : 'Ctrl';

    footerEl.innerHTML = `
      <div class="footer-top">
        <a href="index.html" class="text-decoration-none" aria-label="Z-A-S home">
          <img src="pics/Logo.svg" class="logo footer-logo" alt="Z-A-S Logo">
        </a>
        <nav aria-label="Footer navigation">
          <ul class="nav justify-content-center">
            <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
            <li class="nav-item"><a href="Discover.html" class="nav-link">Discover</a></li>
            <li class="nav-item"><a href="About.html" class="nav-link">About us</a></li>
            <li class="nav-item"><a href="Favorites.html" class="nav-link">Favorites</a></li>
          </ul>
        </nav>
        <div class="d-flex align-items-center gap-2">
          <button id="openShortcutsBtn" class="btn btn-outline-themed btn-sm d-inline-flex align-items-center gap-1" aria-label="Keyboard shortcuts" title="Keyboard Shortcuts (${modText} + /)">
            ${TABLER_ICONS.help}
            <span>Controls</span>
            <span class="ms-1">${typeof renderKbdCue === 'function' ? renderKbdCue('/') : '<kbd class="kbd-badge">Ctrl + /</kbd>'}</span>
          </button>
          <button id="openResetStorage" class="btn btn-danger-themed btn-sm">Reset Data</button>
          <a href="https://linktr.ee/zeyadsukk" target="_blank" rel="noopener noreferrer" class="btn btn-success-themed btn-sm">Linktree</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="mb-0">&copy; ${currentYear} Zeyad A.S.</p>
        <span>Curated content, tools, and experiments.</span>
      </div>
    `;
  }

  // 4. Inject Modular Canvas Modal System & Canvas HTML
  function injectCanvasModalContainer() {
    let container = document.getElementById('canvasModalContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'canvasModalContainer';
      container.className = 'canvas-modal-overlay';
      container.setAttribute('aria-hidden', 'true');
      container.innerHTML = `
        <div class="canvas-modal" role="dialog" aria-modal="true" aria-labelledby="canvasModalTitle">
          <div class="canvas-modal-header">
            <h3 id="canvasModalTitle" class="h5 mb-0 fw-bold">Modal</h3>
            <button type="button" class="icon-btn" onclick="closeCanvasModal()" aria-label="Close">${TABLER_ICONS.x}</button>
          </div>
          <div id="canvasModalBody" class="canvas-modal-body">
            <!-- Dynamic Content or Skeleton Loader -->
          </div>
          <div id="canvasModalFooter" class="canvas-modal-footer">
            <button type="button" class="btn btn-outline-themed" onclick="closeCanvasModal()">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(container);

      container.addEventListener('click', (e) => {
        if (e.target === container) closeCanvasModal();
      });
    }
  }

  window.openCanvasModal = function ({ title = 'Information', bodyHtml = '', footerActionsHtml = '', showSkeleton = false }) {
    injectCanvasModalContainer();
    const overlay = document.getElementById('canvasModalContainer');
    const titleEl = document.getElementById('canvasModalTitle');
    const bodyEl = document.getElementById('canvasModalBody');
    const footerEl = document.getElementById('canvasModalFooter');

    if (!overlay || !titleEl || !bodyEl || !footerEl) return;

    titleEl.textContent = title;

    if (showSkeleton) {
      bodyEl.innerHTML = `
        <div class="canvas-skeleton-wrapper">
          <div class="canvas-skeleton-line" style="width: 70%;"></div>
          <div class="canvas-skeleton-line" style="width: 90%;"></div>
          <div class="canvas-skeleton-line" style="width: 60%;"></div>
          <div class="canvas-skeleton-line" style="width: 80%;"></div>
        </div>
      `;
    } else {
      bodyEl.innerHTML = bodyHtml;
    }

    footerEl.innerHTML = footerActionsHtml || `<button type="button" class="btn btn-outline-themed" onclick="closeCanvasModal()">Close</button>`;

    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
  };

  window.closeCanvasModal = function () {
    const overlay = document.getElementById('canvasModalContainer');
    if (overlay) {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
    }
  };

  // Data-Driven Modal open handlers
  window.openResetFavoritesModal = function () {
    window.openCanvasModal({
      title: 'Clear Favorites Confirmation',
      bodyHtml: `
        <div class="text-center py-3">
          <div class="mb-3 text-warning">${TABLER_ICONS.trash}</div>
          <h4 class="h5 fw-bold mb-2">Clear all saved favorites?</h4>
          <p class="text-secondary mb-0">This will remove all saved favorites stored locally in your browser. This action cannot be undone.</p>
        </div>
      `,
      footerActionsHtml: `
        <button type="button" class="btn btn-outline-themed" onclick="closeCanvasModal()">Cancel</button>
        <button type="button" class="btn btn-danger-themed" id="confirmClearFavsAction">Clear Favorites</button>
      `
    });
  };

  window.openResetStorageModal = function () {
    window.openCanvasModal({
      title: 'Reset Site Data Confirmation',
      bodyHtml: `
        <div class="text-center py-3">
          <div class="mb-3 text-danger">${TABLER_ICONS.trash}</div>
          <h4 class="h5 fw-bold mb-2">Reset all local site data?</h4>
          <p class="text-secondary mb-0">This will clear all local storage for Z-A-S (reading progress, favorites, preferences). The page will reload.</p>
        </div>
      `,
      footerActionsHtml: `
        <button type="button" class="btn btn-outline-themed" onclick="closeCanvasModal()">Cancel</button>
        <button type="button" class="btn btn-danger-themed" id="confirmResetStorageAction">Reset All Data</button>
      `
    });
  };

  window.openShortcutsModal = function () {
    const hasUnread = typeof hasUnreadArticles === 'function' ? hasUnreadArticles() : false;
    const renderCue = renderKbdCue;

    window.openCanvasModal({
      title: 'Controls & Keyboard Shortcuts',
      bodyHtml: `
        <div class="shortcuts-guide-wrapper">
          <div class="d-flex align-items-center gap-3 mb-3 p-3 rounded border background-mix">
            <div class="fs-4 text-primary">${TABLER_ICONS.help}</div>
            <div>
              <h4 class="h6 mb-1 fw-bold">Interactive Navigation Shortcuts</h4>
              <p class="small text-secondary mb-0">Shortcut cues match your operating system and use the ${getModKeyName()} modifier.</p>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-borderless align-middle mb-0">
              <tbody>
                <tr>
                  <td>${renderCue('K')} or ${renderCue('S')}</td>
                  <td>Focus header search bar input</td>
                  <td><span class="badge bg-success-subtle text-success">Active</span></td>
                </tr>
                <tr class="${!hasUnread ? 'cue-disabled' : ''}">
                  <td>${renderCue('H')}</td>
                  <td>Toggle Continue Reading sidebar panel</td>
                  <td>${hasUnread ? '<span class="badge bg-success-subtle text-success">Active</span>' : '<span class="badge bg-secondary-subtle text-secondary">No unread articles</span>'}</td>
                </tr>
                <tr>
                  <td>${renderCue('ArrowUp')}</td>
                  <td>Scroll page smoothly to top</td>
                  <td><span class="badge bg-success-subtle text-success">Active</span></td>
                </tr>
                <tr>
                  <td>${renderCue('Shift + D')}</td>
                  <td>Toggle Dark or Light theme mode</td>
                  <td><span class="badge bg-success-subtle text-success">Active</span></td>
                </tr>
                <tr>
                  <td>${renderCue('Shift + F')}</td>
                  <td>Open Clear Favorites confirmation dialog</td>
                  <td><span class="badge bg-success-subtle text-success">Active</span></td>
                </tr>
                <tr>
                  <td>${renderCue('Shift + R')}</td>
                  <td>Open Reset Storage confirmation dialog</td>
                  <td><span class="badge bg-success-subtle text-success">Active</span></td>
                </tr>
                <tr>
                  <td>${typeof renderStandaloneKeyCue === 'function' ? renderStandaloneKeyCue('Esc') : '<kbd class="kbd-badge">Esc</kbd>'}</td>
                  <td>Close any open modal dialog or offcanvas panel</td>
                  <td><span class="badge bg-success-subtle text-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `,
      footerActionsHtml: `
        <button type="button" class="btn btn-accent" onclick="closeCanvasModal()">Got it</button>
      `
    });
  };

  // 5. Update Header Unread Continue Button Visibility
  function updateHeaderUnreadButtonState() {
    const itemEl = document.getElementById('continueReadingHeaderItem');
    if (!itemEl) return;
    const unreadExist = typeof hasUnreadArticles === 'function' ? hasUnreadArticles() : false;
    if (unreadExist) {
      itemEl.classList.remove('d-none');
    } else {
      itemEl.classList.add('d-none');
    }
  }

  // Inject Offcanvas Continue Reading Panel if missing
  function injectContinueReadingPanel() {
    let panelEl = document.getElementById('continueReadingPanel');
    if (!panelEl) {
      panelEl = document.createElement('aside');
      panelEl.className = 'offcanvas offcanvas-start continue-reading-panel';
      panelEl.tabIndex = -1;
      panelEl.id = 'continueReadingPanel';
      panelEl.setAttribute('aria-labelledby', 'continueReadingTitle');
      panelEl.innerHTML = `
        <div class="offcanvas-header">
          <h2 class="offcanvas-title h4" id="continueReadingTitle">Continue Reading</h2>
          <button type="button" class="icon-btn" data-bs-dismiss="offcanvas" aria-label="Close">${TABLER_ICONS.x}</button>
        </div>
        <div class="offcanvas-body">
          <div id="continue-reading-list" class="continue-reading-list stagger-children">
            <p class="mb-0">Loading articles...</p>
          </div>
        </div>
      `;
      document.body.appendChild(panelEl);
    }
  }

  // Execute component injection
  injectFloatingControls();
  injectHeader();
  injectFooter();
  injectCanvasModalContainer();
  injectContinueReadingPanel();

  document.addEventListener('DOMContentLoaded', () => {
    updateHeaderUnreadButtonState();

    document.addEventListener('readhistory:changed', updateHeaderUnreadButtonState);

    // Offcanvas Continue Reading Panel setup & empty state prompt
    const panelEl = document.getElementById('continueReadingPanel');
    if (panelEl) {
      panelEl.addEventListener('show.bs.offcanvas', () => {
        const listEl = document.getElementById('continue-reading-list');
        if (!listEl) return;

        const history = typeof getReadHistory === 'function' ? getReadHistory() : [];
        const unreadHistory = history.filter(item => !item.markedRead);

        if (!unreadHistory.length) {
          listEl.innerHTML = `
            <div class="empty-continue-prompt text-center py-4 px-3 rounded border">
              <div class="mb-2 text-warning">${TABLER_ICONS.article}</div>
              <h4 class="h6 fw-bold mb-2">No unread articles in your reading list</h4>
              <p class="small text-secondary mb-3">Explore our curated collection to start reading and tracking progress!</p>
              <a href="Discover.html" class="btn btn-accent btn-sm">Start Reading ${TABLER_ICONS.arrowRight}</a>
            </div>
          `;
        }
      });
    }
  });

  // Global event delegation for modal triggers
  document.addEventListener('click', (e) => {
    if (e.target.closest('#openResetFavorites')) {
      e.preventDefault();
      window.openResetFavoritesModal();
    }

    if (e.target.closest('#openResetStorage')) {
      e.preventDefault();
      window.openResetStorageModal();
    }

    if (e.target.closest('#openShortcutsBtn') || e.target.closest('[data-bs-target="#heroModal"]')) {
      e.preventDefault();
      window.openShortcutsModal();
    }

    if (e.target.closest('#confirmClearFavsAction')) {
      if (typeof setFavorites === 'function') setFavorites([]);
      window.closeCanvasModal();
      document.dispatchEvent(new CustomEvent('favorites:cleared'));
      alert('Favorites cleared.');
      if (window.location.pathname.toLowerCase().includes('favorites')) {
        window.location.reload();
      }
    }

    if (e.target.closest('#confirmResetStorageAction')) {
      try { localStorage.clear(); } catch { }
      window.closeCanvasModal();
      alert('All local site data cleared. Reloading page.');
      window.location.reload();
    }
  });

})();
