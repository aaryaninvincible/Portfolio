import React, { useRef, useState } from 'react';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    disableTilt?: boolean;
};

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', disableTilt = false, ...props }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});
    const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disableTilt) return;
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate tilt
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'none',
            borderColor: 'rgba(255,255,255,0.3)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2), 0 0 10px rgba(255, 115, 0, 0.5)'
        });

        setGlareStyle({
            opacity: 1,
            background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.2) 0%, transparent 40%)`
        });
    };

    const handleMouseLeave = () => {
        if (disableTilt) return;
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s',
        });
        setGlareStyle({ opacity: 0 });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative glass rounded-2xl overflow-hidden glass-hover [transform-style:preserve-3d] ${className}`}
            style={style}
            {...props}
        >
            <div
                className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay transition-opacity duration-300"
                style={glareStyle}
            />
            <div className="relative z-0 h-full">
                {children}
            </div>
        </div>
    );
};
