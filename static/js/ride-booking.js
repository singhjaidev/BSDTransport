
// Initialize Flatpickr time picker
flatpickr("#time", {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true
});

// Passenger count logic
function changePassengers(amount) {
  const countSpan = document.getElementById('passengerCount');
  let count = parseInt(countSpan.innerText);
  count = Math.max(1, count + amount);
  countSpan.innerText = count;
}

function selectVehicle(element) {
  document.querySelectorAll('.vehicle-card').forEach(card => {
    card.classList.remove('selected');
  });

  element.classList.add('selected');

  // ✅ Store vehicle type and price
  const type = element.querySelector('h4').innerText.toLowerCase();
  const price = element.querySelector('.price').innerText.replace('€', '');

  document.getElementById('selectedVehicleType').value = type;
  document.getElementById('selectedPrice').value = price;

  // Enable Confirm button
  const confirmBtn = document.getElementById('confirmRideBtn');
  confirmBtn.disabled = false;
  confirmBtn.classList.add('active');

  // ✅ Add debug log
  console.log('✅ selectVehicle(): confirmRideBtn is now enabled');
}


// Responsive map resizing
function resizeMap() {
  const map = document.getElementById('map');
  if (window.innerWidth <= 768) {
    map.style.minHeight = '250px';
  } else {
    map.style.minHeight = '300px';
  }
}

// right before you grab guestGetOtpBtn...
const guestPhoneInput = document.getElementById('guestPhone');
let itiGuest = window.intlTelInput(guestPhoneInput, {
  initialCountry: 'auto',
  geoIpLookup: cb => {
    fetch('https://ipinfo.io/json')
      .then(r => r.json()).then(data => cb(data.country))
      .catch(() => cb('us'));
  },
  separateDialCode: true,
  utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js',
});

// Execute on load and resize
window.addEventListener('load', resizeMap);
window.addEventListener('resize', resizeMap);

function calculateMetrics() {
  const dataEl = document.getElementById("bookingData");

  if (!dataEl) {
    console.log("❌ bookingData element not found.");
    return;
  }

  const origin = dataEl.dataset.pickup;
  const destination = dataEl.dataset.dropoff;
  const returnTrip = parseInt(dataEl.dataset.return);

  console.log("📍 Origin:", origin);
  console.log("📍 Destination:", destination);
  console.log("🔁 Return trip:", returnTrip);

  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
  }, (response, status) => {
    console.log("📦 Distance Matrix response:", response);
    console.log("✅ API Status:", status);

    if (status !== 'OK') {
      console.error('❌ DistanceMatrix error:', status);
      return;
    }

    const element = response.rows[0].elements[0];

    if (element.status !== 'OK') {
      console.error('❌ No route found:', element.status);
      return;
    }

    let distMeters = element.distance.value;
    let durSeconds = element.duration.value;

    if (returnTrip === 1) {
      distMeters *= 2;
      durSeconds *= 2;
    }

    const distKm = (distMeters / 1000).toFixed(1) + ' km';

    const durMinn = Math.round(durSeconds / 60);
    const durHr = Math.round(durMinn / 60);
    const durMinnn = Math.round(durMinn % 60);
    const durMin = `${durHr}:${durMinnn} hrs`;

    // Calculate prices based on distance in km
    const km = distMeters / 1000;
    const priceStandard = (km * pricesFromDB.Standard).toFixed(2) + '€';
    const priceBusiness = (km * pricesFromDB.Business).toFixed(2) + '€';
    const priceVan = (km * pricesFromDB.Van).toFixed(2) + '€';


    // Update prices in HTML
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    vehicleCards.forEach(card => {
      const type = card.querySelector('h4').innerText.toLowerCase();
      const priceTag = card.querySelector('.price');

      if (type.includes('standard')) {
        priceTag.innerText = priceStandard;
      } else if (type.includes('business')) {
        priceTag.innerText = priceBusiness;
      } else if (type.includes('van')) {
        priceTag.innerText = priceVan;
      }
      console.log("▶ calculateMetrics()");

    });


    console.log("📏 Distance:", distKm);
    console.log("⏱ Duration:", durMin);

    document.getElementById('distance').innerText = distKm;
    document.getElementById('duration').innerText = durMin;
  });
}


