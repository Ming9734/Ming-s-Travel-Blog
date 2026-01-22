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

                    // --- 🌟 新增：UNESCO 判斷邏輯 ---
                    let unescoTag = '';
                    if (p.unescoType) {
                        const labels = {
                            'natural': 'UNESCO Natural Heritage',
                            'cultural': 'UNESCO Cultural Heritage',
                            'mixed': 'UNESCO Mixed Heritage'
                        };
                        // 根據類型產生對應的 class (unesco-natural, unesco-cultural 等)
                        unescoTag = `<span class="unesco-badge unesco-${p.unescoType}">${labels[p.unescoType]}</span>`;
                    }
                    // ----------------------------
                    
                    infoBox.innerHTML = `
                        <div class="map-preview-card">
                            <img src="${p.preview}">
                            <div class="preview-content">
                                <h3>${p.title}</h3>
                                <div class="badge-row">
                                <span class="badge">${p.city} , ${p.country}</span>
                                ${unescoTag}</div>
                                <p>${p.summary}</p>
                                <span class="click-hint">Click to read more</span>
                            </div>
                        </div>
                    `;
                    infoBox.style.display = 'block';
                    infoBox.style.opacity = '1';
                });

                // 跟隨滑鼠
                // 跟隨滑鼠並防止溢出
marker.on('mousemove', (e) => {
    const pos = e.containerPoint; // 獲取相對於地圖容器的座標
    
    const padding = 20;          // 滑鼠與卡片之間的間距
    const edgeBuffer = 15;       // 距離地圖邊緣的最小緩衝（不貼死邊緣）
    
    // 獲取卡片本身的寬高
    const cardWidth = infoBox.offsetWidth;
    const cardHeight = infoBox.offsetHeight;
    
    // 獲取地圖容器的寬高
    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;

    // --- X 軸邏輯 ---
    let leftPos = pos.x + padding;
    // 如果「目前位置 + 卡片寬度 + 緩衝」超過容器寬度
    if (leftPos + cardWidth + edgeBuffer > containerWidth) {
        // 則改為顯示在滑鼠左側
        leftPos = pos.x - cardWidth - padding;
    }
    // 確保不會超出左邊界
    leftPos = Math.max(edgeBuffer, leftPos);

    // --- Y 軸邏輯 ---
    let topPos = pos.y + padding;
    // 如果「目前位置 + 卡片高度 + 緩衝」超過容器高度
    if (topPos + cardHeight + edgeBuffer > containerHeight) {
        // 則改為顯示在滑鼠上方
        topPos = pos.y - cardHeight - padding;
    }
    // 確保不會超出頂部邊界 (例如被導覽列擋住)
    topPos = Math.max(edgeBuffer, topPos);

    // 套用位置
    infoBox.style.left = leftPos + 'px';
    infoBox.style.top = topPos + 'px';
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
