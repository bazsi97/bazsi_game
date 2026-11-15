// Two solvers:
//  - countSolutions: brute force, used to PROVE a puzzle has exactly one answer.
//  - logicalSolve: solves like a human would, technique by technique, used to RATE difficulty
//    and to give hints in a sensible order.

import { domainFor, relationsOf, relHolds, widthOf, heightOf, presentWorlds } from './clues.js';

export function victimIndex(p) {
  return p.people.findIndex((x) => x.isVictim);
}

// Victim rule: the victim's area holds exactly one other person (the murderer).
export function aloneOk(p, pos) {
  const v = victimIndex(p);
  const a = p.cells[pos[v]].area;
  let others = 0, who = -1;
  pos.forEach((i, k) => { if (k !== v && p.cells[i].area === a) { others++; who = k; } });
  // p.killers (recipe 3): the murderer is known to be one of these people, e.g. the naughty list
  return others === 1 && (!p.killers || p.killers.includes(who));
}

export function countSolutions(p, limit = 2) {
  const n = widthOf(p);
  const doms = p.people.map((_, k) => domainFor(p, k));
  // binary clues ("one row north of Hugo") are checked as soon as both people are placed
  const relsBy = p.people.map(() => []);
  for (const r of relationsOf(p)) { relsBy[r.k].push(r); relsBy[r.who].push(r); }
  const order = p.people.map((_, k) => k)
    .sort((a, b) => (p.people[a].isVictim - p.people[b].isVictim) || doms[a].length - doms[b].length);
  const rowUsed = new Array(heightOf(p)).fill(false);
  const colUsed = new Array(n).fill(false);
  const pos = new Array(p.people.length);
  let count = 0;
  let first = null;

  (function rec(d) {
    if (count >= limit) return;
    if (d === order.length) {
      if (aloneOk(p, pos)) {
        count++;
        if (!first) first = pos.slice();
      }
      return;
    }
    const k = order[d];
    for (const i of doms[k]) {
      const r = Math.floor(i / n), c = i % n;
      if (rowUsed[r] || colUsed[c]) continue;
      pos[k] = i;
      const ok = relsBy[k].every((x) => pos[x.k] == null || pos[x.who] == null
        || relHolds(p, x.clue, pos[x.k], pos[x.who]));
      if (ok) {
        rowUsed[r] = colUsed[c] = true;
        rec(d + 1);
        rowUsed[r] = colUsed[c] = false;
      }
      pos[k] = undefined;
    }
  })(0);

  return { count, first };
}

