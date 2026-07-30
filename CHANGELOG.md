(reverese order of changes)

# Added Prettier and formatted the whole project.

Installed prettier and eslint-config-prettier as dev dependencies.
.prettierrc.json: double quotes, semicolons, ES5 trailing commas, 100-char width — matched to the existing code style rather than Prettier's defaults, to keep the diff formatting-only.
.prettierignore: excludes build, node_modules, package-lock.json.
package.json: added npm run format (write) and npm run format:check (CI-friendly check); extended eslintConfig with "prettier" so ESLint's stylistic rules don't fight Prettier's.
Ran prettier --write . across the repo — mostly wrapping long lines/object literals in the two big training files (TrainingAwareness.tsx, TrainingSDLC.tsx), plus minor whitespace cleanup elsewhere.
Verified: tsc --noEmit, the production build, and prettier --check . all pass clean — no behavioral changes, formatting only.


# Style Updates

**Awareness training**

- Cool slate palette → warm Meeco greys. Ink #1A1A1A for the sidebar, headings and banners; page background #F7F5F5; body text #3A3436/#4A4345/#5B5458; muted #8F8688/#9A9295; the full border/tint ladder (#E8DFE0 → #F1E9EA, tints #FBF7F7/#FBF8F8).
- accent prop default is now #E51E3C — that threads red through the CTAs, progress bar, kickers, nav completion badges, objective chips and certificate rule.
- Selected-option and kicker chips use pink tint #FCE9EB; the phishing link swatch uses #FCE9EB on #F7D3D9; sidebar eyebrow is soft pink #F2A9B3.
- Status colours untouched, as the guide specifies — success #1f7a52, danger #b23a3a, warning #b9791d, info #2f6fb0, with their tints.
- All three outstanding leftovers cleared: #1f4e79 split by context (accent default → #E51E3C, info callout → #2f6fb0), #7a3b6e → #8A1120, #1f2c3d → #3A3436.
- Logo added at 32px above the sidebar title; companyName defaults to Meeco; results email is security@meeco.me in the prepared email, the .txt export and the on-screen record.

**Home selector** 

— App.css inverted from dark teal to the light Meeco palette (white cards on #F7F5F5, red hover borders, IBM Plex Mono kickers), with the logo added in App.tsx. index.css sets the Helvetica Neue body stack and IBM Plex Mono for code, and index.html now loads IBM Plex Mono — it was referenced in ~90 style objects but never actually loaded, so those kickers and IDs were falling back to the system monospace.

**SDLC deck** 

— TrainingSDLC.tsx:63 keeps its dark theme with an ink-derived base and Meeco red accent, per your choice. Danger moved to coral #FF8A6B so it stays distinguishable from the accent, and success/amber were retuned to match. I also swept the ~40 hard-coded colours outside the token object: #cbd5e1 body text → #D9D0D1, and the teal/green/red rgba() tints and panel borders realigned. The KeyMessage tone union is now "accent" | "amber" rather than "teal" | "amber", since that tone drives C.ac.

**Two things to flag:**

- The logo is at src/assets/images/meeco-logo.svg, copied from the existing src/assets/logo.svg to match the path in the guide. The old copy is still there and now unreferenced — say the word and I'll remove it.
- #B0122B (accent hover) is only used on the home-page back-link. The Awareness CTAs are inline-styled with no hover state in the original design, so wiring hover there means either a class refactor or mouse handlers across ~7 call sites — I left that alone rather than adding interaction the design didn't have.


