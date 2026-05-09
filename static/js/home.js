document.addEventListener('DOMContentLoaded', function() {
    // Tab switching for booking form
    const tabButtons = document.querySelectorAll('.tab-btn');
    const airportFields = document.getElementById('airportFields');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            if (this.dataset.tab === 'airport') {
                airportFields.style.display = 'block';
            } else {
                airportFields.style.display = 'none';
            }
            document.getElementById('trip_type').value = this.dataset.tab;

        });
    });
    
    // Return trip button functionality
    // Return trip button functionality
// —— RETURN FIELDS TOGGLE ——
// —— RETURN FIELDS TOGGLE ——
const returnContainer = document.getElementById('returnContainer');
const returnTripInput = document.getElementById('return_trip');

if (returnContainer && returnTripInput) {
  renderReturnButton();

  function renderReturnButton() {
    returnContainer.innerHTML =
      '<button type="button" id="returnButton" class="return-trip-btn">Return</button>';
    document
      .getElementById('returnButton')
      .addEventListener('click', () => {
        returnTripInput.value = "1";
        renderReturnFields();
      });
  }

  function renderReturnFields() {
  returnContainer.innerHTML = `
    <div class="form-row two-cols">
      <div class="form-group">
        <label for="return_date"><i class="fas fa-calendar-alt"></i> Return Date</label>
        <input
          type="text"
          id="return_date"
          name="return_date"
          placeholder="Return Date"
          required
        />
      </div>
      <div class="form-group">
        <label for="return_time"><i class="fas fa-clock"></i> Time</label>
        <div class="time-dropdown-container">
          <div class="time-selected" id="returnTimeSelected">Return Time</div>
          <div class="time-dropdowns" id="returnTimeDropdowns">
            <div class="hour-dropdown" id="returnHourDropdown"></div>
            <div class="minute-dropdown" id="returnMinuteDropdown"></div>
          </div>
          <input type="hidden" name="return_hour" id="returnHourInput" required />
          <input type="hidden" name="return_minute" id="returnMinuteInput" required />
        </div>
      </div>
    </div>
    <button type="button" id="removeReturn" class="remove-return-btn">&times;</button>
  `;

  // Attach Flatpickr to the new return_date field
  flatpickr("#return_date", {
    dateFormat: "Y-m-d",
    minDate: "today"
  });

  // Attach time dropdown behavior to the return time field
  initTimeDropdown(
    'returnTimeSelected',
    'returnTimeDropdowns',
    'returnHourDropdown',
    'returnMinuteDropdown',
    'returnHourInput',
    'returnMinuteInput'
  );

  document
    .getElementById('removeReturn')
    .addEventListener('click', () => {
      returnTripInput.value = "0";
      renderReturnButton();
    });
}
function initTimeDropdown(
  timeSelectedId,
  timeDropdownsId,
  hourDropdownId,
  minuteDropdownId,
  hourInputId,
  minuteInputId
) {
  const timeSelected   = document.getElementById(timeSelectedId);
  const timeDropdowns  = document.getElementById(timeDropdownsId);
  const hourDropdown   = document.getElementById(hourDropdownId);
  const minuteDropdown = document.getElementById(minuteDropdownId);
  const hourInput      = document.getElementById(hourInputId);
  const minuteInput    = document.getElementById(minuteInputId);

  // 1) Clear out old content
  timeDropdowns.innerHTML = '';

  // 2) Create a flex‐row wrapper for the two columns
  const columnsWrapper = document.createElement('div');
  columnsWrapper.style.display    = 'flex';
  columnsWrapper.style.gap        = '8px';
  columnsWrapper.style.width      = '100%';
  timeDropdowns.appendChild(columnsWrapper);

  // 3) Move the hour/minute containers into that wrapper & clear any old items
  hourDropdown.innerHTML   = '';
  minuteDropdown.innerHTML = '';
  columnsWrapper.appendChild(hourDropdown);
  columnsWrapper.appendChild(minuteDropdown);

  // 4) Make each column scrollable & isolate its scroll
  [hourDropdown, minuteDropdown].forEach(drop => {
    drop.style.maxHeight         = '200px';
    drop.style.overflowY         = 'auto';
    drop.style.overscrollBehavior= 'contain';
    drop.style.scrollBehavior    = 'smooth';
  });

  // 5) Populate Hours (00–23)
  for (let h = 0; h < 24; h++) {
    const opt = document.createElement('div');
    opt.className  = 'time-option';
    opt.textContent= h.toString().padStart(2, '0');
    opt.addEventListener('click', () => {
      hourInput.value = h;
      hourDropdown.querySelectorAll('.time-option')
        .forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      // scroll only the hour list
      hourDropdown.scrollTo({
        top: opt.offsetTop - hourDropdown.clientHeight/2 + opt.clientHeight/2,
        behavior: 'smooth'
      });
      updateSelected();
    });
    hourDropdown.appendChild(opt);
  }

  // 6) Populate Minutes (00–55 step 5)
  for (let m = 0; m < 60; m += 5) {
    const opt = document.createElement('div');
    opt.className  = 'time-option';
    opt.textContent= m.toString().padStart(2, '0');
    opt.addEventListener('click', () => {
      minuteInput.value = m;
      minuteDropdown.querySelectorAll('.time-option')
        .forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      // scroll only the minute list
      minuteDropdown.scrollTo({
        top: opt.offsetTop - minuteDropdown.clientHeight/2 + opt.clientHeight/2,
        behavior: 'smooth'
      });
      updateSelected();
    });
    minuteDropdown.appendChild(opt);
  }

  // 7) Inject the Save button below
  const saveBtn = document.createElement('button');
  saveBtn.type       = 'button';
  saveBtn.className  = 'time-save-btn';
  saveBtn.textContent= 'Save';
  saveBtn.addEventListener('click', e => {
    e.stopPropagation();
    timeDropdowns.classList.remove('active');
    timeSelected.classList.remove('active');
  });
  timeDropdowns.appendChild(saveBtn);

  // 8) Update the placeholder text
  function updateSelected() {
    if (hourInput.value !== '' && minuteInput.value !== '') {
      const hh = hourInput.value.toString().padStart(2,'0');
      const mm = minuteInput.value.toString().padStart(2,'0');
      timeSelected.textContent = `${hh}:${mm}`;
      timeSelected.classList.add('filled');
    }
  }

  // 9) Toggle dropdown open/close
  timeSelected.addEventListener('click', e => {
    e.stopPropagation();
    timeDropdowns.classList.toggle('active');
    timeSelected.classList.toggle('active');
  });
  document.addEventListener('click', () => {
    timeDropdowns.classList.remove('active');
    timeSelected.classList.remove('active');
  });
  timeDropdowns.addEventListener('click', e => e.stopPropagation());
}


}



    // Passenger count functionality
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    const passengerCount = document.getElementById('passengerCount');
    const passengerInput = document.getElementById('passengers');
    
    if (minusBtn && plusBtn && passengerCount && passengerInput) {
        minusBtn.addEventListener('click', function() {
            let count = parseInt(passengerCount.textContent);
            if (count > 1) {
                count--;
                passengerCount.textContent = count;
                passengerInput.value = count;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let count = parseInt(passengerCount.textContent);
            if (count < 8) {
                count++;
                passengerCount.textContent = count;
                passengerInput.value = count;
            }
        });
    }

    // Set current date as minimum date for booking
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    
    if (dateInput) {
        dateInput.min = today;
    }

    // Testimonial slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.testimonial-slide');
    const indicators = document.querySelectorAll('.testimonial-indicators .indicator');
    const prevButton = document.querySelector('.testimonial-controls .prev');
    const nextButton = document.querySelector('.testimonial-controls .next');
    
    if (slides.length > 0) {
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            slides[index].classList.add('active');
            indicators[index].classList.add('active');
            currentSlide = index;
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => showSlide(index));
        });

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                let newIndex = currentSlide - 1;
                if (newIndex < 0) newIndex = slides.length - 1;
                showSlide(newIndex);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                let newIndex = currentSlide + 1;
                if (newIndex >= slides.length) newIndex = 0;
                showSlide(newIndex);
            });
        }

        setInterval(() => {
            if (document.visibilityState === 'visible') {
                let newIndex = currentSlide + 1;
                if (newIndex >= slides.length) newIndex = 0;
                showSlide(newIndex);
            }
        }, 5000);
    }

    // Vehicle selection
    const selectButtons = document.querySelectorAll('.category-card .btn-secondary');
    const carTypeSelect = document.getElementById('carType');
    
    if (selectButtons.length > 0 && carTypeSelect) {
        selectButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const vehicleCard = this.closest('.category-card');
                const vehicleType = vehicleCard.querySelector('h3').textContent.toLowerCase();
                carTypeSelect.value = vehicleType;
                document.querySelector('.booking-form-container').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // Form validation for booking
    /*const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });

            if (isValid) {
                // Form is valid, we would normally submit, but this is handled by the href
                // kept for compatibility with your existing code
            } else {
                alert('Please fill in all required fields.');
            }
        });
    }*/
});
function initializeGoogleAutocomplete() {
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');

    if (pickupInput) {
        const pickupAuto = new google.maps.places.Autocomplete(pickupInput);
        pickupAuto.addListener('place_changed', function () {
            document.getElementById('pickup_valid').value = "1";
        });

        pickupInput.addEventListener('input', function () {
            document.getElementById('pickup_valid').value = "0";  // reset if user types
        });
    }

    if (dropoffInput) {
        const dropoffAuto = new google.maps.places.Autocomplete(dropoffInput);
        dropoffAuto.addListener('place_changed', function () {
            document.getElementById('dropoff_valid').value = "1";
        });

        dropoffInput.addEventListener('input', function () {
            document.getElementById('dropoff_valid').value = "0";  // reset if user types
        });
    }
}

