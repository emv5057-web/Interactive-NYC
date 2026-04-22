
// Add your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoiZXZlc21hbm92YSIsImEiOiJjbW9hbTNpZngwOGJ5MndvbXEwbG00ZTRsIn0.OkvCB1LzXYx77_uEj-WB6A';

// Borough information used in the side panel
const boroughData = {
  Manhattan: {
    description: "Manhattan is the densest borough and the financial and cultural core of NYC.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/69/Luchtfoto_van_Lower_Manhattan.jpg",
    population: "1.63 million",
    parks: "250+ parks",
    bikeLanes: "80 miles"
  },
  Brooklyn: {
    description: "Brooklyn is known for culture, food, and iconic neighborhoods.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/00/Brooklyn_Bridge_Manhattan.jpg",
    population: "2.6 million",
    parks: "300+ parks",
    bikeLanes: "140 miles"
  },
  Queens: {
    description: "Queens is the most diverse borough in NYC.",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/db/Queensboro_Bridge_New_York_October_2016_003.jpg",
    population: "2.3 million",
    parks: "275+ parks",
    bikeLanes: "120 miles"
  },
  Bronx: {
    description: "The Bronx is home to Yankee Stadium and large green spaces.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Bronx_Zoo_001.jpg",
    population: "1.47 million",
    parks: "100+ parks",
    bikeLanes: "75 miles"
  },
  "Staten Island": {
    description: "Staten Island is quieter and known for waterfront views.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/39/Look_out_point_%28cropped%29.jpg",
    population: "495,000",
    parks: "170+ parks",
    bikeLanes: "50 miles"
  }
};

// Create the Mapbox map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-74.0060, 40.7128],
  zoom: 9
});

// Function to update the side info panel when a borough is clicked
function updateInfoPanel(name) {
  const info = boroughData[name];
  const infoBox = document.getElementById("borough-info");

  // Fallback if the borough name is not found in the object above
  if (!info) {
    infoBox.innerHTML = `
      <h3>${name}</h3>
      <p>No additional information available.</p>
    `;
    return;
  }

  infoBox.innerHTML = `
    <h3>${name}</h3>
    <img 
      src="${info.image}" 
      alt="${name} photo" 
      style="width:100%; border-radius:10px; margin:12px 0;"
    >
    <p>${info.description}</p>
    <p><strong>Population:</strong> ${info.population}</p>
    <p><strong>Parks:</strong> ${info.parks}</p>
    <p><strong>Bike Lanes:</strong> ${info.bikeLanes}</p>
  `;
}

// Wait until the map is fully loaded before adding data and layers
map.on('load', () => {
  // Add the NYC borough GeoJSON as a source
  map.addSource('boroughs', {
    type: 'geojson',
    data: 'https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Borough_Boundary/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson'
  });

  // Add a fill layer with a different color for each borough
  map.addLayer({
  id: 'borough-fills',
  type: 'fill',
  source: 'boroughs',
  paint: {
    'fill-color': [
      'match',
      [
        'coalesce',
        ['get', 'boro_name'],
        ['get', 'BoroName'],
        ['get', 'BORONAME'],
        ['get', 'boro'],
        ['get', 'name']
      ],
      'Manhattan', '#f4a261',
      'Brooklyn', '#2a9d8f',
      'Queens', '#457b9d',
      'Bronx', '#8d99ae',
      'The Bronx', '#8d99ae',
      'Staten Island', '#e76f51',
      '#bdbdbd'
    ],
    'fill-opacity': 0.55
  }
  });

  // Add a white outline around each borough
  map.addLayer({
    id: 'borough-borders',
    type: 'line',
    source: 'boroughs',
    paint: {
      'line-color': '#ffffff',
      'line-width': 2.5
    }
  });

  // Add a highlight layer that will appear when a borough is clicked
  map.addLayer({
    id: 'borough-highlight',
    type: 'line',
    source: 'boroughs',
    paint: {
      'line-color': '#111111',
      'line-width': 4
    },
    filter: ['==', ['get', 'boro_name'], '']
  });

  // Change cursor to pointer when hovering over boroughs
  map.on('mouseenter', 'borough-fills', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change cursor back when leaving the borough layer
  map.on('mouseleave', 'borough-fills', () => {
    map.getCanvas().style.cursor = '';
  });

  // When the user clicks a borough, update the info panel and highlight it
  map.on('click', 'borough-fills', (e) => {
  const props = e.features[0].properties;

  console.log(props); // ← keep this for debugging

  let name =
    props.boro_name ||
    props.BoroName ||
    props.boro ||
    props.name ||
    props.BORONAME ||
    "Unknown Borough";

  // normalize Bronx naming
  if (name === "The Bronx") {
    name = "Bronx";
  }

  updateInfoPanel(name);

  map.setFilter('borough-highlight', [
    '==',
    ['get', 'boro_name'],
    name
  ]);

  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`<strong>${name}</strong>`)
    .addTo(map);
  });

  // Zoom the map to NYC after the source loads
  map.once('idle', () => {
    const bounds = new mapboxgl.LngLatBounds(
      [-74.2557, 40.4961],
      [-73.7004, 40.9155]
    );
    map.fitBounds(bounds, { padding: 40 });
  });
});