

## Plan: Replace em dashes with spaces in non-Spanish locale files

### Summary
Replace all em dashes ("—") between words with a normal space in `en.json`, `fr.json`, `de.json`, `zh.json`, and `ru.json`. Spanish (`es.json`) is untouched.

### Files to modify

**1. `src/locales/en.json`** — ~15 replacements
Lines with " — " pattern: 95, 106, 114, 132, 137, 154, 211, 218, 230, 232, 253, 257, 279, 287

**2. `src/locales/fr.json`** — ~16 replacements
Lines: 95, 106, 114, 132, 137, 154, 211, 218, 230, 232, 253, 257, 275, 279, 287, 291

**3. `src/locales/de.json`** — ~16 replacements
Lines: 95, 106, 114, 132, 137, 154, 211, 218, 230, 232, 253, 257, 279, 287, 291, 422

**4. `src/locales/zh.json`** — ~5 replacements (uses "——" double em dash, Chinese convention)
Lines: 218, 230, 232, 253, 257

**5. `src/locales/ru.json`** — ~14 replacements
Lines: 132, 137, 218, 230, 232, 253, 257, 279, 287, 291

### Approach
- Find-and-replace `—` → ` ` (space) in each file
- Where the pattern is ` — ` (space-dash-space), result will be `   ` (triple space), so we normalize to single space: ` — ` → ` `
- For Chinese `——`, replace with single space

### No other changes
Only em dashes between words are affected. No URLs, formatting, or other punctuation is modified.

