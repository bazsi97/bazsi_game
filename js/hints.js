// Hints that teach rather than tell. From the people already correctly on the board, run the
// logical solver with its reasons switched on, find the next person who can be pinned down,
// and explain in plain words what rules out their other squares (without naming the square).

import { logicalSolve, victimIndex } from './solver.js';
import { domainFor, RELATIONS, CLUES, canStand, cluesAbout, ownHolds, widthOf, heightOf, cellCount, presentWorlds } from './clues.js';
import { OBJECTS, GIFT_WRAPS } from './themes.js';

const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

export function lineName(p, axis, v) {
  if (axis === 'row') return v === 0 ? 'the top row' : v === heightOf(p) - 1 ? 'the bottom row' : `the ${ORD[v]} row from the top`;
  return v === 0 ? 'the leftmost column' : v === widthOf(p) - 1 ? 'the rightmost column' : `the ${ORD[v]} column from the left`;
}

const plurals = (word) => (word.endsWith('shelf') ? word.replace(/shelf$/, 'shelves') : /(ch|sh|s)$/.test(word) ? `${word}es` : `${word}s`);
const nameOf = (p, k) => (p.people[k].isVictim ? `${p.people[k].name} (the victim)` : p.people[k].name);
const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n, one, many) => (n === 1 ? one : many);
const lineCells = (p, axis, v) => [...Array(axis === 'row' ? widthOf(p) : heightOf(p)).keys()]
  .map((t) => (axis === 'row' ? v * widthOf(p) + t : t * widthOf(p) + v)).filter((i) => !p.cells[i].void);

// What does the person's own statement allow, before anything else is considered?
function startText(p, t, size) {
  const person = p.people[t];
  const about = cluesAbout(p, t);
  if (person.isVictim && !about.length) return `The victim can be on any free square to begin with, ${size} of them.`;
  const kinds = about.map((c) => {
    const k = kindOf(p, c);
    return k && c.neg ? `not ${k}` : k;
  }).filter(Boolean);
  if (!kinds.length) {
    const rel = about.find((c) => c.type === 'rel');
    if (rel) return `${person.name} was ${rel.neg ? 'not ' : ''}${RELATIONS[rel.rel].text.replace(/<\/?b>/g, '')} ${p.people[rel.who].name}.`;
    return `Start from what was said about ${person.name}.`;
  }
  // the naughty list (recipe 3): a liar's statement counts the other way round
  if (p.killers?.includes(t)) {
    return `${person.name} is on the naughty list, so the statement is false. Turned round, it allows ${size} ${plural(size, 'square', 'squares')} (${kinds.join(', ')}).`;
  }
  const said = about.some((c) => c.about != null) ? 'What was sensed about' : 'The statement about';
  return `${said} ${person.name} allows ${size} ${plural(size, 'square', 'squares')} (${kinds.join(', ')}).`;
}

function kindOf(p, c) {
  if (c.obj && OBJECTS[c.obj].toy) {
    // a toy is under one of the wrappings, and which one may not be known yet
    const what = `the present that hides the ${OBJECTS[c.obj].name}`;
    return c.type === 'beside' ? `squares beside ${what}` : `squares in line with ${what}`;
  }
  if (c.type === 'on' || c.type === 'onlyOn') return plurals(OBJECTS[c.obj].name);
  if (c.type === 'beside') return `squares beside a ${OBJECTS[c.obj].name}`;
  if (c.type === 'in' || c.type === 'onlyIn') return `squares in the ${p.areas[c.area].name}`;
  if (c.type === 'rowHas' || c.type === 'colHas') return `squares in line with a ${OBJECTS[c.obj].name}`;
  if (c.type === 'edge') return `squares along that edge`;
  return null;
}

