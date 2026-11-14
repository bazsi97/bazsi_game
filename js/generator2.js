// Recipe 2: richer crime scenes.
//
// Everything recipe 1 (generator.js) does, plus:
//  - boards that are not square: rectangles, L-shapes with a corner cut away, stepped pyramids
//  - furniture that covers two or four squares (beds, long tables, sofas, big rugs)
//  - more rooms per theme, and the Egypt theme with its masks
//  - the body may come with a statement of its own ("found beside the fountain")
//
// A recipe is frozen once shipped: saved cases remember which recipe made them, so changing
// this file's output would break people's progress. New ideas go in a recipe 3.

import { Rng } from './rng.js';
import { OBJECTS, INDOOR_PATTERNS, NAMES, ROLES, THEMES, SHAPES, MASKS } from './themes.js';
import { trueCluesFor, ownDomainSize, CLUES } from './clues.js';
import { countSolutions, logicalSolve } from './solver.js';
import { DIFFICULTY, makeAlienCast, makeGhost, chooseThemedClues, isExact, sameClue } from './generator.js';

export function generatePuzzle2({ seed = 1, difficulty = 'medium', theme = 'manor' } = {}) {
  const T = THEMES[theme];
  const rules = T.rules[difficulty] || {};
  const rng = new Rng(`murdoku2:${theme}:${seed}:${difficulty}`);
  const target = { ...DIFFICULTY[difficulty], ...(T.targets?.[difficulty] || {}) };
  for (let attempt = 0; attempt < 260; attempt++) {
    const p = makeLayout(rng, T, difficulty, rules);
    if (!p) continue;
    if (!chooseClues(rng, p, target, rules)) continue;
    if (rules.masks && !makeUnmasking(rng, p, T)) continue;
    p.seed = seed;
    p.difficulty = difficulty;
    p.theme = theme;
    p.rules = rules;
    p.gen = 2;
    p.attempts = attempt + 1;
    dressCase(rng, p, T);
    return p;
  }
  if (difficulty === 'hard') return { ...generatePuzzle2({ seed, theme, difficulty: 'medium' }), difficulty, rules, fellBack: true };
  if (difficulty === 'medium') return { ...generatePuzzle2({ seed, theme, difficulty: 'easy' }), difficulty, rules, fellBack: true };
  throw new Error(`Could not generate puzzle for seed ${seed}`);
}

// ---------- board shape ----------

function makeShape(rng, T, difficulty) {
  const name = rng.weighted(T.shapes[difficulty]);
  const S = SHAPES[name];
  const { w, h } = S;
  const isVoid = new Array(w * h).fill(false);
  if (S.rows) {
    // stepped pyramid: each row is centred and `rows[r]` squares wide
    S.rows.forEach((len, r) => {
      const pad = (w - len) / 2;
      for (let c = 0; c < w; c++) if (c < pad || c >= w - pad) isVoid[r * w + c] = true;
    });
  }
  if (S.notch) {
    // cut a block out of one corner
    const [nw, nh] = S.notch;
    const right = rng.chance(0.5), bottom = rng.chance(0.5);
    for (let r = 0; r < nh; r++) {
      for (let c = 0; c < nw; c++) {
        const rr = bottom ? h - 1 - r : r, cc = right ? w - 1 - c : c;
        isVoid[rr * w + cc] = true;
      }
    }
  }
  return { name, w, h, isVoid, people: Math.min(w, h) };
}

// ---------- rooms ----------

