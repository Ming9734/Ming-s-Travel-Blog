document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // 判斷是否為觸控裝置或窄螢幕
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;

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

    // --- 🌟 封裝渲染函式：電腦與手機各走各的路，互不干擾 ---
    function renderCard(p, isMobile) {
        if (!isMobile) {
            // --- 電腦版：完全回歸你最原始的結構，不破壞寬高計算 ---
            infoBox.innerHTML = `
                <div class="marker-info-inner">
                    <img src="${p.preview}" style="width:100%; border-radius:6px; margin-bottom:8px; object-fit:cover;">
                    <h3>${p.title}</h3>
                    <p>${p.summary}</p>
                    <div class="btn">View Details</div>
                </div>
            `;
        } else {
            // --- 手機版：使用圖左文右結構 ---
            let unescoTag = '';
            if (p.unescoType) {
                const typeNames = {
                    'natural': 'UNESCO Natural Heritage',
                    'cultural': 'UNESCO Cultural Heritage',
                    'mixed': 'UNESCO Mixed Heritage'
                };
                unescoTag = `<div class="unesco-badge unesco-${p.unescoType}">${typeNames[p.unescoType]}</div>`;
            }
            
            infoBox.innerHTML = `
                <div class="map-preview-card" onclick="window.location.href='post.html?id=${p.id}'">
                    <div class="card-img-side">
                        <img src="${p.preview}">
                    </div>
                    <div class="preview-content">
                        <h3>${p.title}</h3>
                        <div class="location-wrapper">
                            <span class="badge">${p.city} , ${p.country}</span>
                        </div>
                        ${unescoTag}
                        <p>${p.summary}</p>
                        <span class="click-hint">Click to read more</span>
                    </div>
                </div>
            `;
        }
    }

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
                marker.options.originalIcon = baseIcon;

                if (!isTouch) {
                    // --- 電腦版事件：完全保留你原本的計算邏輯 ---
                    marker.on('mouseover', () => {
                        marker.setIcon(bigIcon);
                        renderCard(p, false); // 走電腦結構
                        infoBox.className = 'marker-info'; // 恢復原本的 class
                        infoBox.style.display = 'block';
                    });

                    marker.on('mousemove', (e) => {
                        const pos = e.containerPoint;
                        const padding = 20;
                        const edgeBuffer = 15;
                        const cardWidth = infoBox.offsetWidth;
                        const cardHeight = infoBox.offsetHeight;
                        const containerWidth = mapContainer.clientWidth;
                        const containerHeight = mapContainer.clientHeight;

                        let leftPos = pos.x + padding;
                        if (leftPos + cardWidth + edgeBuffer > containerWidth) {
                            leftPos = pos.x - cardWidth - padding;
                        }
                        leftPos = Math.max(edgeBuffer, leftPos);

                        let topPos = pos.y + padding;
                        if (topPos + cardHeight + edgeBuffer > containerHeight) {
                            topPos = pos.y - cardHeight - padding;
                        }
                        topPos = Math.max(edgeBuffer, topPos);

                        infoBox.style.left = leftPos + 'px';
                        infoBox.style.top = topPos + 'px';
                        infoBox.style.transform = 'none'; // 避免 transform 衝突
                    });

                    marker.on('mouseout', () => {
                        marker.setIcon(baseIcon);
                        infoBox.style.display = 'none';
                    });

                    marker.on('click', () => {
                        window.location.href = `post.html?id=${p.id}`;
                    });

                } else {
                    // --- 手機版事件 ---
                    marker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e); 
                        
                        clusterGroup.eachLayer(m => {
                            if (m.options.originalIcon) m.setIcon(m.options.originalIcon);
                        });
                        
                        marker.setIcon(bigIcon);
                        renderCard(p, true); // 走手機結構
                        
                        // 搬移到 body 以免被 map 容器裁切
                        document.body.appendChild(infoBox); 
                        
                        infoBox.className = ''; // 撕掉電腦版標籤
                        
                        // 強制定位與高度
                        infoBox.style.cssText = `
                            display: flex !important;
                            position: fixed !important;
                            bottom: 30px !important;
                            left: 5% !important;
                            width: 90% !important;
                            height: 160px !important;
                            z-index: 9999999 !important;
                            top: auto !important;
                            left: 5% !important;
                            transform: none !important;
                            pointer-events: auto !important;
                            background: transparent !important;
                        `;
                    });
                }

                clusterGroup.addLayer(marker);
            });

            map.addLayer(clusterGroup);

            // 點擊地圖空白處：關閉卡片並恢復 Pin
            map.on('click', () => {
                infoBox.style.display = 'none';
                clusterGroup.eachLayer(m => {
                    if (m.options.originalIcon) m.setIcon(m.options.originalIcon);
                });
            });

            if (posts.length > 0) {
                map.fitBounds(clusterGroup.getBounds().pad(0.1));
            }

            setTimeout(() => { map.invalidateSize(); }, 400);
        });

    window.addEventListener('resize', () => { 
        map.invalidateSize(); 
    });
});
