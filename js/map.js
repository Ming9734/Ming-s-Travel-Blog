const mapContainer = document.getElementById('map');

if (mapContainer) {
  const map = L.map('map').setView([50, 10], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // ====== Marker Cluster 群組 ======
  const clusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    maxClusterRadius: 40
  });

  // ====== Info Box ======
  const infoBox = document.createElement('div');
  infoBox.id = 'info-box';
  infoBox.style.position = 'absolute';
  infoBox.style.display = 'none';
  infoBox.style.background = 'white';
  infoBox.style.padding = '1rem';
  infoBox.style.borderRadius = '8px';
  infoBox.style.zIndex = '500';
  infoBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  mapContainer.appendChild(infoBox);

  // ====== Load GeoJSON ======
  fetch('data/places.geojson')
    .then(r => r.json())
    .then(data => {

      data.forEach(feature => {
        const props = feature.properties;
        const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

        const baseIcon = L.icon({
          iconUrl: props.icon || 'images/markers/default.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        const bigIcon = L.icon({
          iconUrl: props.icon || 'images/markers/default.png',
          iconSize: [50, 50],
          iconAnchor: [25, 50]
        });

        const marker = L.marker(coords, { icon: baseIcon });

        // ====== Hover 放大 + info ======
        marker.on('mouseover', (e) => {
          marker.setIcon(bigIcon);

          infoBox.innerHTML = `
            <h3 style="margin:0 0 5px;font-size:1.1rem;">${props.title}</h3>
            <p style="margin:0 0 5px;">${props.summary}</p>
            <img src="${props.img}" style="width:100px;border-radius:6px;margin-bottom:6px;">
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
          if (props.url) window.location.href = props.url;
        });

        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
    });
}
