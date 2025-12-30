
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

