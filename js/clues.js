// Clue types. Each clue is plain data ({type, ...}) so puzzles can be saved/shared as JSON.
//
// A clue type can constrain the solution in three ways:
//   own(p, c, i)        - may the clue's owner stand on cell i?
//   others(p, c, i)     - may anyone ELSE stand on cell i?  ("the only one in the Kitchen")
//   rel(p, c, i, j)     - owner on i, the referenced person (c.who) on j: does it hold?
// plus text(p, c, he) for the statement shown on the card.
// North is the top of the board.

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

function lineHas(p, i, kind, byRow) {
  for (let k = 0; k < p.n; k++) {
    const j = byRow ? rowOf(p, i) * p.n + k : k * p.n + colOf(p, i);
    if (j !== i && p.cells[j].obj === kind) return true;
  }
  return false;
}

const name = (p, c) => `<b>${p.people[c.who].name}</b>`;
const objName = (c) => `<b>${OBJECTS[c.obj].name}</b>`;

const EDGES = {
  top: { test: (p, i) => rowOf(p, i) === 0, text: 'in the <b>top row</b>' },
  bottom: { test: (p, i) => rowOf(p, i) === p.n - 1, text: 'in the <b>bottom row</b>' },
  left: { test: (p, i) => colOf(p, i) === 0, text: 'in the <b>leftmost column</b>' },
  right: { test: (p, i) => colOf(p, i) === p.n - 1, text: 'in the <b>rightmost column</b>' },
};

export const RELATIONS = {
  N1: { test: (p, i, j) => rowOf(p, i) === rowOf(p, j) - 1, text: '<b>one row north</b> of' },
  S1: { test: (p, i, j) => rowOf(p, i) === rowOf(p, j) + 1, text: '<b>one row south</b> of' },
  W1: { test: (p, i, j) => colOf(p, i) === colOf(p, j) - 1, text: '<b>one column west</b> of' },
  E1: { test: (p, i, j) => colOf(p, i) === colOf(p, j) + 1, text: '<b>one column east</b> of' },
  N: { test: (p, i, j) => rowOf(p, i) < rowOf(p, j), text: 'somewhere <b>north</b> of' },
  S: { test: (p, i, j) => rowOf(p, i) > rowOf(p, j), text: 'somewhere <b>south</b> of' },
  W: { test: (p, i, j) => colOf(p, i) < colOf(p, j), text: 'somewhere <b>west</b> of' },
  E: { test: (p, i, j) => colOf(p, i) > colOf(p, j), text: 'somewhere <b>east</b> of' },
  diag: {
    test: (p, i, j) => Math.abs(rowOf(p, i) - rowOf(p, j)) === 1 && Math.abs(colOf(p, i) - colOf(p, j)) === 1,
    text: '<b>diagonally next to</b>',
  },
};

export const CLUES = {
  on: {
    own: (p, c, i) => p.cells[i].obj === c.obj,
    text: (p, c, he) => `${he} was ${OBJECTS[c.obj].onText.replace('{a}', article(p, c.obj))}.`,
  },
  beside: {
    own: (p, c, i) => besideKinds(p, i).has(c.obj),
    text: (p, c, he) => `${he} was <b>beside</b> ${article(p, c.obj)} ${objName(c)}.`,
  },
  in: {
    own: (p, c, i) => p.cells[i].area === c.area,
    text: (p, c, he) => `${he} was in the <b>${p.areas[c.area].name}</b>.`,
  },
  notIn: {
    own: (p, c, i) => p.cells[i].area !== c.area,
    text: (p, c, he) => `${he} was <b>not</b> in the <b>${p.areas[c.area].name}</b>.`,
  },
  rowHas: {
    own: (p, c, i) => lineHas(p, i, c.obj, true),
    text: (p, c, he) => `${he} was in the <b>same row</b> as ${article(p, c.obj)} ${objName(c)}.`,
  },
  colHas: {
    own: (p, c, i) => lineHas(p, i, c.obj, false),
    text: (p, c, he) => `${he} was in the <b>same column</b> as ${article(p, c.obj)} ${objName(c)}.`,
  },
  edge: {
    own: (p, c, i) => EDGES[c.side].test(p, i),
    text: (p, c, he) => `${he} was ${EDGES[c.side].text}.`,
  },
  onlyIn: {
    own: (p, c, i) => p.cells[i].area === c.area,
    others: (p, c, i) => p.cells[i].area !== c.area,
    text: (p, c, he) => `${he} was the <b>only one</b> in the <b>${p.areas[c.area].name}</b>.`,
  },
  onlyOn: {
    own: (p, c, i) => p.cells[i].obj === c.obj,
    others: (p, c, i) => p.cells[i].obj !== c.obj,
    text: (p, c, he) => `${he} was the <b>only one</b> ${OBJECTS[c.obj].onText.replace('{a}', 'a')}.`,
  },
  rel: {
    rel: (p, c, i, j) => RELATIONS[c.rel].test(p, i, j),
    text: (p, c, he) => `${he} was ${RELATIONS[c.rel].text} ${name(p, c)}.`,
  },
};

