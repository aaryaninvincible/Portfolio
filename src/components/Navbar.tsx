import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

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
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

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
        <header
            className={`fixed top-2.5 sm:top-4 inset-x-3 sm:inset-x-6 mx-auto max-w-6xl z-50 liquid-glass-header rounded-2xl sm:rounded-full transition-all duration-500 shadow-2xl ${
                hideNavbar ? '-translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
            }`}
        >
            {/* Apple-style top specular reflection highlight */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none rounded-full" />
            
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center">
                {/* Brand Logo */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
                        <img src="/logo.png" alt="AR Logo" className="h-7 sm:h-8 w-auto transition-transform group-hover:scale-105" />
                        <span className="text-lg sm:text-xl font-black font-orbitron tracking-wider text-gradient">
                            ARYAN ZONE
                        </span>
                    </Link>
                </div>

                {/* Desktop Interactive Nav with Spring-Physics Oil-Drop Cursor Follower */}
                <nav
                    onMouseLeave={() => setHoveredPath(null)}
                    className="hidden md:flex items-center gap-1.5 py-1 px-1 relative"
                >
                    {navLinks.map((link) => {
                        const isTarget = hoveredPath !== null ? hoveredPath === link.path : location.pathname === link.path;
                        const isSelected = location.pathname === link.path;

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onMouseEnter={() => setHoveredPath(link.path)}
                                className={`relative inline-flex items-center justify-center px-4 py-2 font-sans text-xs lg:text-sm whitespace-nowrap transition-colors duration-200 z-10 ${
                                    isSelected
                                        ? 'text-[#ff7800] font-bold drop-shadow-[0_0_10px_rgba(255,120,0,0.65)]'
                                        : isTarget
                                        ? 'text-white font-semibold'
                                        : 'text-slate-300 hover:text-white font-medium'
                                }`}
                            >
                                {isTarget && (
                                    <motion.div
                                        layoutId="liquidNavDrop"
                                        className="absolute inset-0 rounded-full liquid-glass-drop-active -z-10 overflow-hidden pointer-events-none"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 450,
                                            damping: 28,
                                            mass: 0.8,
                                        }}
                                    >
                                        {/* Specular curved liquid crescent sheen */}
                                        <div className="absolute inset-x-2 top-0.5 h-2/5 rounded-full bg-gradient-to-b from-white/70 via-white/15 to-transparent pointer-events-none" />
                                        {/* Prismatic bottom reflection caustic */}
                                        <div className="absolute -bottom-1 inset-x-2 h-1/2 rounded-full bg-gradient-to-t from-primary/60 via-pink-500/25 to-transparent blur-[2px] pointer-events-none" />
                                    </motion.div>
                                )}
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Action Icons: Search, Terminal, Mobile Menu */}
                <div className="flex items-center gap-2 sm:gap-2.5">

                    {/* Desktop Search Button */}
                    <button
                        type="button"
                        onClick={onOpenCommandPalette}
                        className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-capsule text-xs font-sans text-slate-300 hover:text-primary transition-all min-h-[36px] active:scale-95"
                        title="Open Command Palette (Ctrl+K)"
                    >
                        <Search size={14} className="text-primary" />
                        <span className="font-mono text-[11px] text-slate-400">Ctrl+K</span>
                    </button>

                    {/* Mobile Quick Search Button */}
                    <button
                        type="button"
                        onClick={onOpenCommandPalette}
                        className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-full liquid-glass-capsule text-primary hover:text-white transition-colors active:scale-95"
                        title="Search Projects & Commands"
                        aria-label="Search Projects"
                    >
                        <Search size={15} />
                    </button>

                    {/* Terminal Button */}
                    <button
                        type="button"
                        onClick={onOpenTerminal}
                        className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full liquid-glass-capsule text-secondary hover:text-white transition-colors active:scale-95"
                        title="Open Cyber Terminal CLI"
                        aria-label="Open Terminal"
                    >
                        <Terminal size={17} />
                    </button>

                    {/* Mobile Hamburger Menu Toggle */}
                    <button
                        type="button"
                        className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full liquid-glass-capsule text-light hover:text-primary transition-colors active:scale-95"
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    >
                        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Navigation */}
            <nav
                className={`md:hidden border-t border-white/10 liquid-glass-header rounded-b-2xl transition-all duration-300 overflow-hidden ${
                    isMobileMenuOpen ? 'max-h-[420px] opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
                }`}
            >
                <div className="px-4 flex flex-col gap-1.5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`rounded-xl px-4 py-2.5 font-sans text-sm transition-all min-h-[44px] flex items-center ${
                                location.pathname === link.path
                                    ? 'text-primary bg-primary/20 font-bold border border-primary/30'
                                    : 'text-light hover:text-primary hover:bg-white/5'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
};
