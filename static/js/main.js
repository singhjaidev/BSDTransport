
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
                        <label for="returnDate">Return Date</label>
                        <input type="text" id="returnDate" name="return_date" required>
                    </div>
                    <div class="form-group">
                        <label for="returnTime">Return Time</label>
                        <input type="time" id="returnTime" name="return_time" required>
                    </div>
                </div>
                <button type="button" id="removeReturn" class="remove-return-btn">&times;</button>
            `;
            document
                .getElementById('removeReturn')
                .addEventListener('click', () => {
                    returnTripInput.value = "0";
                    renderReturnButton();
                });
        }
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
            if (indicators.length > 0) {
                indicators.forEach(indicator => indicator.classList.remove('active'));
                if (indicators[index]) indicators[index].classList.add('active');
            }
            slides[index].classList.add('active');
            currentSlide = index;
        }

        if (indicators.length > 0) {
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => showSlide(index));
            });
        }

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

        // Auto rotation with visibility check
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                let newIndex = currentSlide + 1;
                if (newIndex >= slides.length) newIndex = 0;
                showSlide(newIndex);
            }
        }, 5000);
    }

    // Back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile menu functionality
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (mobileToggle && navList) {
        mobileToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            
            // Animate hamburger icon
            const icon = mobileToggle.querySelector('i');
            if (navList.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
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
            document.getElementById('pickup_valid').value = "0";
        });
    }

    if (dropoffInput) {
        const dropoffAuto = new google.maps.places.Autocomplete(dropoffInput);
        dropoffAuto.addListener('place_changed', function () {
            document.getElementById('dropoff_valid').value = "1";
        });

        dropoffInput.addEventListener('input', function () {
            document.getElementById('dropoff_valid').value = "0";
        });
    }
}

window.initMap = initializeGoogleAutocomplete;

document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('bookingForm');

    if (submitBtn && form) {
        submitBtn.addEventListener('click', function () {
            const pickupValid = document.getElementById('pickup_valid').value;
            const dropoffValid = document.getElementById('dropoff_valid').value;

            if (pickupValid !== "1") {
                document.getElementById('pickup').setCustomValidity("Please select a pickup location from the suggestions.");
            } else {
                document.getElementById('pickup').setCustomValidity("");
            }

            if (dropoffValid !== "1") {
                document.getElementById('dropoff').setCustomValidity("Please select a dropoff location from the suggestions.");
            } else {
                document.getElementById('dropoff').setCustomValidity("");
            }

            const timeField = document.getElementById('time');
            if (timeField && !timeField.value.trim()) {
                timeField.setCustomValidity("Please select a time for your ride.");
            } else if (timeField) {
                timeField.setCustomValidity("");
            }

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

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            form.action = "/ride-booking";
            form.method = "POST";
            form.submit();
        });
    }
});

function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Enhanced scroll animations
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.feature-card, .value-card, .team-member, .stat-block');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Initialize scroll animations on load
document.addEventListener('DOMContentLoaded', initScrollAnimations);
// BSD Transport Navbar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('bsdHamburgerBtn');
    const mobileMenu = document.getElementById('bsdMobileMenu');
    let isMenuOpen = false;

    // Toggle mobile menu
    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            hamburgerBtn.classList.add('bsd-active');
            mobileMenu.classList.add('bsd-show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        } else {
            hamburgerBtn.classList.remove('bsd-active');
            mobileMenu.classList.remove('bsd-show');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Hamburger button click event
    hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMobileMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen) {
            toggleMobileMenu();
        }
    });

    // Smooth scroll for anchor links (optional)
    const allNavLinks = document.querySelectorAll('.bsd-nav-link, .bsd-mobile-nav-link');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close mobile menu if open
            if (isMenuOpen) {
                toggleMobileMenu();
            }
            
            // Add active state logic here if needed
            // Remove active class from all links
            document.querySelectorAll('.bsd-nav-active, .bsd-mobile-active').forEach(activeLink => {
                activeLink.classList.remove('bsd-nav-active', 'bsd-mobile-active');
            });
            
            // Add active class to clicked link
            if (this.classList.contains('bsd-nav-link')) {
                this.classList.add('bsd-nav-active');
            } else if (this.classList.contains('bsd-mobile-nav-link')) {
                this.classList.add('bsd-mobile-active');
            }
        });
    });

    // Add smooth hover effects for better UX
    const loginButtons = document.querySelectorAll('.bsd-login-button, .bsd-mobile-login-btn');
    loginButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});