const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

console.log("Fetched slug:", slug);

fetch(`collection/articles/${slug}.json`)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(article => {
    console.log("Article data:", article);

    // Populate meta elements
    document.getElementById('article-title').textContent = article.title || "No title found";
    document.getElementById('page-title').textContent = article.title ? `${article.title} | Z-A-S` : "No title found";
    document.getElementById('author').textContent = article.authors || "Unknown Author";
    document.getElementById('article-date').textContent = article.date || "Date not available";
    document.getElementById('image').src = article.cover || "default-image.png";
    document.getElementById('article-content').innerHTML = article.content || "<p>No content available.</p>";

    const imageElement = document.getElementById('image');
    imageElement.onload = () => console.log('Image loaded successfully!');
    imageElement.onerror = () => console.error('Error loading image.');
    imageElement.alt = article.title || "Article image";

    // Related posts logic: fetch index for other slugs
    fetch('collection/articles/index.json')
      .then(resp => resp.json())
      .then(indexData => {
        const relatedContainer = document.querySelector('.recent-posts');
        const currentCategories = Array.isArray(article.categories)
          ? article.categories
          : [article.categories];

        // Fetch other articles metadata (only slugs in index)
        const otherPromises = indexData.published
          .filter(s => s !== slug)
          .map(s => fetch(`collection/articles/${s}.json`).then(r => r.json()).catch(() => null));

        Promise.all(otherPromises).then(others => {
          const valid = others.filter(a => a && a.categories);
          const related = valid.filter(a => {
            const cats = Array.isArray(a.categories) ? a.categories : [a.categories];
            return cats.some(c => currentCategories.includes(c));
          });
          const shuffled = related.sort(() => 0.5 - Math.random()).slice(0, 4);

          if (shuffled.length === 0) {
            relatedContainer.innerHTML += "<p>No related posts found.</p>";
          } else {
            shuffled.forEach(a => {
              const li = document.createElement('li');
              li.innerHTML = `
                <a class="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top" href="/Z-A-S/article.html?slug=${a.slug}">
                  <img src="${a.cover || a.image}" width="96" height="96" class="flex-shrink-0 rounded" alt="${a.title}" style="object-fit: cover;">
                  <div class="col-lg-8">
                    <h6 class="mb-0">${a.title}</h6>
                    <small class="text-body-secondary">${a.date}</small>
                  </div>
                </a>
              `;
              relatedContainer.appendChild(li);
            });
          }
        });
      });
  })
  .catch(error => {
    console.error('Error fetching article:', error);
    document.getElementById('article-title').textContent = "Article Not Found";
    document.getElementById('page-title').textContent = "Article Not Found | Z-A-S";
    document.getElementById('author').textContent = "";
    document.getElementById('article-date').textContent = "";
    document.getElementById('image').style.display = "none";
    document.getElementById('article-content').innerHTML = "<p>Sorry, the article you're looking for doesn't exist or has been removed.</p>";
  });

// Responsive sidebar classes
let lastWidthAbove768 = window.innerWidth > 768;
window.addEventListener('resize', handleSidebarClasses);
window.addEventListener('DOMContentLoaded', handleSidebarClasses);

function handleSidebarClasses() {
  const isNowAbove768 = window.innerWidth > 768;
  if (isNowAbove768 !== lastWidthAbove768) {
    const sidebars = document.querySelectorAll('.dummy-class');
    sidebars.forEach((sidebar) => {
      sidebar.className = isNowAbove768
        ? 'sidebar dummy-class col-12 ms-1 col-md-2'
        : 'dummy-class';
    });
    lastWidthAbove768 = isNowAbove768;
  }
}

// Lightbox for images
const images = document.querySelectorAll('main img');
images.forEach(img => {
  img.addEventListener('click', () => {
    const src = img.getAttribute('src');
    const lightbox = document.createElement('div');
    lightbox.classList.add('lightbox');
    lightbox.innerHTML = `<img src="${src}" alt="Image">`;
    document.body.appendChild(lightbox);
    lightbox.addEventListener('click', () => lightbox.remove());
  });
});
