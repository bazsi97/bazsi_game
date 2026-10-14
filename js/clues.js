// Clue types. Each clue is plain data ({type, ...}) so puzzles can be saved/shared as JSON.
// To add a new clue type: add a `test` (is cell `i` consistent with the clue?) and a `text`.

import { OBJECTS } from './themes.js';

export const rowOf = (p, i) => Math.floor(i / p.n);
export const colOf = (p, i) => i % p.n;

export function isFree(p, i) {
  const o = p.cells[i].obj;
  return !o || OBJECTS[o].occupiable;
}

export function neighbours(p, i) {
  const r = rowOf(p, i), c = colOf(p, i), out = [];
  if (r > 0) out.push(i - p.n);
  if (r < p.n - 1) out.push(i + p.n);
  if (c > 0) out.push(i - 1);
  if (c < p.n - 1) out.push(i + 1);
  return out;
}

// "beside" = directly above/below/left/right AND in the same area (book rule).
export function besideKinds(p, i) {
  const kinds = new Set();
  for (const j of neighbours(p, i)) {
    if (p.cells[j].area === p.cells[i].area && p.cells[j].obj) kinds.add(p.cells[j].obj);
  }
  return kinds;
}

const CLUES = {
  on: {
    test: (p, c, i) => p.cells[i].obj === c.obj,
    text: (p, c, he) => `${he} was ${OBJECTS[c.obj].onText.replace('{a}', article(p, c.obj))}.`,
  },
  beside: {
    test: (p, c, i) => besideKinds(p, i).has(c.obj),
    text: (p, c, he) => `${he} was <b>beside</b> ${article(p, c.obj)} <b>${OBJECTS[c.obj].name}</b>.`,
  },
  in: {
    test: (p, c, i) => p.cells[i].area === c.area,
    text: (p, c, he) => `${he} was in the <b>${p.areas[c.area].name}</b>.`,
  },
  notIn: {
    test: (p, c, i) => p.cells[i].area !== c.area,
    text: (p, c, he) => `${he} was <b>not</b> in the <b>${p.areas[c.area].name}</b>.`,
  },
};

function article(p, kind) {
  const count = p.cells.filter((c) => c.obj === kind).length;
  return count === 1 ? 'the' : 'a';
}

export function clueTest(p, clue, i) {
  return CLUES[clue.type].test(p, clue, i);
}

export function clueText(p, person, clue) {
  const he = person.gender === 'f' ? 'She' : 'He';
  return CLUES[clue.type].text(p, clue, he);
}

// Cells a person could occupy given only their own clues.
export function domainFor(p, person) {
  const out = [];
  for (let i = 0; i < p.n * p.n; i++) {
    if (!isFree(p, i)) continue;
    if (person.clues.every((c) => clueTest(p, c, i))) out.push(i);
  }
  return out;
}

// All true single-clue statements about a person standing on cell i (for the generator).
export function trueCluesAt(p, i) {
  const out = [];
  const o = p.cells[i].obj;
  if (o && OBJECTS[o].occupiable) out.push({ type: 'on', obj: o });
  for (const k of besideKinds(p, i)) if (k !== 'rug') out.push({ type: 'beside', obj: k });
  out.push({ type: 'in', area: p.cells[i].area });
  return out;
}
