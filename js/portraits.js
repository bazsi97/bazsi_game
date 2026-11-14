// Characters: cartoon busts built from parts, in a 100x100 box. Same seed => same face.
// Colours arrive through CSS variables set on the <svg>: --pc (the person's own colour, used for
// clothes), --skin, --hair, --hat. Groups pick them up: .skin .f, .hair .d, .hat .d, .outfit .d

import { Rng } from './rng.js';
import { ROLES } from './themes.js';
import { PALETTE as C } from './art.js';

const HEAD = { cx: 50, cy: 47, rx: 18, ry: 21 };

const SKINS = ['#f8dcc0', '#f2c9a0', '#e3ad7f', '#c98a5c', '#a56a44', '#7d4f33'];
const HAIRS = ['#2c2734', '#2c2734', '#4c3222', '#7a4a26', '#b7632a', '#dba63f', '#e9dcc2', '#9c9aa8', '#a8402e'];
const HATS_INK = ['#3d3852', '#5a3d2b', '#6b7280', '#7a2e3a', '#2f4a6b', '#3f5a43'];
const ALIEN_SKINS = ['#9fdc8f', '#c9aaf0', '#86d8d0', '#f6bd75', '#f5a3bb', '#a9c8f5', '#e6e37a'];

const HAIR = {
  slick: `<path class="d" d="M31 47 C28 26 40 22 52 22 C64 22 72 30 69 47 C68 38 62 32 52 32 C42 32 36 36 31 47 Z"/>
          <path class="hl" d="M40 27 Q50 24 60 27"/>`,
  part: `<path class="d" d="M31 46 C28 24 42 20 52 21 C64 22 72 30 69 46 C66 34 58 30 46 32 C40 33 34 38 31 46 Z"/>
         <path class="hl" d="M44 22 Q42 26 44 31"/>`,
  bald: `<path class="d" d="M32 50 C30 42 33 38 35 36 C34 42 36 46 34 52 Z M68 50 C70 42 67 38 65 36 C66 42 64 46 66 52 Z"/>`,
  curly: `<g class="d"><circle cx="33" cy="40" r="5"/><circle cx="36" cy="31" r="6"/><circle cx="44" cy="25" r="6"/>
          <circle cx="53" cy="23" r="6"/><circle cx="62" cy="27" r="6"/><circle cx="67" cy="35" r="5.5"/><circle cx="68" cy="43" r="4.5"/></g>`,
  wavy: `<path class="d" d="M31 48 C26 30 36 20 50 20 C66 20 74 30 69 48 C66 42 64 36 58 34 C54 38 50 34 46 36 C42 40 36 38 31 48 Z"/>`,
  bob: `<path class="d" d="M28 52 C24 26 38 19 50 19 C63 19 77 26 72 52 L72 66 C66 68 64 62 66 54 C64 40 58 33 50 33 C40 34 36 42 34 54 C36 62 34 68 28 66 Z"/>
        <path class="hl" d="M38 25 Q50 21 62 25"/>`,
  bun: `<circle class="d" cx="50" cy="17" r="8"/>
        <path class="d" d="M31 47 C28 25 40 22 50 22 C62 22 72 26 69 47 C66 36 58 31 50 31 C42 31 34 36 31 47 Z"/>
        <path class="hl" d="M46 14 Q50 12 54 14"/>`,
  long: `<path class="d" d="M28 46 C24 22 40 18 50 18 C62 18 78 22 72 46 L77 84 C68 87 62 80 64 70 L36 70 C38 80 32 87 23 84 Z"/>`,
  waves: `<path class="d" d="M29 50 C26 30 36 20 50 20 C64 20 75 30 71 50 C70 44 66 42 64 38 C60 42 56 38 52 34 C48 38 42 36 38 40 C34 42 32 46 29 50 Z"/>
          <path class="hl" d="M38 28 q4 -3 8 0 q4 3 8 0 q4 -3 8 0"/>`,
  // Egypt
  ewig: `<path class="d" d="M26 46 C22 22 38 16 50 16 C62 16 78 22 74 46 L77 82 L62 82 L65 54 C63 40 58 34 50 34 C42 34 37 40 35 54 L38 82 L23 82 Z"/>`,
  eshort: `<path class="d" d="M30 46 C28 24 40 19 50 19 C60 19 72 24 70 46 L70 56 L65 56 C66 42 60 34 50 34 C40 34 34 42 35 56 L30 56 Z"/>`,
};
const HAIR_FRONT = {
  long: `<path class="d" d="M31 46 C28 26 40 22 50 22 C62 22 72 26 69 46 C64 36 58 32 50 32 C42 32 36 36 31 46 Z"/>`,
  ewig: `<path class="d" d="M30 43 C29 24 40 20 50 20 C60 20 71 24 70 43 C64 36 36 36 30 43 Z"/>
         <path class="s" d="M31 37 Q50 30 69 37" style="stroke:${C.gold};stroke-width:3.5"/>
         <rect class="o2" fill="${C.gold}" x="24" y="76" width="13" height="6"/><rect class="o2" fill="${C.gold}" x="63" y="76" width="13" height="6"/>`,
  eshort: `<path class="s" d="M31 38 Q50 31 69 38" style="stroke:${C.gold};stroke-width:3.5"/>`,
};
const LONG_BACK = new Set(['long', 'ewig']);

