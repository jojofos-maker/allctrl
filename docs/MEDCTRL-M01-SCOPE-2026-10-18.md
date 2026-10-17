# M01 – forslag til første medctrl-versjon

Utarbeidet 17.–18. oktober 2026 (Europe/Oslo). **Forslag til eierbeslutning, ikke godkjent produktomfang.** Produktstatus er fortsatt Ide. Ingen app, database eller behandlingsfunksjon bygges i denne leveransen.

## Anbefalt første brukergruppe og behov

Voksne som selv vil holde oversikt over én enkel, selvvalgt hverdagsrutine og hva de selv har registrert som gjort. Første test bruker bare oppdiktede rutiner, for eksempel «Kveldsrutine», ikke medikamentnavn eller personlige helsenotater. Dette er en bevisst smal start fra produktarkets forslag «legg inn en rutine og registrer at den er fulgt».

Dette første steget er ikke en medisinadministrasjonsløsning. En registrering betyr bare at brukeren har merket rutinen som gjort; den skal ikke beskrives som verifisert medisininntak, etterlevelse eller helsetilstand.

## Én første flyt

1. Opprett en rutine med en kort tittel og valgt lokal tid; vis tydelig at dette er en oversikt, ikke en garantert varsling.
2. Dagens oversikt viser rutinen med status «Ikke registrert». Manglende registrering tolkes ikke som glemt medisin eller manglende gjennomføring.
3. Brukeren velger «Registrer som gjort» og ser faktisk registreringstid.
4. Et ekstra trykk lager ikke en ny gjennomføring for samme rutine/dato. Brukeren kan angre, med synlig spor av registrering og angring.
5. Brukeren kan se en enkel historikk og redigere eller stoppe rutinen. Endring av tittel/tid må ikke skrive om historiske hendelser.

Varsling, permanent lagring og gjenåpning inngår først når de separate valgene nedenfor er avklart. Den første eventuelle demonstrasjonen kan være en tydelig merket, flyktig test med syntetiske data; den må si at data forsvinner ved ny innlasting.

## Minste databehov

| Objekt | Foreslåtte felt | Avgrensning |
| --- | --- | --- |
| Rutine | Tilfeldig ID, kort brukervalgt tittel, lokal tid, tidssone, aktiv/inaktiv | Ingen dose, legemiddelkatalog eller automatisk import |
| Hendelse | Tilfeldig ID, rutine-ID, lokal dato, handling registrert/angret, faktisk ISO-tid og tidssone | Bevar historikk; ikke hev faktisk gjennomføring utover brukerens egen registrering |
| Visningsvalg | Valgt dato og tidssone, foreslått standard Europe/Oslo | Ikke avled eierens sted fra maskintidssonen |
| Tilgang ved senere vedvarende pilot | Eierkobling og verifisert innlogging | Ikke aktuelt for flyktig syntetisk demonstrasjon; arkitektur må godkjennes først |

En rutinetittel kan inneholde helseopplysninger selv om skjemaet ikke ber om dem. Derfor er en lokal lagringsløsning ikke automatisk en trygg løsning for virkelige data. Ingen personlige data tillates i demo, repo, testfixturer eller måling. Ikke legg helseinnhold i URL, feillogg eller statistikk.

## Utenfor første versjon

- Medisinliste, dosering, endring eller forslag til behandling, interaksjoner og symptomtolkning.
- Garantert påminnelse, iOS-push, e-post/SMS, reseptbestilling eller kontakt med behandler.
- Akuttvarsling, pårørendeinnsyn, delte konti, barn/omsorgsbruk og profesjonell administrasjon.
- AI, journal-/reseptintegrasjon, helseanalyse eller automatisk tolkning av manglende registrering.
- Betaling, abonnement, lanseringsdato og løfter om sikkerhet eller medisinsk egnethet.

