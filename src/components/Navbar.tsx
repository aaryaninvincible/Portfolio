import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ThemeSwitcher } from './ThemeSwitcher';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Resume', path: '/resume' },
    { name: 'Updates', path: '/updates' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'All Work', path: '/all-work' },
    { name: 'Admin', path: '/admin' }
];

export const Navbar: React.FC = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <header className="fixed w-full top-0 z-50 glass border-b border-white/10 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="AR Logo" className="h-8 w-auto" />
                        <span className="text-2xl font-black font-orbitron tracking-wider text-gradient animate-pulse-glow hidden sm:block">
                            ARYAN ZONE
                        </span>
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`font-mono transition-colors relative group py-1 ${location.pathname === link.path ? 'text-primary' : 'text-light hover:text-primary'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`} />
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 text-light hover:text-primary hover:border-primary/40 transition-colors"
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        >
                            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                <nav
                    className={`md:hidden border-t border-white/10 bg-black/95 backdrop-blur-md transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="px-4 py-3 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`rounded-lg px-3 py-3 font-mono transition-colors ${location.pathname === link.path
                                    ? 'text-primary bg-primary/10'
                                    : 'text-light hover:text-primary hover:bg-white/5'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </nav>
            </header>
            {/* Scroll Progress Bar */}
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent z-[60] origin-left"
                style={{ scaleX }}
            />
        </>
    );
};
