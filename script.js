const canvas = document.getElementById('canvas_1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'white';
ctx.strokeStyle = 'white';

let is_paused = false;
let is_colored = false;

document.addEventListener("keydown", (e) => {
  if (e.isComposing || e.code == "KeyC") {
    is_colored = !is_colored;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handle_particles(ctx, false);
  }
  if (e.isComposing || e.code == "KeyP") {
    is_paused = !is_paused;
    requestAnimationFrame(animate);
  }
  if (e.isComposing || e.code == "KeyF") {
    canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }
})

document.addEventListener("resize", function(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})

class Particle {
  constructor(effect) {
    this.effect = effect; 
    this.radius = 1;
    this.velocity_weight = 4;
    this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2); 
    this.vx = (Math.random() * this.velocity_weight) - (this.velocity_weight / 2);
    this.vy = (Math.random() * this.velocity_weight) - (this.velocity_weight / 2);
    this.connections = 0;
    this.hue = 0;
  }
  draw(context, max_connections) {
    this.hue = (this.connections / max_connections) * 360;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill(); 
  }
  update() {
    this.x += this.vx;
    if (this.x > this.effect.width - this.radius || this.x < 0 + this.radius) this.vx *= -1;
    this.y += this.vy;
    if (this.y > this.effect.height - this.radius || this.y < 0 + this.radius) this.vy *= -1;
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas; 
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.number_of_particles = 200; 
    this.create_particles();
  }
  create_particles() {
    for (let i = 0; i < this.number_of_particles; i++) {
      this.particles.push(new Particle(this)) 
    }
  }
  handle_particles(context, is_moving) {
    let max_connections = 0;
    this.particles.forEach(particle => {
      particle.connections = 0;
      if (is_moving) {
        particle.update();
      }
    })
    this.connect_particles(context);
    this.particles.forEach(particle => {
      max_connections = Math.max(max_connections, particle.connections);
    })
    this.particles.forEach(particle => {
      particle.draw(context, max_connections);
    })
  }
  connect_particles(context) {
    const max_distance = 200;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < max_distance) {
          this.particles[a].connections++;
          this.particles[b].connections++;
          const opacity = 1 - (distance / max_distance);
          context.globalAlpha = opacity;
          if (is_colored) {
            context.strokeStyle = 'hsl(' + this.particles[a].hue + ', 100%, 50%)';
          } else {
            context.strokeStyle = 'white'
          }
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.stroke();
        }
      } 
    }
  }
}

const effect = new Effect(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handle_particles(ctx, true);
  if (!is_paused) {
    requestAnimationFrame(animate);
  }
}
animate();
