fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    // Cache the fetched articles if needed for search reuse
    const allArticles = data;

    const container = document.getElementById('article-preview-container');
    const sortDropdown = document.getElementById('sortOptions');
    const authorFilter = document.getElementById('authorFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const noArticlesMsg = document.getElementById('noArticlesMsg');
    const searchBar = document.getElementById('searchbar');

    const activeFilters = {
      author: null,
      category: null
    };

    // Get unique authors and categories
    const authors = [...new Set(data.map(article => article.author.trim()))].sort();
    const categories = [...new Set(data.flatMap(article =>
      Array.isArray(article.category) ? article.category : [article.category]
    ))].sort();

    // Populate filter dropdowns
    function populateFilter(dropdown, values, prefix) {
      dropdown.innerHTML = `<option value="none" selected>None</option>`;
      values.forEach(val => {
        const option = document.createElement('option');
        option.value = `${prefix}-${val.toLowerCase()}`;
        option.textContent = val;
        dropdown.appendChild(option);
      });

      // Hide dropdown if only one option
      if (values.length <= 1) {
        dropdown.parentElement.style.display = 'none';
      }
    }

    populateFilter(authorFilter, authors, 'author');
    populateFilter(categoryFilter, categories, 'category');

    // Listen for search input and update filtering when it changes
    searchBar.addEventListener('input', () => {
      // Use the current sortDropdown value so that search is integrated with other filters.
      applyFiltersAndSort(sortDropdown.value);
    });

    function applyFiltersAndSort(sortCriteria) {
      let filtered = [...data];

      // Apply filters for author and category
      if (activeFilters.author && activeFilters.author !== 'none') {
        filtered = filtered.filter(article =>
          article.author.toLowerCase() === activeFilters.author
        );
      }

      if (activeFilters.category && activeFilters.category !== 'none') {
        filtered = filtered.filter(article =>
          Array.isArray(article.category)
            ? article.category.map(cat => cat.toLowerCase()).includes(activeFilters.category)
            : article.category.toLowerCase() === activeFilters.category
        );
      }

      // Apply search filter (searches title, content, author, and category)
      const searchTerm = searchBar.value.trim().toLowerCase();
      if (searchTerm !== '') {
        filtered = filtered.filter(article => {
          const title = (article["article-title"] || "").toLowerCase();
          const content = (article["article-content"] || "").toLowerCase();
          const author = (article.author || "").toLowerCase();
          const category = Array.isArray(article.category)
            ? article.category.join(' ').toLowerCase()
            : (article.category || "").toLowerCase();
          return title.includes(searchTerm) ||
                 content.includes(searchTerm) ||
                 author.includes(searchTerm) ||
                 category.includes(searchTerm);
        });
      }

      // Apply sorting based on the criteria
      switch (sortCriteria) {
        case 'date':
          filtered.sort((a, b) => parseDate(b["article-date"]) - parseDate(a["article-date"]));
          break;
        case 'trending':
          filtered = filtered.filter(article => article.Trending?.toLowerCase() === "true");
          break;
        case 'title':
          filtered.sort((a, b) => a["article-title"].localeCompare(b["article-title"]));
          break;
        case 'author':
          filtered.sort((a, b) => a.author.localeCompare(b.author));
          break;
        case 'category':
          filtered.sort((a, b) => {
            const aCat = Array.isArray(a.category) ? a.category.join(' ').toLowerCase() : a.category.toLowerCase();
            const bCat = Array.isArray(b.category) ? b.category.join(' ').toLowerCase() : b.category.toLowerCase();
            return aCat.localeCompare(bCat);
          });
          break;
      }

      renderArticles(filtered);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateActiveFilters() {
      const authorValue = authorFilter.value.replace('author-', '');
      const categoryValue = categoryFilter.value.replace('category-', '');

      activeFilters.author = authorValue !== 'none' ? authorValue.toLowerCase() : null;
      activeFilters.category = categoryValue !== 'none' ? categoryValue.toLowerCase() : null;

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
      const preview = plainText.slice(0, 110) + '....';

      // Ensure category is always an array
      const categories = Array.isArray(article.category) ? article.category : [article.category];

      const col = document.createElement('div');
      col.classList.add('col-md-6');

      const cardHTML = `
        <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative slide-in-left">
          <div class="col p-4 d-flex flex-column position-static">
            <strong class="d-inline-block mb-2 category-text">
              ${categories.join(' | ')}
            </strong>
            <h3 class="mb-0" style="color: var(--maintext);">${article["article-title"]}</h3>
            <p class="mb-1 text-body-secondary">${article["article-date"]}</p>
            <p class="card-text mb-auto">${preview}</p>
            <a href="/Z-A-S/article.html?slug=${article.slug}" class="icon-link link gap-1 icon-link-hover stretched-link">
              Read more
              <svg class="bi" aria-hidden="true"><use xlink:href="#chevron-right"></use></svg>
            </a>
          </div>
          <div class="col-auto d-none d-lg-block">
            <img src="${article.image || '/path/to/default-image.jpg'}" width="200" height="320" style="object-fit: cover;" alt="Thumbnail">
          </div>
        </div>
      `;

      col.innerHTML = cardHTML;
      const card = col.querySelector('.slide-in-left');
      observer.observe(card);

      row.appendChild(col);
    }
    container.appendChild(row);
  }
}
