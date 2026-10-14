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
- **Daily case:** seed = date. **Difficulty curve:** derive grid size and target from the case number
  (e.g. 5×5 → 9×9, more rooms, more two-part statements, the alone rule doing more of the work).
- **Content packs, not code:** rooms/furniture/cast/headlines live in `themes.js`. A new setting
  (ocean liner, Wild West saloon, Egyptian dig) is a table of rooms + objects + roles + a few new
  SVG icons.
- **Quality gate in CI:** `npm test` already generates and verifies cases. Add bad-layout heuristics
  (too many obstacles, boring clues) as tests as the generator grows.
- **Optional curation later:** pre-generate 10k seeds offline, score them for "fun" (clue variety,
  deduction depth, no early freebies) and serve the top ones as the official sequence.

## 4. Look & feel: avoiding "AI slop"

The rule we follow: one strong idea, executed consistently. This one is a 1930s newspaper.

- Black ink on aged newsprint, plus **one** spot colour (blood red) used only for the victim, errors
  and the "Extra!" stamp.
- Real newspaper typography: Playfair Display (masthead/headlines), Old Standard (body), Special Elite
  (typewritten statements). Drop cap, double rules, a dateline.
- Floors as newsprint hatching patterns, not flat colours. Thick walls and dotted inner grid lines, like the book.
- Characters drawn in rubber-hose cartoon style (pie-cut eyes, bold outlines, solid black clothing),
  assembled from parts per role: the Butler has tails, the Banker a top hat and monocle, the Cook a toque.
- Next level of polish: commission or draw a small set of hand-inked parts (heads, hats, hair) and
  keep the same modular system, which gives infinite variety with a human hand.

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
- **Relational clues** (no new rules needed): "Ada was in the same row as a bookshelf", "Hugo was two
  squares north of Mabel", "Nobody else was in the Kitchen", "She was not in the Garden".
- **Multi-cell furniture** (2-cell beds, long tables) for more book-like rooms.
