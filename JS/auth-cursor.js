document.addEventListener("DOMContentLoaded", () => {
  const supportsCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cursor = document.getElementById("cursor");

  if (!supportsCustomCursor) {
    document.body.classList.add("no-custom-cursor");
    if (cursor) {
      cursor.remove();
    }
    return;
  }

  document.body.classList.add("custom-cursor-enabled");
  if (!cursor) {
    return;
  }

  const amount = 12;
  const sineDots = Math.floor(amount * 0.3);
  const width = 26;
  const idleTimeout = 150;
  let mousePosition = { x: 0, y: 0 };
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
      this.range = width / 2 - (width / 2) * this.scale + 2;
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
        return;
      }

      this.angleX += this.anglespeed;
      this.angleY += this.anglespeed;
      this.y = this.lockY + Math.sin(this.angleY) * this.range;
      this.x = this.lockX + Math.sin(this.angleX) * this.range;
      this.element.style.transform = `translate3d(${this.x}px,${this.y}px,0) scale(${this.scale})`;
    }
  }

  function startIdleTimer() {
    timeoutID = setTimeout(() => {
      idle = true;
      for (const dot of dots) {
        dot.lock();
      }
    }, idleTimeout);
    idle = false;
  }

  function resetIdleTimer() {
    clearTimeout(timeoutID);
    startIdleTimer();
  }

  function buildDots() {
    for (let i = 0; i < amount; i += 1) {
      dots.push(new Dot(i));
    }
  }

  function positionCursor() {
    let x = mousePosition.x;
    let y = mousePosition.y;

    for (let i = 0; i < dots.length; i += 1) {
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
  }

  function render() {
    positionCursor();
    requestAnimationFrame(render);
  }

  window.addEventListener(
    "mousemove",
    (event) => {
      mousePosition.x = event.clientX - width / 2;
      mousePosition.y = event.clientY - width / 2;
      resetIdleTimer();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      mousePosition.x = event.touches[0].clientX - width / 2;
      mousePosition.y = event.touches[0].clientY - width / 2;
      resetIdleTimer();
    },
    { passive: true }
  );

  buildDots();
  startIdleTimer();
  render();
});
