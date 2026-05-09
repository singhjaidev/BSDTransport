
// DOM Elements
const navbar = document.querySelector('.header');
const navLinks = document.querySelectorAll('.nav-link');
const serviceCards = document.querySelectorAll('.service-card');
const vehicleCards = document.querySelectorAll('.vehicle-card');
const areaCategories = document.querySelectorAll('.area-category');

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Smooth Scrolling for Navigation Links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Animation on Scroll (AOS) Implementation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// Service Card Hover Effects
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
        card.style.boxShadow = '0 25px 70px rgba(37, 99, 235, 0.2)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
    });
});

// Vehicle Card Interactive Effects
vehicleCards.forEach(card => {
    const icon = card.querySelector('.vehicle-image i');
    
    card.addEventListener('mouseenter', () => {
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            icon.style.color = '#1d4ed8';
        }
        
        if (!card.classList.contains('featured')) {
            card.style.transform = 'translateY(-8px)';
        }
    });

    card.addEventListener('mouseleave', () => {
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
            icon.style.color = '#2563eb';
        }
        
        if (!card.classList.contains('featured')) {
            card.style.transform = 'translateY(0)';
        }
    });
});

// Area Categories Interactive Effects
areaCategories.forEach(category => {
    const icon = category.querySelector('.category-title i');
    
    category.addEventListener('mouseenter', () => {
        category.style.background = '#eff6ff';
        category.style.transform = 'translateY(-5px)';
        
        if (icon) {
            icon.style.transform = 'scale(1.2)';
            icon.style.color = '#1d4ed8';
        }
    });

    category.addEventListener('mouseleave', () => {
        category.style.background = '#f8fafc';
        category.style.transform = 'translateY(0)';
        
        if (icon) {
            icon.style.transform = 'scale(1)';
            icon.style.color = '#2563eb';
        }
    });
});

// Button Click Effects
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Lazy Loading for Images (if any images are added later)
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Preloader (optional)
window.addEventListener('load', () => {
    document.body.classList.remove('loading');
});

// Keyboard Navigation Enhancement
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Performance Optimization - Debounced Scroll Handler
let scrollTimeout;
const debouncedScrollHandler = () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
        // Additional scroll-based animations can be added here
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        // Update any scroll progress indicators if needed
        if (scrollPercent > 50) {
            document.body.classList.add('scrolled-halfway');
        } else {
            document.body.classList.remove('scrolled-halfway');
        }
    }, 10);
};

window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

// Form Validation Enhancement (if forms are added)
const validateForm = (form) => {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
};

// Error handling for failed requests
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#22c55e'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('BSD Transport Services page loaded successfully');
    
    // Add loading class initially
    document.body.classList.add('loading');
    
    // Remove loading class after a short delay
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 500);
});

// Export functions for potential use in other scripts
window.BSDTransport = {
    showNotification,
    validateForm,
    scrollToSection: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
};
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