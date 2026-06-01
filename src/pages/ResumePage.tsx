import React, { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { subscribeToResume } from '../lib/realtime';
import type { ResumeProfile } from '../types';

export const ResumePage: React.FC = () => {
  const [resume, setResume] = useState<ResumeProfile | null>(null);

  useEffect(() => subscribeToResume(setResume), []);

  const resumeUrl = resume?.fileUrl || '/AryanRaikwarResume.pdf';

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-5">
        <span className="section-kicker">Resume</span>
        <h1 className="text-5xl font-orbitron font-black">
          Aryan Raikwar <span className="text-gradient">Resume</span>
        </h1>
        <p className="text-slate-300">View the latest resume directly here. Admin uploads will replace this file.</p>
        <a href={resumeUrl} target="_blank" rel="noreferrer" className="glass inline-flex items-center gap-2 rounded-lg px-5 py-3 text-primary font-bold">
          <Download size={18} /> Open / Download
        </a>
      </div>

      <GlassCard className="p-3 min-h-[70vh]">
        {resumeUrl ? (
          <iframe title="Aryan Raikwar resume" src={resumeUrl} className="h-[75vh] w-full rounded-lg bg-white" />
        ) : (
          <div className="flex min-h-[60vh] items-center justify-center text-center text-slate-300">
            <div>
              <FileText className="mx-auto mb-4 h-12 w-12 text-primary" />
              Resume will appear here after upload.
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
