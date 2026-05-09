document.addEventListener('DOMContentLoaded', function() {
    // Add to calendar button
    const addToCalendarBtn = document.getElementById('addToCalendar');
    
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', function() {
            // Get booking details
            const date = document.querySelector('.detail-item:nth-child(1) .value').textContent;
            const time = document.querySelector('.detail-item:nth-child(2) .value').textContent;
            const pickup = document.querySelector('.route-point.pickup .point-address').textContent;
            const dropoff = document.querySelector('.route-point.dropoff .point-address').textContent;
            
            // Create calendar event details
            const eventTitle = `CityRide: ${pickup} to ${dropoff}`;
            const eventDetails = `
                Date: ${date}
                Time: ${time}
                Pickup: ${pickup}
                Dropoff: ${dropoff}
            `;
            
            // In a real app, this would create a calendar event
            // For demo, we'll show an alert with the event details
            alert(`Adding to calendar:\n\n${eventTitle}\n${eventDetails}`);
        });
    }

    // Print confirmation button
    const printConfirmationBtn = document.getElementById('printConfirmation');
    
    if (printConfirmationBtn) {
        printConfirmationBtn.addEventListener('click', function() {
            window.print();
        });
    }

    // Animate the success icon when page loads
    const successIcon = document.querySelector('.success-icon');
    
    if (successIcon) {
        // Add CSS animation
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes bounceIn {
                0%, 20%, 40%, 60%, 80%, to {
                    animation-timing-function: cubic-bezier(.215, .61, .355, 1);
                }
                0% {
                    opacity: 0;
                    transform: scale3d(.3, .3, .3);
                }
                20% {
                    transform: scale3d(1.1, 1.1, 1.1);
                }
                40% {
                    transform: scale3d(.9, .9, .9);
                }
                60% {
                    opacity: 1;
                    transform: scale3d(1.03, 1.03, 1.03);
                }
                80% {
                    transform: scale3d(.97, .97, .97);
                }
                to {
                    opacity: 1;
                    transform: scale3d(1, 1, 1);
                }
            }
            .success-icon {
                animation: bounceIn 1s;
            }
        `;
        document.head.appendChild(style);
    }

    // Highlight booking ID
    const bookingId = document.querySelector('.booking-id strong');
    
    if (bookingId) {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes highlight {
                0% {
                    background-color: rgba(255, 222, 89, 0);
                }
                50% {
                    background-color: rgba(255, 222, 89, 0.3);
                }
                100% {
                    background-color: rgba(255, 222, 89, 0);
                }
            }
            .booking-id strong {
                animation: highlight 2s ease-in-out infinite;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    // Contact support link
    const contactLink = document.querySelector('.need-help a');
    
    if (contactLink) {
        contactLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get booking ID
            const bookingId = document.querySelector('.booking-id strong').textContent;
            
            // In a real app, this would open the contact page with booking ID pre-filled
            // For demo, we'll redirect to contact page
            window.location.href = `contact.html?booking=${bookingId}`;
        });
    }
});
