import React, { useEffect, useRef } from 'react';

const AdminNetworkCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Node configuration
    const nodeCount = 45;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: 1 + Math.random() * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random()
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sensor link connections (lines)
      ctx.lineWidth = 0.8;
      ctx.shadowBlur = 0;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Proximity link distance: 130px
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw sensor node points (dots)
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];

        // Motion physics
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off screen boundaries
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Pulse values
        node.pulseVal += node.pulseSpeed;
        const scaleRadius = node.radius * (1 + Math.sin(node.pulseVal) * 0.25);
        const glowOpacity = 0.2 + (Math.sin(node.pulseVal) + 1) * 0.35;

        // Core dot (indigo)
        ctx.beginPath();
        ctx.arc(node.x, node.y, scaleRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.fill();

        // Glowing ring (cyan)
        ctx.beginPath();
        ctx.arc(node.x, node.y, scaleRadius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${glowOpacity * 0.16})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'screen',
        opacity: 0.65
      }}
    />
  );
};

export default AdminNetworkCanvas;
