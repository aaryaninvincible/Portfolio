 import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Code, Cpu, Database, Server } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const InteractiveWidgets: React.FC = () => {
  const stats = [
    { label: 'Commits', value: '1.2k+', icon: <Code className="text-primary" /> },
    { label: 'Projects', value: '300+', icon: <Server className="text-secondary" /> },
    { label: 'Uptime', value: '99.9%', icon: <Activity className="text-accent" /> },
    { label: 'Databases', value: '12+', icon: <Database className="text-primary" /> },
  ];

  return (
    <section className="space-y-10">
      <div className="text-center space-y-4">
        <span className="section-kicker">Interactive Data</span>
        <h2 className="text-3xl md:text-5xl font-orbitron">Performance & Skills Infographics</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-6 text-center flex flex-col items-center justify-center gap-3 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full border border-white/10">
              {stat.icon}
            </div>
            <div className="text-2xl font-orbitron font-bold text-light">{stat.value}</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <GlassCard className="p-8">
          <h3 className="font-orbitron text-xl mb-6 text-primary flex items-center gap-2"><Cpu size={20} /> Tech Stack Distribution</h3>
          <div className="space-y-4">
            {[
              { name: 'Frontend (React/Tailwind)', pct: 90, color: 'bg-primary' },
              { name: 'Backend (Node/Python)', pct: 85, color: 'bg-secondary' },
              { name: 'Database (Mongo/Firebase)', pct: 75, color: 'bg-accent' },
              { name: 'DevOps & Cloud (AWS)', pct: 60, color: 'bg-primary/60' },
            ].map(skill => (
              <div key={skill.name}>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                  <span>{skill.name}</span>
                  <span>{skill.pct}%</span>
                </div>
                <div className="h-2 w-full bg-darker rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.pct}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${skill.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8 relative overflow-hidden flex flex-col justify-center">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Code size={120} />
           </div>
           <h3 className="font-orbitron text-2xl text-light mb-2 relative z-10">Continuous Integration</h3>
           <p className="text-sm text-slate-300 font-mono leading-relaxed mb-6 relative z-10">
             Automated workflows to build, test, and deploy code securely with seamless version control and rapid iterations.
           </p>
           <div className="flex gap-2 relative z-10">
             {[1, 2, 3, 4, 5].map(i => (
               <motion.div 
                 key={i}
                 animate={{ height: ['20px', '40px', '15px', '30px', '20px'] }}
                 transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                 className="w-4 bg-secondary rounded-t-sm opacity-80"
               />
             ))}
           </div>
        </GlassCard>
      </div>
    </section>
  );
};