Ingen medisinsk eller juridisk klassifisering er vurdert i denne leveransen. Før bruk med virkelige data må personvern, sikkerhet, ansvar og relevant regelverk vurderes særskilt; dette dokumentet er ingen godkjenning.

## Akseptansekriterier for en senere syntetisk prototype

Dette er fremtidige tester, **ikke utførte app-tester**:

- M01-A1: Én rutine kan opprettes, vises og stoppes uten at historiske hendelser endres.
- M01-A2: Dagens status skiller «Ikke registrert» fra «Registrert som gjort» og viser tidspunkt.
- M01-A3: Gjentatte trykk lager ikke flere gjennomføringer for samme rutine/dato.
- M01-A4: Angring registreres tydelig; historikk slettes ikke stille.
- M01-A5: Dato og klokke vises i valgt tidssone; midnatt, 23/25-timers døgn og gjentatt lokal time har definert, testet oppførsel.
- M01-A6: Manglende registrering og utilgjengelig lagring vises som ukjent/ikke bekreftet, ikke som medisinsk konklusjon.
- M01-A7: Flyktig demo merkes tydelig før data legges inn og etter gjenlasting.
- M01-A8: Rutinetittel HTML-escapes, svært lang/ugyldig tekst avvises og ingen persondata sendes til tredjepart.
- M01-A9: Tastatur, skjermlesernavn, fokus og fysisk mobil/PC prøves før en funksjon erklæres tilgjengelig.
- M01-A10: Ved senere varig pilot må lagring/gjenlasting, eierisolasjon, eksport/sletting, sikkerhetskopi og gjenoppretting testes før reelle data tillates.

Ingen skjermbilde-, tilgangs-, lagrings- eller medisinakseptanse følger av at informasjonssiden har riktig tekst.

## Beslutningen som spares til eier

**M01-B1:** Velg retning før bygging.

- A, anbefalt forslag: rutineoversikt som over, først en syntetisk og flyktig demonstrasjon etter eksplisitt byggegodkjenning.
- B: faktisk legemiddeloversikt. Krever ny behovs-, risiko-, personvern- og ansvarsavgrensning før omfang/kostnad eller bygging kan avtales.
- C: behold medctrl som idé og utsett produktarbeidet.

A er ikke godkjent ved at forslaget er skrevet. Ingen kostnad påløper av dokumentet. Kostnad og plattform for en vedvarende pilot er ukjent; ingen gratis drift eller ny leverandøravtale antas. Eksisterende logoer og godkjent designfasit skal gjenbrukes uten ny designretning.

## Verifisert i denne leveransen

Fersk allctrl main: `fc07511516c6c4edd844fe65b9fe90ecdd863ee6`.
AGENTS, README, STATUS, uke-42-logg og leveransekatalog lest; produktark, plan, designoversikt og testplan i eksisterende produktstruktur gjennomgått. Eksisterende informasjonsside og website-speil er lest fra eksakt SHA. Kildene viser idémerking, merket konseptbilde og interesse via e-postlenke, ikke en fungerende rutineapp.

`node --test tests/medctrl-source.test.mjs` → 6/6 statiske kildekontroller, exit 0.
`node --check tests/medctrl-source.test.mjs` → exit 0.
`node --version` → v24.19.0, exit 0.
Ingen npm-avhengigheter installert. Ingen package.json, eksisterende testkommando, typecheck eller byggoppsett finnes på denne main; typecheck/bygg er ikke relevant for ren dokumentasjon og innebygd Node-kildetest.

Kildekontrollene sjekker identisk root/speil, idémerking, konseptmerking, lokale seksjonsankere, interesse som mailto uten skjema, samt medisinsk avgrensning/personvernlenke i HTML. De er ikke DOM-, tilgjengelighets-, visuell-, nettverks- eller app-tester. Sidenes HTML, design og analytics endres ikke. Ingen produksjonsdata, e-post, AI, hosting eller tilgang er brukt eller endret. M01 venter på eierbeslutning og skal ikke markeres fullført.
