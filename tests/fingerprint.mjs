// Guards saved progress: a player's saved board is only meaningful if the same case number
// keeps producing the same puzzle. This records a fingerprint of the first cases of every
// difficulty; `node tests/fingerprint.mjs` fails if any of them changes.
// Only regenerate (with --update) when deliberately shipping new puzzles AND migrating saves.

import { readFileSync, writeFileSync } from 'node:fs';
import { generatePuzzle } from '../js/generator.js';
import { hashString } from '../js/rng.js';

const FILE = new URL('./fingerprints.json', import.meta.url);
const COUNT = 40;

const now = {};
// Manor keys predate themes ("medium-3"); themed keys are "zeta-medium-3".
for (const theme of ['manor', 'zeta', 'haunted']) {
  for (const d of ['easy', 'medium', 'hard']) {
    for (let n = 1; n <= (theme === 'manor' ? COUNT : 15); n++) {
      const p = generatePuzzle({ seed: n, difficulty: d, theme });
      // the Manor keeps its original fingerprint formula so its recorded values stay comparable
      const essence = theme === 'manor'
        ? JSON.stringify([p.n, p.cells, p.areas, p.solution, p.people.map((x) => [x.name, x.role, x.isVictim, x.clues, x.lookSeed])])
        : JSON.stringify([p.n, p.cells, p.areas, p.solution, p.impostor ?? null,
          p.people.map((x) => [x.name, x.role, x.isVictim, x.clues, x.lookSeed, x.earthName ?? null, x.ghost ?? null])]);
      now[theme === 'manor' ? `${d}-${n}` : `${theme}-${d}-${n}`] = hashString(essence).toString(16);
    }
  }
}

if (process.argv.includes('--update')) {
  writeFileSync(FILE, JSON.stringify(now, null, 1) + '\n');
  console.log(`recorded ${Object.keys(now).length} case fingerprints`);
} else {
  const saved = JSON.parse(readFileSync(FILE, 'utf8'));
  const changed = Object.keys(saved).filter((k) => saved[k] !== now[k]);
  const fresh = Object.keys(now).filter((k) => !(k in saved));
  if (fresh.length) console.log(`note: ${fresh.length} cases not yet fingerprinted (run with --update once they ship)`);
  if (changed.length) {
    console.error(`FAIL: ${changed.length} existing cases would change (${changed.slice(0, 8).join(', ')}…). Saved progress would break.`);
    process.exit(1);
  }
  console.log(`all ${Object.keys(saved).length} case fingerprints unchanged`);
}
