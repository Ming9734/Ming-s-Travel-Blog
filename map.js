const map = L.map('map').setView([54.5260, 15.2551], 4); // 歐洲中心
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19, attribution:'© OpenStreetMap contributors'
}).addTo(map);

fetch('places.geojson')
.then(r=>r.json())
.then(data=>{
  data.features.forEach(f=>{
    const coords = f.geometry.coordinates;
    const props = f.properties;
    const marker = L.marker([coords[1], coords[0]]).addTo(map);
    marker.on('click', ()=>{
      const box = document.getElementById('info-box');
      box.innerHTML = `<h3>${props.title}</h3><p>${props.summary}</p>
      <p><a href="${props.url}">閱讀遊記</a></p>`;
      if(props.url && props.url.startsWith('#')){
        const target = document.querySelector(props.url);
        if(target) target.scrollIntoView({behavior:'smooth'});
      }
    });
  });
});
