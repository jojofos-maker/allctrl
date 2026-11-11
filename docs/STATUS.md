# Samlet status 15. oktober 2026

## Prioritet

Godkjent 9. oktober: timectrl først, jobctrl deretter, medctrl tredje. allctrl er felles ramme. Andre produkter beholdes på vent uten nye lanseringsløfter. Tidligere markeds- og prisantakelser er ikke validerte prognoser.

## Denne ukens leveranser

13. oktober: ny hjemmeside og 13 modulsider, grafikkpakker, lysere/fargerikt uttrykk, opprydding i gamle adresser, mockupbilder, Bak ctrl, tydelig LinkedIn, Jobb med meg, Umami, testinteresse og statusmerker.

14. oktober: timectrl-brukerveiledning med ekte skjermbilder. I produktrepoene er innlogging, dagsavslutning og lagring forbedret, og jobctrl fikk private arbeidsflater, CV-import, FINN-lenker og lysere tema.

15. oktober: jobctrl fikk blant annet frivillig arbeid, privat CV-arkiv, bevisforslag, bedriftsundersøkelser, språkvalg, intervjuavklaringer, enklere reise, automatisk forberedelse, kontakt/frister, ODT/PDF-eksport, forbedret vurderingsmotor og veiledet profilbygging.

Se full commitlogg i hvert repo. Ingen ny innlogget akseptansetest er gjennomført i denne dokumentasjonsrunden.

## Åpne kontroller

- jobctrl: faktisk innlogget profil, original stillingsannonse, før/etter-vurdering, PDF og ODT, profilguide og hele reisen på mobil.
- timectrl: fysisk mobiltest, hel arbeidsdag og faktisk levering/innhold i planlagt rapport og påminnelse. Eventuelle motstridende rapporter må avklares, ikke gis antatt årsak.
- Pilotkommunikasjon og LinkedIn-innlegg skal ikke omtales som sendt eller publisert uten bekreftelse.
- Underliggende grafikkdokumenter har fargeavvik. Avstem mot godkjent logosystem før en ny fargetabell fastsettes.
- medctrl: avgrens første brukerbehov og versjon før bygging.

## Dokumentasjonskontroll

AGENTS.md gjør dokumentasjon til del av hver vesentlige leveranse. En daglig dokumentasjonskontroll er opprettet i ChatGPT for kveldstid i Europe/Oslo. Den supplerer, men erstatter ikke, oppdateringer under arbeidet. Den kan bare kontrollere tilgjengelige kilder og må melde tilgangshindre. Endringslogger skal ikke brukes til å erklære tester eller produksjonsstatus uten bevis.

Se [leveransekatalog](LEVERANSER.md) og [endringslogg uke 42](ENDRINGSLOGG-2026-W42.md).

## stayctrl – avslutning av designøkt 11. november 2026

**Produktstatus:** Idé / konsept. Ikke en lansert eller fungerende app. Planlagt funksjon: digital hyttebok (tekst/bilder), praktisk hytteguide og deling med gjester/leietakere.

**Gjeldende nettsideleveranse:** v10-bildet `assets/mockups/stayctrl-mockup-v10.jpg` brukes i `index.html` og `stayctrl/index.html`, med speil i `website/`. Illustrasjonen er fotorealistisk og har redusert/bedre balansert overskrift og beskrivelse. Produktkortets nedre del er fremdeles eksisterende HTML/CSS, ikke en del av bildet. stayctrl er først i moduloversikten.

**Redigerbar kilde:** `assets/mockups/stayctrl-editable-v10.svg` (og `website/`-speil). SVG gir redigerbare overskrift-/beskrivelseslag; tekst og UI inne i de fotorealistiske mobil- og PC-mockupene er fortsatt rasterisert. Den skal derfor **ikke** omtales som en fullstendig lagdelt master for all typografi.

**Merkevare:** Egen mintfarge `#65E4BE`. `assets/logos/stayctrl-logo.svg` er AC-basert, med hytteikon. Bruk denne SVG-en som autoritativ logo; innbakte små skjermlogoer i fotoillustrasjonen er ikke bekreftet identiske. Se `docs/DESIGN-OG-PUBLISERING-STANDARD.md` for obligatorisk arbeidsmåte.

**Google Drive:** Eksisterende stayctrl-produktmappe, `02_design`: v10 JPG https://drive.google.com/file/d/151hlipf8h1yC98hIjkfHJRgdpB9JrJKB/view og v10 redigerbar SVG https://drive.google.com/file/d/16ZUGUmEFxJgO0-ufK_g-DtqR6cWn_rDq/view. Eldre v0.3–v0.8-design beholdes som historikk, ikke gjeldende nettsidebilde. AllCTRL-produktarket oppdateres separat.

**Verifisert:** Endringer i nettsidens fire HTML-filer ble commitet til `main`; siste nettsidecommit `e5bca404a1320ce70129b38c4ffe2bd5627329ed` fikk GitHub Pages workflow **success** 11.11.2026 (https://github.com/jojofos-maker/allctrl/actions/runs/43115422633). Dette bekrefter publiseringsjobben, ikke visuell godkjenning på iPhone.

**Åpne kvalitetskontroller / neste økt:** (1) Åpne faktisk offentlig forside og produktside på mobil, ta skjermbilder og sammenlign side-ved-side med jobctrl/timectrl; (2) kontroller bildets tekststørrelser, logo, kontrast og utsnitt ved mobilbredde; (3) om nødvendig erstatt rastertekst inne i mockupene med eksakte grafiske lag uten å miste fotorealismen; (4) bekreft sluttresultatet med bruker før designet markeres endelig godkjent. Ikke start ny bildeserie uten konkret avvik og referansemål.

**Øktstatus:** Arbeidet stanset etter brukerens ønske om kveldsavslutning. Ingen ytterligere utvikling er planlagt eller utført i bakgrunnen.
