// Wait until the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav");

  // Scroll listener
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) { // adjust offset if needed
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

  // Morphing Cursor Implementation
  const cursor = document.getElementById("cursor");
  const amount = 20;
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
      gsap.set(this.element, {scale: this.scale});
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
        gsap.set(this.element, {x: this.x, y: this.y});
      } else {
        this.angleX += this.anglespeed;
        this.angleY += this.anglespeed;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        gsap.set(this.element, {x: this.x, y: this.y});
      }
    }
  }

  function init() {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    lastFrame += new Date();
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
    
    // Check if cursor is over orange section
    const elementBelow = document.elementFromPoint(mouseX, mouseY);
    const orangeSection = elementBelow?.closest('.orange-section');
    
    // Special handling for navigation bar
    const navBar = document.getElementById('mainNav');
    const isOverNav = elementBelow?.closest('#mainNav') || navBar?.contains(elementBelow);
    const isNavScrolled = navBar?.classList.contains('nav-scrolled');
    
    if (isOverNav && !isNavScrolled) {
      // Navigation is transparent/has orange top bar
      document.body.classList.add('cursor-on-orange');
    } else if (isOverNav && isNavScrolled) {
      // Navigation is white (scrolled)
      document.body.classList.remove('cursor-on-orange');
    } else if (orangeSection) {
      // Other orange sections
      document.body.classList.add('cursor-on-orange');
    } else {
      // White sections
      document.body.classList.remove('cursor-on-orange');
    }
  }

  init();

  // Dark Theme Toggle Functionality
  const darkModeToggle = document.getElementById('darkModeToggle');
  const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
  const themeIcon = document.getElementById('themeIcon');
  const themeIconMobile = document.getElementById('themeIconMobile');
  const body = document.body;

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  if (currentTheme === 'dark') {
    body.classList.add('dark-theme');
    updateThemeIcons(true);
  }

  function toggleDarkMode() {
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
  }

  function updateThemeIcons(isDark) {
    if (themeIcon) {
      themeIcon.className = isDark ? 'fa-solid fa-sun text-white' : 'fa-solid fa-moon text-slate-700';
    }
    if (themeIconMobile) {
      themeIconMobile.className = isDark ? 'fa-solid fa-sun text-white' : 'fa-solid fa-moon text-orange-400';
    }
  }

  // Add event listeners for both desktop and mobile toggles
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  if (darkModeToggleMobile) {
    darkModeToggleMobile.addEventListener('click', toggleDarkMode);
  }

  // Mobile menu toggle function
  function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    const menuIcon = document.getElementById("menuIcon");
    
    mobileMenu.classList.toggle("-translate-x-full");
    document.body.classList.toggle("menu-open");
    
    // Toggle menu icon
    if (mobileMenu.classList.contains("-translate-x-full")) {
      menuIcon.classList.remove("fa-times");
      menuIcon.classList.add("fa-bars");
    } else {
      menuIcon.classList.remove("fa-bars");
      menuIcon.classList.add("fa-times");
    }
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll("#mobileMenu a").forEach(link => {
    link.addEventListener("click", () => {
      const mobileMenu = document.getElementById("mobileMenu");
      mobileMenu.classList.add("-translate-x-full");
      document.body.classList.remove("menu-open");
      const menuIcon = document.getElementById("menuIcon");
      menuIcon.classList.remove("fa-times");
      menuIcon.classList.add("fa-bars");
    });
  });

  // Counter animation
  const counters = document.querySelectorAll('.counter');
  const speed = 200;

  const animateCounter = (counter) => {
    const target = +counter.getAttribute('data-target');
    const increment = target / speed;
    
    const updateCount = () => {
      const count = +counter.innerText;
      
      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 1);
      } else {
        counter.innerText = target;
      }
    };
    
    updateCount();
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

  // Testimonial Carousel functionality
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial-slide');
  const totalTestimonials = testimonials.length;
  const testimonialTrack = document.getElementById('testimonialTrack');

  function updateTestimonialCarousel() {
    if (testimonialTrack) {
      // Hide all testimonials first
      testimonials.forEach(testimonial => {
        testimonial.style.display = 'none';
        testimonial.classList.remove('active');
      });
      
      // Show current pair of testimonials
      for (let i = 0; i < 2 && (currentTestimonial + i) < totalTestimonials; i++) {
        const testimonial = testimonials[currentTestimonial + i];
        if (testimonial) {
          testimonial.style.display = 'block';
          testimonial.classList.add('active');
        }
      }
      
      // Update dots - calculate which pair we're showing
      const currentPair = Math.floor(currentTestimonial / 2);
      const dots = document.querySelectorAll('.testimonial-carousel .flex.justify-center button');
      dots.forEach((dot, index) => {
        if (index === currentPair) {
          dot.classList.remove('bg-white/50');
          dot.classList.add('bg-white');
        } else {
          dot.classList.remove('bg-white');
          dot.classList.add('bg-white/50');
        }
      });
    }
  }

  function nextTestimonial() {
    // Move to next pair (2 testimonials at a time)
    const maxPairs = Math.ceil(totalTestimonials / 2);
    currentTestimonial = (currentTestimonial + 2) % totalTestimonials;
    updateTestimonialCarousel();
  }

  function previousTestimonial() {
    // Move to previous pair (2 testimonials at a time)
    currentTestimonial = (currentTestimonial - 2 + totalTestimonials) % totalTestimonials;
    updateTestimonialCarousel();
  }

  function goToTestimonial(startIndex) {
    // Go to specific testimonial (will show it and the next one)
    currentTestimonial = startIndex;
    updateTestimonialCarousel();
  }

  // Auto-rotate testimonials
  setInterval(nextTestimonial, 5000);

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
  const coverageForm = document.querySelector('form');
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

  // Tilt.js init for service cards
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
    });
  }
});
