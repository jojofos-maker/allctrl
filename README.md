# allctrl

Offentlig hjemmeside for ctrl-universet på https://www.allctrl.no/. GitHub Pages publiserer repositoryets rot fra main.

Hver modul har én side i `<modul>/index.html`. Ikke legg tilbake `<modul>.html` i roten. GitHub Pages kan ellers levere en annen versjon på adressen uten avsluttende skråstrek. Gamle .html-bokmerker håndteres av 404.html. Tidligere sider bevares i Git-historikken, ikke som offentlig HTML.

`website/` er et synkronisert eksportgrunnlag. `brand/` inneholder logoer og eksportpakker. Produktideer merkes som under utvikling. Timectrl lenker til den offentlige appadressen https://timectrl-taupe.vercel.app/. Personvernsiden gjelder hjemmesiden.

## Bruksstatistikk

Umami-integrasjon er klargjort på alle 16 innholdssider, inkludert Bak ctrl. Nettsted-ID er konfigurert 13. oktober 2026. Speil endringen i `website/analytics.js`. Måling er aktiv på allctrl.no og www.allctrl.no.

Aktivering

1. Opprett gratis Hobby-konto på https://cloud.umami.is/signup og bekreft e-posten.
2. Legg til nettstedet allctrl med domenet www.allctrl.no.
3. Kopier nettsted-ID fra sporingskoden. Den er offentlig, og er ikke passord/API-nøkkel.
4. Fyll ID i begge analytics.js-filer og oppdater personvernsiden før aktivering. Opplys om Umami, formål, målinger og lagring i 6 måneder. Avklar behandlingsvilkår og eventuell region i kontoen.
5. Publiser og kontroller sanntidsvisning med ett besøk og ett LinkedIn-klikk. Kontroller at én sidevisning registreres per side.

Dashboardet skal vise besøk og sidevisninger, populære sider, trafikkilder, land og enheter, og sammenligne siste 7/30 dager med forrige periode. Klikkhendelser viser interesse for hver modul, Bak ctrl, LinkedIn, e-post, appene, kontaktseksjonen og modulfiltrene. Et e-postklikk betyr at e-postlenken er åpnet, ikke at e-post er sendt. Appklikk måler overgangen fra hjemmesiden, ikke aktivitet inne i appene.

Målingen sender bare forhåndsdefinerte hendelsesnavn. URL-parametere og hash utelates. Ingen brukeridentifikasjon, skjermopptak eller heatmaps aktiveres. Lokale forhåndsvisninger og GitHub-domenet måles ikke. Nettleserens Do Not Track og Global Privacy Control respekteres. Blokkering kan gjøre tallene lavere enn faktisk bruk.

For å utelate egne besøk, sett `localStorage.setItem('umami.disabled', '1')` i nettleseren. Dette gjelder én nettleser om gangen. Opphev med `localStorage.removeItem('umami.disabled')`.

Gratisnivået har 100 000 målinger per måned og 6 måneders historikk, kontrollert 13. oktober 2026 på https://umami.is/pricing. Eksporter månedsoversikt dersom lengre historikk trengs.
