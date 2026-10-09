# timectrl

Selvstendig Next.js-app for timeregistrering, med Supabase Auth og Postgres. Resend sender dagsrapporter. Den eksisterende ChatGPT Sites-appen beholdes under overgangen.

## Drift

Vercel-prosjektet bygger denne mappen. Sett variablene fra `.env.example` på Vercel. Supabase Auth må tillate appens `/auth/callback` i Redirect URLs. Tilpass SMTP for nye brukere før bred bruk. Kjør `npm ci`, `npm run typecheck`, `npm run build`.

## Dataoverføring

`timectrl_legacy_imports` tar imot sikkerhetskopier fra gammel app, med verifisert e-postadresse som nøkkel. Ved første innlogging kopieres brukerens egne dager til UUID-baserte tabeller med RLS. Eksisterende dager overskrives aldri av import. Automatisk rapport er av ved første import for å unngå dobbelt utsending mens gammel app fortsatt brukes. Slå av gammel rapport før den nye aktiveres.

Ny app har også nedlasting og import av egen sikkerhetskopi under `/transfer`. Bruk samme e-post som i gammel app. Kontroller prosjektantall, historikk, lagring og rapport før bytte av nettadresse.

## Begrensninger

Resend-planlegging oppdateres når appen lagrer. Dager uten bruk planlegges ikke. Innlogging, e-postbekreftelse og faktisk levering må testes med de to brukerne før overgang. Ny app starter tom hvis det ikke finnes en import for e-postadressen.
