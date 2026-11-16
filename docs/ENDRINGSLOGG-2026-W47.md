# Endringslogg uke 47 2026

Datoer er Europe/Oslo. Tidligere arbeid ligger i [endringslogg uke 42](ENDRINGSLOGG-2026-W42.md) og i [status](STATUS.md).

## 16.11.2026 – kodegjennomgang og retting av synk-avvik

**Bestilt:** Brukeren ba om en vurdering av koden og deretter om retting av punkt 1–3 og 7–8 fra vurderingen, med dokumentasjon.

**Hvorfor:** En gjennomgang viste at noen opplysninger er kopiert flere steder og har kommet ut av synk. Det gjaldt modullister, `website/`-speilet, timectrl-statusen, versjonsparametere og stavemåten av statusetiketten.

### Endret

1. **stayctrl måles nå.** `stayctrl` er lagt til i modullisten i `analytics.js`. Før ble Umami-hendelsene `modul_stayctrl` og `testinteresse_stayctrl` stille droppet. `stayctrl` er også lagt til i omdirigeringslisten i `404.html`, så `/stayctrl.html` sendes til `/stayctrl/`.
2. **`website/`-speilet er synkronisert.** Alle filer under `website/` er kopiert fra roten. `website/timectrl/index.html` var en eldre versjon uten brukerveiledningen. Den manglende `website/timectrl/launch.css` er lagt til.
3. **timectrl har én status og én adresse.** Kortet på forsiden viste «I bruk». Produktsiden viste «Beta · under utvikling» og lenket til `https://timectrl.allctrl.no/`. Forsidekortet viser nå også «Beta · under utvikling» (`status-prototype`), og README er oppdatert til samme adresse. Valget følger produktsiden, fordi den er den nyeste bevisste endringen (betaveiledningen, PR #2, 14.10.2026). Brukeren har ikke bekreftet valget, og adressen kunne ikke åpnes fra arbeidsmiljøet (se Begrensninger). `analytics.js` gjenkjenner fortsatt begge appadressene.
4. **Like versjonsparametere.** Alle sider laster nå `style.css?v=status10` og `analytics.js?v=4`. Før var det `color6`/`status9` og v1/v2/v3 om hverandre, så nettlesere kunne holde på en gammel `analytics.js`.
5. **Mindre punkter:**
   - Statusetiketten heter nå «Idé» overalt (før «Ide» på 18 steder og «Idé» på ett).
   - Open Graph-tagger (`og:title`, `og:description`, `og:url`, `og:image`, `og:locale`) er lagt til på alle innholdssider, så delinger får tittel og bilde. Verdiene er hentet fra sidens eksisterende tittel, beskrivelse og canonical-adresse. `og:image` peker på modulens eksisterende 768 px-konseptbilde. Bak ctrl har ikke fått noe `og:image`, siden et portrett ikke bør velges uten brukeren.
   - README-telling oppdatert fra 16 til 17 innholdssider.
   - Rettet påstand fra gjennomgangen: personvernsiden nevner allerede Google Fonts. Her trengs ingen endring.

**Berørte filer:** `analytics.js`, `404.html`, `index.html`, `personvern.html`, `johan/index.html`, alle 14 `<modul>/index.html`, hele `website/`-speilet (inkludert ny `website/timectrl/launch.css`), `README.md`, `docs/STATUS.md`, `docs/LEVERANSER.md` og denne filen.

**Kilde:** gren `claude/fervent-albattani-gjh218`. Commit-hash står i git-historikken for denne filen.

### Utførte tester (lokalt, ikke i produksjon)

- Lenkesjekk med skript: 0 brutte lokale lenker og bildestier i rotsidene. Alle nye `og:image`-filer finnes.
- Headless Chromium ved 390 og 1280 CSS-px, testet på forsiden, timectrl, stayctrl, jobctrl, Bak ctrl og personvern: ingen JS-feil, ingen horisontal scroll, én `h1` per side, ingen bilder uten alt-tekst.
- `analytics.js` med `www.allctrl.no` sendt til en lokal server og et stub-skript i stedet for Umami: klikk forside → stayctrl sendte `modul_stayctrl`, og «Jeg vil teste» på stayctrl sendte `testinteresse_stayctrl`.
- timectrl-produktsiden viser «Beta · under utvikling» og laster `launch.css`. Skjermbilde av forsidekortet ved 390 px er kontrollert visuelt: etiketten får plass på én linje.
- Modulfilteret «Arbeid» viser fortsatt bare de to arbeidskortene.

### Begrensninger

- **Ikke publisert:** GitHub Pages publiserer fra `main`. Endringene ligger på arbeidsgrenen til de er slått sammen. Etterpå må Pages-jobben og den offentlige siden kontrolleres.
- **timectrl-adressen er ikke verifisert:** både `timectrl.allctrl.no` og `timectrl-taupe.vercel.app` ble avvist av nettverksproxyen i arbeidsmiljøet. Valget av adresse og status bør bekreftes av brukeren.
- **Speilet er fortsatt delvis:** `website/` har aldri inneholdt `johan/` og de fleste bildene. Lenker inne i speilet som peker dit, var brutte før denne endringen (55) og er det fortsatt (58; de tre ekstra kommer fra timectrl-veiledningen som nå er med). Speilet er altså ikke en komplett, frittstående kopi.
- Ingen test på fysisk mobil, i Umami-dashboardet eller i LinkedIn-forhåndsvisning.
- Prosjektregisteret på Google Disk er funnet, men ikke oppdatert. Drive-koblingen kan ikke skrive i dokumentinnhold i denne økten (se STATUS). Library-tilgang mangler.

### Neste handling

1. Brukeren bekrefter timectrl-status og -adresse.
2. Slå sammen grenen, kontroller at Pages-jobben gir success, og åpne forsiden, timectrl og stayctrl på mobil.
3. Etter publisering: kontroller i Umami at `testinteresse_stayctrl` og `modul_stayctrl` dukker opp, og test delingsforhåndsvisning (for eksempel med LinkedIn Post Inspector).
4. Ikke gjort ennå (punkt 4–6 i vurderingen): én datakilde/generator for modullister og sider, formatert HTML og opprydding av rundt 40 ubrukte PNG-er (omtrent 30 MB).
