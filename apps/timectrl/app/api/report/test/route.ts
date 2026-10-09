import { authenticated } from '@/lib/supabase/server';
import { stateSchema } from '@/lib/state-validation';
import { sendTestReport } from '@/lib/report-email';
export async function POST(request: Request) {
 const { user } = await authenticated();
 if (!user) return Response.json({ error: 'Du må være innlogget.' }, { status: 401 });
 if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Ugyldig forespørsel.' }, { status: 403 });
 try {
  const raw = await request.text();
  if (raw.length > 100000) return Response.json({ error: 'Registreringen er for stor.' }, { status: 413 });
  const state = stateSchema.parse(JSON.parse(raw));
  await sendTestReport(state);
  return Response.json({ ok: true });
 } catch { return Response.json({ error: 'Kunne ikke sende testrapporten.' }, { status: 503 }); }
}
