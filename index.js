var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Initialize & Create Two Separate LayerGroups: earthquakes & tectonicPlates
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();
const earthquakeClusters = L.markerClusterGroup();


var myMap = L.map('map', {
    // center: [40.862287, 29.276523],
    center: [17.5499, 30.9537],
    // zoom: 9
    zoom: 2,

});


var osmGeocoder = new L.Control.Geocoder({
    collapsed: true,
    position: 'topleft',
    text: 'Search',
    title: 'Testing'
}).addTo(myMap);
document.getElementsByClassName('leaflet-control-geocoder-icon')[0]
    .className += ' fa fa-search';
document.getElementsByClassName('leaflet-control-geocoder-icon')[0]
    .title += 'Search for a place';

L.control.locate({ locateOptions: { maxZoom: 19 } }).addTo(myMap);

var measureControl = new L.Control.Measure({
    position: 'topleft',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: 'hectares'
});
measureControl.addTo(myMap);

var defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(myMap);

var GoogleMaps = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
})

var GoogleTerrainHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
})
var GoogleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
})
var GoogleSatelliteHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
})


var baseLayers = {
    'OpenStreetMap Default': defaultLayer,
    'OpenStreetMap H.O.T.': L.tileLayer.provider('OpenStreetMap.HOT'),
    'Esri WorldStreetMap': L.tileLayer.provider('Esri.WorldStreetMap'),
    'Esri WorldTopoMap': L.tileLayer.provider('Esri.WorldTopoMap'),
    'Esri WorldImagery': L.tileLayer.provider('Esri.WorldImagery'),
    "Google Maps": GoogleMaps,
    "Google Terrain Hybrid": GoogleTerrainHybrid,
    "Google Satellite": GoogleSatellite,
    "Google Satellite Hybrid": GoogleSatelliteHybrid,
};


var overlayLayers = {
    "Earthquakes": earthquakeClusters,
    "Fault Lines": tectonicPlates
};

L.control.layers(baseLayers, overlayLayers).addTo(myMap);


d3.json(earthquakesURL, function (earthquakeData) {
    console.log(earthquakeData)
    // Function to Determine Size of Marker Based on the Magnitude of the Earthquake
    function markerSize(magnitude) {
        if (magnitude < 2) return 6;
        return magnitude * 4;
    }


    var earthquakes = [];

    // Load the earthquake data from a GeoJSON file or API
    d3.json(earthquakesURL, function (data) {
        // Loop through the earthquake data and add each earthquake to the array
        data.features.forEach(function (earthquake) {
            earthquakes.push(earthquake);
        });

        // Sort the earthquake data by date
        earthquakes.sort(function (a, b) {
            return new Date(b.properties.time) - new Date(a.properties.time);
        });

        // Generate the HTML for the earthquake list
        var earthquakeListHTML = '';
        earthquakes.forEach(function (earthquake) {
            earthquakeListHTML += '<div class="earthquake" data-lat="' + earthquake.geometry.coordinates[1] + '" data-lng="' + earthquake.geometry.coordinates[0] + '">';
            earthquakeListHTML += '<h4>' + earthquake.properties.title + '</h4>';
            // earthquakeListHTML += '<p>Mag: ' + earthquake.properties.mag + '</p>';
            // earthquakeListHTML += '<p>Place: ' + earthquake.properties.place + '</p>';
            earthquakeListHTML += new Date(earthquake.properties.time).toLocaleString() + '</p>';
            earthquakeListHTML += '</div>';
        });

        // Add the earthquake list HTML to the #info element
        document.querySelector('#info').innerHTML = earthquakeListHTML;

        // Add a click event listener to the earthquake list
        var earthquakeElements = document.querySelectorAll('.earthquake');
        let marker;

        earthquakeElements.forEach(function (earthquakeElement) {
            earthquakeElement.addEventListener('click', function () {
                console.log(earthquakeElement)
                // Get the latitude and longitude of the selected earthquake
                var lat = earthquakeElement.getAttribute('data-lat');
                var lng = earthquakeElement.getAttribute('data-lng');
                // Zoom to the selected earthquake on the map
                myMap.setView([lat, lng], 18);

               
            });
        });

    });
    // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: chooseColor(feature.properties.mag),
            color: "#000000",
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    // Function to Determine Color of Marker Based on the Magnitude of the Earthquake
    function chooseColor(magnitude) {
        switch (true) {
            case magnitude > 5:
                return "#581845";
            case magnitude > 4:
                return "#900C3F";
            case magnitude > 3:
                return "#C70039";
            case magnitude > 2:
                return "#FF5733";
            case magnitude > 1:
                return "#FFC300";
            default:
                return "#DAF7A6";
        }
    }



    L.geoJSON(earthquakeData, {
        // Burada L.circleMarker yerine L.marker kullanılabilir
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup Describing the Place & Time of the Earthquake
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place +
                "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) +
                "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
        // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakeClusters);

    // Add earthquakeClusters Layer to the Map
    earthquakeClusters.addTo(myMap);


    // Retrieve platesURL (Tectonic Plates GeoJSON Data) with D3
    d3.json(platesURL, function (plateData) {
        // Create a GeoJSON Layer the plateData
        L.geoJson(plateData, {
            color: "#DC143C",
            weight: 2
            // Add plateData to tectonicPlates LayerGroups 
        }).addTo(tectonicPlates);
        // Add tectonicPlates Layer to the Map
        tectonicPlates.addTo(myMap);
    });

    // // Set Up Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var magnitudeLevels = [0, 1, 2, 3, 4, 5];
        var tectonicPlatesColor = "#DC143C";
        var tectonicPlatesWeight = "2";
        div.innerHTML += "<h1>Lejant</h1>"
        div.innerHTML +=
            'Tektonik Plaka Sınırları' +
            '<svg width="30" height="10">' +
            '<line x1="0" y1="5" x2="30" y2="5" style="stroke:' + tectonicPlatesColor + ';stroke-width:' + tectonicPlatesWeight + '"></line>' +
            '</svg>'
        // 'Tectonic Plates' 

        div.innerHTML += "<h3>Magnitude</h3>"

        for (var i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(myMap);



    var slider = document.querySelector('.slider');
    function filterEarthquake(data) {
        var minMagnitude = slider.value;
        document.querySelector('#magnitude-range').innerHTML = slider.value
        var filteredData = data.features.filter(function (earthquake) {
            return earthquake.properties.mag >= minMagnitude;
        });
        // Remove the existing earthquake markers from the map
        earthquakeClusters.clearLayers();
        // Add new markers for the filtered data
        filteredData.forEach(function (earthquake) {
       
            L.geoJSON(earthquake, {
                // Burada L.circleMarker yerine L.marker kullanılabilir
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng);
                },
                style: styleInfo,
                // Function to Run Once For Each feature in the features Array
                // Give Each feature a Popup Describing the Place & Time of the Earthquake
                onEachFeature: function (feature, layer) {
                    layer.bindPopup("<h4>Location: " + feature.properties.place +
                        "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) +
                        "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
                }
                // Add earthquakeData to earthquakes LayerGroups 
            }).addTo(earthquakeClusters);
        });
    }
    slider.addEventListener('change', function () {
        // var minMagnitude = slider.value;
        filterEarthquake(earthquakeData)

    });

});