// Technique levels: 1 = easy, 2 = medium, 3 = needs trial and error.
// Options (used by hints only; generation calls it bare):
//   fixed: [cell|null per person]  people already correctly on the board
//   log:   []                       receives { place } and { k, cells, why } events in order
export function logicalSolve(p, { fixed = null, log = null } = {}) {
  const n = widthOf(p);
  const P = p.people.length;
  // On a non-square board only the shorter direction is guaranteed to have someone in every line.
  const lineCount = [heightOf(p), n];
  const lineFull = [P === heightOf(p), P === n];
  const vi = victimIndex(p);
  // Wrapped presents (recipe 3): one "world" per way the toys could sit under the wrappings.
  // A square is possible while some live world allows it; a world dies when it strands somebody.
  const worlds = p.presents
    ? presentWorlds(p).map((v) => ({ kinds: v.world, dom: p.people.map((_, k) => new Set(domainFor(v, k))) })) : null;
  let live = worlds;
  const deadPairs = []; // { gift, kind, stuck } pairings ruled out so far, for the hints
  const startDomain = (k) => (worlds ? [...new Set(worlds.flatMap((w) => [...w.dom[k]]))].sort((a, b) => a - b) : domainFor(p, k));
  const cand = p.people.map((_, k) => new Set(fixed?.[k] != null ? [fixed[k]] : startDomain(k)));
  const rels = relationsOf(p);
  let why = null; // reason attached to removals while logging
  const placed = new Array(P).fill(false);
  const order = [];
  const used = {};
  let maxLevel = 0;
  const lines = [(i) => Math.floor(i / n), (i) => i % n];
  const A = (i) => p.cells[i].area;

  const bump = (level, name) => {
    maxLevel = Math.max(maxLevel, level);
    used[name] = (used[name] || 0) + 1;
  };
  const removeWhere = (k, pred) => {
    let ch = false;
    const gone = [];
    for (const i of [...cand[k]]) if (pred(i)) { cand[k].delete(i); gone.push(i); ch = true; }
    if (log && gone.length) log.push({ k, cells: gone, why });
    return ch;
  };

  const initialSingles = p.people.filter((pr, k) => !pr.isVictim && cand[k].size === 1).length;

  function singles() {
    let ch = false;
    for (let k = 0; k < P; k++) {
      if (placed[k] || cand[k].size !== 1) continue;
      const i = [...cand[k]][0];
      placed[k] = true;
      order.push({ person: k, cell: i });
      if (log) log.push({ place: k, cell: i });
      why = { tech: 'single', who: k, cell: i };
      for (let j = 0; j < P; j++) {
        if (j !== k) removeWhere(j, (x) => lines.some((L) => L(x) === L(i)));
      }
      bump(1, 'single');
      ch = true;
    }
    return ch;
  }

  // Each row/column holds exactly one person: if only one person can reach a line, they're in it.
  function hiddenLine() {
    for (const L of lines) {
      const axis = L === lines[0] ? 0 : 1;
      if (!lineFull[axis]) continue;
      for (let v = 0; v < lineCount[axis]; v++) {
        const holders = [];
        for (let k = 0; k < P; k++) if ([...cand[k]].some((x) => L(x) === v)) holders.push(k);
        why = { tech: 'line', axis: L === lines[0] ? 'row' : 'col', v, who: holders[0] };
        if (holders.length === 1 && removeWhere(holders[0], (x) => L(x) !== v)) {
          bump(1, 'line');
          return true;
        }
      }
    }
    return false;
  }

  // Person confined to one row/column blocks it for everyone else.
  function pointing() {
    for (const L of lines) {
      for (let k = 0; k < P; k++) {
        if (placed[k]) continue;
        const ls = new Set([...cand[k]].map(L));
        if (ls.size !== 1) continue;
        const v = [...ls][0];
        let ch = false;
        why = { tech: 'pointing', axis: L === lines[0] ? 'row' : 'col', v, who: k };
        for (let j = 0; j < P; j++) if (j !== k) ch = removeWhere(j, (x) => L(x) === v) || ch;
        if (ch) { bump(1, 'pointing'); return true; }
      }
    }
    return false;
  }

  function alone() {
    if (vi < 0) return false;
    const suspects = [...Array(P).keys()].filter((k) => k !== vi);
    const canBeIn = (k, a) => [...cand[k]].some((x) => A(x) === a);
    const mustBeIn = (k, a) => [...cand[k]].every((x) => A(x) === a);
    let ch = false;
    for (let a = 0; a < p.areas.length; a++) {
      const definite = suspects.filter((k) => mustBeIn(k, a)).length;
      const possible = suspects.filter((k) => canBeIn(k, a)).length;
      why = { tech: 'alone', kind: definite >= 2 ? 'crowded' : 'empty', area: a };
      if (definite >= 2 || possible === 0) ch = removeWhere(vi, (x) => A(x) === a) || ch;
    }
    const vAreas = new Set([...cand[vi]].map(A));
    if (vAreas.size === 1) {
      const a = [...vAreas][0];
      const possibles = suspects.filter((k) => canBeIn(k, a));
      why = { tech: 'alone', kind: 'forced', area: a };
      if (possibles.length === 1) ch = removeWhere(possibles[0], (x) => A(x) !== a) || ch;
      const defs = suspects.filter((k) => mustBeIn(k, a));
      why = { tech: 'alone', kind: 'taken', area: a, who: defs[0] };
      if (defs.length === 1) {
        for (const k of suspects) if (k !== defs[0]) ch = removeWhere(k, (x) => A(x) === a) || ch;
      }
    }
    if (ch) bump(2, 'alone');
    return ch;
  }

  // k people who between them can only reach k rows own those rows.
  function subsets() {
    const open = [...Array(P).keys()].filter((k) => !placed[k]);
    for (const size of [2, 3]) {
      for (const combo of combos(open, size)) {
        for (const L of lines) {
          const ls = new Set();
          for (const k of combo) for (const x of cand[k]) ls.add(L(x));
          if (ls.size !== size) continue;
          let ch = false;
          why = { tech: 'subset', axis: L === lines[0] ? 'row' : 'col', who: combo, lines: [...ls].sort((a, b) => a - b) };
          for (let j = 0; j < P; j++) {
            if (!combo.includes(j)) ch = removeWhere(j, (x) => ls.has(L(x))) || ch;
          }
          if (ch) { bump(2, 'subset'); return true; }
        }
      }
    }
    return false;
  }

  // Binary clues: keep a cell only if the other person still has a compatible cell.
  // Easy when the other person is already placed, medium otherwise.
  function relations() {
    for (const { k, who, clue } of rels) {
      const easy = placed[k] || placed[who];
      const compatible = (x, y) => x !== y && lines.every((L) => L(x) !== L(y)) && relHolds(p, clue, x, y);
      why = { tech: 'relation', owner: k, other: who, clue };
      let ch = removeWhere(k, (x) => ![...cand[who]].some((y) => compatible(x, y)));
      ch = removeWhere(who, (y) => ![...cand[k]].some((x) => compatible(x, y))) || ch;
      if (ch) { bump(easy ? 1 : 2, 'relation'); return true; }
    }
    return false;
  }

  // Presents: drop pairings of wrapping and toy that would leave somebody with nowhere to stand,
  // then drop squares that fit under no pairing still standing.
  function presents() {
    let ch = false;
    const before = live;
    const stuckIn = new Map();
    live = live.filter((w) => {
      const k = cand.findIndex((s, j) => ![...s].some((x) => w.dom[j].has(x)));
      if (k >= 0) stuckIn.set(w, k);
      return k < 0;
    });
    if (live.length < before.length) {
      ch = true;
      const G = p.presents.cells.length;
      for (let g = 0; g < G; g++) {
        for (const kind of p.presents.kinds) {
          const had = before.filter((w) => w.kinds[g] === kind);
          if (!had.length || live.some((w) => w.kinds[g] === kind)) continue;
          const who = new Set(had.map((w) => stuckIn.get(w)));
          deadPairs.push({ gift: g, kind, stuck: who.size === 1 ? [...who][0] : -1 });
        }
      }
      if (log) log.push({ presents: possibleKinds(), out: deadPairs.slice() });
    }
    for (let k = 0; k < P; k++) {
      why = { tech: 'present', possible: possibleKinds(), out: deadPairs.slice() };
      ch = removeWhere(k, (x) => !live.some((w) => w.dom[k].has(x))) || ch;
    }
    if (ch) bump(2, 'present');
    return ch;
  }
  // per present: the toys it could still hide
  function possibleKinds() {
    return p.presents.cells.map((_, g) => [...new Set(live.map((w) => w.kinds[g]))]);
  }

  // The naughty list (recipe 3): the murderer is one of p.killers. Santa cannot be in a room
  // none of them can reach, and once his room is known everybody else stays out of it.
  function listRule() {
    if (vi < 0) return false;
    const K = new Set(p.killers);
    const suspects = [...Array(P).keys()].filter((k) => k !== vi);
    let ch = false;
    for (let a = 0; a < p.areas.length; a++) {
      why = { tech: 'list', kind: 'unreachable', area: a };
      if (!suspects.some((k) => K.has(k) && [...cand[k]].some((x) => A(x) === a))) ch = removeWhere(vi, (x) => A(x) === a) || ch;
    }
    const vAreas = new Set([...cand[vi]].map(A));
    if (vAreas.size === 1) {
      const a = [...vAreas][0];
      for (const k of suspects) {
        if (K.has(k)) continue;
        why = { tech: 'list', kind: 'nice', area: a, who: k };
        ch = removeWhere(k, (x) => A(x) === a) || ch;
      }
    }
    if (ch) bump(1, 'list');
    return ch;
  }

  const techniques = [singles, hiddenLine, pointing, ...(p.killers ? [listRule] : []), ...(worlds ? [presents] : []), relations, alone, subsets];
  while (!placed.every(Boolean)) {
    if (cand.some((s) => s.size === 0)) break;
    if (!techniques.some((t) => t())) break;
  }

  const solved = placed.every(Boolean) && cand.every((s) => s.size === 1);
  // with everybody placed, only wrappings that fit where they stand remain
  if (worlds && solved) live = live.filter((w) => cand.every((s, j) => [...s].some((x) => w.dom[j].has(x))));
  const contradiction = cand.some((s) => s.size === 0);
  const stuck = cand.findIndex((s) => s.size === 0);
  return { solved, level: solved ? maxLevel : 3, used, order, initialSingles, contradiction, stuck, presents: worlds ? possibleKinds() : null };
}

function combos(arr, k, start = 0, acc = [], out = []) {
  if (acc.length === k) { out.push(acc.slice()); return out; }
  for (let i = start; i < arr.length; i++) {
    acc.push(arr[i]);
    combos(arr, k, i + 1, acc, out);
    acc.pop();
  }
  return out;
}
