document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (nav && nav.classList.contains('active') && !nav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Back to top button functionality
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (nav && nav.classList.contains('active') && !nav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Back to top button functionality
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Language selector
    const languageSelector = document.getElementById('language');
    
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            // In a real app, this would switch the language
            console.log('Language changed to: ' + this.value);
            // For demonstration, we'll just show an alert
            const languages = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French'
            };
            alert(`Language changed to ${languages[this.value]}`);
        });
    }

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Dashboard sidebar toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarClose = document.querySelector('.sidebar-close');
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }
    
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current FAQ
            faqItem.classList.toggle('active');
            
            // Change icon
            const icon = this.querySelector('.faq-toggle i');
            if (faqItem.classList.contains('active')) {
                icon.className = 'fas fa-minus';
            } else {
                icon.className = 'fas fa-plus';
            }
        });
    });
});


    // Language selector
    const languageSelector = document.getElementById('language');
    
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            // In a real app, this would switch the language
            console.log('Language changed to: ' + this.value);
            // For demonstration, we'll just show an alert
            const languages = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French'
            };
            alert(`Language changed to ${languages[this.value]}`);
        });
    }

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Dashboard sidebar toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarClose = document.querySelector('.sidebar-close');
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }
    
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current FAQ
            faqItem.classList.toggle('active');
            
            // Change icon
            const icon = this.querySelector('.faq-toggle i');
            if (faqItem.classList.contains('active')) {
                icon.className = 'fas fa-minus';
            } else {
                icon.className = 'fas fa-plus';
            }
        });
    });

        // ✅ OpenCage Autocomplete Integration
    const pickupInput = document.getElementById("pickup");
    const dropInput = document.getElementById("dropoff");

    function fetchSuggestions(query, datalistId) {
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=ce5baeccd7d8450cb16834607f8fcb82`)
            .then(response => response.json())
            .then(data => {
                const datalist = document.getElementById(datalistId);
                datalist.innerHTML = "";
                data.results.slice(0, 5).forEach(place => {
                    const option = document.createElement("option");
                    option.value = place.formatted;
                    datalist.appendChild(option);
                });
            });
    }

    if (pickupInput) {
        pickupInput.addEventListener("input", () => {
            if (pickupInput.value.length >= 3) {
                fetchSuggestions(pickupInput.value, "pickup-suggestions");
            }
        });
    }

    if (dropInput) {
        dropInput.addEventListener("input", () => {
            if (dropInput.value.length >= 3) {
                fetchSuggestions(dropInput.value, "drop-suggestions");
            }
        });
    }

});
