// Theme tests: node tests/themes.mjs [count]
// Every themed case must be uniquely solvable (across every possible liar), honest except for the
// impostor, logically solvable, and quick to generate.

import { generatePuzzle, withLiar } from '../js/generator.js';
import { countSolutions, logicalSolve, aloneOk } from '../js/solver.js';
import { clueHolds, clueText, canStand } from '../js/clues.js';

const N = Number(process.argv[2] || 25);
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL', m); };
const t0 = Date.now();

for (const theme of ['zeta', 'haunted']) {
  for (const d of ['easy', 'medium', 'hard']) {
    const times = [];
    let impostors = 0, ghostsInFurniture = 0, pads = 0, sensed = 0;
    for (let seed = 1; seed <= N; seed++) {
      const s = Date.now();
      let p;
      try { p = generatePuzzle({ seed, difficulty: d, theme }); } catch (e) { fail(`${theme}-${d}-${seed}: ${e.message}`); continue; }
      times.push(Date.now() - s);
      const tag = `${theme}-${d}-${seed}`;
      const sol = p.solution;
      const suspects = p.people.map((_, k) => k).filter((k) => !p.people[k].isVictim);
      if (new Set(sol.map((i) => Math.floor(i / p.n))).size !== p.n) fail(`${tag} rows`);
      if (new Set(sol.map((i) => i % p.n)).size !== p.n) fail(`${tag} cols`);
      if (!sol.every((i, k) => canStand(p, k, i))) fail(`${tag} someone stands where they can't`);
      if (!aloneOk(p, sol)) fail(`${tag} alone rule`);
      const truth = p.impostor >= 0 ? withLiar(p, p.impostor) : p;
      truth.people.forEach((pr, k) => pr.clues.forEach((c) => { if (!clueHolds(truth, k, c, sol)) fail(`${tag} statement not consistent with truth`); }));
      if (p.impostor >= 0) {
        impostors++;
        if (p.people[p.impostor].clues.some((c) => clueHolds(p, p.impostor, c, sol))) fail(`${tag} impostor told the truth`);
        let total = 0;
        for (const L of suspects) total += countSolutions(withLiar(p, L), 3).count;
        if (total !== 1) fail(`${tag} not unique across liars (${total})`);
      } else if (countSolutions(p, 3).count !== 1) fail(`${tag} not unique`);
      if (!logicalSolve(truth).solved) fail(`${tag} not logically solvable`);
      if (p.rules.telepathy && !p.people.every((pr, k) => pr.isVictim || pr.clues.every((c) => c.about != null && c.about !== k))) fail(`${tag} telepathy`);
      if (p.rules.teleporters) { if (p.cells.filter((c) => c.pad === 0).length === 2) pads++; else fail(`${tag} pads`); }
      if (p.rules.ghost) {
        const g = p.people.findIndex((x) => x.ghost);
        if (g < 0 || g === p.victim) fail(`${tag} ghost`);
        else if (p.cells[sol[g]].obj && !canStand({ ...p, people: [] }, 0, sol[g])) ghostsInFurniture++;
      }
      if (p.people.some((pr) => pr.clues.some((c) => c.about != null))) sensed++;
      if (theme === 'zeta' && !p.people.every((pr) => pr.alienName && pr.earthName)) fail(`${tag} names`);
      if (seed === 1 && d === 'hard') {
        console.log(`\n  ${tag}: ${p.headline}`);
        p.people.forEach((pr, k) => console.log(`   ${pr.name}${pr.earthName ? ` (${pr.earthName})` : ''}${pr.ghost ? ' [GHOST]' : ''}${pr.isVictim ? ' [VICTIM]' : ''}${k === p.impostor ? ' [IMPOSTOR]' : ''}: ${pr.clues.map((c) => clueText(p, pr, c).replace(/<[^>]+>/g, '')).join(' ')}`));
      }
    }
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(0);
    console.log(`${theme} ${d}: avg ${avg}ms max ${Math.max(...times)}ms` +
      (impostors ? ` · impostor ${impostors}/${N}` : '') + (pads ? ` · pads ${pads}/${N}` : '') +
      (ghostsInFurniture ? ` · ghost inside furniture ${ghostsInFurniture}/${N}` : '') + (sensed ? ` · telepathy ${sensed}/${N}` : ''));
  }
}
console.log(`\n${failures ? failures + ' FAILURES' : 'all ok'} in ${Date.now() - t0}ms`);
process.exit(failures ? 1 : 0);
