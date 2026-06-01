import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Code, ExternalLink, Github, Link as LinkIcon, Trophy, Youtube } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    commits?: Array<{ message?: string; sha?: string }>;
  };
};

const STATIC_UPDATES = [
  {
    id: 1,
    type: 'project',
    title: 'Portfolio upgraded with Firebase admin workflows',
    date: 'June 2026',
    content: 'Added Firebase-powered contact messages, repo access requests, admin project uploads, certificates, resume view, analytics, and private-by-request repository flow.',
    tags: ['Firebase', 'Admin Panel', 'Portfolio', 'Vercel'],
    links: [{ text: 'Ask For Repo', url: '/#repo-request', type: 'primary' }],
  },
  {
    id: 2,
    type: 'achievement',
    title: 'LinkedIn certifications added',
    date: 'June 2026',
    content: 'Certifications from Aryan Raikwar LinkedIn profile are now reflected in the portfolio certificate section.',
    tags: ['LinkedIn', 'Certificates', 'Profile'],
    links: [{ text: 'View LinkedIn', url: 'https://www.linkedin.com/in/aryanraikwar', type: 'secondary' }],
  },
  {
    id: 3,
    type: 'project',
    title: 'Ouranos Robotics E-commerce Store',
    date: 'December 2024',
    content: 'Shopify-based e-commerce solution with custom IoT-related service positioning and responsive storefront work.',
    tags: ['Shopify', 'E-commerce', 'IoT', 'JavaScript'],
    links: [{ text: 'Visit Store', url: 'https://shop.ouranosrobotics.com', type: 'primary' }],
  },
  {
    id: 4,
    type: 'youtube',
    title: '@codesworld.exe tech content',
    date: 'Ongoing',
    content: 'Coding tutorials, project showcases, AI/ML, web development, and developer education content.',
    tags: ['Content', 'Tutorials', 'Full Stack'],
    links: [{ text: 'Watch Channel', url: 'https://youtube.com/@codesworld.exe', type: 'youtube' }],
  },
];

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'project':
      return { icon: <Code className="w-5 h-5" />, color: 'text-primary', borderColor: 'border-primary', bgColor: 'bg-primary/10' };
    case 'youtube':
      return { icon: <Youtube className="w-5 h-5" />, color: 'text-[#FF0000]', borderColor: 'border-[#FF0000]', bgColor: 'bg-[#FF0000]/10' };
    case 'github':
      return { icon: <Github className="w-5 h-5" />, color: 'text-[#6cc644]', borderColor: 'border-[#6cc644]', bgColor: 'bg-[#6cc644]/10' };
    case 'achievement':
      return { icon: <Trophy className="w-5 h-5" />, color: 'text-[#FFD700]', borderColor: 'border-[#FFD700]', bgColor: 'bg-[#FFD700]/10' };
    default:
      return { icon: <LinkIcon className="w-5 h-5" />, color: 'text-secondary', borderColor: 'border-secondary', bgColor: 'bg-secondary/10' };
  }
};

const describeEvent = (event: GitHubEvent) => {
  const repoName = event.repo.name.split('/')[1] || event.repo.name;
  if (event.type === 'PushEvent') {
    const commitCount = event.payload.commits?.length || 0;
    const message = event.payload.commits?.[0]?.message || 'Updated project files';
    return {
      title: `Updated ${repoName}`,
      body: `${commitCount || 1} commit${commitCount === 1 ? '' : 's'} pushed. Latest note: "${message}"`,
    };
  }

  if (event.type === 'CreateEvent') {
    return {
      title: `Created ${event.payload.ref_type || 'item'} in ${repoName}`,
      body: event.payload.ref ? `New ${event.payload.ref_type}: ${event.payload.ref}` : 'New GitHub activity detected.',
    };
  }

  return {
    title: `${event.type.replace('Event', '')} on ${repoName}`,
    body: 'New GitHub activity detected on Aryan Raikwar GitHub.',
  };
};