window.initMap = initializeGoogleAutocomplete;




document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('bookingForm');

    if (submitBtn && form) {
        submitBtn.addEventListener('click', function () {
            // 1. Trigger browser's native field validation (clean red message below)
            const pickupValid = document.getElementById('pickup_valid').value;
            const dropoffValid = document.getElementById('dropoff_valid').value;

            // Temporarily mark invalid if needed
            if (pickupValid !== "1") {
                document.getElementById('pickup').setCustomValidity("Please select a pickup location from the suggestions.");
            } else {
                document.getElementById('pickup').setCustomValidity("");  // reset
            }

            if (dropoffValid !== "1") {
                document.getElementById('dropoff').setCustomValidity("Please select a dropoff location from the suggestions.");
            } else {
                document.getElementById('dropoff').setCustomValidity("");  // reset
            }

            const timeField = document.getElementById('time');
            if (timeField && !timeField.value.trim()) {
                timeField.setCustomValidity("Please select a time for your ride.");
            } else if (timeField) {
                timeField.setCustomValidity("");
            }

            // ✅ ADDITION: manual hour/minute validation
            const hourField = document.getElementById('hour');
            const minuteField = document.getElementById('minute');

            if (hourField && minuteField) {
                hourField.setCustomValidity("");
                minuteField.setCustomValidity("");

                const hour = parseInt(hourField.value);
                const minute = parseInt(minuteField.value);

                if (isNaN(hour)) {
                    hourField.setCustomValidity("Please enter hour (0–23)");
                } else if (hour < 0 || hour > 23) {
                    hourField.setCustomValidity("Hour must be between 0 and 23.");
                }

                if (isNaN(minute)) {
                    minuteField.setCustomValidity("Please enter minutes (0–59)");
                } else if (minute < 0 || minute > 59) {
                    minuteField.setCustomValidity("Minutes must be between 0 and 59.");
                }

                if (hour === 24 && minute !== 0) {
                    minuteField.setCustomValidity("If hour is 24, minutes must be 00.");
                }
            }

            // Trigger full form validation
            if (!form.checkValidity()) {
                form.reportValidity();  // ✅ show native field-level messages
                return;
            }


            // 2. Set correct action and method
            form.action = "/ride-booking";
            form.method = "POST";

            // 3. Submit the form
            form.submit(); // ✅ this will now POST to your Flask route
        });
    }
});
function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.getElementById("minuteDropdown");
  const selected = document.getElementById("selectedMinute");
  const options = document.getElementById("minuteOptions");
  const input = document.getElementById("minuteInput");

  selected.addEventListener("click", () => {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  options.querySelectorAll(".option").forEach(option => {
    option.addEventListener("click", () => {
      const value = option.dataset.value;
      selected.textContent = option.textContent;
      input.value = value;
      options.style.display = "none";
    });
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      options.style.display = "none";
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const hourDropdown = document.getElementById("hourDropdown");
  const selectedHour = document.getElementById("selectedHour");
  const hourOptions = document.getElementById("hourOptions");
  const hourInput = document.getElementById("hourInput");

  selectedHour.addEventListener("click", () => {
    hourOptions.style.display = hourOptions.style.display === "block" ? "none" : "block";
  });

  hourOptions.querySelectorAll(".option").forEach(option => {
    option.addEventListener("click", () => {
      const value = option.dataset.value;
      selectedHour.textContent = option.textContent;
      hourInput.value = value;
      hourOptions.style.display = "none";
    });
  });

  document.addEventListener("click", (e) => {
    if (!hourDropdown.contains(e.target)) {
      hourOptions.style.display = "none";
    }
  });
});
// ─── Mobile toggle for dropdown menu ───
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const navList      = document.querySelector('.nav-list');

if (mobileToggle && navList) {
  mobileToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
  });
}
