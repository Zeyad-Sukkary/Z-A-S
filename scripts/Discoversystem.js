fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');
    const sortDropdown = document.getElementById('sortOptions');
    const authorFilter = document.getElementById('authorFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const noArticlesMsg = document.getElementById('noArticlesMsg');

    const activeFilters = {
      author: null,
      category: null
    };

    function applyFiltersAndSort(sortCriteria) {
      let filtered = [...data];

      if (activeFilters.author && activeFilters.author !== 'none') {
        filtered = filtered.filter(article =>
          article.author.toLowerCase() === activeFilters.author
        );
      }

      if (activeFilters.category && activeFilters.category !== 'none') {
        filtered = filtered.filter(article =>
          article.category.toLowerCase() === activeFilters.category
        );
      }

      switch (sortCriteria) {
        case 'date':
          filtered.sort((a, b) => parseDate(b["article-date"]) - parseDate(a["article-date"]));
          break;
        case 'trending':
          filtered = filtered.filter(article => article.Trending === "true");
          break;
        case 'title':
          filtered.sort((a, b) => a["article-title"].localeCompare(b["article-title"]));
          break;
        case 'author':
          filtered.sort((a, b) => a.author.localeCompare(b.author));
          break;
        case 'category':
          filtered.sort((a, b) => a.category.localeCompare(b.category));
          break;
      }

      renderArticles(filtered);
    }

    function updateActiveFilters() {
      activeFilters.author = authorFilter.value.replace('author-', '');
      activeFilters.category = categoryFilter.value.replace('category-', '');
      applyFiltersAndSort(sortDropdown.value);
    }

    sortDropdown.addEventListener('change', () => applyFiltersAndSort(sortDropdown.value));
    authorFilter.addEventListener('change', updateActiveFilters);
    categoryFilter.addEventListener('change', updateActiveFilters);

    applyFiltersAndSort('date');
  })
  .catch(error => console.error('Error loading article previews:', error));

// OUTSIDE FETCH

function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(`20${year}`, month - 1, day);
}

function renderArticles(articles) {
  const container = document.getElementById('article-preview-container');
  const noArticlesMsg = document.getElementById('noArticlesMsg');

  container.innerHTML = '';

  if (articles.length === 0) {
    noArticlesMsg.classList.remove('nonedisplay');
    return;
  } else {
    noArticlesMsg.classList.add('nonedisplay');
  }

  for (let i = 0; i < articles.length; i += 2) {
    const row = document.createElement('div');
    row.classList.add('row', 'mb-2');

    for (let j = i; j < i + 2 && j < articles.length; j++) {
      const article = articles[j];
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article["article-content"];
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      const preview = plainText.slice(0, 130) + '....';

      const col = document.createElement('div');
      col.classList.add('col-md-6');

      const cardHTML = `
        <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative slide-in-left">
          <div class="col p-4 d-flex flex-column position-static">
            <strong class="d-inline-block mb-2 category-text">${article.category}</strong>
            <h3 class="mb-0" style="color: var(--maintext);">${article["article-title"]}</h3>
            <p class="mb-1 text-body-secondary">${article.date}</p>
            <p class="card-text mb-auto">${preview}</p>
            <a href="/Z-A-S/article.html?slug=${article.slug}" class="icon-link link gap-1 icon-link-hover stretched-link">
              Read more
              <svg class="bi" aria-hidden="true"><use xlink:href="#chevron-right"></use></svg>
            </a>
          </div>
          <div class="col-auto d-none d-lg-block">
            <img src="${article.image}" width="200" height="320" style="object-fit: cover;" alt="Thumbnail">
          </div>
        </div>
      `;

      col.innerHTML = cardHTML;

      // Add observer for animation
      const card = col.querySelector('.slide-in-left');
      observer.observe(card);

      row.appendChild(col);
    }

    container.appendChild(row);
  }
}
