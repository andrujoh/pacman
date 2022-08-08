const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#scoreEl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
  static width = 40;
  static height = 40;

  constructor({ position, image }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
    this.image = image;
  }
  draw() {
    // ctx.fillStyle = "blue";
    // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }
  update() {}
}

class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }
}

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.radians = 0.75;
    this.openRate = 0.12;
    this.rotation = 0;
  }
  draw() {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.translate(-this.position.x, -this.position.y);

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians);
    ctx.lineTo(this.position.x, this.position.y);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate;
    this.radians += this.openRate;
  }
}

class Ghost {
  static speed = 2;

  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.previousCollisions = [];
    this.speed = Ghost.speed;
    this.scared = false;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.scared ? "blue" : this.color;
    ctx.fill();
    ctx.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class PowerUp {
  constructor({ position }) {
    this.position = position;
    this.radius = 8;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }
}

const powerups = [];
const pellets = [];
const boundaries = [];
const ghosts = [
  new Ghost({
    position: { x: Boundary.width * 6 + Boundary.width * 0.5, y: Boundary.height + Boundary.height * 0.5 },
    velocity: { x: Ghost.speed, y: 0 },
  }),
  new Ghost({
    position: { x: Boundary.width * 6 + Boundary.width * 0.5, y: Boundary.height * 3 + Boundary.height * 0.5 },
    velocity: { x: Ghost.speed, y: 0 },
    color: "pink",
  }),
];

const player = new Player({
  position: { x: Boundary.width + Boundary.width * 0.5, y: Boundary.height + Boundary.height * 0.5 },
  velocity: {
    x: 0,
    y: 0,
  },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastKey = "";
let score = 0;
let playerHasWon = false;

const map = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", "p", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];

function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function createBoundary(j, i, imageName) {
  return new Boundary({
    position: { x: Boundary.width * j, y: Boundary.height * i },
    image: createImage(`./assets/${imageName}.png`),
  });
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(createBoundary(j, i, "pipeHorizontal"));
        break;
      case "|":
        boundaries.push(createBoundary(j, i, "pipeVertical"));
        break;
      case "1":
        boundaries.push(createBoundary(j, i, "pipeCorner1"));
        break;
      case "2":
        boundaries.push(createBoundary(j, i, "pipeCorner2"));
        break;
      case "3":
        boundaries.push(createBoundary(j, i, "pipeCorner3"));
        break;
      case "4":
        boundaries.push(createBoundary(j, i, "pipeCorner4"));
        break;
      case "b":
        boundaries.push(createBoundary(j, i, "block"));
        break;
      case "[":
        boundaries.push(createBoundary(j, i, "capLeft"));
        break;
      case "]":
        boundaries.push(createBoundary(j, i, "capRight"));
        break;
      case "_":
        boundaries.push(createBoundary(j, i, "capBottom"));
        break;
      case "^":
        boundaries.push(createBoundary(j, i, "capTop"));
        break;
      case "5":
        boundaries.push(createBoundary(j, i, "pipeConnectorTop"));
        break;
      case "6":
        boundaries.push(createBoundary(j, i, "pipeConnectorRight"));
        break;
      case "7":
        boundaries.push(createBoundary(j, i, "pipeConnectorBottom"));
        break;
      case "8":
        boundaries.push(createBoundary(j, i, "pipeConnectorLeft"));
        break;
      case ".":
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width * 0.5,
              y: i * Boundary.height + Boundary.height * 0.5,
            },
          })
        );
        break;
      case "p":
        powerups.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width * 0.5,
              y: i * Boundary.height + Boundary.height * 0.5,
            },
          })
        );
        break;
    }
  });
});

function handleAllowedPath(velocity, targetAxis) {
  boundaries.every(boundary => {
    if (playerCollidesWithBoundary({ sprite: { ...player, velocity }, boundary })) {
      player.velocity[targetAxis] = 0;
      return false;
    } else {
      player.velocity[targetAxis] = velocity[targetAxis];
      return true;
    }
  });
}

const globalSpeed = 2;

function handleKeyPresses() {
  if (keys.w.pressed && lastKey === "w") {
    handleAllowedPath({ x: 0, y: -globalSpeed }, "y");
  } else if (keys.a.pressed && lastKey === "a") {
    handleAllowedPath({ x: -globalSpeed, y: 0 }, "x");
  } else if (keys.s.pressed && lastKey === "s") {
    handleAllowedPath({ x: 0, y: globalSpeed }, "y");
  } else if (keys.d.pressed && lastKey === "d") {
    handleAllowedPath({ x: globalSpeed, y: 0 }, "x");
  }
}

function handlePlayerBoundaries(boundary) {
  if (playerCollidesWithBoundary({ sprite: player, boundary })) {
    player.velocity.y = 0;
    player.velocity.x = 0;
  }
}

