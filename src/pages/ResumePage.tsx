import React, { useEffect, useState } from 'react';
import { Download, FileText, Maximize2 } from 'lucide-react';
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

      <GlassCard className="p-3 min-h-[70vh]" disableTilt>
        {resumeUrl ? (
          <div className="overflow-hidden rounded-lg bg-white">
            <object data={`${resumeUrl}#toolbar=0&navpanes=0`} type="application/pdf" className="hidden h-[78vh] w-full md:block">
              <div className="flex min-h-[60vh] items-center justify-center p-6 text-center text-slate-900">
                <div>
                  <FileText className="mx-auto mb-4 h-12 w-12" />
                  PDF preview is not supported in this browser.
                </div>
              </div>
            </object>
            <div className="flex min-h-[55vh] items-center justify-center p-6 text-center text-slate-900 md:hidden">
              <div>
                <FileText className="mx-auto mb-4 h-12 w-12" />
                <p className="mb-5 font-bold">Resume preview opens best in full screen on mobile.</p>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-white">
                  <Maximize2 size={18} /> Open Resume
                </a>
              </div>
            </div>
          </div>
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
