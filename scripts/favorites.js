function renderFavorites(list) {
  container.innerHTML = '';

  let toggle = true; // true = left, false = right

  for (let i = 0; i < list.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'row mb-2';

    for (let j = i; j < i + 2 && j < list.length; j++) {
      const art = list[j];
      const txt = (() => {
        const d = document.createElement('div');
        d.innerHTML = art.content;
        return marked.parse(d.textContent || '').slice(0, 250) + '...';
      })();

      const col = document.createElement('div');
      col.className = 'col-md-6';

      // Determine slide-in direction
      const slideClass = toggle ? 'slide-in-left' : 'slide-in-right';
      toggle = !toggle;

      col.innerHTML = `
        <div class="container my-5 ${slideClass}">
          <div class="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg favorite-article">
            
            <!-- Text section -->
            <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
              <strong class="d-inline-block mb-2 category-text">
                ${[].concat(art.categories).join(' | ')}
              </strong>
              <h1 class="display-4 fw-bold lh-1 text-body-emphasis">
                <a href="article.html?slug=${art.slug}" class="text-decoration-none text-dark">
                  ${art.title}
                </a>
              </h1>
              <p class="lead card-text card-text-favorite">
                ${txt}
              </p>
              <div class="d-flex justify-content-between mt-auto small mb-3">
                <span class="category-text">${art.date}</span>
                <span class="category-text">${art.authors}</span>
              </div>
              <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                <a href="article.html?slug=${art.slug}" class="btn btn-primary btn-lg px-4 me-md-2 fw-bold">
                  Read More
                </a>
                <button type="button" class="btn btn-outline-secondary btn-lg px-4">
                  Save
                </button>
              </div>
            </div>

            <!-- Image section -->
            <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
              <a href="article.html?slug=${art.slug}">
                <img src="${art.cover || '/path/to/default-image.jpg'}" class="rounded-lg-3 w-100" style="object-fit:cover; height:400px;" alt="${art.title}">
              </a>
            </div>
            
          </div>
        </div>`;

      // Only observe if element exists
      const slideEl = col.querySelector(`.${slideClass}`);
      if (slideEl) observer.observe(slideEl);

      row.appendChild(col);
    }

    container.appendChild(row);
  }
}
