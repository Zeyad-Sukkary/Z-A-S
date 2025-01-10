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




window.addEventListener('load', () => {


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
}, { threshold: 0 }); 

const slidingElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

slidingElements.forEach(el => observer.observe(el));

window.addEventListener('scroll', function() {
  const header = document.getElementById('header');
  const logo = document.getElementById('logo');
  
  const sticky = header.offsetTop + header.offsetHeight;

  if (window.pageYOffset > sticky) {
      logo.classList.add('fixed');
  } else {
      logo.classList.remove('fixed');
  }
});





document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.getElementById('resetStorage');

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      localStorage.clear(); // Clears all local storage
      console.log('Local storage cleared');
      alert('All Local Has Been Cleared.');
    });
  }
});
