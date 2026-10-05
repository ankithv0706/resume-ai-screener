'use client';

import { useState } from 'react';
import { loginAction, registerAction } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = isRegistering
      ? await registerAction(formData)
      : await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] p-4 text-[#0F172A]">
      {/* Brand Header */}
      <div className="w-full max-w-sm mb-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-xs">
          K
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Smart Hire
        </h1>
        <p className="text-xs text-slate-500">
          Candidate Screener & Pre-Scoring Integrity Portal
        </p>
      </div>

      {/* Main Keka Auth Card */}
      <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isRegistering ? 'New Recruiter Sign Up' : 'Recruiter Sign In'}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            <ShieldCheck className="h-3 w-3 text-indigo-600" />
            AI Guarded
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                name="email"
                type="email"
                required
                placeholder="recruiter@company.com"
                className="pl-8 h-9 text-xs border-slate-200 rounded-md focus-visible:ring-1 focus-visible:ring-indigo-600 bg-white shadow-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                name="password"
                type="password"
                required
                placeholder="••••••••••••"
                className="pl-8 h-9 text-xs border-slate-200 rounded-md focus-visible:ring-1 focus-visible:ring-indigo-600 bg-white shadow-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors cursor-pointer shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Processing...
              </>
            ) : isRegistering ? (
              'Create Recruiter Account'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsRegistering(!isRegistering);
            }}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
          >
            {isRegistering
              ? 'Already registered? Sign in here'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>

      {/* Subtle footer */}
      <div className="mt-6 text-center text-[11px] text-slate-400">
        Connected to PostgreSQL Localhost • Gemini Anomaly Engine
      </div>
    </div>
  );
}