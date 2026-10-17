import React, { useState, useRef } from 'react';

interface LiquidGlassDropProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'drop' | 'capsule' | 'pill';
  interactive?: boolean;
  onClick?: () => void;
  title?: string;
  glowColor?: string;
}

export const LiquidGlassDrop: React.FC<LiquidGlassDropProps> = ({
  children,
  className = '',
  variant = 'drop',
  interactive = true,
  onClick,
  title,
  glowColor = 'rgba(255, 115, 0, 0.4)',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reflectionPos, setReflectionPos] = useState({ x: 35, y: 30 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setReflectionPos({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setReflectionPos({ x: 35, y: 30 });
  };

  // 1. Drop variant (Circular floating liquid glass meniscus lens - As in Image 1)
  if (variant === 'drop') {
    return (
      <div
        ref={containerRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={title}
        className={`relative inline-flex items-center justify-center rounded-full select-none cursor-pointer transition-all duration-300 ${
          isHovered ? '-translate-y-1.5 scale-105' : 'animate-liquid-float'
        } ${className}`}
        style={{
          background: `radial-gradient(135% 135% at ${reflectionPos.x}% ${reflectionPos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.16) 38%, rgba(255, 255, 255, 0.04) 75%, rgba(255, 255, 255, 0.14) 100%)`,
          backdropFilter: 'blur(28px) saturate(220%)',
          WebkitBackdropFilter: 'blur(28px) saturate(220%)',
          border: '1px solid rgba(255, 255, 255, 0.38)',
          boxShadow: isHovered
            ? `0 35px 60px -15px rgba(0, 0, 0, 0.95), 0 12px 24px -6px rgba(0, 0, 0, 0.7), inset 0 2px 2.5px 0 rgba(255, 255, 255, 0.8), inset 0 -2.5px 5px 0 rgba(0, 0, 0, 0.5), 0 0 30px ${glowColor}`
            : '0 28px 50px -12px rgba(0, 0, 0, 0.9), 0 10px 20px -5px rgba(0, 0, 0, 0.6), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.7), inset 0 -2px 5px 0 rgba(0, 0, 0, 0.45), inset 0 0 16px 2px rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Specular top rim crescent */}
        <div
          className="absolute inset-x-2 top-0.5 h-[35%] rounded-full opacity-60 pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(ellipse at ${reflectionPos.x}% 0%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%)`,
          }}
        />

        {/* Inner refractive ring */}
        <div className="absolute inset-[3px] rounded-full border border-white/20 pointer-events-none" />

        {/* Diffuse shadow underneath simulating floating altitude */}
        <div
          className="absolute -bottom-5 inset-x-3 h-4 rounded-full bg-black/80 blur-md -z-10 transition-transform duration-300 pointer-events-none"
          style={{
            transform: isHovered ? 'scale(0.85) translateY(4px)' : 'scale(1)',
            opacity: isHovered ? 0.95 : 0.75,
          }}
        />

        <div className="relative z-10 flex items-center justify-center p-3">
          {children}
        </div>
      </div>
    );
  }

  // 2. Capsule / Slider variant (Liquid horizontal capsule - As in Image 2)
  if (variant === 'capsule') {
    return (
      <div
        ref={containerRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={title}
        className={`relative inline-flex items-center rounded-full select-none cursor-pointer transition-all duration-300 ${
          isHovered ? '-translate-y-1' : ''
        } ${className}`}
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 55%, rgba(255, 255, 255, 0.15) 100%)`,
          backdropFilter: 'blur(28px) saturate(210%)',
          WebkitBackdropFilter: 'blur(28px) saturate(210%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isHovered
            ? `0 24px 45px -10px rgba(0, 0, 0, 0.85), inset 0 2px 2px 0 rgba(255, 255, 255, 0.65), inset 0 -2px 3px 0 rgba(0, 0, 0, 0.4), 0 0 25px ${glowColor}`
            : '0 16px 36px -8px rgba(0, 0, 0, 0.7), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Top edge liquid refraction line */}
        <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-2 px-4 py-2">
          {children}
        </div>
      </div>
    );
  }

  // 3. Pill variant (Apple iOS header / modal buttons - As in Image 3)
  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={title}
      className={`relative inline-flex items-center justify-center rounded-2xl sm:rounded-full select-none cursor-pointer transition-all duration-300 ${
        isHovered ? 'scale-[1.02] border-white/40' : ''
      } ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.09)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        boxShadow: isHovered
          ? `0 16px 32px -8px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), 0 0 20px ${glowColor}`
          : '0 10px 24px -6px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
      }}
    >
      <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2">
        {children}
      </div>
    </div>
  );
};
