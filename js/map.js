document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // 1. 初始化地圖
    const map = L.map('map').setView([48.8566, 2.3522], 5);

    // 2. 載入底圖
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 3. 標記群組
    const clusterGroup = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 40
    });

    // 4. 建立預覽盒子
    const infoBox = document.createElement('div');
    infoBox.id = 'info-box';
    infoBox.style.display = 'none';
    mapContainer.appendChild(infoBox);

    // 5. 抓取資料
    fetch('data/posts.json')
        .then(r => r.json())
        .then(posts => {
            posts.forEach(p => {
                const baseIcon = L.icon({
                    iconUrl: p.icon || 'images/markers/default.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });

                const bigIcon = L.icon({
                    iconUrl: p.icon || 'images/markers/default.png',
                    iconSize: [48, 48],
                    iconAnchor: [24, 48]
                });

                const marker = L.marker([p.lat, p.lng], { icon: baseIcon });

                // 懸停事件
                marker.on('mouseover', () => {
                    marker.setIcon(bigIcon);
                    infoBox.innerHTML = `
                        <div class="map-preview-card">
                            <img src="${p.image}">
                            <div class="preview-content">
                                <span class="badge">${p.country}</span>
                                <h3>${p.title}</h3>
                                <p>${p.summary}</p>
                                <span class="click-hint">Click to read more →</span>
                            </div>
                        </div>
                    `;
                    infoBox.style.display = 'block';
                    infoBox.style.opacity = '1';
                });

                // 跟隨滑鼠
                marker.on('mousemove', (e) => {
                    const pos = e.containerPoint;
                    infoBox.style.left = (pos.x + 15) + 'px';
                    infoBox.style.top = (pos.y + 15) + 'px';
                });

                // 移出事件
                marker.on('mouseout', () => {
                    marker.setIcon(baseIcon);
                    infoBox.style.display = 'none';
                });

                // 點擊事件
                marker.on('click', () => {
                    window.location.href = `post.html?id=${p.id}`;
                });

                clusterGroup.addLayer(marker);
            });

            map.addLayer(clusterGroup);

            // 自動縮放以包含所有點
            if (posts.length > 0) {
                map.fitBounds(clusterGroup.getBounds().pad(0.1));
            }

            // 🌟 核心修正：強制地圖刷新大小，解決「不會動」或「灰色區塊」
            setTimeout(() => {
                map.invalidateSize();
            }, 400);
        });

    // 視窗縮放時也要刷新
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });
});