const HATS = {
  bowler: `<path class="d" d="M30 34 C30 12 70 12 70 34 Z"/><path class="hl" d="M33 30 H67"/>
           <ellipse class="d" cx="50" cy="34" rx="27" ry="4.5"/>`,
  tophat: `<path class="d" d="M34 34 L36 4 L64 4 L66 34 Z"/><rect class="p" x="35.500" y="26" width="29" height="5"/>
           <ellipse class="d" cx="50" cy="34" rx="27" ry="4.5"/>`,
  fedora: `<path class="d" d="M31 34 C30 16 40 13 50 18 C60 13 70 16 69 34 Z"/><rect class="p" x="31.500" y="28" width="37" height="4"/>
           <path class="d" d="M16 38 C24 32 76 32 84 38 C76 36 24 36 16 38 Z" style="stroke-width:4"/>`,
  cloche: `<path class="d" d="M27 47 C24 18 76 18 73 47 C66 38 34 38 27 47 Z"/><path class="hl" d="M30 38 Q50 32 70 38"/>
           <circle class="f" cx="66" cy="33" r="4.5"/><circle class="o2" fill="${C.gold}" cx="66" cy="33" r="1.8"/>`,
  flatcap: `<path class="d" d="M30 38 C30 22 64 18 70 30 L80 36 C72 40 42 40 30 38 Z"/><path class="hl" d="M40 26 Q54 22 64 28"/>`,
  peaked: `<path class="d" d="M28 36 C24 14 76 14 72 36 Z"/><rect class="p" x="29" y="30" width="42" height="3"/>
           <path class="o2" fill="${C.dark}" d="M30 36 Q50 42 70 36 L72 39 Q50 48 28 39 Z"/><circle class="o2" fill="${C.gold}" cx="50" cy="24" r="3.4"/>`,
  chef: `<path class="f" d="M34 36 L34 20 C24 20 24 6 36 8 C38 0 62 0 64 8 C76 6 76 20 66 20 L66 36 Z"/>
         <path class="t" d="M42 20 L42 34 M50 18 L50 34 M58 20 L58 34"/>`,
  beret: `<path class="d" d="M28 36 C26 22 46 18 66 22 C78 26 76 34 70 36 Z"/><path class="s" d="M50 20 l2 -6"/>`,
  // the Pharaoh's striped headcloth
  nemes: `<path class="o" fill="${C.gold}" d="M22 80 L29 30 C31 13 69 13 71 30 L78 80 L64 80 L62 46 C60 36 56 32 50 32 C44 32 40 36 38 46 L36 80 Z"/>
          <path class="s" d="M27 44 L37 46 M25 56 L36 58 M24 68 L36 70 M73 44 L63 46 M75 56 L64 58 M76 68 L64 70 M33 24 Q50 14 67 24" style="stroke:${C.lapis};stroke-width:3.5"/>
          <path class="o2" fill="${C.red}" d="M50 14 C54 18 54 24 50 27 C46 24 46 18 50 14 Z"/>`,
};

const FACIAL = {
  handlebar: `<path class="d" d="M50 56 C44 53 38 54 35 58 C34 61 31 60 32 56 C34 62 44 61 50 59 C56 61 66 62 68 56 C69 60 66 61 65 58 C62 54 56 53 50 56 Z"/>`,
  toothbrush: `<rect class="d" x="45" y="55.5" width="10" height="4" rx="1"/>`,
  beard: `<path class="d" d="M32 50 C32 66 40 76 50 76 C60 76 68 66 68 50 C66 58 62 62 58 62 C56 58 44 58 42 62 C38 62 34 58 32 50 Z"/>`,
  chops: `<path class="d" d="M32 44 C32 56 36 62 40 62 C40 56 36 52 36 44 Z M68 44 C68 56 64 62 60 62 C60 56 64 52 64 44 Z"/>`,
  goatee: `<path class="d" d="M46 66 C46 72 54 72 54 66 C52 68 48 68 46 66 Z M45 57 Q50 55 55 57 L55 58.5 Q50 57 45 58.5 Z"/>`,
  // the braided false beard of Egyptian officials
  ebeard: `<path class="d" d="M46.500 67 H53.500 L52 82 H48 Z"/>`,
};

const BROWS = [
  'M38 40 Q43 37 47 40 M53 40 Q57 37 62 40',
  'M38 38 L47 41 M53 41 L62 38',
  'M38 41 Q43 38 47 41 M53 37 Q57 35 62 38',
  'M38 40 L47 39 M53 39 L62 40',
];
const NOSES = [
  '<path class="s" d="M50 48 C49 53 46 55 49 57"/>',
  '<circle class="f" cx="50" cy="55" r="3.2"/>',
  '<path class="s" d="M51 46 L46 56 L52 56"/>',
  '<path class="s" d="M49 49 Q46 57 51 56"/>',
];
const MOUTHS = [
  '<path class="s" d="M44 62 Q50 66 56 62"/>',
  '<path class="s" d="M45 63 Q52 64 56 59"/>',
  '<path class="s" d="M45 63 L55 63"/>',
  '<ellipse class="d" cx="50" cy="63" rx="2.2" ry="2.8"/>',
  '<path class="s" d="M44 64 Q50 60 56 64"/>',
];
const LIPS = [
  '<path class="d" d="M45 62 Q48 60 50 61 Q52 60 55 62 Q50 66 45 62 Z"/>',
  '<path class="d" d="M46 62 Q50 60 54 62 Q50 64.5 46 62 Z"/>',
];