function makeAreas(rng, w, h, isVoid, k) {
  const target = rng.chance(0.6) ? k + 1 : k;
  const rects = [{ r: 0, c: 0, h, w }];
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
  let grid = new Array(w * h).fill(-1);
  rects.forEach((R, id) => {
    for (let r = R.r; r < R.r + R.h; r++) for (let c = R.c; c < R.c + R.w; c++) if (!isVoid[r * w + c]) grid[r * w + c] = id;
  });
  const nb = (i) => {
    const out = [];
    if (i % w > 0) out.push(i - 1);
    if (i % w < w - 1) out.push(i + 1);
    if (i >= w) out.push(i - w);
    if (i + w < w * h) out.push(i + w);
    return out.filter((j) => !isVoid[j]);
  };
  // a cut-away corner can split a room in two: every connected piece becomes its own room
  const comp = new Array(w * h).fill(-1);
  let comps = 0;
  for (let i = 0; i < w * h; i++) {
    if (isVoid[i] || comp[i] >= 0) continue;
    const stack = [i];
    comp[i] = comps;
    while (stack.length) {
      const x = stack.pop();
      for (const y of nb(x)) if (comp[y] < 0 && grid[y] === grid[x]) { comp[y] = comps; stack.push(y); }
    }
    comps++;
  }
  grid = comp;
  // fold slivers (fewer than 3 squares) into the neighbour they share most wall with
  for (let guard = 0; guard < 20; guard++) {
    const size = {};
    grid.forEach((g) => { if (g >= 0) size[g] = (size[g] || 0) + 1; });
    const small = Object.keys(size).map(Number).filter((g) => size[g] < 3).sort((a, b) => a - b)[0];
    if (small == null) break;
    const border = {};
    grid.forEach((g, i) => { if (g === small) for (const j of nb(i)) if (grid[j] !== small) border[grid[j]] = (border[grid[j]] || 0) + 1; });
    const into = Object.keys(border).map(Number).sort((a, b) => border[b] - border[a] || a - b)[0];
    if (into == null) break;
    grid = grid.map((g) => (g === small ? into : g));
  }
  // optionally merge two neighbours into an L-shaped room, as recipe 1 does
  const ids = [...new Set(grid.filter((g) => g >= 0))];
  if (ids.length > k) {
    const pairs = new Set();
    grid.forEach((g, i) => { if (g >= 0) for (const j of nb(i)) if (grid[j] !== g) pairs.add(g < grid[j] ? `${g},${grid[j]}` : `${grid[j]},${g}`); });
    const [a, b] = rng.pick([...pairs].sort()).split(',').map(Number);
    grid = grid.map((g) => (g === b ? a : g));
  }
  const map = new Map();
  return grid.map((g) => {
    if (g < 0) return -1;
    if (!map.has(g)) map.set(g, map.size);
    return map.get(g);
  });
}

// ---------- people ----------

// One person per row and per column; the shorter side of the board is completely filled.
function placePeople(rng, w, h, isVoid, N) {
  const byRow = N === h;
  const lines = byRow ? h : w, cross = byRow ? w : h;
  const used = new Array(cross).fill(false);
  const out = [];
  const cell = (line, x) => (byRow ? line * w + x : x * w + line);
  const rec = (line) => {
    if (line === lines) return true;
    for (const x of rng.shuffle([...Array(cross).keys()])) {
      if (used[x] || isVoid[cell(line, x)]) continue;
      used[x] = true;
      out[line] = cell(line, x);
      if (rec(line + 1)) return true;
      used[x] = false;
    }
    return false;
  };
  return rec(0) ? out : null;
}

function makeCast(rng, n, T) {
  const roleList = T.roles[0].gender ? T.roles : ROLES;
  const names = T.names || NAMES;
  const roles = rng.shuffle(roleList).slice(0, n);
  const initials = new Set();
  return roles.map((role, idx) => {
    const gender = role.gender === 'any' ? rng.pick(['f', 'm']) : role.gender;
    const name = rng.shuffle(names[gender]).find((nm) => !initials.has(nm[0]));
    initials.add(name[0]);
    return { id: idx, name, initial: name[0], gender, role: role.id, title: role.title, lookSeed: rng.int(1e9), culture: T.names ? T.id : undefined };
  });
}

// Egypt with masks: the people on the board are masks; one unmasked victim.
function makeMaskCast(rng, n, T) {
  const masks = rng.shuffle(MASKS).slice(0, n);
  return masks.map((m, idx) => ({
    id: idx, name: m.name, initial: m.name.split(' ')[1][0], gender: 'x', masked: true, mask: m.id,
    role: 'mask', title: `mask of ${m.god}`, lookSeed: rng.int(1e9),
  }));
}

