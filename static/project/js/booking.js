function initLeafletMap(pickupCoords, dropoffCoords) {
    // Create the map only once
    if (!window.leafletMap) {
        window.leafletMap = L.map('map').setView(pickupCoords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.leafletMap);
    }

    const map = window.leafletMap;

    // Remove previous markers or route
    if (window.pickupMarker) map.removeLayer(window.pickupMarker);
    if (window.dropoffMarker) map.removeLayer(window.dropoffMarker);
    if (window.routeLine) map.removeLayer(window.routeLine);

    // Add markers
    window.pickupMarker = L.marker(pickupCoords).addTo(map).bindPopup('Pickup').openPopup();
    window.dropoffMarker = L.marker(dropoffCoords).addTo(map).bindPopup('Dropoff');

    // Draw line between pickup and dropoff
    window.routeLine = L.polyline([pickupCoords, dropoffCoords], { color: 'blue' }).addTo(map);

    // Fit the map to route
    map.fitBounds(window.routeLine.getBounds());
}
document.addEventListener('DOMContentLoaded', function () {
    // Global variables
    let map;
    let directions;
    let currentRoute = null;
    let selectedVehicleType = null;
    let estimatedDuration = 0;
    let estimatedDistance = 0;

    // Elements
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');
    const pickupDatalist = document.getElementById('pickup-suggestions');
    const dropoffDatalist = document.getElementById('dropoff-suggestions');
    const rideDateInput = document.getElementById('rideDate');
    const rideTimeSelect = document.getElementById('rideTime');
    const calculateRouteBtn = document.getElementById('calculateRoute');
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    const vehicleSelectButtons = document.querySelectorAll('.select-vehicle');

    const rideDetailsSection = document.getElementById('ride-details-section');
    const vehicleSelectionSection = document.getElementById('vehicle-selection-section');
    const paymentSection = document.getElementById('payment-section');

    // ✅ Set today's date in date picker
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    rideDateInput.value = `${yyyy}-${mm}-${dd}`;
    rideDateInput.min = `${yyyy}-${mm}-${dd}`;

    // ✅ Populate time dropdown (AFTER rideTimeSelect is defined)
    populateTimeDropdown();

    // ✅ Setup autocomplete
    setupAutocomplete(pickupInput, pickupDatalist);
    setupAutocomplete(dropoffInput, dropoffDatalist);

    // ✅ Calculate route button
    calculateRouteBtn.addEventListener('click', calculateRouteAndFares);

    // ✅ Vehicle selection
    vehicleCards.forEach(card => {
        card.addEventListener('click', function () {
            selectVehicle(this);
        });
    });

    vehicleSelectButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const card = this.closest('.vehicle-card');
            selectVehicle(card);
            proceedToPayment();
        });
    });
});


    
    // Functions
    function initializeMap() {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [10.7522, 59.9139], // Default center (Oslo)
            zoom: 11
        });
        
        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-left');
        
        // Initialize the directions plugin
        directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            unit: 'metric',
            profile: 'mapbox/driving',
            alternatives: false,
            geometries: 'geojson',
            controls: {
                instructions: false,
                profileSwitcher: false,
                inputs: false
            },
            flyTo: false
        });
        
        map.addControl(directions, 'top-left');
        
        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { longitude, latitude } = position.coords;
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 13
                });
                
                // Get address from coordinates using reverse geocoding
                fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.features && data.features.length > 0) {
                            const placeName = data.features[0].place_name;
                            pickupInput.value = placeName;
                        }
                    });
            });
        }
        
        // Route change event
        directions.on('route', e => {
            if (e.route && e.route[0]) {
                currentRoute = e.route[0];
                estimatedDistance = currentRoute.distance / 1000; // Convert to kilometers
                estimatedDuration = Math.round(currentRoute.duration / 60); // Convert to minutes
                
                // Update vehicle cards with the new estimates
                updateVehicleEstimates();
                
                // Show vehicle selection section
                vehicleSelectionSection.classList.remove('hidden');
            }
        });
    }

    function setupAutocomplete(inputElement, datalistElement) {
    inputElement.addEventListener('input', async function () {
        const query = inputElement.value.trim();
        if (query.length < 3) return;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            datalistElement.innerHTML = ''; // Clear old suggestions

            data.slice(0, 5).forEach(place => {
                const option = document.createElement('option');
                option.value = place.display_name;
                datalistElement.appendChild(option);
            });
        } catch (err) {
            console.error('Geocoding error:', err);
        }
    });
}

    
    function populateTimeDropdown() {
        // Clear existing options
        rideTimeSelect.innerHTML = '';
        
        // Get current time
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        
        // Round to the nearest 30-minute interval
        if (minutes < 30) {
            minutes = 30;
        } else {
            minutes = 0;
            hours = (hours + 1) % 24;
        }
        
        // Create time options in 30-minute intervals for the next 24 hours
        for (let i = 0; i < 48; i++) {
            const timeValue = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            const timeDisplay = convertTo12HourFormat(timeValue);
            
            const option = document.createElement('option');
            option.value = timeValue;
            option.textContent = timeDisplay;
            
            if (i === 0) {
                option.selected = true;
            }
            
            rideTimeSelect.appendChild(option);
            
            // Increment time by 30 minutes
            minutes = (minutes + 30) % 60;
            if (minutes === 0) {
                hours = (hours + 1) % 24;
            }
        }
    }
    
    function convertTo12HourFormat(time24) {
        const [hours, minutes] = time24.split(':');
        let period = 'AM';
        let hours12 = parseInt(hours, 10);
        
        if (hours12 >= 12) {
            period = 'PM';
            if (hours12 > 12) {
                hours12 -= 12;
            }
        }
        
        if (hours12 === 0) {
            hours12 = 12;
        }
        
        return `${hours12}:${minutes} ${period}`;
    }
   async function calculateRouteAndFares() {
    const pickup = pickupInput.value.trim();
    const dropoff = dropoffInput.value.trim();

    if (!pickup || !dropoff) {
        alert('Please enter both pickup and destination locations.');
        return;
    }

    try {
        // Convert pickup text to coordinates
        const pickupRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}`);
        const pickupData = await pickupRes.json();
        if (!pickupData.length) throw new Error('Pickup location not found');
        const pickupCoords = [parseFloat(pickupData[0].lat), parseFloat(pickupData[0].lon)];

        // Convert dropoff text to coordinates
        const dropoffRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoff)}`);
        const dropoffData = await dropoffRes.json();
        if (!dropoffData.length) throw new Error('Dropoff location not found');
        const dropoffCoords = [parseFloat(dropoffData[0].lat), parseFloat(dropoffData[0].lon)];

        // Use Leaflet to show the route
        initLeafletMap(pickupCoords, dropoffCoords);
    } catch (err) {
        alert("Error finding route: " + err.message);
        console.error(err);
    }
}

