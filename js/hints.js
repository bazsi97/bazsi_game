// Hints that teach rather than tell. From the people already correctly on the board, run the
// logical solver with its reasons switched on, find the next person who can be pinned down,
// and explain in plain words what rules out their other squares (without naming the square).

import { logicalSolve, victimIndex } from './solver.js';
import { domainFor, RELATIONS, CLUES, canStand, cluesAbout, ownHolds } from './clues.js';
import { OBJECTS } from './themes.js';

const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

export function lineName(p, axis, v) {
  if (axis === 'row') return v === 0 ? 'the top row' : v === p.n - 1 ? 'the bottom row' : `the ${ORD[v]} row from the top`;
  return v === 0 ? 'the leftmost column' : v === p.n - 1 ? 'the rightmost column' : `the ${ORD[v]} column from the left`;
}

const plurals = (word) => (word.endsWith('shelf') ? word.replace(/shelf$/, 'shelves') : /(ch|sh|s)$/.test(word) ? `${word}es` : `${word}s`);
const nameOf = (p, k) => (p.people[k].isVictim ? `${p.people[k].name} (the victim)` : p.people[k].name);
const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n, one, many) => (n === 1 ? one : many);
const lineCells = (p, axis, v) => [...Array(p.n).keys()].map((t) => (axis === 'row' ? v * p.n + t : t * p.n + v));

// What does the person's own statement allow, before anything else is considered?
function startText(p, t, size) {
  const person = p.people[t];
  if (person.isVictim) return `The victim can be on any free square to begin with, ${size} of them.`;
  const about = cluesAbout(p, t);
  const kinds = about.map((c) => {
    const k = kindOf(p, c);
    return k && c.neg ? `not ${k}` : k;
  }).filter(Boolean);
  if (!kinds.length) {
    const rel = about.find((c) => c.type === 'rel');
    if (rel) return `${person.name} was ${rel.neg ? 'not ' : ''}${RELATIONS[rel.rel].text.replace(/<\/?b>/g, '')} ${p.people[rel.who].name}.`;
    return `Start from what was said about ${person.name}.`;
  }
  const said = about.some((c) => c.about != null) ? 'What was sensed about' : 'The statement about';
  return `${said} ${person.name} allows ${size} ${plural(size, 'square', 'squares')} (${kinds.join(', ')}).`;
}

function kindOf(p, c) {
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
  const start = domainFor(p, t);
  const name = p.people[t].name;
  const lines = [];
  const marks = new Set();

  // Others' "only one" statements already shape the starting squares.
  const ownOnly = [];
  for (let i = 0; i < p.n * p.n; i++) {
    if (canStand(p, t, i) && cluesAbout(p, t).every((c) => !CLUES[c.type].own || ownHolds(p, c, i))) ownOnly.push(i);
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
  for (const { why } of removals) {
    const key = JSON.stringify(why);
    if (seen.has(key)) continue;
    seen.add(key);
    switch (why.tech) {
      case 'single':
        takenBy.add(why.who);
        break;
      case 'line':
        lines.push(`Every row and column holds exactly one person. Nobody else can reach ${lineName(p, why.axis, why.v)}, so ${name} must be in it.`);
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
  return { target: t, text: lines.join(' '), steps: lines, marks };
}

export { victimIndex };
