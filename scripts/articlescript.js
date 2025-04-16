const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// Debug: log the slug to see if it's being fetched correctly
console.log("Fetched slug:", slug);

fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    // Find the article that matches the slug
    const article = data.find(item => item.slug === slug);
    
    // Debug: log the article to see if it's being found
    console.log("Article found:", article);

    if (article) {
      // Populate the article content
      document.getElementById('article-title').textContent = article['article-title'] || "No title found"; 
      document.getElementById('page-title').textContent = article['article-title'] || "No title found";
      document.getElementById('author').textContent = article.author || "Unknown Author"; // Default if no author
      document.getElementById('article-date').textContent = article['article-date'] || "Date not available"; // Default if no date
      document.getElementById('image').src = article.image || "default-image.png"; // Default image if no image found
      document.getElementById('article-content').innerHTML = article['article-content'] || "<p>No content available.</p>"; // Default content

      // Optionally, you can add a check if the image is taking longer than expected
      const imageElement = document.getElementById('image');
      imageElement.onload = function() {
        console.log('Image loaded successfully!');
      };
      imageElement.onerror = function() {
        console.error('Error loading image.');
      };

    } else {
      console.log('Article not found for slug:', slug);
      // Optional: Show a message if the article isn't found
      document.getElementById('article-title').textContent = "Article Not Found";
      document.getElementById('article-content').innerHTML = "<p>Sorry, the article you're looking for doesn't exist.</p>";
    }
  })
  .catch(error => {
    console.error('Error fetching articles:', error);
  });