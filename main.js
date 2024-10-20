const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const tileSize = 32;
let score = 0;
let gameOver = false;
let powerUpActive = false;
let powerUpTimer = 0;
let respawnDelay = 1500;

let pacMan = {
  x: tileSize,
  y: tileSize,
  size: tileSize,
  speed: 4,
  direction: "RIGHT",
  mouthOpen: true,
  mouthAnimationFrame: 0,
};

let ghosts = [
  {
    x: 10 * tileSize,
    y: 6 * tileSize,
    size: tileSize,
    direction: "LEFT",
    color: "red",
    alive: true,
  },
  {
    x: 15 * tileSize,
    y: 10 * tileSize,
    size: tileSize,
    direction: "UP",
    color: "pink",
    alive: true,
  },
];

let initialPelletPositions = [
  { x: 4 * tileSize, y: 2 * tileSize },
  { x: 6 * tileSize, y: 8 * tileSize },
];

let pellets = initialPelletPositions.map((pos) => ({ ...pos, active: true }));

let powerUps = [
  { x: 8 * tileSize, y: 4 * tileSize, active: true }, // Fixed Power-up position
];

const pelletAnimationSpeed = 0.5;
const ghostAnimationSpeed = 0.1;
const powerUpDuration = 5000;

document.addEventListener("keydown", movePacMan);

function movePacMan(e) {
  if (gameOver) return;

  switch (e.key) {
    case "ArrowUp":
      pacMan.direction = "UP";
      break;
    case "ArrowDown":
      pacMan.direction = "DOWN";
      break;
    case "ArrowLeft":
      pacMan.direction = "LEFT";
      break;
    case "ArrowRight":
      pacMan.direction = "RIGHT";
      break;
  }
}

function resetGame() {
  score = 0;
  gameOver = false;
  powerUpActive = false;
  powerUpTimer = 0;
  pacMan.x = tileSize;
  pacMan.y = tileSize;
  pacMan.direction = "RIGHT";
  pacMan.mouthOpen = true;
  pacMan.mouthAnimationFrame = 0;

  ghosts = [
    {
      x: 10 * tileSize,
      y: 6 * tileSize,
      size: tileSize,
      direction: "LEFT",
      color: "red",
      alive: true,
    },
    {
      x: 15 * tileSize,
      y: 10 * tileSize,
      size: tileSize,
      direction: "UP",
      color: "pink",
      alive: true,
    },
  ];

  // Reset pellets and power-ups
  pellets = initialPelletPositions.map((pos) => ({ ...pos, active: true }));
  powerUps = [{ x: 8 * tileSize, y: 4 * tileSize, active: true }];
}

function update() {
  // Pac-Man mouth animation
  pacMan.mouthAnimationFrame = (pacMan.mouthAnimationFrame + 1) % 10; // Change the frame every few updates
  pacMan.mouthOpen = pacMan.mouthAnimationFrame < 5; // Open mouth for half the frames

  // Move Pac-Man
  switch (pacMan.direction) {
    case "UP":
      pacMan.y -= pacMan.speed;
      break;
    case "DOWN":
      pacMan.y += pacMan.speed;
      break;
    case "LEFT":
      pacMan.x -= pacMan.speed;
      break;
    case "RIGHT":
      pacMan.x += pacMan.speed;
      break;
  }

  // Boundaries
  if (pacMan.x < 0) pacMan.x = 0;
  if (pacMan.x > canvas.width - pacMan.size)
    pacMan.x = canvas.width - pacMan.size;
  if (pacMan.y < 0) pacMan.y = 0;
  if (pacMan.y > canvas.height - pacMan.size)
    pacMan.y = canvas.height - pacMan.size;

  // Collision with pellets
  pellets.forEach((pellet) => {
    if (pellet.active) {
      const dist = Math.hypot(pacMan.x - pellet.x, pacMan.y - pellet.y);
      if (dist < pacMan.size / 2) {
        pellet.active = false;
        score += 10;
      }
    }
  });

  // Check if all pellets are collected
  if (pellets.every((p) => !p.active)) {
    pellets = initialPelletPositions.map((pos) => ({ ...pos, active: true })); // Respawn pellets
  }

  // Collision with power-ups
  powerUps.forEach((powerUp) => {
    if (powerUp.active) {
      const dist = Math.hypot(pacMan.x - powerUp.x, pacMan.y - powerUp.y);
      if (dist < pacMan.size / 2) {
        powerUp.active = false;
        powerUpActive = true;
        powerUpTimer = Date.now();
        powerUp.x = Math.random() * (canvas.width - tileSize); // Randomize new position
        powerUp.y = Math.random() * (canvas.height - tileSize); // Randomize new position
      }
    }
  });

  // Move ghosts
  ghosts.forEach((ghost) => {
    if (ghost.alive) {
      // Move ghosts randomly
      let directionChange = Math.random() < 0.05; // 5% chance to change direction
      if (directionChange) {
        const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
        ghost.direction =
          directions[Math.floor(Math.random() * directions.length)];
      }

      switch (ghost.direction) {
        case "UP":
          ghost.y -= pacMan.speed * 1.5; // Increase speed
          break;
        case "DOWN":
          ghost.y += pacMan.speed * 1.5; // Increase speed
          break;
        case "LEFT":
          ghost.x -= pacMan.speed * 1.5; // Increase speed
          break;
        case "RIGHT":
          ghost.x += pacMan.speed * 1.5; // Increase speed
          break;
      }

      // Boundaries for ghosts
      if (ghost.x < 0) ghost.x = 0;
      if (ghost.x > canvas.width - ghost.size)
        ghost.x = canvas.width - ghost.size;
      if (ghost.y < 0) ghost.y = 0;
      if (ghost.y > canvas.height - ghost.size)
        ghost.y = canvas.height - ghost.size;

      // Collision with Pac-Man
      const dist = Math.hypot(pacMan.x - ghost.x, pacMan.y - ghost.y);
      if (dist < pacMan.size / 2) {
        if (!powerUpActive) {
          gameOver = true;
        } else {
          score += 20;
          ghost.alive = false; // Set ghost to not alive
          setTimeout(() => {
            respawnGhost(ghost);
          }, respawnDelay); // Respawn ghost after delay
        }
      }
    }
  });

  // Power-up timer management
  if (powerUpActive && Date.now() - powerUpTimer > powerUpDuration) {
    powerUpActive = false;
  }
}

