const closeButton = document.querySelector('.closebtn.child');
const alertParent = document.querySelector('.alert.parent');
const alert2 = document.querySelector('.alert2');
const closeButton2 = document.querySelector('.closebtn2');

closeButton.addEventListener('mouseover', () => {
  alertParent.style.backgroundColor = 'rgb(74, 128, 179)';

});

closeButton.addEventListener('mouseout', () => {
  alertParent.style.backgroundColor = '#ebcc1f';
});

  closeButton2.addEventListener('mouseover', () => {
  alert2.style.backgroundColor = 'rgb(99, 0, 0)';

});

  closeButton2.addEventListener('mouseout', () => {
  alert2.style.backgroundColor = '#0f395f';
});

window.addEventListener('load', () => {
document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
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