export const UpdatesPage: React.FC = () => {
  const [githubEvents, setGithubEvents] = useState<GitHubEvent[]>([]);
  const [status, setStatus] = useState('Checking GitHub updates...');

  useEffect(() => {
    const fetchGithub = async () => {
      try {
        const response = await fetch('https://api.github.com/users/aaryaninvincible/events/public');
        if (!response.ok) {
          setStatus('GitHub update feed is temporarily unavailable.');
          return;
        }
        const events = (await response.json()) as GitHubEvent[];
        setGithubEvents(events.filter((event) => ['PushEvent', 'CreateEvent', 'ReleaseEvent'].includes(event.type)).slice(0, 8));
        setStatus('Live GitHub activity loaded.');
      } catch {
        setStatus('GitHub update feed is temporarily unavailable.');
      }
    };

    fetchGithub();
    const interval = window.setInterval(fetchGithub, 1000 * 60 * 5);
    return () => window.clearInterval(interval);
  }, []);

  const latestNotifications = useMemo(
    () =>
      githubEvents.slice(0, 3).map((event) => {
        const description = describeEvent(event);
        return { id: event.id, ...description, date: event.created_at };
      }),
    [githubEvents],
  );

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-14">
      <div className="text-center space-y-6">
        <span className="section-kicker">Live notifications</span>
        <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-light">
          Latest <span className="text-gradient">Updates</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 font-mono">
          GitHub activity refreshes automatically, so new public pushes appear here without editing the site.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {latestNotifications.map((notification) => (
          <GlassCard key={notification.id} className="p-5" disableTilt>
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Bell size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">GitHub</span>
            </div>
            <h2 className="font-orbitron text-lg text-light">{notification.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{notification.body}</p>
            <p className="mt-4 text-xs text-slate-500">{new Date(notification.date).toLocaleString()}</p>
          </GlassCard>
        ))}
        {latestNotifications.length === 0 && (
          <GlassCard className="p-6 text-center text-slate-300 md:col-span-3" disableTilt>
            {status}
          </GlassCard>
        )}
      </div>

      <div className="relative border-l border-white/10 pl-5 sm:pl-8 space-y-10">
        {githubEvents.map((event) => {
          const config = getTypeConfig('github');
          const description = describeEvent(event);
          return (
            <div key={event.id} className="relative">
              <div className="absolute -left-[30px] sm:-left-[41px] top-6 w-5 h-5 rounded-full bg-[#6cc644] border-4 border-darker shadow-[0_0_10px_#6cc644]" />
              <GlassCard className="p-5 sm:p-8 border-[#6cc644]/30" disableTilt>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                  <span className="px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase bg-[#6cc644]/10 text-[#6cc644] self-start">
                    GitHub Live
                  </span>
                  <span className="text-slate-400 font-mono text-sm">{new Date(event.created_at).toLocaleString()}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-orbitron text-light font-bold mb-4 flex items-center gap-3">
                  <span className={config.color}>{config.icon}</span>
                  {description.title}
                </h3>
                <p className="text-slate-300 font-mono text-sm leading-relaxed">{description.body}</p>
                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/5 pt-5">
                  <a href="/#repo-request" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-sm font-bold uppercase bg-primary text-dark">
                    Ask For Repo <ExternalLink size={16} />
                  </a>
                  <span className="inline-flex items-center rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400">
                    Repo access is private by request
                  </span>
                </div>
              </GlassCard>
            </div>
          );
        })}

        {STATIC_UPDATES.map((update) => {
          const config = getTypeConfig(update.type);
          return (
            <div key={update.id} className="relative">
              <div className={`absolute -left-[30px] sm:-left-[41px] top-6 w-5 h-5 rounded-full ${config.bgColor} border-4 border-darker ${config.color}`} />
              <GlassCard className={`p-5 sm:p-8 border-l-4 ${config.borderColor}`} disableTilt>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase ${config.bgColor} ${config.color} self-start`}>
                    {update.type}
                  </span>
                  <span className="text-slate-400 font-mono text-sm">{update.date}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-orbitron text-light font-bold mb-4 flex items-center gap-3">
                  <span className={config.color}>{config.icon}</span>
                  {update.title}
                </h3>
                <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{update.content}</p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {update.tags.map((tag) => (
                    <span key={tag} className={`text-xs font-mono px-3 py-1 rounded-full ${config.bgColor} ${config.color} border border-current/20`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-6 border-t border-white/5 pt-6">
                  {update.links.map((link) => (
                    <a key={link.text} href={link.url} target={link.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-sm font-bold uppercase glass text-light hover:text-primary">
                      {link.text} <ExternalLink size={16} />
                    </a>
                  ))}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};
