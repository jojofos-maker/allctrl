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
