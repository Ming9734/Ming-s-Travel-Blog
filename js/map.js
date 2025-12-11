// js/map.js
document.addEventListener('DOMContentLoaded', () => {
  // 建立地圖
  const map = L.map('map', { preferCanvas: true }).setView([50, 10], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // icon: 預設與放大版
  const defaultIcon = L.icon({
    iconUrl: 'images/marker-default.png', // 若沒有自訂圖，改回 leaflet 默认或換成线上图
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36]
  });

  const hoverIcon = L.icon({
    iconUrl: 'images/marker-large.png',
    iconSize: [44, 64],
    iconAnchor: [22, 64],
    popupAnchor: [0, -56]
  });

  // 如果你沒有自訂 marker 檔，可以使用 leaflet 的默认 icon（以下為 fallback）
  function getDefaultIcon() {
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  // 若找不到本地 images/marker-default.png 就 fallback
  // (這裡檢查是否有指定檔存在較麻煩，直接在 GeoJSON 裡可指定 icon url)
  const fallbackDefault = getDefaultIcon();

  // marker-info DOM
  const infoDiv = document.getElementById('marker-info');

  // 讀取 GeoJSON
  fetch('data/places.geojson')
    .then(res => res.json())
    .then(data => {
      // 建立 geojson layer
      const geojsonLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          // 使用預設 icon (若你提供 images/marker-default.png，改成 defaultIcon)
          const iconToUse = fallbackDefault;
          return L.marker(latlng, { icon: iconToUse });
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {};
          // Optional: popup (可移除)
          layer.bindPopup(`<strong>${props.title}</strong><p>${props.summary}</p><p><a class="btn" href="${props.url}">Click to read more</a></p>`);

          // mouseover: 放大 marker、顯示浮動 info（放在 map container）
          layer.on('mouseover', (e) => {
            // 換 icon -> 如果你有 large icon 檔，放上去，否則進行 CSS 放大（下方 fallback）
            try {
              layer.setIcon(hoverIcon);
            } catch (err) {
              // ignore if hoverIcon not available
            }

            // 準備內容
            const title = props.title || '';
            const summary = props.summary || '';
            const img = props.img || '';
            const url = props.url || '#';

            infoDiv.innerHTML = `
              ${img ? `<img src="${img}" alt="${title}">` : ''}
              <h3>${title}</h3>
              <p>${summary}</p>
              <a class="btn" href="${url}">Click to read more</a>
            `;

            // 位置：把 latlng 轉成 container point (像素)，放在 map container 相對位置
            const mapContainer = map.getContainer();
            const pos = map.latLngToContainerPoint(layer.getLatLng());
            // offset for small screens or near edges
            const left = pos.x;
            const top = pos.y;

            // 將 infoDiv 放到該位置（加上 transform 讓它在標記上方）
            infoDiv.style.left = `${left}px`;
            infoDiv.style.top = `${top}px`;
            infoDiv.classList.add('visible');
            infoDiv.setAttribute('aria-hidden', 'false');
          });

          // mouseout: 還原 icon、隱藏浮動 info
          layer.on('mouseout', (e) => {
            try {
              layer.setIcon(fallbackDefault);
            } catch (err) {}
            infoDiv.classList.remove('visible');
            infoDiv.setAttribute('aria-hidden', 'true');
          });

          // click: 導向該篇文章
          layer.on('click', (e) => {
            if (props.url) {
              // 如果想在新分頁開啟： window.open(props.url, '_blank');
              window.location.href = props.url;
            }
          });
        }
      }).addTo(map);

      // 自動調整範圍
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.12));
    })
    .catch(err => {
      console.error('Failed to load places.geojson', err);
    });

  // Optional: 當地圖移動或縮放時，若 infoDiv 顯示，讓它保持在該 marker 上
  map.on('move zoom', () => {
    if (infoDiv.classList.contains('visible')) {
      // 取目前顯示的 title 來尋找其 marker 的 latlng (簡單做法：在 infoDiv dataset 儲存 latlng)
      // 我們在上方沒保存 latlng dataset，若需要精準更新可改寫存 latlng 至 infoDiv.dataset
    }
  });
});
