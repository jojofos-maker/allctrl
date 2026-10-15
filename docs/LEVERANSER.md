# Leveransekatalog for allctrl

Oppdatert 15. oktober 2026. Filplasseringer kontrollert mot GitHub-treet. Eksistens betyr ikke at alle eksportfiler er visuelt kontrollert på nytt.

## Nettside og publisering

- www.allctrl.no — offentlig hjemmeside, GitHub Pages fra rot på main.
- index.html, style.css, script.js — hovedside og felles presentasjon.
- <modul>/index.html — 13 modulsider. Ikke opprett parallelle <modul>.html-filer i roten.
- CNAME — www.allctrl.no. 404.html — håndtering av gamle adresser.
- website/ — eksportgrunnlag som skal holdes i takt med nettsiden.
- personvern.html — personvern for hjemmesiden, ikke en generell erklæring for alle appene.

## Grafikk

- logos/v2/ og brand/svg/ — symbol, appikon, liggende logo og logo med navn under.
- brand/packages/<modul>.zip — 13 pakker med SVG, PNG, WebP, PDF og ikonstørrelser.
- brand/README.md og brand/packages/README.md — formatforklaring.
- brand/originals/ — uendrede opprinnelige PNG-er, beskrevet i grafikk-README.
- assets/mockups/<modul>-mockup-v1.webp og <modul>-mockup-768.webp — konseptbilder og nettvarianter.
- assets/mockups/allctrl-mockup-v3.webp og allctrl-mockup-v3-768.webp — nyere allctrl-bilde med modulene. Tidligere variant beholdt.
- assets/people/ — godkjent portrett og figur. Portrettet kan bare beskjæres/skaleres. Figuren beholder uttrykket.

Grafikkpakken beskriver PNG i 1024 piksler bredde, WebP opptil 512 piksler, RGB-vektor-PDF og ikoner i 512/192/180/32 piksler samt ICO i 16/32/48. SVG-originalene og pakkene er bekreftet som filer. RGB-PDF er ikke en ferdig CMYK-trykkfil. Opprinnelige fulloppløselige mockup-genereringer er rapportert lagret i designmapper i tidligere arbeid, men en eksakt originalmappe er ikke bekreftet i denne gjennomgangen. WebP-kopiene i repoet er bekreftet.

## Personside og kontakt

- johan/index.html — Bak ctrl og Jobb med meg.
- Synlig LinkedIn og kontakt via den besøkendes e-postprogram.
- Jeg vil teste på modulsider er en mailto-lenke, ikke et påmeldingssystem.

## Statistikk

- analytics.js og website/analytics.js — Umami-integrasjon.
- Dashboard https://cloud.umami.is/ — GitHub-innlogging, nettsted allctrl.
- Klikk er interessehendelser, ikke bevis på sendt e-post, nye brukere eller appaktivitet.

## Brukerveiledning

- timectrl/index.html#komigang — publisert guide.
- assets/screenshots/timectrl-login.webp, timectrl-nytt-prosjekt.webp og timectrl-autostopp.webp — tre skjermbilder.
- assets/screenshots/timectrl-veiledning-pc.jpg — arkivert veiledningsbilde.

## Produktkilder

- https://github.com/jojofos-maker/timectrl — README, tester, app og driftsovergang.
- https://github.com/jojofos-maker/jobctrl-alpha — README, tester, vurderingsmotor og dokumenteksport.
- https://github.com/jojofos-maker/allctrl — felles nettside, grafikk og dokumentasjonsoversikt.

## Intern hoveddokumentasjon

Samlet prosjektdokumentasjon ligger i ChatGPTs AllCTRL-mappe under navnet allctrl-prosjektdokumentasjon.docx, versjon 7 fra 15. oktober 2026. Den inneholder prosjektstatus, datert arbeidslogg, beslutninger, kilderegister, leveranser og åpne tester. Den interne filen skal versjonsoppdateres, ikke erstattes av nye dubletter. Den er ikke publisert som del av hjemmesiden. Hvis filen ikke kan finnes eller oppdateres, dokumenter dette som en blokkering. En eldre v6 fra 9. oktober beholdes som historikk.
