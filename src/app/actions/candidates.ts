'use server';

import { sql } from '@/lib/db';
import { processResume } from '@/lib/gemini/screener';
import { revalidatePath } from 'next/cache';

export async function addCandidateAction(formData: FormData) {
  const roleId = formData.get('roleId') as string;
  const name = formData.get('name') as string;
  const email = (formData.get('email') as string) || null;
  const rawResume = formData.get('rawResume') as string;

  if (!roleId || !name || !rawResume) {
    throw new Error('Role ID, Name, and Resume text are required.');
  }

  // 1. Fetch role requirements
  const roles = await sql`
    select title, must_haves from roles where id = ${roleId}
  `;

  if (roles.length === 0) {
    throw new Error('Role not found.');
  }

  const role = roles[0];

  // 2. Insert candidate
  const candidateResult = await sql`
    insert into candidates (role_id, name, email, raw_resume)
    values (${roleId}, ${name}, ${email}, ${rawResume})
    returning id
  `;
  const candidateId = candidateResult[0].id;

  // 3. Run dual-stage integrity + scoring engine
  const screening = await processResume(rawResume, role.title, role.must_haves);
  console.log('Screening result for candidate', candidateId, ':', screening);   

  // 4. Save screening report
  await sql`
    insert into screenings (
      candidate_id,
      fit_score,
      fit_summary,
      has_integrity_flags,
      integrity_flags
    ) values (
      ${candidateId},
      ${screening.fitScore},
      ${screening.fitSummary},
      ${screening.hasIntegrityFlags},
      ${JSON.stringify(screening.integrityFlags)}
    )
  `;

  revalidatePath('/');
  return { success: true, candidateId };
}