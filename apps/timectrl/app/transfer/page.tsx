import { authenticated } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TransferForm } from './transfer-form';
export const dynamic = 'force-dynamic';
export default async function Transfer() {
  const { user } = await authenticated();
  if (!user) redirect('/login');
  return <main className="login-shell"><img src="/timectrl-logo.svg" alt="timectrl" width="220" height="85" /><h1>Historikk og sikkerhetskopi</h1><p>Innlogget som {user.email}</p><div className="transfer-note">Bruk dagens app til dataoverføringen er kontrollert. Automatisk rapport må slås av i den gamle appen før den aktiveres her.</div><a href="/api/backup">Last ned sikkerhetskopi</a><TransferForm /><p><a href="/">Tilbake til timectrl</a></p></main>;
}
