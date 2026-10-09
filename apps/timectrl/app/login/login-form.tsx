'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export function LoginForm() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const router = useRouter();
  return <form className="login-form" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const client = supabaseBrowser();
    try {
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/auth/callback?next=/account/password` });
        if (error) throw error;
        setMessage('Se etter en e-post med lenke for å velge nytt passord.');
      } else if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
        if (error) throw error;
        if (data.session) { router.replace('/'); router.refresh(); }
        else setMessage('Bekreft e-postadressen med lenken du får på e-post.');
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace('/'); router.refresh();
      }
    } catch { setMessage(mode === 'login' ? 'Kunne ikke logge inn. Kontroller e-post, passord og at e-postadressen er bekreftet.' : 'Kunne ikke fullføre. Prøv igjen litt senere.'); }
    finally { setBusy(false); }
  }}>
    <label>E-post<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
    {mode !== 'reset' && <label>Passord<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 10 : 1} value={password} onChange={e => setPassword(e.target.value)} required /></label>}
    {message && <p role="status">{message}</p>}
    <button className="primary" disabled={busy}>{busy ? 'Et øyeblikk …' : mode === 'signup' ? 'Opprett konto' : mode === 'reset' ? 'Send passordlenke' : 'Logg inn'}</button>
    <div className="login-links"><button type="button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Opprett konto' : 'Tilbake til innlogging'}</button>{mode === 'login' && <button type="button" disabled={busy} onClick={() => { setMode('reset'); setMessage(''); }}>Glemt passord</button>}</div>
  </form>;
}
