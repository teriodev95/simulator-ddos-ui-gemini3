import React, { useEffect, useRef } from 'react';
import { AttackType, SimulationState, COLORS } from '../types';

interface VisualizerProps {
  state: SimulationState;
  updateStats: (newStats: Partial<SimulationState['stats']>) => void;
}

interface Particle {
  x: number;
  y: number;
  tx: number; // Target X
  ty: number; // Target Y
  vx: number;
  vy: number;
  color: string;
  type: 'packet' | 'blocked' | 'hit' | 'mitigated';
  life: number;
  speed: number;
  id: number;
}

export const NetworkVisualizer: React.FC<VisualizerProps> = ({ state, updateStats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameIdRef = useRef<number>(0);
  const lastStatsUpdateRef = useRef<number>(0);
  
  // Stats tracking
  const statsRef = useRef({
    packetsSent: 0,
    packetsBlocked: 0,
    packetsHit: 0,
    packetsMitigated: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticle = (w: number, h: number): Particle => {
      const centerX = w / 2;
      const centerY = h / 2;
      
      // --- LOAD BALANCER LOGIC ---
      // If LB is active, traffic is distributed to satellite nodes
      let targetX = centerX;
      let targetY = centerY;
      
      if (state.defenses.loadBalancer) {
        const r = 120; // Radius of satellites
        const targets = [
          { x: centerX, y: centerY }, // Main
          { x: centerX, y: centerY - r }, // Top
          { x: centerX - r * 0.866, y: centerY + r * 0.5 }, // Bottom Left
          { x: centerX + r * 0.866, y: centerY + r * 0.5 }, // Bottom Right
        ];
        // Randomly select a target. In a real LB, this would be round-robin or least-conn.
        // We give the main server a chance, but satellites take most load.
        const t = targets[Math.floor(Math.random() * targets.length)];
        targetX = t.x;
        targetY = t.y;
      }

      // Spawn point (random circle edge)
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = Math.max(w, h) / 1.4;
      const startX = centerX + Math.cos(angle) * spawnDist;
      const startY = centerY + Math.sin(angle) * spawnDist;

      // Calculate velocity towards TARGET (not always center now)
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy);
      
      let color = COLORS.HTTP;
      let speedBase = 2;
      
      const activeType = state.attackType === AttackType.MIX 
        ? (Math.random() > 0.66 ? AttackType.UDP : Math.random() > 0.33 ? AttackType.SYN : AttackType.HTTP)
        : state.attackType;

      switch (activeType) {
        case AttackType.SYN: color = COLORS.SYN; speedBase = 4; break;
        case AttackType.UDP: color = COLORS.UDP; speedBase = 3; break;
        default: color = COLORS.HTTP; speedBase = 2; break;
      }

      return {
        x: startX,
        y: startY,
        tx: targetX,
        ty: targetY,
        vx: (dx / dist),
        vy: (dy / dist),
        color,
        type: 'packet',
        life: 1,
        speed: speedBase + (Math.random() * 1.5),
        id: Math.random()
      };
    };

    const render = (time: number) => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;
      const isCrashed = state.stats.serverLoad >= 99;

      ctx.save();
      
      // Shake effect
      if (isCrashed) {
        const shake = 10;
        ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
      }

      ctx.clearRect(-20, -20, width + 40, height + 40);

      // Draw Satellites (Load Balancer Nodes) BEHIND particles
      if (state.defenses.loadBalancer) {
        const r = 120;
        const satellites = [
          { x: centerX, y: centerY - r },
          { x: centerX - r * 0.866, y: centerY + r * 0.5 },
          { x: centerX + r * 0.866, y: centerY + r * 0.5 },
        ];

        satellites.forEach((sat) => {
          // Connection Line
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(sat.x, sat.y);
          ctx.strokeStyle = '#E5E7EB';
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Node Body
          ctx.beginPath();
          ctx.fillStyle = '#F3F4F6';
          ctx.arc(sat.x, sat.y, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#9CA3AF';
          ctx.stroke();

          // Node Icon
          ctx.fillStyle = '#9CA3AF';
          ctx.fillRect(sat.x - 6, sat.y - 6, 12, 12);
        });
      }

      // Draw Defense Perimeters
      // 1. FIREWALL (Outer Shield)
      if (state.defenses.firewall) {
        const fwRadius = 240;
        ctx.beginPath();
        ctx.strokeStyle = '#3B82F6'; // Blue
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + Math.sin(time / 500) * 0.1;
        
        // Hexagon Shape
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (time / 4000); // Slow rotation
            const x = centerX + Math.cos(angle) * fwRadius;
            const y = centerY + Math.sin(angle) * fwRadius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 2. RATE LIMITING (Inner Throttle Ring)
      if (state.defenses.rateLimiting) {
        const rlRadius = 160;
        ctx.beginPath();
        ctx.strokeStyle = '#F59E0B'; // Amber
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 15]);
        ctx.lineDashOffset = -time / 20; // Rotate effect
        ctx.arc(centerX, centerY, rlRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- PARTICLE LOGIC ---
      const spawnRate = state.intensity * 2.0;
      const particlesToSpawn = Math.floor(spawnRate) + (Math.random() < (spawnRate % 1) ? 1 : 0);
      
      if (!isCrashed || Math.random() > 0.3) {
        for (let i = 0; i < particlesToSpawn; i++) {
          particlesRef.current.push(createParticle(width, height));
          statsRef.current.packetsSent++;
        }
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        
        if (p.type === 'packet') {
          // Move
          if (isCrashed) {
            // Chaotic movement in crash
             p.x += p.vx * p.speed * (Math.random() * 0.5 + 0.5) + (Math.random() - 0.5) * 20; 
             p.y += p.vy * p.speed * (Math.random() * 0.5 + 0.5) + (Math.random() - 0.5) * 20;
          } else {
             p.x += p.vx * p.speed;
             p.y += p.vy * p.speed;
          }

          // Distance to its TARGET
          const distToTarget = Math.hypot(p.x - p.tx, p.y - p.ty);
          // Distance to CENTER (for firewall/rate limit checks)
          const distToCenter = Math.hypot(p.x - centerX, p.y - centerY);

          // --- COLLISION CHECKS ---
          let blocked = false;
          let mitigated = false;

          // 1. FIREWALL CHECK (Radius ~240)
          if (state.defenses.firewall && distToCenter < 240 && distToCenter > 230) {
            // Higher block chance for simple floods, lower for complex
            const effectiveness = 0.6; 
            if (Math.random() < effectiveness) blocked = true;
          }

          // 2. RATE LIMIT CHECK (Radius ~160)
          if (!blocked && state.defenses.rateLimiting && distToCenter < 160 && distToCenter > 150) {
            // Rate limit blocks bursts. 
            if (Math.random() < 0.5) blocked = true; 
          }

          if (blocked) {
            p.type = 'blocked';
            p.life = 15;
            statsRef.current.packetsBlocked++;
          } else {
            // Hit Target Logic
            if (distToTarget < 30) {
               // Check if it hit a ghost (Load Balancer) or main server
               const hitMain = (p.tx === centerX && p.ty === centerY);
               
               if (hitMain) {
                 p.type = 'hit';
                 p.life = 10;
                 statsRef.current.packetsHit++;
               } else {
                 p.type = 'mitigated'; // Hit a satellite
                 p.life = 10;
                 statsRef.current.packetsMitigated++;
               }
            }
          }

        } else {
          // Decay life for non-packet particles
          p.life--;
          if (p.life <= 0) particlesRef.current.splice(i, 1);
        }

        // Draw Particle
        if (p.type === 'packet') {
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, isCrashed ? 2 + Math.random() * 3 : 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'blocked') {
          // Draw blocked icon (X or Shield spark)
          ctx.beginPath();
          ctx.strokeStyle = state.defenses.firewall && Math.hypot(p.x-centerX, p.y-centerY) > 200 ? '#3B82F6' : '#F59E0B';
          ctx.lineWidth = 2;
          const r = 6 * (p.life / 15);
          ctx.moveTo(p.x - r, p.y - r);
          ctx.lineTo(p.x + r, p.y + r);
          ctx.moveTo(p.x + r, p.y - r);
          ctx.lineTo(p.x - r, p.y + r);
          ctx.stroke();
        } else if (p.type === 'hit') {
          ctx.beginPath();
          ctx.fillStyle = isCrashed ? '#EF4444' : p.color;
          ctx.globalAlpha = p.life / 10;
          ctx.arc(centerX, centerY, 40 + (10 - p.life) * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (p.type === 'mitigated') {
          // Hit a satellite - Blue pulse
          ctx.beginPath();
          ctx.fillStyle = '#3B82F6';
          ctx.globalAlpha = p.life / 10;
          ctx.arc(p.tx, p.ty, 20 + (10 - p.life), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // --- SERVER RENDER ---
      if (isCrashed) {
        // Glitch Render
        ctx.translate((Math.random() - 0.5) * 10, 0);
        ctx.fillStyle = '#1F2937';
        ctx.beginPath(); ctx.arc(centerX, centerY, 45, 0, Math.PI*2); ctx.fill();
        
        // Red Skull / X
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX-15, centerY-15); ctx.lineTo(centerX+15, centerY+15);
        ctx.moveTo(centerX+15, centerY-15); ctx.lineTo(centerX-15, centerY+15);
        ctx.stroke();
      } else {
        // Standard Server
        const pulse = Math.sin(time / 200) * (state.stats.serverLoad / 20);
        ctx.beginPath();
        ctx.fillStyle = state.stats.serverLoad > 80 ? '#FCA5A5' : '#E5E7EB';
        ctx.arc(centerX, centerY, 45 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Server Box
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(centerX, centerY, 40, 0, Math.PI*2); ctx.fill();

        // Icon
        const color = state.stats.serverLoad > 90 ? '#EF4444' : state.stats.serverLoad > 50 ? '#F59E0B' : '#10B981';
        ctx.fillStyle = color;
        ctx.fillRect(centerX - 12, centerY - 14, 24, 6);
        ctx.fillRect(centerX - 12, centerY - 3, 24, 6);
        ctx.fillRect(centerX - 12, centerY + 8, 24, 6);
      }

      ctx.restore();

      // --- UPDATE STATS ---
      if (time - lastStatsUpdateRef.current > 200) {
        const hits = statsRef.current.packetsHit;
        const mitigated = statsRef.current.packetsMitigated;
        const blocked = statsRef.current.packetsBlocked;
        const total = statsRef.current.packetsSent;
        
        // Impact calculation
        // Note: Mitigated packets (LB) do not count towards load
        const damageMultiplier = 1.2; 
        
        // Recalibrated load logic
        // Hits generate load. Mitigated do not. Blocked do not.
        const currentLoadImpact = (hits * damageMultiplier) / (total || 1) * state.intensity * 15;
        
        const oldLoad = state.stats.serverLoad;
        let newLoad = oldLoad + (currentLoadImpact - oldLoad) * 0.1;
        if (hits === 0) newLoad *= 0.9; // Decay
        
        newLoad = Math.min(100, Math.max(0, newLoad));
        if (isCrashed && state.intensity > 4) newLoad = 100;

        // Calculate mitigation % including LB redirection
        const totalMitigated = blocked + mitigated;
        const effectiveTotal = blocked + hits + mitigated;
        
        updateStats({
          pps: Math.floor(total * 5),
          blockedPercent: effectiveTotal > 0 ? Math.round((totalMitigated / effectiveTotal) * 100) : 0,
          serverLoad: newLoad
        });

        statsRef.current.packetsSent = 0;
        statsRef.current.packetsBlocked = 0;
        statsRef.current.packetsHit = 0;
        statsRef.current.packetsMitigated = 0;
        lastStatsUpdateRef.current = time;
      }

      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [state.intensity, state.attackType, state.defenses]);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none" />;
};
