var map2, map3, geojson2, geojson3;

// Function to create the first map (Airport Count)
function createMap2() {
    map2 = L.map('map2', {
        center: [0, 0],
        zoom: 2
    });

    // Add OSM base tile layer
    L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map2);

    // Fetch GeoJSON data
    Promise.all([
        fetch("data/airports.geojson").then(response => response.json()),
        fetch("data/countries.geojson").then(response => response.json())
    ])
    .then(([airportsJson, countriesJson]) => {
        // Calculate the total number of airports for each country
        countriesJson.features.forEach(country => {
            const polygon = country;
            const pointsWithin = turf.pointsWithinPolygon(
                turf.featureCollection(airportsJson.features),
                polygon
            );

            // Store airport count and calculate area
            country.properties.count = pointsWithin.features.length;
        });

        // Styling for the first map
        function style(feature) {
            return {
                fillColor: getColor(feature.properties.count),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        function getColor(count) {
            return count > 100 ? '#800026' :
                   count > 50  ? '#BD0026' :
                   count > 20  ? '#E31A1C' :
                   count > 10  ? '#FC4E2A' :
                   count > 5   ? '#FD8D3C' :
                   count > 0   ? '#FEB24C' :
                                '#FFEDA0';
        }

        // Add the GeoJSON layer for the first map
        geojson2 = L.geoJson(countriesJson, {
            style: style,
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    `<h3>${feature.properties.ADMIN}</h3>
                     Airports: ${feature.properties.count}`
                );
            }
        }).addTo(map2);

        addLegend(map2, 'Airports', [0, 5, 10, 20, 50, 100], [
            '#FFEDA0', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'
        ]);

        // Call the second map function using updated data
        createMap3(countriesJson);
    })
    .catch(error => console.error("Error loading GeoJSON data:", error));
}

// Function to create the second map (Airport Density)
function createMap3(updatedCountriesJson) {
    map3 = L.map('map3', {
        center: [0, 0],
        zoom: 2
    });

    // Add OSM base tile layer
    L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map3);

    // Calculate density (airports per square kilometer)
    updatedCountriesJson.features.forEach(country => {
        const area = turf.area(country) / 1e6; // Convert area to square kilometers
        country.properties.density = (country.properties.count / area) *100000; 
    });

    // Styling for the second map
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

    function getColor(density) {
        return density > 8 ? '#800026' :
               density > 5   ? '#BD0026' :
               density > 2   ? '#E31A1C' :
               density > 1   ? '#FC4E2A' :
               density > 0.5 ? '#FD8D3C' :
               density > 0   ? '#FEB24C' :
                               '#FFEDA0';
    }

    // Add the GeoJSON layer for the second map
    geojson3 = L.geoJson(updatedCountriesJson, {
        style: style,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                `<h3>${feature.properties.ADMIN}</h3>
                 Airport Density: ${feature.properties.density.toFixed(2)} per 100,000 sq. km`
            );
        }
    }).addTo(map3);

    addLegend(map3, 'Airport Density<br>(per 100,000 sq. km)', [0, 0.5, 1, 2, 5, 8], [
        '#FFEDA0', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'
    ]);
}

function addLegend(map, title, grades, colors) {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        // Create the legend container with a gray background
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = '#f4f4f4'; // Light gray background
        div.style.border = '1px solid #ccc'; // Subtle border
        div.style.borderRadius = '5px'; // Rounded corners
        div.style.padding = '10px'; // Padding for the content
        div.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.2)'; // Subtle shadow for better visibility

        // Add the legend title
        div.innerHTML += `<h4 style="text-align: center; margin: 0 0 10px 0;">${title}</h4>`;

        // Loop through grades and add the legend content
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                `<div style="text-align: left; margin: 4px 0;">` +
                `<i style="background:${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border: 1px solid #ccc;"></i>` +
                `${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] : '+'}` +
                `</div>`;
        }

        return div;
    };

    legend.addTo(map);
}

// Initialize both maps when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    createMap2();
});
