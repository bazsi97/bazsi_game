// Puzzle generator: case number -> deterministic, uniquely-solvable puzzle.
//
// 1. Carve the grid into rooms (binary space partition, sometimes merged into L-shapes).
// 2. Place everyone on a random permutation (one per row and column).
// 3. Pick a victim who shares their room with exactly one other person (the murderer).
// 4. Furnish rooms (seats under people, decoys and obstacles elsewhere).
// 5. Try clue combinations (one per suspect) until the brute-force solver proves the answer is
//    unique AND the logical solver rates it at the requested difficulty.

import { Rng } from './rng.js';
import { OBJECTS, ROOM_TYPES, INDOOR_PATTERNS, ROLES, NAMES, ESTATES, HEADLINES, LEDES } from './themes.js';
import { trueCluesAt, domainFor } from './clues.js';
import { countSolutions, logicalSolve } from './solver.js';

export const DIFFICULTY = {
  easy: { maxLevel: 1, maxInitialSingles: 2, minLevel: 1 },
  medium: { maxLevel: 2, maxInitialSingles: 1, minLevel: 1 },
  hard: { maxLevel: 2, maxInitialSingles: 1, minLevel: 2 },
};

export function generatePuzzle({ seed = 1, n = 6, difficulty = 'medium' } = {}) {
  const rng = new Rng(`murdoku:${seed}:${n}:${difficulty}`);
  const target = DIFFICULTY[difficulty];
  for (let attempt = 0; attempt < 200; attempt++) {
    const p = makeLayout(rng, n);
    if (!p) continue;
    if (chooseClues(rng, p, target)) {
      p.seed = seed;
      p.difficulty = difficulty;
      p.attempts = attempt + 1;
      dressCase(rng, p);
      return p;
    }
  }
  // Never leave a player without a case: fall back to an easier target with the same seed.
  if (difficulty === 'hard') return generatePuzzle({ seed, n, difficulty: 'medium' });
  if (difficulty === 'medium') return generatePuzzle({ seed, n, difficulty: 'easy' });
  throw new Error(`Could not generate puzzle for seed ${seed}`);
}

function makeLayout(rng, n) {
  const k = n <= 5 ? rng.range(3, 4) : rng.range(4, 5);
  const grid = makeAreas(rng, n, k);
  const areaCount = Math.max(...grid) + 1;

  // Rooms
  const hasGarden = rng.chance(0.75);
  const indoor = rng.shuffle(ROOM_TYPES.filter((t) => !t.outdoor));
  const types = [];
  for (let a = 0; a < areaCount; a++) types.push(indoor[a]);
  if (hasGarden) {
    // the garden prefers an area on the top edge
    const top = [...new Set(grid.slice(0, n))];
    types[rng.pick(top)] = ROOM_TYPES.find((t) => t.outdoor);
  }
  const usedPatterns = new Set();
  const areas = types.map((t, id) => {
    let pattern = t.pattern;
    if (usedPatterns.has(pattern)) pattern = INDOOR_PATTERNS.find((x) => !usedPatterns.has(x));
    usedPatterns.add(pattern);
    return { id, type: t.id, name: t.name, pattern };
  });

  // People on a permutation
  const cols = rng.shuffle([...Array(n).keys()]);
  const solution = cols.map((c, r) => r * n + c); // person k at row k (shuffled later)
  const areaOf = (i) => grid[i];
  const counts = {};
  for (const i of solution) counts[areaOf(i)] = (counts[areaOf(i)] || 0) + 1;
  const victimCandidates = solution.map((_, k) => k).filter((k) => counts[areaOf(solution[k])] === 2);
  if (!victimCandidates.length) return null;
  const v = rng.pick(victimCandidates);
  const murderer = solution.findIndex((i, k) => k !== v && areaOf(i) === areaOf(solution[v]));

  // Furniture
  const occupied = new Set(solution);
  const cells = grid.map((area, i) => {
    const t = types[area];
    const palette = Object.entries(t.objects);
    let obj = null;
    if (occupied.has(i)) {
      const seats = palette.filter(([o]) => OBJECTS[o].occupiable);
      if (seats.length && rng.chance(0.6)) obj = rng.weighted(seats);
    } else if (rng.chance(0.42)) {
      obj = rng.weighted(palette);
    }
    return { area, obj };
  });

  // Every row and column must still have room for someone, otherwise the layout is degenerate.
  const p = { n, cells, areas, people: [], solution: [], victim: -1, murderer: -1 };

  const order = rng.shuffle([...Array(n).keys()]);
  const cast = makeCast(rng, n);
  order.forEach((k, idx) => {
    const person = cast[idx];
    person.isVictim = k === v;
    person.clues = [];
    p.people.push(person);
    p.solution.push(solution[k]);
    if (k === v) p.victim = idx;
    if (k === murderer) p.murderer = idx;
  });
  // victim last in the list, like the book
  const vi = p.victim;
  const [vp] = p.people.splice(vi, 1);
  const [vs] = p.solution.splice(vi, 1);
  p.people.push(vp);
  p.solution.push(vs);
  if (p.murderer > vi) p.murderer--;
  p.victim = p.people.length - 1;
  return p;
}

