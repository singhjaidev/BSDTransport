
// Horizontal Cards Slider Functionality with Precise Visibility Control
document.addEventListener('DOMContentLoaded', function() {
    const cardsTrack = document.getElementById('cardsTrack');
    const leftButton = document.querySelector('.left-nav');
    const rightButton = document.querySelector('.right-nav');
    const sliderContainer = document.querySelector('.cards-slider-container');
    
    if (!cardsTrack || !leftButton || !rightButton || !sliderContainer) {
        console.error('Horizontal cards slider elements not found.');
        return;
    }

    // Get card dimensions dynamically based on screen size
function getCardDimensions() {
  const screenWidth = window.innerWidth;
  let cardWidth, gap;

  if (screenWidth >= 1400) {
    // For ≥1400px, use 215px cards + 22px gap → 4 cards fit
    cardWidth = 215;
    gap = 22;
  } else if (screenWidth >= 1200) {
    // For 1200–1399px, use 200px cards + 20px gap → 4 cards fit
    cardWidth = 200;
    gap = 20;
  } else if (screenWidth >= 992) {
    // Tablet breakpoint: keep original sizes (optional)
    cardWidth = 220;
    gap = 18;
  } else if (screenWidth >= 768) {
    cardWidth = 200;
    gap = 18;
  } else {
    cardWidth = 180;
    gap = 12;
  }

  return {
    cardWidth: cardWidth,
    gap: gap,
    totalWidth: cardWidth + gap,
  };
}

    // Get container padding based on screen size
function getContainerPadding() {
  const screenWidth = window.innerWidth;
  if (screenWidth >= 1400) {
    return 80;  // must match your CSS padding for ≥1400px
  } else if (screenWidth >= 1200) {
    return 70;  // must match your CSS padding for 1200–1399px
  } else if (screenWidth >= 992) {
    return 60;
  } else if (screenWidth >= 768) {
    return 40;
  } else {
    return 20;
  }
}


    // Calculate how many complete cards can fit in viewport
function getVisibleCardsCount() {
  const containerPadding = getContainerPadding();
  const navButtonSpace = 60; // left/right arrows occupy 60px total (30px each)
  const availableWidth =
    window.innerWidth - containerPadding * 2 - navButtonSpace;
  const { totalWidth } = getCardDimensions();

  // Math.floor(...) ensures we never show more than 4 at ≥1200px breakpoints
  return Math.max(1, Math.min(Math.floor(availableWidth / totalWidth), 6));
}
    // Hide/show cards based on visibility
    function updateCardVisibility() {
        const visibleCards = getVisibleCardsCount();
        const allCards = cardsTrack.querySelectorAll('.service-slide-card');
        const { totalWidth } = getCardDimensions();
        
        // Set container width to show exact number of complete cards
        const containerWidth = visibleCards * totalWidth;
        const padding = getContainerPadding();
        sliderContainer.style.maxWidth = (containerWidth + (padding * 2)) + 'px';
        
        // Calculate which cards should be visible based on current position
        const currentIndex = Math.round(currentPosition / totalWidth);
        
        allCards.forEach((card, index) => {
            const relativeIndex = index - currentIndex;
            if (relativeIndex >= 0 && relativeIndex < visibleCards) {
                card.classList.remove('card-hidden');
            } else {
                card.classList.add('card-hidden');
            }
        });
    }

    // Configuration
    let cardDimensions = getCardDimensions();
    let visibleCards = getVisibleCardsCount();
    let currentPosition = 0;
    const originalCards = Array.from(cardsTrack.children);
    const totalCards = originalCards.length;
    
    // Clone cards for infinite scroll
    function setupInfiniteScroll() {
        // Remove any existing clones
        const existingClones = cardsTrack.querySelectorAll('.cloned');
        existingClones.forEach(clone => clone.remove());
        
        // Calculate clones needed for smooth infinite scrolling
        const clonesNeeded = Math.max(visibleCards * 3, 12);
        
        // Add clones at the end
        for (let i = 0; i < clonesNeeded; i++) {
            const clone = originalCards[i % totalCards].cloneNode(true);
            clone.classList.add('cloned');
            cardsTrack.appendChild(clone);
        }
        
        // Add clones at the beginning
        for (let i = 0; i < clonesNeeded; i++) {
            const clone = originalCards[(totalCards - 1 - i + totalCards) % totalCards].cloneNode(true);
            clone.classList.add('cloned');
            cardsTrack.insertBefore(clone, cardsTrack.firstChild);
        }
        
        // Set initial position to show original cards
    // Set initial position so that half of a previous clone is shown on the left
    const halfOffset = Math.floor(cardDimensions.totalWidth / 2);
    currentPosition = clonesNeeded * cardDimensions.totalWidth - halfOffset;
    cardsTrack.style.transform = `translateX(-${currentPosition}px)`;

        
        // Update card visibility
        updateCardVisibility();
    }

    // Update layout on resize
    function updateLayout() {
        cardDimensions = getCardDimensions();
        visibleCards = getVisibleCardsCount();
        
        // Update card widths in CSS
        const allCards = document.querySelectorAll('.service-slide-card');
        allCards.forEach(card => {
            card.style.width = cardDimensions.cardWidth + 'px';
        });
        
        setupInfiniteScroll();
    }

    // Initialize infinite scroll
    updateLayout();

    // Scroll left
    leftButton.addEventListener('click', function() {
        const moveAmount = cardDimensions.totalWidth;
        currentPosition -= moveAmount;
        cardsTrack.style.transform = `translateX(-${currentPosition}px)`;
        
        // Update visibility immediately
        setTimeout(() => {
            updateCardVisibility();
        }, 50);
        
        // Check if we need to reset position (infinite loop)
        setTimeout(() => {
            const clonesAtStart = Math.max(visibleCards * 3, 12);
            
            if (currentPosition <= 0) {
                cardsTrack.style.transition = 'none';
                currentPosition = totalCards * cardDimensions.totalWidth;
                cardsTrack.style.transform = `translateX(-${currentPosition}px)`;
                updateCardVisibility();
                setTimeout(() => {
                    cardsTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                }, 50);
            }
        }, 400);
        
        // Add smooth animation feedback
        leftButton.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            leftButton.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    });

    // Scroll right
    rightButton.addEventListener('click', function() {
        const moveAmount = cardDimensions.totalWidth;
        currentPosition += moveAmount;
        cardsTrack.style.transform = `translateX(-${currentPosition}px)`;
        
        // Update visibility immediately
        setTimeout(() => {
            updateCardVisibility();
        }, 50);
        
        // Check if we need to reset position (infinite loop)
        setTimeout(() => {
            const clonesAtStart = Math.max(visibleCards * 3, 12);
            const maxPosition = (totalCards + clonesAtStart) * cardDimensions.totalWidth;
            
            if (currentPosition >= maxPosition) {
                cardsTrack.style.transition = 'none';
                currentPosition = clonesAtStart * cardDimensions.totalWidth;
                cardsTrack.style.transform = `translateX(-${currentPosition}px)`;
                updateCardVisibility();
                setTimeout(() => {
                    cardsTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                }, 50);
            }
        }, 400);
        
        // Add smooth animation feedback
        rightButton.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            rightButton.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    });

    // Touch/swipe support for mobile
    let startX = 0;
    let isDragging = false;
    let startPosition = 0;

    cardsTrack.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startPosition = currentPosition;
        isDragging = true;
        cardsTrack.style.transition = 'none';
    });

    cardsTrack.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const diffX = startX - currentX;
        const newPosition = startPosition + diffX;
        
        cardsTrack.style.transform = `translateX(-${newPosition}px)`;
    });

    cardsTrack.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        cardsTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        if (Math.abs(diffX) > 50) { // Minimum swipe distance
            if (diffX > 0) {
                // Swipe left - move right
                rightButton.click();
            } else {
                // Swipe right - move left
                leftButton.click();
            }
        } else {
            // Snap back to current position
            cardsTrack.style.transform = `translateX(-${currentPosition}px)`;
            updateCardVisibility();
        }
        
        isDragging = false;
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            leftButton.click();
        } else if (e.key === 'ArrowRight') {
            rightButton.click();
        }
    });

    // Auto-play functionality
    let autoPlayInterval;
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            rightButton.click();
        }, 4000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Start auto-play
    startAutoPlay();

    // Stop auto-play on user interaction
    [leftButton, rightButton].forEach(button => {
        button.addEventListener('click', stopAutoPlay);
    });

    cardsTrack.addEventListener('touchstart', stopAutoPlay);

    // Restart auto-play after 10 seconds of inactivity
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(startAutoPlay, 10000);
    }

    [leftButton, rightButton].forEach(button => {
        button.addEventListener('click', resetInactivityTimer);
    });

    // Pause auto-play when section is not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoPlay();
            } else {
                stopAutoPlay();
            }
        });
    });

    const section = document.querySelector('.horizontal-services-section');
    if (section) {
        observer.observe(section);
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            stopAutoPlay();
            updateLayout();
            setTimeout(startAutoPlay, 1000);
        }, 250);
    });
});
