# A08 – domenekontroll 17. oktober 2026

## Omfang og kilde

Gren: agent/public-domain-check-20261017. Fersk main/base e5803d361a5fa9345ac4dbc3be4a7cd467f0ca52. AGENTS, README og alle tre eksisterende docs-filer er hentet på nytt fra eksakt SHA og lest. Repoets åpne PR-er og grener ble kontrollert; ingen åpen allctrl-PR. Ingen tidligere arbeidsmappe gjenbrukt. Andre repoers PR-er og reserverte oppgaver berøres ikke.

Tillegg: scripts/check-public-domain.mjs, tests/public-domain.test.mjs, denne loggen, README og STATUS. Ingen nettsidefiler, grafikk, produksjonskonfigurasjon eller avhengigheter endres. Bruk bare Node innebygde moduler; installasjon/typecheck/bygg er ikke relevant for dette isolerte JavaScript-verktøyet.

## Faktiske kommandoer

- node --version → v24.19.0, exit 0.
- node --test tests/public-domain.test.mjs → exit 0; 12/12 bestod.
- node --check scripts/check-public-domain.mjs → exit 0.
- node --check tests/public-domain.test.mjs → exit 0.
- node scripts/check-public-domain.mjs timectrl.allctrl.no www.allctrl.no allctrl.no → exit 2 (uavklart).
- Innledende node:dns promises.lookup('timectrl.allctrl.no', {all:true}) → EAI_AGAIN, exit 1.

Livekontroll startet 2026-10-17T12:23:11Z (14:23:11 Europe/Oslo):

| Domene | Direkte A/AAAA/CNAME | HTTPS HEAD | Konklusjon |
| --- | --- | --- | --- |
| timectrl.allctrl.no | ECONNREFUSED | CHECK_TIMEOUT | Uavklart fra dette miljøet |
| www.allctrl.no | ECONNREFUSED | 200, TLS autorisert | HTTPS tilgjengelig; separat DNS ikke verifisert |
| allctrl.no | ECONNREFUSED | 301, TLS autorisert | Omdirigering observert, ikke fulgt |

En DNS-feil i miljøet er ikke bevis på feil på domenet. HTTPS bruker systemets oppslag; direkte DNS bruker Node Resolver, og disse kan ha ulik nettverkstilgang. Ingen IP-er eller leverandørkobling ble bekreftet av direkte DNS. Redirectmålet er ikke inspisert. HEAD og TLS er ikke funksjonstest av app, innlogging eller lagring.

## Tester og sikkerhet

Faste tillatte domener; vilkårlige URL-er avvises før nettverkskall. Kun offentlig DNS og HTTPS HEAD uten credentials, cookies eller response body. TLS-validering er på, ingen redirects følges. Tidsgrense gjelder selve probe-resultatet; systemets pågående DNS-oppslag kan forsinke prosessens avslutning. Ingen sikkerhetsinnstillinger endres. Feil logger bare kode, ikke rå debugmeldinger.

De 12 testene injiserer DNS/HTTPS-resultater og dekker bekreftet suksess, DNS-usikkerhet, uavhengig HTTPS ved DNS-feil, 301/401/403/405/500, uverifisert TLS, timeout, domeneliste og timeoutvalidering. De beviser klassifiseringslogikken, ikke offentlig DNS eller ekte transportfeil. Faktisk transport er kun observert i livekontrollen over.

## Neste handling og begrensninger

A08 forblir påbegynt. Kontroller direkte offentlig DNS og timectrl HTTPS fra et miljø med tillatt nettverk; ikke omgå tilgangsbegrensninger. Avklar deretter e-post-, backup- og hendelsesansvar i eksisterende driftsstruktur. Ingen DNS-endring, e-post, produksjonsdataendring, merge, publisering eller ny kostnad. Verktøyet er ikke koblet til Kontrollrom eller en ny automatisk jobb. Ingen endring i produktets beta-status. Privat hoveddokumentasjon/Library er ikke oppdatert av denne avgrensede leveransen; eksisterende Drive-kø, register og systemkart oppdateres med commit/PR ved avslutning.
