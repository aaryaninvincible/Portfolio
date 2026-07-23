import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { submitContactMessage } from '../lib/realtime';

export const ContactPage: React.FC = () => {
  const [contactStatus, setContactStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setContactStatus('Sending...');
    await submitContactMessage({
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      topic: String(form.get('topic') || 'General inquiry'),
      message: String(form.get('message') || ''),
    });
    event.currentTarget.reset();
    setContactStatus('Message received. Aryan will reply soon.');
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12 min-h-screen">
      <div className="text-center space-y-4">
        <span className="section-kicker">Get in Touch</span>
        <h1 className="text-4xl md:text-6xl font-orbitron font-black text-light drop-shadow-[0_0_10px_rgba(255,115,0,0.7)]">
          Contact <span className="text-gradient">Aryan</span>
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto font-mono text-lg leading-relaxed">
          Whether you want a custom project, BTech/MTech help, freelancing services, or repo access, drop a message below.
        </p>
      </div>

      <GlassCard className="p-8 md:p-12 max-w-2xl mx-auto">
        <h2 className="font-orbitron text-3xl mb-6">Send a Message</h2>
        <form onSubmit={handleContact} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input name="name" className="input-shell w-full" placeholder="Your name" required />
            <input name="email" type="email" className="input-shell w-full" placeholder="Email address" required />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <input name="phone" className="input-shell w-full" placeholder="Phone / WhatsApp (optional)" />
            <select name="topic" className="input-shell w-full bg-black/50 text-slate-300 cursor-pointer" required defaultValue="">
              <option value="" disabled>Select a Topic</option>
              <option value="Request a Custom Project">Request a Custom Project</option>
              <option value="Request Repo Access">Request Repo Access</option>
              <option value="Freelancing / BTech / MTech Help">Freelancing / BTech / MTech Help</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          <textarea 
            name="message" 
            className="input-shell w-full min-h-[150px]" 
            placeholder="Tell me what you want to build, or which repo you need access to..." 
            required 
          />
          
          <button className="glass w-full px-5 py-4 rounded-lg text-primary font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-lg" type="submit">
            <Rocket size={20} /> Send Message
          </button>
          
          {contactStatus && (
            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-primary font-bold">{contactStatus}</p>
            </div>
          )}
        </form>
      </GlassCard>
    </div>
  );
};
