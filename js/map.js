const mapContainer = document.getElementById('map');
if (mapContainer) {
  const map = L.map('map').setView([50, 10], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const infoBox = document.createElement('div');
  infoBox.id = 'info-box';
  infoBox.style.position = 'absolute';
  infoBox.style.display = 'none';
  infoBox.style.background = 'white';
  infoBox.style.padding = '1rem';
  infoBox.style.borderRadius = '8px';
  infoBox.style.zIndex = '500';
  mapContainer.appendChild(infoBox);

  fetch('data/places.geojson')
    .then(r => r.json())
    .then(data => {
      data.forEach(feature => {
        const props = feature.properties;
        const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

        // 使用自訂 icon
        const icon = L.icon({
          iconUrl: props.icon || 'images/default-marker.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        const marker = L.marker(coords, {icon: icon}).addTo(map);

        // hover 放大 + 顯示 infoBox
        marker.on('mouseover', (e) => {
          marker.setIcon(L.icon({
            iconUrl: props.icon || 'images/default-marker.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50]
          }));
          infoBox.innerHTML = `<h3>${props.title}</h3>
                               <p>${props.summary}</p>
                               <img src="${props.img}" style="width:100px;height:auto">
                               <p>Click to read more</p>`;
          infoBox.style.display = 'block';
          infoBox.style.left = (e.originalEvent.offsetX + 20) + 'px';
          infoBox.style.top = (e.originalEvent.offsetY + 20) + 'px';
        });

        marker.on('mouseout', () => {
          marker.setIcon(icon);
          infoBox.style.display = 'none';
        });

        marker.on('click', () => {
          if (props.url) window.location.href = props.url;
        });
      });
    });
}