function respawnGhost(ghost) {
  ghost.x = Math.random() * (canvas.width - ghost.size);
  ghost.y = Math.random() * (canvas.height - ghost.size);
  ghost.alive = true; // Set ghost to alive
}

function drawPacMan() {
  ctx.beginPath();
  ctx.arc(
    pacMan.x + pacMan.size / 2,
    pacMan.y + pacMan.size / 2,
    pacMan.size / 2,
    pacMan.mouthOpen ? 0.2 * Math.PI : 0.1 * Math.PI,
    pacMan.mouthOpen ? 1.8 * Math.PI : 1.7 * Math.PI
  );
  ctx.lineTo(pacMan.x + pacMan.size / 2, pacMan.y + pacMan.size / 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
}

function drawPellets() {
  pellets.forEach((pellet) => {
    if (pellet.active) {
      ctx.beginPath();
      ctx.arc(
        pellet.x + tileSize / 2,
        pellet.y + tileSize / 2,
        5 + Math.sin(Date.now() * pelletAnimationSpeed) * 3,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    }
  });
}

function drawPowerUps() {
  powerUps.forEach((powerUp) => {
    if (powerUp.active) {
      ctx.beginPath();
      ctx.arc(
        powerUp.x + tileSize / 2,
        powerUp.y + tileSize / 2,
        tileSize / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "blue";
      ctx.fill();
      ctx.closePath();
    }
  });
}

function drawGhosts() {
  ghosts.forEach((ghost) => {
    if (ghost.alive) {
      ctx.beginPath();
      ctx.moveTo(ghost.x + ghost.size / 2, ghost.y);
      ctx.bezierCurveTo(
        ghost.x + ghost.size,
        ghost.y + ghost.size / 2,
        ghost.x + ghost.size,
        ghost.y + ghost.size,
        ghost.x + ghost.size / 2,
        ghost.y + ghost.size
      );
      ctx.bezierCurveTo(
        ghost.x,
        ghost.y + ghost.size,
        ghost.x,
        ghost.y + ghost.size / 2,
        ghost.x + ghost.size / 2,
        ghost.y
      );
      ctx.fillStyle = ghost.color;
      ctx.fill();
      ctx.closePath();
    }
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawPowerUpTimer() {
  if (powerUpActive) {
    const timeLeft = Math.ceil(
      powerUpDuration / 1000 - (Date.now() - powerUpTimer) / 1000
    );
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Power Up Time: ${timeLeft}`, canvas.width - 150, 30);
  }
}

function drawGameOver() {
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 70, canvas.height / 2 - 10);
    ctx.fillStyle = "yellow";
    ctx.fillText("Try Again", canvas.width / 2 - 50, canvas.height / 2 + 30);
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "black");
  gradient.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener("click", (event) => {
  if (gameOver) {
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    if (
      x >= canvas.width / 2 - 100 &&
      x <= canvas.width / 2 + 100 &&
      y >= canvas.height / 2 + 30 &&
      y <= canvas.height / 2 + 70
    ) {
      resetGame();
    }
  }
});

function gameLoop() {
  drawBackground(); // Draw background before everything else
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  drawPacMan();
  drawPellets();
  drawPowerUps();
  drawGhosts();
  drawScore();
  drawPowerUpTimer();
  drawGameOver();
  requestAnimationFrame(gameLoop);
}

gameLoop();
