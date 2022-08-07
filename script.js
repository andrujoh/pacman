const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
  static width = 40;
  static height = 40;

  constructor({ position }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {}
}

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 10;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const boundaries = [];
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

const map = [
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", "-", " ", "-", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
];

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(new Boundary({ position: { x: Boundary.width * j, y: Boundary.height * i } }));
        break;
      case " ":
        // boundaries.push(new Boundary({ position: { x: 0, y: 0 } }));
        break;
      default:
        break;
    }
  });
});

function handleAllowedPath(velocity, targetAxis) {
  boundaries.every(boundary => {
    if (playerCollidesWithBoundary({ player: { ...player, velocity }, boundary })) {
      player.velocity[targetAxis] = 0;
      return false;
    } else {
      player.velocity[targetAxis] = velocity[targetAxis];
      return true;
    }
  });
}

function handleKeyPresses() {
  if (keys.w.pressed && lastKey === "w") {
    handleAllowedPath({ x: 0, y: -5 }, "y");
  } else if (keys.a.pressed && lastKey === "a") {
    handleAllowedPath({ x: -5, y: 0 }, "x");
  } else if (keys.s.pressed && lastKey === "s") {
    handleAllowedPath({ x: 0, y: 5 }, "y");
  } else if (keys.d.pressed && lastKey === "d") {
    handleAllowedPath({ x: 5, y: 0 }, "x");
  }
}

function handlePlayerBoundaries(boundary) {
  if (playerCollidesWithBoundary({ player, boundary })) {
    player.velocity.y = 0;
    player.velocity.x = 0;
  }
}

function playerCollidesWithBoundary({ player, boundary }) {
  return (
    player.position.y - player.radius + player.velocity.y <= boundary.position.y + boundary.height &&
    player.position.x + player.radius + player.velocity.x >= boundary.position.x &&
    player.position.y + player.radius + player.velocity.y >= boundary.position.y &&
    player.position.x - player.radius + player.velocity.x <= boundary.position.x + boundary.width
  );
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  handleKeyPresses();

  boundaries.forEach(boundary => {
    boundary.draw();
    handlePlayerBoundaries(boundary);
  });
  player.update();
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
