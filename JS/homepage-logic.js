
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

    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";

      requestAnimationFrame(animateRing);
    }

    animateRing();

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

    document.addEventListener("mousemove", updateCursorColor);

    // Hover effect
    document.querySelectorAll("a, button, .cursor-pointer").forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });

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
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuToggle) {
      menuToggle.addEventListener("click", toggleMobileMenu);
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll("#mobileMenu a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("-translate-x-full");
        document.body.classList.remove("menu-open");
        const menuIcon = document.getElementById("menuIcon");
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");
      });
    });

    // Navbar scroll effect
    const mainNav = document.getElementById("mainNav");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        mainNav.classList.add("nav-scrolled");
      } else {
        mainNav.classList.remove("nav-scrolled");
      }
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

    // Testimonials scroll function
    function scrollTestimonials(direction) {
      const container = document.querySelector('.grid.md\\:grid-cols-3');
      if (container) {
        const scrollAmount = 320;
        if (direction === 'left') {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
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
