# allctrl

Offentlig hjemmeside for ctrl-universet på https://www.allctrl.no/. GitHub Pages publiserer repositoryets rot fra main.

Hver modul har én side i `<modul>/index.html`. Ikke legg tilbake `<modul>.html` i roten. GitHub Pages kan ellers levere en annen versjon på adressen uten avsluttende skråstrek. Gamle .html-bokmerker håndteres av 404.html. Tidligere sider bevares i Git-historikken, ikke som offentlig HTML.

`website/` er et synkronisert eksportgrunnlag. `brand/` inneholder logoer og eksportpakker. Produktideer merkes som under utvikling. Timectrl lenker til den offentlige appadressen https://timectrl-taupe.vercel.app/. Personvernsiden gjelder hjemmesiden.

## Bruksstatistikk

Umami-integrasjon er klargjort på alle 16 innholdssider, inkludert Bak ctrl. Nettsted-ID er konfigurert 13. oktober 2026. Speil endringen i `website/analytics.js`. Måling er aktiv på allctrl.no og www.allctrl.no.

Tilgang til statistikken

- Dashboard: https://cloud.umami.is/
- Innlogging: Velg GitHub og bruk Johan Jørgens GitHub-konto, jojofos-maker.
- Nettsted: allctrl, domene www.allctrl.no.
- Nettsted-ID: b58ad5c8-e8b3-4151-b09e-08245c609223. ID-en er offentlig og er ikke en API-nøkkel.
- Publisert og tracker kontrollert på hjemmesiden 13. oktober 2026. Historikk begynner fra aktiveringen og inkluderer ikke tidligere besøk.
- Statistikken ligger i Umami-kontoen og vises ikke som teller eller panel på hjemmesiden. Personvernsiden beskriver målingen.

Dashboardet skal vise besøk og sidevisninger, populære sider, trafikkilder, land og enheter, og sammenligne siste 7/30 dager med forrige periode. Klikkhendelser viser interesse for hver modul, Bak ctrl, LinkedIn, e-post, appene, kontaktseksjonen og modulfiltrene. Et e-postklikk betyr at e-postlenken er åpnet, ikke at e-post er sendt. Appklikk måler overgangen fra hjemmesiden, ikke aktivitet inne i appene.

Målingen sender bare forhåndsdefinerte hendelsesnavn. URL-parametere og hash utelates. Ingen brukeridentifikasjon, skjermopptak eller heatmaps aktiveres. Lokale forhåndsvisninger og GitHub-domenet måles ikke. Nettleserens Do Not Track og Global Privacy Control respekteres. Blokkering kan gjøre tallene lavere enn faktisk bruk.

For å utelate egne besøk, sett `localStorage.setItem('umami.disabled', '1')` i nettleseren. Dette gjelder én nettleser om gangen. Opphev med `localStorage.removeItem('umami.disabled')`.

Gratisnivået har 100 000 målinger per måned og 6 måneders historikk, kontrollert 13. oktober 2026 på https://umami.is/pricing. Eksporter månedsoversikt dersom lengre historikk trengs.

## Interesse for testing

Alle 13 modulsider har «Jeg vil teste»-lenke øverst og en interessemelding nederst. Knappen åpner brukerens eget e-postprogram med modulnavn i emnet og en kort ferdig utfylt tekst. Meldingen sendes av den besøkende til jjf@allctrl.no. Ingen skjemaopplysninger lagres på hjemmesiden, og ingen tilgang loves.

Umami-hendelser `testinteresse_<modulnavn>` teller klikk på e-postknappen. Disse viser interesse, ikke antall sendte e-poster eller påmeldte testbrukere. Faktiske henvendelser finnes i innboksen til jjf@allctrl.no.

## Modulstatus

Statusmerker vises på forsiden og hver modulside. Oppdatert 13. oktober 2026.

| Status | Moduler |
| --- | --- |
| I bruk | timectrl |
| Prototype | jobctrl, seectrl, carctrl |
| Ide | allctrl, drinkctrl, eatctrl, listenctrl, medctrl, playctrl, readctrl, sourdoughctrl, sportctrl |

«I bruk» gjelder en første versjon og betyr ikke at alle planlagte funksjoner er ferdige. «Prototype» bekrefter en tidlig versjon, ikke åpen tilgjengelighet eller full funksjonstest. Kun Timectrl har en bekreftet offentlig appknapp på hjemmesiden. Konseptbilder skal fortsatt merkes som konseptbilder. Oppdater status både på forsiden, modulsiden og i eksportgrunnlaget når den endres.

## Jobb med Johan Jørgen

«Jobb med meg» finnes på https://www.allctrl.no/johan/#samarbeid. Seksjonen presenterer lederstøtte, praktiske AI-kurs/hjelp og HMS-/kvalitetsarbeid. Kontakt går til jjf@allctrl.no via den besøkendes e-postprogram med ferdig emne og forslag til melding. LinkedIn er fortsatt synlig øverst og i kontaktseksjonen.

Umami-hendelsen `oppdrag_epost` teller klikk på oppdrags- og samarbeidslenker. Den måler ikke sendte e-poster. Henvendelser finnes i e-postinnboksen. Ingen informasjon fra e-postmeldingen sendes til Umami.


## Løpende prosjektdokumentasjon

Dokumentasjon oppdateres som del av vesentlig arbeid uten egen påminnelse. Se [status og åpne kontroller](docs/STATUS.md), [endringslogg uke 42](docs/ENDRINGSLOGG-2026-W42.md) og [arbeidsregler](AGENTS.md). [Leveransekatalogen](docs/LEVERANSER.md) viser filer, formater og intern hoveddokumentasjon.

## Skrivebeskyttet domenekontroll

`node scripts/check-public-domain.mjs` kontrollerer timectrl.allctrl.no med DNS og HTTPS HEAD. Oppgi eventuelt de forhåndsgodkjente domenene `timectrl.allctrl.no www.allctrl.no allctrl.no` som argumenter. Ingen innlogging, cookies, sideinnhold eller DNS-endringer. `node --test tests/public-domain.test.mjs` kjører isolerte tester uten nettverk eller npm-avhengigheter. Exit 0 betyr at begge kontrollene er bekreftet; exit 2 betyr uavklart/manuell kontroll, ikke nødvendigvis driftsstans. Se [A08-verifikasjon 17. oktober](docs/VERIFISERING-2026-10-17-A08.md).
