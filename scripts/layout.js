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

    container.innerHTML = `
      <button id="theme-switch" title="Press T to Toggle" class="theme-switch slide-in-left" aria-label="Toggle Dark or Light Mode">
        <svg xmlns="http://www.w3.org/2000/svg" title="Switch to Dark" height="50px" viewBox="0 -960 960 960" width="50px" fill="var(--fillcolor)">
          <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" title="Switch to Light" height="50px" viewBox="0 -960 960 960" width="50px" fill="var(--fillcolor)">
          <path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/>
        </svg>
      </button>

      <button class="slide-in-right scrolltop" onclick="scrollToTop()" id="scrollBtn" title="Go to top" aria-label="Scroll to top">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--main)">
          <path d="M160-760v-80h640v80H160Zm280 640v-408L336-424l-56-56 200-200 200 200-56 56-104-104v408h-80Z"/>
        </svg>
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

    const articleActionsHtml = isArticle ? `
      <li class="fade-in nav-item me-2" title="Add to Favorites">
        <button id="fav-btn" type="button" class="favorite-btn fav-btn" aria-label="Bookmark article" title="Add to Favorites">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-heart" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"/>
            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"/>
          </svg>
        </button>
      </li>
      <li class="fade-in nav-item" title="Mark article as read">
        <button id="headerMarkReadBtn" type="button" class="btn mark-read-btn btn-outline-themed btn-sm" aria-label="Mark article as read">
          <span aria-hidden="true">○</span> Mark as read
        </button>
      </li>
    ` : '';

    headerEl.innerHTML = `
      <nav class="navbar navbar-expand-lg p-0">
        <div class="container d-flex header-shell flex-nowrap align-items-center gap-3">
          <a class="d-flex align-items-center text-decoration-none flex-shrink-0" href="index.html" aria-label="Z-A-S home">
            <img src="pics/Logo.svg" class="logo slide-in-left" alt="Z-A-S Logo">
          </a>

          <button class="navbar-toggler ms-auto d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#siteNavigation" aria-controls="siteNavigation" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
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
                ${articleActionsHtml}
              </ul>

              <!-- Universal Expandable Search Bar -->
              <form id="headerSearchForm" class="header-search-form" role="search">
                <div class="search-box">
                  <input type="search" class="form-control search-input" placeholder="Search..." id="searchbar" aria-label="Search articles" autocomplete="off">
                  <button type="submit" class="btn search-btn" aria-label="Submit Search">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
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
          <button data-bs-toggle="modal" data-bs-target="#heroModal" class="btn btn-outline-themed btn-sm" aria-label="Keyboard shortcuts">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
        </svg>
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

  // 4. Inject Universal Modals
  function injectModals() {
    let modalsEl = document.getElementById('site-modals');
    if (!modalsEl) {
      modalsEl = document.createElement('div');
      modalsEl.id = 'site-modals';
      document.body.appendChild(modalsEl);
    }

    modalsEl.innerHTML = `
      <!-- Keyboard Shortcuts Modal -->
      <div class="modal fade" id="heroModal" tabindex="-1" aria-labelledby="heroModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-body">
              <div class="container px-4 py-5">
                <div class="row flex-lg-row-reverse align-items-center g-5 py-5">
                  <div class="col-10 col-sm-8 col-lg-6">
                    <img src="pics/controls.jpg" class="d-block mx-lg-auto img-fluid rounded shadow" alt="Controls" width="700" height="500" loading="lazy">
                  </div>
                  <div class="col-lg-6">
                    <h1 class="display-5 fw-bold lh-1 mb-3">Controls — Keyboard Shortcuts</h1>
                    <h2 class="h5 mb-3">Keyboard Shortcuts</h2>
                    <ul class="mb-3">
                      <li><strong>S</strong> — Scroll to top</li>
                      <li><strong>T</strong> — Toggle dark/light mode</li>
                      <li><strong>D</strong> — Dismiss this shortcut modal (and mark dismissed)</li>
                      <li><strong>C</strong> — Show this shortcut modal</li>
                      <li><strong>F</strong> — Open Clear Favorites confirmation</li>
                      <li><strong>R</strong> — Open Reset Data confirmation</li>
                      <li><strong>Esc</strong> — Close any open modal</li>
                    </ul>
                    <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                      <button type="button" class="btn btn-accent btn-lg px-4 me-md-2" data-bs-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Clear Favorites Modal -->
      <div class="modal fade" id="confirmFavoritesModal" tabindex="-1" aria-labelledby="confirmFavoritesLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-3 shadow">
            <div class="modal-body p-4 text-center">
              <h5 id="confirmFavoritesLabel" class="mb-2">Clear all favorites?</h5>
              <p class="mb-0">This will remove all saved favorites stored locally in your browser. This action cannot be undone.</p>
            </div>
            <div class="modal-footer flex-nowrap p-0">
              <button id="resetFavorites" type="button" class="btn btn-danger-themed btn-lg fs-6 col-6 py-3 m-0 rounded-0">
                <strong>Yes, clear favorites</strong>
              </button>
              <button type="button" id="cancelFavorites" class="btn btn-outline-themed btn-lg fs-6 col-6 py-3 m-0 rounded-0" data-bs-dismiss="modal">
                No, go back
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Storage Modal -->
      <div class="modal fade" id="confirmStorageModal" tabindex="-1" aria-labelledby="confirmStorageLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-3 shadow">
            <div class="modal-body p-4 text-center">
              <h5 id="confirmStorageLabel" class="mb-2">Reset all site data?</h5>
              <p class="mb-0">This will clear all local data for this site (preferences, saved items, etc.). The page will reload afterwards.</p>
            </div>
            <div class="modal-footer flex-nowrap p-0">
              <button id="resetStorage" type="button" class="btn btn-danger-themed btn-lg fs-6 col-6 py-3 m-0 rounded-0">
                <strong>Yes, reset site data</strong>
              </button>
              <button type="button" id="cancelStorage" class="btn btn-outline-themed btn-lg fs-6 col-6 py-3 m-0 rounded-0" data-bs-dismiss="modal">
                No, keep data
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Execute component injection
  injectFloatingControls();
  injectHeader();
  injectFooter();
  injectModals();

})();
