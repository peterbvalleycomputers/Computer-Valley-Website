// ── Hero Network Grid Background ──
// Draws an animated network of nodes and connections behind the hero section.
// Purely decorative, very subtle, GPU-friendly.

(function () {
  let canvas, ctx, heroSection;
  let nodes = [];
  let animFrame = null;
  let w = 0, h = 0;

  const NODE_COUNT = 35;
  const MAX_DIST = 180;
  const NODE_SPEED = 0.15;

  class NetNode {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * NODE_SPEED;
      this.vy = (Math.random() - 0.5) * NODE_SPEED;
      this.radius = 1.5 + Math.random() * 1.5;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.015;

      // Wrap around edges
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;
    }
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(new NetNode());
    }
  }

  function resize() {
    if (!canvas || !heroSection) return;
    w = heroSection.offsetWidth;
    h = heroSection.offsetHeight;
    canvas.width = w;
    canvas.height = h;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(234, 88, 12, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const glow = Math.sin(node.pulse) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(234, 88, 12, ${0.25 * glow})`;
      ctx.fill();
    }
  }

  function loop() {
    for (const node of nodes) node.update();
    draw();
    animFrame = requestAnimationFrame(loop);
  }

  function init() {
    heroSection = document.getElementById('hero');
    canvas = document.getElementById('heroNetworkCanvas');
    if (!canvas || !heroSection) return;

    ctx = canvas.getContext('2d');
    resize();
    initNodes();

    // Only animate when visible
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!animFrame) animFrame = requestAnimationFrame(loop);
        } else {
          if (animFrame) {
            cancelAnimationFrame(animFrame);
            animFrame = null;
          }
        }
      }
    }, { threshold: 0.05 });

    observer.observe(heroSection);

    window.addEventListener('resize', () => {
      resize();
      initNodes();
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
