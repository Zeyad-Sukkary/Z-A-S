// Immediately apply dark mode class if stored preference is 'dark'
(function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('darkmode');
  }
})();

document.addEventListener('click', function (e) {
  const switchBtn = e.target.closest('#theme-switch');
  if (switchBtn) {
    document.body.classList.toggle('darkmode');
    const isDark = document.body.classList.contains('darkmode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
});
