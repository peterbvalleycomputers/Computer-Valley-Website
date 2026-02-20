// ── Network Repair Mini-Game ──
// Hover over broken (red) nodes to repair them before time runs out.
// Pure mouse-driven — no clicks needed.

(function () {
  // Polyfill for roundRect (older browsers)
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (typeof r === 'number') r = [r, r, r, r];
      const [tl, tr, br, bl] = r;
      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + tr);
      this.lineTo(x + w, y + h - br);
      this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      this.lineTo(x + bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - bl);
      this.lineTo(x, y + tl);
      this.quadraticCurveTo(x, y, x + tl, y);
      this.closePath();
      return this;
    };
  }

  const GAME_DURATION = 30;       // seconds
  const NODE_COUNT = 12;
  const REPAIR_TIME = 0.6;        // seconds hovering to repair a node
  const SPAWN_INTERVAL = 3500;    // ms between new break events
  const NODE_RADIUS = 18;
  const CONNECTION_ALPHA = 0.15;

  let canvas, ctx, gameSection;
  let nodes = [];
  let connections = [];
  let mouseX = 0, mouseY = 0;
  let gameActive = false;
  let gameStarted = false;
  let timeLeft = GAME_DURATION;
  let score = 0;
  let totalRepaired = 0;
  let totalBroken = 0;
  let spawnTimer = null;
  let countdownTimer = null;
  let animFrame = null;
  let highScore = parseInt(localStorage.getItem('vc_network_highscore') || '0', 10);
  let particles = [];
  let confetti = [];
  let canvasRect = null;
  let showWhatsApp = false;
  let waButtonRect = null;
  let canRetry = false;
  const WA_NUMBER = '27799381260';

  // Node states
  const STATE_OK = 'ok';
  const STATE_BROKEN = 'broken';
  const STATE_REPAIRING = 'repairing';

  class Node {
    constructor(x, y, id) {
      this.x = x;
      this.y = y;
      this.id = id;
      this.state = STATE_OK;
      this.repairProgress = 0;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.label = this.getLabel();
    }

    getLabel() {
      const labels = ['PC', 'SRV', 'AP', 'SW', 'RT', 'FW', 'NAS', 'VM', 'DB', 'DNS', 'VPN', 'IOT', 'CAM', 'PRT'];
      return labels[this.id % labels.length];
    }

    breakNode() {
      if (this.state === STATE_OK) {
        this.state = STATE_BROKEN;
        this.repairProgress = 0;
        totalBroken++;
      }
    }

    update(dt, mx, my) {
      this.pulsePhase += dt * 2;
      const dist = Math.hypot(mx - this.x, my - this.y);

      if (this.state === STATE_BROKEN || this.state === STATE_REPAIRING) {
        if (dist < NODE_RADIUS * 2.5) {
          this.state = STATE_REPAIRING;
          this.repairProgress += dt / REPAIR_TIME;
          if (this.repairProgress >= 1) {
            this.state = STATE_OK;
            this.repairProgress = 0;
            score += 100;
            totalRepaired++;
            spawnParticles(this.x, this.y, '#22c55e');
          }
        } else if (this.state === STATE_REPAIRING) {
          this.repairProgress = Math.max(0, this.repairProgress - dt * 0.5);
          if (this.repairProgress <= 0) {
            this.state = STATE_BROKEN;
          }
        }
      }
    }

    draw(ctx) {
      const pulse = Math.sin(this.pulsePhase) * 0.15 + 1;

      // Glow
      if (this.state === STATE_BROKEN) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, NODE_RADIUS * 2, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(this.x, this.y, NODE_RADIUS * 0.5, this.x, this.y, NODE_RADIUS * 2);
        glow.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, NODE_RADIUS * pulse, 0, Math.PI * 2);

      if (this.state === STATE_OK) {
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
      } else if (this.state === STATE_BROKEN) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, this.x, this.y);

      // Repair progress ring
      if (this.state === STATE_REPAIRING && this.repairProgress > 0) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, NODE_RADIUS + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.repairProgress);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.lineCap = 'butt';
      }
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.vx = (Math.random() - 0.5) * 120;
      this.vy = (Math.random() - 0.5) * 120;
      this.life = 1;
      this.decay = 1.5 + Math.random();
      this.size = 2 + Math.random() * 3;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= this.decay * dt;
      this.vx *= 0.98;
      this.vy *= 0.98;
    }

    draw(ctx) {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Confetti particle
  class Confetti {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const colors = ['#ea580c', '#fb923c', '#22c55e', '#f59e0b', '#ffffff', '#ef4444', '#fbbf24'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.vx = (Math.random() - 0.5) * 300;
      this.vy = -150 - Math.random() * 250;
      this.gravity = 200 + Math.random() * 100;
      this.life = 2 + Math.random() * 2;
      this.decay = 0.3 + Math.random() * 0.2;
      this.w = 4 + Math.random() * 6;
      this.h = 3 + Math.random() * 4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 10;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 2 + Math.random() * 3;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this.vx *= 0.99;
      this.life -= this.decay * dt;
      this.rotation += this.rotSpeed * dt;
      this.wobble += this.wobbleSpeed * dt;
      this.x += Math.sin(this.wobble) * 0.5;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.life));
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }

  function spawnConfetti() {
    const w = canvas.width;
    const h = canvas.height;
    for (let i = 0; i < 80; i++) {
      confetti.push(new Confetti(w * Math.random(), h * 0.4 * Math.random()));
    }
    // Second burst slightly delayed
    setTimeout(() => {
      for (let i = 0; i < 50; i++) {
        confetti.push(new Confetti(w * Math.random(), h * 0.3 * Math.random()));
      }
    }, 400);
  }

  function spawnParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function initNodes() {
    nodes = [];
    connections = [];
    particles = [];
    const w = canvas.width;
    const h = canvas.height;
    const padding = 50;

    // Place nodes in a network-like layout
    for (let i = 0; i < NODE_COUNT; i++) {
      let x, y, valid;
      let attempts = 0;
      do {
        x = padding + Math.random() * (w - padding * 2);
        y = padding + Math.random() * (h - padding * 2);
        valid = true;
        for (const n of nodes) {
          if (Math.hypot(n.x - x, n.y - y) < 70) {
            valid = false;
            break;
          }
        }
        attempts++;
      } while (!valid && attempts < 100);

      nodes.push(new Node(x, y, i));
    }

    // Create connections (each node connects to 2-3 nearest)
    for (let i = 0; i < nodes.length; i++) {
      const sorted = [...nodes]
        .filter((_, j) => j !== i)
        .sort((a, b) => {
          const da = Math.hypot(a.x - nodes[i].x, a.y - nodes[i].y);
          const db = Math.hypot(b.x - nodes[i].x, b.y - nodes[i].y);
          return da - db;
        });

      const connectCount = 2 + Math.floor(Math.random() * 2);
      for (let c = 0; c < connectCount && c < sorted.length; c++) {
        const j = sorted[c].id;
        const exists = connections.some(
          conn => (conn[0] === i && conn[1] === j) || (conn[0] === j && conn[1] === i)
        );
        if (!exists) {
          connections.push([i, j]);
        }
      }
    }
  }

  function breakRandomNode() {
    if (!gameActive) return;
    const okNodes = nodes.filter(n => n.state === STATE_OK);
    if (okNodes.length > 0) {
      const target = okNodes[Math.floor(Math.random() * okNodes.length)];
      target.breakNode();
      spawnParticles(target.x, target.y, '#ef4444');
    }
  }

  function drawConnections(ctx) {
    for (const [i, j] of connections) {
      const a = nodes[i];
      const b = nodes[j];

      const bothOk = a.state === STATE_OK && b.state === STATE_OK;
      const anyBroken = a.state === STATE_BROKEN || b.state === STATE_BROKEN;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);

      if (anyBroken) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.setLineDash([4, 6]);
      } else if (bothOk) {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.setLineDash([3, 5]);
      }

      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawDataPackets(ctx, time) {
    for (const [i, j] of connections) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.state !== STATE_OK || b.state !== STATE_OK) continue;

      const speed = 0.3;
      const t = ((time * speed + i * 0.2 + j * 0.15) % 1);
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;

      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.fill();
    }
  }

  function drawHUD(ctx) {
    const w = canvas.width;

    // Time bar
    const barW = 200;
    const barH = 8;
    const barX = (w - barW) / 2;
    const barY = 16;
    const pct = Math.max(0, timeLeft / GAME_DURATION);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    let barColor;
    if (pct > 0.5) barColor = '#22c55e';
    else if (pct > 0.25) barColor = '#f59e0b';
    else barColor = '#ef4444';

    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * pct, barH, 4);
    ctx.fill();

    // Time text
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.ceil(timeLeft) + 's', w / 2, barY + barH + 16);

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 16, 28);

    // Network status
    const brokenCount = nodes.filter(n => n.state !== STATE_OK).length;
    const healthPct = Math.round(((NODE_COUNT - brokenCount) / NODE_COUNT) * 100);
    ctx.textAlign = 'right';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = healthPct === 100 ? '#22c55e' : healthPct > 60 ? '#f59e0b' : '#ef4444';
    ctx.fillText('Network: ' + healthPct + '%', w - 16, 28);
  }

  function drawStartScreen(ctx) {
    const w = canvas.width;
    const h = canvas.height;

    // Draw background network
    drawConnections(ctx);
    for (const node of nodes) node.draw(ctx);

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#ea580c';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NETWORK REPAIR', w / 2, h / 2 - 60);

    // Instructions
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('Nodes will randomly break.', w / 2, h / 2 - 16);
    ctx.fillText('Hover to repair them!', w / 2, h / 2 + 4);
    ctx.fillText('Survive ' + GAME_DURATION + ' seconds.', w / 2, h / 2 + 24);

    if (highScore > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('High Score: ' + highScore, w / 2, h / 2 + 52);
    }

    // Start prompt
    ctx.fillStyle = '#22c55e';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('[ MOVE MOUSE TO START ]', w / 2, h / 2 + 86);
  }

  function drawEndScreen(ctx) {
    const w = canvas.width;
    const h = canvas.height;

    // Draw background network
    drawConnections(ctx);
    for (const node of nodes) node.draw(ctx);

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, w, h);

    const isNewHigh = score > highScore;

    // Title
    ctx.fillStyle = '#ea580c';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NETWORK SECURED', w / 2, h / 2 - 60);

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('Score: ' + score, w / 2, h / 2 - 20);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('Repaired: ' + totalRepaired + '/' + totalBroken, w / 2, h / 2 + 8);

    if (isNewHigh) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('NEW HIGH SCORE!', w / 2, h / 2 + 38);
      highScore = score;
      localStorage.setItem('vc_network_highscore', String(highScore));
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('Best: ' + highScore, w / 2, h / 2 + 38);
    }

    // WhatsApp brag button
    const btnText = 'TELL US ON WHATSAPP!';
    ctx.font = '7px "Press Start 2P", monospace';
    const btnW = ctx.measureText(btnText).width + 32;
    const btnH = 28;
    const btnX = w / 2 - btnW / 2;
    const btnY = h / 2 + 52;

    // Button background
    ctx.fillStyle = '#25D366';
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 6);
    ctx.fill();

    // Button text
    ctx.fillStyle = '#fff';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(btnText, w / 2, btnY + btnH / 2 + 3);

    // Store button rect for click detection
    waButtonRect = { x: btnX, y: btnY, w: btnW, h: btnH };

    // Restart prompt below
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('[ MOVE MOUSE TO RETRY ]', w / 2, h / 2 + 100);
  }

  let lastTime = 0;
  let gameTime = 0;

  function gameLoop(timestamp) {
    if (!canvas) return;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
      drawStartScreen(ctx);
      animFrame = requestAnimationFrame(gameLoop);
      return;
    }

    if (gameActive) {
      gameTime += dt;
      timeLeft -= dt;

      if (timeLeft <= 0) {
        timeLeft = 0;
        gameActive = false;
        clearInterval(spawnTimer);
        spawnConfetti();
        showWhatsApp = true;
        canRetry = false;
        setTimeout(() => { canRetry = true; }, 3000);
      }

      // Update nodes
      for (const node of nodes) {
        node.update(dt, mouseX, mouseY);
      }

      // Bonus points for keeping network healthy
      const brokenCount = nodes.filter(n => n.state !== STATE_OK).length;
      if (brokenCount === 0) {
        score += Math.round(dt * 10); // bonus for full health
      }
    }

    // Update particles
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) p.update(dt);

    // Update confetti
    confetti = confetti.filter(c => c.life > 0);
    for (const c of confetti) c.update(dt);

    // Draw
    drawConnections(ctx);
    if (gameActive) drawDataPackets(ctx, gameTime);
    for (const node of nodes) node.draw(ctx);
    for (const p of particles) p.draw(ctx);

    // Draw confetti on top
    for (const c of confetti) c.draw(ctx);

    if (gameActive) {
      drawHUD(ctx);

      // Cursor proximity indicator
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, NODE_RADIUS * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (gameStarted) {
      drawEndScreen(ctx);
    }

    animFrame = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    score = 0;
    totalRepaired = 0;
    totalBroken = 0;
    timeLeft = GAME_DURATION;
    gameActive = true;
    gameStarted = true;
    gameTime = 0;
    confetti = [];
    showWhatsApp = false;
    waButtonRect = null;

    resizeCanvas();
    initNodes();

    // Break 2 nodes immediately
    setTimeout(() => breakRandomNode(), 500);
    setTimeout(() => breakRandomNode(), 1200);

    // Keep breaking nodes periodically
    clearInterval(spawnTimer);
    spawnTimer = setInterval(() => {
      breakRandomNode();
      // Increase difficulty over time
      if (timeLeft < GAME_DURATION * 0.5) {
        setTimeout(breakRandomNode, 800);
      }
      if (timeLeft < GAME_DURATION * 0.25) {
        setTimeout(breakRandomNode, 1500);
      }
    }, SPAWN_INTERVAL);
  }

  function resizeCanvas() {
    if (!canvas || !gameSection) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvasRect = canvas.getBoundingClientRect();
  }

  function init() {
    gameSection = document.getElementById('networkGame');
    if (!gameSection) return;

    // Visibility is controlled by the game-selector script
    if (gameSection.style.display === 'none') return;

    canvas = document.getElementById('networkGameCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();
    initNodes();

    // Mouse tracking — also triggers start/restart via movement
    canvas.addEventListener('mousemove', (e) => {
      canvasRect = canvas.getBoundingClientRect();
      mouseX = e.clientX - canvasRect.left;
      mouseY = e.clientY - canvasRect.top;

      // Auto-start on first mouse movement over canvas
      if (!gameStarted && !gameActive) {
        startGame();
      }
      // Auto-restart on mouse movement after game ends (with delay)
      if (gameStarted && !gameActive && canRetry) {
        canRetry = false;
        startGame();
      }
    }, { passive: true });

    // Click only for WhatsApp button
    canvas.addEventListener('click', (e) => {
      if (showWhatsApp && waButtonRect) {
        canvasRect = canvas.getBoundingClientRect();
        const cx = e.clientX - canvasRect.left;
        const cy = e.clientY - canvasRect.top;
        if (cx >= waButtonRect.x && cx <= waButtonRect.x + waButtonRect.w &&
            cy >= waButtonRect.y && cy <= waButtonRect.y + waButtonRect.h) {
          const msg = encodeURIComponent('🎮 I just scored ' + score + ' points in the Network Repair game on your website! ' + (score > highScore ? 'New high score! 🏆' : '') + ' 🔧');
          window.open('https://wa.me/' + WA_NUMBER + '?text=' + msg, '_blank');
          return;
        }
      }
    });

    // Resize handling
    window.addEventListener('resize', () => {
      resizeCanvas();
      if (!gameActive && !gameStarted) initNodes();
    }, { passive: true });

    // Only run game loop when section is visible
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          lastTime = performance.now();
          if (!animFrame) animFrame = requestAnimationFrame(gameLoop);
        } else {
          if (animFrame) {
            cancelAnimationFrame(animFrame);
            animFrame = null;
          }
        }
      }
    }, { threshold: 0.1 });

    observer.observe(gameSection);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
