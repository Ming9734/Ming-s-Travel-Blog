document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return; // 確保只在 map.html 執行

    // 1. 初始化地圖 (設定初始視角為歐洲中心)
    const map = L.map('map').setView([48.8566, 2.3522], 5);

    // 2. 載入底圖 (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 3. 設定 MarkerCluster (標記群組)
    const clusterGroup = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 40
    });

    // 4. 建立浮動 InfoBox (卡片預覽)
    const infoBox = document.createElement('div');
    infoBox.id = 'info-box';
    // 初始樣式設定
    Object.assign(infoBox.style, {
        position: 'absolute',
        display: 'none',
        zIndex: '1000',
        pointerEvents: 'none', // 🌟 關鍵：避免滑鼠卡在盒子上面導致 marker 閃爍
        transition: 'opacity 0.2s ease'
    });
    mapContainer.appendChild(infoBox);

    // 5. 載入資料並生成標記
    fetch('data/posts.json')
        .then(r => r.json())
        .then(posts => {
            posts.forEach(p => {
                const coords = [p.lat, p.lng];

                // 定義大小圖示
                const baseIcon = L.icon({
                    iconUrl: p.icon || 'images/markers/default.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                });

                const bigIcon = L.icon({
                    iconUrl: p.icon || 'images/markers/default.png',
                    iconSize: [45, 45],
                    iconAnchor: [22, 45]
                });

                const marker = L.marker(coords, { icon: baseIcon });

                // --- 事件處理：滑鼠進入 ---
                marker.on('mouseover', (e) => {
                    marker.setIcon(bigIcon); // 變大效果
                    
                    // 填入卡片內容 (套用你的玻璃質感樣式)
                    infoBox.innerHTML = `
                        <div class="map-preview-card">
                            <img src="${p.image}" alt="${p.title}">
                            <div class="preview-content">
                                <span class="badge">${p.country}</span>
                                <h3>${p.title}</h3>
                                <p>${p.summary}</p>
                                <div class="click-hint">Click to read more →</div>
                            </div>
                        </div>
                    `;
                    infoBox.style.display = 'block';
                    infoBox.style.opacity = '1';
                });

                // --- 事件處理：滑鼠移動 (讓卡片跟隨滑鼠) ---
                marker.on('mousemove', (e) => {
                    // 使用 containerPoint 獲取相對於地圖容器的精準座標
                    const point = e.containerPoint;
                    // 偏移 15px 避免擋住滑鼠指針
                    infoBox.style.left = (point.x + 15) + 'px';
                    infoBox.style.top = (point.y + 15) + 'px';
                });

                // --- 事件處理：滑鼠離開 ---
                marker.on('mouseout', () => {
                    marker.setIcon(baseIcon); // 恢復大小
                    infoBox.style.display = 'none';
                    infoBox.style.opacity = '0';
                });

                // --- 事件處理：點擊跳轉 ---
                marker.on('click', () => {
                    window.location.href = `post.html?id=${p.id}`;
                });

                clusterGroup.addLayer(marker);
            });

            // 將所有標記加入地圖並自動調整視野
            map.addLayer(clusterGroup);
            if (posts.length > 0) {
                map.fitBounds(clusterGroup.getBounds().pad(0.1));
            }
        })
        .catch(err => console.error('Error loading map data:', err));
});
