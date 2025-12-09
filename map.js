document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([50, 10], 4); // 歐洲中心

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // 載入 GeoJSON
  fetch('places.geojson')
    .then(res => res.json())
    .then(data => {
      const geojsonLayer = L.geoJSON(data, {
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(`<strong>${props.title}</strong><p>${props.summary}</p><img src="${props.img}" style="width:100%;border-radius:8px;"><p><a class="btn" href="${props.url}">閱讀遊記</a></p>`);

          layer.on('mouseover', () => {
            const box = document.getElementById('info-box');
            box.innerHTML = `<h3>${props.title}</h3><p>${props.summary}</p><img src="${props.img}" style="width:100%;border-radius:8px;"><p><a class="btn" href="${props.url}">閱讀遊記</a></p>`;
          });

          layer.on('mouseout', () => {
            document.getElementById('info-box').innerHTML = '點擊地圖標記查看遊記';
          });
        },
        pointToLayer: (feature, latlng) => L.marker(latlng)
      }).addTo(map);

      // 自動縮放到所有標記
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));
    })
    .catch(err => console.error('載入 places.geojson 失敗', err));
});
