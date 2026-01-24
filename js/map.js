
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

    // --- 🌟 封裝渲染函式：修正手機跳轉與結構 ---
    function renderCard(p) {
        let unescoTag = '';
        if (p.unescoType) {
            const typeNames = {
                'natural': 'UNESCO Natural Heritage',
                'cultural': 'UNESCO Cultural Heritage',
                'mixed': 'UNESCO Mixed Heritage'
            };
            unescoTag = `<div class="unesco-badge unesco-${p.unescoType}">${typeNames[p.unescoType]}</div>`;
        }
        
        // 核心修正：外層增加 onclick 確保手機點擊即跳轉
        // 結構修正：加入 card-img-side 容器確保「圖左文右」
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
                    // --- 電腦版事件 ---
                    marker.on('mouseover', () => {
                        marker.setIcon(bigIcon);
                        renderCard(p); 
                        infoBox.style.display = 'block';
                        infoBox.style.opacity = '1';
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
                    });

                    marker.on('mouseout', () => {
                        marker.setIcon(baseIcon);
                        infoBox.style.display = 'none';
                    });

                    marker.on('click', () => {
                        window.location.href = `post.html?id=${p.id}`;
                    });

                } else {
    // --- 📱 手機版：暴力注入與強制撐開 ---
    marker.on('click', (e) => {
        if (e.originalEvent) e.originalEvent.stopPropagation();
        L.DomEvent.stopPropagation(e); 
        
        // 1. 先搬移
        document.body.appendChild(infoBox); 
        infoBox.id = 'info-box';
        infoBox.className = 'marker-info mobile-active'; 

        // 2. 🌟 暴力注入 HTML (直接在這裡寫，確保內容一定有進去)
        // 請確保 p.img, p.title, p.summary 這些變數名稱與你的資料結構一致
        infoBox.innerHTML = `
            <div class="map-preview-card" style="display:flex !important; width:100% !important; height:100% !important;">
                <div class="card-img-side" style="flex:0 0 120px !important; height:160px !important; overflow:hidden !important;">
                    <img src="${p.img}" style="width:100% !important; height:100% !important; object-fit:cover !important;">
                </div>
                <div class="preview-content" style="flex:1 !important; padding:15px !important; display:flex !important; flex-direction:column !important; justify-content:center !important; min-width:0 !important;">
                    <h3 style="color:white !important; margin:0 0 5px 0 !important; font-size:1.1rem !important; display:block !important;">${p.title}</h3>
                    <p style="color:rgba(255,255,255,0.9) !important; margin:0 !important; font-size:0.85rem !important; display:block !important; line-height:1.4 !important;">${p.summary || ''}</p>
                </div>
            </div>
        `;

        // 3. 強制刷上外殼樣式 (包含毛玻璃)
        infoBox.style.cssText = `
            display: flex !important;
            position: fixed !important;
            bottom: 30px !important;
            left: 5% !important;
            width: 90% !important;
            height: 160px !important;
            z-index: 9999999 !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.85) 0%, rgba(147, 51, 234, 0.85) 100%) !important;
            backdrop-filter: blur(15px) !important;
            -webkit-backdrop-filter: blur(15px) !important;
            border-radius: 20px !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
        `;
        
        // 4. 恢復 Marker 圖示邏輯
        clusterGroup.eachLayer(m => { if (m.options.originalIcon) m.setIcon(m.options.originalIcon); });
        marker.setIcon(bigIcon);
    });
}

                clusterGroup.addLayer(marker);
            });

            map.addLayer(clusterGroup);

            // --- 🛠️ 地圖點擊關閉邏輯 (修正版) ---
            map.on('click', (e) => {
                // 檢查點擊的目標
                // 如果是手機版且 infoBox 正在顯示，我們需要確保不是因為點到 Marker 而誤觸關閉
                if (infoBox.style.display !== 'none') {
                    infoBox.style.display = 'none';
                    
                    // 恢復所有 Pin 的大小
                    clusterGroup.eachLayer(m => {
                        if (m.options.originalIcon) m.setIcon(m.options.originalIcon);
                    });
                }
            });

            if (posts.length > 0) {
                map.fitBounds(clusterGroup.getBounds().pad(0.1));
            }

            setTimeout(() => { map.invalidateSize(); }, 400);
        });

    window.addEventListener('resize', () => { map.invalidateSize(); });
});
