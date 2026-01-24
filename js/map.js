
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
    marker.on('click', (e) => {
        if (e.originalEvent) e.originalEvent.stopPropagation();
        L.DomEvent.stopPropagation(e); 

        document.body.appendChild(infoBox); 
        infoBox.id = 'info-box';
        infoBox.className = 'marker-info mobile-active'; 

        const title = p.title || "Untitled";
        const summary = p.summary || "";
        const imgSrc = p.preview || "";
        const locationText = `${p.city || ''} , ${p.country || ''}`;
        
        // --- 🌟 完美復刻電腦版 UNESCO 金屬漸層 ---
        let unescoStyle = '';
        const typeNames = {
            'natural': 'UNESCO Natural Heritage',
            'cultural': 'UNESCO Cultural Heritage',
            'mixed': 'UNESCO Mixed Heritage'
        };

        if (p.unescoType === 'natural') {
            // 🌿 自然遺產：Emerald Gold
            unescoStyle = 'background: linear-gradient(145deg, #a8e6cf 0%, #34d399 50%, #10b981 100%); border-bottom: 2px solid #059669;';
        } else if (p.unescoType === 'cultural') {
            // 🏛️ 文化遺產：Polished Gold
            unescoStyle = 'background: linear-gradient(145deg, #fef3c7 0%, #fbbf24 50%, #d97706 100%); border-bottom: 2px solid #b45309;';
        } else if (p.unescoType === 'mixed') {
            // 🎨 複合遺產：Ametrine
            unescoStyle = 'background: linear-gradient(145deg, #e9d5ff 0%, #a855f7 50%, #7e22ce 100%); border-bottom: 2px solid #6b21a8;';
        }

        let unescoTag = '';
        if (p.unescoType) {
            unescoTag = `
                <div style="${unescoStyle} color: rgba(0, 0, 0, 0.75); padding: 3px 12px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; display: table; margin: 4px 0 8px 0; border: 1px solid rgba(255, 255, 255, 0.9); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5); text-shadow: 0 0.5px 0 rgba(255, 255, 255, 0.5);">
                    ${typeNames[p.unescoType]}
                </div>`;
        }

        infoBox.innerHTML = `
            <div onclick="window.location.href='post.html?id=${p.id}'" 
                 style="display:flex !important; width:100% !important; height:100% !important; background:transparent !important;">
                
                <div style="flex:0 0 33.33% !important; height:100% !important; overflow:hidden;">
                    <img src="${imgSrc}" style="width:100% !important; height:100% !important; object-fit:cover !important; display:block !important;">
                </div>

                <div style="flex:1 !important; padding:12px 15px !important; display:flex !important; flex-direction:column !important; justify-content:flex-start !important; min-width:0 !important;">
                <h3 style="margin:0 0 4px 0 !important; font-size:1.15rem !important; color:#ffffff !important; font-weight:700 !important; text-shadow: 0 2px 4px rgba(0,0,0,0.3) !important; line-height:1.2;">
                        ${title}
                </h3>    
                    <div style="margin-bottom: 4px;">
                        <span style="display:inline-block; background:white; color:#4f46e5; font-size:0.7rem; padding:2px 10px; border-radius:20px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
                            ${locationText}
                        </span>
                    </div>

                    ${unescoTag}

                    <p style="margin:0 0 8px 0 !important; font-size:0.85rem !important; color:rgba(255,255,255,0.95) !important; line-height:1.4 !important; display:-webkit-box !important; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                        ${summary}
                    </p>

                    <div style="font-size:0.75rem; color:#E6E6FA; font-weight:600; display:flex; align-items:center; margin-top:auto;">
                        Click to read more <span style="margin-left:4px;">➜</span>
                    </div>
                </div>
            </div>
        `;

        // --- 🌟 調整透明度至 0.45 以對齊電腦版的清透感 ---
        infoBox.style.cssText = `
            display: flex !important;
            position: fixed !important;
            bottom: 25px !important;
            left: 5% !important;
            width: 90% !important;
            height: 185px !important; 
            z-index: 9999999 !important;
            border-radius: 20px !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
            overflow: hidden !important;
            
            /* 調整為 0.45 透明度，既透地圖又能看到藍紫漸層 */
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.45) 0%, rgba(147, 51, 234, 0.45) 100%) !important;
            backdrop-filter: blur(12px) saturate(150%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(150%) !important;
        `;

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