function makeAreas(rng, n, k) {
  const target = rng.chance(0.6) ? k + 1 : k; // one extra, merged later into an L-shape
  let rects = [{ r: 0, c: 0, h: n, w: n }];
  for (let guard = 0; rects.length < target && guard < 200; guard++) {
    rects.sort((a, b) => b.h * b.w - a.h * a.w);
    const idx = rng.int(Math.min(2, rects.length));
    const R = rects[idx];
    const vertical = R.w > R.h ? true : R.h > R.w ? false : rng.chance(0.5);
    const len = vertical ? R.w : R.h;
    if (len < 2) continue;
    const cut = rng.range(1, len - 1);
    const A = vertical ? { ...R, w: cut } : { ...R, h: cut };
    const B = vertical
      ? { r: R.r, c: R.c + cut, h: R.h, w: R.w - cut }
      : { r: R.r + cut, c: R.c, h: R.h - cut, w: R.w };
    if (A.h * A.w < 3 || B.h * B.w < 3) continue;
    rects.splice(idx, 1, A, B);
  }
  const grid = new Array(n * n);
  rects.forEach((R, id) => {
    for (let r = R.r; r < R.r + R.h; r++) for (let c = R.c; c < R.c + R.w; c++) grid[r * n + c] = id;
  });
  if (rects.length > k) {
    // merge a random adjacent pair
    const pairs = new Set();
    for (let i = 0; i < n * n; i++) {
      if (i % n < n - 1 && grid[i] !== grid[i + 1]) pairs.add(key(grid[i], grid[i + 1]));
      if (i + n < n * n && grid[i] !== grid[i + n]) pairs.add(key(grid[i], grid[i + n]));
    }
    const [a, b] = rng.pick([...pairs]).split(',').map(Number);
    for (let i = 0; i < grid.length; i++) if (grid[i] === b) grid[i] = a;
  }
  // renumber 0..m-1 in reading order
  const map = new Map();
  return grid.map((g) => {
    if (!map.has(g)) map.set(g, map.size);
    return map.get(g);
  });
}

const key = (a, b) => (a < b ? `${a},${b}` : `${b},${a}`);

function makeCast(rng, n) {
  const roles = rng.shuffle(ROLES).slice(0, n);
  const initials = new Set();
  return roles.map((role, idx) => {
    const gender = role.gender === 'any' ? rng.pick(['f', 'm']) : role.gender;
    const name = rng.shuffle(NAMES[gender]).find((nm) => !initials.has(nm[0]));
    initials.add(name[0]);
    return { id: idx, name, initial: name[0], gender, role: role.id, title: role.title, lookSeed: rng.int(1e9) };
  });
}

function chooseClues(rng, p, target) {
  const options = p.people.map((person, k) => {
    if (person.isVictim) return [];
    return trueCluesAt(p, p.solution[k]).map((c) => {
      const size = domainFor(p, { clues: [c] }).length;
      // object clues are more fun than "in the Kitchen"; avoid clues that point at a single cell
      let w = c.type === 'in' ? 1 : 2.5;
      if (size === 1) w *= 0.5;
      return [c, w];
    });
  });

  for (let tries = 0; tries < 150; tries++) {
    p.people.forEach((person, k) => {
      person.clues = person.isVictim ? [] : [rng.weighted(options[k])];
    });
    if (tries >= 90) {
      // later tries: one suspect gets a second statement
      const k = rng.int(p.people.length - 1);
      const extra = options[k].filter(([c]) => !sameClue(c, p.people[k].clues[0]));
      if (extra.length) p.people[k].clues.push(rng.weighted(extra));
    }
    const { count } = countSolutions(p, 2);
    if (count !== 1) continue;
    const rating = logicalSolve(p);
    if (!rating.solved && target.maxLevel < 3) continue;
    if (rating.level > target.maxLevel || rating.level < target.minLevel) continue;
    if (rating.initialSingles > target.maxInitialSingles) continue;
    p.rating = { level: rating.level, used: rating.used, initialSingles: rating.initialSingles };
    p.deduction = rating.order.map((o) => o.person);
    return true;
  }
  return false;
}

const sameClue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function dressCase(rng, p) {
  const victim = p.people[p.victim];
  const estate = rng.pick(ESTATES);
  const fill = (s) => s
    .replace('{estate}', estate)
    .replace('{victim}', victim.name)
    .replace('{vrole}', victim.title)
    .replace('{count}', String(p.people.length - 1));
  p.estate = estate;
  p.headline = fill(rng.pick(HEADLINES));
  p.lede = fill(rng.pick(LEDES));
}
