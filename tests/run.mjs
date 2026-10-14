// Engine tests: node tests/run.mjs
// Generates many cases and verifies every one is uniquely solvable, consistent and logically rated.

import { generatePuzzle } from '../js/generator.js';
import { countSolutions, logicalSolve, aloneOk } from '../js/solver.js';
import { clueTest, clueText, isFree } from '../js/clues.js';

let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL', msg); };

export function ascii(p) {
  const rows = [];
  for (let r = 0; r < p.n; r++) {
    let line = '';
    for (let c = 0; c < p.n; c++) {
      const i = r * p.n + c;
      const k = p.solution.indexOf(i);
      const o = p.cells[i].obj;
      line += (k >= 0 ? p.people[k].initial : o ? o[0].toLowerCase() : '.') + p.cells[i].area + ' ';
    }
    rows.push(line);
  }
  return rows.join('\n');
}

const N = Number(process.argv[2] || 60);
const t0 = Date.now();
const stats = { easy: [], medium: [], hard: [] };
for (const difficulty of ['easy', 'medium', 'hard']) {
  for (let seed = 1; seed <= N; seed++) {
    const s = Date.now();
    let p;
    try {
      p = generatePuzzle({ seed, n: 6, difficulty });
    } catch (e) {
      fail(`${difficulty} seed ${seed}: ${e.message}`);
      continue;
    }
    stats[difficulty].push(Date.now() - s);
    const tag = `${difficulty}#${seed}`;
    if (countSolutions(p, 3).count !== 1) fail(`${tag} not unique`);
    const sol = p.solution;
    if (new Set(sol.map((i) => Math.floor(i / p.n))).size !== p.n) fail(`${tag} rows`);
    if (new Set(sol.map((i) => i % p.n)).size !== p.n) fail(`${tag} cols`);
    if (!sol.every((i) => isFree(p, i))) fail(`${tag} blocked cell`);
    if (!aloneOk(p, sol)) fail(`${tag} alone rule`);
    p.people.forEach((pr, k) => pr.clues.forEach((c) => { if (!clueTest(p, c, sol[k])) fail(`${tag} false clue`); }));
    const vArea = p.cells[sol[p.victim]].area;
    if (p.cells[sol[p.murderer]].area !== vArea) fail(`${tag} murderer`);
    const r = logicalSolve(p);
    if (!r.solved) fail(`${tag} not logically solvable`);
  }
}
const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
const max = (a) => Math.max(...a);
for (const d of Object.keys(stats)) console.log(`${d}: avg ${avg(stats[d])}ms, max ${max(stats[d])}ms`);

const p = generatePuzzle({ seed: 1, n: 6, difficulty: 'medium' });
console.log(`\nCase 1 (${p.attempts} layouts): ${p.headline}\n${ascii(p)}`);
p.people.forEach((pr) => console.log(`  ${pr.name} ${pr.title}${pr.isVictim ? ' (VICTIM)' : ''}: ${pr.clues.map((c) => clueText(p, pr, c)).join(' ')}`));
console.log('  murderer:', p.people[p.murderer].name, 'rating', JSON.stringify(p.rating));
console.log(`\n${failures ? failures + ' FAILURES' : 'all ok'} in ${Date.now() - t0}ms`);
process.exit(failures ? 1 : 0);
