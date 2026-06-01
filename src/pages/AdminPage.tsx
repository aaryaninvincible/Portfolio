import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { Check, FileUp, Lock, LogIn, LogOut, Mail, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { auth } from '../lib/firebase';
import {
  deleteCertificate,
  deleteMessage,
  deleteProject,
  deleteRepoRequest,
  saveCertificate,
  saveProject,
  saveResume,
  subscribeToCertificates,
  subscribeToMessages,
  subscribeToProjects,
  subscribeToRepoRequests,
  updateMessage,
  updateRepoRequest,
  uploadAsset,
} from '../lib/realtime';
import type { Certificate, ContactMessage, PortfolioProject, RepoRequest } from '../types';

type AdminTab = 'messages' | 'requests' | 'projects' | 'certificates' | 'resume';

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'messages', label: 'Messages' },
  { id: 'requests', label: 'Repo Requests' },
  { id: 'projects', label: 'Projects' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'resume', label: 'Resume' },
];

const formatDate = (value?: number) => (value ? new Date(value).toLocaleString() : 'Just now');

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('aryanraikwar78@gmail.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<AdminTab>('messages');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [requests, setRequests] = useState<RepoRequest[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [busy, setBusy] = useState('');

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return undefined;

    const unsubMessages = subscribeToMessages(setMessages);
    const unsubRequests = subscribeToRepoRequests(setRequests);
    const unsubProjects = subscribeToProjects(setProjects);
    const unsubCertificates = subscribeToCertificates(setCertificates);

    return () => {
      unsubMessages();
      unsubRequests();
      unsubProjects();
      unsubCertificates();
    };
  }, [user]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setAuthError('Login failed. Create this admin user in Firebase Authentication or check password.');
    }
  };

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mediaFile = form.get('media') as File;
    setBusy('Saving project...');

    try {
      const mediaUrl = mediaFile?.size ? await uploadAsset('projects', mediaFile) : '';
      const mediaType = mediaFile?.type || '';
      await saveProject({
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        technologies: String(form.get('technologies') || '')
          .split(',')
          .map((tech) => tech.trim())
          .filter(Boolean),
        category: String(form.get('category') || 'Software'),
        useCase: String(form.get('useCase') || ''),
        demoUrl: String(form.get('demoUrl') || ''),
        imageUrl: mediaType.startsWith('image/') ? mediaUrl : '',
        videoUrl: mediaType.startsWith('video/') ? mediaUrl : '',
        featured: form.get('featured') === 'on',
        source: 'admin',
      });
      event.currentTarget.reset();
    } finally {
      setBusy('');
    }
  };

  const handleCertificateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get('certificate') as File;
    if (!file?.size) return;
    setBusy('Uploading certificate...');

    try {
      const imageUrl = await uploadAsset('certificates', file);
      await saveCertificate({
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        issuer: String(form.get('issuer') || ''),
        date: String(form.get('date') || ''),
        imageUrl,
      });
      event.currentTarget.reset();
    } finally {
      setBusy('');
    }
  };

  const handleResumeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get('resume') as File;
    if (!file?.size) return;
    setBusy('Uploading resume...');

    try {
      const fileUrl = await uploadAsset('resume', file);
      await saveResume({ title: String(form.get('title') || 'Aryan Raikwar Resume'), fileUrl });
      event.currentTarget.reset();
    } finally {
      setBusy('');
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <GlassCard className="w-full max-w-md p-10">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/50">
              <Lock className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-3xl font-orbitron font-bold text-light">
              Admin <span className="text-gradient">Access</span>
            </h1>
            <p className="text-sm font-mono text-slate-400">Firebase Auth protected dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <input className="input-shell" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" required />
            <input className="input-shell" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
            {authError && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{authError}</p>}
            <button type="submit" className="w-full glass text-primary border-primary/30 py-3 rounded-lg font-orbitron tracking-widest uppercase flex justify-center items-center gap-2">
              <LogIn size={18} /> Login
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="section-kicker">Admin panel</span>
          <h1 className="text-4xl font-orbitron font-black text-light">Portfolio Control Room</h1>
        </div>
        <button onClick={() => signOut(auth)} className="glass rounded-lg px-4 py-3 text-red-300 inline-flex items-center gap-2 self-start">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              tab === item.id ? 'bg-primary text-black' : 'glass text-light hover:text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {busy && <div className="glass rounded-lg p-4 text-primary">{busy}</div>}

      {tab === 'messages' && (
        <div className="grid gap-5">
          {messages.map((message) => (
            <GlassCard key={message.id} className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-orbitron text-xl text-primary">{message.name}</h2>
                  <p className="text-sm text-slate-400">{message.email} {message.phone ? `- ${message.phone}` : ''}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(message.createdAt)} - {message.topic}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{message.status || 'new'}</span>
              </div>
              <p className="mt-5 text-slate-300 whitespace-pre-wrap">{message.message}</p>
              <textarea
                className="input-shell mt-5 min-h-24"
                placeholder="Write reply note here..."
                defaultValue={message.reply || ''}
                onBlur={(event) => updateMessage(message.id, { reply: event.target.value })}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <a className="glass rounded-lg px-4 py-2 text-primary inline-flex items-center gap-2" href={`mailto:${message.email}?subject=Reply from Aryan Raikwar&body=${encodeURIComponent(message.reply || '')}`}>
                  <Mail size={16} /> Open Mail
                </a>
                <button className="glass rounded-lg px-4 py-2 text-accent inline-flex items-center gap-2" onClick={() => updateMessage(message.id, { status: 'replied' })}>
                  <Check size={16} /> Mark Replied
                </button>
                <button className="glass rounded-lg px-4 py-2 text-red-300 inline-flex items-center gap-2" onClick={() => deleteMessage(message.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </GlassCard>
          ))}
          {messages.length === 0 && <GlassCard className="p-8 text-center text-slate-300">No messages yet.</GlassCard>}
        </div>
      )}

      {tab === 'requests' && (
        <div className="grid gap-5">
          {requests.map((request) => (
            <GlassCard key={request.id} className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-orbitron text-xl text-accent">{request.projectTitle}</h2>
                  <p className="text-sm text-slate-400">{request.name} - {request.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(request.createdAt)}</p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">{request.status || 'pending'}</span>
              </div>
              <p className="mt-5 text-slate-300 whitespace-pre-wrap">{request.reason}</p>
              <textarea className="input-shell mt-5 min-h-24" placeholder="Decision/reply note..." defaultValue={request.reply || ''} onBlur={(event) => updateRepoRequest(request.id, { reply: event.target.value })} />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="glass rounded-lg px-4 py-2 text-accent" onClick={() => updateRepoRequest(request.id, { status: 'approved' })}>Approve</button>
                <button className="glass rounded-lg px-4 py-2 text-secondary" onClick={() => updateRepoRequest(request.id, { status: 'mailed' })}>Mark Mailed</button>
                <a className="glass rounded-lg px-4 py-2 text-primary inline-flex items-center gap-2" href={`mailto:${request.email}?subject=Repo access for ${encodeURIComponent(request.projectTitle)}&body=${encodeURIComponent(request.reply || 'Hi, your repo request has been reviewed.')}`}>
                  <Mail size={16} /> Mail User
                </a>
                <button className="glass rounded-lg px-4 py-2 text-red-300 inline-flex items-center gap-2" onClick={() => deleteRepoRequest(request.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </GlassCard>
          ))}
          {requests.length === 0 && <GlassCard className="p-8 text-center text-slate-300">No repo requests yet.</GlassCard>}
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6">
            <h2 className="font-orbitron text-2xl text-primary mb-5">Add Project</h2>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <input name="title" className="input-shell" placeholder="Project title" required />
              <textarea name="description" className="input-shell min-h-24" placeholder="Description" required />
              <input name="technologies" className="input-shell" placeholder="React, Firebase, AI/ML" required />
              <input name="category" className="input-shell" placeholder="Web, AI, IoT, BTech Project" required />
              <input name="useCase" className="input-shell" placeholder="Use case" />
              <input name="demoUrl" className="input-shell" placeholder="Demo URL optional" />
              <input name="media" className="input-shell" type="file" accept="image/*,video/*" />
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input name="featured" type="checkbox" className="h-4 w-4" /> Show as featured
              </label>
              <button className="glass rounded-lg px-5 py-3 text-primary font-bold inline-flex items-center gap-2">
                <Plus size={18} /> Save Project
              </button>
            </form>
          </GlassCard>
          <div className="grid gap-4">
            {projects.map((project) => (
              <GlassCard key={project.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-orbitron text-lg text-light">{project.title}</h3>
                  <p className="text-sm text-slate-400">{project.category} - {project.technologies?.join(', ')}</p>
                </div>
                {project.source !== 'github' && (
                  <button className="text-red-300" onClick={() => deleteProject(project.id)} aria-label={`Delete ${project.title}`}>
                    <Trash2 size={18} />
                  </button>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === 'certificates' && (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6">
            <h2 className="font-orbitron text-2xl text-primary mb-5">Upload Certificate</h2>
            <form onSubmit={handleCertificateSubmit} className="space-y-4">
              <input name="title" className="input-shell" placeholder="Certificate title" required />
              <input name="issuer" className="input-shell" placeholder="Issuer" />
              <input name="date" className="input-shell" placeholder="Date / year" />
              <textarea name="description" className="input-shell min-h-24" placeholder="Description" required />
              <input name="certificate" className="input-shell" type="file" accept="image/*" required />
              <button className="glass rounded-lg px-5 py-3 text-primary font-bold inline-flex items-center gap-2">
                <FileUp size={18} /> Upload Certificate
              </button>
            </form>
          </GlassCard>
          <div className="grid md:grid-cols-2 gap-4">
            {certificates.map((certificate) => (
              <GlassCard key={certificate.id} className="overflow-hidden">
                <img src={certificate.imageUrl} alt={certificate.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-orbitron text-primary">{certificate.title}</h3>
                  <button className="mt-3 text-red-300 inline-flex items-center gap-2" onClick={() => deleteCertificate(certificate.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === 'resume' && (
        <GlassCard className="p-6 max-w-2xl">
          <h2 className="font-orbitron text-2xl text-primary mb-5">Upload Resume PDF</h2>
          <form onSubmit={handleResumeSubmit} className="space-y-4">
            <input name="title" className="input-shell" placeholder="Resume title" defaultValue="Aryan Raikwar Resume" />
            <input name="resume" className="input-shell" type="file" accept="application/pdf" required />
            <button className="glass rounded-lg px-5 py-3 text-primary font-bold inline-flex items-center gap-2">
              <FileUp size={18} /> Upload Resume
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  );
};
