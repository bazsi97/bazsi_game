// Recipe 3: Who Killed Santa?
//
// Recipe 2's scenes (generator2.js builds the layout), plus two twists of its own:
//  - the naughty list: everyone on it lies (their whole statement is false), and the murderer
//    is on it. On Hard one name on the list is smudged and has to be worked out.
//  - wrapped presents: a few squares hold a present; the toys inside are known, but not which
//    toy is under which wrapping. Statements mention the toys ("beside the drum").
// Santa is always the victim.
//
// Each attempt has its own random stream, so a case can be rebuilt starting from the attempt
// that worked (cases3.js) and come out identical.
//
// Like every recipe this one is frozen once shipped: saved cases are rebuilt from their number.

import { Rng } from './rng.js';
import { OBJECTS, THEMES, TOYS, SANTA, XMAS_EPILOGUES } from './themes.js';
import { trueCluesFor, ownDomainSize, CLUES, withPresents, presentWorlds, neighbours, cellCount } from './clues.js';
import { countSolutions, logicalSolve } from './solver.js';
import { DIFFICULTY, isExact, sameClue } from './generator.js';
import { makeLayout, BODY_CLUES } from './generator2.js';
import { CASE_START } from './cases3.js';

export function generatePuzzle3({ seed = 1, difficulty = 'medium', theme = 'xmas', scan = false } = {}) {
  const T = THEMES[theme];
  const rules = T.rules[difficulty] || {};
  const target = { ...DIFFICULTY[difficulty], ...(T.targets?.[difficulty] || {}) };
  const start = scan ? 0 : CASE_START[theme]?.[difficulty]?.[seed - 1] ?? 0;
  const tree = !!T.treeCases?.[difficulty]?.includes(seed);
  const board = tree ? { ...T, shapes: { [difficulty]: [[T.treeShapes[difficulty], 1]] } } : T;
  for (let attempt = start; attempt < start + 900; attempt++) {
    const rng = new Rng(`murdoku3:${theme}:${seed}:${difficulty}:${attempt}`);
    const p = makeLayout(rng, board, difficulty, {});
    if (!p) continue;
    Object.assign(p.people[p.victim], SANTA);
    if (rules.presents && !placePresents(rng, p, rules.presents)) continue;
    if (!chooseClues3(rng, p, target, rules)) continue;
    p.seed = seed;
    p.difficulty = difficulty;
    p.theme = theme;
    p.rules = rules;
    p.gen = 3;
    p.attempt = attempt;
    const estate = rng.pick(T.places);
    const fill = (s) => s.replace('{estate}', estate).replace('{count}', String(p.people.length - 1));
    p.estate = estate;
    p.headline = fill(rng.pick(T.headlines));
    p.lede = fill(rng.pick(T.ledes));
    p.epilogue = rng.pick(XMAS_EPILOGUES);
    return p;
  }
  throw new Error(`Could not generate ${theme} ${difficulty} case ${seed}`);
}

// ---------- the naughty list ----------

// The puzzle as it would be if exactly these people were lying: their statements are turned
// round, and the murderer must be one of them.
export function viewFor(p, liars) {
  const set = new Set(liars);
  return {
    ...p,
    people: p.people.map((pr, k) => (set.has(k) ? { ...pr, clues: pr.clues.map((c) => ({ ...c, neg: !c.neg })) } : pr)),
    killers: [...set],
  };
}
// The puzzle as it really is.
export function truthOf(p) {
  if (!p.naughty) return p;
  return viewFor(p, [...p.naughty.known, ...(p.naughty.hidden >= 0 ? [p.naughty.hidden] : [])]);
}

// Answers over every way the toys could be wrapped.
export function countAll(view, limit = 2) {
  let total = 0;
  for (const w of presentWorlds(view)) {
    total += countSolutions(w, limit - total).count;
    if (total >= limit) break;
  }
  return total;
}

// ---------- wrapped presents ----------

function placePresents(rng, p, count) {
  const taken = new Set(p.solution);
  const body = p.solution[p.victim];
  const usable = (i) => !p.cells[i].void && !taken.has(i) && p.cells[i].piece == null
    && (!p.cells[i].obj || !OBJECTS[p.cells[i].obj].occupiable);
  const all = [...Array(cellCount(p)).keys()].filter(usable);
  // presents like to stand next to somebody, so that "beside the drum" has something to say
  const near = (i) => neighbours(p, i).filter((j) => p.cells[j].area === p.cells[i].area && taken.has(j) && j !== body);
  const picked = [];
  const seen = new Set();
  for (const i of rng.shuffle(all.filter((x) => near(x).length))) {
    if (picked.length >= 2) break;
    if (near(i).every((j) => seen.has(j))) continue;
    picked.push(i);
    near(i).forEach((j) => seen.add(j));
  }
  for (const i of rng.shuffle(all)) {
    if (picked.length >= count) break;
    if (!picked.includes(i)) picked.push(i);
  }
  if (picked.length < count) return false;
  const toys = rng.shuffle(TOYS).slice(0, count);
  const order = rng.shuffle(picked); // a present's number says nothing about where it stands
  order.forEach((i, g) => { p.cells[i] = { area: p.cells[i].area, obj: 'gift', gift: g }; });
  p.presents = { cells: order, kinds: toys.slice().sort(), hidden: toys };
  return true;
}

// ---------- statements ----------

const OWN_TYPES = new Set(['on', 'beside', 'in', 'rowHas', 'colHas', 'edge']);

