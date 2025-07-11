// Skeleton Helpers
function showSkeletons(container, count, isTrending = false) {
  const placeholderCards = [];
  for (let i = 0; i < count; i++) {
    if (isTrending) {
      placeholderCards.push(`
        <div class="col">
          <div class="card card-cover h-100 text-bg-dark rounded-4 shadow-lg placeholder-glow" aria-hidden="true">
            <div class="d-flex flex-column h-100 p-5 pb-3">
              <h3 class="pt-5 mt-5 mb-4 display-6 fw-bold">
                <span class="placeholder col-8 bg-secondary"></span>
              </h3>
              <ul class="list-unstyled mt-auto">
                <li><span class="placeholder col-4 bg-secondary"></span></li>
                <li class="mt-2"><span class="placeholder col-3 bg-secondary"></span></li>
                <li><span class="placeholder col-5 bg-secondary"></span></li>
              </ul>
            </div>
          </div>
        </div>
      `.trim());
    } else {
      placeholderCards.push(`
        <div class="col-md-4 mb-4">
          <div class="card news-item shadow-sm placeholder-glow" aria-hidden="true">
            <div class="card-img-top placeholder" style="height: 225px;"></div>
            <div class="card-body">
              <strong class="d-inline-block mb-2 placeholder col-6"></strong>
              <h5 class="card-title placeholder col-7"></h5>
              <p class="card-text placeholder col-9"></p>
              <div class="d-flex justify-content-between align-items-center">
                <small class="placeholder col-4"></small>
                <small class="placeholder col-4"></small>
              </div>
            </div>
          </div>
        </div>
      `.trim());
    }
  }
  const wrapper = document.createElement('div');
  wrapper.className = isTrending ? 'row row-cols-1 row-cols-md-3 g-4' : 'row';
  wrapper.innerHTML = placeholderCards.join('');
  container.innerHTML = '';
  container.appendChild(wrapper);
}

// Main Fetch + Render
const container = document.getElementById('article-preview-container');
const trendingContainer = document.getElementById('trendingContainer');
const noArticlesMsg = document.getElementById('noArticlesMsg');

// Show initial skeletons
showSkeletons(container, 6);
if (trendingContainer) showSkeletons(trendingContainer, 3, true);

fetch('articles/index.json')
  .then(res => res.json())
  .then(data => {
    const loads = data.published.map(slug =>
      fetch(`articles/${slug}.json`)
        .then(r => r.json())
        .catch(() => null)
    );

    Promise.all(loads).then(rawArticles => {
      const valid = rawArticles.filter(a =>
        a && a.title && a.slug && a.date && a.content && a.authors
      );

      if (trendingContainer) {
        const trending = valid.filter(a => a.trending);
        const featured = trending.sort(() => 0.5 - Math.random()).slice(0, 3);

        trendingContainer.classList.remove('row-cols-1', 'row-cols-md-2', 'row-cols-md-3');
        if (featured.length === 1) trendingContainer.classList.add('row-cols-1');
        else if (featured.length === 2) trendingContainer.classList.add('row-cols-1', 'row-cols-md-2');
        else trendingContainer.classList.add('row-cols-1', 'row-cols-md-3');

        trendingContainer.innerHTML = '';
        featured.forEach(art => {
          const card = document.createElement('div');
          card.className = 'col h-400';
          card.innerHTML = `
            <a href="article.html?slug=${art.slug}" class="text-decoration-none text-white">
              <div class="card card-cover h-100 text-bg-dark rounded-4 shadow-lg"
                style="background-image: url('${art.cover || art.image || '/pics/default-image.webp'}'); background-size: cover; background-position: center;">
                <div class="d-flex flex-column h-100 p-5 pb-3 text-shadow-1">
                  <h3 class="pt-5 mt-5 mb-4 display-6 fw-bold text-white">${art.title}</h3>
                  <ul class="list-unstyled mt-auto">
                    <li><span class="badge bg-transparent text-light border border-light px-2 py-1 rounded">
                      ${Array.isArray(art.categories) ? art.categories.join(' | ') : art.categories}
                    </span></li>
                    <li class="small text-white mt-2">${art.authors}</li>
                    <li class="small text-white">${art.date}</li>
                  </ul>
                </div>
              </div>
            </a>
          `.trim();
          trendingContainer.appendChild(card);
        });
      }

      valid.sort((a, b) => {
        const [dA, mA, yA] = a.date.split('/').map(Number);
        const [dB, mB, yB] = b.date.split('/').map(Number);
        return new Date(2000+yB, mB-1, dB) - new Date(2000+yA, mA-1, dA);
      });
      const toShow = valid.slice(0, 6);

      if (!toShow.length) {
        noArticlesMsg.classList.remove('d-none');
        return;
      }
      noArticlesMsg.classList.add('d-none');

      container.innerHTML = '';
      for (let i = 0; i < toShow.length; i += 3) {
        const row = document.createElement('div');
        row.className = 'row mb-4';

        for (let j = i; j < i + 3 && j < toShow.length; j++) {
          const art = toShow[j];
          const textSnippet = (() => {
            const div = document.createElement('div');
            div.innerHTML = art.content;
            return (div.textContent || '').slice(0, 80) + '…';
          })();

          const col = document.createElement('div');
          col.className = 'col-md-4';
          col.innerHTML = `
            <div class="card news-item shadow-sm slide-in-left">
              <a href="article.html?slug=${art.slug}" class="text-decoration-none text-white">
                <img src="${art.cover || '/path/to/default-image.jpg'}" class="card-img-top" alt="Thumbnail" style="height:225px;object-fit:cover;">
              </a>
              <div class="card-body">
                <strong class="d-inline-block mb-2 category-text">${
                  Array.isArray(art.categories) ? art.categories.join(' | ') : art.categories
                }</strong>
                <a href="article.html?slug=${art.slug}" class="text-decoration-none text-white">
                  <h5 class="card-title">${art.title}</h5>
                  <p class="card-text">${textSnippet}</p>
                </a>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="category-text">${art.date}</small>
                  <small class="category-text">${art.authors}</small>
                </div>
              </div>
            </div>
          `.trim();
          row.appendChild(col);
        }
        container.appendChild(row);
      }

      document.querySelectorAll('.slide-in-left').forEach(el => el.classList.add('visible'));
    });
  })
  .catch(err => console.error('Error loading articles:', err));
