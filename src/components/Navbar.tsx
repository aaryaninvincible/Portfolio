import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Terminal } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Resume', path: '/resume' },
    { name: 'Updates', path: '/updates' },
    { name: 'Buy Projects', path: '/buy-projects' },
    { name: 'All Work', path: '/all-work' },
    { name: 'Contact', path: '/contact' }
];

interface NavbarProps {
    onOpenCommandPalette?: () => void;
    onOpenTerminal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette, onOpenTerminal }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hideNavbar, setHideNavbar] = useState(false);
    const [liveVisitors, setLiveVisitors] = useState(12);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveVisitors((prev) => {
                const delta = Math.floor(Math.random() * 3) - 1;
                return Math.max(8, Math.min(24, prev + delta));
            });
        }, 12000);
        return () => clearInterval(interval);
    }, []);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;
            setHideNavbar(nearBottom);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className={`fixed w-full top-0 z-50 glass border-b border-white/10 shadow-lg transition-all duration-500 ${hideNavbar ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="AR Logo" className="h-8 w-auto" />
                            <span className="text-2xl font-black font-orbitron tracking-wider text-gradient animate-pulse-glow hidden sm:block">
                                ARYAN ZONE
                            </span>
                        </Link>
                        {/* Live Visitor Counter Badge */}
                        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>{liveVisitors} Live Online</span>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-3 lg:gap-5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`font-mono text-xs lg:text-sm whitespace-nowrap transition-colors relative group py-1 ${
                                    location.pathname === link.path ? 'text-primary font-bold' : 'text-light hover:text-primary'
                                }`}
                            >
                                {link.name}
                                <span className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${
                                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                                }`} />
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onOpenCommandPalette}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-mono text-slate-300 hover:text-primary hover:border-primary/50 bg-white/5 transition-all"
                            title="Open Command Palette (Ctrl+K)"
                        >
                            <Search size={14} className="text-primary" />
                            <span>Ctrl+K</span>
                        </button>
                        <button
                            type="button"
                            onClick={onOpenTerminal}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 text-secondary hover:text-white hover:border-secondary/50 bg-white/5 transition-colors"
                            title="Open Cyber Terminal CLI"
                        >
                            <Terminal size={16} />
                        </button>
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 text-light hover:text-primary hover:border-primary/40 transition-colors"
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
                className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent z-[60] origin-left transition-opacity duration-500 ${hideNavbar ? 'opacity-0' : 'opacity-100'}`}
                style={{ scaleX }}
            />
        </>
    );
};
