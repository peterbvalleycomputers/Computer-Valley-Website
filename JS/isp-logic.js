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
  const supportsCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsCustomCursor) {
    document.body.classList.add('custom-cursor-enabled');
  } else {
    document.body.classList.remove('custom-cursor-enabled');
    const touchCursor = document.getElementById("cursor");
    if (touchCursor) touchCursor.remove();
  }

  // Morphing Cursor Implementation (same as homepage)
  const cursor = document.getElementById("cursor");
  const customCursorEnabled = document.body.classList.contains('custom-cursor-enabled');
  if (!customCursorEnabled) {
    if (cursor) cursor.remove();
  } else {
  const amount = 12;
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

    draw(delta) {
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
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    lastFrame = performance.now();
    buildDots();
    requestAnimationFrame(render);
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

    // Update cursor color based on section
    updateCursorColor(event);
  };

  const onTouchMove = event => {
    mousePosition.x = event.touches[0].clientX - width / 2;
    mousePosition.y = event.touches[0].clientY - width / 2;
    resetIdleTimer();
  };

  const render = timestamp => {
    const delta = timestamp - lastFrame;
    positionCursor(delta);
    lastFrame = timestamp;
    requestAnimationFrame(render);
  };

  const positionCursor = delta => {
    let x = mousePosition.x;
    let y = mousePosition.y;
    dots.forEach((dot, index, dots) => {
      let nextDot = dots[index + 1] || dots[0];
      dot.x = x;
      dot.y = y;
      dot.draw(delta);
      if (!idle || index <= sineDots) {
        const dx = (nextDot.x - dot.x) * 0.35;
        const dy = (nextDot.y - dot.y) * 0.35;
        x += dx;
        y += dy;
      }
    });
  };

  // Cursor color change based on section
  function updateCursorColor(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const elementBelow = document.elementFromPoint(mouseX, mouseY);
    const orangeSection = elementBelow?.closest('.orange-section');

    const navBar = document.getElementById('mainNav');
    const isOverNav = elementBelow?.closest('#mainNav') || navBar?.contains(elementBelow);
    const isNavScrolled = navBar?.classList.contains('nav-scrolled');

    if (isOverNav && !isNavScrolled) {
      document.body.classList.add('cursor-on-orange');
    } else if (isOverNav && isNavScrolled) {
      document.body.classList.remove('cursor-on-orange');
    } else if (orangeSection) {
      document.body.classList.add('cursor-on-orange');
    } else {
      document.body.classList.remove('cursor-on-orange');
    }
  }

  init();
  }

  // Site is permanently dark themed.
  document.body.classList.add('dark-theme');

  // Scroll listener
  window.addEventListener("scroll", () => {
    if (!nav) return;
    if (window.scrollY > 50) {
      nav.classList.add("nav-scrolled");
    } else {
      nav.classList.remove("nav-scrolled");
    }
  });

  AOS.init({
    duration: 900,
    once: true,
    easing: "ease-out-cubic",
  });

  function closeMobileMenuDetails() {
    document.querySelectorAll("#mobileMenu details[open]").forEach((detailsEl) => {
      detailsEl.removeAttribute("open");
    });
  }

  function setMobileMenuOpen(open) {
    const mobileMenu = document.getElementById("mobileMenu");
    const menuIcon = document.getElementById("menuIcon");
    const menuToggle = document.getElementById("menuToggle");
    if (!mobileMenu || !menuIcon) return;

    if (open) {
      mobileMenu.classList.remove("translate-x-full");
      document.body.classList.add("menu-open");
      menuIcon.classList.remove("fa-bars");
      menuIcon.classList.add("fa-xmark");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    } else {
      mobileMenu.classList.add("translate-x-full");
      document.body.classList.remove("menu-open");
      menuIcon.classList.remove("fa-xmark");
      menuIcon.classList.add("fa-bars");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      closeMobileMenuDetails();
    }
  }

  // Mobile menu toggle function (exposed globally for inline onclick)
  window.toggleMobileMenu = function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (!mobileMenu) return;
    const isOpen = !mobileMenu.classList.contains("translate-x-full");
    setMobileMenuOpen(!isOpen);
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll("#mobileMenu a").forEach(link => {
    link.addEventListener("click", () => {
      setMobileMenuOpen(false);
    });
  });

  window.addEventListener("resize", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    if (window.innerWidth >= 1024 && mobileMenu && !mobileMenu.classList.contains("translate-x-full")) {
      setMobileMenuOpen(false);
    }
  });

  // Hover effect
  document.querySelectorAll("a, button, .cursor-pointer").forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  // ── ISP Hero Interactivity ──

  // 1. Mouse-tracking glow + parallax orbs
  const ispHero = document.getElementById('isp-hero');
  const ispGlow = document.getElementById('ispHeroGlow');
  const ispOrbs = document.querySelectorAll('.isp-hero-orb');

  if (ispHero && ispGlow) {
    ispHero.addEventListener('mouseenter', () => {
      ispGlow.style.opacity = '1';
    });
    ispHero.addEventListener('mouseleave', () => {
      ispGlow.style.opacity = '0';
    });
    ispHero.addEventListener('mousemove', (e) => {
      const rect = ispHero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ispGlow.style.left = (x - 300) + 'px';
      ispGlow.style.top = (y - 300) + 'px';

      const cx = (x / rect.width - 0.5) * 2;
      const cy = (y / rect.height - 0.5) * 2;
      ispOrbs.forEach(orb => {
        const speed = parseFloat(orb.dataset.speed) || 0.02;
        const ox = cx * speed * rect.width;
        const oy = cy * speed * rect.height;
        orb.style.transform = 'translate(' + ox + 'px, ' + oy + 'px)';
      });
    });
  }

  // 2. Animated speed counter (counts up to 10, loops through speeds)
  const speedCounter = document.getElementById('ispSpeedCounter');
  if (speedCounter) {
    const speeds = [2, 4, 6, 8, 10];
    let speedIdx = 0;

    function animateSpeed() {
      const target = speeds[speedIdx];
      const duration = 1200;
      const startTime = performance.now();
      const startVal = 0;

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startVal + (target - startVal) * eased);
        speedCounter.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setTimeout(() => {
            speedIdx = (speedIdx + 1) % speeds.length;
            animateSpeed();
          }, 2000);
        }
      }
      requestAnimationFrame(tick);
    }

    setTimeout(animateSpeed, 600);
  }

  // 3. Tilt on coverage badges
  document.querySelectorAll('.isp-coverage-badge').forEach(badge => {
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

  // 4. VanillaTilt on feature cards
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.isp-feature-card'), {
      max: 5,
      speed: 400,
      glare: true,
      'max-glare': 0.1,
    });
  }

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

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#waChatWidget')) {
        waChatPopup.classList.remove('is-open');
      }
    });

    // Show button immediately; auto-open popup after 2 minutes if still unopened
    waChatBtn.classList.add('is-visible');
    if (waChatBadge) waChatBadge.style.display = 'flex';

    setTimeout(() => {
      if (!waChatPopup.classList.contains('is-open')) {
        waChatPopup.classList.add('is-open');
        if (waChatBadge) waChatBadge.style.display = 'none';
      }
    }, 120000);
  }

  // ── Back to Top Button ──
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.remove('opacity-0', 'invisible', 'translate-y-10');
        backToTop.classList.add('opacity-100', 'visible', 'translate-y-0');
      } else {
        backToTop.classList.add('opacity-0', 'invisible', 'translate-y-10');
        backToTop.classList.remove('opacity-100', 'visible', 'translate-y-0');
      }
    });
  }

  if (loader) {
    const jokes = [
      'Negotiating with the router…',
      'Shouting at the modem politely…',
      'Finding the missing 1% uptime…',
      'Aligning satellites (wink)…',
      'Asking fibre to go faster…',
      'Counting packets. All of them.',
      'Waking up the bandwidth fairy…',
      'Polishing the ethernet cables…',
      'Convincing packets to stay in line…',
      'Reticulating network splines…',
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

