document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([50, 10], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  fetch('data/places.geojson')
    .then(res => res.json())
    .then(data => {
      const geojsonLayer = L.geoJSON(data, {
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(`<strong>${props.title}</strong><p>${props.summary}</p><img src="${props.img}" style="width:100%;border-radius:8px;"><p><a class="btn" href="${props.url}">Read Post</a></p>`);

          layer.on('mouseover', () => {
            const box = document.getElementById('info-box');
            box.innerHTML = `<h3>${props.title}</h3><p>${props.summary}</p><img src="${props.img}" style="width:100%;border-radius:8px;"><p><a class="btn" href="${props.url}">Read Post</a></p>`;
          });

          layer.on('mouseout', () => {
            document.getElementById('info-box').innerHTML = 'Click a marker to read the post';
          });
        },
        pointToLayer: (feature, latlng) => L.marker(latlng)
      }).addTo(map);

      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));
    })
    .catch(err => console.error('Failed to load places.geojson', err));
});
