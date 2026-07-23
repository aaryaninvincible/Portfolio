import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, Download, Music, ExternalLink, Gamepad2, Sparkles, X, Code, FolderGit2, Mail } from 'lucide-react';
import { audioManager } from '../lib/audioManager';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Socials';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenTerminal }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          // open triggered from parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    {
      id: 'nav-home',
      title: 'Go to Homepage',
      category: 'Navigation',
      icon: <Sparkles size={16} className="text-primary" />,
      action: () => { navigate('/'); onClose(); }
    },
    {
      id: 'nav-projects',
      title: 'Explore Flagship Builds & Projects',
      category: 'Navigation',
      icon: <FolderGit2 size={16} className="text-accent" />,
      action: () => { navigate('/all-work'); onClose(); }
    },
    {
      id: 'nav-arcade',
      title: 'Play Retro Arcade Games',
      category: 'Navigation',
      icon: <Gamepad2 size={16} className="text-secondary" />,
      action: () => {
        navigate('/');
        setTimeout(() => {
          document.getElementById('arcade')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        onClose();
      }
    },
    {
      id: 'nav-contact',
      title: 'Contact / Hire / Request Project',
      category: 'Navigation',
      icon: <Mail size={16} className="text-primary" />,
      action: () => { navigate('/contact'); onClose(); }
    },
    {
      id: 'act-terminal',
      title: 'Open Cyber Interactive Terminal',
      category: 'Actions',
      icon: <Terminal size={16} className="text-secondary" />,
      action: () => { onClose(); onOpenTerminal(); }
    },
    {
      id: 'act-music',
      title: 'Toggle Lofi Background Music',
      category: 'Actions',
      icon: <Music size={16} className="text-primary" />,
      action: () => { audioManager.togglePlay(); onClose(); }
    },
    {
      id: 'act-resume',
      title: 'Download Resume PDF',
      category: 'Actions',
      icon: <Download size={16} className="text-accent" />,
      action: () => {
        window.open('/AryanRaikwarResume.pdf', '_blank');
        onClose();
      }
    },
    {
      id: 'soc-github',
      title: 'Visit GitHub (@aaryaninvincible)',
      category: 'Socials',
      icon: <Code size={16} className="text-slate-300" />,
      action: () => { window.open('https://github.com/aaryaninvincible', '_blank'); onClose(); }
    },
    {
      id: 'soc-instagram',
      title: 'Visit Instagram (@codesworld.exe)',
      category: 'Socials',
      icon: <ExternalLink size={16} className="text-[#E1306C]" />,
      action: () => { window.open('https://www.instagram.com/codesworld.exe', '_blank'); onClose(); }
    },
    {
      id: 'soc-youtube',
      title: 'Visit YouTube Channel (@aryaninvincible78)',
      category: 'Socials',
      icon: <ExternalLink size={16} className="text-red-500" />,
      action: () => { window.open('https://youtube/@aryaninvincible78', '_blank'); onClose(); }
    }
  ];

  const filteredCommands = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      <div className="w-full max-w-xl glass border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(255,115,0,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-black/40">
          <Search size={18} className="text-primary shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-light placeholder-slate-500 font-mono text-sm outline-none"
            placeholder="Type a command or search... (Press ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-white/10 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors">
                    {cmd.icon}
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-light group-hover:text-primary transition-colors">
                      {cmd.title}
                    </p>
                    <p className="font-mono text-[10px] text-slate-500">
                      {cmd.category}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-500 group-hover:text-white transition-colors uppercase tracking-wider">
                  Jump ↵
                </span>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              No matching commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">Ctrl</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">K</kbd> to toggle</span>
          </div>
          <span className="text-primary font-bold">Cyber OS v3.0</span>
        </div>
      </div>
    </div>
  );
};
