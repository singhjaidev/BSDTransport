// ─── static/js/modern.js ──────────────────────────────────────────────────────
// Horizontal Cards Slider with true “half-peek” on both sides and 4-card center

document.addEventListener('DOMContentLoaded', function () {
  const cardsTrack     = document.getElementById('cardsTrack');
  const leftButton     = document.querySelector('.left-nav');
  const rightButton    = document.querySelector('.right-nav');
  const sliderContainer = document.querySelector('.cards-slider-container');

  if (!cardsTrack || !leftButton || !rightButton || !sliderContainer) {
    console.error('Horizontal cards slider elements not found.');
    return;
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // 1) CARD DIMENSIONS: cardWidth + gap between cards
  //    We choose 4 cards for ≥1200px; smaller breakpoints fall back to JS-calculated.
  function getCardDimensions() {
    const w = window.innerWidth;
    let cardWidth, gap;

    if (w >= 1400) {
      // ≥1400px: each card is 215px wide, 22px gap
      cardWidth = 215;
      gap = 22;
    } else if (w >= 1200) {
      // 1200–1399px: each card is 200px wide, 20px gap
      cardWidth = 200;
      gap = 20;
    } else if (w >= 992) {
      cardWidth = 220;
      gap = 18;
    } else if (w >= 768) {
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
      // totalWidth = width + gap; used for shifting by “one step” at a time
    };
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // 2) MATCH CSS PADDING: MUST mirror the values in modern.css
  //    - ≥1400px → CSS uses padding: 0 80px
  //    - 1200–1399px → CSS uses padding: 0 40px
  //    - 992–1199px → CSS uses padding: 0 60px
  //    - 768–991px → CSS uses padding: 0 55px
  //    - 576–767px → CSS uses padding: 0 50px
  //    - <576px → CSS uses padding: 0 45px
  function getContainerPadding() {
    const w = window.innerWidth;
    if (w >= 1400) {
      return 80;
    } else if (w >= 1200) {
      return 40;
    } else if (w >= 992) {
      return 60;
    } else if (w >= 768) {
      return 55;
    } else if (w >= 576) {
      return 50;
    } else {
      return 45;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // 3) VISIBLE CARD COUNT: 
  //    - ≥1200px → **always** 4 cards in the viewport
  //    - otherwise, compute how many fit (fallback)
  function getVisibleCardsCount() {
    const w = window.innerWidth;
    if (w >= 1200) {
      return 4;
    }

    // For narrower screens (<1200), use fallback logic:
    const padding = getContainerPadding();
    const navButtonSpace = 60; 
    // We assume the left/right arrows occupy about 60px total
    const availableWidth = w - padding * 2 - navButtonSpace;
    const { totalWidth } = getCardDimensions();
    return Math.max(1, Math.floor(availableWidth / totalWidth));
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // 4) UPDATE VISIBILITY + CONTAINER WIDTH:
  //    - Build exact container width so exactly “visibleCards” fit
  //    - Hide everything outside that range (optional, for performance)
  function updateCardVisibility() {
    const visibleCards = getVisibleCardsCount();
    const { cardWidth, gap } = getCardDimensions();
    const padding = getContainerPadding();

    // Compute EXACT width of “visibleCards” in px:
    //    totalCardsWidth = (visibleCards * cardWidth) + ((visibleCards - 1) * gap)
    const totalCardsWidth = visibleCards * cardWidth + (visibleCards - 1) * gap;

    // Now set sliderContainer’s max-width = totalCardsWidth + 2 * padding
    sliderContainer.style.maxWidth = totalCardsWidth + padding * 2 + 'px';

    // Optionally hide cards outside the “visibleCards” range:
    //    We find currentIndex = round(currentPosition / totalWidth),
    //    then show only indices [currentIndex, currentIndex + visibleCards - 1]
    const allCards = cardsTrack.querySelectorAll('.service-slide-card');
    const { totalWidth } = getCardDimensions();
    const currentIndex = Math.round(currentPosition / totalWidth);

    allCards.forEach((card, i) => {
      const relative = i - currentIndex;
      if (relative >= 0 && relative < visibleCards) {
        card.classList.remove('card-hidden');
      } else {
        card.classList.add('card-hidden');
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // 5) INFINITE SCROLL SETUP: clone before/after, then SHIFT by half a card
  let cardDimensions = getCardDimensions();
  let visibleCards    = getVisibleCardsCount();
  let currentPosition = 0;
  let isWrapping = false;
  const originalCards = Array.from(cardsTrack.children);
  const totalCards    = originalCards.length;

function setupInfiniteScroll() {
  // 1) Remove any existing clones
  const existingClones = cardsTrack.querySelectorAll('.cloned');
  existingClones.forEach(clone => clone.remove());

  // 2) Re-compute dimensions, counts
  cardDimensions = getCardDimensions();
  visibleCards   = getVisibleCardsCount();
  const totalWidth = cardDimensions.totalWidth;
  const totalCards = originalCards.length;

  // 3) Decide how many clones we need (at least visibleCards*3)
  const clonesNeeded = Math.max(visibleCards * 3, 12);

  // 4) Append clones at the end
  for (let i = 0; i < clonesNeeded; i++) {
    const clone = originalCards[i % totalCards].cloneNode(true);
    clone.classList.add('cloned');
    cardsTrack.appendChild(clone);
  }

  // 5) Insert clones at the beginning
  for (let i = 0; i < clonesNeeded; i++) {
    const idx = (totalCards - 1 - i + totalCards) % totalCards;
    const clone = originalCards[idx].cloneNode(true);
    clone.classList.add('cloned');
    cardsTrack.insertBefore(clone, cardsTrack.firstChild);
  }

  // 6) SET the initial position so that the first ORIGINAL card is flush on the left:
  //    (This guarantees 4 full cards, no “half-peek”.)
  currentPosition = clonesNeeded * totalWidth;
  cardsTrack.style.transform = `translateX(-${currentPosition}px)`;

  // 7) Finally, update which cards are visible (optional masking/hiding)
  updateCardVisibility();
}

  // ────────────────────────────────────────────────────────────────────────────────
  // 6) ON RESIZE: recalc everything (dimension, visibleCards, re-clone, re-shift)
  function updateLayout() {
    cardDimensions = getCardDimensions();
    visibleCards   = getVisibleCardsCount();

    // ① Set every card’s width via inline style (so JS and CSS remain in sync):
    const allCardsNow = document.querySelectorAll('.service-slide-card');
    allCardsNow.forEach(card => {
      card.style.width = cardDimensions.cardWidth + 'px';
    });

    // ② Rebuild clones + reposition:
    setupInfiniteScroll();
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // 7) INITIALIZE after DOM is ready:
  updateLayout();

  // ────────────────────────────────────────────────────────────────────────────────
  // 8) LEFT / RIGHT BUTTON CLICK HANDLERS:
 leftButton.addEventListener('click', () => {
  const { totalWidth } = cardDimensions;   // cardWidth + gap
  const fullCycle      = totalCards * totalWidth;
  const clonesNeeded   = Math.max(visibleCards * 3, 12);
  // The position at which we’ve just scrolled “before” the first clone:
  const startPosition  = clonesNeeded * totalWidth;

  // 1) Slide backward exactly 1 card:
  currentPosition -= totalWidth;
  cardsTrack.style.transform = `translateX(-${currentPosition}px)`;

  // 2) After 50ms, update any visibility masks:
  setTimeout(updateCardVisibility, 50);

  // 3) Schedule a wrap‐check 400ms later—only once per click:
  if (!isWrapping) {
    isWrapping = true;

    setTimeout(() => {
      // If we have scrolled “before” the first cloned card…
      if (currentPosition < startPosition) {
        // Temporarily disable transition so the jump is instant:
        cardsTrack.style.transition = 'none';

        // Add one full cycle (totalCards * totalWidth) so we land back in the middle:
        currentPosition += fullCycle;
        cardsTrack.style.transform = `translateX(-${currentPosition}px)`;

        // Re‐apply visibility masks:
        updateCardVisibility();

        // Re‐enable smooth transition after a tiny delay:
        setTimeout(() => {
          cardsTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 20);
      }

      isWrapping = false;
    }, 400);
  }

  // 4) Button click “pop” animation:
  leftButton.style.transform = 'translateY(-50%) scale(0.95)';
  setTimeout(() => {
    leftButton.style.transform = 'translateY(-50%) scale(1)';
  }, 150);
});



rightButton.addEventListener('click', () => {
  const { totalWidth } = cardDimensions;   // cardWidth + gap
  const fullCycle   = totalCards * totalWidth;
  const clonesNeeded = Math.max(visibleCards * 3, 12);
  const endPosition = (clonesNeeded + totalCards) * totalWidth;

  // 1) Slide forward exactly 1 card:
  currentPosition += totalWidth;
  cardsTrack.style.transform = `translateX(-${currentPosition}px)`;

  // 2) After 50ms, update any visibility masks (optional):
  setTimeout(updateCardVisibility, 50);

  // 3) Now schedule a quick “wrap‐check” 400ms later—only once per click:
  if (!isWrapping) {
    isWrapping = true;

    setTimeout(() => {
      // If we have scrolled beyond the last cloned copy…
      if (currentPosition >= endPosition) {
        // Disable transition so jump is instant:
        cardsTrack.style.transition = 'none';

        // Subtract one full cycle so we land back in the middle.
        // (This is the key difference—rather than resetting to clonesNeeded * totalWidth,
        //  we subtract exactly totalCards * totalWidth. That “wraps” us back seamlessly.)
        currentPosition -= fullCycle;
        cardsTrack.style.transform = `translateX(-${currentPosition}px)`;

        // Update masks one last time:
        updateCardVisibility();

        // Re-enable smooth transition after a tiny delay:
        setTimeout(() => {
          cardsTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 20);
      }

      isWrapping = false;
    }, 400);
  }

  // 4) Add the little “button‐pop” animation:
  rightButton.style.transform = 'translateY(-50%) scale(0.95)';
  setTimeout(() => {
    rightButton.style.transform = 'translateY(-50%) scale(1)';
  }, 150);
});

  // ────────────────────────────────────────────────────────────────────────────────
  // 9) TOUCH / SWIPE SUPPORT:
  let startX = 0, isDragging = false, startPos = 0;
  cardsTrack.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startPos = currentPosition;
    isDragging = true;
    cardsTrack.style.transition = 'none';
  });
  cardsTrack.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currX = e.touches[0].clientX;
    const diffX = startX - currX;
    const newPos = startPos + diffX;
    cardsTrack.style.transform = `translateX(-${newPos}px)`;
  });
  cardsTrack.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    cardsTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        rightButton.click();
      } else {
        leftButton.click();
      }
    } else {
      // Snap back to current position if not a big swipe
      cardsTrack.style.transform = `translateX(-${currentPosition}px)`;
      updateCardVisibility();
    }
    isDragging = false;
  });

  // ────────────────────────────────────────────────────────────────────────────────
  // 10) KEYBOARD NAVIGATION:
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      leftButton.click();
    } else if (e.key === 'ArrowRight') {
      rightButton.click();
    }
  });

  // ────────────────────────────────────────────────────────────────────────────────
  // 11) AUTO-PLAY (optional):
  let autoPlayInterval;
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      rightButton.click();
    }, 4000);
  }
  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }
  startAutoPlay();
  [leftButton, rightButton].forEach(btn => {
    btn.addEventListener('click', () => {
      stopAutoPlay();
      // Restart after 10s of inactivity:
      clearTimeout(window.__inactivityTimer);
      window.__inactivityTimer = setTimeout(startAutoPlay, 10000);
    });
  });

  // Pause auto-play when section is offscreen:
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
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

  // ────────────────────────────────────────────────────────────────────────────────
  // 12) WINDOW RESIZE: throttle and reinitialize
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      stopAutoPlay();
      updateLayout();
      setTimeout(startAutoPlay, 1000);
    }, 200);
  });
});
// ────────────────────────────────────────────────────────────────────────────────
// How It Works Section Animation (Optional)
document.addEventListener('DOMContentLoaded', function() {
  const howItWorksSection = document.querySelector('.how-it-works');
  
  if (howItWorksSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const steps = entry.target.querySelectorAll('.grid > div');
          steps.forEach((step, index) => {
            setTimeout(() => {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            }, index * 200);
          });
        }
      });
    }, {
      threshold: 0.3
    });

    // Set initial state for animation
    const steps = howItWorksSection.querySelectorAll('.grid > div');
    steps.forEach(step => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(20px)';
      step.style.transition = 'all 0.6s ease';
    });

    observer.observe(howItWorksSection);
  }
});
// Airport Transfer Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to airport items
    const airportItems = document.querySelectorAll('.airport-item');
    
    airportItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.borderColor = '#000';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.borderColor = '#e5e7eb';
        });
    });
    
    // Add click tracking for the CTA button
    const ctaButton = document.querySelector('.airport-cta');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            // You can add analytics tracking here
            console.log('Airport transfer booking button clicked');
            
            // Add a subtle animation on click
            this.style.transform = 'translateY(0)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px)';
            }, 100);
        });
    }
    
    // Intersection Observer for fade-in animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Apply fade-in animation to the section
    const airportSection = document.querySelector('.airport-specialist');
    if (airportSection) {
        airportSection.style.opacity = '0';
        airportSection.style.transform = 'translateY(30px)';
        airportSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(airportSection);
    }


    // Initialize AOS (Animate On Scroll) if not already done
if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true,
    offset: 100
  });
}

// Alternative animation using Intersection Observer if AOS is not available
if (typeof AOS === 'undefined') {
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
      }
    });
  }, observerOptions);

  // Observe all feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
  });
}

// Add hover effects and interactive animations
document.querySelectorAll('.feature-card').forEach((card, index) => {
  // Staggered animation delay
  card.style.animationDelay = `${index * 150}ms`;
  
  // Enhanced hover interactions
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-8px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Parallax effect on scroll


// Add scroll animation to mission cards
document.addEventListener('DOMContentLoaded', function() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Initially hide cards and apply transform
  const missionCards = document.querySelectorAll('.mission-card');
  missionCards.forEach(function(card, index) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's, transform 0.6s ease ' + (index * 0.1) + 's';
    observer.observe(card);
  });

  // Add stagger effect for better visual appeal
  missionCards.forEach(function(card, index) {
    card.addEventListener('mouseenter', function() {
      this.style.transitionDelay = '0s';
    });
  });
});
// Add scroll animation to service items
document.addEventListener('DOMContentLoaded', function() {
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(function(item, index) {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's, transform 0.6s ease ' + (index * 0.1) + 's';
    observer.observe(item);
  });
});

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
