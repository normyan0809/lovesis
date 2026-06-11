export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r?: number;
  size?: number;
  life: number;
  maxLife: number;
  isInteractive: boolean;
  hue?: number;
  color?: string;
  angle?: number;
  va?: number;
}

export interface ThemeConfig {
  particleCount: number;
  createParticle: (w: number, h: number, isInit?: boolean, px?: number, py?: number) => Particle;
  updateParticle: (p: Particle, ctx: CanvasRenderingContext2D, w: number, h: number, pointer: any) => boolean;
  drawParticle: (p: Particle, ctx: CanvasRenderingContext2D) => void;
  drawBackground: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  globalCompositeOperation?: GlobalCompositeOperation;
  spawnOnPointerMove?: number;
}

export const themes: Record<string, ThemeConfig> = {
  crimson: {
    particleCount: 60,
    spawnOnPointerMove: 3,
    drawBackground: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0a0000');
      g.addColorStop(0.5, '#2e0000');
      g.addColorStop(1, '#500000');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    globalCompositeOperation: 'screen',
    createParticle: (w, h, isInit = false, px = 0, py = 0) => ({
      x: isInit ? px + (Math.random() - 0.5) * 30 : Math.random() * w,
      y: isInit ? py + (Math.random() - 0.5) * 30 : Math.random() * h,
      vx: isInit ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 0.5,
      vy: isInit ? (Math.random() - 0.5) * 1.5 - 0.5 : (Math.random() - 0.5) * 0.5 - 0.2,
      r: isInit ? Math.random() * 20 + 5 : Math.random() * 60 + 20,
      life: isInit ? 0 : Math.random() * 100,
      maxLife: isInit ? 40 + Math.random() * 40 : 150 + Math.random() * 100,
      isInteractive: isInit,
      hue: 350 + Math.random() * 20 // Red to slight orange
    }),
    updateParticle: (p, ctx, w, h, pointer) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.isInteractive && p.life >= p.maxLife) return false;
      if (!p.isInteractive && p.y < -p.r!) p.y = h + p.r!;
      
      if (pointer.isDown && !p.isInteractive) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx += dx * 0.001;
          p.vy += dy * 0.001;
        }
      }
      p.vx *= 0.98;
      p.vy *= 0.98;
      return true;
    },
    drawParticle: (p, ctx) => {
      let alpha = 1;
      if (p.isInteractive) {
        alpha = 1 - Math.pow(p.life / p.maxLife, 2);
      } else {
        alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.5 + 0.1;
        if (p.life > p.maxLife) p.life = 0; 
      }
      if (alpha < 0) alpha = 0;
      
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r!);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha})`);
      grad.addColorStop(0.5, `hsla(${p.hue}, 100%, 50%, ${alpha * 0.5})`);
      grad.addColorStop(1, `hsla(${p.hue}, 100%, 20%, 0)`);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r!, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  sakura: {
    particleCount: 120,
    spawnOnPointerMove: 2,
    drawBackground: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1c0512');
      g.addColorStop(1, '#420b24');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    createParticle: (w, h, isInit = false, px = 0, py = 0) => ({
      x: isInit ? px + (Math.random() - 0.5) * 40 : Math.random() * w,
      y: isInit ? py + (Math.random() - 0.5) * 40 : Math.random() * h - h, // drift from top
      vx: isInit ? (Math.random() - 0.5) * 4 : 0.5 + Math.random() * 1.5,
      vy: isInit ? (Math.random() - 0.5) * 4 : 1 + Math.random() * 2,
      size: Math.random() * 8 + 6,
      angle: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.1,
      life: 0,
      maxLife: isInit ? 60 + Math.random() * 40 : 1000,
      isInteractive: isInit,
      color: `hsla(${330 + Math.random() * 20}, 90%, ${65 + Math.random() * 20}%, `
    }),
    updateParticle: (p, ctx, w, h, pointer) => {
      if (!p.isInteractive && p.y > h + 20) {
        p.y = -20;
        p.x = Math.random() * w;
      }
      if (p.isInteractive) {
        p.vy += 0.05; // gravity
        p.life++;
        if (p.life > p.maxLife) return false;
      }
  
      if (pointer.isDown) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.vx += dx * 0.003;
          p.vy += dy * 0.003;
        }
      }
      
      // Wind sine wave
      p.x += p.vx + Math.sin(Date.now() * 0.001 + p.size!) * 0.5;
      p.y += p.vy;
      p.angle! += p.va!;
      
      if (p.isInteractive) {
        p.vx *= 0.96;
      } else {
        if (p.vx > 2.5) p.vx = 2.5;
        if (p.vy > 3.5) p.vy = 3.5;
        if (p.vx < -0.5) p.vx = -0.5;
      }
      
      return true;
    },
    drawParticle: (p, ctx) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle!);
      
      let alpha = p.isInteractive ? 1 - p.life / p.maxLife : 0.8;
      ctx.fillStyle = p.color! + `${alpha})`;
      
      // draw petal shape
      const size = p.size!;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size / 2, size / 2, size / 2, size, 0, size);
      ctx.bezierCurveTo(-size / 2, size, -size / 2, size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  },
  stardust: {
    particleCount: 150,
    spawnOnPointerMove: 3,
    drawBackground: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a0a1a');
      g.addColorStop(1, '#15102a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    globalCompositeOperation: 'screen',
    createParticle: (w, h, isInit = false, px = 0, py = 0) => ({
      x: isInit ? px + (Math.random() - 0.5) * 20 : Math.random() * w,
      y: isInit ? py + (Math.random() - 0.5) * 20 : Math.random() * h,
      vx: isInit ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.3,
      vy: isInit ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.3,
      r: isInit ? Math.random() * 2 + 1 : Math.random() * 2 + 0.5,
      life: 0,
      maxLife: isInit ? 50 + Math.random() * 30 : 150 + Math.random() * 150,
      isInteractive: isInit,
      hue: 220 + Math.random() * 60 
    }),
    updateParticle: (p, ctx, w, h, pointer) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      
      if (p.isInteractive && p.life > p.maxLife) return false;
      
      if (!p.isInteractive) {
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        if (p.life > p.maxLife) p.life = 0;
      }
      
      if (pointer.isDown && !p.isInteractive) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx -= dx * 0.001; // repel
          p.vy -= dy * 0.001;
        }
      }
      p.vx *= 0.98;
      p.vy *= 0.98;
      return true;
    },
    drawParticle: (p, ctx) => {
      let alpha = p.isInteractive ? 1 - p.life / p.maxLife : Math.sin((p.life / p.maxLife) * Math.PI) * 0.6 + 0.1;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r!, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 80%, ${alpha})`;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r! * 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha * 0.15})`;
      ctx.fill();
    }
  },
  golden: {
    particleCount: 80,
    spawnOnPointerMove: 2,
    drawBackground: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a1205'); 
      g.addColorStop(1, '#3a2200'); 
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    globalCompositeOperation: 'screen',
    createParticle: (w, h, isInit = false, px = 0, py = 0) => ({
      x: isInit ? px + (Math.random() - 0.5) * 30 : Math.random() * w,
      y: isInit ? py + (Math.random() - 0.5) * 30 : Math.random() * h,
      vx: isInit ? (Math.random() - 0.5) * 1 : Math.random() * 0.5 - 0.25,
      vy: isInit ? (Math.random() - 0.5) * 1 : -Math.random() * 0.5 - 0.1,
      r: isInit ? Math.random() * 8 + 4 : Math.random() * 15 + 5,
      life: 0,
      maxLife: isInit ? 60 + Math.random() * 40 : 200 + Math.random() * 200,
      isInteractive: isInit,
      hue: 35 + Math.random() * 20
    }),
    updateParticle: (p, ctx, w, h, pointer) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      
      if (p.isInteractive && p.life > p.maxLife) return false;
      
      if (!p.isInteractive) {
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.life > p.maxLife) p.life = 0;
      }
      
      if (pointer.isDown && !p.isInteractive) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx += dx * 0.0015;
          p.vy += dy * 0.0015;
        }
      }
      if (!p.isInteractive) p.vy -= 0.0005; 
      
      p.vx *= 0.98;
      p.vy *= 0.98;
      return true;
    },
    drawParticle: (p, ctx) => {
      let alpha = p.isInteractive ? 1 - p.life / p.maxLife : Math.sin((p.life / p.maxLife) * Math.PI) * 0.6 + 0.1;
      
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r!);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, 80%, ${alpha})`);
      grad.addColorStop(0.3, `hsla(${p.hue}, 100%, 50%, ${alpha * 0.5})`);
      grad.addColorStop(1, `hsla(${p.hue}, 100%, 20%, 0)`);
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r!, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  },
  snow: {
    particleCount: 150,
    spawnOnPointerMove: 3,
    drawBackground: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a1526');
      g.addColorStop(1, '#1a2b45');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    createParticle: (w, h, isInit = false, px = 0, py = 0) => ({
      x: isInit ? px + (Math.random() - 0.5) * 40 : Math.random() * w,
      y: isInit ? py + (Math.random() - 0.5) * 40 : Math.random() * h - h, // Start above screen
      vx: isInit ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 1.5,
      vy: isInit ? (Math.random() - 0.5) * 3 : 0.5 + Math.random() * 2,
      r: Math.random() * 3 + 1.5,
      life: 0,
      maxLife: isInit ? 40 + Math.random() * 20 : 1000,
      isInteractive: isInit,
      hue: 200 + Math.random() * 20
    }),
    updateParticle: (p, ctx, w, h, pointer) => {
      if (!p.isInteractive && p.y > h + 10) {
        p.y = -10;
        p.x = Math.random() * w;
      }
      if (p.isInteractive) {
        p.vy += 0.05; // Light gravity
        p.life++;
        if (p.life > p.maxLife) return false;
      }

      // Pointer interaction (Wind blowing snow away)
      if (pointer.isDown || pointer.isMoving) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          p.vx += dx * 0.002;
          p.vy += dy * 0.002;
        }
      }
      
      // Sway gently
      p.x += p.vx + Math.sin(Date.now() * 0.001 + p.r!) * 0.3;
      p.y += p.vy;
      
      p.vx *= 0.98;
      if (!p.isInteractive) {
         if (p.vy > 3) p.vy = 3;
      } else {
         p.vy *= 0.98;
      }

      return true;
    },
    drawParticle: (p, ctx) => {
      const alpha = p.isInteractive ? 1 - p.life / p.maxLife : 0.6 + Math.random() * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r!, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${alpha})`;
      ctx.shadowBlur = p.r! * 2;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 90%, ${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    }
  },
  fireflies: {
    particleCount: 80,
    spawnOnPointerMove: 1,
    drawBackground: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#061208');
      g.addColorStop(1, '#0b2410');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    globalCompositeOperation: 'screen',
    createParticle: (w, h, isInit = false, px = 0, py = 0) => ({
      x: isInit ? px + (Math.random() - 0.5) * 50 : Math.random() * w,
      y: isInit ? py + (Math.random() - 0.5) * 50 : Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: isInit ? Math.random() * 2 + 1 : Math.random() * 3 + 1,
      life: Math.random() * Math.PI * 2, // Used for pulsing
      maxLife: isInit ? 80 + Math.random() * 40 : 1000,
      isInteractive: isInit,
      hue: 80 + Math.random() * 30 // Yellow-green
    }),
    updateParticle: (p, ctx, w, h, pointer) => {
      // Darting motion
      if (Math.random() < 0.02) {
        p.vx += (Math.random() - 0.5) * 2;
        p.vy += (Math.random() - 0.5) * 2;
      }
      
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.isInteractive) {
        p.life++; // Actually die if interactive
        if (p.life > p.maxLife) return false;
      } else {
        p.life += 0.05; // Pulse speed
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
      
      // Pointer attraction!
      if (pointer.isDown || pointer.isMoving) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 20) {
          p.vx += dx * 0.0005; // Attraction rather than repel
          p.vy += dy * 0.0005;
        }
      }
      
      p.vx *= 0.95;
      p.vy *= 0.95;
      return true;
    },
    drawParticle: (p, ctx) => {
      let pulse = p.isInteractive ? 1 - p.life / p.maxLife : (Math.sin(p.life) * 0.4 + 0.6);
      if (pulse < 0) pulse = 0;
      
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r! * 4);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${pulse})`);
      grad.addColorStop(0.2, `hsla(${p.hue}, 100%, 50%, ${pulse * 0.5})`);
      grad.addColorStop(1, `hsla(${p.hue}, 100%, 10%, 0)`);
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r! * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  },
  ocean: {
    particleCount: 60,
    spawnOnPointerMove: 2,
    drawBackground: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#001a33');
      g.addColorStop(1, '#000814');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    globalCompositeOperation: 'screen',
    createParticle: (w, h, isInit = false, px = 0, py = 0) => ({
      x: isInit ? px + (Math.random() - 0.5) * 40 : Math.random() * w,
      y: isInit ? py + (Math.random() - 0.5) * 40 : Math.random() * h,
      vx: isInit ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.5,
      vy: isInit ? (Math.random() - 0.5) * 2 - 1 : -0.5 - Math.random() * 1.5,
      r: isInit ? Math.random() * 4 + 2 : Math.random() * 8 + 2,
      life: 0,
      maxLife: isInit ? 60 + Math.random() * 40 : 1000,
      isInteractive: isInit,
      hue: 190 + Math.random() * 30
    }),
    updateParticle: (p, ctx, w, h, pointer) => {
      // Wobbly bubble motion
      p.x += p.vx + Math.sin(p.y * 0.05 + Date.now() * 0.002) * 0.5;
      p.y += p.vy;
      
      if (p.isInteractive) {
        p.life++;
        if (p.life > p.maxLife) return false;
      } else {
        if (p.y < -20) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }
      }
      
      // Pointer swirl
      if (pointer.isDown || pointer.isMoving) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
           // Create a vortex effect
           p.vx += dy * 0.002;
           p.vy -= dx * 0.002;
           // And push outward a bit
           p.vx += dx * 0.001;
           p.vy += dy * 0.001;
        }
      }
      
      p.vx *= 0.98;
      if (p.isInteractive) {
         p.vy *= 0.98;
      }
      
      return true;
    },
    drawParticle: (p, ctx) => {
      let alpha = p.isInteractive ? 1 - p.life / p.maxLife : 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r!, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 40%, ${alpha * 0.2})`;
      ctx.fill();
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsla(${p.hue}, 90%, 80%, ${alpha})`;
      ctx.stroke();
      
      // Bubble reflection
      ctx.beginPath();
      ctx.arc(p.x - p.r! * 0.3, p.y - p.r! * 0.3, p.r! * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(255, 100%, 100%, ${alpha * 0.8})`;
      ctx.fill();
    }
  }
};
