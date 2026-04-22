// Add your Mapbox access token here
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

// Create a new Mapbox map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-73.94, 40.70],
  zoom: 8.8
});

// GeoJSON data for NYC boroughs with a few custom properties
const boroughs = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Manhattan",
        population: 1694251,
        area: 22.8,
        fun_fact: "Manhattan is the smallest borough by land area but one of the most densely populated places in the U.S.",
        color: "#f4a261"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.0479, 40.6839],
          [-74.0194, 40.7081],
          [-73.9718, 40.8790],
          [-73.9262, 40.8740],
          [-73.9343, 40.7003],
          [-74.0479, 40.6839]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Brooklyn",
        population: 2736074,
        area: 69.4,
        fun_fact: "Brooklyn would be one of the largest U.S. cities if it were its own city.",
        color: "#2a9d8f"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.0420, 40.5700],
          [-73.8330, 40.5700],
          [-73.8560, 40.7390],
          [-74.0420, 40.7390],
          [-74.0420, 40.5700]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Queens",
        population: 2405464,
        area: 108.7,
        fun_fact: "Queens is known as one of the most diverse urban areas in the world.",
        color: "#457b9d"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-73.9630, 40.5410],
          [-73.7000, 40.5410],
          [-73.7000, 40.8000],
          [-73.9630, 40.8000],
          [-73.9630, 40.5410]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "The Bronx",
        population: 1472654,
        area: 42.2,
        fun_fact: "The Bronx is home to the New York Yankees and the Bronx Zoo.",
        color: "#8d99ae"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-73.9330, 40.7850],
          [-73.7650, 40.7850],
          [-73.7650, 40.9150],
          [-73.9330, 40.9150],
          [-73.9330, 40.7850]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Staten Island",
        population: 495747,
        area: 57.5,
        fun_fact: "Staten Island is the least populated borough and is connected to Manhattan by the Staten Island Ferry.",
        color: "#e76f51"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.2550, 40.4960],
          [-74.0500, 40.4960],
          [-74.0500, 40.6510],
          [-74.2550, 40.6510],
          [-74.2550, 40.4960]
        ]]
      }
    }
  ]
};

// Wait until the map loads before adding data and layers
map.on('load', () => {
  // Add the GeoJSON data as a source
  map.addSource('boroughs', {
    type: 'geojson',
    data: boroughs
  });

  // Add the main fill layer using a color value from each feature
  map.addLayer({
    id: 'borough-fills',
    type: 'fill',
    source: 'boroughs',
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': 0.65
    }
  });

  // Add a border line layer around each borough
  map.addLayer({
    id: 'borough-borders',
    type: 'line',
    source: 'boroughs',
    paint: {
      'line-color': '#ffffff',
      'line-width': 2
    }
  });

  // Add a hover highlight layer
  map.addLayer({
    id: 'borough-hover',
    type: 'line',
    source: 'boroughs',
    paint: {
      'line-color': '#111111',
      'line-width': 4
    },
    filter: ['==', 'name', '']
  });

  // Change the mouse cursor when hovering over boroughs
  map.on('mouseenter', 'borough-fills', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Reset the cursor when the mouse leaves
  map.on('mouseleave', 'borough-fills', () => {
    map.getCanvas().style.cursor = '';
    map.setFilter('borough-hover', ['==', 'name', '']);
  });

  // Highlight the borough border while hovering
  map.on('mousemove', 'borough-fills', (e) => {
    const hoveredName = e.features[0].properties.name;
    map.setFilter('borough-hover', ['==', 'name', hoveredName]);
  });

  // Update the side panel when a borough is clicked
  map.on('click', 'borough-fills', (e) => {
    const props = e.features[0].properties;

    document.getElementById('borough-info').innerHTML = `
      <h3>${props.name}</h3>
      <p><strong>Population:</strong> ${Number(props.population).toLocaleString()}</p>
      <p><strong>Area:</strong> ${props.area} square miles</p>
      <p><strong>Fun Fact:</strong> ${props.fun_fact}</p>
    `;

    // Optional popup for additional interactivity
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${props.name}</strong>`)
      .addTo(map);
  });
});