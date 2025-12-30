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



document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));

  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
  }
});



window.onscroll = function() { scrollFunction() };

function scrollFunction() {
  const scrollBtn = document.getElementById("scrollBtn");
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
}

function scrollToTop() {
document.body.scrollTop = 0;
document.documentElement.scrollTop = 0;
}
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0 }); // Only triggers when element just starts appearing

const slidingElements = document.querySelectorAll('.slide-in-left');

slidingElements.forEach(el => observer.observe(el));




document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.getElementById('resetStorage');

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      localStorage.clear(); // Clears all local storage
      console.log('Local storage cleared');
      alert('All Local Data Has Been Cleared.');
    });
  }
});




document.addEventListener('keydown', (event) => {
  const tag = event.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  // normalize once
  const key = event.key.toLowerCase();

  switch (key) {
    case 's':
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 't':
      document.body.classList.toggle('darkmode');
      localStorage.setItem(
        'theme',
        document.body.classList.contains('darkmode') ? 'dark' : 'light'
      );
      console.log('Mode toggled');
      break;

    case 'd': {
      const modalEl = document.getElementById('heroModal');
      if (!modalEl) {
        console.warn('Modal element not found');
        break;
      }
      const modalInstance =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();
      localStorage.setItem('modalDismissed', 'true');
      console.log('Modal hidden');
      break;
    }

    case 'c': {
      const modalEl = document.getElementById('heroModal');
      if (!modalEl) {
        console.warn('Modal element not found');
        break;
      }
      const modalInstance =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.show();
      break;
    }

    case 'escape': {
      const openModals = document.querySelectorAll('.modal.show');
      openModals.forEach((modalEl) => {
        const inst = bootstrap.Modal.getInstance(modalEl);
        if (inst) inst.hide();
      });
      break;
    }

    // you can add a default: here if you need it
  }
});


function closeAlert(el) {
  const alertBox = el.parentElement;
  alertBox.classList.add('slide-out-right');

  // Wait for the animation to finish before hiding it
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 400); // same duration as CSS transition
}

const scrollProgress = document.createElement('div');
scrollProgress.id = 'scrollProgress';
scrollProgress.style.position = 'fixed';
scrollProgress.style.top = '0';
scrollProgress.style.left = '0';
scrollProgress.style.height = '5px';
scrollProgress.style.backgroundColor = 'var(--maintext)';
scrollProgress.style.zIndex = '1000';
document.body.prepend(scrollProgress);

window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollPercentage = (scrollTop / scrollHeight) * 100;
  scrollProgress.style.width = scrollPercentage + '%';
});


console.log(getComputedStyle(document.body).backgroundColor);



window.onload = function() {
  if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('darkmode');
  }
};

document.getElementById('theme-switch').addEventListener('click', function () {
  document.body.classList.toggle('darkmode');
  // Optional: Save the theme preference in localStorage
  if (document.body.classList.contains('darkmode')) {
      localStorage.setItem('theme', 'dark');
  } else {
      localStorage.setItem('theme', 'light');
  }
});


