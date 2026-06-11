/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Heart, Sparkles, Wind, Sun, Snowflake, Bug, Waves } from 'lucide-react';
import { motion, useSpring } from 'motion/react';

const availableThemes = [
  { id: 'crimson', name: '绯红之恋', icon: <Heart size={18} /> },
  { id: 'sakura', name: '樱花如雨', icon: <Wind size={18} /> },
  { id: 'stardust', name: '星路轨迹', icon: <Sparkles size={18} /> },
  { id: 'golden', name: '晨曦微光', icon: <Sun size={18} /> },
  { id: 'snow', name: '漫天飞雪', icon: <Snowflake size={18} /> },
  { id: 'fireflies', name: '萤火之森', icon: <Bug size={18} /> },
  { id: 'ocean', name: '深海之恋', icon: <Waves size={18} /> },
];

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('crimson');

  const springConfig = { stiffness: 60, damping: 20 };
  const textX = useSpring(0, springConfig);
  const textY = useSpring(0, springConfig);
  const textRotateX = useSpring(0, springConfig);
  const textRotateY = useSpring(0, springConfig);

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;
    
    // We update pointer target
    let pointer = { x: -1000, y: -1000 };
    
    const handleMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    
    window.addEventListener('pointermove', handleMove);
    
    const animate = () => {
      time += 0.02;
      const { innerWidth: w, innerHeight: h } = window;
      
      const cx = w / 2;
      const cy = h / 2;
      
      // Floating base effect gently
      let targetX = Math.sin(time) * 10;
      let targetY = Math.sin(time * 2) * 5;
      let targetRotX = 0;
      let targetRotY = 0;
      
      if (pointer.x !== -1000) {
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        
        // Gentle parallax (move slightly opposite to cursor)
        targetX -= dx * 0.03;
        targetY -= dy * 0.03;
        
        // Tilt effect (look towards cursor gently)
        targetRotX = -(dy / h) * 30; 
        targetRotY = (dx / w) * 30;
      }
      
      textX.set(targetX);
      textY.set(targetY);
      textRotateX.set(targetRotX);
      textRotateY.set(targetRotY);
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('pointermove', handleMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [textX, textY, textRotateX, textRotateY]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col justify-center items-center font-sans touch-none" style={{ perspective: 1000 }}>
      
      {/* Background Interactive Canvas Layer */}
      <ParticleCanvas themeId={currentTheme} />
      
      {/* Central Interactive Text Layer */}
      <motion.div 
        style={{ x: textX, y: textY, rotateX: textRotateX, rotateY: textRotateY }}
        className="absolute z-10 pointer-events-none tracking-[0.2em] select-none text-center px-4 flex flex-col items-center"
      >
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl text-white/95 font-serif font-light"
          style={{ 
            fontFamily: '"Songti SC", "Noto Serif CJK SC", "STSong", "SimSun", serif', 
            textShadow: '0 0 30px rgba(255,255,255,0.7), 0 4px 20px rgba(0,0,0,0.5)' 
          }}
        >
          我爱你姐姐～
        </h1>
        <p 
          className="mt-6 md:mt-8 text-white/70 tracking-[0.4em] text-xs md:text-sm font-light uppercase"
          style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}
        >
          Forever & Always
        </p>
      </motion.div>

      {/* Theme Controls */}
      <div className="absolute bottom-6 sm:bottom-12 z-20 w-full flex justify-center px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md p-3 rounded-[2rem] sm:rounded-full border border-white/20 shadow-xl max-w-[260px] sm:max-w-none pointer-events-auto">
          {availableThemes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setCurrentTheme(theme.id)}
              className={`p-3 sm:p-4 rounded-full transition-all duration-500 ease-out flex items-center justify-center shrink-0 w-11 h-11 sm:w-14 sm:h-14
                ${currentTheme === theme.id 
                  ? 'bg-white/90 text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
                  : 'text-white/70 hover:bg-white/20 hover:text-white hover:scale-105'}`}
              title={theme.name}
              aria-label={theme.name}
            >
              {theme.icon}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
}

