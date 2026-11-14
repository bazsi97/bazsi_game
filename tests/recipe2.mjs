// Recipe 2 tests: node tests/recipe2.mjs [count] [theme]
// Every case on every board shape must be valid, uniquely solvable (across every possible liar),
// logically solvable, and, for Egypt, have alibis that fit the masks in exactly one way.

import { generatePuzzle, withLiar } from '../js/generator.js';
import { countSolutions, logicalSolve, aloneOk } from '../js/solver.js';
import { clueHolds, clueText, canStand } from '../js/clues.js';
import { countMatchings, alibiFits } from '../js/generator2.js';
import { alibiTable, whyNotKiller } from '../js/hints.js';
const N = Number(process.argv[2] || 12);
const only = process.argv[3];
let fails = 0;
const show = (p) => { let out = ''; for (let r = 0; r < p.h; r++) { for (let c = 0; c < p.w; c++) { const i = r * p.w + c; const k = p.solution.indexOf(i); const cell = p.cells[i]; out += cell.void ? '   ' : (k >= 0 ? p.people[k].initial : cell.obj ? cell.obj[0] : '.') + cell.area + ' '; } out += '\n'; } return out; };
for (const theme of ['manor', 'zeta', 'haunted', 'egypt']) {
  if (only && only !== theme) continue;
  for (const d of ['easy', 'medium', 'hard']) {
    const times = [], shapes = {}; let body = 0, pieces = 0, fb = 0;
    for (let seed = 1; seed <= N; seed++) {
      const t = Date.now(); let p;
      try { p = generatePuzzle({ seed, difficulty: d, theme, gen: 2 }); } catch (e) { fails++; console.log('FAIL', theme, d, seed, e.message); continue; }
      times.push(Date.now() - t);
      shapes[p.shape] = (shapes[p.shape] || 0) + 1; if (p.fellBack) fb++;
      const truth = p.impostor >= 0 ? withLiar(p, p.impostor) : p;
      const sol = p.solution; const tag = `${theme}-${d}-${seed}`;
      if (countSolutions(truth, 3).count !== 1) { fails++; console.log('FAIL unique', tag); }
      if (!logicalSolve(truth).solved) { fails++; console.log('FAIL logic', tag); }
      if (!aloneOk(p, sol)) { fails++; console.log('FAIL alone', tag); }
      if (!sol.every((i, k) => canStand(p, k, i))) { fails++; console.log('FAIL stand', tag); }
      if (new Set(sol.map((i) => Math.floor(i / p.w))).size !== sol.length || new Set(sol.map((i) => i % p.w)).size !== sol.length) { fails++; console.log('FAIL lines', tag); }
      truth.people.forEach((pr, k) => pr.clues.forEach((c) => { if (!clueHolds(truth, k, c, sol)) { fails++; console.log('FAIL clue', tag); } }));
      if (p.people[p.victim].clues.length) body++;
      pieces += p.pieces.length;
      if (p.unmask) {
        const masks = p.people.map((_, k) => k).filter((k) => !p.people[k].isVictim);
        const compat = p.unmask.suspects.map((s) => masks.map((m) => alibiFits(p, s.alibi, m)));
        if (countMatchings(compat, 3) !== 1) { fails++; console.log('FAIL unmask', tag); }
        p.unmask.suspects.forEach((s, i) => { if (!alibiFits(p, s.alibi, p.unmask.wears[i])) { fails++; console.log('FAIL alibi', tag); } });
        // a wrong name always gets a true reason: the alibi does not fit, or it leaves somebody maskless
        const fitsKiller = alibiTable(p).map((list) => list.includes(p.murderer));
        p.unmask.suspects.forEach((s, i) => {
          if (p.unmask.wears[i] === p.murderer) return;
          const why = whyNotKiller(p, i);
          if (why.fits !== fitsKiller[i] || !why.text.includes(s.name) || /could not each/.test(why.text)) { fails++; console.log('FAIL why-not', tag, why.text); }
        });
      }
      if (process.argv.includes('--show') && seed === 2 && d !== 'easy') { console.log(`\n${tag} [${p.shape}] ${p.headline}\n${show(p)}` + p.people.map((pr) => `  ${pr.name}${pr.isVictim ? ' [V]' : ''}: ${pr.clues.map((c) => clueText(p, pr, c).replace(/<[^>]+>/g, '')).join(' ')}`).join('\n'));
        if (p.unmask) console.log(p.unmask.suspects.map((s, i) => `   alibi ${s.name} (${p.people[p.unmask.wears[i]].name}): ${clueText(p, s, s.alibi).replace(/<[^>]+>/g, '')}`).join('\n')); }
    }
    console.log(`${theme} ${d}: avg ${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(0)}ms max ${Math.max(...times)}ms · body clue ${body}/${N} · big pieces ${(pieces / N).toFixed(1)}/case · fallback ${fb} · ${JSON.stringify(shapes)}`);
  }
}
console.log(fails ? fails + ' FAILS' : 'all ok');
process.exit(fails ? 1 : 0);
