fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');
    const sortDropdown = document.getElementById('sortOptions');
    const authorFilter = document.getElementById('authorFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const noArticlesMsg = document.getElementById('noArticlesMsg');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    const activeFilters = {
      author: [],
      category: []
    };

    function parseDate(dateStr) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`20${year}`, month - 1, day);
    }

    function renderArticles(articles) {
      container.innerHTML = '';

      if (articles.length === 0) {
        noArticlesMsg.classList.remove('nonedisplay');
        return;
      } else {
        noArticlesMsg.classList.add('nonedisplay');
      }

      articles.forEach(article => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article["article-content"];
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        const preview = plainText.slice(0, 160) + ` <a href="/Z-A-S/article.html?slug=${article.slug}" class="link">...read more</a>`;

        const previewElement = document.createElement('div');
        previewElement.classList.add('slide-in-left', 'news-item');

        previewElement.innerHTML = `
          <a class="link" href="/Z-A-S/article.html?slug=${article.slug}">
            <img class="article-image" src="${article.image}" alt="Article Image" width="65%">
            <h3 class="article-title">${article["article-title"]}</h3>
          </a>
          <p class="article-content">${preview}</p>
        `;

        container.appendChild(previewElement);
        observer.observe(previewElement);
      });
    }

    function applyFiltersAndSort(sortCriteria) {
      let filtered = [...data];

      if (activeFilters.author.length > 0) {
        filtered = filtered.filter(article =>
          activeFilters.author.includes(article.author.toLowerCase())
        );
      }

      if (activeFilters.category.length > 0) {
        filtered = filtered.filter(article =>
          activeFilters.category.includes(article.category.toLowerCase())
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
      activeFilters.author = Array.from(authorFilter.selectedOptions).map(option =>
        option.value.replace('author-', '')
      );
      activeFilters.category = Array.from(categoryFilter.selectedOptions).map(option =>
        option.value.replace('category-', '')
      );
      applyFiltersAndSort(sortDropdown.value);
    }

    // Clear Filters Button Logic
    clearFiltersBtn.addEventListener('click', () => {
      // Clear activeFilters arrays
      activeFilters.author = [];
      activeFilters.category = [];

      // Reset dropdowns
      authorFilter.selectedIndex = -1;
      categoryFilter.selectedIndex = -1;

      // Re-apply sorting
      applyFiltersAndSort(sortDropdown.value);
    });

    // Event listeners
    sortDropdown.addEventListener('change', () => applyFiltersAndSort(sortDropdown.value));
    authorFilter.addEventListener('change', updateActiveFilters);
    categoryFilter.addEventListener('change', updateActiveFilters);

    applyFiltersAndSort('date');
  })
  .catch(error => console.error('Error loading article previews:', error));