window.initMap = function () {
  console.log("✅ initMap() called");

  const dataEl = document.getElementById("bookingData");
  const origin = dataEl.dataset.pickup;
  const destination = dataEl.dataset.dropoff;

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 48.8566, lng: 2.3522 }, // Paris default center
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: false,
    preserveViewport: false
  });

  const request = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, function (response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(response);
    } else {
      console.error("Directions request failed due to:", status);
    }
  });

  // Now trigger distance/time/pricing
  calculateMetrics();
};

document.addEventListener('DOMContentLoaded', function () {
  const backBtn = document.getElementById('backToBooking');
  if (backBtn) {
    backBtn.addEventListener('click', function (e) {
      e.preventDefault(); // prevent default form behavior if inside form
      window.location.href = "/"; // or use "/index.html" if directly routing to file
    });
  }
});

const tripType = document.getElementById('selectedTripType');
const selectedType = tripType ? tripType.value : "standard";

const tabButtons = document.querySelectorAll('.tab-btn');

tabButtons.forEach(btn => {
  if (btn.innerText.toLowerCase() === selectedType.toLowerCase()) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }
});


const isLoggedIn = document.body.dataset.loggedIn === 'true';
const bookingData = document.getElementById('bookingData');
const bookingId = bookingData.dataset.bookingId;
const selectionContainer = document.getElementById('selectionContainer');
const guestLoginForm = document.getElementById('guestLoginForm');
const confirmBtn = document.getElementById('confirmRideBtn');
const rideSummary = document.querySelector('.ride-summary');
const confirmContainer = document.querySelector('.confirm-btn-container');



// Step 4: Start Stripe payment
function startStripeFlow() {
  const price = document.getElementById('selectedPrice').value;
  const vehicle = document.getElementById('selectedVehicleType').value;

  if (!price || !vehicle) {
    alert("❌ Please select a vehicle before proceeding to payment.");
    return;
  }

  confirmBtn.innerText = "Redirecting...";
  confirmBtn.disabled = true;

  fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: parseFloat(price),
      car_type: vehicle,
      booking_id: bookingId
    }),
  })
    .then(r => r.json())
    .then(session => {
      if (session.error) {
        alert("❌ Stripe Error: " + session.error);
        confirmBtn.innerText = "Confirm Ride";
        confirmBtn.disabled = false;
        return;
      }

      const stripe = Stripe("pk_test_51RQSOHP44GNLP68pxMWtQusb59yrRCjTorIo1fi8KalxIFuB5Yp4x0K3CD7CfIg4jftwPv88GZbqiJllNTUsEzzu00m2EvHoWL");
      stripe.redirectToCheckout({ sessionId: session.id });
    })
    .catch(err => {
      alert("❌ Failed to initiate Stripe checkout.");
      console.error(err);
      confirmBtn.innerText = "Confirm Ride";
      confirmBtn.disabled = false;
    });
}



