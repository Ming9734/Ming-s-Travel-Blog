// 初始化 Leaflet 地圖
const map = L.map('map').setView([51.5, -0.12], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 讀取地點資料
fetch('data/places.geojson')
  .then(res => res.json())
  .then(data => {

    data.features.forEach(f => {
      const coords = f.geometry.coordinates;
      const props = f.properties;

      const marker = L.marker([coords[1], coords[0]]).addTo(map);

      // hover 顯示 info-box
      marker.on('mouseover', () => {
        const box = document.getElementById('info-box');
        box.innerHTML = `
          <h3>${props.title}</h3>
          <p>${props.summary}</p>
          <img src="${props.img}" style="width:100%; border-radius:8px; margin:10px 0;">
          <p><a href="${props.url}">Read More</a></p>
        `;
      });

      // 滑鼠移開恢復預設
      marker.on('mouseout', () => {
        const box = document.getElementById('info-box');
        box.innerHTML = `<p>Hover a marker to see details.</p>`;
      });

      // 點擊前往 Post
      marker.on('click', () => {
        window.location.href = props.url;
      });

    });

  });
