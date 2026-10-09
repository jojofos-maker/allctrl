import { authenticated } from '@/lib/supabase/server';
import { stateSchema } from '@/lib/state-validation';
import { syncScheduledReport } from '@/lib/report-email';
export const dynamic = 'force-dynamic';
export async function GET() {
 const { client, user } = await authenticated();
 if (!user) return Response.json({ error: 'Du må være innlogget.' }, { status: 401 });
 const { error: seedError } = await client.rpc('timectrl_seed_legacy');
 if (seedError) return Response.json({ error: 'Kunne ikke hente historikken.' }, { status: 503 });
 const { data, error } = await client.from('timectrl_states').select('state').eq('user_id', user.id).maybeSingle();
 if (error) return Response.json({ error: 'Kunne ikke hente registreringen.' }, { status: 503 });
 return Response.json({ state: data?.state ?? null, userEmail: user.email }, { headers: { 'Cache-Control': 'private, no-store' } });
}
export async function PUT(request: Request) {
 const { client, user } = await authenticated();
 if (!user) return Response.json({ error: 'Du må være innlogget.' }, { status: 401 });
 if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Ugyldig forespørsel.' }, { status: 403 });
 try {
  const raw = await request.text();
  if (raw.length > 100000) return Response.json({ error: 'Registreringen er for stor.' }, { status: 413 });
  const state = stateSchema.parse(JSON.parse(raw));
  const { data: changed, error } = await client.rpc('timectrl_save_state', { new_state: state });
  if (error) throw error;
  if (!changed) return Response.json({ ok: true, stale: true });
  let report;
  try { report = await syncScheduledReport(user.id, state, client); }
  catch { report = { configured: true, scheduled: false, error: true }; }
  return Response.json({ ok: true, report });
 } catch { return Response.json({ error: 'Kunne ikke lagre registreringen.' }, { status: 400 }); }
}
