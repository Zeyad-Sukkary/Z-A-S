fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');
    const sortDropdown = document.getElementById('sortOptions');
    const authorFilter = document.getElementById('authorFilter');
    const categoryNav = document.getElementById('categoryNav');
    const noArticlesMsg = document.getElementById('noArticlesMsg');
    const searchBar = document.getElementById('searchbar');

    const activeFilters = { author: null, category: null };

    const allAuthors = [...new Set(data.map(article => article.author.trim()))].sort();
    const allCategories = [...new Set(data.flatMap(article =>
      Array.isArray(article.category) ? article.category : [article.category]
    ))].filter(Boolean).sort();

    // Populate author dropdown
    function populateAuthorDropdown() {
      authorFilter.innerHTML = `<option value="none" selected>None</option>`;
      allAuthors.forEach(author => {
        const option = document.createElement('option');
        option.value = `author-${author.toLowerCase()}`;
        option.textContent = author;
        authorFilter.appendChild(option);
      });

      if (allAuthors.length <= 1) {
        authorFilter.parentElement.style.display = 'none';
      }
    }

    // Create nav item
    function createNavItem(name, categoryValue, isActive = false) {
      const li = document.createElement('li');
      li.className = 'fade-in nav-item p-2 mx-1 visible';
      li.title = `${name} | Discover`;

      const a = document.createElement('a');
      a.className = `link p-2 nav-link${isActive ? ' active' : ''}`;
      a.href = '#';
      a.textContent = name;
      a.dataset.category = categoryValue;

      li.appendChild(a);
      return li;
    }

    // Populate category navigation
    function populateCategoryNav() {
      categoryNav.innerHTML = '';

      const allItem = createNavItem('All', 'none', true);
      categoryNav.appendChild(allItem);

      allCategories.forEach(category => {
        const li = createNavItem(category, category.toLowerCase());
        categoryNav.appendChild(li);
      });
    }

    // Update active filters
    function updateActiveFilters() {
      const authorVal = authorFilter.value.replace('author-', '');
      activeFilters.author = authorVal !== 'none' ? authorVal.toLowerCase() : null;
      applyFiltersAndSort(sortDropdown.value);
    }

    // Apply filters and sorting
    function applyFiltersAndSort(sortBy) {
      let filtered = [...data];

      // Filter by author
      if (activeFilters.author) {
        filtered = filtered.filter(article =>
          article.author?.toLowerCase() === activeFilters.author
        );
      }

      // Filter by category
      if (activeFilters.category) {
        filtered = filtered.filter(article => {
          const articleCats = Array.isArray(article.category)
            ? article.category.map(c => c.toLowerCase())
            : [article.category?.toLowerCase()];
          return articleCats.includes(activeFilters.category);
        });
      }

      // Filter by search term
      const term = searchBar.value.trim().toLowerCase();
      if (term) {
        filtered = filtered.filter(article => {
          const title = article["article-title"]?.toLowerCase() || "";
          const content = article["article-content"]?.toLowerCase() || "";
          const author = article.author?.toLowerCase() || "";
          const categoryText = Array.isArray(article.category)
            ? article.category.join(' ').toLowerCase()
            : article.category?.toLowerCase() || "";
          return title.includes(term) || content.includes(term) || author.includes(term) || categoryText.includes(term);
        });
      }

      // Sorting
      switch (sortBy) {
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
            const aCat = Array.isArray(a.category) ? a.category.join(' ').toLowerCase() : a.category?.toLowerCase() || '';
            const bCat = Array.isArray(b.category) ? b.category.join(' ').toLowerCase() : b.category?.toLowerCase() || '';
            return aCat.localeCompare(bCat);
          });
          break;
      }

      renderArticles(filtered);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Parse date
    function parseDate(dateStr) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`20${year}`, month - 1, day);
    }

    // Render articles
    function renderArticles(articles) {
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
          const textContent = getTextContent(article["article-content"]);
          const preview = textContent.slice(0, 130) + '....';
          const categories = Array.isArray(article.category) ? article.category : [article.category];

          const col = document.createElement('div');
          col.classList.add('col-md-6');
          col.innerHTML = `
            <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative slide-in-left">
              <div class="col p-4 d-flex flex-column position-static">
                <strong class="d-inline-block mb-2 category-text">${categories.join(' | ')}</strong>
                <h3 class="mb-0" style="color: var(--maintext);">${article["article-title"]}</h3>
                <p class="mb-1 text-body-secondary">${article["article-date"]}</p>
                <p class="card-text mb-auto">${preview}</p>
                <a href="/Z-A-S/article.html?slug=${article.slug}" class="icon-link link gap-1 icon-link-hover stretched-link">
                  Read more <svg class="bi" aria-hidden="true"><use xlink:href="#chevron-right"></use></svg>
                </a>
              </div>
              <div class="col-auto d-none d-lg-block">
                <img src="${article.image || '/path/to/default-image.jpg'}" width="200" height="320" style="object-fit: cover;" alt="Thumbnail">
              </div>
            </div>
          `;

          const card = col.querySelector('.slide-in-left');
          observer.observe(card);
          row.appendChild(col);
        }

        container.appendChild(row);
        triggerSlideInAnimations();
      }
    }

    // Trigger slide-in animations
    function triggerSlideInAnimations() {
      document.querySelectorAll('.slide-in-left').forEach((el) => {
        el.classList.add('visible');
      });
    } 

    // Get text content from HTML
    function getTextContent(html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }

    // IntersectionObserver for animations
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    // Event listeners
    categoryNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();

        // Remove 'active' class from all links
        const links = categoryNav.querySelectorAll('.nav-link');
        links.forEach(link => link.classList.remove('active'));

        // Add 'active' to the clicked link
        e.target.classList.add('active');

        // Update filter and re-render
        const categoryVal = e.target.dataset.category;
        activeFilters.category = categoryVal !== 'none' ? categoryVal : null;
        applyFiltersAndSort(sortDropdown.value);
      }
    });

    authorFilter.addEventListener('change', updateActiveFilters);
    sortDropdown.addEventListener('change', () => applyFiltersAndSort(sortDropdown.value));
    searchBar.addEventListener('input', () => applyFiltersAndSort(sortDropdown.value));

    // Initialize
    populateAuthorDropdown();
    populateCategoryNav();
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
