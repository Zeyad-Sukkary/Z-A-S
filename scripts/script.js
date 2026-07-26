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

  btn.innerHTML = active ? ICONS.bookmarkHeartFill : ICONS.bookmarkHeart;
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

function bindFavoriteButtons(root = document) {
  root.querySelectorAll('[data-favorite-slug]').forEach(updateFavoriteButton);
}

const ICONS = {
  bookmarkHeartFill: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-heart-fill" viewBox="0 0 16 16">
      <path d="M2 15.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"/>
    </svg>`,
  bookmarkHeart: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-heart" viewBox="0 0 16 16">
      <path d="M8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"/>
      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.544a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
    </svg>`
};

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

  // Loading spinner hide
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');

  // Scroll to top button visibility
  window.addEventListener('scroll', () => {
    const scrollBtn = document.getElementById("scrollBtn");
    if (scrollBtn) {
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollBtn.style.display = "block";
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
    el.style.backgroundColor = 'var(--maintext)';
    el.style.zIndex = '1000';
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
      try { localStorage.clear(); } catch {}
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

  /* --- Global Keyboard Shortcuts --- */
  document.addEventListener('keydown', (event) => {
    const tag = (event.target && event.target.tagName) || '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

    const key = event.key.toLowerCase();

    switch (key) {
      case 's':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 't':
        document.body.classList.toggle('darkmode');
        localStorage.setItem('theme', document.body.classList.contains('darkmode') ? 'dark' : 'light');
        break;

      case 'd': {
        const heroModalEl = document.getElementById('heroModal');
        if (heroModalEl && typeof bootstrap !== 'undefined') {
          const instance = bootstrap.Modal.getInstance(heroModalEl) || new bootstrap.Modal(heroModalEl);
          instance.hide();
          localStorage.setItem('modalDismissed', 'true');
        }
        break;
      }

      case 'c': {
        const heroModalEl = document.getElementById('heroModal');
        if (heroModalEl && typeof bootstrap !== 'undefined') {
          const instance = bootstrap.Modal.getInstance(heroModalEl) || new bootstrap.Modal(heroModalEl);
          instance.show();
        }
        break;
      }

      case 'f': {
        const favModalEl = document.getElementById('confirmFavoritesModal');
        if (favModalEl && typeof bootstrap !== 'undefined') {
          event.preventDefault();
          const instance = bootstrap.Modal.getInstance(favModalEl) || new bootstrap.Modal(favModalEl);
          instance.show();
        }
        break;
      }

      case 'r': {
        const storageModalEl = document.getElementById('confirmStorageModal');
        if (storageModalEl && typeof bootstrap !== 'undefined') {
          event.preventDefault();
          const instance = bootstrap.Modal.getInstance(storageModalEl) || new bootstrap.Modal(storageModalEl);
          instance.show();
        }
        break;
      }

      case 'escape': {
        if (typeof bootstrap !== 'undefined') {
          document.querySelectorAll('.modal.show').forEach((modalEl) => {
            const inst = bootstrap.Modal.getInstance(modalEl);
            if (inst) inst.hide();
          });
        }
        break;
      }
    }
  });

});
