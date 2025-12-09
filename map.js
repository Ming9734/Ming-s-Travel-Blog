// 初始化地圖（歐洲中心）
const map = L.map('map').setView([54.5260, 15.2551], 4);

// 使用 OpenStreetMap 瓦片
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 載入 places.geojson
fetch('places.geojson')
  .then(r => r.json())
  .then(data => {
    data.features.forEach(f => {
      const coords = f.geometry.coordinates;
      const props = f.properties;

      // 建立 marker
      const marker = L.marker([coords[1], coords[0]]).addTo(map);

      // 滑鼠 hover 顯示 info-box
      marker.on('mouseover', () => {
        const box = document.getElementById('info-box');
        box.innerHTML = `<h3>${props.title}</h3>
                         <p>${props.summary}</p>
                         <img src="${props.img || 'placeholder.jpg'}" style="width:100px;height:auto;">
                         <p><a href="${props.url}">閱讀遊記</a></p>`;
      });

      // 滑鼠移出 info-box 回復預設內容
      marker.on('mouseout', () => {
        const box = document.getElementById('info-box');
        box.innerHTML = `<p>點擊地圖標記查看遊記</p>`;
      });

      // 點擊 marker 跳轉遊記頁面
      marker.on('click', () => {
        if (props.url) window.location.href = props.url;
      });
    });
  })
  .catch(e => {
    console.error('載入 places.geojson 失敗', e);
    alert('載入地點資料失敗，請檢查 places.geojson 是否存在且有效。');
  });
