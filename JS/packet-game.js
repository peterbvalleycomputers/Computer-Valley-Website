// ── Packet Rush Mini-Game ──
(function () {
  const canvas = document.getElementById('packetGameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // UI elements
  const overlay = document.getElementById('gameOverlay');
  const startScreen = document.getElementById('gameStartScreen');
  const overScreen = document.getElementById('gameOverScreen');
  const hud = document.getElementById('gameHUD');
  const scoreEl = document.getElementById('gameScore');
  const speedEl = document.getElementById('gameSpeed');
  const finalScoreEl = document.getElementById('gameFinalScore');
  const bestScoreEl = document.getElementById('gameBestScore');
  const highScoreDisplay = document.getElementById('gameHighScoreDisplay');
  const playCountEl = document.getElementById('gamePlayCount');
  const startBtn = document.getElementById('gameStartBtn');
  const retryBtn = document.getElementById('gameRetryBtn');

  // Check if all required elements exist
  if (!overlay || !startScreen || !overScreen || !hud || !scoreEl || !speedEl || 
      !finalScoreEl || !bestScoreEl || !startBtn || !retryBtn) {
    console.warn('Packet Rush: Missing required DOM elements');
    return;
  }

  // WhatsApp number
  const WA_NUMBER = '27799381260';

  // Game constants
  const W = 600;
  const H = 400;
  const PLAYER_SIZE = 18;
  const PARTICLE_COUNT = 30;

  // Game state
  let running = false;
  let animFrame = null;
  let score = 0;
  let speedMultiplier = 1;
  let bestScore = parseInt(localStorage.getItem('packetBest') || '0', 10);
  let playCount = parseInt(localStorage.getItem('packetPlays') || '0', 10);
  let player = { x: 80, y: H / 2, vy: 0, trail: [] };
  let obstacles = [];
  let boosts = [];
  let particles = [];
  let bgStars = [];
  let frameCount = 0;
  let shakeAmount = 0;
  let keys = {};

  // Init display
  if (highScoreDisplay) highScoreDisplay.textContent = bestScore;
  if (playCountEl) playCountEl.textContent = playCount;

  // Generate background stars
  function initStars() {
    bgStars = [];
    for (let i = 0; i < 60; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  function resetGame() {
    score = 0;
    speedMultiplier = 1;
    frameCount = 0;
    shakeAmount = 0;
    player = { x: 80, y: H / 2, vy: 0, trail: [] };
    obstacles = [];
    boosts = [];
    particles = [];
    keys = {};
    initStars();
  }

  function startGame() {
    resetGame();
    running = true;
    overlay.style.display = 'none';
    hud.style.opacity = '1';
    gameLoop();
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(animFrame);
    hud.style.opacity = '0';

    // Update scores
    const isNewHigh = score > bestScore;
    if (isNewHigh) {
      bestScore = score;
      localStorage.setItem('packetBest', bestScore);
    }
    playCount++;
    localStorage.setItem('packetPlays', playCount);

    finalScoreEl.textContent = score;
    bestScoreEl.textContent = bestScore;
    if (highScoreDisplay) highScoreDisplay.textContent = bestScore;
    if (playCountEl) playCountEl.textContent = playCount;

    // Add WhatsApp button if new high score
    if (isNewHigh && score > 0) {
      // Remove existing WhatsApp button if any
      const existingWA = overScreen.querySelector('.whatsapp-share-btn');
      if (existingWA) existingWA.remove();

      const waBtn = document.createElement('button');
      waBtn.className = 'whatsapp-share-btn bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2.5 rounded-lg font-bold hover:scale-105 transition-all duration-200 shadow-lg shadow-green-600/30 flex items-center gap-2 mx-auto mt-4';
      waBtn.innerHTML = '<i class="fa-brands fa-whatsapp text-lg"></i>Share High Score!';
      waBtn.onclick = () => {
        const msg = encodeURIComponent(`🎮 I just scored ${score} points in Packet Rush on the Valley Computers website! Can you beat that? 🚀`);
        window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
      };
      
      // Insert after retry button
      const retryBtnContainer = retryBtn.parentElement;
      retryBtnContainer.appendChild(waBtn);
    }

    startScreen.classList.add('hidden');
    overScreen.classList.remove('hidden');
    overlay.style.display = 'flex';
  }

  // Spawn obstacle
  function spawnObstacle() {
    const gapSize = 120 - speedMultiplier * 8;
    const gap = Math.max(gapSize, 70);
    const gapY = Math.random() * (H - gap - 60) + 30;
    obstacles.push({
      x: W + 20,
      gapY: gapY,
      gapH: gap,
      w: 28,
      passed: false
    });
  }

  // Spawn speed boost
  function spawnBoost() {
    boosts.push({
      x: W + 10,
      y: Math.random() * (H - 40) + 20,
      size: 12,
      pulse: 0
    });
  }

  // Spawn particles
  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        decay: Math.random() * 0.03 + 0.02,
        size: Math.random() * 4 + 2,
        color: color
      });
    }
  }

  // Collision check
  function checkCollision() {
    const px = player.x;
    const py = player.y;
    const ps = PLAYER_SIZE / 2;

    for (let obs of obstacles) {
      if (px + ps > obs.x && px - ps < obs.x + obs.w) {
        if (py - ps < obs.gapY || py + ps > obs.gapY + obs.gapH) {
          return true;
        }
      }
    }

    // Wall collision
    if (py - ps < 0 || py + ps > H) return true;

    return false;
  }

  // Check boost collection
  function checkBoosts() {
    const px = player.x;
    const py = player.y;

    boosts = boosts.filter(b => {
      const dist = Math.hypot(px - b.x, py - b.y);
      if (dist < PLAYER_SIZE / 2 + b.size) {
        speedMultiplier = Math.min(speedMultiplier + 0.3, 3);
        spawnParticles(b.x, b.y, '#facc15', 8);
        shakeAmount = 3;
        return false;
      }
      return true;
    });
  }

  // Update
  function update() {
    frameCount++;
    score = Math.floor(frameCount / 3);

    // Player movement
    const moveSpeed = 5;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      player.vy = -moveSpeed;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      player.vy = moveSpeed;
    } else {
      player.vy *= 0.85;
    }

    player.y += player.vy;

    // Trail
    player.trail.push({ x: player.x, y: player.y, alpha: 1 });
    if (player.trail.length > 15) player.trail.shift();

    // Spawn obstacles
    const spawnRate = Math.max(60 - Math.floor(speedMultiplier * 10), 30);
    if (frameCount % spawnRate === 0) spawnObstacle();

    // Spawn boosts
    if (frameCount % 180 === 0) spawnBoost();

    // Move obstacles
    const baseSpeed = 3 * speedMultiplier;
    obstacles.forEach(obs => {
      obs.x -= baseSpeed;
      if (!obs.passed && obs.x + obs.w < player.x) {
        obs.passed = true;
      }
    });
    obstacles = obstacles.filter(o => o.x + o.w > -10);

    // Move boosts
    boosts.forEach(b => {
      b.x -= baseSpeed;
      b.pulse += 0.1;
    });
    boosts = boosts.filter(b => b.x > -20);

    // Update particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.vx *= 0.96;
      p.vy *= 0.96;
    });
    particles = particles.filter(p => p.life > 0);

    // Update stars
    bgStars.forEach(s => {
      s.x -= s.speed * speedMultiplier;
      if (s.x < 0) {
        s.x = W;
        s.y = Math.random() * H;
      }
    });

    // Speed decay
    if (speedMultiplier > 1) {
      speedMultiplier = Math.max(1, speedMultiplier - 0.002);
    }

    // Shake decay
    if (shakeAmount > 0) shakeAmount *= 0.9;

    // Check collisions
    checkBoosts();
    if (checkCollision()) {
      spawnParticles(player.x, player.y, '#ef4444', 20);
      shakeAmount = 8;
      endGame();
      return;
    }

    // Update HUD
    scoreEl.textContent = score;
    speedEl.textContent = speedMultiplier.toFixed(1) + 'x';
  }

  // Draw
  function draw() {
    ctx.save();

    // Screen shake
    if (shakeAmount > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * shakeAmount,
        (Math.random() - 0.5) * shakeAmount
      );
    }

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    bgStars.forEach(s => {
      ctx.fillStyle = `rgba(234, 88, 12, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.04)';
    ctx.lineWidth = 1;
    for (let x = (frameCount * 2 * speedMultiplier) % 50; x < W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(W - x, 0);
      ctx.lineTo(W - x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Player trail
    player.trail.forEach((t, i) => {
      const alpha = (i / player.trail.length) * 0.4;
      const size = (i / player.trail.length) * PLAYER_SIZE * 0.6;
      ctx.fillStyle = `rgba(234, 88, 12, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player (data packet — glowing circle)
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 15;
    const playerGrad = ctx.createRadialGradient(
      player.x, player.y, 0,
      player.x, player.y, PLAYER_SIZE / 2
    );
    playerGrad.addColorStop(0, '#fb923c');
    playerGrad.addColorStop(0.6, '#ea580c');
    playerGrad.addColorStop(1, 'rgba(234, 88, 12, 0.3)');
    ctx.fillStyle = playerGrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(player.x - 2, player.y - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Obstacles (firewalls)
    obstacles.forEach(obs => {
      // Top wall
      const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.w, 0);
      topGrad.addColorStop(0, '#dc2626');
      topGrad.addColorStop(0.5, '#ef4444');
      topGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = topGrad;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      roundRect(ctx, obs.x, 0, obs.w, obs.gapY, 4);
      ctx.fill();

      // Bottom wall
      ctx.fillStyle = topGrad;
      roundRect(ctx, obs.x, obs.gapY + obs.gapH, obs.w, H - obs.gapY - obs.gapH, 4);
      ctx.fill();

      // Danger glow lines
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      for (let ly = 0; ly < obs.gapY; ly += 12) {
        ctx.beginPath();
        ctx.moveTo(obs.x + 4, ly);
        ctx.lineTo(obs.x + obs.w - 4, ly);
        ctx.stroke();
      }
      for (let ly = obs.gapY + obs.gapH; ly < H; ly += 12) {
        ctx.beginPath();
        ctx.moveTo(obs.x + 4, ly);
        ctx.lineTo(obs.x + obs.w - 4, ly);
        ctx.stroke();
      }
    });

    ctx.shadowBlur = 0;

    // Boosts (speed pickups)
    boosts.forEach(b => {
      const pulseSize = Math.sin(b.pulse) * 3;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size + pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Bolt icon (simple)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', b.x, b.y);
    });

    // Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Score watermark
    ctx.fillStyle = 'rgba(234, 88, 12, 0.05)';
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score, W / 2, H / 2);

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function gameLoop() {
    if (!running) return;
    update();
    draw();
    animFrame = requestAnimationFrame(gameLoop);
  }

  // Draw idle screen
  function drawIdle() {
    initStars();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    bgStars.forEach(s => {
      ctx.fillStyle = `rgba(234, 88, 12, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  drawIdle();

  // Controls
  document.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
      e.preventDefault();
      keys[e.key] = true;
    }
  });

  document.addEventListener('keyup', e => {
    keys[e.key] = false;
  });

  // Touch controls — tap top half = up, bottom half = down
  let touchY = null;
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleY = H / rect.height;
    touchY = (e.touches[0].clientY - rect.top) * scaleY;

    if (touchY < H / 2) {
      keys['ArrowUp'] = true;
      keys['ArrowDown'] = false;
    } else {
      keys['ArrowDown'] = true;
      keys['ArrowUp'] = false;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleY = H / rect.height;
    touchY = (e.touches[0].clientY - rect.top) * scaleY;

    if (touchY < H / 2) {
      keys['ArrowUp'] = true;
      keys['ArrowDown'] = false;
    } else {
      keys['ArrowDown'] = true;
      keys['ArrowUp'] = false;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;
  });

  // Buttons
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);

  // Space to start/retry
  document.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (!running && overlay.style.display !== 'none') {
        e.preventDefault();
        startGame();
      }
    }
  });
})();
