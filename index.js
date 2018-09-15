const c = document.getElementById('canvas');
c.style.backgroundColor = 'lightblue';
c.width = document.body.clientWidth; //document.width is obsolete
c.height = document.body.clientHeight;
const ctx = c.getContext("2d");

const PARTICLES = {
  HYDROGEN: {
    radius: 8,
    symbol: 'H',
    color: 'blue',
    textColor: 'white'
  },
  OXYGEN: {
    radius: 15,
    symbol: 'O',
    color: 'white'
  },
  CARBON: {
    radius: 20,
    symbol: 'C',
    color: 'grey'
  }
}

const MOLECULES = {
  H2O: {
    particles: [
      PARTICLES.HYDROGEN,
      PARTICLES.OXYGEN,
      PARTICLES.HYDROGEN
    ]
  }
}

class Bullet {
  constructor(targetX,targetY) {
    const tablePosition =  { x : c.width / 2, y: c.height / 2 }
    this.vectorX = targetX - tablePosition.x;
    this.vectorY = targetY - tablePosition.y;
    this.position = {
      x: tablePosition.x + this.vectorX/5,
      y: tablePosition.y + this.vectorY/5}
  }

  move() {
    this.position.x += this.vectorX/100;
    this.position.y += this.vectorY/100;
    this.draw()
  }

  destroy() {
    bullets = bullets.filter(p => p !== this)
  }

  draw() {
    const {position} = this;
    ctx.beginPath();
    ctx.arc(position.x,position.y,2,0,2*Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'green';
    ctx.fill();
  }
}

let bullets = []

class Weapon {
  shoot(x,y) {
    const b = new Bullet(x,y);
    bullets.push(b);
  }
}

const weapon = new Weapon()

class Tower {
  constructor() {
    this.size = {x: 150, y: 60}
    this.hitBoxRadius = 90;
  }
  draw() {
    const { x,y}= this.size;
    const center = { x: c.width/ 2, y: c.height/ 2}
    const { position, hitBoxRadius} = this;
    ctx.beginPath();
    ctx.rect(center.x - x/2, center.y - y/2, x,y);
    ctx.stroke();
    ctx.fillStyle = 'silver';
    ctx.fill();
    ctx.arc(center.x,center.y,hitBoxRadius,0,2*Math.PI);
    ctx.stroke();
  }
}

const tower = new Tower()

class Particle {
  constructor({radius,symbol,position,color, textColor = 'black'}) {
    this.radius = radius;
    this.symbol = symbol;
    this.color = color;
    this.textColor = textColor;
    this.position = position || {x: 50, y: 100};
    const tablePosition =  { x : c.width / 2, y: c.height / 2 }
    this.vectorX = tablePosition.x - this.position.x;
    this.vectorY = tablePosition.y - this.position.y;
  }
  move() {
    this.position.x += this.vectorX/1000;
    this.position.y += this.vectorY/1000;
    this.draw()
  }

  draw() {
    const {radius,position,symbol,color,textColor} = this;
    ctx.beginPath();
    ctx.arc(position.x,position.y,radius,0,2*Math.PI);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.fillText(symbol,position.x -4 ,position.y + 3);
  }

  destroy() {
    particles = particles.filter(p => p !== this)
  }

  hit() {
    this.destroy();
  }
}

let particles = []

const spawnParticle = () => {
  const canvasRadius = Math.sqrt(Math.pow(c.width, 2) + Math.pow(c.height, 2)) / 2;
  const randomAngle = (Math.random() * 360);
  const x = (Math.sin(randomAngle/Math.PI) * canvasRadius) + c.width /2;
  const y = (Math.cos(randomAngle/Math.PI) * canvasRadius) + c.height /2;
  const particle = _.sample(PARTICLES)
  particles.push(new Particle({ ...particle, position: {x, y}}))
}

const spawnParticles = () => {
  spawnParticle()
  setInterval(spawnParticle, 1000)
}

const bulletsCollision = () => {
  bullets.forEach((b) => {
    const {x,y} = b.position
    // with particles
    particles.forEach((p) => {
      const collisionX = x >= p.position.x - p.radius && x <= p.position.x + p.radius
      const collisionY = y >= p.position.y - p.radius && y <= p.position.y + p.radius
      const collision = collisionX && collisionY
      if (collision) {
        p.hit(b);
        b.destroy()
      }
    })

    // with border
    const collisionX = x >= c.width || x <= 0
    const collisionY = y >= c.height || y <= 0
    const collision = collisionX || collisionY
    if (collision) {
      b.destroy()
    }
  })
}

const particlesCollisions = () => {
  particles.forEach((p) => {
    const x = c.width /2
    const y = c.height /2
    // Collision with player
    const collisionX = x >= p.position.x - tower.hitBoxRadius && x <= p.position.x + tower.hitBoxRadius
    const collisionY = y >= p.position.y - tower.hitBoxRadius && y <= p.position.y + tower.hitBoxRadius
    const collision = collisionX && collisionY
    if (collision) {
      p.destroy();
    }
  })
}

const handleCollisions = () => {
  bulletsCollision();
  particlesCollisions();
}

const updateCanvas = () => {
  ctx.clearRect(0, 0, c.width, c.height);
  tower.draw()
  particles.forEach((p) => p.move());
  bullets.forEach((b) => b.move());
  handleCollisions();
  window.requestAnimationFrame(updateCanvas);
}


const start = () => {
  window.requestAnimationFrame(updateCanvas);
  spawnParticles();
}

start();

const shoot = (e)  => {
  weapon.shoot(e.clientX, e.clientY)
}

document.addEventListener("click", shoot);