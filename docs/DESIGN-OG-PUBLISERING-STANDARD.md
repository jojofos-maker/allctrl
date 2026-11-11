# AllCTRL – obligatorisk design- og publiseringsprosess for moduler

**Gjelder alle nye moduler og alle redesign av eksisterende moduler.** Les denne før du lager logo, produktkort, mockup eller modulside. Gjennomfør samme prosess hver gang; ikke erstatt verifikasjon med antakelser.

## 1. Finn fasiten før du designer
1. Les `AGENTS.md`, `README.md`, `docs/STATUS.md`, master brand system og relevante designfiler.
2. Undersøk **faktiske** referansemoduler (primært timectrl og jobctrl): eksisterende SVG-AC-geometri, kortets HTML/CSS, bildeforhold, typografihierarki, mobilvisning, statusmerker og lenker.
3. Lag en kort designspesifikasjon med målbare krav: eksisterende kortmal, bildeformat 3:2, godkjent produktaksent, logovariant, overskriftstørrelser og bildeutsnitt. Bruk mål fra kildefiler, ikke gjett fra skjermbilder.
4. Ikke lag en ny visuell retning når oppgaven er å følge eksisterende univers.

## 2. Logo: én AC-master, ingen etterligning
1. Bruk **samme vektorbaner** for A og C som i eksisterende godkjent AC-master. Ikke tegn bokstavene på nytt, og ikke bruk AI-genererte bokstaver som master.
2. Bare modulaksent, symbol inni C og produktnavn endres. Ikonet skal være lesbart i små størrelser.
3. Bruk samme mørke ikonbakgrunn, avrunding, proporsjoner og monospace-ordmerke som søstermodulene. Produktnavn lowercase, `ctrl` fremhevet.
4. Eksporter redigerbar SVG, PNG 1024/512, favicon 180/32 og monokrom variant. Hold én navngitt gjeldende master; merk eldre versjoner som historikk.
5. **Ingen tekst eller logo som AI har tegnet inne i et rasterbilde, kan regnes som eksakt master.** Overlegg logoen fra SVG og kontroller også logoer på mockup-skjermer.

## 3. Produktbilde: fotorealistisk scene + presis grafikk
1. Bruk samme komposisjon som referansekortet: varmt realistisk miljø, telefon og PC som viser *konsept* eller ekte skjermbilder, tydelig identitet oppe til venstre, tre korte funksjoner nederst.
2. Bruk gjerne generert bakgrunnsfoto, men bygg all kritisk tekst, logoer, ikoner og UI-etiketter som **separate redigerbare lag**. Kontroller norsk rettskrivning og at UI ikke påstår implementert funksjonalitet.
3. Produktbildet er **bare den øvre bildedelen** av kortet. Ikke bak inn det nederste produktkortet med status, beskrivelse og lenke; det genereres av nettsidens eksisterende HTML/CSS.
4. Eksporter 3:2, minst 1536×1024 fra faktisk høyoppløselig kilde. Ikke presenter oppskalering av 768 px som mer originaldetalj. Lag 768 px variant for ytelse.
5. Mål og sammenlign **relative** skriftstørrelser, linjelengde, kontrast, plassering og luft med jobctrl/timectrl. Små tekster må fortsatt være lesbare på iPhone. Ikke godkjenn AI-bilde med feilskrift eller inkonsistente logoer.

## 4. Implementer uten å bryte nettsiden
1. Gjenbruk eksisterende modul-`card`-struktur, CSS-klasser, avrunding, padding, statusmerker og lenkeområde. Bytt bare modulspesifikt innhold.
2. Speil endringer i `website/` dersom repoet fortsatt bruker dette som eksportgrunnlag. Behold eksisterende modulrekkefølge med mindre brukeren ønsker endring.
3. Bruk versjonerte bildeadresser ved endret filinnhold; responsive `srcset` skal vise reell oppløsning. Kontroller alt-tekst, bildedimensjoner og lastetid.
4. Produktsiden skal bruke samme designprinsipper, med responsiv typografi og ingen uforholdsmessig store mobiloverskrifter.
5. Ikke bruk fungerende app, lansert eller testet som status for en idé/prototype uten bevis.

## 5. Obligatorisk kvalitetsport før «ferdig»
- **A. Kildekontroll:** riktig AC-vektor, farge, ordmerke og nøyaktig én gjeldende master.
- **B. Bildekontroll:** ingen duplisert produktkort i illustrasjonen, ingen genererte tekstfeil, korrekt logo også i skjermmockups, tekststørrelse målt mot referanse.
- **C. Visuell sammenligning:** side-ved-side med jobctrl/timectrl i desktopbredde og minst én mobilbredde (ca. 390 CSS-px). Kontroller både moduloversikt og produktside.
- **D. Teknisk kontroll:** HTML/CSS, alle bildebaner og `srcset`, tilgjengelighet, klikk, responsiv oppførsel.
- **E. Publiseringskontroll:** commit til riktig repo/branch, sjekk at GitHub Pages/Vercel-jobb **fullførte med success for aktuell commit**, og åpne faktisk offentlig URL. Et vellykket bygg alene er ikke visuell godkjenning.
- **F. Dokumentasjonskontroll:** oppdater README, relevant status/endringslogg, eksisterende AllCTRL-produktark på Google Drive og designfiler i riktig eksisterende produktmappe. Kontroller opplasting og versjonsmerking.

**Ikke erklær arbeidet «perfekt», «ferdig» eller «produksjonsverifisert» hvis én av kontrollene mangler.** Rapporter presist: implementert, publisert, teknisk testet, visuelt kontrollert og brukerbekreftet som separate statuser.

## 6. Leveranse og læring
Lever: kildefiler (SVG + redigerbare tekst-/UI-lag), bildeeksporter, korrekt nettstedskode, oppdatert Drive-designpakke, datert endringslogg og kort testprotokoll med skjermbilder. Bevar historikk, unngå mange parallelle «master»-filer, og oppdater denne prosedyren når en faktisk test viser en ny gjentakende feil.

**Lærdom fra stayctrl (november 2026):** Flere AI-genererte produktbilder ga avvik i AC-logo og tekststørrelse; senere oppskalering forbedret ikke original detaljgrad. Bruk derfor AI primært til fotografisk bakgrunn, mens merkevare, typografi og UI bygges fra eksakte, redigerbare kilder.
