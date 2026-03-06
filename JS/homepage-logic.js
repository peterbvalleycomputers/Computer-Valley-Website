// Scroll to top on page load/refresh
window.scrollTo(0, 0);
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Wait until the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById('pageLoader');
  const loaderSub = document.getElementById('pageLoaderSub');
  const loaderStart = performance.now();
  const isInternalNav = sessionStorage.getItem('internalNav');
  sessionStorage.removeItem('internalNav');
  if (loader && isInternalNav) {
    loader.remove();
  } else if (loader) {
    document.body.classList.add('loader-lock');
  }
  const nav = document.getElementById("mainNav");

  // Scroll listener (rAF-throttled)
  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          nav.classList.add("nav-scrolled");
        } else {
          nav.classList.remove("nav-scrolled");
        }
        scrollTicking = false;
      });
    }
  }, {passive: true});

  AOS.init({
    duration: 900,
    once: true,
    easing: "ease-out-cubic",
  });

  const supportsCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsCustomCursor) {
    document.body.classList.add('custom-cursor-enabled');
  } else {
    document.body.classList.remove('custom-cursor-enabled');
    const touchCursor = document.getElementById("cursor");
    if (touchCursor) touchCursor.remove();
  }

  // Morphing Cursor Implementation with adaptive performance mode
  const cursor = document.getElementById("cursor");
  const customCursorEnabled = document.body.classList.contains('custom-cursor-enabled');
  if (!customCursorEnabled) {
    if (cursor) cursor.remove();
  } else {
  const cpuThreads = navigator.hardwareConcurrency || 4;
  const deviceMemory = navigator.deviceMemory || 4;
  // Full cursor mode only on clearly high-end devices.
  const isLiteCursorMode = !(cpuThreads >= 10 && deviceMemory >= 8);
  document.body.classList.toggle('cursor-lite', isLiteCursorMode);
  const gooBlurNode = document.querySelector('#goo feGaussianBlur');
  const gooMatrixNode = document.querySelector('#goo feColorMatrix');
  if (gooBlurNode && gooMatrixNode) {
    if (isLiteCursorMode) {
      gooBlurNode.setAttribute('stdDeviation', '4.5');
      gooMatrixNode.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12');
    } else {
      gooBlurNode.setAttribute('stdDeviation', '6');
      gooMatrixNode.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15');
    }
  }

  const amount = isLiteCursorMode ? 7 : 10;
  const sineDots = Math.floor(amount * 0.3);
  const width = 26;
  const idleTimeout = 150;
  let lastFrame = 0;
  let mousePosition = {x: 0, y: 0};
  let dots = [];
  let timeoutID;
  let idle = false;

  class Dot {
    constructor(index = 0) {
      this.index = index;
      this.anglespeed = 0.05;
      this.x = 0;
      this.y = 0;
      this.scale = 1 - 0.05 * index;
      this.range = width / 2 - width / 2 * this.scale + 2;
      this.limit = width * 0.75 * this.scale;
      this.element = document.createElement("span");
      this.element.style.transform = `translate3d(0px,0px,0) scale(${this.scale})`;
      cursor.appendChild(this.element);
    }

    lock() {
      this.lockX = this.x;
      this.lockY = this.y;
      this.angleX = Math.PI * 2 * Math.random();
      this.angleY = Math.PI * 2 * Math.random();
    }

    draw() {
      if (!idle || this.index <= sineDots) {
        this.element.style.transform = `translate3d(${this.x}px,${this.y}px,0) scale(${this.scale})`;
      } else {
        this.angleX += this.anglespeed;
        this.angleY += this.anglespeed;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        this.element.style.transform = `translate3d(${this.x}px,${this.y}px,0) scale(${this.scale})`;
      }
    }
  }

  function init() {
    window.addEventListener("mousemove", onMouseMove, {passive: true});
    window.addEventListener("touchmove", onTouchMove, {passive: true});
    lastFrame = performance.now();
    buildDots();
    render();
  }

  function startIdleTimer() {
    timeoutID = setTimeout(goInactive, idleTimeout);
    idle = false;
  }

  function resetIdleTimer() {
    clearTimeout(timeoutID);
    startIdleTimer();
  }

  function goInactive() {
    idle = true;
    for (let dot of dots) {
      dot.lock();
    }
  }

  function buildDots() {
    for (let i = 0; i < amount; i++) {
      let dot = new Dot(i);
      dots.push(dot);
    }
  }

  const onMouseMove = event => {
    mousePosition.x = event.clientX - width / 2;
    mousePosition.y = event.clientY - width / 2;
    resetIdleTimer();
  };

  const onTouchMove = event => {
    mousePosition.x = event.touches[0].clientX - width / 2;
    mousePosition.y = event.touches[0].clientY - width / 2;
    resetIdleTimer();
  };

  const render = timestamp => {
    const frameBudget = isLiteCursorMode ? 16 : 12;
    // Use adaptive frame budget: smoother on high-end, still bounded on lite mode.
    if (timestamp && lastFrame && timestamp - lastFrame < frameBudget) {
      requestAnimationFrame(render);
      return;
    }
    if (document.hidden) {
      requestAnimationFrame(render);
      return;
    }
    positionCursor();
    lastFrame = timestamp;
    requestAnimationFrame(render);
  };

  const positionCursor = () => {
    let x = mousePosition.x;
    let y = mousePosition.y;
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const nextDot = dots[i + 1] || dots[0];
      dot.x = x;
      dot.y = y;
      dot.draw();
      if (!idle || i <= sineDots) {
        x += (nextDot.x - dot.x) * 0.35;
        y += (nextDot.y - dot.y) * 0.35;
      }
    }
  };

  init();
  }

  // Site is permanently dark themed.
  document.body.classList.add('dark-theme');

  // Mobile menu functionality
  function initMobileMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuIcon = document.getElementById("menuIcon");
    
    if (!menuToggle || !mobileMenu || !menuIcon) return;

    function closeMenuDetails() {
      mobileMenu.querySelectorAll('details[open]').forEach((detailsEl) => {
        detailsEl.removeAttribute('open');
      });
    }

    function setMenuOpen(open) {
      if (open) {
        mobileMenu.classList.remove('translate-x-full');
        document.body.classList.add('menu-open');
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark');
        menuToggle.setAttribute('aria-expanded', 'true');
      } else {
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('menu-open');
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
        menuToggle.setAttribute('aria-expanded', 'false');
        closeMenuDetails();
      }
    }

    window.toggleMobileMenu = function toggleMobileMenu() {
      const isOpen = !mobileMenu.classList.contains('translate-x-full');
      setMenuOpen(!isOpen);
    }

    // Toggle menu on button click
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      window.toggleMobileMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('translate-x-full') && 
          !menuToggle.contains(e.target) && 
          !mobileMenu.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    // Close menu when clicking on a link
    document.querySelectorAll('#mobileMenu a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
        setMenuOpen(false);
      }
    });

    // Ensure menu is closed when returning to desktop layout.
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && !mobileMenu.classList.contains('translate-x-full')) {
        setMenuOpen(false);
      }
    });
  }

  // Initialize mobile menu when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }

  // Counter animation
  const counters = document.querySelectorAll('.counter');
  const speed = 200;

  const animateCounter = (counter) => {
    const target = +counter.getAttribute('data-target');
    const duration = 1200; // ms
    let start = null;
    
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      counter.innerText = progress < 1 ? Math.ceil(current) : target;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };

  // Intersection Observer for counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });

  // Testimonials Carousel
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial-slide');
  const totalTestimonials = testimonials.length;
  const testimonialTrack = document.getElementById('testimonialTrack');
  
  // Cache DOM elements and use CSS classes for better performance
  function updateTestimonialCarousel() {
    if (testimonialTrack) {
      // Hide all testimonials at once using CSS class
      testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
      });
      
      // Show current pair of testimonials
      for (let i = 0; i < 2 && (currentTestimonial + i) < totalTestimonials; i++) {
        const testimonial = testimonials[currentTestimonial + i];
        if (testimonial) {
          testimonial.classList.add('active');
        }
      }
      
      // Update dots more efficiently
      const currentPair = Math.floor(currentTestimonial / 2);
      const navigationDots = document.querySelectorAll('.testimonial-carousel .flex.justify-center button');
      navigationDots.forEach((dot, index) => {
        dot.classList.toggle('bg-orange-500', index === currentPair);
        dot.classList.toggle('bg-orange-500/35', index !== currentPair);
        dot.classList.toggle('shadow-[0_0_12px_rgba(249,115,22,0.75)]', index === currentPair);
      });
    }
  }

  // Cap to even pairs so the last slide never shows a lone card
  const maxStartIndex = totalTestimonials >= 2 ? (totalTestimonials - (totalTestimonials % 2)) - 2 : 0;

  window.nextTestimonial = function nextTestimonial() {
    currentTestimonial = currentTestimonial + 2;
    if (currentTestimonial > maxStartIndex) currentTestimonial = 0;
    updateTestimonialCarousel();
  };

  window.previousTestimonial = function previousTestimonial() {
    currentTestimonial = currentTestimonial - 2;
    if (currentTestimonial < 0) currentTestimonial = maxStartIndex;
    updateTestimonialCarousel();
  };

  window.goToTestimonial = function goToTestimonial(startIndex) {
    currentTestimonial = startIndex;
    updateTestimonialCarousel();
  };

  updateTestimonialCarousel();

  // Auto-rotate testimonials
  setInterval(window.nextTestimonial, 5000);

  // Manual drag functionality for testimonials
  let isDown = false;
  let startX;
  let scrollLeft;
  let currentTranslate = 0;

  if (testimonialTrack) {
    testimonialTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - testimonialTrack.offsetLeft;
      scrollLeft = testimonialTrack.scrollLeft;
      testimonialTrack.style.cursor = 'grabbing';
      testimonialTrack.style.userSelect = 'none';
    });

    testimonialTrack.addEventListener('mouseleave', () => {
      isDown = false;
      testimonialTrack.style.cursor = 'grab';
      testimonialTrack.style.userSelect = 'auto';
    });

    testimonialTrack.addEventListener('mouseup', () => {
      isDown = false;
      testimonialTrack.style.cursor = 'grab';
      testimonialTrack.style.userSelect = 'auto';
    });

    testimonialTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - testimonialTrack.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      testimonialTrack.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    testimonialTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - testimonialTrack.offsetLeft;
      testimonialTrack.style.userSelect = 'none';
    });

    testimonialTrack.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - testimonialTrack.offsetLeft;
      const walk = (x - startX) * 2;
      testimonialTrack.scrollLeft = testimonialTrack.scrollLeft - walk;
    });

    testimonialTrack.addEventListener('touchend', () => {
      testimonialTrack.style.userSelect = 'auto';
    });

    // Update current testimonial based on scroll position
    testimonialTrack.addEventListener('scroll', () => {
      const slideWidth = testimonialTrack.children[0]?.offsetWidth || 0;
      const scrollPosition = testimonialTrack.scrollLeft;
      const newIndex = Math.round(scrollPosition / slideWidth);
      
      if (newIndex >= 0 && newIndex < totalTestimonials) {
        currentTestimonial = newIndex;
        updateTestimonialCarousel();
      }
    });
  }

  // Coverage Checker functionality
  const coverageForm = document.getElementById('coverageForm');
  const coverageResult = document.getElementById('coverage-result');
  
  if (coverageForm) {
    coverageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulate coverage check
      const formData = new FormData(coverageForm);
      const address = formData.get('street') + ', ' + formData.get('area');
      
      // List of covered areas
      const coveredAreas = [
        'Riebeek Kasteel', 'Malmesbury', 'Gouda', 'Riebeek West',
        'Hermon', 'Abbotsdale', 'Chatsworth', 'Westbank'
      ];
      
      // Check if address contains any covered area
      const isCovered = coveredAreas.some(area => 
        address.toLowerCase().includes(area.toLowerCase())
      );
      
      if (isCovered) {
        coverageResult.classList.remove('hidden');
        coverageResult.classList.remove('bg-red-50', 'border-red-200');
        coverageResult.classList.add('bg-green-50', 'border-green-200');
        
        coverageResult.innerHTML = `
          <div class="flex items-center">
            <i class="fa-solid fa-check-circle text-green-600 text-2xl mr-3"></i>
            <div>
              <h4 class="font-bold text-green-800">Great news! We cover your area.</h4>
              <p class="text-green-700">Contact us to get connected with high-speed internet.</p>
            </div>
          </div>
        `;
      } else {
        coverageResult.classList.remove('hidden');
        coverageResult.classList.remove('bg-green-50', 'border-green-200');
        coverageResult.classList.add('bg-red-50', 'border-red-200');
        
        coverageResult.innerHTML = `
          <div class="flex items-center">
            <i class="fa-solid fa-times-circle text-red-600 text-2xl mr-3"></i>
            <div>
              <h4 class="font-bold text-red-800">Sorry, we don&apos;t cover your area yet.</h4>
              <p class="text-red-700">Contact us to discuss expansion possibilities.</p>
            </div>
          </div>
        `;
      }
    });
  }

  // Newsletter signup (mailto fallback for static hosting)
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterMessage = document.getElementById('newsletterMessage');

  if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();

      if (!email || !newsletterEmail.checkValidity()) {
        if (newsletterMessage) {
          newsletterMessage.textContent = 'Please enter a valid email address.';
          newsletterMessage.classList.remove('text-green-400');
          newsletterMessage.classList.add('text-red-400');
        }
        newsletterEmail.focus();
        return;
      }

      if (newsletterMessage) {
        newsletterMessage.textContent = 'Thanks! Opening your email app to confirm signup.';
        newsletterMessage.classList.remove('text-red-400');
        newsletterMessage.classList.add('text-green-400');
      }

      const subject = encodeURIComponent('Mailing List Signup');
      const body = encodeURIComponent('Please add this email to the Riebeek Valley Computers mailing list:\n\n' + email);
      window.location.href = 'mailto:info@valley-computers.co.za?subject=' + subject + '&body=' + body;
      newsletterForm.reset();
    });
  }

  // Tilt.js init for service cards
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
    });
  }

  // ── Hero Interactivity ──

  // 1. Mouse-tracking glow that follows cursor inside hero
  const heroSection = document.getElementById('hero');
  const heroGlow = document.getElementById('heroGlow');
  const heroOrbs = document.querySelectorAll('.hero-orb');

  if (heroSection && heroGlow) {
    heroSection.addEventListener('mouseenter', () => {
      heroGlow.style.opacity = '1';
    });
    heroSection.addEventListener('mouseleave', () => {
      heroGlow.style.opacity = '0';
    });

    let heroRAF = false;
    heroSection.addEventListener('mousemove', (e) => {
      if (heroRAF) return;
      heroRAF = true;
      requestAnimationFrame(() => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        heroGlow.style.transform = `translate3d(${x - 300}px,${y - 300}px,0)`;

        if (document.body.classList.contains('cursor-lite')) {
          heroRAF = false;
          return;
        }

        const cx = (x / rect.width - 0.5) * 2;
        const cy = (y / rect.height - 0.5) * 2;
        heroOrbs.forEach(orb => {
          const speed = parseFloat(orb.dataset.speed) || 0.02;
          const ox = cx * speed * rect.width;
          const oy = cy * speed * rect.height;
          orb.style.transform = `translate3d(${ox}px,${oy}px,0)`;
        });
        heroRAF = false;
      });
    }, {passive: true});
  }

  // 2. Typing text effect
  const heroTyped = document.getElementById('heroTyped');
  if (heroTyped) {
    const phrases = ['Networks', 'Connections', 'Solutions', 'Infrastructure', 'Experiences'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeHero() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        heroTyped.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        heroTyped.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 120;
      }

      if (!isDeleting && charIndex === current.length) {
        typingSpeed = 2000; // pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 400; // pause before next word
      }

      setTimeout(typeHero, typingSpeed);
    }

    // Start typing after a short delay
    setTimeout(typeHero, 800);
  }

  // 3. Tilt effect on stat badges
  document.querySelectorAll('.hero-stat-badge').forEach(badge => {
    badge.addEventListener('mousemove', (e) => {
      const rect = badge.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      badge.style.transform = 'translateY(-2px) perspective(600px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg)';
    });
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = '';
    });
  });

  // ── WhatsApp Chat Widget ──
  const waChatBtn = document.getElementById('waChatBtn');
  const waChatPopup = document.getElementById('waChatPopup');
  const waChatClose = document.getElementById('waChatClose');
  const waChatBadge = document.getElementById('waChatBadge');
  const waChatInput = document.getElementById('waChatInput');
  const waChatSend = document.getElementById('waChatSend');
  const waChatTime = document.getElementById('waChatTime');

  if (waChatTime) {
    const now = new Date();
    waChatTime.textContent = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }

  // Hide badge until button is revealed
  if (waChatBadge) waChatBadge.style.display = 'none';

  if (waChatBtn && waChatPopup) {
    waChatBtn.addEventListener('click', () => {
      waChatBtn.classList.add('is-visible');
      const isOpen = waChatPopup.classList.toggle('is-open');
      if (isOpen && waChatBadge) {
        waChatBadge.style.display = 'none';
      }
    });

    if (waChatClose) {
      waChatClose.addEventListener('click', () => {
        waChatPopup.classList.remove('is-open');
      });
    }

    // Send custom message via WhatsApp
    function sendWaMessage() {
      const msg = waChatInput ? waChatInput.value.trim() : '';
      if (msg) {
        const encoded = encodeURIComponent(msg);
        window.open('https://wa.me/27799381260?text=' + encoded, '_blank');
        waChatInput.value = '';
      }
    }

    if (waChatSend) waChatSend.addEventListener('click', sendWaMessage);
    if (waChatInput) {
      waChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendWaMessage();
      });
    }

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#waChatWidget')) {
        waChatPopup.classList.remove('is-open');
      }
    });

    // Track if user has manually opened the chat
    let userOpenedChat = false;
    waChatBtn.addEventListener('click', () => { userOpenedChat = true; });

    // Show button immediately; auto-open after 2 minutes if user has not engaged yet
    waChatBtn.classList.add('is-visible');
    if (waChatBadge) waChatBadge.style.display = 'flex';

    setTimeout(() => {
      if (!userOpenedChat && !waChatPopup.classList.contains('is-open')) {
        waChatBtn.classList.add('is-visible');
        waChatPopup.classList.add('is-open');
        if (waChatBadge) waChatBadge.style.display = 'none';
      }
    }, 120000);
  }

  // ── Back to Top Button ──
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    let bttTicking = false;
    window.addEventListener('scroll', () => {
      if (!bttTicking) {
        bttTicking = true;
        requestAnimationFrame(() => {
          if (window.scrollY > 400) {
            backToTop.classList.remove('opacity-0', 'invisible', 'translate-y-10');
            backToTop.classList.add('opacity-100', 'visible', 'translate-y-0');
          } else {
            backToTop.classList.add('opacity-0', 'invisible', 'translate-y-10');
            backToTop.classList.remove('opacity-100', 'visible', 'translate-y-0');
          }
          bttTicking = false;
        });
      }
    }, {passive: true});
  }

  if (loader) {
    const jokes = [
      'Warming up the WiFi gremlins…',
      'Untangling the ethernet spaghetti…',
      'Convincing the computer to behave…',
      'Polishing pixels and sharpening bits…',
      'Checking if it\'s plugged in (again)…',
      'Deploying tiny internet hamsters…',
      'Teaching the modem new tricks…',
      'Bribing the firewall with cookies…',
      'Downloading more RAM (just kidding)…',
      'Asking the cloud for directions…',
      'Reticulating network splines…',
      'Negotiating with the DNS gods…',
      'Feeding the server hamsters…',
      'Converting caffeine to code…',
      'Rebooting the internet (hold tight)…',
      'Counting packets… 1, 2, skip a few…',
      'Waking up the backup generator…',
      'Convincing electrons to move faster…',
      'Updating the flux capacitor…',
      'Defragmenting the cloud…',
      'Pinging the mothership…',
      'Calibrating the bandwidth thrusters…',
      'Spinning up the fibre optics…',
      'Whispering sweet nothings to the router…',
      'Loading awesomeness at 99% uptime…',
    ];

    const picked = jokes[Math.floor(Math.random() * jokes.length)];
    if (loaderSub) {
      loaderSub.textContent = picked;
    }

    const minDuration = 3000;
    const elapsed = performance.now() - loaderStart;
    const remaining = Math.max(0, minDuration - elapsed);
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('loader-lock');
      setTimeout(() => {
        loader.remove();
      }, 500);
    }, remaining);
  }

  // Mark internal link clicks so the loader is skipped on navigation
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
      sessionStorage.setItem('internalNav', '1');
    }
  });
});


