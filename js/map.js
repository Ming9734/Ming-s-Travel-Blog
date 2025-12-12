document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;   // 若不是 map.html，直接跳出

  const map = L.map('map').setView([48.8566, 2.3522], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const clusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    maxClusterRadius: 40
  });

  // InfoBox
  const infoBox = document.createElement('div');
  infoBox.id = 'info-box';
  infoBox.style.display = 'none';
  mapContainer.appendChild(infoBox);

  // 載入 posts.json
  fetch('data/posts.json')
    .then(r => r.json())
    .then(posts => {
      posts.forEach(p => {
        const coords = [p.lat, p.lng];

        const baseIcon = L.icon({
          iconUrl: p.icon || 'images/markers/default.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        const bigIcon = L.icon({
          iconUrl: p.icon || 'images/markers/default.png',
          iconSize: [50, 50],
          iconAnchor: [25, 50]
        });

        const marker = L.marker(coords, { icon: baseIcon });

        marker.on('mouseover', (e) => {
          marker.setIcon(bigIcon);
          infoBox.innerHTML = `
            <h3 style="margin:0 0 5px;font-size:1.1rem;">${p.title}</h3>
            <p style="margin:0 0 5px;">${p.summary}</p>
            <img src="${p.image}" style="width:100px;border-radius:6px;margin-bottom:6px;">
            <p style="margin:0;color:#4f46e5;font-weight:600;">Click to read more →</p>
          `;
          infoBox.style.display = 'block';
          infoBox.style.left = (e.originalEvent.offsetX + 20) + 'px';
          infoBox.style.top = (e.originalEvent.offsetY + 20) + 'px';
        });

        marker.on('mouseout', () => {
          marker.setIcon(baseIcon);
          infoBox.style.display = 'none';
        });

        marker.on('click', () => {
          window.location.href = `post.html?id=${p.id}`;
        });

        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
      map.fitBounds(clusterGroup.getBounds().pad(0.1));
    });
});
