# The Murdoku Gazette

Sudoku meets murder mystery, as a phone- and tablet-friendly web app styled like a 1930s newspaper.
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
npm test            # checks existing cases are unchanged (protects saved progress),
                    # then generates 3×60 cases and verifies each is unique and logically solvable
```

## Hosting (GitHub Pages)

Repo Settings → Pages → *Deploy from a branch* → `main` / root. No build step.

See [docs/DESIGN.md](docs/DESIGN.md) for the rules, architecture, scaling plan and future variants.

Fonts: Playfair Display, Old Standard TT and Special Elite (SIL Open Font License).