const SHOULDERS = 'M6 100 C8 84 24 78 38 76 L62 76 C76 78 92 84 94 100 Z';

const OUTFITS = {
  suit: `<path class="d" d="${SHOULDERS}"/>
    <path class="f" d="M42 76 L50 96 L58 76 Z"/>
    <path class="o2" fill="${C.red}" d="M48 79 L52 79 L53.5 92 L50 97 L46.5 92 Z"/>
    <path class="t" d="M40 77 L47 95 M60 77 L53 95"/>`,
  tails: `<path class="d" d="${SHOULDERS}"/>
    <path class="f" d="M40 76 L50 100 L60 76 Z"/>
    <path class="o2" fill="${C.dark}" d="M50 80 L42 76 L42 84 Z M50 80 L58 76 L58 84 Z"/><circle class="d" cx="50" cy="80" r="2"/>
    <circle class="d" cx="50" cy="88" r="1.2"/><circle class="d" cx="50" cy="94" r="1.2"/>`,
  uniform: `<path class="d" d="${SHOULDERS}"/>
    <rect class="f" x="42" y="74" width="16" height="5"/>
    <circle class="o2" fill="${C.gold}" cx="50" cy="85" r="2.2"/><circle class="o2" fill="${C.gold}" cx="50" cy="93" r="2.2"/>
    <path class="o2" fill="${C.gold}" d="M14 86 L30 80 L32 84 L16 90 Z M86 86 L70 80 L68 84 L84 90 Z"/>
    <circle class="o2" fill="${C.gold}" cx="36" cy="90" r="2.6"/><circle class="o2" fill="${C.red}" cx="30" cy="92" r="2.6"/>`,
  gown: `<path class="d" d="${SHOULDERS}"/>
    <g class="skin"><path class="f" d="M34 77 C40 92 60 92 66 77 Z"/></g>
    <g fill="${C.white}" class="o2"><circle cx="40" cy="81" r="2"/><circle cx="44" cy="85" r="2"/><circle cx="50" cy="86.5" r="2"/><circle cx="56" cy="85" r="2"/><circle cx="60" cy="81" r="2"/></g>`,
  maid: `<path class="d" d="${SHOULDERS}"/>
    <path class="f" d="M38 76 L50 84 L44 88 Z M62 76 L50 84 L56 88 Z"/>
    <path class="f" d="M38 90 L62 90 L62 100 L38 100 Z"/>`,
  apron: `<path class="d lite" d="${SHOULDERS}"/>
    <path class="f" d="M36 84 L64 84 L66 100 L34 100 Z"/>
    <path class="s" d="M38 84 L44 76 M62 84 L56 76"/><rect class="f" x="45" y="90" width="10" height="7"/>`,
  overalls: `<path class="d lite" d="${SHOULDERS}"/>
    <path class="d" d="M34 86 L66 86 L68 100 L32 100 Z"/>
    <path class="d" d="M34 86 L40 77 L44 77 L38 88 Z M66 86 L60 77 L56 77 L62 88 Z"/>
    <circle class="o2" fill="${C.gold}" cx="38" cy="88" r="2"/><circle class="o2" fill="${C.gold}" cx="62" cy="88" r="2"/>`,
  clergy: `<path class="o" fill="${C.dark}" d="${SHOULDERS}"/>
    <rect class="o2" fill="${C.dark}" x="42" y="73" width="16" height="7"/><rect class="p" x="47" y="74.500" width="6" height="4.500"/>`,
  // white linen and a broad jewelled collar in the wearer's colour
  ecollar: `<path class="f" d="${SHOULDERS}"/>
    <path class="d" d="M30 76 Q50 92 70 76 L82 82 Q50 122 18 82 Z"/>
    <path class="s" d="M25 81 Q50 108 75 81" style="stroke:${C.gold};stroke-width:3.5"/>
    <circle class="o2" fill="${C.gold}" cx="50" cy="99" r="3.4"/><circle class="o2" fill="${C.gold}" cx="36" cy="93" r="2.6"/><circle class="o2" fill="${C.gold}" cx="64" cy="93" r="2.6"/>`,
};

