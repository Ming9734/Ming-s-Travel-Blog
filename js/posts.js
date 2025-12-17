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
          <p><strong>${p.city},${p.country}</strong></p>
          <p>${p.summary}</p>
          <span>Read more →</span>
        </div>
      `;
      grid.appendChild(card);
    });
  });
