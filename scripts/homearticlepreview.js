fetch('articles/index.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');
    const noArticlesMsg = document.getElementById('noArticlesMsg');
    const used = new Set();

    // Load all published articles
    const loads = data.published.map(slug =>
      fetch(`articles/${slug}.json`)
        .then(r => r.json())
        .catch(e => { console.error(`Error loading ${slug}`, e); return null; })
    );

    Promise.all(loads).then(articles => {
      // Keep only valid
      const valid = articles.filter(a =>
        a && a.title && a.slug && a.date && a.content && a.authors
      );



      fetch('articles/index.json')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('article-preview-container');
        const trendingContainer = document.getElementById('trendingContainer');
        const noArticlesMsg = document.getElementById('noArticlesMsg');
    
        // 1) Load all article JSONs
        const loads = data.published.map(slug =>
          fetch(`articles/${slug}.json`)
            .then(r => r.json())
            .catch(() => null)
        );
    
        Promise.all(loads).then(articles => {
          // 2) Filter out any bad/malformed articles
          const valid = articles.filter(a =>
            a && a.title && a.slug && a.date && a.content && a.authors
          );
    
          // ── INSERT TRENDING SECTION HERE ──
          if (trendingContainer) {
            const trending = valid.filter(a => a.trending);
            const featured = trending.sort(() => 0.5 - Math.random()).slice(0, 3);
            featured.forEach(art => {
              const card = document.createElement('div');
              card.className = 'col col-auto h-400';
              card.innerHTML = `
                <a href="article.html?slug=${art.slug}" class="text-decoration-none text-white">
                  <div class="card card-cover h-100 text-bg-dark rounded-4 shadow-lg"
                    style="
                      background-image: url('${art.cover || art.image || '/path/to/default-image.jpg'}');
                      background-size: cover;
                      background-position: center;
                    ">
                    <div class="d-flex flex-column h-100 p-5 pb-3 text-shadow-1">
                      <h3 class="pt-5 mt-5 mb-4 display-6 fw-bold text-white">${art.title}</h3>
                      <ul class="list-unstyled mt-auto">
                        <li>
                          <span class="badge bg-transparent text-light border border-light px-2 py-1 rounded">
                            ${Array.isArray(art.categories) ? art.categories.join(' | ') : art.categories}
                          </span>
                        </li>
                        <li class="small text-white mt-2">${art.authors}</li>
                        <li class="small text-white">${art.date}</li>
                      </ul>
                    </div>
                  </div>
                </a>
              `;
              trendingContainer.appendChild(card);
            });
          }
          // ── END TRENDING SECTION ──
    
          // 3) Sort valid by date and take the first 4 for “main” previews
          valid.sort((a, b) => {
            const [dA,mA,yA] = a.date.split('/').map(Number);
            const [dB,mB,yB] = b.date.split('/').map(Number);
            return new Date(2000+yB, mB-1, dB) - new Date(2000+yA, mA-1, dA);
          });
          const toShow = valid.slice(0, 4);
    
          // 4) Render “no articles” message if empty
          if (!toShow.length) {
            noArticlesMsg.classList.remove('d-none');
            return;
          }
          noArticlesMsg.classList.add('d-none');
    
          // 5) Render main previews (same as before)…
          for (let i = 0; i < toShow.length; i += 2) {
            // …your two‑column rendering logic here …
          }
    
          // 6) Trigger animations
          document.querySelectorAll('.slide-in-left').forEach(el => el.classList.add('visible'));
        });
      })
      .catch(err => console.error(err));
    



      // Sort by date descending
      valid.sort((a, b) => {
        const [dA,mA,yA] = a.date.split('/').map(Number);
        const [dB,mB,yB] = b.date.split('/').map(Number);
        return new Date(2000+yB, mB-1, dB) - new Date(2000+yA, mA-1, dA);
      });

      // Take first 4
      const toShow = valid.slice(0, 6);
      if (!toShow.length) {
        noArticlesMsg.classList.remove('d-none');
        return;
      }
      noArticlesMsg.classList.add('d-none');

      // Render in two‑column rows
      for (let i = 0; i < toShow.length; i += 3) {
        const row = document.createElement('div');
        row.className = 'row mb-4 ';

        for (let j = i; j < i + 3 && j < toShow.length; j++) {
          const art = toShow[j];
          const text = (() => {
            const div = document.createElement('div');
            div.innerHTML = art.content;
            return (div.textContent || '').slice(0, 80) + '…';
          })();
          const cats = Array.isArray(art.categories) ? art.categories : [art.categories];

          const col = document.createElement('div');
          col.className = 'col-md-4';
          col.innerHTML = `<div class="card news-item shadow-sm">
          <a href="article.html?slug=${art.slug}" class="text-decoration-none cursor-pointer text-white">
  <img src="${art.cover || '/path/to/default-image.jpg'}" class="card-img-top" alt="Thumbnail" style="height: 225px; object-fit: cover;">
  </a><div class="card-body">
    <strong class="d-inline-block mb-2 category-text">${cats.join(' | ')}</strong>
    <a href="article.html?slug=${art.slug}" class="text-decoration-none cursor-pointer text-white">
    <h5 class="card-title">${art.title}</h5>
    <p class="card-text">${text}</p></a>
    <div class="d-flex justify-content-between align-items-center">
      <small class="category-text">${art.date}</small>
      <small class="category-text">${art.authors}</small>
    </div>
  </div>
</div>

`;
          row.appendChild(col);
        }

        container.appendChild(row);
      }

      // Reveal animations
      document.querySelectorAll('.slide-in-left').forEach(el => el.classList.add('visible'));
    });
  })
  .catch(err => console.error('Error loading articles:', err));
