import { authenticated } from '@/lib/supabase/server';
import { stateSchema, type StoredState } from '@/lib/state-validation';

export const dynamic = 'force-dynamic';
export async function GET() {
  const { client, user } = await authenticated();
  if (!user) return Response.json({ error: 'Du må være innlogget.' }, { status: 401 });
  const { data: current, error } = await client.from('timectrl_states').select('state').eq('user_id', user.id).maybeSingle();
  if (error) return Response.json({ error: 'Kunne ikke hente registreringen.' }, { status: 503 });
  const days: unknown[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from('timectrl_history').select('state').eq('user_id', user.id).order('date').range(offset, offset + 499);
    if (error) return Response.json({ error: 'Kunne ikke hente historikken.' }, { status: 503 });
    days.push(...data.map(row => row.state));
    if (data.length < 500) break;
  }
  return Response.json({ format: 'timectrl-backup-v1', email: user.email, state: current?.state ?? null, days }, { headers: { 'Cache-Control': 'private, no-store', 'Content-Disposition': 'attachment; filename="timectrl-backup.json"' } });
}

export async function POST(request: Request) {
  const { client, user } = await authenticated();
  if (!user) return Response.json({ error: 'Du må være innlogget.' }, { status: 401 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Ugyldig forespørsel.' }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 5000000) throw new Error('Too large');
    const backup = JSON.parse(raw);
    if (backup.format !== 'timectrl-backup-v1' || String(backup.email).toLowerCase() !== user.email?.toLowerCase() || !Array.isArray(backup.days) || backup.days.length > 10000) throw new Error('Invalid backup');
    const days: StoredState[] = backup.days.map((item: unknown) => stateSchema.parse(item));
    if (backup.state) days.push(stateSchema.parse(backup.state));
    // History import preserves existing rows. Current live state is never replaced.
    const unique = [...new Map(days.map(item => [item.date, item])).values()];
    for (let offset = 0; offset < unique.length; offset += 100) {
      const rows = unique.slice(offset, offset + 100).map(state => ({ user_id: user.id, date: state.date, state, updated_at: state.updatedAt }));
      const { error } = await client.from('timectrl_history').upsert(rows, { onConflict: 'user_id,date', ignoreDuplicates: true });
      if (error) throw error;
    }
    return Response.json({ ok: true, days: unique.length });
  } catch { return Response.json({ error: 'Kunne ikke importere. Bruk en sikkerhetskopi for samme e-postadresse.' }, { status: 400 }); }
}
