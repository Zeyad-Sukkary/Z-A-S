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



window.addEventListener('load', () => {
  const modalTour = document.getElementById('modalTour');
  if (modalTour && localStorage.getItem('modalDismissed') !== 'true') {
    console.log('Showing modal');
    modalTour.classList.remove('hidden');
  }

  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));

  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
});




const modalDismiss = document.getElementById('modaldismiss');
const modalTour = document.getElementById('modalTour');
if (modalDismiss && modalTour) {
  modalDismiss.addEventListener('click', () => {
    console.log('Dismissing modal');
    modalTour.classList.add('fade-out');
    modalTour.addEventListener('animationend', () => {
      modalTour.classList.add('hidden');
      localStorage.setItem('modalDismissed', 'true');
      console.log('Modal dismissed and hidden');
    }, { once: true });
  });
} else {
  console.log('Modal elements not found');
}





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
