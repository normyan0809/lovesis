import React, { useRef, useEffect } from 'react';
import { themes, Particle } from '../utils/themes';

interface ParticleCanvasProps {
  themeId: string;
}

export function ParticleCanvas({ themeId }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    let theme = themes[themeId];
    if (!theme) theme = themes.crimson;
    
    let particles: Particle[] = [];
    // Initialize ambient particles
    for (let i = 0; i < theme.particleCount; i++) {
        particles.push(theme.createParticle(width, height, false));
    }
    
    // Pointer state
    const pointer = { isDown: false, x: -1000, y: -1000, isMoving: false };
    
    const handleDown = (e: PointerEvent) => {
        pointer.isDown = true;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    };
    const handleMove = (e: PointerEvent) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.isMoving = true;
    };
    const handleUp = () => {
        pointer.isDown = false;
        pointer.isMoving = false;
        pointer.x = -1000;
        pointer.y = -1000;
    };
    
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    window.addEventListener('pointercancel', handleUp, { passive: true });
    
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    
    let animationId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
        // Reset to source-over for background clear
        ctx.globalCompositeOperation = 'source-over';
        // Draw background
        theme.drawBackground(ctx, width, height);
        
        ctx.globalCompositeOperation = theme.globalCompositeOperation || 'source-over';
        
        // Spawn interactive particles on pointer move/down safely
        let interactiveCount = 0;
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].isInteractive) interactiveCount++;
        }

        if ((pointer.isDown || pointer.isMoving) && interactiveCount < 300) {
            // Spawn less if just holding down without moving
            const spawnRate = pointer.isMoving ? 1 : 0.2;
            if (Math.random() < spawnRate) {
                const spawnCount = theme.spawnOnPointerMove || 2;
                for(let i = 0; i < spawnCount; i++) {
                    particles.push(theme.createParticle(width, height, true, pointer.x, pointer.y));
                }
            }
            pointer.isMoving = false; // Reset burst flag
        }
        
        // Update and draw
        for (let i = particles.length - 1; i >= 0; i--) {
             const p = particles[i];
             const alive = theme.updateParticle(p, ctx, width, height, pointer);
             if (!alive) {
                 particles.splice(i, 1);
             } else {
                 theme.drawParticle(p, ctx);
             }
        }
        
        animationId = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('pointerdown', handleDown);
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
        window.removeEventListener('resize', handleResize);
    }
  }, [themeId]);
  
  return (
    <canvas 
        ref={canvasRef} 
        style={{ touchAction: 'none' }}
        className="absolute inset-0 w-full h-full block" 
    />
  )
}