// Things person k could claim that are not true of the square they stood on.
function falseClaims(truth, k) {
  const i = truth.solution[k];
  const out = [];
  const add = (c, w) => { if (!CLUES[c.type].own(truth, c, i) && ownDomainSize(truth, c) > 0) out.push([c, w]); };
  truth.areas.forEach((_, area) => add({ type: 'in', area }, 1.2));
  const kinds = [...new Set(truth.cells.map((c) => c.obj).filter(Boolean))].sort();
  for (const kind of kinds) {
    if (OBJECTS[kind].occupiable) add({ type: 'on', obj: kind }, 1.5);
    if (kind !== 'rug') add({ type: 'beside', obj: kind }, OBJECTS[kind].toy ? 2 : 1.2);
    add({ type: 'rowHas', obj: kind }, 0.3);
    add({ type: 'colHas', obj: kind }, 0.3);
  }
  for (const side of ['top', 'bottom', 'left', 'right']) add({ type: 'edge', side }, 0.5);
  return out;
}

function chooseClues3(rng, p, target, rules) {
  // the scene with the wrapping off: what is really true
  const truth = p.presents ? withPresents(p, p.presents.hidden) : p;
  const vi = p.victim;
  const suspects = p.people.map((_, k) => k).filter((k) => k !== vi);
  let known = [], hidden = -1;
  if (rules.list) {
    const pair = [p.murderer, rng.pick(suspects.filter((s) => s !== p.murderer))];
    if (rules.smudged) {
      hidden = rng.pick(pair);
      known = pair.filter((x) => x !== hidden);
    } else known = pair.sort((a, b) => a - b);
    p.naughty = { known, hidden };
  }
  const naughty = new Set([...known, ...(hidden >= 0 ? [hidden] : [])]);
  const square = p.w === p.h && !p.cells.some((c) => c.void);
  const boost = ([c, w]) => [c, c.obj && OBJECTS[c.obj].toy ? w * (c.type === 'beside' ? 1.6 : 4) : w];
  const options = p.people.map((person, k) => {
    const allowed = ([c]) => (k === vi ? BODY_CLUES.has(c.type)
      : (c.type !== 'rel' || (target.relMax > 0 && (target.vague || isExact(c))))
        // with a liar to find, "the only one" statements would be murky when turned round
        && !(rules.smudged && (c.type === 'onlyIn' || c.type === 'onlyOn')));
    return trueCluesFor(truth, k).filter(allowed).map(([c, w]) => [c, ownDomainSize(truth, c) === 1 ? w * 0.5 : w]).map(boost);
  });
  const plain = options.map((o) => o.filter(([c]) => OWN_TYPES.has(c.type)));
  const claims = p.people.map((_, k) => (naughty.has(k) ? falseClaims(truth, k) : []));

  for (let tries = 0; tries < 170; tries++) {
    let relLeft = target.relMax;
    const pick = (opts) => {
      const usable = opts.filter(([c]) => c.type !== 'rel' || relLeft > 0);
      const c = rng.weighted(usable.length ? usable : opts);
      if (c.type === 'rel') relLeft--;
      return c;
    };
    // a lie is either the denial of something true ("I was not beside the snowman") or a
    // plain false claim ("I was in the Workshop"); the smudged name always makes a claim,
    // so the way a statement is worded never gives the liar away
    const lie = (k) => {
      const deny = k !== hidden && plain[k].length && rng.chance(0.6);
      if (deny || !claims[k].length) return plain[k].length ? { ...rng.weighted(plain[k]), neg: true } : null;
      return rng.weighted(claims[k]);
    };
    let ok = true;
    p.people.forEach((person, k) => {
      if (k === vi) { person.clues = []; return; }
      const c = naughty.has(k) ? lie(k) : pick(options[k]);
      if (!c) ok = false;
      person.clues = c ? [c] : [];
    });
    if (!ok) continue;
    // where Santa was found is worth a mention more often on boards that are not square
    if ((square ? tries >= 120 : tries >= 25) && options[vi].length && rng.chance(0.65)) {
      p.people[vi].clues = [rng.weighted(options[vi])];
    }
    if (tries >= (rules.smudged ? 30 : 90)) {
      // somebody honest adds a second remark
      const k = rng.pick(suspects.filter((s) => !naughty.has(s)));
      const extra = options[k].filter(([c]) => !sameClue(c, p.people[k].clues[0]));
      if (extra.length) p.people[k].clues.push(pick(extra));
    }
    if (relLeft < 0) continue;
    if (p.presents) {
      // the presents have to matter: at least two of the toys get talked about
      const toys = new Set(p.people.flatMap((pr) => pr.clues).map((c) => c.obj).filter((o) => o && OBJECTS[o].toy));
      if (toys.size < 2) continue;
    }
    const view = truthOf(p);
    if (countAll(view, 2) !== 1) continue;
    if (hidden >= 0) {
      // every wrong guess at the smudged name must fall apart under plain logic
      const wrong = suspects.filter((L) => !naughty.has(L));
      if (!wrong.every((L) => logicalSolve(viewFor(p, [...known, L])).contradiction)) continue;
      if (!wrong.every((L) => countAll(viewFor(p, [...known, L]), 1) === 0)) continue;
    }
    const rating = logicalSolve(view);
    if (!rating.solved) continue;
    if (rating.level > target.maxLevel || rating.level < target.minLevel) continue;
    if (rating.initialSingles > target.maxInitialSingles) continue;
    if (p.presents && !rating.used.present) continue;
    if (hidden >= 0) p.impostor = hidden;
    p.rating = { level: rating.level, used: rating.used, initialSingles: rating.initialSingles };
    p.deduction = rating.order.map((o) => o.person);
    return true;
  }
  return false;
}
