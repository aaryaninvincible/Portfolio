import React, { useEffect, useRef, useState } from 'react';

export const CursorFollower: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const targetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const isFinePointer = window.matchMedia('(pointer: fine)').matches;
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setIsEnabled(isFinePointer && !isReducedMotion);
    }, []);

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        let animationFrameId: number;

        const onMouseMove = (e: MouseEvent) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
            setIsVisible(true);
        };

        const onMouseOut = () => {
            setIsVisible(false);
        };

        // Use requestAnimationFrame for smooth trailing effect
        const animate = () => {
            setPosition(prev => ({
                x: prev.x + (targetRef.current.x - prev.x) * 0.15,
                y: prev.y + (targetRef.current.y - prev.y) * 0.15,
            }));
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseout', onMouseOut);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseout', onMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isEnabled]);

    if (!isEnabled) {
        return null;
    }

    return (
        <div
            className={`fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[9999] opacity-0 mix-blend-screen transition-opacity duration-300 ${isVisible ? 'opacity-100' : ''}`}
            style={{
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(129, 140, 248, 0.05) 40%, transparent 70%)',
                transform: `translate(calc(${position.x}px - 50%), calc(${position.y}px - 50%))`,
            }}
        />
    );
};
