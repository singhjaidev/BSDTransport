document.addEventListener('DOMContentLoaded', function() {
    // User dropdown
    const userDropdownBtn = document.querySelector('.user-dropdown-btn');
    const userDropdownContent = document.querySelector('.user-dropdown-content');
    
    if (userDropdownBtn && userDropdownContent) {
        userDropdownBtn.addEventListener('click', function() {
            userDropdownContent.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.user-dropdown')) {
                userDropdownContent.classList.remove('show');
            }
        });
    }

    // Notification handling
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            // In a real app, this would open a notification panel
            alert('Notifications panel would open here.');
            
            // Clear notification badge
            const badge = this.querySelector('.notification-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
    }

    // Location card actions
    const locationActionBtns = document.querySelectorAll('.location-actions .action-btn');
    
    locationActionBtns.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('aria-label');
            const locationCard = this.closest('.location-card');
            const locationName = locationCard.querySelector('h3').textContent;
            
            if (action === 'Edit') {
                // In a real app, this would open an edit modal
                alert(`Edit ${locationName} location`);
            } else if (action === 'Delete') {
                if (confirm(`Are you sure you want to delete ${locationName}?`)) {
                    // In a real app, this would send a delete request to the server
                    locationCard.style.opacity = '0.5';
                    setTimeout(() => {
                        locationCard.remove();
                    }, 500);
                }
            }
        });
    });

    // Ride item actions
    const rideDetailBtns = document.querySelectorAll('.ride-item .btn');
    
    rideDetailBtns.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const rideItem = this.closest('.ride-item');
            const fromLocation = rideItem.querySelector('.location.from span').textContent;
            const toLocation = rideItem.querySelector('.location.to span').textContent;
            
            if (this.textContent.includes('Details')) {
                alert(`Ride details: From ${fromLocation} to ${toLocation}`);
            } else if (this.textContent.includes('Cancel')) {
                if (confirm(`Are you sure you want to cancel this ride from ${fromLocation} to ${toLocation}?`)) {
                    // In a real app, this would send a cancel request to the server
                    rideItem.style.opacity = '0.5';
                    setTimeout(() => {
                        rideItem.remove();
                    }, 500);
                }
            }
        });
    });

    // Search functionality
    const searchBox = document.querySelector('.search-box input');
    
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            // In a real app, this would perform a search
            console.log('Searching for:', this.value);
        });
        
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                alert(`Search for "${this.value}" would happen here.`);
            }
        });
    }

    // Date filter
    const dateRangeSelect = document.getElementById('dateRange');
    
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
            // In a real app, this would update the dashboard data
            alert(`Dashboard data filtered by: ${this.options[this.selectedIndex].text}`);
        });
    }

    // Book now button
    const bookNowBtns = document.querySelectorAll('.btn-primary');
    
    bookNowBtns.forEach(button => {
        if (button.textContent.includes('Book')) {
            button.addEventListener('click', function(e) {
                // If it's not in a form, prevent default behavior
                if (!this.closest('form')) {
                    e.preventDefault();
                    window.location.href = 'index.html#bookingForm';
                }
            });
        }
    });

    // Simulate live ride tracking
    const activeBooking = document.querySelector('.active-booking');
    const etaElement = document.querySelector('.eta');
    
    if (activeBooking && etaElement) {
        let eta = 5; // Starting ETA in minutes
        
        setInterval(() => {
            if (eta > 1) {
                eta -= 0.5;
                etaElement.innerHTML = `<i class="fas fa-clock"></i> ETA: ${Math.round(eta)} min`;
            } else {
                etaElement.innerHTML = `<i class="fas fa-clock"></i> Driver arrived`;
                const statusText = document.querySelector('.status-text h3');
                if (statusText) {
                    statusText.textContent = 'Driver has arrived';
                }
                const statusSubtext = document.querySelector('.status-text p');
                if (statusSubtext) {
                    statusSubtext.textContent = 'Your ride is ready';
                }
            }
        }, 30000); // Update every 30 seconds
    }
});