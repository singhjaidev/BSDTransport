
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initTestimonialSlider();
    initStatsCounter();
    initScrollAnimations();
    initMobileMenu();
});

// Testimonial Slider
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const indicators = document.querySelectorAll('.testimonial-indicators .indicator');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    const slideCount = slides.length;

    // Show initial slide
    showSlide(currentSlide);

    // Indicator click
    indicators.forEach(function(indicator, index) {
        indicator.addEventListener('click', function() {
            currentSlide = index;
            showSlide(currentSlide);
            resetAutoRotation();
        });
    });

    // Auto rotate slides every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        showSlide(currentSlide);
    }

    function resetAutoRotation() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Pause auto rotation when user hovers over slider
    const slider = document.querySelector('.testimonial-slider');
    
    if (slider) {
        slider.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        slider.addEventListener('mouseleave', function() {
            resetAutoRotation();
        });
    }

    // Function to show slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all indicators
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Show current slide and activate current indicator
        if (slides[index]) slides[index].classList.add('active');
        if (indicators[index]) indicators[index].classList.add('active');
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            showSlide(currentSlide);
            resetAutoRotation();
        } else if (e.key === 'ArrowRight') {
            currentSlide = (currentSlide + 1) % slideCount;
            showSlide(currentSlide);
            resetAutoRotation();
        }
    });
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const suffix = element.parentElement.querySelector('.stat-suffix');
    const suffixText = suffix ? suffix.textContent : '';
    let current = 0;
    const increment = target / 100; // Adjust speed here
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format large numbers
        let displayValue = Math.floor(current);
        if (target >= 1000000) {
            displayValue = (Math.floor(current / 10000) / 100).toFixed(1) + 'M';
        } else if (target >= 1000) {
            displayValue = Math.floor(current / 1000) + 'K';
        }
        
        element.textContent = displayValue;
        element.classList.add('counting');
    }, 20);
}

// Scroll Animations
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.feature-card, .value-card, .team-member');
    
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

// Mobile Menu Toggle
function initMobileMenu() {
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
}

// Dropdown Menu Toggle
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect for page header
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    const header = document.querySelector('.page-header');
    
    if (header) {
        header.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Animate elements on load
    const animateOnLoad = document.querySelectorAll('.page-title, .page-subtitle');
    animateOnLoad.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Initialize CSS for load animations
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .page-title, .page-subtitle {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        body.loaded .page-title,
        body.loaded .page-subtitle {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu   = document.querySelector('.nav-list');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    const icon = toggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  // Optional: close menu when clicking outside
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('active');
      const icon = toggle.querySelector('i');
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    }
  });
});
