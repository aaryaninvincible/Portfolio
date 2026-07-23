import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Send } from 'lucide-react';

interface CyberTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CyberTerminalModal: React.FC<CyberTerminalModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ cmd?: string; output: string | React.ReactNode; isMatrix?: boolean }>>([
    {
      output: (
        <div>
          <p className="text-primary font-bold">CYBER OS v3.0 [CLI TERMINAL INTERFACE]</p>
          <p className="text-slate-400 text-xs mt-1">Type <span className="text-accent font-bold">help</span> to list all available commands.</p>
        </div>
      )
    }
  ]);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const cmd = trimmed.toLowerCase();
    let response: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        response = (
          <div className="space-y-1 text-slate-300 text-xs">
            <p className="text-primary font-bold">AVAILABLE COMMANDS:</p>
            <p><span className="text-accent font-bold">whoami</span> - Developer bio & core stack</p>
            <p><span className="text-accent font-bold">skills</span> - Categorized technical skills</p>
            <p><span className="text-accent font-bold">projects</span> - View flagship builds</p>
            <p><span className="text-accent font-bold">contact</span> - Contact info & social links</p>
            <p><span className="text-accent font-bold">matrix</span> - Toggle retro green matrix theme</p>
            <p><span className="text-accent font-bold">quote</span> - Print a tech quote</p>
            <p><span className="text-accent font-bold">clear</span> - Clear terminal history</p>
            <p><span className="text-accent font-bold">sudo</span> - Secret admin access test</p>
          </div>
        );
        break;
      case 'whoami':
        response = (
          <div className="text-xs text-slate-300 space-y-1">
            <p className="text-primary font-bold">NAME: Aryan Raikwar (@aaryaninvincible)</p>
            <p>ROLE: Full Stack Developer & AI/ML Engineer</p>
            <p>FOCUS: WebGL, Three.js, React, Node.js, Python, Firebase, Machine Learning</p>
            <p className="text-slate-400 italic">"Building digital experiences that WOW."</p>
          </div>
        );
        break;
      case 'skills':
        response = (
          <div className="text-xs text-slate-300 space-y-2">
            <p className="text-primary font-bold">TECHNICAL SKILLS MATRIX:</p>
            <p><span className="text-secondary">Frontend:</span> React, Next.js, Vite, TypeScript, Tailwind, WebGL, Three.js</p>
            <p><span className="text-secondary">Backend:</span> Node.js, Express, Python, FastAPI, Flask, PHP, REST APIs</p>
            <p><span className="text-secondary">Databases:</span> MongoDB, PostgreSQL, Firebase Realtime/Firestore, MySQL, Redis</p>
            <p><span className="text-secondary">AI/ML:</span> PyTorch, TensorFlow, OpenAI API, Gemini API, LLMs & RAG</p>
          </div>
        );
        break;
      case 'projects':
        response = (
          <div className="text-xs text-slate-300 space-y-1">
            <p className="text-primary font-bold">FEATURED FLAGSHIP BUILDS:</p>
            <p>1. <span className="text-white font-bold">Synapse AI Canvas</span> - Node-based AI workflow editor</p>
            <p>2. <span className="text-white font-bold">E-Challan Traffic AI</span> - ANPR license plate recognition</p>
            <p>3. <span className="text-white font-bold">AI Fitness Pose Tracker</span> - Realtime posture analyzer</p>
            <p className="text-slate-400">Visit /all-work to view all live demos.</p>
          </div>
        );
        break;
      case 'contact':
        response = (
          <div className="text-xs text-slate-300 space-y-1">
            <p className="text-primary font-bold">CONTACT CHANNELS:</p>
            <p>Email: <a href="mailto:aryanraikwar78@gmail.com" className="text-primary underline">aryanraikwar78@gmail.com</a></p>
            <p>Instagram: <span className="text-[#E1306C]">@codesworld.exe (13K+ Followers)</span></p>
            <p>YouTube: <span className="text-red-500">@aryaninvincible78 (Valorant Gaming)</span></p>
            <p>GitHub: <span className="text-white font-bold">@aaryaninvincible</span></p>
          </div>
        );
        break;
      case 'matrix':
        setIsMatrixMode(!isMatrixMode);
        response = <p className="text-emerald-400 font-bold">Matrix terminal effect toggled: {!isMatrixMode ? 'ENABLED' : 'DISABLED'}</p>;
        break;
      case 'quote':
        const quotes = [
          '"First, solve the problem. Then, write the code." – John Johnson',
          '"Simplicity is prerequisite for reliability." – Edsger W. Dijkstra',
          '"Make it work, make it right, make it fast." – Kent Beck',
          '"The stars are the street lights of eternity."'
        ];
        response = <p className="text-accent italic">{quotes[Math.floor(Math.random() * quotes.length)]}</p>;
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'sudo':
        response = <p className="text-red-500 font-bold">PERMISSION DENIED: Nice try! Admin privileges require valid security passkey.</p>;
        break;
      default:
        response = <p className="text-red-400">Command not recognized: "{cmd}". Type <span className="text-white font-bold">help</span> for available commands.</p>;
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output: response }]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl h-[480px] glass border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] flex flex-col overflow-hidden font-mono text-xs ${isMatrixMode ? 'text-emerald-400 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : ''}`}>
        {/* Terminal Header Bar */}
        <div className="px-4 py-3 bg-black/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <TerminalIcon size={14} className="text-primary" /> bash - cyber@aryan-portfolio:~
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Output Screen */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/90">
          {history.map((h, i) => (
            <div key={i} className="space-y-1">
              {h.cmd && (
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span>cyber@aryan:~$</span>
                  <span className="text-white">{h.cmd}</span>
                </div>
              )}
              <div className="pl-3">{h.output}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Form */}
        <form onSubmit={handleCommandSubmit} className="p-3 bg-black/95 border-t border-white/10 flex items-center gap-2">
          <span className="text-primary font-bold pl-2">cyber@aryan:~$</span>
          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-slate-600 outline-none font-mono text-xs"
            placeholder="Type 'help', 'skills', 'projects', 'contact'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="p-2 bg-primary text-black rounded-lg hover:opacity-90 font-bold transition-all">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
