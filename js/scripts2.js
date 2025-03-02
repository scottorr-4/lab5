//Map 2

var map2, geojson2;

// Define the info control for map2
var info2 = L.control();

info2.onAdd = function (map2) {
    this._div = L.DomUtil.create('div', 'info'); // Create a div with a class "info"
    this.update();
    return this._div;
};

// Method to update the control based on feature properties passed
info2.update = function (props) {
    this._div.innerHTML = '<h4>US Population Density</h4>' + (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>' :
        'Hover over a state');
};

// Function to highlight features on mouseover
function highlightFeature2(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();

    // Update the info control for map2
    info2.update(layer.feature.properties);
}

// Function to reset the highlight on mouseout
function resetHighlight2(e) {
    geojson2.resetStyle(e.target);
    info2.update(); // Reset the info control for map2
}

// Function to zoom to a feature on click
function zoomToFeature2(e) {
    map2.fitBounds(e.target.getBounds());
}

// Function to handle each feature
function onEachFeature2(feature, layer) {
    layer.on({
        mouseover: highlightFeature2,
        mouseout: resetHighlight2,
        click: zoomToFeature2
    });
}

// Function to create map2
function createMap2() {
        map2 = L.map('map2', {
        center: [39.83, -98.58],
        zoom: 4
    });

    // Add OSM base tile layer
    L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map2);

    // Add GeoJSON layer to map2 with styling and event handlers

          fetch("data/states.json")
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                // Use the JSON data to create the geojson2 layer
                geojson2 = L.geoJson(json, { 
                    style: style,
                    onEachFeature: onEachFeature2
                }).addTo(map2);
    
                // Add info control to map2
                info2.addTo(map2);
    
                // Add legend to map2
                legend2.addTo(map2);
            })
            .catch(function (error) {
                console.error("Error loading the data: ", error);
            });
    }
    

// Function to get color based on density
function getColor(d) {
    return d > 1000 ? '#08589e' :
           d > 500  ? '#2b8cbe' :
           d > 200  ? '#4eb3d3' :
           d > 100  ? '#7bccc4' :
           d > 50   ? '#a8ddb5' :
           d > 20   ? '#ccebc5' :
           d > 10   ? '#e0f3db' :
                      '#f7fcf0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Define the legend control for map2
var legend2 = L.control({position: 'bottomright'});

legend2.onAdd = function (map2) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

      
    // Add the title to the legend
    div.innerHTML = '<h4>People / mile<sup>2</sup></h4>'

    // Loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

// Initialize the map when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    createMap2();
});