export function makeLook(person) {
  const rng = new Rng(person.lookSeed);
  const role = ROLES.find((r) => r.id === person.role) || {};
  const f = person.gender === 'f';
  const look = {
    f,
    hair: rng.pick(f ? ['bob', 'bun', 'long', 'curly', 'waves'] : ['slick', 'part', 'bald', 'curly', 'wavy']),
    hat: role.hat || (rng.chance(f ? 0.15 : 0.3) ? rng.pick(f ? ['cloche', 'beret'] : ['bowler', 'fedora', 'flatcap']) : null),
    facial: f ? null : rng.chance(0.6) ? rng.pick(['handlebar', 'toothbrush', 'beard', 'chops', 'goatee']) : null,
    accessory: role.accessory || (rng.chance(0.2) ? rng.pick(['glasses', 'monocle']) : null),
    outfit: role.outfit || 'suit',
    brows: rng.int(BROWS.length),
    nose: rng.int(NOSES.length),
    mouth: f ? rng.int(LIPS.length) : rng.int(MOUTHS.length),
    earrings: f && rng.chance(0.5),
    rx: HEAD.rx + rng.range(-2, 2),
    ry: HEAD.ry + rng.range(-2, 2),
  };
  // colours come from a second stream, so the features above stay as they always were
  const tone = new Rng((person.lookSeed ^ 0x5bd1e995) >>> 0);
  look.skin = tone.pick(SKINS);
  look.hairInk = tone.pick(HAIRS);
  look.hatInk = tone.pick(HATS_INK);
  if (look.facial === 'beard' && look.hairInk === '#e9dcc2') look.hairInk = '#9c9aa8';
  if (person.culture === 'egypt') {
    look.skin = tone.pick(['#e3ad7f', '#c98a5c', '#d59a6a', '#a56a44']);
    look.hairInk = '#2c2734';
    look.hair = f ? tone.pick(['ewig', 'ewig', 'eshort']) : tone.pick(['eshort', 'bald', 'eshort']);
    look.hat = person.role === 'pharaoh' ? 'nemes' : null;
    look.facial = !f && (person.role === 'pharaoh' || tone.chance(0.3)) ? 'ebeard' : null;
    look.accessory = null;
    look.outfit = 'ecollar';
    look.kohl = true;
    look.earrings = tone.chance(0.5);
  }
  return look;
}

export function portraitSvg(person, opts = {}) {
  if (person.masked) return maskPortraitSvg(person, opts);
  if (person.species === 'alien') return alienPortraitSvg(person, opts);
  if (person.ghost) return ghostPortraitSvg(person, opts);
  return humanPortraitSvg(person, opts);
}

function wrap(parts, vars) {
  const style = Object.entries(vars).filter(([, v]) => v).map(([k, v]) => `--${k}:${v}`).join(';');
  return `<svg class="art portrait" viewBox="0 0 100 100" aria-hidden="true" style="${style}">${parts.join('')}</svg>`;
}

const backdrop = (tint) => `${tint ? `<rect width="100" height="100" fill="${tint}"/>` : ''}<rect width="100" height="100" fill="url(#pt-halftone)"/>`;

function humanPortraitSvg(person, { dead = false, color = null, tint = null, look = null } = {}) {
  const L = { ...makeLook(person), ...(look || {}) };
  const { cx, cy } = HEAD;
  const parts = [backdrop(tint)];
  if (LONG_BACK.has(L.hair) && L.hat !== 'chef') parts.push(`<g class="hair">${HAIR[L.hair]}</g>`);
  parts.push(`<g class="outfit">${OUTFITS[L.outfit]}</g>`);
  parts.push(`<g class="skin"><path class="f" d="M43 62 L43 78 Q50 81 57 78 L57 62 Z"/></g><path class="sh" d="M43 66 Q50 72 57 66 L57 70 Q50 75 43 70 Z"/>`);
  parts.push(`<g class="skin"><circle class="f" cx="${cx - L.rx}" cy="${cy + 2}" r="4.5"/><circle class="f" cx="${cx + L.rx}" cy="${cy + 2}" r="4.5"/>`);
  parts.push(`<ellipse class="f" cx="${cx}" cy="${cy}" rx="${L.rx}" ry="${L.ry}"/></g>`);
  if (L.earrings) parts.push(`<circle class="o2" fill="${C.gold}" cx="${cx - L.rx}" cy="${cy + 9}" r="2.6"/><circle class="o2" fill="${C.gold}" cx="${cx + L.rx}" cy="${cy + 9}" r="2.6"/>`);
  if (!dead) parts.push(`<circle class="n" fill="${C.red}" cx="${cx - L.rx + 6}" cy="${cy + 8}" r="4" opacity="0.28"/><circle class="n" fill="${C.red}" cx="${cx + L.rx - 6}" cy="${cy + 8}" r="4" opacity="0.28"/>`);
  if (dead) {
    parts.push(`<path class="s" d="M40 44 l6 6 M46 44 l-6 6 M54 44 l6 6 M60 44 l-6 6" style="stroke-width:2.6"/>`);
  } else {
    parts.push(`<ellipse class="d" cx="43" cy="47" rx="3.2" ry="4.6"/><ellipse class="d" cx="57" cy="47" rx="3.2" ry="4.6"/>
      <circle class="p" cx="44.200" cy="45.200" r="1.200"/><circle class="p" cx="58.200" cy="45.200" r="1.200"/>`);
    if (L.f) parts.push(`<path class="t" d="M39 43 l-2 -2 M41 41.5 l-1 -2.5 M61 43 l2 -2 M59 41.5 l1 -2.5"/>`);
    if (L.kohl) parts.push(`<path class="s" d="M39.500 47.500 H34 M60.500 47.500 H66" style="stroke-width:2"/>`);
  }
  parts.push(`<g class="hair"><path class="s brow" d="${BROWS[L.brows]}"/></g>`);
  parts.push(`<g class="skin">${NOSES[L.nose]}</g>`);
  if (dead) parts.push('<path class="s" d="M44 63 Q47 61 50 63 Q53 65 56 63"/>');
  else parts.push(L.f ? `<g class="lips">${LIPS[L.mouth]}</g>` : MOUTHS[L.mouth]);
  if (L.facial) parts.push(`<g class="hair">${FACIAL[L.facial]}</g>`);
  if (L.accessory === 'glasses') {
    parts.push(`<circle class="s" cx="43" cy="47" r="6.5" style="stroke-width:2"/><circle class="s" cx="57" cy="47" r="6.5" style="stroke-width:2"/><path class="s" d="M49.5 47 Q50 45 50.5 47" style="stroke-width:2"/>`);
  } else if (L.accessory === 'monocle') {
    parts.push(`<circle class="s" cx="57" cy="47" r="7" style="stroke:${C.goldD};stroke-width:2.4"/><path class="t" d="M63 51 Q66 66 60 76"/>`);
  }
  // hair in front of the face; under a hat, long hair shows as a simple cap
  if (L.hat !== 'nemes') {
    const front = HAIR_FRONT[L.hair] || (LONG_BACK.has(L.hair) ? '' : HAIR[L.hair]);
    parts.push(`<g class="hair">${L.hat && L.hair === 'long' ? HAIR.slick : front}</g>`);
  }
  if (L.hat) parts.push(`<g class="hat">${HATS[L.hat]}</g>`);
  return wrap(parts, { pc: color, skin: L.skin, hair: L.hairInk, hat: L.hatInk });
}

