// ── Game Selector ──
// 50% chance a game appears at the end of the homepage.
// If a game appears, 50/50 chance it's the Network Repair or Packet Rush game.
(function () {
  const networkGame = document.getElementById('networkGame');
  const packetGame = document.getElementById('packet-game');

  if (!networkGame && !packetGame) return;

  // 50% chance any game shows at all
  const showGame = Math.random() < 0.5;
  
  if (!showGame) {
    if (networkGame) networkGame.style.display = 'none';
    if (packetGame) packetGame.style.display = 'none';
    return;
  }

  // Pick which game to show (50/50)
  const showNetworkGame = Math.random() < 0.5;
  let chosenGame;
  
  if (showNetworkGame && networkGame) {
    chosenGame = networkGame;
    if (packetGame) packetGame.style.display = 'none';
  } else if (packetGame) {
    chosenGame = packetGame;
    if (networkGame) networkGame.style.display = 'none';
  } else if (networkGame) {
    // Fallback if packet game doesn't exist
    chosenGame = networkGame;
  }

  if (chosenGame) {
    chosenGame.style.display = '';

    // Insert congratulatory easter egg banner before the game section
    const banner = document.createElement('div');
    banner.className = 'easter-egg-banner';
    banner.innerHTML = `
      <div style="
        max-width: 700px;
        margin: 0 auto;
        padding: 24px 32px;
        background: linear-gradient(135deg, rgba(234,88,12,0.12) 0%, rgba(251,146,60,0.08) 100%);
        border: 1px solid rgba(234,88,12,0.25);
        border-radius: 16px;
        text-align: center;
        backdrop-filter: blur(8px);
      ">
        <div style="font-size: 32px; margin-bottom: 8px;">🎉🕹️🎉</div>
        <h3 style="
          font-size: 20px;
          font-weight: 800;
          color: #fb923c;
          margin: 0 0 6px 0;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        ">Easter Egg Unlocked!</h3>
        <p style="
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          margin: 0;
          font-family: 'Outfit', sans-serif;
          line-height: 1.5;
        ">You scrolled all the way down — not many do! Here's a hidden mini-game just for you. Think you can beat it?</p>
      </div>
    `;
    banner.style.cssText = 'padding: 32px 24px 0; position: relative; z-index: 10;';
    const gameContent = chosenGame.querySelector('.relative.z-10') || chosenGame.querySelector('.max-w-4xl') || chosenGame.firstElementChild;
    if (gameContent) {
      chosenGame.insertBefore(banner, gameContent);
    } else {
      chosenGame.prepend(banner);
    }
  }
})();
