# Murdoku Gazette: design notes

## 1. The game (base rules, from the book)

- An N×N crime scene split into **rooms** (areas), with N people: N−1 suspects plus 1 victim.
- **Every person is in a different row and column** (the Sudoku / N-queens-ish core).
- Seats (chair, bed, rug, bench) can be occupied; obstacles (tree, bush, table, shelf…) cannot.
- Each suspect gives a **statement** (clue): "She was sitting in a chair", "He was beside the tree",
  "She was in the Library". **Beside** = orthogonally adjacent *and in the same room*.
- The victim falls in the **last available square** and was **alone with the murderer**: exactly one
  suspect shares the victim's room. That suspect did it.

What makes it satisfying: every puzzle has exactly one answer, reachable by pure deduction
(no guessing), with the killer reveal as the punchline.

## 2. How it's built

Plain HTML/CSS/JS ES modules with no build step, installable as a PWA (works offline).

| File | Role |
|---|---|
| `js/generator.js` | case number → puzzle (seeded, deterministic) |
| `js/solver.js` | `countSolutions` (brute-force proof of uniqueness) + `logicalSolve` (human-style, rates difficulty, orders hints) |
| `js/clues.js` | clue types as plain data + their test/text |
| `js/themes.js` | content tables: furniture, rooms, cast, headlines |
| `js/art.js` | SVG ink art: furniture, floor patterns, modular cartoon portraits |
| `js/app.js` | UI, input, hints, save/restore |
| `tests/run.mjs` | generates hundreds of cases and checks each is valid + unique + logically solvable |
| `tests/gallery.html` | visual sheet of all portraits and furniture (open via a local server) |

### Generation pipeline
1. Carve the grid into rooms (binary space partition, sometimes merged into L-shapes).
2. Place everyone on a random permutation; pick a victim whose room has exactly one other person.
3. Furnish rooms: seats under people, decoy seats and obstacles elsewhere.
4. Sample one true clue per suspect (rarely two) until the brute-force solver proves a **unique**
   answer **and** the logical solver solves it at the target difficulty.

### Difficulty
The logical solver applies techniques in order of difficulty:
- **Level 1:** single candidate · only-one-person-fits-this-row/column · person locked to a row/column.
- **Level 2:** the victim/"alone" rule · pairs/triples of people owning the same rows or columns.
- **Level 3:** needs trial and error (currently rejected).

The highest technique needed sets the rating, and generation retries until it hits the target.
Hints follow the same deduction order, so a hint is always the *next sensible step*, not a random reveal.

## 3. Scaling "till the end of times"

- **Case number = seed.** Case 1,000,000 is generated on the device in ~50ms. Nothing to store, host or
  author, and both of you see the same case for the same number (good for racing each other).
- **Three series:** Easy (5×5, furniture and rooms only), Medium (6×6, at most one exact person-to-person statement), Hard (6×6, several, including vague ones). Each series is numbered from 1, and the front page always offers the lowest case not yet played, so solved cases never repeat on a device.
- **Daily case:** seed = date. **Difficulty curve:** derive grid size and target from the case number
  (e.g. 5×5 → 9×9, more rooms, more two-part statements, the alone rule doing more of the work).
- **Content packs, not code:** rooms/furniture/cast/headlines live in `themes.js`. A new setting
  (ocean liner, Wild West saloon, Egyptian dig) is a table of rooms + objects + roles + a few new
  SVG icons.
- **Quality gate in CI:** `npm test` already generates and verifies cases. Add bad-layout heuristics
  (too many obstacles, boring clues) as tests as the generator grows.
- **Optional curation later:** pre-generate 10k seeds offline, score them for "fun" (clue variety,
  deduction depth, no early freebies) and serve the top ones as the official sequence.

## 4. Look & feel

The first version was a black-and-white 1930s newspaper. It has since moved to the colourful
storybook look of the Murdoku books; see section 8. The rule stays the same: one strong idea,
executed consistently, with a small fixed palette and a modular character system that hand-drawn
parts can replace later.

## 5. Variants (book 2 style), for later

