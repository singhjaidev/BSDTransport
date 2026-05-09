
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
}

// Responsive map resizing
function resizeMap() {
  const map = document.getElementById('map');
  if (window.innerWidth <= 768) {
    map.style.minHeight = '300px';
  } else {
    map.style.minHeight = '400px';
  }
}

// Execute on load and resize
window.addEventListener('load', resizeMap);
window.addEventListener('resize', resizeMap);
