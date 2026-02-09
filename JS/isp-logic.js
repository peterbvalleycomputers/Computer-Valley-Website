 // Wait until the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav");

  // Morphing Cursor Implementation (same as homepage)
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

  function applyThemeFromStorage() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  applyThemeFromStorage();

  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      applyThemeFromStorage();
    }
  });

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

  // Hover effect
  document.querySelectorAll("a, button, .cursor-pointer").forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });
});