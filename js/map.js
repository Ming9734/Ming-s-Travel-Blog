document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;

    const map = L.map('map').setView([48.8566, 2.3522], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 40
    });

    const infoBox = document.createElement('div');
    infoBox.id = 'info-box';
    infoBox.style.display = 'none';
    mapContainer.appendChild(infoBox);

    // --- 🌟 統一渲染函式：電腦與手機共用同一套 Class 結構 ---
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
        
        // 統一使用 map-preview-card 結構，這樣 CSS 才抓得到
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
                    // --- 電腦版：保留原本 hover 邏輯 ---
                    marker.on('mouseover', () => {
                        marker.setIcon(bigIcon);
                        renderCard(p); 
                        infoBox.className = 'marker-info'; // 套用電腦版預設樣式
                        infoBox.style.display = 'block';
                    });

                    marker.on('mousemove', (e) => {
                        const pos = e.containerPoint;
                        const padding = 20;
                        const cardWidth = infoBox.offsetWidth;
                        const cardHeight = infoBox.offsetHeight;
                        const containerWidth = mapContainer.clientWidth;
                        const containerHeight = mapContainer.clientHeight;

                        let leftPos = pos.x + padding;
                        if (leftPos + cardWidth > containerWidth) leftPos = pos.x - cardWidth - padding;
                        
                        let topPos = pos.y + padding;
                        if (topPos + cardHeight > containerHeight) topPos = pos.y - cardHeight - padding;

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
                    // --- 手機版：強力定位手術 ---
                    marker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e); 
                        
                        clusterGroup.eachLayer(m => {
                            if (m.options.originalIcon) m.setIcon(m.options.originalIcon);
                        });
                        
                        marker.setIcon(bigIcon);
                        renderCard(p); 
                        
                        document.body.appendChild(infoBox); // 移出地圖，防止裁切
                        infoBox.className = ''; // 移除電腦版樣式，完全由手機媒體查詢控制
                        
                        infoBox.style.cssText = `
                            display: flex !important;
                            position: fixed !important;
                            bottom: 30px !important;
                            left: 5% !important;
                            width: 90% !important;
                            height: 160px !important;
                            z-index: 9999999 !important;
                            top: auto !important;
                            transform: none !important;
                            background: transparent !important;
                            pointer-events: auto !important;
                        `;
                    });
                }
                clusterGroup.addLayer(marker);
            });

            map.addLayer(clusterGroup);

            map.on('click', () => {
                infoBox.style.display = 'none';
                clusterGroup.eachLayer(m => {
                    if (m.options.originalIcon) m.setIcon(m.options.originalIcon);
                });
            });

            if (posts.length > 0) {
                map.fitBounds(clusterGroup.getBounds().pad(0.1));
            }
        });
});
