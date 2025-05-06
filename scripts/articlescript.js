const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

console.log("Fetched slug:", slug);

fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const article = data.find(item => item.slug === slug);
    console.log("Article found:", article);

    if (article) {
      document.getElementById('article-title').textContent = article['article-title'] || "No title found"; 
      document.getElementById('page-title').textContent = article['article-title'] || "No title found";
      document.getElementById('author').textContent = article.author || "Unknown Author";
      document.getElementById('article-date').textContent = article['article-date'] || "Date not available";
      document.getElementById('image').src = article.image || "default-image.png";
      document.getElementById('article-content').innerHTML = article['article-content'] || "<p>No content available.</p>";

      const imageElement = document.getElementById('image');
      imageElement.onload = () => console.log('Image loaded successfully!');
      imageElement.onerror = () => console.error('Error loading image.');
      imageElement.alt = article['article-title'] || "Article image";

      const relatedPostsContainer = document.querySelector('.recent-posts');

      const currentCategories = Array.isArray(article.category)
        ? article.category
        : [article.category];

      const relatedArticles = data.filter(a => 
        a.slug !== slug &&
        a.category &&
        (Array.isArray(a.category)
          ? a.category.some(cat => currentCategories.includes(cat))
          : currentCategories.includes(a.category))
      );

      const shuffled = relatedArticles.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);

      if (selected.length === 0) {
        relatedPostsContainer.innerHTML += "<p>No related posts found.</p>";
      } else {
        selected.forEach(a => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a class="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top" href="/Z-A-S/article.html?slug=${a.slug}">
              <img src="${a.image}" width="96" height="96" class="flex-shrink-0 rounded" alt="${a['article-title']}" style="object-fit: cover;">
              <div class="col-lg-8">
                <h6 class="mb-0">${a['article-title']}</h6>
                <small class="text-body-secondary">${a['article-date']}</small>
              </div>
            </a>
          `;
          relatedPostsContainer.appendChild(li);
        });
      }

    } else {
      console.log('Article not found for slug:', slug);
      document.getElementById('article-title').textContent = "Article Not Found";
      document.getElementById('page-title').textContent = "Article Not Found | Z-A-S";
      document.getElementById('author').textContent = "";
      document.getElementById('article-date').textContent = "";
      document.getElementById('image').style.display = "none";
      document.getElementById('article-content').innerHTML = "<p>Sorry, the article you're looking for doesn't exist or has been removed.</p>";
    }
  })
  .catch(error => {
    console.error('Error fetching articles:', error);
  });

let lastWidthAbove768 = window.innerWidth > 768;

window.addEventListener('resize', handleSidebarClasses);
window.addEventListener('DOMContentLoaded', handleSidebarClasses);

function handleSidebarClasses() {
  const isNowAbove768 = window.innerWidth > 768;

  if (isNowAbove768 !== lastWidthAbove768) {
    const sidebars = document.querySelectorAll('.dummy-class');

    sidebars.forEach((sidebar) => {
      if (!isNowAbove768) {
        sidebar.className = 'dummy-class';
      } else {
        sidebar.className = 'sidebar dummy-class col-12 ms-1 col-md-2';
      }
    });

    lastWidthAbove768 = isNowAbove768;
  }
}









const images = document.querySelectorAll('.news-item img');

images.forEach(img => {
  img.addEventListener('click', () => {
    const src = img.getAttribute('src');
    const lightbox = document.createElement('div');
    lightbox.classList.add('lightbox');
    lightbox.innerHTML = `<img src="${src}" alt="Image">`;
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', () => {
      lightbox.remove();
    });
  });
});