export function explainNext(p, placed) {
  // only trust the player's correct placements
  const fixed = placed.map((c, k) => (c != null && c === p.solution[k] ? c : null));
  const log = [];
  logicalSolve(p, { fixed, log });
  const firstPlace = log.find((e) => e.place != null && fixed[e.place] == null);
  if (!firstPlace) return null;
  const t = firstPlace.place;
  const until = log.indexOf(firstPlace);
  const removals = log.slice(0, until).filter((e) => e.k === t && e.why);
  // with wrapped presents about, a square counts while some way of wrapping the toys allows it
  const views = presentWorlds(p);
  const start = views.length === 1 ? domainFor(p, t) : [...new Set(views.flatMap((v) => domainFor(v, t)))];
  const name = p.people[t].name;
  const lines = [];
  const marks = new Set();

  // Others' "only one" statements already shape the starting squares.
  const ownOnly = [];
  for (let i = 0; i < cellCount(p); i++) {
    if (canStand(p, t, i) && views.some((v) => cluesAbout(v, t).every((c) => !CLUES[c.type].own || ownHolds(v, c, i)))) ownOnly.push(i);
  }
  lines.push(startText(p, t, ownOnly.length));
  if (ownOnly.length > start.length) {
    const who = p.people.map((pr, j) => (j !== t && pr.clues.some((c) => CLUES[c.type].others) ? pr.name : null)).filter(Boolean);
    const gone = ownOnly.length - start.length;
    lines.push(`${list(who)} said ${plural(who.length, 'they were', 'they were each')} the only one somewhere, which rules out ${gone} ${plural(gone, 'square', 'squares')} for ${name}.`);
  }

  // Group the reasons, in the order the solver used them.
  const takenBy = new Set();
  const seen = new Set();
  // what is known about the presents keeps growing: explain it once, as it stood at the end
  const lastPresent = removals.filter((e) => e.why.tech === 'present').pop();
  for (const { why } of removals) {
    const key = why.tech === 'present' ? 'present' : JSON.stringify(why);
    if (seen.has(key)) continue;
    seen.add(key);
    switch (why.tech) {
      case 'present':
        lines.push(...presentLines(p, t, lastPresent.why));
        p.presents.cells.forEach((i) => marks.add(i));
        break;
      case 'list': {
        const room = p.areas[why.area].name;
        if (why.kind === 'unreachable') lines.push(`The killer is on the naughty list, and nobody on it can have been in the ${room}. So Santa was not found there.`);
        else lines.push(`Santa was found in the ${room}, alone with the killer, and the killer is on the naughty list. ${name} is not on it, so ${name} was somewhere else.`);
        p.cells.forEach((c, i) => { if (c.area === why.area) marks.add(i); });
        break;
      }
      case 'single':
        takenBy.add(why.who);
        break;
      case 'line':
        lines.push(`Every ${why.axis === 'row' ? 'row' : 'column'} holds exactly one person. Nobody else can reach ${lineName(p, why.axis, why.v)}, so ${name} must be in it.`);
        lineCells(p, why.axis, why.v).forEach((i) => marks.add(i));
        break;
      case 'pointing':
        lines.push(`Every square left for ${nameOf(p, why.who)} is in ${lineName(p, why.axis, why.v)}, so that ${why.axis} is spoken for.`);
        lineCells(p, why.axis, why.v).forEach((i) => marks.add(i));
        break;
      case 'subset': {
        const names = why.who.map((k) => nameOf(p, k));
        const ls = why.lines.map((v) => lineName(p, why.axis, v).replace(/^the /, ''));
        lines.push(`Between them, ${list(names)} can only use ${list(ls)}, so those ${why.axis === 'row' ? 'rows' : 'columns'} are taken.`);
        why.lines.forEach((v) => lineCells(p, why.axis, v).forEach((i) => marks.add(i)));
        break;
      }
      case 'relation': {
        const rel = (why.clue.neg ? 'not ' : '') + RELATIONS[why.clue.rel].text.replace(/<\/?b>/g, '');
        const owner = p.people[why.owner].name;
        const other = p.people[why.other].name;
        lines.push(why.owner === t
          ? `Being ${rel} ${other} only works on some of the remaining squares${fixed[why.other] != null ? `, now that ${other} is on the board` : ''}.`
          : `${owner} was ${rel} ${name}. That rules out squares where ${owner} would have nowhere to stand.`);
        break;
      }
      case 'alone': {
        const room = p.areas[why.area].name;
        if (why.kind === 'forced') lines.push(`The victim must be in the ${room}, and ${name} is the only suspect who could be there with them.`);
        else if (why.kind === 'taken') lines.push(`The victim is in the ${room} with ${nameOf(p, why.who)}. Nobody else may be in that room.`);
        else if (why.kind === 'crowded') lines.push(`The ${room} already holds two suspects, so the victim can't be there: they were alone with the murderer.`);
        else lines.push(`No suspect can be in the ${room}, so the victim can't be there either: they were alone with the murderer.`);
        p.cells.forEach((c, i) => { if (c.area === why.area) marks.add(i); });
        break;
      }
      default:
    }
  }
  if (takenBy.size) {
    const names = [...takenBy].map((k) => nameOf(p, k));
    lines.splice(ownOnly.length > start.length ? 2 : 1, 0,
      `${list(names)} ${plural(names.length, 'already takes', 'already take')} up ${plural(names.length, 'a row and a column', 'their rows and columns')}, which crosses some of those out.`);
  }
  lines.push(`That leaves just one square for ${name}.`);
  // names such as "the Jackal" may open a sentence
  const steps = lines.map((t2) => t2.charAt(0).toUpperCase() + t2.slice(1));
  return { target: t, text: steps.join(' '), steps, marks };
}

export { victimIndex };