The clue engine is plain data plus a test function, and the solver works over candidate sets, so
variants slot in as **new constraints and new clue types**:

- **Outlaws (Wild West):** each person gets a hidden boolean `outlaw`. The puzzle states "There are 2
  outlaws" and a group clue ("Every outlaw had a beard", which works with portrait traits!). New clue
  types: "with an outlaw" (same room), "an outlaw one row north of him". The victim is never an outlaw.
  Solver: brute force over outlaw assignments × placements; the logical solver gains an "outlaw
  inference" technique.
- **Nobles vs peasants / pirates / crews:** the same mechanism with different labels and flavour clues.
- **Tasks (Stone Age):** coloured task squares only people with that task can stand on, plus counts
  ("Two people are Hunters"). This is a per-cell `task` field plus a hidden per-person role.
- ~~Relational clues~~ **done:** one row north/south, one column east/west, somewhere north/south/east/west, diagonally next to, the only one in a room or on a kind of seat, same row/column as an object, edge rows/columns.
  squares north of Mabel", "Nobody else was in the Kitchen", "She was not in the Garden".
- **Multi-cell furniture** (2-cell beds, long tables) for more book-like rooms.

## 6. Themes

A world picker sits above the difficulty picker; each world has its own Easy/Medium/Hard series.
Manor keys stay `medium-3` (saves predate themes); others are `zeta-medium-3`. Each world has a
host who briefs you on first visit.

| World | Easy | Medium | Hard |
|---|---|---|---|
| The Manor | classic | + one exact relation | + several |
| Outpost Zeta-9 | telepathy (statements describe someone else) | + teleporter pads | + human impostor whose statement is false |
| Hollow Hill House | ghost may stand inside furniture | same | same |
| Sands of Egypt | masks of the gods + unmasking | stepped-pyramid board | both |
| The Midnight Heist | cameras see along their row until blocked | | *(not built yet)* |

Engine hooks: `clue.about` (telepathy), `clue.neg` + `withLiar()` (impostor), `person.ghost` +
`canStand()`, `cell.pad` (teleporters), `person.masked` + `p.unmask` (Egypt).

**Egypt's masks** are a two-stage puzzle. Stage 1 is a normal case whose "people" are masks
(the Jackal, the Cat…). Stage 2: each named suspect has an alibi that is true of the square their
mask stood on; the alibis fit the masks in exactly one way (`countMatchings`), so the name behind
the killer's mask can be deduced. The case only closes when that name is picked.

## 7. Recipes: how cases change without breaking saves

A case is rebuilt from its number every time it is opened, so its generator must never change.
Generators are therefore versioned as **recipes**:

- **Recipe 1** (`generator.js`): square boards, single-square furniture.
- **Recipe 2** (`generator2.js`): boards of any shape (`p.w` x `p.h` with `cell.void` squares:
  rectangles, L-shapes, stepped pyramids), furniture covering two or four squares (`p.pieces`),
  more rooms, statements about where the body was found, and Egypt.

Every save is stamped with the recipe that made it (`progress[key].gen`). A case somebody has
played keeps its recipe forever; a case nobody has opened is made with `CURRENT_GEN`. On a
non-square board the number of people equals the shorter side, so only that direction is
guaranteed full, and the solver's "only one person can reach this line" step applies only there.

`tests/fingerprint.mjs` pins the output of every recipe (210 recipe-1 cases, 240 recipe-2 cases).
If it fails, a change would silently alter cases people have saved: put the change in a new recipe
instead. `tests/e2e.cjs` additionally opens an old-format save in the real app and finishes it.

## 8. Look and sound

The look follows the Murdoku books: a cream page, flat colour art with a dark outline, pastel
rooms, one colour per suspect, hosts talking in speech bubbles. `js/art.js` holds furniture
(single, two-square and the big rug), floor patterns and world emblems; `js/portraits.js` builds
people, aliens, the ghost, the ten god masks and the hosts from parts. Doorways and room colours
are drawn from the layout alone, so older cases get them too. Sound effects are synthesised with
Web Audio in `js/sound.js` (no audio files).
