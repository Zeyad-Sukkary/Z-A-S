fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');
    const dropdown = document.getElementById('sortOptions');

    if (!container) {
      console.error('No container found with ID article-preview-container');
      return;
    }

    // Helper to convert DD/MM/YY to Date object
    function parseDate(dateStr) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`20${year}`, month - 1, day); // assumes 20YY
    }

    function renderArticles(articles) {
      container.innerHTML = ''; // Clear existing previews

      articles.forEach(article => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article["article-content"];
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        const preview = plainText.slice(0, 160) + ' <a href="/article/?slug=' + article.slug + '" class="link">...read more</a>';

        const previewElement = document.createElement('div');
        previewElement.classList.add('slide-in-left', 'news-item');

        previewElement.innerHTML = `
          <a class="link" href="/article/?slug=${article.slug}">
            <img class="article-image" src="${article.image}" alt="Article Image" width="65%">
            <h3 class="article-title">${article["article-title"]}</h3>
          </a>
          <p class="article-content">${preview}</p>
        `;

        container.appendChild(previewElement);
        observer.observe(previewElement);
      });
    }

    function sortArticles(criteria) {
      let sorted = [...data]; // copy the array
    
      switch (criteria) {
        case 'date':
          sorted.sort((a, b) => parseDate(b["article-date"]) - parseDate(a["article-date"]));
          break;
          case 'trending':
            sorted = data.filter(article => article.Trending === "true");
            break;
          
        case 'title':
          sorted.sort((a, b) => a["article-title"].localeCompare(b["article-title"]));
          break;
        case 'author':
          sorted.sort((a, b) => a.author.localeCompare(b.author));
          break;
        case 'category':
          sorted.sort((a, b) => a.category.localeCompare(b.category));
          break;
      }
    
      renderArticles(sorted);
    }
    

    // Initial render
    sortArticles('date');

    // Dropdown change
    dropdown.addEventListener('change', (e) => {
      sortArticles(e.target.value);
    });
  })
  .catch(error => console.error('Error loading article previews:', error));



  