// Aliens: same paint box, different anatomy.
function alienPortraitSvg(person, { dead = false, color = null, tint = null } = {}) {
  const rng = new Rng(person.lookSeed);
  const head = rng.pick(['dome', 'tall', 'wide', 'squid']);
  const eyes = rng.pick([1, 2, 2, 3, 'stalks']);
  const antennae = eyes !== 'stalks' && rng.chance(0.6) ? rng.pick(['bobbles', 'curly']) : null;
  const mouth = rng.pick(['smile', 'fangs', 'o', 'flat']);
  const skin = new Rng((person.lookSeed ^ 0x5bd1e995) >>> 0).pick(ALIEN_SKINS);
  const parts = [backdrop(tint)];
  // space suit in the alien's own colour
  parts.push(`<g class="outfit"><path class="d" d="M8 100 C12 82 30 77 50 77 C70 77 88 82 92 100 Z"/></g>
    <path class="f" d="M30 79 Q50 91 70 79 L70 84 Q50 96 30 84 Z"/><circle class="o2" fill="${C.gold}" cx="64" cy="93" r="3"/><circle class="o2" fill="${C.red}" cx="36" cy="93" r="2.4"/>`);
  parts.push(`<g class="skin"><path class="f" d="M44 64 L44 82 L56 82 L56 64 Z"/>`);
  let top = 22; // y of the top of the head, for antennae
  if (head === 'dome') { parts.push(`<ellipse class="f" cx="50" cy="44" rx="23" ry="25"/>`); top = 19; }
  else if (head === 'tall') { parts.push(`<path class="f" d="M50 8 C71 8 73 40 71 56 C69 70 59 74 50 74 C41 74 31 70 29 56 C27 40 29 8 50 8 Z"/>`); top = 8; }
  else if (head === 'wide') { parts.push(`<ellipse class="f" cx="50" cy="48" rx="31" ry="21"/>`); top = 27; }
  else {
    parts.push(`<path class="s" d="M38 62 C34 72 40 76 36 84 M46 66 C44 76 48 80 46 88 M54 66 C56 76 52 80 54 88 M62 62 C66 72 60 76 64 84"/>`);
    parts.push(`<ellipse class="f" cx="50" cy="42" rx="24" ry="24"/>`); top = 18;
  }
  parts.push(`</g><circle class="sh" cx="64" cy="55" r="5"/><circle class="sh" cx="34" cy="38" r="3"/><circle class="sh" cx="66" cy="33" r="2.4"/>`);
  if (antennae === 'bobbles') parts.push(`<path class="s" d="M42 ${top + 3} L34 ${top - 12} M58 ${top + 3} L66 ${top - 12}"/><circle class="o2" fill="${C.gold}" cx="34" cy="${top - 14}" r="4.5"/><circle class="o2" fill="${C.gold}" cx="66" cy="${top - 14}" r="4.5"/>`);
  if (antennae === 'curly') parts.push(`<path class="s" d="M50 ${top + 1} C50 ${top - 10} 60 ${top - 12} 58 ${top - 4} C56 ${top} 52 ${top - 4} 55 ${top - 7}"/>`);
  const eye = (x, y, r) => (dead
    ? `<path class="s" d="M${x - r} ${y - r} l${2 * r} ${2 * r} M${x + r} ${y - r} l${-2 * r} ${2 * r}" style="stroke-width:2.6"/>`
    : `<circle class="f" cx="${x}" cy="${y}" r="${r}"/><circle class="d" cx="${x + r * 0.15}" cy="${y + r * 0.1}" r="${r * 0.48}"/><circle class="p" cx="${x - r * 0.15}" cy="${y - r * 0.25}" r="${r * 0.16}"/>`);
  if (eyes === 1) parts.push(eye(50, 44, 10));
  if (eyes === 2) parts.push(eye(41, 45, 6.5) + eye(59, 45, 6.5));
  if (eyes === 3) parts.push(eye(40, 47, 5.5) + eye(60, 47, 5.5) + eye(50, 33, 5));
  if (eyes === 'stalks') parts.push(`<path class="s" d="M42 ${top + 4} L36 ${top - 10} M58 ${top + 4} L64 ${top - 10}"/>${eye(36, top - 14, 6)}${eye(64, top - 14, 6)}`);
  const my = head === 'wide' ? 58 : 59;
  if (dead) parts.push(`<path class="s" d="M42 ${my} Q46 ${my - 3} 50 ${my} Q54 ${my + 3} 58 ${my}"/>`);
  else if (mouth === 'smile') parts.push(`<path class="s" d="M40 ${my - 1} Q50 ${my + 7} 60 ${my - 1}"/>`);
  else if (mouth === 'fangs') parts.push(`<path class="s" d="M40 ${my} H60"/><path class="f" d="M44 ${my} l2 5 l2 -5 Z M52 ${my} l2 5 l2 -5 Z" style="stroke-width:1.6"/>`);
  else if (mouth === 'o') parts.push(`<ellipse class="d" cx="50" cy="${my + 1}" rx="3.5" ry="4.5"/>`);
  else parts.push(`<path class="s" d="M43 ${my} H57"/>`);
  return wrap(parts, { pc: color, skin });
}

