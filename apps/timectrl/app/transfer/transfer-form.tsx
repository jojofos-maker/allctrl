'use client';
import { useState } from 'react';
export function TransferForm() {
  const [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  return <form className="login-form" onSubmit={async e => {
    e.preventDefault(); if (!file) return; setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: await file.text() });
      const result = await response.json();
      setMessage(response.ok ? `Import fullført. ${result.days} dager kontrollert. Eksisterende dager beholdes.` : result.error);
    } catch { setMessage('Kunne ikke importere. Prøv igjen.'); }
    finally { setBusy(false); }
  }}><label>Importer historikk<input type="file" accept="application/json,.json" onChange={e => setFile(e.target.files?.[0] ?? null)} required /></label><button className="primary" disabled={busy || !file}>{busy ? 'Importerer …' : 'Importer sikkerhetskopi'}</button><p role="status">{message}</p></form>;
}
