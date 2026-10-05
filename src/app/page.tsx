import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CandidateTable } from '@/components/CandidateTable';
import { IntakeModal } from '@/components/IntakeModal';
import { KekaShell } from '@/components/KekaShell';
import { Users, ShieldAlert, CheckCircle, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const roles = await sql`SELECT * FROM roles ORDER BY created_at DESC LIMIT 1`;
  const activeRole = roles[0];

  let candidates: any[] = [];
  if (activeRole) {
    candidates = await sql`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.raw_resume,
        c.created_at,
        coalesce(
          json_agg(
            json_build_object(
              'fit_score', s.fit_score,
              'fit_summary', s.fit_summary,
              'has_integrity_flags', s.has_integrity_flags,
              'integrity_flags', s.integrity_flags
            )
          ) filter (where s.id is not null), '[]'
        ) as screenings
      FROM candidates c
      LEFT JOIN screenings s ON s.candidate_id = c.id
      WHERE c.role_id = ${activeRole.id}
      GROUP BY c.id
      ORDER BY coalesce(max(s.fit_score), 0) DESC, c.created_at DESC
    `;
  }


  candidates.forEach((c) => {
    if (c.screenings?.[0]?.integrity_flags) {
      c.screenings[0].integrity_flags = JSON.parse(c.screenings[0].integrity_flags);
    }
  });
  // Metrics computation for Keka-style overview cards
  const totalCount = candidates.length;
  const flaggedCount = candidates.filter((c) => c.screenings?.[0]?.has_integrity_flags).length;
  const highFitCount = candidates.filter((c) => (c.screenings?.[0]?.fit_score || 0) >= 75).length;

  return (
    <KekaShell
      userEmail={user.email}
      activeRoleTitle={activeRole?.title || 'General Requisition'}
    >
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {activeRole ? activeRole.title : 'Senior Full Stack Engineer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-normal">
            {activeRole?.description || 'Active role pipeline with automated adversarial filtering.'}
          </p>
        </div>

        {activeRole && <IntakeModal roleId={activeRole.id} />}
      </div>

      {/* Metrics Row (Keka Stat Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Applicants
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              Integrity Anomaly Flags
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-1">{flaggedCount}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              High Fit Matches (≥75)
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{highFitCount}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Candidate Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Ranked Candidate Pipeline
          </h2>
          <span className="text-[11px] text-slate-400">
            Ranked by Fit Score • Audited by Integrity Layer
          </span>
        </div>

        <CandidateTable candidates={candidates} />
      </div>
    </KekaShell>
  );
  
}