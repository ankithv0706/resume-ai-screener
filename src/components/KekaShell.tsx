'use client';

import { ReactNode } from 'react';
import { logoutAction } from '@/app/actions/auth';
import {
  Users,
  Briefcase,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface KekaShellProps {
  children: ReactNode;
  userEmail: string;
  activeRoleTitle: string;
}

export function KekaShell({ children, userEmail, activeRoleTitle }: KekaShellProps) {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* 1. Left Keka Navigation Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-6">
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
              K
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                Keka Hire
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Recruitment Hub</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 py-1">
              Recruitment
            </div>

            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
            >
              <Briefcase className="h-4 w-4 shrink-0 text-indigo-400"/>
              <span>Job Requisitions</span>
            </a>
          </nav>
        </div>

        {/* Recruiter Footnote & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase">
              {userEmail.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-slate-200 truncate">{userEmail}</div>
              <div className="text-[10px] text-slate-500">Recruitment Lead</div>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors border border-transparent hover:border-rose-900/30"
            >
              <LogOut className="h-3.5 w-3.5"/>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Hiring</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400"/>
            <span>Engineering</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400"/>
            <span className="font-semibold text-slate-800 truncate max-w-xs">{activeRoleTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini AI Screener Active
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}