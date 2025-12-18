fetch('data/posts.json')
  .then(r => r.json())
  .then(posts => {
    const grid = document.getElementById('postsGrid');

    posts.sort((a, b) => {
  return a.country.localeCompare(b.country) || a.city.localeCompare(b.city);
});
    posts.forEach(p => {
      const card = document.createElement('a');
      card.href = `post.html?id=${p.id}`;
      card.className = 'post-card';

      card.innerHTML = `
        <img src="${p.image}">
        <div class="overlay">
          <h3>${p.title}</h3>
          <h4><strong>${p.city},${p.country}</strong></h4>
          <p>${p.summary}</p>
          <a>Read more →</a>
        </div>
      `;
      grid.appendChild(card);
    });
  });
