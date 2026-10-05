'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AlertTriangle, ShieldAlert, FileSearch, CheckCircle2 } from 'lucide-react';

interface CandidateRow {
  id: string;
  name: string;
  email: string | null;
  raw_resume: string;
  created_at: string;
  screenings: {
    fit_score: number;
    fit_summary: string;
    has_integrity_flags: boolean;
    integrity_flags: Array<{
      type: 'MANIPULATION' | 'INCONSISTENCY' | 'INFLATION';
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      reason: string;
      snippet: string;
    }>;
  }[];
}

export function CandidateTable({ candidates }: { candidates: CandidateRow[] }) {
  const [selected, setSelected] = useState<CandidateRow | null>(null);

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50 border-b border-zinc-200">
            <TableRow>
              <TableHead className="w-[200px] text-xs font-semibold text-zinc-700">Candidate</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold text-zinc-700">Fit Score</TableHead>
              <TableHead className="text-xs font-semibold text-zinc-700">Integrity Screen</TableHead>
              <TableHead className="text-right text-xs font-semibold text-zinc-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-sm text-zinc-500">
                  No applicants screened for this role yet. Paste a resume above.
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((c) => {
                const screening = c.screenings?.[0];
                const score = screening?.fit_score ?? 0;
                const flags = screening?.integrity_flags ? typeof(screening.integrity_flags) === 'string' ? JSON.parse(screening.integrity_flags) : screening.integrity_flags : [];
                const hasFlags = flags.length > 0;
                console.log('Candidate:', c.name, 'Score:', score, 'Flags:', flags, hasFlags, screening);

                return (
                  <TableRow key={c.id} className="hover:bg-zinc-50/50">
                    <TableCell>
                      <div className="font-medium text-sm text-zinc-900">{c.name}</div>
                      <div className="text-xs text-zinc-500">{c.email || 'No email provided'}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        score >= 75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        score >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        {score} / 100
                      </span>
                    </TableCell>
                    <TableCell>
                      {hasFlags ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {flags.map((f, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`text-[11px] gap-1 px-1.5 py-0.5 font-normal ${
                                f.type === 'MANIPULATION'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : f.type === 'INCONSISTENCY'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              {f.type === 'MANIPULATION' && <ShieldAlert className="h-3 w-3" />}
                              {f.type === 'INCONSISTENCY' && <AlertTriangle className="h-3 w-3" />}
                              {f.type === 'INFLATION' && <FileSearch className="h-3 w-3" />}
                              {f.type}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-emerald-700 gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Clear</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-zinc-600 hover:text-zinc-900"
                        onClick={() => {
                          setSelected(c)
                        }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Slideout Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="border-b border-zinc-100 pb-4">
                <SheetTitle className="text-lg font-semibold text-zinc-900">
                  {selected.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-zinc-500">
                  Screening breakdown and integrity inspection log
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Fit Assessment Card */}
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                      Role Fit Assessment
                    </span>
                    <span className="text-sm font-bold text-zinc-900">
                      Score: {selected.screenings?.[0]?.fit_score}/100
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {selected.screenings?.[0]?.fit_summary}
                  </p>
                </div>

                {/* Integrity Log */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Pre-Scoring Integrity Findings ({selected.screenings?.[0]?.integrity_flags?.length || 0})
                  </h4>

                  {(!selected.screenings?.[0]?.integrity_flags || selected.screenings[0].integrity_flags.length === 0) ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      No prompt injections, timeline conflicts, or metric repetitions flagged.
                    </div>
                  ) : (
                    selected.screenings[0].integrity_flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                          flag.type === 'MANIPULATION'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : flag.type === 'INCONSISTENCY'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="tracking-wide">[{flag.type}] - {flag.severity} PRIORITY</span>
                        </div>
                        <p className="leading-normal">{flag.reason}</p>
                        {flag.snippet && (
                          <div className="p-2 bg-white/70 border border-black/5 rounded text-[11px] font-mono text-zinc-700">
                            &quot;{flag.snippet}&quot;
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Raw Resume Text */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Raw Candidate Resume
                  </h4>
                  <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-md text-xs whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                    {selected.raw_resume}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}