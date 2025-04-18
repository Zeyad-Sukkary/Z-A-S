fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');
    const trendingContainer = document.getElementById("trendingContainer");

    if (!container) {
      console.error('No container found with ID article-preview-container');
      return;
    }

    const usedSlugs = new Set();

    // === Trending Cards (Top Headlines) - FIRST ===
    if (trendingContainer) {
      const trending = data.filter(article => article.Trending === "true");
      const selected = trending.sort(() => 0.5 - Math.random()).slice(0, 3);

      selected.forEach(article => {
        usedSlugs.add(article.slug); // ✅ Track it to exclude later

        const card = document.createElement("div");
        card.className = "col h-400";
        card.innerHTML = `
          <a href="/Z-A-S/article.html?slug=${article.slug}" class="text-decoration-none text-white">
            <div class="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg"
              style="background-image: url('${article.image}'); background-size: cover; background-position: center;">
              <div class="d-flex flex-column h-100 p-5 pb-3 text-shadow-1">
                <h3 class="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold text-white">${article["article-title"]}</h3>
                <ul class="d-flex list-unstyled mt-auto">
                  <li class="me-auto">
                    <span class="badge bg-transparent text-light border border-light px-2 py-1 rounded">
                      ${Array.isArray(article.category) ? article.category.join(', ') : article.category}
                    </span>
                  </li>
                  <li class="d-flex align-items-center me-3">
                    <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Author">
                      <use xlink:href="#geo-fill" />
                    </svg>
                    <small>${article.author}</small>
                  </li>
                  <li class="d-flex align-items-center">
                    <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Date">
                      <use xlink:href="#calendar3" />
                    </svg>
                    <small>${article["article-date"]}</small>
                  </li>
                </ul>
              </div>
            </div>
          </a>
        `;
        trendingContainer.appendChild(card);
      });
    }

    // === Main Article Previews (Exclude Trending ones) ===
    const sortedArticles = data
      .filter(article => !usedSlugs.has(article.slug)) // ✅ Exclude trending
      .slice()
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a["article-date"].split('/').map(Number);
        const [dayB, monthB, yearB] = b["article-date"].split('/').map(Number);

        const dateA = new Date(2000 + yearA, monthA - 1, dayA);
        const dateB = new Date(2000 + yearB, monthB - 1, dayB);

        return dateB - dateA;
      });

    sortedArticles.slice(0, 4).forEach(article => {
      usedSlugs.add(article.slug); // Optional if you'll exclude from more later

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article["article-content"];
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      const preview = plainText.slice(0, 130) + '....';

      const previewElement = document.createElement('div');
      previewElement.classList.add('col-md-6');
      previewElement.innerHTML = `
        <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative slide-in-left">
          <div class="col p-4 d-flex flex-column position-static">
            <strong class="d-inline-block mb-2 category-text">
              ${Array.isArray(article.category) ? article.category.join(', ') : article.category}
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
            <img src="${article.image}" width="200" height="320" style="object-fit: cover;" alt="Thumbnail">
          </div>
        </div>
      `;

      container.appendChild(previewElement);

      const cardElement = previewElement.querySelector('.slide-in-left');
      if (typeof observer !== 'undefined' && cardElement) {
        observer.observe(cardElement);
      }
    });

  })
  .catch(error => console.error('Error loading article previews:', error));