// ---------- the North Pole: wrapped presents ----------

const wrapName = (g) => `the ${GIFT_WRAPS[g].name} present`;
const orWords = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);

// What is known about the toys person t's statements mention, and why.
function presentLines(p, t, why) {
  const out = [];
  const toys = [...new Set(cluesAbout(p, t).map((c) => c.obj).filter((o) => o && OBJECTS[o].toy))];
  for (const toy of toys) {
    const toyName = OBJECTS[toy].name;
    for (const dead of why.out.filter((x) => x.kind === toy).slice(0, 2)) {
      out.push(`${wrapName(dead.gift)} cannot hide the ${toyName}: ${dead.stuck >= 0 ? `${nameOf(p, dead.stuck)} would have nowhere to stand` : 'then not everybody would fit'}.`);
    }
    const where = why.possible.map((kinds, g) => (kinds.includes(toy) ? g : -1)).filter((g) => g >= 0);
    if (where.length === 1) out.push(`So the ${toyName} is in ${wrapName(where[0])}, which pins down where ${p.people[t].name} can be.`);
    else if (where.length < why.possible.length) out.push(`The ${toyName} can only be in ${orWords(where.map(wrapName))}, which rules out more squares for ${p.people[t].name}.`);
  }
  if (!out.length) out.push(`Work out the presents first: what is known about them rules out more squares for ${p.people[t].name}.`);
  return out;
}

// ---------- Egypt: the unmasking ----------
// Every named suspect wore exactly one mask and their alibi is true of that mask's square. An
// alibi may fit several masks; what is unique is the way of giving everybody a mask of their own.

const maskIndexes = (p) => p.people.map((_, k) => k).filter((k) => !p.people[k].isVictim);

// For each named suspect: the masks whose square their alibi is true of.
export function alibiTable(p) {
  const masks = maskIndexes(p);
  return p.unmask.suspects.map((sp) => masks.filter((m) => CLUES[sp.alibi.type].own(p, sp.alibi, p.solution[m])));
}

function deadEnd(p, cand) {
  const j = cand.findIndex((c) => !c.length);
  if (j >= 0) return `no mask would be left that fits ${p.unmask.suspects[j].name}'s alibi`;
  const m = maskIndexes(p).find((x) => !cand.some((c) => c.includes(x)));
  return m == null ? null : `nobody would be left to wear ${p.people[m].name}`;
}

function forcedMoves(p, cand, done) {
  const moves = [];
  cand.forEach((c, j) => {
    if (!done.has(j) && c.length === 1) moves.push({ j, m: c[0], text: `${p.unmask.suspects[j].name} would have to be ${p.people[c[0]].name}` });
  });
  for (const m of maskIndexes(p)) {
    const who = cand.flatMap((c, j) => (c.includes(m) ? [j] : []));
    if (who.length === 1 && !done.has(who[0]) && cand[who[0]].length > 1) {
      moves.push({ j: who[0], m, text: `only ${p.unmask.suspects[who[0]].name} could have worn ${p.people[m].name}` });
    }
  }
  return moves;
}

// The shortest run of forced steps that leaves somebody without a mask (or a mask without anybody).
function chainToDeadEnd(p, cand, done, depth) {
  const end = deadEnd(p, cand);
  if (end) return [end];
  if (!depth) return null;
  for (const mv of forcedMoves(p, cand, done)) {
    const next = cand.map((c, j) => (j === mv.j ? [mv.m] : c.filter((m) => m !== mv.m)));
    const rest = chainToDeadEnd(p, next, new Set([...done, mv.j]), depth - 1);
    if (rest) return [mv.text, ...rest];
  }
  return null;
}

// Why named suspect i was not behind the killer's mask. `fits` says whether their alibi is at
// least true of the killer's square: if so, the reason is that somebody else would go maskless.
export function whyNotKiller(p, i) {
  const killer = p.murderer, mask = p.people[killer].name, name = p.unmask.suspects[i].name;
  const table = alibiTable(p);
  if (!table[i].includes(killer)) {
    return { fits: false, text: `Not ${name}: that alibi is not true of the square where ${mask} stood.` };
  }
  const start = table.map((list, j) => (j === i ? [killer] : list.filter((m) => m !== killer)));
  let chain = null;
  for (let depth = 0; depth <= table.length && !chain; depth++) chain = chainToDeadEnd(p, start, new Set([i]), depth);
  const end = chain ? chain.pop() : 'the others could not each have had a mask of their own';
  const then = chain && chain.length ? `${chain.join(', ')}, and then ${end}` : end;
  return {
    fits: true,
    text: `Not ${name}. That alibi does fit ${mask}, but it is not the only one that does. If ${name} had worn ${mask}, ${then}. Everybody wore a mask of their own.`,
  };
}