function playerCollidesWithBoundary({ sprite, boundary }) {
  const padding = Boundary.width / 2 - sprite.radius - 1;
  return (
    sprite.position.y - sprite.radius + sprite.velocity.y <= boundary.position.y + boundary.height + padding &&
    sprite.position.x + sprite.radius + sprite.velocity.x >= boundary.position.x - padding &&
    sprite.position.y + sprite.radius + sprite.velocity.y >= boundary.position.y - padding &&
    sprite.position.x - sprite.radius + sprite.velocity.x <= boundary.position.x + boundary.width + padding
  );
}
let animationId;
function animate() {
  // const animationFrameId = requestAnimationFrame(animate);
  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  handleKeyPresses();

  // detect collisions between ghosts and player

  for (let i = ghosts.length - 1; 0 <= i; i--) {
    const ghost = ghosts[i];
    if (
      Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y) <
      ghost.radius + player.radius
    ) {
      if (ghost.scared) {
        ghosts.splice(i, 1);
        score += 50;
        scoreEl.innerHTML = `Score: ${score}`;
      } else {
        cancelAnimationFrame(animationId);
        scoreEl.innerHTML = "You died! Your score is " + score;
      }
    }
  }

  // powerups go here
  for (let i = powerups.length - 1; 0 <= i; i--) {
    const powerUp = powerups[i];
    powerUp.draw();
    // player collides with powerup
    if (
      Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y) <
      powerUp.radius + player.radius
    ) {
      powerups.splice(i, 1);

      // make scores scared
      ghosts.forEach(ghost => {
        ghost.scared = true;
        setTimeout(() => {
          ghost.scared = false;
        }, 5000);
      });
    }
  }

  // touch pellets here
  for (let i = pellets.length - 1; 0 <= i; i--) {
    const pellet = pellets[i];
    pellet.draw();
    if (
      Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) <
      pellet.radius + player.radius
    ) {
      pellets.splice(i, 1);
      score += 10;
      scoreEl.innerHTML = `Score: ${score}`;
    }
  }

  boundaries.forEach(boundary => {
    boundary.draw();
    handlePlayerBoundaries(boundary);
  });

  player.update();
  ghosts.forEach(ghost => {
    ghost.update();

    const collisions = [];
    boundaries.forEach(boundary => {
      if (
        !collisions.includes("right") &&
        playerCollidesWithBoundary({ sprite: { ...ghost, velocity: { x: ghost.speed, y: 0 } }, boundary })
      ) {
        collisions.push("right");
      }
      if (
        !collisions.includes("left") &&
        playerCollidesWithBoundary({ sprite: { ...ghost, velocity: { x: -ghost.speed, y: 0 } }, boundary })
      ) {
        collisions.push("left");
      }
      if (
        !collisions.includes("up") &&
        playerCollidesWithBoundary({ sprite: { ...ghost, velocity: { x: 0, y: -ghost.speed } }, boundary })
      ) {
        collisions.push("up");
      }
      if (
        !collisions.includes("down") &&
        playerCollidesWithBoundary({ sprite: { ...ghost, velocity: { x: 0, y: ghost.speed } }, boundary })
      ) {
        collisions.push("down");
      }
    });
    if (collisions.length > ghost.previousCollisions.length) {
      ghost.previousCollisions = collisions;
    }
    if (JSON.stringify(collisions) !== JSON.stringify(ghost.previousCollisions)) {
      if (ghost.velocity.x > 0) ghost.previousCollisions.push("right");
      else if (ghost.velocity.x < 0) ghost.previousCollisions.push("left");
      else if (ghost.velocity.y < 0) ghost.previousCollisions.push("up");
      else if (ghost.velocity.y > 0) ghost.previousCollisions.push("down");
      const pathways = ghost.previousCollisions.filter(collision => !collisions.includes(collision));

      const direction = pathways[Math.floor(Math.random() * pathways.length)];

      switch (direction) {
        case "down":
          ghost.velocity.y = ghost.speed;
          ghost.velocity.x = 0;
          break;
        case "up":
          ghost.velocity.y = -ghost.speed;
          ghost.velocity.x = 0;
          break;
        case "right":
          ghost.velocity.y = 0;
          ghost.velocity.x = ghost.speed;
          break;
        case "left":
          ghost.velocity.y = 0;
          ghost.velocity.x = -ghost.speed;
          break;
      }
      ghost.previousCollisions = [];
    }
  });

  // Rotate player
  if (player.velocity.x > 0) player.rotation = 0;
  else if (player.velocity.x < 0) player.rotation = Math.PI;
  else if (player.velocity.y > 0) player.rotation = Math.PI * 0.5;
  else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5;

  // Win game
  if (pellets.length === 0) {
    cancelAnimationFrame(animationId);

    scoreEl.innerHTML = "You won! Your score is " + score;
  }
}
animate();

window.addEventListener("keydown", e => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
    case " ":
      player.velocity.x = 0;
      player.velocity.y = 0;
    default:
      break;
  }
});

window.addEventListener("keyup", e => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case " ":
      player.velocity.x = 0;
      player.velocity.y = 0;
    default:
      break;
  }
});