// The ghost: a bedsheet with ambitions.
function ghostPortraitSvg(person, { color = null, tint = null } = {}) {
  const parts = [backdrop(tint)];
  parts.push(`<path class="t" d="M14 40 q-6 6 0 12 M86 40 q6 6 0 12 M10 62 q-5 5 0 10 M90 62 q5 5 0 10" opacity="0.7"/>`);
  parts.push(`<path class="o" fill="#f6f2ff" d="M24 92 C22 60 20 18 50 14 C80 18 78 60 76 92 C70 86 66 98 60 92 C55 86 50 98 44 92 C38 86 34 98 30 92 C28 90 26 90 24 92 Z"/>`);
  parts.push(`<g class="outfit"><path class="d" d="M30 74 Q50 82 70 74 L70 79 Q50 87 30 79 Z" opacity="0.9"/></g>`);
  parts.push(`<ellipse class="d" cx="41" cy="42" rx="5" ry="7.5"/><ellipse class="d" cx="59" cy="42" rx="5" ry="7.5"/>`);
  parts.push(`<ellipse class="d" cx="50" cy="60" rx="5" ry="6.5"/>`);
  parts.push(`<circle class="n" fill="${C.pink}" cx="33" cy="54" r="4" opacity="0.5"/><circle class="n" fill="${C.pink}" cx="67" cy="54" r="4" opacity="0.5"/>`);
  parts.push(`<path class="sh" d="M66 30 C74 44 74 70 72 90 L66 92 C68 70 68 46 62 34 Z"/>`);
  return wrap(parts, { pc: color });
}

// ---------- Egypt: the masks of the gods ----------

