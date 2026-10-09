import { authenticated } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';
export default async function Login() {
  const { user } = await authenticated();
  if (user) redirect('/');
  return <main className="login-shell"><img src="/timectrl-logo.svg" alt="timectrl" width="260" height="100" /><p className="login-family">en del av allctrl</p><h1>Tiden din. På ett sted.</h1><p>Logg inn med e-post og passord.</p><LoginForm /></main>;
}