// ---------- layout ----------

function makeLayout(rng, T, difficulty, rules) {
  const shape = makeShape(rng, T, difficulty);
  const { w, h, isVoid } = shape;
  const N = shape.people;
  const squares = isVoid.filter((v) => !v).length;
  const lo = Math.floor(squares / 9.5) + 1;
  const grid = makeAreas(rng, w, h, isVoid, rng.range(lo, lo + 1));
  const areaCount = Math.max(...grid) + 1;
  if (areaCount < 3) return null;

  // rooms: at most one outdoor room, and it likes the edge of the board
  const pool = T.rooms2 || T.rooms;
  const indoor = rng.shuffle(pool.filter((t) => !t.outdoor));
  const outdoor = pool.filter((t) => t.outdoor);
  const types = [];
  for (let a = 0; a < areaCount; a++) types.push(indoor[a % indoor.length]);
  if (outdoor.length && rng.chance(0.75)) {
    const edge = [...new Set(grid.filter((g, i) => g >= 0 && (i < w || i % w === 0 || i % w === w - 1 || i >= w * (h - 1))))];
    types[rng.pick(edge)] = rng.pick(outdoor);
  }
  const usedPatterns = new Set();
  const areas = types.map((t, id) => {
    let pattern = t.pattern;
    if (usedPatterns.has(pattern)) pattern = INDOOR_PATTERNS.find((x) => !usedPatterns.has(x)) || pattern;
    usedPatterns.add(pattern);
    return { id, type: t.id, name: t.name, pattern };
  });

  const solution = placePeople(rng, w, h, isVoid, N);
  if (!solution) return null;
  const counts = {};
  for (const i of solution) counts[grid[i]] = (counts[grid[i]] || 0) + 1;
  const victimCandidates = solution.map((_, k) => k).filter((k) => counts[grid[solution[k]]] === 2);
  if (!victimCandidates.length) return null;
  const v = rng.pick(victimCandidates);
  const murderer = solution.findIndex((i, k) => k !== v && grid[i] === grid[solution[v]]);
  const ghostK = rules.ghost ? rng.pick(solution.map((_, k) => k).filter((k) => k !== v)) : -1;
  const ghostCell = ghostK >= 0 ? solution[ghostK] : -1;

  // furniture
  const occupied = new Set(solution);
  const cells = grid.map((area, i) => (isVoid[i] ? { area: -1, obj: null, void: true } : { area, obj: null }));
  const pieces = [];
  // 1) big pieces first, one or two per room
  for (let a = 0; a < areaCount; a++) {
    const big = types[a].big;
    if (!big) continue;
    const size = grid.filter((g) => g === a).length;
    const wanted = size >= 8 && rng.chance(0.4) ? 2 : rng.chance(0.75) ? 1 : 0;
    for (let n = 0; n < wanted; n++) {
      const [kind, pw, ph] = rng.weighted(big.map((b) => [b, b[3]]));
      const blocker = !OBJECTS[kind].occupiable;
      const spots = [];
      for (let r = 0; r + ph <= h; r++) {
        for (let c = 0; c + pw <= w; c++) {
          let ok = true;
          for (let dr = 0; dr < ph && ok; dr++) {
            for (let dc = 0; dc < pw && ok; dc++) {
              const i = (r + dr) * w + c + dc;
              if (grid[i] !== a || cells[i].obj || i === ghostCell || (blocker && occupied.has(i))) ok = false;
            }
          }
          if (ok) spots.push([r, c]);
        }
      }
      if (!spots.length) continue;
      const [r, c] = rng.pick(spots);
      for (let dr = 0; dr < ph; dr++) for (let dc = 0; dc < pw; dc++) {
        const i = (r + dr) * w + c + dc;
        cells[i].obj = kind;
        cells[i].piece = pieces.length;
      }
      pieces.push({ kind, r, c, w: pw, h: ph });
    }
  }
  // 2) single pieces: seats under people, decoys and obstacles elsewhere
  cells.forEach((cell, i) => {
    if (cell.void || cell.obj) return;
    const palette = Object.entries(types[cell.area].objects);
    if (i === ghostCell) {
      const blockers = palette.filter(([o]) => !OBJECTS[o].occupiable);
      if (blockers.length && rng.chance(0.8)) cell.obj = rng.weighted(blockers);
    } else if (occupied.has(i)) {
      const seats = palette.filter(([o]) => OBJECTS[o].occupiable);
      if (seats.length && rng.chance(0.55)) cell.obj = rng.weighted(seats);
    } else if (rng.chance(0.36)) {
      cell.obj = rng.weighted(palette);
    }
  });

  const p = { w, h, shape: shape.name, cells, areas, pieces, people: [], solution: [], victim: -1, murderer: -1 };
  if (w === h) p.n = w;
  if (rules.teleporters && !placePads(rng, p)) return null;

  const order = rng.shuffle([...Array(N).keys()]);
  const cast = rules.masks ? makeMaskCast(rng, N, T) : T.cast === 'alien' ? makeAlienCast(rng, N, T) : makeCast(rng, N, T);
  order.forEach((k, idx) => {
    const person = cast[idx];
    person.isVictim = k === v;
    person.clues = [];
    if (k === ghostK) makeGhost(rng, person, cast);
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
  if (rules.masks) {
    // the victim wore no mask: a named Egyptian whose initial clashes with no mask on the board
    const [named] = makeCast(rng, 1, T);
    const taken = new Set(p.people.filter((x) => !x.isVictim).map((x) => x.initial));
    const pool2 = (T.names || NAMES)[named.gender].filter((nm) => !taken.has(nm[0]));
    if (taken.has(named.initial) && pool2.length) { named.name = rng.pick(pool2); named.initial = named.name[0]; }
    Object.assign(p.people[p.victim], named, { id: p.people[p.victim].id, isVictim: true, clues: [], masked: undefined, mask: undefined });
  }
  return p;
}

function placePads(rng, p) {
  const w = p.w;
  const empty = p.cells.map((c, i) => i).filter((i) => !p.cells[i].void && !p.cells[i].obj);
  for (let t = 0; t < 40; t++) {
    const a = rng.pick(empty), b = rng.pick(empty);
    const dist = Math.abs(Math.floor(a / w) - Math.floor(b / w)) + Math.abs((a % w) - (b % w));
    if (a === b || p.cells[a].area === p.cells[b].area || dist < 3) continue;
    p.cells[a].pad = 0;
    p.cells[b].pad = 0;
    return true;
  }
  return false;
}

// ---------- statements ----------

const BODY_CLUES = new Set(['on', 'beside', 'in', 'rowHas', 'colHas', 'edge']);

function chooseClues(rng, p, target, rules) {
  const square = p.w === p.h && !p.cells.some((c) => c.void);
  if (rules.telepathy || rules.impostor) {
    return chooseThemedClues(rng, p, target, rules, { bodyClues: BODY_CLUES, bodyFrom: square ? 120 : 20 });
  }
  const options = p.people.map((person, k) => {
    const allowed = ([c]) => (person.isVictim ? BODY_CLUES.has(c.type)
      : c.type !== 'rel' || (target.relMax > 0 && (target.vague || isExact(c))));
    return trueCluesFor(p, k).filter(allowed).map(([c, w]) => [c, ownDomainSize(p, c, person.ghost ? k : null) === 1 ? w * 0.5 : w]);
  });
  const vi = p.victim;

  for (let tries = 0; tries < 170; tries++) {
    let relLeft = target.relMax;
    const pick = (opts) => {
      const usable = opts.filter(([c]) => c.type !== 'rel' || relLeft > 0);
      const c = rng.weighted(usable.length ? usable : opts);
      if (c.type === 'rel') relLeft--;
      return c;
    };
    p.people.forEach((person, k) => {
      person.clues = person.isVictim ? [] : [pick(options[k])];
    });
    // on boards that are not square the body no longer simply takes "the last free square",
    // so more often than not it is found somewhere worth mentioning
    if ((square ? tries >= 120 : tries >= 25) && options[vi].length && rng.chance(0.65)) {
      p.people[vi].clues = [rng.weighted(options[vi])];
    }
    if (tries >= 90) {
      const k = rng.int(p.people.length - 1);
      const extra = options[k].filter(([c]) => !sameClue(c, p.people[k].clues[0]));
      if (extra.length) p.people[k].clues.push(pick(extra));
    }
    if (relLeft < 0) continue;
    if (countSolutions(p, 2).count !== 1) continue;
    const rating = logicalSolve(p);
    if (!rating.solved) continue;
    if (rating.level > target.maxLevel || rating.level < target.minLevel) continue;
    if (rating.initialSingles > target.maxInitialSingles) continue;
    p.rating = { level: rating.level, used: rating.used, initialSingles: rating.initialSingles };
    p.deduction = rating.order.map((o) => o.person);
    return true;
  }
  return false;
}

// ---------- Egypt: who was behind which mask? ----------
// Each named suspect gives an alibi that is true of the square their mask stood on. The alibis
// must fit the masks in exactly one way, so the killer's name can be worked out, not guessed.

export function alibiFits(p, clue, maskIdx) {
  return CLUES[clue.type].own(p, clue, p.solution[maskIdx]);
}

export function countMatchings(compat, limit = 2) {
  const n = compat.length;
  const used = new Array(n).fill(false);
  let count = 0;
  (function rec(i) {
    if (count >= limit) return;
    if (i === n) { count++; return; }
    for (let m = 0; m < n; m++) {
      if (used[m] || !compat[i][m]) continue;
      used[m] = true;
      rec(i + 1);
      used[m] = false;
    }
  })(0);
  return count;
}

function makeUnmasking(rng, p, T) {
  const masks = p.people.map((_, k) => k).filter((k) => !p.people[k].isVictim);
  const taken = new Set([p.people[p.victim].name]);
  let suspects = null;
  for (let t = 0; t < 20 && !suspects; t++) {
    const cast = makeCast(rng, masks.length, T);
    if (cast.every((x) => !taken.has(x.name))) suspects = cast;
  }
  if (!suspects) return false;
  const wears = rng.shuffle(masks); // suspect i wore mask wears[i]
  const optionsFor = wears.map((m) => trueCluesFor(p, m)
    .filter(([c]) => BODY_CLUES.has(c.type) && !p.people[m].clues.some((own) => sameClue(own, c))));
  if (optionsFor.some((o) => !o.length)) return false;
  let best = null;
  for (let tries = 0; tries < 120; tries++) {
    const alibis = optionsFor.map((o) => rng.weighted(o));
    const compat = alibis.map((c) => masks.map((m) => alibiFits(p, c, m)));
    if (countMatchings(compat, 2) !== 1) continue;
    // a good set makes you think: some alibis fit more than one mask
    const open = compat.filter((row) => row.filter(Boolean).length > 1).length;
    if (!best || open > best.open) best = { alibis, open };
    if (open >= Math.min(3, masks.length - 1)) break;
  }
  if (!best) return false;
  p.unmask = {
    suspects: suspects.map((sp, i) => ({ ...sp, alibi: best.alibis[i] })),
    wears, // suspect index -> index in p.people of the mask they wore
  };
  return true;
}

function dressCase(rng, p, T) {
  const victim = p.people[p.victim];
  const estate = rng.pick(T.places);
  const fill = (s) => s
    .replace('{estate}', estate)
    .replace('{victim}', victim.name)
    .replace('{vrole}', victim.title)
    .replace('{count}', String(p.people.length - 1));
  p.estate = estate;
  p.headline = fill(rng.pick(T.headlines));
  p.lede = fill(rng.pick(T.ledes));
}