const INKY = '#2f2a3d';
const MASK_ART = {
  jackal: `
    <path class="o" fill="${INKY}" d="M35 32 L29 3 L47 22 Z"/><path class="o" fill="${INKY}" d="M65 32 L71 3 L53 22 Z"/>
    <path class="n" fill="${C.gold}" d="M36 24 L33 11 L42 21 Z M64 24 L67 11 L58 21 Z"/>
    <path class="o" fill="${INKY}" d="M31 32 C31 19 69 19 69 32 L62 56 L56 76 H44 L38 56 Z"/>
    <ellipse class="n" fill="${C.gold}" cx="42" cy="38" rx="5" ry="3"/><ellipse class="n" fill="${C.gold}" cx="58" cy="38" rx="5" ry="3"/>
    <circle class="d" cx="42" cy="38" r="1.8"/><circle class="d" cx="58" cy="38" r="1.8"/>
    <path class="s" d="M37 46 L42 50 M63 46 L58 50" style="stroke:${C.gold};stroke-width:2.4"/>
    <path class="n" fill="#14111d" d="M45 70 H55 L50 77 Z"/>`,
  cat: `
    <path class="o" fill="${C.sandD}" d="M31 36 L28 10 L47 25 Z"/><path class="o" fill="${C.sandD}" d="M69 36 L72 10 L53 25 Z"/>
    <path class="n" fill="${C.pink}" d="M34 28 L32 17 L42 25 Z M66 28 L68 17 L58 25 Z"/>
    <ellipse class="o" fill="${C.sandD}" cx="50" cy="48" rx="23" ry="21"/>
    <path class="s" d="M44 30 V36 M50 29 V36 M56 30 V36" style="stroke:${C.woodD};stroke-width:2.4"/>
    <ellipse class="o2" fill="${C.glow}" cx="41" cy="45" rx="5" ry="4"/><ellipse class="o2" fill="${C.glow}" cx="59" cy="45" rx="5" ry="4"/>
    <ellipse class="d" cx="41" cy="45" rx="1.4" ry="3.4"/><ellipse class="d" cx="59" cy="45" rx="1.4" ry="3.4"/>
    <path class="o2" fill="${C.pink}" d="M47 54 H53 L50 58 Z"/><path class="t" d="M50 58 V62 M50 62 Q46 65 43 62 M50 62 Q54 65 57 62"/>
    <path class="t" d="M34 55 L24 52 M34 58 L24 60 M66 55 L76 52 M66 58 L76 60"/>
    <circle class="s" cx="71" cy="20" r="3.5" style="stroke:${C.gold};stroke-width:2.4"/>`,
  falcon: `
    <ellipse class="o" fill="${C.white}" cx="50" cy="46" rx="21" ry="23"/>
    <path class="o" fill="${C.lapis}" d="M29 44 C28 22 40 18 50 18 C60 18 72 22 71 44 C64 34 36 34 29 44 Z"/>
    <circle class="o2" fill="${C.gold}" cx="41" cy="46" r="5.5"/><circle class="o2" fill="${C.gold}" cx="59" cy="46" r="5.5"/>
    <circle class="d" cx="41" cy="46" r="2.6"/><circle class="d" cx="59" cy="46" r="2.6"/>
    <path class="s" d="M36 52 Q38 60 34 64 M41 52 V58 M64 52 Q62 60 66 64 M59 52 V58" style="stroke-width:2"/>
    <path class="o" fill="${C.gold}" d="M44 52 H56 L52 68 C50 72 48 68 48 66 Z"/>`,
  ibis: `
    <path class="o" fill="${INKY}" d="M41 52 H59 V80 H41 Z"/>
    <circle class="o" fill="${C.white}" cx="50" cy="34" r="18"/>
    <circle class="d" cx="42" cy="31" r="2.8"/><circle class="d" cx="58" cy="31" r="2.8"/>
    <path class="s" d="M37 25 Q42 22 46 25 M54 25 Q58 22 63 25" style="stroke-width:2"/>
    <path class="o" fill="${INKY}" d="M44 38 C42 56 48 76 62 90 C60 72 57 56 56 38 Z"/>
    <path class="hl" d="M48 44 C48 56 51 66 55 74" opacity="0.5"/>`,
  lioness: `
    <circle class="o" fill="${C.goldD}" cx="30" cy="28" r="9"/><circle class="o" fill="${C.goldD}" cx="70" cy="28" r="9"/>
    <circle class="n" fill="${C.pink}" cx="30" cy="28" r="4"/><circle class="n" fill="${C.pink}" cx="70" cy="28" r="4"/>
    <ellipse class="o" fill="${C.gold}" cx="50" cy="47" rx="25" ry="23"/>
    <ellipse class="o2" fill="${C.cream}" cx="50" cy="58" rx="12" ry="9"/>
    <path class="o2" fill="${INKY}" d="M45 52 H55 L50 58 Z"/><path class="t" d="M50 58 V62 M50 62 Q46 66 42 63 M50 62 Q54 66 58 63"/>
    <ellipse class="o2" fill="${C.orange}" cx="40" cy="43" rx="4.5" ry="3.6"/><ellipse class="o2" fill="${C.orange}" cx="60" cy="43" rx="4.5" ry="3.6"/>
    <circle class="d" cx="40" cy="43" r="1.8"/><circle class="d" cx="60" cy="43" r="1.8"/>`,
  ram: `
    <path class="s" d="M36 34 C12 26 8 54 26 58 C36 60 38 48 30 46" style="stroke-width:11"/>
    <path class="s" d="M36 34 C12 26 8 54 26 58 C36 60 38 48 30 46" style="stroke:${C.wood};stroke-width:6"/>
    <path class="s" d="M64 34 C88 26 92 54 74 58 C64 60 62 48 70 46" style="stroke-width:11"/>
    <path class="s" d="M64 34 C88 26 92 54 74 58 C64 60 62 48 70 46" style="stroke:${C.wood};stroke-width:6"/>
    <path class="o" fill="${C.cream}" d="M34 34 C34 20 66 20 66 34 L60 64 C58 74 42 74 40 64 Z"/>
    <circle class="d" cx="42" cy="42" r="2.6"/><circle class="d" cx="58" cy="42" r="2.6"/>
    <path class="o2" fill="${C.pink}" d="M45 62 H55 L50 68 Z"/>`,
  scarab: `
    <path class="s" d="M28 40 L14 32 M26 52 L12 54 M30 62 L18 72 M72 40 L86 32 M74 52 L88 54 M70 62 L82 72" style="stroke-width:4"/>
    <ellipse class="o" fill="${C.turq}" cx="50" cy="52" rx="23" ry="25"/>
    <path class="s" d="M50 36 V77 M28 44 Q50 36 72 44"/>
    <ellipse class="o" fill="${C.lapis}" cx="50" cy="28" rx="13" ry="9"/>
    <circle class="n" fill="${C.gold}" cx="45" cy="27" r="2.6"/><circle class="n" fill="${C.gold}" cx="55" cy="27" r="2.6"/>
    <circle class="o2" fill="${C.gold}" cx="40" cy="58" r="4"/><circle class="o2" fill="${C.gold}" cx="60" cy="58" r="4"/>`,
  hippo: `
    <circle class="o" fill="${C.purple}" cx="31" cy="22" r="7"/><circle class="o" fill="${C.purple}" cx="69" cy="22" r="7"/>
    <path class="o" fill="${C.purple}" d="M28 32 C28 16 72 16 72 32 L76 56 C76 76 24 76 24 56 Z"/>
    <ellipse class="o2" fill="${C.lilac}" cx="50" cy="60" rx="24" ry="14"/>
    <ellipse class="d" cx="42" cy="56" rx="3.4" ry="4.4"/><ellipse class="d" cx="58" cy="56" rx="3.4" ry="4.4"/>
    <circle class="d" cx="40" cy="34" r="2.8"/><circle class="d" cx="60" cy="34" r="2.8"/>
    <path class="t" d="M42 68 Q50 72 58 68"/>`,
  baboon: `
    <circle class="o" fill="${C.stone}" cx="50" cy="44" r="29"/>
    <path class="t" d="M26 34 l6 4 M24 46 h7 M28 58 l6 -3 M74 34 l-6 4 M76 46 h-7 M72 58 l-6 -3" opacity="0.6"/>
    <path class="o" fill="${C.terra}" d="M38 34 C38 24 62 24 62 34 L60 60 C58 72 42 72 40 60 Z"/>
    <path class="s" d="M38 36 Q44 32 48 37 M52 37 Q56 32 62 36" style="stroke-width:2.6"/>
    <circle class="d" cx="44" cy="41" r="2.4"/><circle class="d" cx="56" cy="41" r="2.4"/>
    <path class="t" d="M47 48 V60 M53 48 V60"/><path class="s" d="M44 65 H56" style="stroke-width:2"/>`,
  vulture: `
    <path class="o" fill="${C.white}" d="M30 70 q5 -9 10 0 q5 -9 10 0 q5 -9 10 0 q5 -9 10 0 V80 H30 Z"/>
    <ellipse class="o" fill="${C.pink}" cx="50" cy="42" rx="17" ry="21"/>
    <path class="s" d="M36 34 L46 39 M64 34 L54 39" style="stroke-width:3"/>
    <circle class="o2" fill="${C.gold}" cx="43" cy="42" r="3.6"/><circle class="o2" fill="${C.gold}" cx="57" cy="42" r="3.6"/>
    <circle class="d" cx="43" cy="42" r="1.6"/><circle class="d" cx="57" cy="42" r="1.6"/>
    <path class="o" fill="${C.goldD}" d="M44 48 H56 L53 62 C51 68 47 66 48 60 Z"/>`,
};

