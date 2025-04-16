
fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('article-preview-container');

    if (!container) {
      console.error('No container found with ID article-preview-container');
      return;
    }

    data.forEach(article => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article["article-content"];
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      const preview = plainText.slice(0, 160) + ' <a href="/Z-A-S/article.html?slug=' + article.slug + '" class="link">...read more</a>';
    
      const previewElement = document.createElement('div');
      previewElement.classList.add('slide-in-left', 'news-item');
    
      previewElement.innerHTML = `
        <a class="link" href="/Z-A-S/article.html?slug=${article.slug}">
          <img class="article-image" src="${article.image}" alt="Article Image" width="65%">
          <h3 class="article-title">${article["article-title"]}</h3>
        </a>
        <p class="article-content">${preview}</p>
      `;
    
      if (container) {
        container.appendChild(previewElement);
        observer.observe(previewElement); // if you're animating it
      }
      
    });
  
  })
  .catch(error => console.error('Error loading article previews:', error));


