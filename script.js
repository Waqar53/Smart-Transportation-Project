// Initialize Leaflet Map
let map = L.map('map').setView([20.5937, 78.9629], 5); // Default view on India

// Add OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Toggle Dark/Light Mode
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    map.invalidateSize(); 
}

// Function to simulate vehicle detection and traffic conditions
function getTrafficColor(vehicles) {
    if (vehicles > 80) return "red"; // High Traffic (More than 80 vehicles)
    if (vehicles > 40) return "orange"; // Medium Traffic (Between 40-80 vehicles)
    return "green"; // Low Traffic (Less than 40 vehicles)
}


function detectTraffic(e) {
    const vehicles = Math.floor(Math.random() * 120); // Random vehicle count (0-120)


    const location = [e.latlng.lat, e.latlng.lng];

    const trafficColor = getTrafficColor(vehicles);
    const trafficMarker = L.circleMarker(location, {
        color: trafficColor,
        radius: 12,
        fillOpacity: 0.7
    }).addTo(map).bindPopup(`🚗 Vehicles: ${vehicles} (Traffic: ${trafficColor})`);

  
    if (vehicles > 80) {
        const altRoute = L.polyline([
            location,
            [location[0] + 0.05, location[1] + 0.05] // Slightly offset for alternative route
        ], { color: 'blue', dashArray: '5, 10' }).addTo(map);
        altRoute.bindPopup("🚦 Heavy traffic! Suggested alternative route.");
    }

   
    return { vehicles, location };
}


map.on('click', function (e) {
    const { vehicles, location } = detectTraffic(e);

   
    document.getElementById("trafficDetails").innerHTML = `
        🚗 Detected Vehicles: ${vehicles}<br>
        🛣️ Traffic Condition: ${getTrafficColor(vehicles)}<br>
        🕒 Estimated Delay: ${(vehicles / 10).toFixed(2)} mins<br>
    `;
});


function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    reject("Geolocation not supported or permission denied.");
                }
            );
        } else {
            reject("Geolocation not supported.");
        }
    });
}


async function calculateDistanceAndTime() {
    const cityA = document.getElementById("cityA").value;
    const cityB = document.getElementById("cityB").value;
    const output = document.getElementById("distanceOutput");

    if (!cityA || !cityB) {
        alert("Please enter both cities.");
        return;
    }

    try {
        const coordA = await getCoordinates(cityA);
        const coordB = await getCoordinates(cityB);

        if (!coordA || !coordB) return;

        const distance = haversineDistance(coordA, coordB);
        const avgSpeed = 60; 
        const time = distance / avgSpeed;

        output.innerHTML = `
            📍 Distance: ${distance.toFixed(2)} km<br>
            🕒 Estimated Time: ${time.toFixed(2)} hours
        `;

       
        const routeLine = L.polyline([
            [coordA.lat, coordA.lon],
            [coordB.lat, coordB.lon]
        ], { color: 'green' }).addTo(map);

        map.fitBounds(routeLine.getBounds(), {
            padding: [50, 50],
            maxZoom: 10
        });

        L.marker([coordA.lat, coordA.lon]).addTo(map).bindPopup(`Start: ${cityA}`).openPopup();
        L.marker([coordB.lat, coordB.lon]).addTo(map).bindPopup(`Destination: ${cityB}`);
    } catch (err) {
        console.error("Error calculating distance/time:", err);
        alert("Could not calculate distance.");
    }
}

async function getCoordinates(city) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SmartTransportationSystem/1.0 (your@email.com)'
            }
        });
        const data = await response.json();
        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        } else {
            alert(`❌ Location not found: ${city}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching location:", error);
        return null;
    }
}


function haversineDistance(coord1, coord2) {
    const R = 6371; 
    const toRad = (x) => x * Math.PI / 180;

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lon - coord1.lon);
    const lat1 = toRad(coord1.lat);
    const lat2 = toRad(coord2.lat);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}


document.getElementById("calculateButton").addEventListener("click", calculateDistanceAndTime);


function updateTrafficUI(vehicleCount) {
    const trafficElement = document.getElementById('trafficDetails');
    const trafficCondition = vehicleCount > 80 ? 'High' : vehicleCount > 40 ? 'Medium' : 'Low';
    const delay = vehicleCount / 10;

    trafficElement.innerHTML = `
        🚗 Vehicles: ${vehicleCount}<br>
        🚦 Traffic Condition: ${trafficCondition}<br>
        ⏳ Estimated Delay: ${delay.toFixed(2)} minutes
    `;
}

