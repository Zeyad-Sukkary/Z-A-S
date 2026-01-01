/* ---------------------------
   Combined universal script (updated)
   --------------------------- */

/* --- small hover on alert close (keeps original behavior) --- */
const closeButton = document.querySelector('.closebtn.child');
const alertParent = document.querySelector('.alert.parent');
if (closeButton && alertParent) {
  closeButton.addEventListener('mouseover', () => {
    alertParent.style.backgroundColor = 'var(--link)';
  });

  closeButton.addEventListener('mouseout', () => {
    alertParent.style.backgroundColor = 'var(--maintext)';
  });
}

/* --- Favorites helpers (as provided) --- */
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch {
    return [];
  }
}

function setFavorites(arr) {
  localStorage.setItem('favorites', JSON.stringify(arr));
}

function setupFavoriteButton(slug) {
  const btn = document.getElementById('fav-btn');
  if (!btn) return;

  const refresh = () => {
    const favs = getFavorites();
    const isFav = favs.includes(slug);
    btn.innerHTML = isFav ? ICONS.bookmarkHeartFill : ICONS.bookmarkHeart;
    btn.classList.toggle('active', isFav);
  };

  btn.addEventListener('click', () => {
    let favs = getFavorites();
    if (favs.includes(slug)) {
      favs = favs.filter(s => s !== slug);
    } else {
      favs.push(slug);
    }
    setFavorites(favs);
    refresh();
  });

  refresh(); // Initial load
}

/* ---------------------------
   DOMContentLoaded — consolidated
   --------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Fade-ins + loading hide
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');

  // Scroll-to-top button visibility
  window.onscroll = scrollFunction;
  function scrollFunction() {
    const scrollBtn = document.getElementById("scrollBtn");
    if (!scrollBtn) return;
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      scrollBtn.style.display = "block";
    } else {
      scrollBtn.style.display = "none";
    }
  }

  // ScrollToTop helper (if used elsewhere)
  window.scrollToTop = function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  // Intersection observer for slide-in-left elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0 });

  document.querySelectorAll('.slide-in-left').forEach(el => observer.observe(el));

  // Scroll progress bar
  const scrollProgress = document.getElementById('scrollProgress') || (function create() {
    const el = document.createElement('div');
    el.id = 'scrollProgress';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.height = '5px';
    el.style.backgroundColor = 'var(--maintext)';
    el.style.zIndex = '1000';
    document.body.prepend(el);
    return el;
  })();

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercentage + '%';
  });

  // Sliding element observer already set

  /* ---------------------------
     Modal wiring & destructive actions
     --------------------------- */
  const favModalEl = document.getElementById('confirmFavoritesModal');
  const storageModalEl = document.getElementById('confirmStorageModal');
  const heroModalEl = document.getElementById('heroModal');

  const favModal = favModalEl ? new bootstrap.Modal(favModalEl, { keyboard: true }) : null;
  const storageModal = storageModalEl ? new bootstrap.Modal(storageModalEl, { keyboard: true }) : null;
  const heroModal = heroModalEl ? new bootstrap.Modal(heroModalEl, { keyboard: true }) : null;

  // openers (visible buttons)
  const openFavBtn = document.getElementById('openResetFavorites');
  const openStorageBtn = document.getElementById('openResetStorage');

  // confirm (destructive) buttons keep original IDs
  const confirmClearFavs = document.getElementById('resetFavorites'); // destructive ID preserved
  const confirmResetStorage = document.getElementById('resetStorage'); // destructive ID preserved

  // cancel buttons
  const cancelFavBtn = document.getElementById('cancelFavorites');
  const cancelStorageBtn = document.getElementById('cancelStorage');

  // show modals when openers clicked
  if (openFavBtn && favModal) openFavBtn.addEventListener('click', () => favModal.show());
  if (openStorageBtn && storageModal) openStorageBtn.addEventListener('click', () => storageModal.show());

  // focus management: destructive button gets focus when modal opens
  if (favModalEl && confirmClearFavs) {
    favModalEl.addEventListener('shown.bs.modal', () => confirmClearFavs.focus());
    favModalEl.addEventListener('hidden.bs.modal', () => { try { openFavBtn && openFavBtn.focus(); } catch {} });
  }
  if (storageModalEl && confirmResetStorage) {
    storageModalEl.addEventListener('shown.bs.modal', () => confirmResetStorage.focus());
    storageModalEl.addEventListener('hidden.bs.modal', () => { try { openStorageBtn && openStorageBtn.focus(); } catch {} });
  }

  // Confirm clear favorites
  if (confirmClearFavs) {
    confirmClearFavs.addEventListener('click', () => {
      try {
        setFavorites([]); // clears favorites array
      } catch (err) {
        console.error('Failed to clear favorites', err);
      }
      if (favModal) favModal.hide();
      // lightweight feedback; replace with toast if desired
      try { alert('Favorites cleared.'); } catch (e) { console.log('Favorites cleared.'); }
      // notify other scripts
      document.dispatchEvent(new CustomEvent('favorites:cleared'));
    });
  }

  // Confirm reset all site data
  if (confirmResetStorage) {
    confirmResetStorage.addEventListener('click', () => {
      try {
        localStorage.clear();
      } catch (err) {
        console.error('Failed to clear localStorage', err);
      }
      if (storageModal) storageModal.hide();
      try { alert('All local site data cleared. Page will reload.'); } catch (e) { console.log('Site data cleared.'); }
      location.reload();
    });
  }

  // cancel buttons return focus to opener (bootstrap hides automatically)
  if (cancelFavBtn) cancelFavBtn.addEventListener('click', () => { try { openFavBtn && openFavBtn.focus(); } catch {} });
  if (cancelStorageBtn) cancelStorageBtn.addEventListener('click', () => { try { openStorageBtn && openStorageBtn.focus(); } catch {} });

  /* ---------------------------
     Keyboard shortcuts (global)
     --------------------------- */
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
        console.log('Mode toggled');
        break;

      case 'd': {
        // hide heroModal and mark dismissed
        if (!heroModalEl) { console.warn('heroModal not found'); break; }
        const instance = bootstrap.Modal.getInstance(heroModalEl) || new bootstrap.Modal(heroModalEl);
        instance.hide();
        localStorage.setItem('modalDismissed', 'true');
        console.log('heroModal hidden and dismissed.');
        break;
      }

      case 'c': {
        // show heroModal
        if (!heroModalEl) { console.warn('heroModal not found'); break; }
        const instance = bootstrap.Modal.getInstance(heroModalEl) || new bootstrap.Modal(heroModalEl);
        instance.show();
        break;
      }

      case 'f': {
        // open favorites confirmation
        if (favModal) {
          event.preventDefault();
          favModal.show();
        }
        break;
      }

      case 'r': {
        // open reset data confirmation
        if (storageModal) {
          event.preventDefault();
          storageModal.show();
        }
        break;
      }

      case 'escape': {
        // close any open bootstrap modal
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach((modalEl) => {
          const inst = bootstrap.Modal.getInstance(modalEl);
          if (inst) inst.hide();
        });
        break;
      }

      // default: no-op
    }
  });

}); // end DOMContentLoaded

// Small debug/sniff left intentionally
console.log(getComputedStyle(document.body).backgroundColor);
