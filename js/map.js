
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
                    // --- 📱 手機版：對齊 JSON 欄位與 renderCard 邏輯 ---
                    marker.on('click', (e) => {
                        // 1. 徹底阻斷地圖點擊事件，防止秒開秒關
                        if (e.originalEvent) e.originalEvent.stopPropagation();
                        L.DomEvent.stopPropagation(e); 
                        
                        // 2. 搬移容器
                        document.body.appendChild(infoBox); 
                        infoBox.id = 'info-box';
                        infoBox.className = 'marker-info mobile-active'; 

                        // 3. 🛡️ 資料對接 (嚴格參考你的 renderCard 變數名)
                        const title = p.title || "Untitled";
                        const summary = p.summary || "";
                        const imgSrc = p.preview || ""; // 你的 JSON 使用的是 p.preview
                        const locationText = `${p.city || ''} , ${p.country || ''}`;
                        
                        // UNESCO 處理邏輯 (對照你的渲染函式)
                        let unescoTag = '';
                        if (p.unescoType) {
                            const typeNames = {
                                'natural': 'UNESCO Natural Heritage',
                                'cultural': 'UNESCO Cultural Heritage',
                                'mixed': 'UNESCO Mixed Heritage'
                            };
                            unescoTag = `<div class="unesco-badge unesco-${p.unescoType}" style="background:#f39c12; color:white; padding:2px 8px; border-radius:6px; font-size:0.65rem; display:inline-block; margin-bottom:5px;">${typeNames[p.unescoType]}</div>`;
                        }

                        // 4. 注入 HTML (加入跳轉功能 onclick)
                        infoBox.innerHTML = `
                            <div class="map-preview-card" onclick="window.location.href='post.html?id=${p.id}'" style="display:flex; width:100%; height:100%;">
                                <div class="card-img-side" style="flex:0 0 120px; height:160px;">
                                    <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                                <div class="preview-content" style="flex:1; padding:15px; display:flex; flex-direction:column; justify-content:center; color:white;">
                                    <div class="badge-container" style="margin-bottom:5px;">
                                        <span class="badge" style="background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:6px; font-size:0.65rem;">${locationText}</span>
                                    </div>
                                    ${unescoTag}
                                    <h3 style="margin:5px 0; font-size:1.1rem; color:white;">${title}</h3>
                                    <p style="margin:0; font-size:0.85rem; opacity:0.9; line-height:1.4;">${summary}</p>
                                    <span style="font-size:0.7rem; opacity:0.6; margin-top:5px;">Click to read more</span>
                                </div>
                            </div>
                        `;

                        // 5. 🎨 樣式與毛玻璃 (強制寫入透明度背景)
                        // 在 marker.on('click') 裡面修改
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

                            /* 🎨 這裡套用與電腦版完全一致的顏色與毛玻璃設定 */
                            background: rgba(255, 255, 255, 0.1) !important; /* 電腦版通常使用極淺白或深色的半透明層 */
                            backdrop-filter: blur(15px) !important;
                            -webkit-backdrop-filter: blur(15px) !important;
    
                            /* 如果你的電腦版是紫色漸層，請改用下面這行 (顏色與電腦版 CSS 同步) */
                            background: linear-gradient(135deg, rgba(79, 70, 229, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%) !important;

                            border-radius: 20px !important;
                            border: 1px solid rgba(255, 255, 255, 0.2) !important;
                            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37) !important;
                            overflow: hidden !important;
                        `;

                        // 6. 更新標記狀態
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