function article(p, kind) {
  const count = p.cells.filter((c) => c.obj === kind).length;
  return count === 1 ? 'the' : 'a';
}

export function clueText(p, person, clue) {
  const he = person.gender === 'f' ? 'She' : 'He';
  return CLUES[clue.type].text(p, clue, he);
}

// Does a clue (owned by person k) hold in a full placement `pos`?
export function clueHolds(p, k, clue, pos) {
  const T = CLUES[clue.type];
  if (T.own && !T.own(p, clue, pos[k])) return false;
  if (T.others && pos.some((i, j) => j !== k && !T.others(p, clue, i))) return false;
  if (T.rel && !T.rel(p, clue, pos[k], pos[clue.who])) return false;
  return true;
}

// Binary constraints between two people: [{ k, who, clue }]
export function relationsOf(p) {
  const out = [];
  p.people.forEach((pr, k) => pr.clues.forEach((c) => { if (CLUES[c.type].rel) out.push({ k, who: c.who, clue: c }); }));
  return out;
}

// Cells person k could occupy given every single-cell constraint in the puzzle
// (their own clues, plus anyone's "only one" clues that keep others out).
export function domainFor(p, k) {
  const own = p.people[k].clues;
  const others = [];
  p.people.forEach((pr, j) => { if (j !== k) for (const c of pr.clues) if (CLUES[c.type].others) others.push(c); });
  const out = [];
  for (let i = 0; i < p.n * p.n; i++) {
    if (!isFree(p, i)) continue;
    if (!own.every((c) => !CLUES[c.type].own || CLUES[c.type].own(p, c, i))) continue;
    if (!others.every((c) => CLUES[c.type].others(p, c, i))) continue;
    out.push(i);
  }
  return out;
}

// How many cells a single clue alone allows for its owner (used to weight clue choice).
export function ownDomainSize(p, clue) {
  const T = CLUES[clue.type];
  if (!T.own) return p.n * p.n;
  let s = 0;
  for (let i = 0; i < p.n * p.n; i++) if (isFree(p, i) && T.own(p, clue, i)) s++;
  return s;
}

// Every true statement about person k given the full solution (for the generator).
export function trueCluesFor(p, k) {
  const sol = p.solution;
  const i = sol[k];
  const out = [];
  const o = p.cells[i].obj;
  const add = (c, w) => out.push([c, w]);
  if (o && OBJECTS[o].occupiable) {
    add({ type: 'on', obj: o }, 2.5);
    if (!sol.some((j, m) => m !== k && p.cells[j].obj === o)) add({ type: 'onlyOn', obj: o }, 1.2);
  }
  for (const kind of besideKinds(p, i)) if (kind !== 'rug') add({ type: 'beside', obj: kind }, 2.5);
  const area = p.cells[i].area;
  add({ type: 'in', area }, 1);
  if (!sol.some((j, m) => m !== k && p.cells[j].area === area)) add({ type: 'onlyIn', area }, 1.5);
  const kinds = new Set(p.cells.map((c) => c.obj).filter(Boolean));
  for (const kind of kinds) {
    if (lineHas(p, i, kind, true)) add({ type: 'rowHas', obj: kind }, 0.5);
    if (lineHas(p, i, kind, false)) add({ type: 'colHas', obj: kind }, 0.5);
  }
  for (const side of Object.keys(EDGES)) if (EDGES[side].test(p, i)) add({ type: 'edge', side }, 0.7);
  p.people.forEach((_, j) => {
    if (j === k) return;
    for (const [rel, R] of Object.entries(RELATIONS)) {
      if (!R.test(p, i, sol[j])) continue;
      const exact = rel.length === 2 || rel === 'diag';
      add({ type: 'rel', rel, who: j }, exact ? 0.8 : 0.25);
    }
  });
  return out;
}
