const map = L.map('map').setView([50, 10], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

fetch('data/posts.json')
  .then(r => r.json())
  .then(posts => {
    posts.forEach(p => {
      const marker = L.marker([p.lat, p.lng]).addTo(map);
      marker.on('mouseover', () => {
        document.getElementById('info-box').innerHTML = `
          <h3>${p.title}</h3>
          <img src="${p.image}">
          <p>${p.summary}</p>
          <a href="post.html?id=${p.id}">Read more</a>
        `;
      });
    });
  });