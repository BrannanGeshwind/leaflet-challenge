// Specify the query URL
let geoUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a map centered on a specific location and with zoom level
let myMap = L.map("map").setView([0, 0], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

// Function to determine color based on depth
function getColor(depth) {
  if (depth < 10) return "green";
  else if (depth < 30) return "yellow";
  else if (depth < 50) return "orange";
  else return "red";
}

// Fetch earthquake data and create GeoJSON layer with markers
d3.json(geoUrl)
  .then(data => {
    // Access the features array in the GeoJSON data
    let earthquakes = data.features;

    // Determine the maximum depth for normalization
    let maxDepth = d3.max(earthquakes, d => d.geometry.coordinates[2]);

    // Loop through the earthquake data and create markers on the map
    earthquakes.forEach(earthquake => {
      let coordinates = earthquake.geometry.coordinates;
      let magnitude = earthquake.properties.mag;
      let depth = coordinates[2];

      let size = magnitude * 5;
      let color = getColor(depth);

      // Create a circle marker with size and color
      let marker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: size,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Create a popup with additional information
      marker.bindPopup(
        `<b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth} km`
      );

      // Create a tooltip with additional information
      let tooltipContent = `
        <b>Magnitude:</b> ${magnitude}<br>
        <b>Depth:</b> ${depth} km<br>
        <b>Location:</b> ${earthquake.properties.place}
      `;
      marker.bindTooltip(tooltipContent);

      // Add the marker to the map
      marker.addTo(myMap);
    });

    // Add Legend
    addLegend(myMap, maxDepth);
  })
  .catch(error => {
    console.error("Error fetching earthquake data:", error);
  });

// Function to add legend to the map
function addLegend(map, maxDepth) {
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'legend');
    let depthRanges = [-10, 10, 30, 50, 70, 90];
    let colors = ["green", "yellow", "orange", "red"];
    let labels = [];

    // Loop through depth ranges and generate a label with a colored square for each
    for (let i = 0; i < depthRanges.length - 1; i++) {
      let from = depthRanges[i];
      let to = depthRanges[i + 1];
      let color = colors[i];

      div.innerHTML +=
        `<div class="legend-item">
          <i style="background:${color}; width: 20px; height: 20px;"></i>
          ${from}-${to} km
        </div>`;
    }

    // Add the maximum depth to the legend as "90+"
    let lastColor = colors[colors.length - 1];
    div.innerHTML +=
      `<div class="legend-item">
        <i style="background:${lastColor}; width: 20px; height: 20px;"></i>
        >${depthRanges[depthRanges.length - 1]} km
      </div>`;

    return div;
  };

  legend.addTo(map);
}
