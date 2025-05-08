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
  const modalTour = document.getElementById('modalTour');
  const modalDismiss = document.getElementById('modaldismiss');

  if (localStorage.getItem('modalDismissed') === 'true') {
    if (modalTour) modalTour.classList.add('hidden'); // Ensure modal is hidden
    return;
  }

  if (modalTour) modalTour.classList.remove('hidden');

  if (modalDismiss && modalTour) {
    modalDismiss.addEventListener('click', () => {
      modalTour.classList.add('fade-out');

      modalTour.addEventListener(
        'animationend',
        () => {
          modalTour.classList.add('hidden');
          localStorage.setItem('modalDismissed', 'true'); // Save dismissal status
        },
        { once: true }
      );
    });
  }
});



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
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return; 
  }

  switch (event.key.toLowerCase()) { 
    case 's': 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 't': 
      document.body.classList.toggle('darkmode');
      localStorage.setItem('theme', document.body.classList.contains('darkmode') ? 'dark' : 'light');
      console.log('Dark mode toggled');
      break;
        
    case 'h': 
      const modal = document.getElementById('modalTour');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        localStorage.setItem('modalDismissed', 'true');
        console.log('Modal hidden');
      }
      break;
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




