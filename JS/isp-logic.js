 // Wait until the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav");

  // Scroll listener
  window.addEventListener("scroll", () => {
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

  // Custom Cursor
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
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    
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
    const nav = document.getElementById('mainNav');
    const isOverNav = elementBelow?.closest('#mainNav');
    const isNavScrolled = nav.classList.contains('nav-scrolled');
    
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
});