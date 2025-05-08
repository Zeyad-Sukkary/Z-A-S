// Fetch article index from GitHub API
fetch('https://api.github.com/repos/Zeyad-Sukkary/Z-A-S/contents/articles')
  .then(res => res.json())
  .then(files => {
    // Filter out non-JSON files
    const articles = files.filter(file => file.name.endsWith('.json'));

    // Element references
    const container = document.getElementById('article-preview-container');
    const sortDropdown = document.getElementById('sortOptions');
    const authorFilter = document.getElementById('authorFilter');
    const categoryNav = document.getElementById('categoryNav');
    const searchBar = document.getElementById('searchbar');
    const noArticlesMsg = document.getElementById('noArticlesMsg');

    // Active filter state
    const activeFilters = { author: null, category: null };

    // Derive unique authors and categories
    const allAuthors = [...new Set(articles.map(a => a.authors.trim()))].sort();
    const allCategories = [...new Set(articles.flatMap(a => a.categories))].filter(Boolean).sort();

    // Populate author dropdown
    function populateAuthorDropdown() {
      authorFilter.innerHTML = `<option value="none" selected>All Authors</option>`;
      allAuthors.forEach(author => {
        const opt = document.createElement('option');
        opt.value = author.toLowerCase();
        opt.textContent = author;
        authorFilter.appendChild(opt);
      });
      if (allAuthors.length < 2) authorFilter.parentElement.style.display = 'none';
    }

    // Create category nav item
    function createNavItem(name, value, active = false) {
      const li = document.createElement('li');
      li.className = 'nav-item';
      const a = document.createElement('a');
      a.className = `nav-link${active? ' active':''}`;
      a.href = '#';
      a.textContent = name;
      a.dataset.category = value;
      li.appendChild(a);
      return li;
    }

    // Populate category nav
    function populateCategoryNav() {
      categoryNav.innerHTML = '';
      categoryNav.appendChild(createNavItem('All', 'none', true));
      allCategories.forEach(cat => {
        categoryNav.appendChild(createNavItem(cat, cat.toLowerCase()));
      });
    }

    // Update filters
    function updateFilters() {
      // Author
      const auth = authorFilter.value;
      activeFilters.author = auth !== 'none' ? auth : null;
      applyFiltersAndSort(sortDropdown.value);
    }

    // Apply filters and sort
    function applyFiltersAndSort(sortBy) {
      let result = [...articles];
      // Author filter
      if (activeFilters.author) {
        result = result.filter(a => a.authors.toLowerCase() === activeFilters.author);
      }
      // Category filter
      if (activeFilters.category) {
        result = result.filter(a => a.categories.map(c=>c.toLowerCase()).includes(activeFilters.category));
      }
      // Search filter
      const term = searchBar.value.trim().toLowerCase();
      if (term) {
        result = result.filter(a => {
          return a.title.toLowerCase().includes(term)
            || a.content.toLowerCase().includes(term)
            || a.authors.toLowerCase().includes(term)
            || a.categories.join(' ').toLowerCase().includes(term);
        });
      }
      // Sorting
      switch(sortBy) {
        case 'date':
          result.sort((a,b) => new Date(b.date) - new Date(a.date));
          break;
        case 'title':
          result.sort((a,b) => a.title.localeCompare(b.title));
          break;
        case 'author':
          result.sort((a,b) => a.authors.localeCompare(b.authors));
          break;
        case 'category':
          result.sort((a,b) => a.categories[0].localeCompare(b.categories[0]));
          break;
        case 'trending':
          result = result.filter(a => a.trending);
          break;
        case 'featured':
          result = result.filter(a => a.featured);
          break;
      }
      renderArticles(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Render article cards
    function renderArticles(list) {
      container.innerHTML = '';
      if (list.length === 0) {
        noArticlesMsg.classList.remove('hidden');
        return;
      }
      noArticlesMsg.classList.add('hidden');

      list.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
          <img src="../pics/${article.cover}" alt="${article.title} cover" class="card-img">
          <div class="card-body">
            <h3>${article.title}</h3>
            <p class="date">${article.date}</p>
            <p class="categories">${article.categories.join(' | ')}</p>
            <p class="preview">${article.content.slice(0, 130)}...</p>
            <a href="../article.html?slug=${article.slug}" class="read-more">Read more</a>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // Event listeners
    authorFilter.addEventListener('change', updateFilters);
    sortDropdown.addEventListener('change', () => applyFiltersAndSort(sortDropdown.value));
    searchBar.addEventListener('input', () => applyFiltersAndSort(sortDropdown.value));
    categoryNav.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        categoryNav.querySelectorAll('.nav-link').forEach(a=>a.classList.remove('active'));
        e.target.classList.add('active');
        const cat = e.target.dataset.category;
        activeFilters.category = cat !== 'none'? cat: null;
        applyFiltersAndSort(sortDropdown.value);
      }
    });

    // Initialize UI
    populateAuthorDropdown();
    populateCategoryNav();
    applyFiltersAndSort('date');
  })
  .catch(err => console.error('Error loading articles:', err));