document.addEventListener('DOMContentLoaded', () => {
  // ───── Cache the elements you’ll need ─────
  const isLoggedIn         = document.body.dataset.loggedIn === 'true';
  const bookingData        = document.getElementById('bookingData');
  const bookingId          = bookingData.dataset.bookingId;              // your booking ID
  const selectionContainer = document.getElementById('selectionContainer');
  const guestLoginForm     = document.getElementById('guestLoginForm');
  const confirmBtn         = document.getElementById('confirmRideBtn');
  const rideSummary        = document.querySelector('.ride-summary');
  const confirmContainer   = document.querySelector('.confirm-btn-container');
  const guestSuccessMsg    = document.getElementById('guestSuccessMsg');

  // ───── 1) “Confirm Ride” button logic ─────
  confirmBtn.addEventListener('click', () => {
    // Check if OTP was already verified (we set display="flex" on success)
    const otpVerified = (guestSuccessMsg.style.display === 'flex');

    if (!isLoggedIn && !otpVerified) {
      // Hide the ride‐booking UI:
      rideSummary.style.display        = 'none';
      selectionContainer.style.display = 'none';
      confirmContainer.style.display   = 'none';

      // Show only the guest‐login form:
      guestLoginForm.style.display     = 'block';
      return;
    }

    // If the user is logged in OR OTP is already verified → proceed to payment:
    startStripeFlow();
  });


  // ───── 2) Two-step OTP flow ─────

  // 2a) Cache all the “step 1” vs “step 2” elements:
  const guestStep1           = document.getElementById('guestStep1');
  const guestStep2           = document.getElementById('guestStep2');
  const guestProgressFill    = document.getElementById('guestProgress');
  const guestPhoneDisplay    = document.getElementById('guestPhoneDisplay');
  const guestErrorMsgStep1   = document.getElementById('guestErrorMsgStep1');
  const guestErrorMsgStep2   = document.getElementById('guestErrorMsgStep2');
  const guestGetOtpBtn       = document.getElementById('guestGetOtpBtn');
  const guestVerifyBtn       = document.getElementById('guestVerifyBtn');
  const guestChangeNumberBtn = document.getElementById('guestChangeNumber');

  // ─── 2b) Handler for “Get OTP” (Step 1) ───
 guestGetOtpBtn.addEventListener('click', async () => {
  guestErrorMsgStep1.textContent = '';

  const name  = document.getElementById('guestName').value.trim();
  const email = document.getElementById('guestEmail').value.trim();
  const phone = itiGuest.getNumber();

  if (!name || !email || !phone) {
    guestErrorMsgStep1.textContent = 'All fields are required';
    return;
  }

  try {
    const res = await fetch('/register-send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        booking_id: bookingId
      })
    });
    const data = await res.json();

    // ✅ Treat "User already registered..." as success
    if (data.success || data.message === 'User already registered. Try logging in.') {
      guestProgressFill.style.width = '100%';
      guestStep1.style.display = 'none';
      guestStep2.style.display = 'block';
      guestPhoneDisplay.textContent = phone;
      startOtpCountdown();
    } else {
      guestErrorMsgStep1.textContent = data.message;
    }
  } catch {
    guestErrorMsgStep1.textContent = 'Error sending OTP';
  }
});


  // ─── 2c) “Change Number” in Step 2 → go back to Step 1 ───
  guestChangeNumberBtn.addEventListener('click', () => {
    // 1) Reset the progress bar back to 50%
    guestProgressFill.style.width = '50%';

    // 2) Hide Step 2, show Step 1 again
    guestStep2.style.display = 'none';
    guestStep1.style.display = 'block';

    // 3) Clear OTP input & Step 2 errors
    document.getElementById('guestOtp').value    = '';
    guestErrorMsgStep2.textContent                = '';

    // 4) Hide the green success banner (if shown)
    guestSuccessMsg.style.display = 'none';
  });


  // ─── 2d) Handler for “Verify OTP” (Step 2) ───
  guestVerifyBtn.addEventListener('click', async () => {
    // Clear any existing error in Step 2:
    guestErrorMsgStep2.textContent = '';

    // Grab the OTP the user typed:
    const otp = document.getElementById('guestOtp').value.trim();
    if (!otp) {
      guestErrorMsgStep2.textContent = 'Please enter OTP';
      return;
    }

    try {
      // Send “/register-verify” with form-encoded { otp }
      const form = new URLSearchParams();
      form.append('otp', otp);

      const res  = await fetch('/register-verify', {
        method: 'POST',
        body: form
      });
      const json = await res.json();

      if (json.success) {
        // ─── On OTP verification success ───
        // a) Show the green “Phone number verified” banner
        guestSuccessMsg.style.display = 'flex';

        // b) Immediately proceed to Stripe checkout
        startStripeFlow();
      } else {
        guestErrorMsgStep2.textContent = json.message || 'Invalid OTP';
      }
    } catch {
      guestErrorMsgStep2.textContent = 'Error verifying OTP';
    }
  });


  // ─── 2e) Helper: 30 second countdown for “Resend OTP” ───
  function startOtpCountdown() {
    let remaining = 30;
    guestGetOtpBtn.disabled = true;
    guestGetOtpBtn.innerText = `Resend OTP (${remaining}s)`;

    const otpTimer = setInterval(() => {
      remaining--;
      guestGetOtpBtn.innerText = `Resend OTP (${remaining}s)`;
      if (remaining <= 0) {
        clearInterval(otpTimer);
        guestGetOtpBtn.disabled = false;
        guestGetOtpBtn.innerText = 'Resend OTP';
      }
    }, 1000);
  }
});



document.addEventListener('DOMContentLoaded', () => {
  const otpBtn = document.getElementById('guestGetOtpBtn');
  const formWrapper = document.querySelector('.guest-form-container');

  otpBtn.addEventListener('click', () => {
    setTimeout(() => {
      const width = window.innerWidth;

      if (width >= 1201) {
        formWrapper.style.setProperty('height', '360px', 'important');
      } else if (width >= 769 && width <= 1200) {
        formWrapper.style.setProperty('height', '430px', 'important');
      }
    }, 500); // 0.5 second delay
  });
});
