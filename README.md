# seectrl — landingsside

Statisk landingsside for **seectrl**, første produkt i ctrl-universet.

## Bruk lokalt

Bare åpne `index.html` i en nettleser. Ingen byggesteg, ingen avhengigheter.

## Publiser med GitHub Pages

1. Lag et nytt repo på GitHub (f.eks. `seectrl-landing`)
2. Last opp `index.html` (drag-and-drop i nettleseren funker fint)
3. Gå til **Settings → Pages**
4. Under **Source**, velg branch `main` og mappe `/ (root)`
5. Lagre — siden er live på `https://<brukernavn>.github.io/seectrl-landing/` etter ~1 minutt

## Tilpass

Alle farger og fonter er definert som CSS-variabler øverst i `<style>`-blokken:

```css
--bg: #0A0A0F;        /* mørk base */
--accent: #00E5FF;    /* cyan aksent */
--text: #FFFFFF;
```

Legg til egne logo-bilder, App Store-lenker og favicon når du er klar.

---

*ctrl-universet · alt du bruker tid på, under kontroll.*
