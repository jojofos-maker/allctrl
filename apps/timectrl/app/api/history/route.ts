import { authenticated } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
 const { client, user } = await authenticated();
 if (!user) return Response.json({ error: 'Du må være innlogget.' }, { status: 401 });
 const before = new URL(request.url).searchParams.get('before');
 if (before && !/^\d{4}-\d{2}-\d{2}$/.test(before)) return Response.json({ error: 'Ugyldig dato.' }, { status: 400 });
 let query = client.from('timectrl_history').select('date,state').eq('user_id', user.id).order('date', { ascending: false }).limit(31);
 if (before) query = query.lt('date', before);
 const { data, error } = await query;
 if (error) return Response.json({ error: 'Kunne ikke hente historikken.' }, { status: 503 });
 const days = data.slice(0, 30);
 return Response.json({ days: days.map(row => row.state), nextBefore: data.length > 30 ? days.at(-1)?.date : null }, { headers: { 'Cache-Control': 'private, no-store' } });
}
