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

    // --- 🌟 重要修正：把 infoBox 放到 body 而不是 mapContainer 內 ---
    let infoBox = document.getElementById('info-box');
    if (!infoBox) {
        infoBox = document.createElement('div');
        infoBox.id = 'info-box';
        document.body.appendChild(infoBox); // 移到 body 確保 fixed 定位有效
    }
    infoBox.style.display = 'none';

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
        
        // 🌟 結構修正：加入 card-img-side 容器
        infoBox.innerHTML = `
            <div class="map-preview-card" style="cursor: pointer;">
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

        // 🌟 跳轉修正：直接綁定事件給 infoBox
        infoBox.onclick = () => {
            window.location.href = `post.html?id=${p.id}`;
        };
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
                    marker.on('mouseover', () => {
                        marker.setIcon(bigIcon);
                        renderCard(p); 
                        infoBox.style.display = 'block';
                    });
                    marker.on('mousemove', (e) => {
                        const pos = e.containerPoint;
                        // 電腦版位置計算
                        const mapRect = mapContainer.getBoundingClientRect();
                        infoBox.style.left = (mapRect.left + pos.x + 20) + 'px';
                        infoBox.style.top = (mapRect.top + pos.y + 20) + 'px';
                    });
                    marker.on('mouseout', () => {
                        marker.setIcon(baseIcon);
                        infoBox.style.display = 'none';
                    });
                    marker.on('click', () => { window.location.href = `post.html?id=${p.id}`; });
                } else {
                    marker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e); 
                        clusterGroup.eachLayer(m => {
                            if (m.options.originalIcon) m.setIcon(m.options.originalIcon);
                        });
                        marker.setIcon(bigIcon);
                        renderCard(p);
                        infoBox.style.display = 'block';
                        // 手機版清空 style，交給 CSS
                        infoBox.style.left = '';
                        infoBox.style.top = '';
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
            if (posts.length > 0) map.fitBounds(clusterGroup.getBounds().pad(0.1));
        });
});