function initLeafletMap(pickupCoords, dropoffCoords) {
    if (!window.leafletMap) {
        window.leafletMap = L.map('map').setView(pickupCoords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.leafletMap);
    }

    const map = window.leafletMap;

    if (window.pickupMarker) map.removeLayer(window.pickupMarker);
    if (window.dropoffMarker) map.removeLayer(window.dropoffMarker);
    if (window.routeLine) map.removeLayer(window.routeLine);

    window.pickupMarker = L.marker(pickupCoords).addTo(map).bindPopup('Pickup').openPopup();
    window.dropoffMarker = L.marker(dropoffCoords).addTo(map).bindPopup('Dropoff');

    window.routeLine = L.polyline([pickupCoords, dropoffCoords], { color: 'blue' }).addTo(map);

    map.fitBounds(window.routeLine.getBounds());
}

    
    function updateVehicleEstimates() {
        if (!currentRoute) return;
        
        vehicleCards.forEach(card => {
            const basePrice = parseFloat(card.dataset.basePrice);
            const minutePrice = parseFloat(card.dataset.minutePrice);
            
            // Calculate fare: (base price per km * distance) + (minute price * duration)
            const fare = (basePrice * estimatedDistance) + (minutePrice * estimatedDuration);
            const roundedFare = Math.round(fare * 100) / 100; // Round to 2 decimal places
            
            // Update the vehicle card with the calculated fare and estimated time
            card.querySelector('.price').textContent = `€${roundedFare.toFixed(2)}`;
            card.querySelector('.time').textContent = `${estimatedDuration} min`;
        });
    }
    
    function selectVehicle(card) {
        // Remove selected class from all cards
        vehicleCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to the clicked card
        card.classList.add('selected');
        
        // Store the selected vehicle type
        selectedVehicleType = card.dataset.type;
    }
    
    function proceedToPayment() {
        if (!selectedVehicleType || !currentRoute) {
            alert('Please select a route and vehicle type first.');
            return;
        }
        
        // Update the summary information
        document.getElementById('summary-pickup').textContent = pickupInput.value;
        document.getElementById('summary-dropoff').textContent = dropoffInput.value;
        
        const selectedDate = new Date(rideDateInput.value);
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('summary-datetime').textContent = `${selectedDate.toLocaleDateString('en-US', dateOptions)} at ${convertTo12HourFormat(rideTimeSelect.value)}`;
        
        document.getElementById('summary-vehicle').textContent = selectedVehicleType.charAt(0).toUpperCase() + selectedVehicleType.slice(1); // Capitalize
        document.getElementById('summary-distance').textContent = `${estimatedDistance.toFixed(1)} km`;
        document.getElementById('summary-time').textContent = `${estimatedDuration} min`;
        
        // Get the fare from the selected vehicle card
        const selectedCard = document.querySelector(`.vehicle-card[data-type="${selectedVehicleType}"]`);
        const fare = selectedCard.querySelector('.price').textContent;
        document.getElementById('summary-price').textContent = fare;
        
        // Hide the ride details and vehicle sections, show payment section
        rideDetailsSection.classList.add('hidden');
        vehicleSelectionSection.classList.add('hidden');
        paymentSection.classList.remove('hidden');
        
        // Initialize Stripe payment form
        initializeStripePayment(fare);
    }
    
    function initializeStripePayment(fare) {
        // This is where you'd initialize Stripe Elements
        // For demo purposes, we're just showing a placeholder
        
        const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
        const elements = stripe.elements();
        
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        
        const form = document.getElementById('payment-form');
        const submitButton = document.getElementById('submit-payment');
        const paymentMessage = document.getElementById('payment-message');
        const spinner = document.getElementById('spinner');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            submitButton.disabled = true;
            spinner.classList.remove('hidden');
            
            // Simulate payment processing
            setTimeout(() => {
                window.location.href = 'booking-confirmation.html';
            }, 2000);
        });
    }