function maskPortraitSvg(person, { color = null, tint = null } = {}) {
  const parts = [backdrop(tint)];
  parts.push(`<g class="outfit">${OUTFITS.ecollar}</g>`);
  parts.push(`<g class="skin"><path class="f" d="M43 64 L43 80 Q50 83 57 80 L57 64 Z"/></g>`);
  parts.push(MASK_ART[person.mask] || '');
  return wrap(parts, { pc: color, skin: '#c98a5c' });
}

export function maskSvg(maskId) {
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${MASK_ART[maskId] || ''}</svg>`;
}

// ---------- the hosts who brief you ----------

const MOTHER = `
  <rect class="o" fill="${C.metal}" x="12" y="14" width="76" height="60" rx="10"/>
  <rect class="o2" fill="#1f3b3a" x="20" y="22" width="60" height="44" rx="6"/>
  <circle class="n" fill="${C.glow}" cx="38" cy="40" r="6"/><circle class="n" fill="${C.glow}" cx="62" cy="40" r="6"/>
  <path class="s" d="M36 54 Q50 62 64 54" style="stroke:${C.glow};stroke-width:3"/>
  <path class="s" d="M50 14 V4" stroke-width="3"/><circle class="o2" fill="${C.red}" cx="50" cy="4" r="4"/>
  <path class="o" fill="${C.metalD}" d="M38 74 H62 L66 92 H34 Z"/>
  <circle class="o2" fill="${C.gold}" cx="24" cy="80" r="3"/><circle class="o2" fill="${C.red}" cx="76" cy="80" r="3"/>`;

const HOSTS = {
  manor: { person: { gender: 'm', lookSeed: 77 }, color: '#2f4a6b', look: { hair: 'part', hat: 'peaked', facial: 'handlebar', outfit: 'uniform', accessory: null, skin: '#f2c9a0', hairInk: '#4c3222', hatInk: '#2f4a6b', rx: 18, ry: 21, nose: 0, mouth: 0, brows: 0 } },
  haunted: { person: { gender: 'f', lookSeed: 12 }, color: '#5b4a78', look: { f: true, hair: 'bun', hat: null, facial: null, outfit: 'maid', accessory: 'glasses', skin: '#f8dcc0', hairInk: '#9c9aa8', rx: 18, ry: 21, nose: 1, mouth: 0, brows: 2, earrings: false } },
  egypt: { person: { gender: 'm', lookSeed: 31 }, color: '#8a7a4a', look: { hair: 'part', hat: 'fedora', facial: 'beard', outfit: 'suit', accessory: 'glasses', skin: '#e3ad7f', hairInk: '#7a4a26', hatInk: '#8a6a3a', rx: 18, ry: 21, nose: 3, mouth: 0, brows: 0 } },
};

export function hostSvg(theme) {
  if (theme === 'zeta') return `<svg class="art portrait" viewBox="0 0 100 100" aria-hidden="true">${MOTHER}</svg>`;
  const h = HOSTS[theme] || HOSTS.manor;
  return humanPortraitSvg(h.person, { color: h.color, look: h.look });
}
