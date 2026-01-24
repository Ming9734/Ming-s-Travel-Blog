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

    function renderCard(p) {
        // 為了手機版也能看到內容，我們保留這套結構，但電腦版會被原本的 CSS 控制回原本的樣子
        let unescoTag = p.unescoType ? `<div class="unesco-badge">${p.unescoType} Heritage</div>` : '';
        infoBox.innerHTML = `
            <div class="map-preview-card" onclick="window.location.href='post.html?id=${p.id}'">
                <div class="card-img-side"><img src="${p.preview}"></div>
                <div class="preview-content">
                    <h3>${p.title}</h3>
                    <div class="location-wrapper"><span class="badge">${p.city}</span></div>
                    ${unescoTag}
                    <p>${p.summary}</p>
                </div>
            </div>
        `;
    }

    fetch('data/posts.json').then(r => r.json()).then(posts => {
        posts.forEach(p => {
            const baseIcon = L.icon({ iconUrl: p.icon || 'images/markers/default.png', iconSize: [32, 32], iconAnchor: [16, 32] });
            const bigIcon = L.icon({ iconUrl: p.icon || 'images/markers/default.png', iconSize: [48, 48], iconAnchor: [24, 48] });
            const marker = L.marker([p.lat, p.lng], { icon: baseIcon });
            marker.options.originalIcon = baseIcon;

            if (!isTouch) {
                // --- 💻 完全還原你的電腦版原始邏輯 ---
                marker.on('mouseover', () => {
                    marker.setIcon(bigIcon);
                    renderCard(p);
                    infoBox.style.display = 'block';
                    infoBox.className = 'marker-info'; // 這裡會啟動你原本電腦版的 CSS
                });

                marker.on('mousemove', (e) => {
                    const pos = e.containerPoint;
                    const padding = 20;
                    const cardWidth = infoBox.offsetWidth;
                    const cardHeight = infoBox.offsetHeight;
                    
                    // 這裡是你原本計算位置的代碼，完全不動它
                    let leftPos = pos.x + padding;
                    if (leftPos + cardWidth + 15 > mapContainer.clientWidth) {
                        leftPos = pos.x - cardWidth - padding;
                    }
                    let topPos = pos.y + padding;
                    if (topPos + cardHeight + 15 > mapContainer.clientHeight) {
                        topPos = pos.y - cardHeight - padding;
                    }

                    infoBox.style.left = leftPos + 'px';
                    infoBox.style.top = topPos + 'px';
                });

                marker.on('mouseout', () => {
                    marker.setIcon(baseIcon);
                    infoBox.style.display = 'none';
                });
            } else {
                // --- 📱 手機版：只負責顯示與 ID 標記 ---
                marker.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    renderCard(p);
                    infoBox.className = 'mobile-active'; // 換成一個全新的 Class，隔離電腦版
                    infoBox.style.display = 'flex';
                });
            }
            clusterGroup.addLayer(marker);
        });
        map.addLayer(clusterGroup);
    });

    map.on('click', () => { infoBox.style.display = 'none'; });
});
