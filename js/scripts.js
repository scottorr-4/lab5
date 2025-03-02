//Map1

// Declare variables
var map;
var minValue;

// Create map
function createMap() {
        map = L.map('map', {
        center: [39.83, -98.58],
        zoom: 4
    });

    // Add OSM base tile layer
    L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    // Call getData function
    getData(map);
}

// Function to calculate minimum value
function calculateMinValue(data) {
    // Create an empty array to store all population values
    var allValues = [];

    // Loop through each city in the dataset
    for (var city of data.features) {
        // Get the population value for the current city
        var value = city.properties.POPULATION; // Use the "POPULATION" attribute

        if (value) { // Ensure that the value exists (avoid null/undefined)
            allValues.push(value); // Add it to the array
        }
    }

    // Get the minimum value from the array
    var minValue = Math.min(...allValues);

    // Return the minimum value
    return minValue;
}

// Calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    // Constant factor adjusts symbol sizes evenly
    var minRadius = 3;
    // Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius

    return radius;
}

// Add circle markers for point features to the map
function createPropSymbols(data) {
    var geojson; 
    // Determine which attribute to visualize with proportional symbols
    var attribute = "POPULATION";

    // Create marker options
    var geojsonMarkerOptions = {
        fillColor: "#0062ff",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8
    };

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            // For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            // Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            // Create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: onEachFeature // Attach popups to each feature
}).addTo(map);
}

// Step 2: Import GeoJSON data
function getData() {
    // Load the data
    fetch("data/USA_Major_Cities.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            // Calculate minimum data value
            minValue = calculateMinValue(json);
            // Call function to create proportional symbols
            createPropSymbols(json);
        })
        .catch(function (error) {
            console.error("Error fetching GeoJSON data:", error);
        });
}

// Function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    // Create HTML string with the city name and population property
    var popupContent = "";
    if (feature.properties) {
        if (feature.properties.NAME) {
            popupContent += "<p2>City: " + feature.properties.NAME + "</p2>";
        }
        if (feature.properties.POPULATION) {
            popupContent += "<p2><br>Population: " + feature.properties.POPULATION + "</p2>";
        }
        layer.bindPopup(popupContent);
    } else {
        console.log("No properties found for feature:", feature);
    }
}

   // Initialize the maps when the DOM is fully loaded
   document.addEventListener('DOMContentLoaded', function() {
    createMap();
  });
  