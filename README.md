# Murdoku

Sudoku meets murder mystery, as a phone- and tablet-friendly web app in the colourful style of the puzzle books.
Place every suspect on the crime scene, one per row and column, and unmask the killer.
Every case is generated from its case number and proven to have exactly one solution, so there are endless cases.

## Play locally

```sh
npx http-server -c-1 .     # or: python3 -m http.server
# open http://localhost:8080
```

Add it to your home screen (Safari: Share → Add to Home Screen) to play offline, full screen.

## Test

```sh
npm test                    # fingerprints (saved progress stays valid), then hundreds of generated
                            # cases per recipe and theme: unique, consistent, logically solvable
npx http-server -p 8123 -c-1 . &
node tests/e2e.cjs          # plays the real app in a browser (needs Playwright)
```

## Hosting (GitHub Pages)

Repo Settings → Pages → *Deploy from a branch* → `main` / root. No build step.

See [docs/DESIGN.md](docs/DESIGN.md) for the rules, architecture, scaling plan and future variants.

Fonts: Alfa Slab One, Zilla Slab, Kaushan Script and Patrick Hand (SIL Open Font License).
