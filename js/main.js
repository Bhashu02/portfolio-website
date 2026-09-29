/**
 * Main JavaScript for Bhaswar Ghosh Portfolio
 * Lightweight, zero-dependency, accessible vanilla JS
 * Featuring smooth scroll animations, gallery interactions, and UI helpers
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Scroll Progress Bar
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.prepend(progressBar);

  const updateScrollProgress = () => {
    const scrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // 1b. Smart Sticky Header (Hides smoothly on scroll down, pops up immediately on scroll up)
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    let isHeaderTicking = false;
    const scrollDeltaThreshold = 5; // Minimum 5px scroll to avoid micro-vibrations
    const topSafeZone = 60; // Always fully visible near top of page

    const handleHeaderScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);

      // Never hide header if mobile menu or theme dropdown is active
      const mobileNav = document.querySelector('.nav-links');
      const isMobileMenuOpen = mobileNav && mobileNav.classList.contains('is-open');
      const isThemeMenuOpen = document.querySelector('.theme-dropdown-menu.is-open');

      if (isMobileMenuOpen || isThemeMenuOpen) {
        siteHeader.classList.remove('is-hidden');
        lastScrollY = currentScrollY;
        isHeaderTicking = false;
        return;
      }

      // Elevation shadow when scrolled away from top
      if (currentScrollY > 15) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }

      // Always show when near the very top
      if (currentScrollY <= topSafeZone) {
        siteHeader.classList.remove('is-hidden');
      } else {
        const delta = currentScrollY - lastScrollY;

        if (delta > scrollDeltaThreshold) {
          // Scrolling DOWN -> Hide header
          siteHeader.classList.add('is-hidden');
        } else if (delta < -scrollDeltaThreshold) {
          // Scrolling UP even a little bit -> Pop header back up immediately!
          siteHeader.classList.remove('is-hidden');
        }
      }

      lastScrollY = currentScrollY;
      isHeaderTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!isHeaderTicking) {
        window.requestAnimationFrame(handleHeaderScroll);
        isHeaderTicking = true;
      }
    }, { passive: true });

    // Instantly reveal header whenever any in-page link is clicked
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', () => {
        siteHeader.classList.remove('is-hidden');
      });
    });
  }

  // 2. Scroll-Triggered Reveal Animations
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // On phones and tablets: immediately make all content visible and loaded with 0 latency
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Once animated in, unobserve
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.01, // Trigger as soon as even 1px enters view
      rootMargin: '0px 0px 200px 0px' // Preload 200px before scrolling into view so content is already loaded!
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: make everything visible immediately
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // 3. Interactive Multi-Image Project Gallery Controller
  const galleries = document.querySelectorAll('.project-gallery-stage');

  galleries.forEach((gallery) => {
    const slides = gallery.querySelectorAll('.gallery-slide');
    const tabs = gallery.querySelectorAll('.gallery-tab-btn');
    const prevBtn = gallery.querySelector('.prev-btn');
    const nextBtn = gallery.querySelector('.next-btn');
    const currentIndicator = gallery.querySelector('.current-slide');
    
    if (!slides.length) return;

    let currentIndex = 0;

    const goToSlide = (index) => {
      // Wrap around
      if (index < 0) {
        currentIndex = slides.length - 1;
      } else if (index >= slides.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      // Update slide states
      slides.forEach((slide, idx) => {
        if (idx === currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      // Update tabs states
      tabs.forEach((tab, idx) => {
        if (idx === currentIndex) {
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
        } else {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
        }
      });

      // Update counter
      if (currentIndicator) {
        currentIndicator.textContent = String(currentIndex + 1);
      }
    };

    // Tab buttons click
    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        goToSlide(idx);
      });
    });

    // Arrow navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
      });
    }

    // Touch Swipe handling for smartphone & tablet screens
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    gallery.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      isSwiping = false;
    }, { passive: true });

    gallery.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Ensure horizontal swipe is dominant and significant
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        isSwiping = true;
        if (diffX < 0) {
          goToSlide(currentIndex + 1); // Swipe left -> Next slide
        } else {
          goToSlide(currentIndex - 1); // Swipe right -> Prev slide
        }
        setTimeout(() => { isSwiping = false; }, 200);
      }
    }, { passive: true });
  });

  // 4. Interactive Fullscreen Screenshot Lightbox Modal
  // With Keyboard navigation, touch-swipe gestures, mouse dragging, and fancy transitions
  const lightboxModal = document.createElement('div');
  lightboxModal.className = 'lightbox-modal';
  lightboxModal.setAttribute('role', 'dialog');
  lightboxModal.setAttribute('aria-modal', 'true');
  lightboxModal.setAttribute('aria-label', 'Fullscreen project screenshot viewer');
  lightboxModal.innerHTML = `
    <div class="lightbox-top-bar">
      <div class="lightbox-counter-badge">
        <span class="lightbox-current">1</span> / <span class="lightbox-total">4</span>
      </div>
      <div class="lightbox-hint-text">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
        <span>Swipe or use arrow keys</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
      <button type="button" class="lightbox-close-btn" aria-label="Close preview (Esc)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <div class="lightbox-stage">
      <button type="button" class="lightbox-nav-btn lightbox-prev-btn" aria-label="Previous screenshot (Left arrow)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <div class="lightbox-image-container">
        <img src="" alt="" class="lightbox-image" draggable="false">
      </div>

      <button type="button" class="lightbox-nav-btn lightbox-next-btn" aria-label="Next screenshot (Right arrow)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>

    <div class="lightbox-footer">
      <div class="lightbox-dots" role="tablist" aria-label="Slide indicators"></div>
    </div>
  `;
  document.body.appendChild(lightboxModal);

  const lightboxImg = lightboxModal.querySelector('.lightbox-image');
  const lightboxStage = lightboxModal.querySelector('.lightbox-stage');
  const lightboxClose = lightboxModal.querySelector('.lightbox-close-btn');
  const lightboxPrev = lightboxModal.querySelector('.lightbox-prev-btn');
  const lightboxNext = lightboxModal.querySelector('.lightbox-next-btn');
  const lightboxCurrent = lightboxModal.querySelector('.lightbox-current');
  const lightboxTotal = lightboxModal.querySelector('.lightbox-total');
  const lightboxDots = lightboxModal.querySelector('.lightbox-dots');

  let currentGalleryStage = null;
  let currentSlidesData = [];
  let currentSlideIndex = 0;
  let isTransitioning = false;

  const updateDots = () => {
    lightboxDots.innerHTML = '';
    currentSlidesData.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `lightbox-dot ${idx === currentSlideIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (idx !== currentSlideIndex) {
          goToLightboxSlide(idx, idx > currentSlideIndex ? 'next' : 'prev');
        }
      });
      lightboxDots.appendChild(dot);
    });
  };

  const syncUnderlyingGallery = (index) => {
    if (!currentGalleryStage) return;
    const slides = currentGalleryStage.querySelectorAll('.gallery-slide');
    const tabs = currentGalleryStage.querySelectorAll('.gallery-tab-btn');
    const currentIndicator = currentGalleryStage.querySelector('.current-slide');
    if (slides.length) {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
    }
    if (tabs.length) {
      tabs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
        t.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }
    if (currentIndicator) {
      currentIndicator.textContent = String(index + 1);
    }
  };

  const goToLightboxSlide = (targetIndex, direction = 'next') => {
    if (isTransitioning || currentSlidesData.length <= 1) return;
    isTransitioning = true;

    // Wrap index safely
    let nextIndex = targetIndex;
    if (nextIndex < 0) nextIndex = currentSlidesData.length - 1;
    if (nextIndex >= currentSlidesData.length) nextIndex = 0;

    const isNext = direction === 'next';
    const exitClass = isNext ? 'anim-exit-left' : 'anim-exit-right';
    const enterClass = isNext ? 'anim-enter-right' : 'anim-enter-left';

    // 1. Animate out current image with smooth horizontal slide
    lightboxImg.classList.add(exitClass);

    setTimeout(() => {
      currentSlideIndex = nextIndex;
      const data = currentSlidesData[currentSlideIndex];

      // Update contents
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
      lightboxCurrent.textContent = String(currentSlideIndex + 1);

      updateDots();
      syncUnderlyingGallery(currentSlideIndex);

      // Prepare entering state from opposite side
      lightboxImg.classList.remove(exitClass);
      lightboxImg.classList.add(enterClass);

      // Force layout reflow
      void lightboxImg.offsetWidth;

      // Animate smoothly into active center
      lightboxImg.classList.remove(enterClass);

      setTimeout(() => {
        isTransitioning = false;
      }, 290);
    }, 150);
  };

  const openLightboxWithGallery = (stage, startIndex = 0) => {
    currentGalleryStage = stage;
    const slides = stage ? Array.from(stage.querySelectorAll('.gallery-slide')) : [];

    if (!slides.length) return;

    currentSlidesData = slides.map((slide, idx) => {
      const img = slide.querySelector('img');
      return {
        index: idx,
        src: img ? img.src : '',
        alt: img ? (img.alt || 'Project screenshot') : ''
      };
    });

    currentSlideIndex = Math.max(0, Math.min(startIndex, currentSlidesData.length - 1));
    const activeData = currentSlidesData[currentSlideIndex];

    lightboxImg.src = activeData.src;
    lightboxImg.alt = activeData.alt;
    lightboxCurrent.textContent = String(currentSlideIndex + 1);
    lightboxTotal.textContent = String(currentSlidesData.length);

    // Show/hide arrows and dots if single slide
    const hasMultiple = currentSlidesData.length > 1;
    lightboxPrev.style.display = hasMultiple ? 'flex' : 'none';
    lightboxNext.style.display = hasMultiple ? 'flex' : 'none';
    lightboxDots.style.display = hasMultiple ? 'flex' : 'none';

    updateDots();

    lightboxModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightboxModal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeLightbox();
  };

  // Close triggers with instant touch and click support
  lightboxClose.addEventListener('click', handleClose);
  lightboxClose.addEventListener('touchend', handleClose);
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target === lightboxStage) {
      closeLightbox();
    }
  });

  // Arrows with instant touch and click support
  const handlePrev = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    goToLightboxSlide(currentSlideIndex - 1, 'prev');
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    goToLightboxSlide(currentSlideIndex + 1, 'next');
  };

  lightboxPrev.addEventListener('click', handlePrev);
  lightboxPrev.addEventListener('touchend', handlePrev);

  lightboxNext.addEventListener('click', handleNext);
  lightboxNext.addEventListener('touchend', handleNext);

  // Keyboard navigation (Arrow keys, A/D, PageUp/PageDown, Escape)
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight' || e.key === 'KeyD' || e.key === 'PageDown') {
      e.preventDefault();
      goToLightboxSlide(currentSlideIndex + 1, 'next');
    } else if (e.key === 'ArrowLeft' || e.key === 'KeyA' || e.key === 'PageUp') {
      e.preventDefault();
      goToLightboxSlide(currentSlideIndex - 1, 'prev');
    }
  });

  // Touch Swipe Gesture Controller (Smooth natural horizontal slide)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isSwiping = false;

  lightboxStage.addEventListener('touchstart', (e) => {
    if (currentSlidesData.length <= 1 || isTransitioning) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    isSwiping = true;
    lightboxImg.style.transition = 'none';
  }, { passive: true });

  lightboxStage.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (Math.abs(touchDeltaX) > Math.abs(deltaY)) {
      // Pure, smooth horizontal slide following finger
      lightboxImg.style.transform = `translateX(${touchDeltaX}px)`;
    }
  }, { passive: true });

  lightboxStage.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;
    lightboxImg.style.transition = '';
    lightboxImg.style.transform = '';
    lightboxImg.style.opacity = '';

    const swipeThreshold = 40;
    if (touchDeltaX < -swipeThreshold) {
      goToLightboxSlide(currentSlideIndex + 1, 'next');
    } else if (touchDeltaX > swipeThreshold) {
      goToLightboxSlide(currentSlideIndex - 1, 'prev');
    }
    touchDeltaX = 0;
  }, { passive: true });

  // Mouse Drag Controller (Smooth natural horizontal slide)
  let mouseStartX = 0;
  let mouseDeltaX = 0;
  let isMouseDragging = false;

  lightboxImg.addEventListener('mousedown', (e) => {
    if (currentSlidesData.length <= 1 || isTransitioning) return;
    mouseStartX = e.clientX;
    mouseDeltaX = 0;
    isMouseDragging = true;
    lightboxImg.style.cursor = 'grabbing';
    lightboxImg.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    mouseDeltaX = e.clientX - mouseStartX;
    // Pure, smooth horizontal slide following mouse
    lightboxImg.style.transform = `translateX(${mouseDeltaX}px)`;
  });

  window.addEventListener('mouseup', () => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    lightboxImg.style.cursor = 'grab';
    lightboxImg.style.transition = '';
    lightboxImg.style.transform = '';
    lightboxImg.style.opacity = '';

    const dragThreshold = 45;
    if (mouseDeltaX < -dragThreshold) {
      goToLightboxSlide(currentSlideIndex + 1, 'next');
    } else if (mouseDeltaX > dragThreshold) {
      goToLightboxSlide(currentSlideIndex - 1, 'prev');
    }
    mouseDeltaX = 0;
  });

  // Attach triggers to all gallery slides
  document.querySelectorAll('.gallery-slide').forEach((slide) => {
    slide.style.cursor = 'zoom-in';
    slide.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      const stage = slide.closest('.project-gallery-stage');
      const allSlides = stage ? Array.from(stage.querySelectorAll('.gallery-slide')) : [];
      const slideIndex = allSlides.indexOf(slide);
      openLightboxWithGallery(stage, slideIndex >= 0 ? slideIndex : 0);
    });
  });

  // Attach triggers to browser mockup zoom buttons
  document.querySelectorAll('.browser-zoom-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stage = btn.closest('.project-gallery-stage');
      if (!stage) return;
      const allSlides = Array.from(stage.querySelectorAll('.gallery-slide'));
      const activeSlide = stage.querySelector('.gallery-slide.active');
      const activeIndex = activeSlide ? allSlides.indexOf(activeSlide) : 0;
      openLightboxWithGallery(stage, activeIndex >= 0 ? activeIndex : 0);
    });
  });

  // 4. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('is-open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
        mobileToggle.focus();
      }
    });
  }

  // 5. Email Copy to Clipboard Feature
  const copyBtn = document.querySelector('.copy-btn');
  const emailLink = document.querySelector('.email-address');

  if (copyBtn && emailLink) {
    copyBtn.addEventListener('click', async () => {
      const email = emailLink.textContent.trim();
      const originalText = copyBtn.innerHTML;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = email;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Copied!
        `;

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalText;
        }, 2500);
      } catch (err) {
        console.warn('Unable to copy text to clipboard: ', err);
      }
    });
  }

  // 5b. Direct Message Quick Form Handler
  const quickForm = document.getElementById('contact-quick-form');
  if (quickForm) {
    const statusDiv = document.getElementById('form-status');
    const submitBtn = quickForm.querySelector('.submit-btn');
    const submitBtnText = submitBtn ? submitBtn.querySelector('span') : null;

    const showStatus = (text, type) => {
      if (!statusDiv) return;
      statusDiv.textContent = text;
      statusDiv.className = `form-status is-visible status-${type}`;
    };

    const hideStatus = () => {
      if (!statusDiv) return;
      statusDiv.className = 'form-status';
      statusDiv.textContent = '';
    };

    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('sender-email');
      const messageInput = document.getElementById('sender-message');

      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!email || !message) {
        showStatus('Please provide both your email address and message.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      const originalText = submitBtnText ? submitBtnText.textContent : 'Send Message';
      if (submitBtnText) submitBtnText.textContent = 'Sending...';
      hideStatus();

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: '98cb9e49-6900-4b0b-ba9e-f6dfecc6e8b5',
            email: email,
            message: message,
            subject: `New Message from ${email} via bhaswarghosh.com`,
            from_name: 'Bhaswar Ghosh Portfolio'
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          quickForm.reset();
          showStatus("Thank you! Your message has been sent successfully. I'll get back to you soon.", 'success');
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        showStatus('Message could not be sent right now. Please email hello@bhaswarghosh.com directly.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnText) submitBtnText.textContent = originalText;
      }
    });
  }

  // 6. Dynamic Footer Year
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});
