document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;

    // 1. 初始化地圖
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

    // --- 🌟 關鍵：將 info-box 放在 body 下，避免座標干擾 ---
    let infoBox = document.getElementById('info-box');
    if (!infoBox) {
        infoBox = document.createElement('div');
        infoBox.id = 'info-box';
        document.body.appendChild(infoBox);
    }

    function renderCard(p) {
        let unescoTag = p.unescoType ? `<div class="unesco-badge unesco-${p.unescoType}">UNESCO Heritage</div>` : '';
        
        infoBox.innerHTML = `
            <div class="map-preview-card" onclick="window.location.href='post.html?id=${p.id}'">
                <div class="card-img-side"><img src="${p.preview}"></div>
                <div class="preview-content">
                    <h3>${p.title}</h3>
                    <div class="location-wrapper"><span class="badge">${p.city}, ${p.country}</span></div>
                    ${unescoTag}
                    <p>${p.summary}</p>
                    <span class="click-hint">Read More</span>
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
                // --- 電腦版：智慧邊界跟隨 ---
                marker.on('mouseover', () => {
                    marker.setIcon(bigIcon);
                    renderCard(p);
                    infoBox.style.display = 'block';
                });

                marker.on('mousemove', (e) => {
                    const padding = 20;
                    const cardWidth = infoBox.offsetWidth;
                    const cardHeight = infoBox.offsetHeight;
                    
                    // 取得滑鼠在視窗中的絕對座標
                    let left = e.originalEvent.clientX + padding;
                    let top = e.originalEvent.clientY + padding;

                    // 🌟 智慧判斷：如果超出右邊，往左移
                    if (left + cardWidth > window.innerWidth) {
                        left = e.originalEvent.clientX - cardWidth - padding;
                    }
                    // 🌟 智慧判斷：如果超出下面，往上移
                    if (top + cardHeight > window.innerHeight) {
                        top = e.originalEvent.clientY - cardHeight - padding;
                    }

                    infoBox.style.left = left + 'px';
                    infoBox.style.top = top + 'px';
                });

                marker.on('mouseout', () => {
                    marker.setIcon(baseIcon);
                    infoBox.style.display = 'none';
                });

                marker.on('click', () => { window.location.href = `post.html?id=${p.id}`; });

            } else {
                // --- 手機版：置底控制 ---
                marker.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    clusterGroup.eachLayer(m => m.setIcon(m.options.originalIcon));
                    marker.setIcon(bigIcon);
                    renderCard(p);
                    infoBox.style.display = 'block';
                    // 清除座標，交給 CSS @media 控制
                    infoBox.style.left = '';
                    infoBox.style.top = '';
                });
            }
            clusterGroup.addLayer(marker);
        });
        map.addLayer(clusterGroup);
        map.on('click', () => {
            infoBox.style.display = 'none';
            clusterGroup.eachLayer(m => m.setIcon(m.options.originalIcon));
        });
        if (posts.length > 0) map.fitBounds(clusterGroup.getBounds().pad(0.1));
    });
});
