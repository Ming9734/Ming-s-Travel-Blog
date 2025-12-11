// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Create a floating info box
const infoBox = document.createElement("div");
infoBox.id = "hover-info-box";
infoBox.style.position = "absolute";
infoBox.style.display = "none";
infoBox.style.padding = "12px";
infoBox.style.background = "white";
infoBox.style.borderRadius = "8px";
infoBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
infoBox.style.zIndex = 9999;
infoBox.style.pointerEvents = "none"; 
document.body.appendChild(infoBox);


// Load GeoJSON data
fetch("data/places.geojson")
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {

        // Normal icon
        const normalIcon = L.icon({
          iconUrl: "images/marker.png",
          iconSize: [32, 32]
        });

        // Enlarged hover icon
        const hoverIcon = L.icon({
          iconUrl: "images/marker.png",
          iconSize: [48, 48]
        });

        const marker = L.marker(latlng, { icon: normalIcon });
        const props = feature.properties;

        // Hover (mouseenter)
        marker.on("mouseenter", () => {
          marker.setIcon(hoverIcon);

          infoBox.innerHTML = `
            <strong>${props.title}</strong><br>
            <em>${props.summary}</em><br>
            <a href="${props.url}" style="color:#4f46e5;font-weight:bold">
              Click to read more →
            </a>
          `;
          infoBox.style.left = (event.pageX + 15) + "px";
          infoBox.style.top = (event.pageY - 20) + "px";
          infoBox.style.display = "block";
        });

        // Move info box with mouse
        marker.on("mousemove", () => {
          infoBox.style.left = (event.pageX + 15) + "px";
          infoBox.style.top = (event.pageY - 20) + "px";
        });

        // Mouse leave
        marker.on("mouseleave", () => {
          marker.setIcon(normalIcon);
          infoBox.style.display = "none";
        });

        // Click → go to post page
        marker.on("click", () => {
          window.location.href = props.url;
        });

        return marker;
      }
    }).addTo(map);
  });
