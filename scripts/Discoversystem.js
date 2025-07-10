fetch('collection/articles/index.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');
    const sortDropdown = document.getElementById('sortOptions');
    const authorFilter = document.getElementById('authorFilter');
    const categoryNav = document.getElementById('categoryNav');
    const noArticlesMsg = document.getElementById('noArticlesMsg');
    const searchBar = document.getElementById('searchbar');

    const activeFilters = { author: null, category: null };

    // Fetch article data based on filenames from index.json
    const articlePromises = data.published.map(slug => {
      return fetch(`collection/articles/${slug}.json`)  // Assuming articles are stored as individual .json files
        .then(response => response.json())
        .catch(error => {
          console.error(`Error loading article ${slug}:`, error);
          return null;  // Return null for failed article loads
        });
    });

    // Step 1: Wait for all article data to be fetched
    Promise.all(articlePromises)
      .then(articles => {
        // Step 2: Filter out invalid articles (those missing required fields)
        const validArticles = articles.filter(article => {
          const isValid = article?.title && article?.slug && article?.date && article?.content && article?.authors;
          if (!isValid) {
            console.error('Malformed article:', article);  // Log malformed article
          }
          return isValid;
        });

        // Step 3: Get unique authors and categories
        const allAuthors = [...new Set(validArticles.map(article => article.authors?.trim()))].sort();
        const allCategories = [...new Set(validArticles.flatMap(article =>
          Array.isArray(article.categories) ? article.categories : [article.categories]
        ))].filter(Boolean).sort();

        // Step 4: Populate author dropdown
        function populateAuthorDropdown() {
          authorFilter.innerHTML = `<option value="none" selected>None</option>`;
          allAuthors.forEach(author => {
            const option = document.createElement('option');
            option.value = `author-${author.toLowerCase()}`;
            option.textContent = author;
            authorFilter.appendChild(option);
          });

          if (allAuthors.length <= 1) {
            authorFilter.parentElement.style.display = 'none';  // Hide if only one author
          }
        }

        // Step 5: Create category navigation item
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

        // Step 6: Populate category navigation
        function populateCategoryNav() {
          categoryNav.innerHTML = '';

          const allItem = createNavItem('All', 'none', true);
          categoryNav.appendChild(allItem);

          allCategories.forEach(category => {
            const li = createNavItem(category, category.toLowerCase());
            categoryNav.appendChild(li);
          });
        }

        // Step 7: Update active filters based on user selection
        function updateActiveFilters() {
          const authorVal = authorFilter.value.replace('author-', '');
          activeFilters.author = authorVal !== 'none' ? authorVal.toLowerCase() : null;
          applyFiltersAndSort(sortDropdown.value);  // Re-apply filters after selection
        }

        // Step 8: Apply filters (author, category, search) and sorting
        function applyFiltersAndSort(sortBy) {
          let filtered = [...validArticles];

          // Filter by author
          if (activeFilters.author) {
            filtered = filtered.filter(article =>
              article.authors?.toLowerCase() === activeFilters.author
            );
          }

          // Filter by category
          if (activeFilters.category) {
            filtered = filtered.filter(article => {
              const articleCats = Array.isArray(article.categories)
                ? article.categories.map(c => c.toLowerCase())
                : [article.categories?.toLowerCase()];
              return articleCats.includes(activeFilters.category);
            });
          }

          // Filter by search term
          const term = searchBar.value.trim().toLowerCase();
          if (term) {
            filtered = filtered.filter(article => {
              const title = article.title?.toLowerCase() || "";
              const content = article.content?.toLowerCase() || "";
              const author = article.authors?.toLowerCase() || "";
              const categoryText = Array.isArray(article.categories)
                ? article.categories.join(' ').toLowerCase()
                : article.categories?.toLowerCase() || "";
              return title.includes(term) || content.includes(term) || author.includes(term) || categoryText.includes(term);
            });
          }

          // Sorting logic
          switch (sortBy) {
            case 'date':
              filtered.sort((a, b) => parseDate(b.date) - parseDate(a.date));
              break;
            case 'trending':
              filtered = filtered.filter(article => article.trending);
              break;
            case 'title':
              filtered.sort((a, b) => a.title.localeCompare(b.title));
              break;
            case 'author':
              filtered.sort((a, b) => a.authors.localeCompare(b.authors));
              break;
            case 'category':
              filtered.sort((a, b) => {
                const aCat = Array.isArray(a.categories) ? a.categories.join(' ').toLowerCase() : a.categories?.toLowerCase() || '';
                const bCat = Array.isArray(b.categories) ? b.categories.join(' ').toLowerCase() : b.categories?.toLowerCase() || '';
                return aCat.localeCompare(bCat);
              });
              break;
          }

          renderArticles(filtered);  // Render filtered articles
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Step 9: Render filtered and sorted articles
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
              const textContent = getTextContent(article.content);
              const preview = textContent.slice(0, 130) + '....';
              const categories = Array.isArray(article.categories) ? article.categories : [article.categories];

              const col = document.createElement('div');
              col.classList.add('col-md-6');
              col.innerHTML = ` 
                <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative slide-in-left">
                  <div class="col p-4 d-flex flex-column position-static">
                    <strong class="d-inline-block mb-2 category-text">${categories.join(' | ')}</strong>
                    <h3 class="mb-0" style="color: var(--maintext);">${article.title}</h3>
                    <p class="mb-1 text-body-secondary">${article.date}</p>
                    <p class="card-text mb-auto">${preview}</p>
                    <a href="/Z-A-S/article.html?slug=${article.slug}" class="icon-link link gap-1 icon-link-hover stretched-link">
                      Read more <svg class="bi" aria-hidden="true"><use xlink:href="#chevron-right"></use></svg>
                    </a>
                  </div>
                  <div class="col-auto d-none d-lg-block">
                    <img src="${article.cover || '/path/to/default-image.jpg'}" width="200" height="320" style="object-fit: cover;" alt="Thumbnail">
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

        // Step 10: Trigger slide-in animations
        function triggerSlideInAnimations() {
          document.querySelectorAll('.slide-in-left').forEach((el) => {
            el.classList.add('visible');
          });
        }

        // Step 11: Get text content from HTML (for preview)
        function getTextContent(html) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          return tempDiv.textContent || tempDiv.innerText || '';
        }

        // Step 12: Define parseDate function to handle date format 'DD/MM/YY'
        function parseDate(dateStr) {
          const [day, month, year] = dateStr.split('/');
          return new Date(`20${year}-${month}-${day}`).getTime();
        }

        // Event listeners for filters and sorting
        categoryNav.addEventListener('click', (e) => {
          if (e.target.tagName === 'A') {
            e.preventDefault();

            // Remove 'active' class from all links
            const links = categoryNav.querySelectorAll('.nav-link');
            links.forEach(link => link.classList.remove('active'));

            // Add 'active' to the clicked link
            e.target.classList.add('active');

            // Update category filter and re-render
            const categoryVal = e.target.dataset.category;
            activeFilters.category = categoryVal !== 'none' ? categoryVal : null;
            applyFiltersAndSort(sortDropdown.value);
          }
        });

        authorFilter.addEventListener('change', updateActiveFilters);
        sortDropdown.addEventListener('change', () => applyFiltersAndSort(sortDropdown.value));
        searchBar.addEventListener('input', () => applyFiltersAndSort(sortDropdown.value));

        // Step 13: Initial population and filtering
        populateCategoryNav();
        populateAuthorDropdown();
        applyFiltersAndSort(sortDropdown.value);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
      });
  })
  .catch(error => {
    console.error('Error fetching index.json:', error);
  });
