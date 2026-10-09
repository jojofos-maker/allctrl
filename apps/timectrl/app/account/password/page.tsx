'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Password() {
  const [password, setPassword] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  return <main className="login-shell"><h1>Velg nytt passord</h1><form className="login-form" onSubmit={async e => { e.preventDefault(); setBusy(true); const { error } = await supabaseBrowser().auth.updateUser({ password }); setMessage(error ? 'Kunne ikke endre passord. Åpne lenken i e-posten på nytt.' : 'Passordet er endret.'); setBusy(false); }}><label>Passord<input type="password" minLength={10} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required /></label><button className="primary" disabled={busy}>Lagre passord</button><p role="status">{message}</p><a href="/">Åpne timectrl</a></form></main>;
}
