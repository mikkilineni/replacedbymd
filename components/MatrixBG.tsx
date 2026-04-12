"use client";

import { useEffect, useRef } from "react";

const CHARS = "0123456789ABCDEFabcdef{}[]<>|=+-_.:;アカサタナハマヤラワ";

export function MatrixBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect mobile — throttle on smaller screens
    const isMobile = window.innerWidth < 768;
    const colWidth = isMobile ? 24 : 18;
    const interval = isMobile ? 120 : 80;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let cols = Math.floor(width / colWidth);
    let drops = Array<number>(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(10,11,15,0.06)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(0,255,65,0.06)";
      ctx.font = `14px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * colWidth, drops[i] * colWidth);
        if (drops[i] * colWidth > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const timerId = setInterval(draw, interval);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.floor(width / colWidth);
      drops = Array<number>(cols).fill(1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(timerId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
