fetch('places.geojson')
  .then(r=>r.json())
  .then(data=>{
    data.features.forEach(f=>{
      const coords = f.geometry.coordinates;
      const props = f.properties;
      const marker = L.marker([coords[1], coords[0]]).addTo(map);

      // hover 顯示 info-box
      marker.on('mouseover', ()=>{
        const box = document.getElementById('info-box');
        box.innerHTML = `<h3>${props.title}</h3>
                         <p>${props.summary}</p>
                         <img src="${props.img || 'placeholder.jpg'}" style="width:100%;height:auto;">
                         <p><a href="${props.url}">閱讀遊記</a></p>`;
      });

      marker.on('mouseout', ()=>{
        const box = document.getElementById('info-box');
        box.innerHTML = `點擊地圖標記查看遊記`;
      });

      marker.on('click', ()=>{
        if(props.url) window.location.href = props.url;
      });
    });
  });
