var map = L.map('map').setView([-22.5609, 17.0658], 12);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var baseMaps = {"OpenStreetMap": osm};


// WFS URL to get the data (GeoServer endpoint)
const wfsUrl = 'http://localhost:8080/geoserver/Windhoek/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Windhoek%3Acrimeincidents&maxFeatures=50';

// Create an empty layer to hold the crime incident markers
var crimeincident = L.layerGroup().addTo(map);

// Function to fetch crime data from GeoServer WFS
function fetchCrimeIncident(searchQuery = '') {
    // Fetch the XML data from GeoServer
    fetch(wfsUrl)
        .then(response => response.text()) // Parse the response as text (XML)
        .then(xmlText => {
            // Parse the XML text into an XML document
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlText, "application/xml");

            // Clear existing markers on the map
            crimeincident.clearLayers();

            // Get all crime incidents from the XML response
            var crimeNodes = xmlDoc.getElementsByTagName('Windhoek:crimeincidents');
            
            // Filter and process each crime incident
            Array.from(crimeNodes).forEach(crimeNode => {
                // Get coordinates from GML:Point
                var coordinates = crimeNode.getElementsByTagName('gml:coordinates')[0].textContent.split(',');
                var lat = parseFloat(coordinates[1]); // Latitude
                var lng = parseFloat(coordinates[0]); // Longitude

                // Get properties like Name and PopupInfo
                var name = crimeNode.getElementsByTagName('Windhoek:Name')[0]?.textContent || "No name available";
                var popupInfo = crimeNode.getElementsByTagName('Windhoek:PopupInfo')[0]?.textContent || "No details available";

                // Create marker and bind popup with crime information
                L.marker([lat, lng]).addTo(crimeincident)
                    .bindPopup(`
                        <strong>Name:</strong> ${name}<br>
                        <strong>Details:</strong> ${popupInfo}<br>
                    `);
            });
        })
        .catch(err => {
            console.error('Error fetching crime data:', err);
        });
}

// Perform search when the search button is clicked
function performSearch() {
    var query = document.getElementById("searchInput").value.trim();
    fetchCrimeIncident(query); // Perform search with query
}

// Initial load with all crime data
fetchCrimeIncident();

// Event listener for the search button to trigger the search function
document.getElementById('searchButton').addEventListener('click', performSearch);

// Optional: Enable search on pressing Enter key
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});
