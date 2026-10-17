import React, { useRef, useState, useEffect } from 'react';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    disableTilt?: boolean;
    liquidSheen?: boolean;
    variant?: 'default' | 'elevated' | 'subtle';
};

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    disableTilt = false,
    liquidSheen = true,
    variant = 'default',
    ...props
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});
    const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
            setIsTouchDevice(hasTouch);
        }
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disableTilt || isTouchDevice || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Subtle, elegant Apple-style 3D tilt (capped at 6 degrees for smooth realism)
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        setTransformStyle({
            transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`,
            transition: 'transform 0.1s cubic-bezier(0.2, 0, 0, 1)',
            borderColor: 'rgba(255, 255, 255, 0.22)',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.7), 0 0 25px rgba(255, 115, 0, 0.18)'
        });

        // Apple liquid specular reflection
        setGlareStyle({
            opacity: 1,
            background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.2) 0%, rgba(255, 115, 0, 0.08) 25%, transparent 60%)`
        });
    };

    const handleMouseLeave = () => {
        if (disableTilt || isTouchDevice) return;
        setTransformStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s, border-color 0.45s',
        });
        setGlareStyle({ opacity: 0 });
    };

    const baseClass = variant === 'elevated' ? 'glass-elevated' : 'glass';

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative ${baseClass} rounded-2xl overflow-hidden glass-hover transition-all duration-300 ${className}`}
            style={transformStyle}
            {...props}
        >
            {/* Top & Bottom specular edge reflections (Apple iOS glass bevel highlight) */}
            {liquidSheen && (
                <>
                    <div 
                        className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-20" 
                        aria-hidden="true"
                    />
                    <div 
                        className="absolute bottom-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" 
                        aria-hidden="true"
                    />
                </>
            )}

            {/* Dynamic liquid specular glare for mouse tracking */}
            <div
                className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay transition-opacity duration-300"
                style={glareStyle}
                aria-hidden="true"
            />

            {children}
        </div>
    );
};
