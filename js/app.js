// UI: front page (pick a theme and a case), the case itself, taps, saved progress.

import { generatePuzzle, withLiar, CURRENT_GEN } from './generator.js';
import { alibiFits } from './generator2.js';
import { clueText, isFree, canStand, cluesAbout } from './clues.js';
import { OBJECTS, THEMES } from './themes.js';
import { objectSvg, pieceSvg, patternDefsSvg, padSvg, emblemSvg } from './art.js';
import { portraitSvg, hostSvg } from './portraits.js';
import { logicalSolve } from './solver.js';
import { explainNext } from './hints.js';
import { play, unlock, setSoundEnabled } from './sound.js';

const STORE_KEY = 'murdoku:v2';
const CELL = 100;
// Centre a capital letter on a point by its cap height rather than dominant-baseline, which
// iOS Safari positions differently from other browsers. Alfa Slab One capitals are 0.69em tall.
const CAP_OFFSET = (fontSize) => +(fontSize * 0.69 / 2).toFixed(1);
const $ = (sel, el = document) => el.querySelector(sel);
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

const store = loadStore();
setSoundEnabled(store.settings.sound);
let P = null; // current puzzle
let S = null; // play state
let toastTimer = null;

// Saved per device: { detective, settings, theme, progress: { 'medium-3': {...} }, last }
function loadStore() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { /* private mode */ }
  s.detective ??= '';
  s.progress ||= {};
  s.settings ||= {};
  s.settings.autoX ??= true;
  s.settings.highlight ??= true;
  s.settings.sound ??= true;
  s.settings.earthNames ??= false;
  s.theme ||= 'manor';
  s.seenIntro ||= {};
  return s;
}
function saveStore() {
  if (S && P) {
    const now = Date.now();
    if (!S.solved && !document.hidden) S.elapsed += now - S.tick;
    S.tick = now;
    store.progress[P.key] = {
      // gen: the recipe that made this case, so it is rebuilt identically next time
      gen: P.gen,
      placed: S.placed, marks: [...S.marks], notes: notesToJson(S.notes), hints: S.hints, elapsed: S.elapsed,
      solved: S.solved, touched: S.placed.some((x) => x != null) || S.marks.size > 0 || S.notes.size > 0,
      liarKnown: S.liarKnown || undefined, suspect: S.suspect ?? undefined,
      guesses: S.guesses?.some((g) => g != null) ? S.guesses : undefined, misses: S.misses || undefined,
    };
  }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

// notes: Map<cell, Set<personIndex>>, stored as [[cell, [k, ...]], ...]
const notesToJson = (notes) => [...notes].filter(([, ks]) => ks.size).map(([i, ks]) => [i, [...ks]]);
const notesFromJson = (arr) => new Map((arr || []).map(([i, ks]) => [i, new Set(ks)]));

const DESKS = {
  easy: { name: 'Easy', stars: '★☆☆' },
  medium: { name: 'Medium', stars: '★★☆' },
  hard: { name: 'Hard', stars: '★★★' },
};

// What each theme's front-page cards and briefing say.
const EDITIONS = {
  manor: {
    blurb: 'Country-house murder, the classic way.',
    hostName: 'the Chief',
    hello: 'Welcome, detective! Victim, suspects, one murderer. You handle the logic, I give the pep talks.',
    desks: {
      easy: ['The Village Beat', 'Five people. Statements about rooms and furniture only.'],
      medium: ['The City Desk', 'Six people, with at most one "one row north of…" twist.'],
      hard: ['The Night Shift', 'Six people, and plenty of who-stood-where-of-whom.'],
    },
  },
  zeta: {
    blurb: 'An alien research station. Telepaths, teleporters, and one human impostor.',
    hostName: 'MOTHER, the station computer',
    hello: 'Greetings, detective. Outpost Zeta-9 has a body, a crew of telepaths, and me. I am the helpful one.',
    desks: {
      easy: ['Telepathy', 'Every alien tells you what they sensed about someone else.'],
      medium: ['Teleporters', 'Plus two linked pads: standing on one counts as beside whatever surrounds its twin.'],
      hard: ['The Impostor', 'Plus a human in disguise among the crew. Humans lie: one statement is false.'],
    },
    intro: [
      'Everyone aboard Outpost Zeta-9 is an alien, and every alien is telepathic: each one tells you what they <b>sensed about someone else</b>, never about themselves.',
      'On <b>Medium</b>, two <b>teleporter pads</b> are linked. Standing on one counts as standing beside everything around its twin.',
      'On <b>Hard</b>, one crew member is a <b>human in disguise</b>. Humans lie: exactly one statement is false. Work out whose, and the case falls into place.',
      'The switch above the board flips everyone between their alien names and the Earth names they use when visiting.',
    ],
  },
  haunted: {
    blurb: 'A haunted house. One of the suspects has been dead for a hundred years.',
    hostName: 'Mrs Hobbs, the housekeeper',
    hello: 'Welcome to Hollow Hill House, detective. Mind the cold spots, and do wipe your feet.',
    desks: {
      easy: ['The Hallway', 'Five suspects, one of them a ghost.'],
      medium: ['The Upstairs', 'Six suspects, a ghost, and at most one "one row north of…" twist.'],
      hard: ['The Witching Hour', 'Six suspects, a ghost, and plenty of who-stood-where-of-whom.'],
    },
    intro: [
      'One of the suspects is a <b>ghost</b>. Ghosts drift straight through furniture, so the ghost may stand <b>inside</b> a wardrobe, a piano or a coffin, where nobody living can.',
      'Everything else is as usual: one person per row and column, and the victim was alone with the murderer.',
    ],
  },
  egypt: {
    blurb: 'Tombs, temples and the Nile. The suspects hid behind the masks of the gods.',
    hostName: 'Professor Sands, archaeologist',
    hello: 'Ah, detective! Three thousand years late to the crime scene, but the sand keeps everything.',
    desks: {
      easy: ['Masks of the Gods', 'You place masks, not names. Then the alibis tell you who hid behind the killer\'s mask.'],
      medium: ['The Pyramid', 'A stepped pyramid: every row holds one person, but the rows get shorter towards the top.'],
      hard: ['Masks in the Pyramid', 'Both at once: masks to place on a pyramid, then a killer to unmask.'],
    },
    intro: [
      '<b>Masks of the Gods</b> (Easy and Hard): the suspects wore masks, so the statements are about the Jackal, the Cat, the Falcon… Place the <b>masks</b> as usual.',
      'Then comes the unmasking. Each named suspect gives an <b>alibi</b> that is true of the square their mask stood on. The alibis fit the masks in exactly one way, so you can work out <b>who was behind the killer\'s mask</b>.',
      '<b>The Pyramid</b> (Medium and Hard): the board is a stepped pyramid. Every <b>row</b> holds exactly one person; a column holds one at most, and some columns stay empty.',
    ],
  },
};
const COMING_SOON = [['heist', 'The Midnight Heist', 'Security cameras that see along their row']];

// Floor colour per kind of room.
const FLOORS = {
  garden: '#bfe5b0', terrace: '#e3dcc8', bedroom: '#e4d3f0', library: '#f3dcb4', kitchen: '#d6ebf3', parlour: '#f8d5d0',
  dining: '#fbe6a2', study: '#d5e2c2', hall: '#ece4d2', conservatory: '#cdeccf', cellar: '#d8cfc4', ballroom: '#f6dfee',
  airlock: '#cfd9e8', hydroponics: '#c3e9c6', lab: '#d0ebef', reactor: '#f8d7c2', mess: '#f5e7b6', sleepbay: '#dad3f2', bridge: '#c8d8f4', vault: '#e4cfea',
  graveyard: '#b7d2b1', seance: '#dac6e6', crypt: '#cdcdda', attic: '#e6d2b6', chapel: '#eadfc0', hgallery: '#e8c8c8', hbedroom: '#c9d8e8', music: '#d5e5cf', hparlour: '#f0d6c4',
  burial: '#ead59c', treasury: '#f6dc8a', embalm: '#cde5de', temple: '#f2caa6', throne: '#e9c9df', scribes: '#eedcc4', nile: '#b4e2d0', court: '#f3e4b2',
};

// Manor keys stay "medium-3" (saved progress predates themes); others are "zeta-medium-3".
const caseKey = (t, d, n) => (t === 'manor' ? `${d}-${n}` : `${t}-${d}-${n}`);
const parseKey = (k) => {
  const m = /^(?:(zeta|haunted|egypt)-)?(easy|medium|hard)-(\d+)$/.exec(k || '');
  return m ? [m[1] || 'manor', m[2], Number(m[3])] : null;
};
const casesOf = (t, d) => Object.entries(store.progress).filter(([k]) => { const c = parseKey(k); return c && c[0] === t && c[1] === d; });
const solvedCount = (t, d) => casesOf(t, d).filter(([, v]) => v.solved).length;
const played = (v) => !!v && (v.solved || v.touched);
// the lowest case number not yet played, so solved cases never come round again
function nextNewCase(t, d) {
  let n = 1;
  while (played(store.progress[caseKey(t, d, n)])) n++;
  return n;
}
const inProgress = (t, d) => casesOf(t, d).filter(([, v]) => !v.solved && v.touched)
  .map(([k]) => parseKey(k)[2]).sort((a, b) => a - b);

// ---------- colours ----------
// Each suspect gets a colour of their own; the victim is always red.
const INKS = ['#2f6fc2', '#2e8b4e', '#d9731a', '#8a4fc0', '#0f9aa6', '#c9367a', '#6f7d1f', '#4a55c4'];
const VICTIM_INK = '#c8372d';
const PAGE = '#fdf5dc';
function mixHex(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v * t + pb[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
}
const inkOf = (k) => (P.people[k].isVictim ? VICTIM_INK : INKS[k % INKS.length]);
const tintOf = (k) => mixHex(inkOf(k), '#ffffff', 0.3);

// ---------- case lifecycle ----------

function setHash(h) {
  try {
    if (location.hash !== h) history.replaceState(null, '', h || location.pathname);
  } catch { /* sandboxed frames may refuse URL changes */ }
}

function openCase(t, d, n) {
  if (S && P) saveStore();
  n = Math.max(1, n);
  const key = caseKey(t, d, n);
  const saved = store.progress[key];
  // A case keeps the recipe it was first made with, so a saved board always fits its puzzle.
  // Saves from before recipes were stamped are recipe 1 if they were played at all.
  // Cases nobody has opened yet are made with the newest recipe.
  const gen = saved ? (saved.gen ?? (played(saved) ? 1 : CURRENT_GEN)) : CURRENT_GEN;
  P = generatePuzzle({ seed: n, difficulty: d, theme: t, gen });
  P.key = key;
  P.num = n;
  P.desk = d;
  P.themeId = t;
  applyNames();
  store.last = P.key;
  store.theme = t;
  const keep = played(saved) ? saved : null;
  S = {
    placed: keep?.placed ?? new Array(P.people.length).fill(null),
    marks: new Set(keep?.marks ?? []),
    notes: notesFromJson(keep?.notes),
    crossMode: false,
    hints: keep?.hints ?? 0,
    elapsed: keep?.elapsed ?? 0,
    solved: keep?.solved ?? false,
    tick: Date.now(),
    selected: null,
    history: [],
    fresh: null,
    flagged: null,
    hintFocus: null,
    hintStage: 0,
    hintMarks: null,
    liarKnown: keep?.liarKnown ?? false,
    suspect: keep?.suspect ?? null,
    guesses: keep?.guesses ?? (P.unmask ? P.unmask.suspects.map(() => null) : null),
    misses: keep?.misses ?? 0,
    alibiSel: null,
  };
  setHash(`#${P.key}`);
  renderPage();
  saveStore();
  window.scrollTo(0, 0);
  if (EDITIONS[t].intro && !store.seenIntro[t]) showIntro(t);
}

// Zeta-9: everyone has an alien name and the Earth alias they use on visits.
function applyNames() {
  for (const pr of P.people) {
    if (!pr.alienName) continue;
    pr.name = store.settings.earthNames ? pr.earthName : pr.alienName;
    pr.initial = store.settings.earthNames ? pr.earthInitial : pr.alienInitial;
  }
}
function setEarthNames(on) {
  store.settings.earthNames = on;
  saveStore();
  applyNames();
  renderPage();
  play('select');
}
// Story text was written with alien names; follow the Alien/Earth switch.
function withCurrentNames(text) {
  for (const pr of P.people) if (pr.alienName && pr.name !== pr.alienName) text = text.split(pr.alienName).join(pr.name);
  return text;
}

// The puzzle as it really is: on Hard Zeta-9 the impostor's statement is false.
const truthView = () => (P.impostor >= 0 ? withLiar(P, P.impostor) : P);

// Egypt with masks: every mask is in the right place, and the killer still has to be named.
const allCorrect = () => S.placed.every((x, k) => x === P.solution[k]);
const accusing = () => !!P.unmask && !S.solved && allCorrect();
const locked = () => S.solved || accusing();

function showHome() {
  if (S && P) saveStore();
  P = null;
  S = null;
  setHash('');
  closeModal();
  renderHome();
  window.scrollTo(0, 0);
}

// ---------- rendering ----------

const ICONS = {
  undo: '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
  hint: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
  restart: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  cross: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  rules: '<svg viewBox="0 0 24 24"><path d="M4 4h12l4 4v12H4z"/><path d="M8 10h8M8 14h8M8 18h5"/></svg>',
};

const escapeHtml = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const detective = () => (store.detective ? `Detective ${escapeHtml(store.detective)}` : 'detective');
const logoHtml = (cls = '') => `<span class="logo ${cls}" aria-label="Murdoku">${'MURDOKU'.split('').map((ch) => `<i>${ch}</i>`).join('')}</span>`;

function renderHome() {
  const t = store.theme in THEMES ? store.theme : 'manor';
  const E = EDITIONS[t];
  const total = Object.keys(store.progress).filter((k) => store.progress[k].solved).length;
  const last = parseKey(store.last);
  const lastP = last && store.progress[store.last];
  const resume = lastP && !lastP.solved && lastP.touched
    ? `<button class="resume" data-act="open" data-case="${store.last}">
         <span class="kicker">Unfinished business</span>
         <span class="resume-title">Continue ${THEMES[last[0]].short} · ${DESKS[last[1]].name} No. ${last[2]} ▸</span>
       </button>` : '';
  const editions = Object.values(THEMES).map((T) => {
    const solved = ['easy', 'medium', 'hard'].reduce((a, d) => a + solvedCount(T.id, d), 0);
    return `<button class="edition theme-${T.id} ${T.id === t ? 'on' : ''}" data-act="theme" data-theme="${T.id}" aria-pressed="${T.id === t}">
        ${emblemSvg(T.id)}<span class="edition-name">${T.name}</span><span class="edition-meta">${solved} solved</span></button>`;
  }).join('') + COMING_SOON.map(([id, name, what]) => `<div class="edition soon" title="${what}">${emblemSvg(id)}<span class="edition-name">${name}</span><span class="edition-meta">coming soon</span></div>`).join('');
  const desks = Object.entries(DESKS).map(([d, D]) => {
    const [beat, blurb] = E.desks[d];
    const open = inProgress(t, d).filter((n) => caseKey(t, d, n) !== store.last).slice(0, 4);
    const next = nextNewCase(t, d);
    return `
      <article class="desk desk-${d}">
        <div class="desk-head"><span class="desk-stars">${D.stars}</span><span class="desk-solved">${solvedCount(t, d)} solved</span></div>
        <h3>${D.name}</h3>
        <div class="desk-beat">${beat}</div>
        <p>${blurb}</p>
        <button class="btn primary" data-act="open" data-case="${caseKey(t, d, next)}">New case · No. ${next}</button>
        ${open.length ? `<div class="desk-open">In progress: ${open.map((n) => `<button data-act="open" data-case="${caseKey(t, d, n)}">No. ${n}</button>`).join(' ')}</div>` : ''}
      </article>`;
  }).join('');
  $('#app').innerHTML = `
    ${patternDefsSvg()}
    <div class="page home theme-${t}">
      <header class="home-head">
        ${logoHtml('big')}
        <p class="tagline">Sudoku meets murder mystery</p>
      </header>
      <main class="home-main">
        <section class="host-row">
          <div class="host">${hostSvg(t)}</div>
          <div class="bubble">
            <b>${E.hostName}:</b> ${E.hello}
            ${E.intro ? ` <button class="link" data-act="intro" data-theme="${t}">How this one works</button>` : ''}
          </div>
        </section>
        <label class="detective-name">Detective
          <input id="detective" type="text" maxlength="24" autocomplete="nickname" placeholder="your name" value="${escapeHtml(store.detective)}">
          <span class="closed">${total} ${total === 1 ? 'case' : 'cases'} closed</span>
        </label>
        ${resume}
        <section>
          <h3 class="section-title">Pick a world</h3>
          <div class="editions">${editions}</div>
          <p class="edition-blurb">${E.blurb}</p>
        </section>
        <section>
          <h3 class="section-title">Pick a case</h3>
          <div class="desks">${desks}</div>
        </section>
        <p class="home-foot">Every case is generated for you and checked to have exactly one solution. Solved cases never come round again on this device. <button class="link" data-act="rules">How to play</button></p>
      </main>
    </div>`;
  $('#detective').addEventListener('change', (ev) => {
    store.detective = ev.target.value.trim();
    saveStore();
    renderHome();
  });
}

function showIntro(t) {
  const E = EDITIONS[t];
  store.seenIntro[t] = true;
  saveStore();
  modal(`
    <div class="host-row"><div class="host">${hostSvg(t)}</div><div class="bubble"><b>${E.hostName}:</b> ${E.hello}</div></div>
    <h2>${THEMES[t].name}</h2>
    ${E.intro.map((x) => `<p>${x}</p>`).join('')}
    <div class="actions"><button class="btn primary" data-act="close">On the case</button></div>`, `theme-${t}`);
}

function twistLine() {
  if (P.impostor >= 0) return 'One crew member is a <b>human in disguise</b>, and their statement is false.';
  if (P.unmask) return 'Place the <b>masks</b>. Then use the alibis to work out who hid behind the killer\'s mask.';
  if (P.rules?.ghost) return 'The <b>ghost</b> can stand inside furniture.';
  if (P.rules?.teleporters) return 'Standing on a <b>teleporter pad</b> counts as beside everything around its twin.';
  return '';
}

function ruleLine() {
  const rows = P.people.length === P.h, cols = P.people.length === P.w;
  if (rows && cols) return 'Everyone stood in a different row and column. The victim was alone with the killer.';
  return `Every ${rows ? 'row' : 'column'} holds exactly one person; no ${rows ? 'column' : 'row'} holds two. The victim was alone with the killer.`;
}

function renderPage() {
  const D = DESKS[P.desk];
  const T = THEMES[P.themeId];
  const names = P.people.some((pr) => pr.alienName)
    ? `<div class="name-toggle" role="group" aria-label="Names">
        <button data-act="names" data-earth="0" aria-pressed="${!store.settings.earthNames}">Alien names</button>
        <button data-act="names" data-earth="1" aria-pressed="${store.settings.earthNames}">Earth names</button>
      </div>` : '';
  const twist = twistLine();
  $('#app').innerHTML = `
    ${patternDefsSvg()}
    <div class="page case theme-${P.themeId}">
      <header class="topbar">
        <button class="back" data-act="home" aria-label="All cases">◂ Cases</button>
        ${logoHtml('small')}
        <span class="case-id">${T.short} · ${D.name} · No. ${P.num}</span>
      </header>
      <main class="layout">
        <section class="story host-row">
          <div class="host">${hostSvg(P.themeId)}</div>
          <div class="bubble">
            <h2 class="headline">${P.headline}</h2>
            <p class="lede">${withCurrentNames(P.lede)}</p>
            <p class="rule-line">${ruleLine()}${twist ? ` ${twist}` : ''}</p>
          </div>
        </section>
        <section class="board-wrap">${names}<div class="accuse-slot"></div>${boardSvg()}</section>
        <section class="dossier">
          <h3 class="section-title">${P.unmask ? 'The masks' : 'The suspects'}</h3>
          <div class="cards">${P.people.map(cardHtml).join('')}</div>
          ${P.unmask ? `<h3 class="section-title">The alibis</h3>
            <p class="alibi-note">Each of these people wore one of the masks. Their alibi is true of the square that mask stood on.</p>
            <div class="alibis">${P.unmask.suspects.map(alibiHtml).join('')}</div>` : ''}
        </section>
      </main>
    </div>
    <nav class="toolbar">
      <div class="hint-slip" role="note" hidden></div>
      <div class="status" role="status" aria-live="polite"></div>
      <div class="tools">
        <button class="tool" data-act="undo">${ICONS.undo}Undo</button>
        <button class="tool" data-act="cross" aria-pressed="false">${ICONS.cross}Cross</button>
        <button class="tool" data-act="hint">${ICONS.hint}Hint</button>
        <button class="tool" data-act="restart">${ICONS.restart}Restart</button>
        <button class="tool" data-act="rules">${ICONS.rules}Rules</button>
      </div>
    </nav>`;
  renderDynamic();
  setStatus(defaultStatus());
}

// On a card "the Jackal" is simply "Jackal".
const shortName = (person) => cap(person.masked ? person.name.replace(/^the /, '') : person.name);

const colourNames = (html) => html.replace(/data-who="(\d+)"/g, (_, j) => `style="color:${inkOf(Number(j))}"`);

function cardHtml(person, k) {
  const said = colourNames(person.clues.map((c) => clueText(P, person, c)).join(' '));
  const clues = person.isVictim ? `<b>The victim.</b> Alone with the murderer.${said ? ` ${said}` : ''}` : said;
  const lie = P.impostor >= 0 && !person.isVictim
    ? `<span class="lie-tag" role="button" tabindex="0" data-act="suspect" data-k="${k}" aria-label="Mark ${person.name} as the liar">lying?</span>` : '';
  return `
    <button class="card ${person.isVictim ? 'victim' : ''} ${person.ghost ? 'ghost' : ''}" data-person="${k}" aria-label="${person.name}" style="--pc:${inkOf(k)};--pc-tint:${tintOf(k)}">${lie}
      <div class="photo">${portraitSvg(person, { dead: person.isVictim, color: inkOf(k), tint: tintOf(k) })}</div>
      <div class="meta">
        <div class="name ${shortName(person).length > 7 ? 'long' : ''}">${shortName(person)}</div>
        <div class="role">${person.title}</div>
      </div>
      <div class="clue">${clues}</div>
    </button>`;
}

function alibiHtml(sp, i) {
  const ink = '#6b5b45', tint = '#efe3cc';
  return `
    <div class="alibi" data-alibi="${i}" style="--pc:${ink};--pc-tint:${tint}">
      <button class="alibi-main" data-act="alibi" data-i="${i}" aria-label="${sp.name}'s alibi">
        <span class="photo">${portraitSvg(sp, { color: ink, tint })}</span>
        <span class="meta"><span class="name">${sp.name}</span><span class="role">${sp.title}</span></span>
        <span class="clue">${clueText(P, sp, sp.alibi)}</span>
      </button>
      <button class="guess" data-act="guess" data-i="${i}" aria-label="Note which mask ${sp.name} wore">?</button>
    </div>`;
}

// ---------- the board ----------

function boardSvg() {
  const w = P.w, h = P.h, N = w * h;
  const out = [];
  const cellOk = (i) => i >= 0 && i < N && !P.cells[i].void;
  const xy = (i) => [(i % w) * CELL, Math.floor(i / w) * CELL];
  out.push(`<svg class="board" id="board" viewBox="-10 -46 ${w * CELL + 20} ${h * CELL + 56}" style="--bw:${w};--bh:${h}" role="grid" aria-label="Crime scene, north is up">`);
  out.push(`<text class="caption" x="0" y="-18">The scene of the crime</text>`);
  out.push(`<text class="caption compass" x="${w * CELL}" y="-18" text-anchor="end">▲ NORTH</text>`);
  // floors
  for (let i = 0; i < N; i++) {
    if (!cellOk(i)) continue;
    const [x, y] = xy(i);
    const area = P.areas[P.cells[i].area];
    out.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${FLOORS[area.type] || '#eee6d0'}"/>`);
    out.push(`<rect class="floor" x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="url(#pt-${area.pattern})"/>`);
  }
  // grid inside rooms
  for (let i = 0; i < N; i++) {
    if (!cellOk(i)) continue;
    const [x, y] = xy(i);
    const c = i % w;
    if (c < w - 1 && cellOk(i + 1) && P.cells[i].area === P.cells[i + 1].area) out.push(`<line class="gridline" x1="${x + CELL}" y1="${y}" x2="${x + CELL}" y2="${y + CELL}"/>`);
    if (cellOk(i + w) && P.cells[i].area === P.cells[i + w].area) out.push(`<line class="gridline" x1="${x}" y1="${y + CELL}" x2="${x + CELL}" y2="${y + CELL}"/>`);
  }
  // teleporter pads (Zeta-9), under any furniture
  for (let i = 0; i < N; i++) {
    if (P.cells[i].pad == null) continue;
    const [x, y] = xy(i);
    out.push(`<g class="pad" transform="translate(${x + 4} ${y + 4}) scale(0.92)">${padSvg()}</g>`);
  }
  // walls between rooms; each pair of neighbouring rooms is joined by one doorway
  const borders = new Map(); // "a,b" -> wall segments [x1, y1, x2, y2, clear]
  const seg = (i, j, x1, y1, x2, y2) => {
    const a = P.cells[i].area, b = P.cells[j].area;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!borders.has(key)) borders.set(key, []);
    borders.get(key).push([x1, y1, x2, y2, !P.cells[i].obj && !P.cells[j].obj]);
  };
  for (let i = 0; i < N; i++) {
    if (!cellOk(i)) continue;
    const [x, y] = xy(i);
    const c = i % w;
    if (c < w - 1 && cellOk(i + 1) && P.cells[i].area !== P.cells[i + 1].area) seg(i, i + 1, x + CELL, y, x + CELL, y + CELL);
    if (cellOk(i + w) && P.cells[i].area !== P.cells[i + w].area) seg(i, i + w, x, y + CELL, x + CELL, y + CELL);
  }
  const walls = [];
  for (const segs of borders.values()) {
    // the doorway goes where no furniture stands against the wall, as near the middle as possible
    const mid = (segs.length - 1) / 2;
    const door = segs.map((sg, n) => [sg, Math.abs(n - mid) + (sg[4] ? 0 : 10)]).sort((p1, p2) => p1[1] - p2[1])[0][0];
    for (const sg of segs) {
      const [x1, y1, x2, y2] = sg;
      if (sg !== door) { walls.push(`<line class="wall" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`); continue; }
      const dx = x1 === x2 ? 0 : 1, dy = 1 - dx;
      walls.push(`<line class="wall" x1="${x1}" y1="${y1}" x2="${x1 + dx * 22}" y2="${y1 + dy * 22}"/><line class="wall" x1="${x2 - dx * 22}" y1="${y2 - dy * 22}" x2="${x2}" y2="${y2}"/>`
        + `<line class="door" x1="${x1 + dx * 30}" y1="${y1 + dy * 30}" x2="${x2 - dx * 30}" y2="${y2 - dy * 30}"/>`);
    }
  }
  out.push(walls.join(''));
  // furniture: big pieces first, then single squares
  const drawn = new Set();
  (P.pieces || []).forEach((piece, idx) => {
    const art = pieceSvg(piece);
    if (!art) return;
    drawn.add(idx);
    const x = piece.c * CELL, y = piece.r * CELL;
    const pw = piece.w * CELL, ph = piece.h * CELL;
    out.push(`<g class="obj" transform="translate(${x + pw * 0.05} ${y + ph * 0.05}) scale(0.9)">${art}</g>`);
  });
  for (let i = 0; i < N; i++) {
    const cell = P.cells[i];
    if (!cell.obj || (cell.piece != null && drawn.has(cell.piece))) continue;
    const [x, y] = xy(i);
    out.push(`<g class="obj" data-cell="${i}" transform="translate(${x + 8} ${y + 8}) scale(0.84)">${objectSvg(cell.obj)}</g>`);
  }
  // the outer wall follows the shape of the board
  const outer = [];
  for (let i = 0; i < N; i++) {
    if (!cellOk(i)) continue;
    const [x, y] = xy(i);
    const c = i % w, r = Math.floor(i / w);
    if (r === 0 || !cellOk(i - w)) outer.push(`M${x} ${y}H${x + CELL}`);
    if (r === h - 1 || !cellOk(i + w)) outer.push(`M${x} ${y + CELL}H${x + CELL}`);
    if (c === 0 || !cellOk(i - 1)) outer.push(`M${x} ${y}V${y + CELL}`);
    if (c === w - 1 || !cellOk(i + 1)) outer.push(`M${x + CELL} ${y}V${y + CELL}`);
  }
  out.push(`<path class="outer" d="${outer.join('')}"/>`);
  // room name tags, bottom-right square of each room
  P.areas.forEach((a, id) => {
    let best = -1;
    for (let i = 0; i < N; i++) if (cellOk(i) && P.cells[i].area === id) best = i;
    if (best < 0) return;
    const tw = Math.min(a.name.length * 10.5 + 18, CELL * 1.9);
    const [bx, by] = xy(best);
    let x = bx + CELL - tw - 4;
    // keep the tag inside the room where it can be
    const room = (i) => cellOk(i) && P.cells[i].area === id;
    if (x < bx && !(best % w > 0 && room(best - 1))) x = bx + 4;
    out.push(`<g class="tag" pointer-events="none"><rect x="${x}" y="${by + CELL - 25}" width="${tw}" height="21" rx="10.5"/><text x="${x + tw / 2}" y="${by + CELL - 9.5}" text-anchor="middle">${a.name}</text></g>`);
  });
  out.push('<g id="dyn"></g><g id="press"></g>');
  out.push('</svg>');
  return out.join('');
}

function cross(i) {
  const w = P.w;
  const x = (i % w) * CELL, y = Math.floor(i / w) * CELL;
  const cx = x + CELL / 2, cy = y + CELL / 2;
  const j = ((i * 37) % 7) - 3; // hand-drawn wobble
  const s = 26;
  return `<rect class="excluded-shade" x="${x}" y="${y}" width="${CELL}" height="${CELL}"/><path class="excluded" d="M${cx - s} ${cy - s + j} L${cx + s} ${cy + s - j} M${cx + s + j} ${cy - s} L${cx - s - j} ${cy + s}"/>`;
}

const cellRect = (i, cls, inset = 0, rx = 0) => {
  const w = P.w;
  return `<rect class="${cls}" x="${(i % w) * CELL + inset}" y="${Math.floor(i / w) * CELL + inset}" width="${CELL - 2 * inset}" height="${CELL - 2 * inset}"${rx ? ` rx="${rx}"` : ''}/>`;
};

function renderDynamic() {
  const w = P.w, N = P.w * P.h;
  const dyn = $('#dyn');
  const out = [];
  const occupied = new Map();
  S.placed.forEach((cell, k) => { if (cell != null) occupied.set(cell, k); });
  const rows = new Map(), cols = new Map();
  S.placed.forEach((cell, k) => {
    if (cell == null) return;
    const r = Math.floor(cell / w), c = cell % w;
    rows.set(r, [...(rows.get(r) || []), k]);
    cols.set(c, [...(cols.get(c) || []), k]);
  });
  const conflicts = new Set();
  for (const m of [rows, cols]) for (const ks of m.values()) if (ks.length > 1) ks.forEach((k) => conflicts.add(k));

  if (store.settings.highlight) {
    if (S.selected != null) out.push(...clueHighlights(cluesAbout(P, S.selected)));
    else if (S.alibiSel != null && P.unmask) out.push(...clueHighlights([P.unmask.suspects[S.alibiSel].alibi]));
  }
  if (S.hintMarks) for (const i of S.hintMarks) if (!P.cells[i].void) out.push(cellRect(i, 'hint-hi'));
  if (S.selected != null && S.placed[S.selected] != null) out.push(cellRect(S.placed[S.selected], 'cell-hi'));
  for (let i = 0; i < N; i++) {
    if (P.cells[i].void || occupied.has(i)) continue;
    const auto = store.settings.autoX && (rows.has(Math.floor(i / w)) || cols.has(i % w));
    // one look for every excluded square: crossed by you, by a placed person's row/column,
    // and blocked furniture squares in those rows/columns too
    if (S.marks.has(i) || auto) out.push(cross(i));
    if (!isFree(P, i) && !S.notes.get(i)?.size) continue; // ghosts may have notes inside furniture
    // notes are kept but hidden while crossed out or once that person is placed
    const ks = [...(S.notes.get(i) || [])].filter((k) => S.placed[k] == null);
    if (ks.length && !auto && !S.marks.has(i)) out.push(notesSvg(i, ks));
  }
  if (S.solved || accusing()) {
    // light up the scene of the crime
    const area = P.cells[S.placed[P.victim]].area;
    for (let i = 0; i < N; i++) if (P.cells[i].area === area) out.push(cellRect(i, 'scene-hi'));
  }
  for (const [cell, k] of occupied) {
    const person = P.people[k];
    const cx = (cell % w) * CELL + CELL / 2, cy = Math.floor(cell / w) * CELL + CELL / 2;
    const cls = ['token'];
    if (person.isVictim) cls.push('victim');
    if (person.ghost) cls.push('ghost');
    if (k === S.selected) cls.push('selected');
    if (conflicts.has(k)) cls.push('conflict');
    if (k === S.flagged) cls.push('flagged');
    if (k === S.fresh) cls.push('fresh');
    if ((S.solved || accusing()) && k === P.murderer) cls.push('killer');
    out.push(`<g class="${cls.join(' ')}" style="--pc:${inkOf(k)}"><g transform="translate(${cx} ${cy})"><circle class="halo" r="38"/><circle class="disc" r="33"/><text y="${CAP_OFFSET(42)}">${person.initial}</text></g></g>`);
  }
  dyn.innerHTML = out.join('');
  S.fresh = null;

  const refs = S.selected != null && store.settings.highlight ? referencedPeople(S.selected) : new Set();
  document.querySelectorAll('.card').forEach((el) => {
    const k = Number(el.dataset.person);
    el.classList.toggle('selected', k === S.selected);
    el.classList.toggle('placed', S.placed[k] != null);
    el.classList.toggle('flagged', k === S.flagged);
    el.classList.toggle('hinted', k === S.hintFocus);
    el.classList.toggle('ref', refs.has(k));
    el.classList.toggle('suspect', k === S.suspect && !(S.liarKnown && k === P.impostor));
    el.classList.toggle('liar', S.liarKnown && k === P.impostor);
    el.setAttribute('aria-pressed', String(k === S.selected));
  });
  if (P.unmask) {
    const masks = P.people.filter((pr) => !pr.isVictim);
    document.querySelectorAll('.alibi').forEach((el) => {
      const i = Number(el.dataset.alibi);
      el.classList.toggle('selected', i === S.alibiSel);
      const g = S.guesses[i];
      const btn = $('.guess', el);
      btn.textContent = g == null ? '?' : masks[g].initial;
      btn.style.background = g == null ? '' : inkOf(P.people.indexOf(masks[g]));
      btn.classList.toggle('set', g != null);
    });
    const slot = $('.accuse-slot');
    if (slot) {
      slot.innerHTML = accusing()
        ? `<button class="btn primary accuse-btn" data-act="accuse">Every mask is placed. Unmask the killer ▸</button>` : '';
    }
  }
  const undoBtn = $('[data-act="undo"]');
  if (undoBtn) undoBtn.disabled = !S.history.length || locked();
  const hintBtn = $('[data-act="hint"]');
  if (hintBtn) hintBtn.disabled = S.solved;
  const crossBtn = $('[data-act="cross"]');
  if (crossBtn) {
    crossBtn.classList.toggle('on', S.crossMode);
    crossBtn.setAttribute('aria-pressed', String(S.crossMode));
    crossBtn.disabled = locked();
  }
  // while painting notes/crosses, a finger drag on the board must not scroll the page
  $('#board')?.classList.toggle('painting', !locked() && (S.crossMode || S.selected != null));
}

// Outline whatever a statement talks about: every rug for "on a rug", every shelf for
// "beside a shelf", the whole room for "in the Library".
function clueHighlights(clues) {
  const w = P.w, h = P.h, out = [];
  const EDGE = { top: (i) => i < w, bottom: (i) => i >= w * (h - 1), left: (i) => i % w === 0, right: (i) => i % w === w - 1 };
  for (const c of clues) {
    for (let i = 0; i < w * h; i++) {
      if (P.cells[i].void) continue;
      if (c.obj && P.cells[i].obj === c.obj) out.push(cellRect(i, 'clue-hi', 5, 12));
      else if (c.area != null && P.cells[i].area === c.area) out.push(cellRect(i, 'area-hi'));
      else if (c.type === 'edge' && EDGE[c.side](i)) out.push(cellRect(i, 'area-hi'));
    }
    if (c.type === 'rel' && S.placed[c.who] != null) out.push(cellRect(S.placed[c.who], 'clue-hi', 5, 12));
  }
  return out;
}

// People that statements about the selected person mention ("one row north of Hugo").
function referencedPeople(k) {
  return new Set(cluesAbout(P, k).filter((c) => c.who != null).map((c) => c.who));
}

// Pencil marks: each person has a fixed slot (3 per row), top and bottom of the square
// so the furniture in the middle stays readable.
function notesSvg(i, ks) {
  const w = P.w, N = P.people.length;
  const x0 = (i % w) * CELL, y0 = Math.floor(i / w) * CELL;
  const rowsN = Math.ceil(N / 3);
  const ys = rowsN === 1 ? [22] : rowsN === 2 ? [21, 80] : [21, 50, 80];
  return ks.sort((a, b) => a - b).map((k) => {
    const x = x0 + 21 + (k % 3) * 29, y = y0 + ys[Math.floor(k / 3)];
    return `<text class="note" x="${x}" y="${y + CAP_OFFSET(25)}" style="fill:${inkOf(k)}">${P.people[k].initial}</text>`;
  }).join('');
}

function defaultStatus() {
  if (S.solved) return `Case closed. ${killerName()} did it.`;
  if (accusing()) return 'Every mask is in place. Now: who was behind the killer\'s mask?';
  if (S.crossMode) return 'Cross-out mode: tap or swipe squares.';
  if (S.selected != null) {
    const pr = P.people[S.selected];
    return S.placed[S.selected] != null
      ? `${cap(pr.name)}: hold a square to move · hold ${pr.initial} to remove`
      : `${cap(pr.name)}: tap or swipe to note · hold to place`;
  }
  const left = S.placed.filter((x) => x == null).length;
  if (left === P.people.length) return 'Pick a suspect. Tap a square to note, hold to place.';
  return `${left} ${left === 1 ? 'person' : 'people'} left to place.`;
}

const killerName = () => (P.unmask ? P.unmask.suspects[killerSuspect()].name : cap(P.people[P.murderer].name));
const killerSuspect = () => P.unmask.wears.indexOf(P.murderer);

function setStatus(text, alert = false) {
  const el = $('.toolbar .status');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('alert', alert);
}

function toast(text, alert = true) {
  setStatus(text, alert);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { if (S) setStatus(defaultStatus()); }, 2800);
}

// ---------- interaction ----------

function snapshot() {
  S.history.push({ placed: S.placed.slice(), marks: [...S.marks], notes: notesToJson(S.notes) });
  if (S.history.length > 300) S.history.shift();
}

function cellFromEvent(ev) {
  const svg = $('#board');
  const pt = svg.createSVGPoint();
  pt.x = ev.clientX; pt.y = ev.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  const c = Math.floor(p.x / CELL), r = Math.floor(p.y / CELL);
  if (r < 0 || c < 0 || r >= P.h || c >= P.w) return -1;
  const i = r * P.w + c;
  return P.cells[i].void ? -1 : i;
}

// Board gestures (person selected):  tap = toggle note · swipe = paint notes · hold = place.
// Cross mode:                          tap = toggle ✕   · swipe = paint ✕.
// No selection:                        tap a placed letter to select that person.
const HOLD_MS = 450;
let gesture = null;

function onPointerDown(ev, board) {
  if (!P || locked() || ev.button > 0) return;
  const i = cellFromEvent(ev);
  if (i < 0) return;
  ev.preventDefault();
  try { board.setPointerCapture(ev.pointerId); } catch { /* ignore */ }
  gesture = { id: ev.pointerId, start: i, last: i, swiped: false, held: false, timer: null };
  if (S.selected != null && !S.crossMode && canStand(P, S.selected, i)) {
    showPress(i);
    gesture.timer = setTimeout(() => {
      gesture.held = true;
      hidePress();
      navigator.vibrate?.(15);
      holdCell(i);
    }, HOLD_MS);
  }
}

function onPointerMove(ev) {
  const g = gesture;
  if (!g || g.held || ev.pointerId !== g.id) return;
  const i = cellFromEvent(ev);
  if (i < 0 || i === g.last) return;
  if (!S.crossMode && S.selected == null) return;
  if (!g.swiped) {
    g.swiped = true;
    clearTimeout(g.timer);
    hidePress();
    snapshot();
    g.mode = paintModeFor(g.start);
    paint(g.start, g.mode);
  }
  g.last = i;
  if (paint(i, g.mode)) play(PAINT_SOUND[g.mode]);
  renderDynamic();
}

function onPointerUp(ev) {
  const g = gesture;
  if (!g || ev.pointerId !== g.id) return;
  clearTimeout(g.timer);
  hidePress();
  gesture = null;
  if (ev.type === 'pointercancel' || g.held) return;
  if (g.swiped) afterChange();
  else tapCell(g.start);
}

// The first square of a swipe decides whether the swipe adds or removes.
function paintModeFor(i) {
  if (S.crossMode) return S.marks.has(i) ? 'unx' : 'x';
  return S.notes.get(i)?.has(S.selected) ? 'unnote' : 'note';
}

const PAINT_SOUND = { x: 'cross', unx: 'uncross', note: 'note', unnote: 'erase' };

// returns true when the square could be painted
function paint(i, mode) {
  if (S.placed.includes(i)) return false;
  if (S.crossMode ? !isFree(P, i) : !canStand(P, S.selected, i)) return false;
  if (mode === 'x') S.marks.add(i);
  else if (mode === 'unx') S.marks.delete(i);
  else {
    const ks = S.notes.get(i) || new Set();
    if (mode === 'note') ks.add(S.selected);
    else ks.delete(S.selected);
    S.notes.set(i, ks);
  }
  return true;
}

function showPress(i) {
  const w = P.w;
  $('#press').innerHTML = `<circle class="press" cx="${(i % w) * CELL + CELL / 2}" cy="${Math.floor(i / w) * CELL + CELL / 2}" r="40" pathLength="100" style="animation-duration:${HOLD_MS}ms"/>`;
}
function hidePress() {
  const el = $('#press');
  if (el) el.innerHTML = '';
}

function tapCell(i) {
  if (locked()) return;
  S.flagged = null;
  const occupant = S.placed.indexOf(i);
  if (occupant >= 0) {
    // tapping a placed letter selects that person (tap again to let go)
    S.crossMode = false;
    S.alibiSel = null;
    S.selected = S.selected === occupant ? null : occupant;
    play('select');
    renderDynamic();
    setStatus(defaultStatus());
    return;
  }
  if (S.crossMode ? !isFree(P, i) : S.selected == null ? !isFree(P, i) : !canStand(P, S.selected, i)) {
    if (S.selected != null) {
      play('bump');
      toast(`Nobody can stand on the ${OBJECTS[P.cells[i].obj].name}.`);
    }
    return;
  }
  if (!S.crossMode && S.selected == null) {
    toast('Pick a suspect first, or switch on Cross.', false);
    return;
  }
  snapshot();
  const mode = paintModeFor(i);
  paint(i, mode);
  play(PAINT_SOUND[mode]);
  afterChange();
}

// Long press: commit the selected person to this square (or take them back off it).
function holdCell(i) {
  if (locked() || S.selected == null) return;
  const k = S.selected;
  const occupant = S.placed.indexOf(i);
  snapshot();
  if (occupant === k) {
    S.placed[k] = null;
    play('remove');
    toast(`${cap(P.people[k].name)} taken off the board.`, false);
  } else {
    if (occupant >= 0) S.placed[occupant] = null;
    S.placed[k] = i;
    S.marks.delete(i);
    S.fresh = k;
    if (S.hintFocus === k) S.hintFocus = null;
    S.selected = null;
    play('place');
  }
  afterChange();
}

function toggleCross() {
  if (locked()) return;
  S.crossMode = !S.crossMode;
  if (S.crossMode) { S.selected = null; S.alibiSel = null; }
  play('select');
  renderDynamic();
  setStatus(defaultStatus());
}

function tapCard(k) {
  if (locked()) return;
  S.selected = S.selected === k ? null : k;
  S.crossMode = false;
  S.alibiSel = null;
  S.flagged = null;
  play('select');
  renderDynamic();
  setStatus(defaultStatus());
}

function tapAlibi(i) {
  S.alibiSel = S.alibiSel === i ? null : i;
  S.selected = null;
  S.crossMode = false;
  play('select');
  renderDynamic();
  setStatus(S.alibiSel == null ? defaultStatus() : `${P.unmask.suspects[i].name}'s alibi is lit up on the board.`);
}

// Pencil in which mask you think someone wore (purely a note for yourself).
function cycleGuess(i) {
  const count = P.people.length - 1;
  const g = S.guesses[i];
  S.guesses[i] = g == null ? 0 : g + 1 >= count ? null : g + 1;
  play('note');
  renderDynamic();
  saveStore();
}

function afterChange() {
  if (S.hintFocus != null && S.placed[S.hintFocus] != null) clearHint();
  const full = S.placed.every((x) => x != null);
  if (full && allCorrect()) {
    S.selected = null;
    if (P.unmask) {
      // the masks are all in place: the case is not closed until the killer is named
      saveStore();
      renderDynamic();
      setStatus(defaultStatus());
      play('hint');
      setTimeout(showAccuse, 700);
      return;
    }
    closeCase();
    return;
  }
  renderDynamic();
  if (full) {
    play('wrong');
    toast('Everyone is placed… but the facts don\'t add up.');
  } else setStatus(defaultStatus());
  saveStore();
}

function closeCase() {
  saveStore(); // bank the elapsed time first
  S.solved = true;
  S.selected = null;
  saveStore();
  renderDynamic();
  setStatus(defaultStatus());
  setTimeout(showSolved, 900);
}

function undo() {
  const prev = S.history.pop();
  if (!prev) return;
  play('undo');
  S.placed = prev.placed;
  S.marks = new Set(prev.marks);
  S.notes = notesFromJson(prev.notes);
  S.selected = null;
  S.flagged = null;
  renderDynamic();
  setStatus(defaultStatus());
  saveStore();
}

// ---------- hints ----------

function hint() {
  if (S.solved) return;
  if (accusing()) return unmaskHint();
  // 1) point out a mistake
  const wrong = S.placed.findIndex((cell, k) => cell != null && cell !== P.solution[k]);
  if (wrong >= 0) {
    S.hints++;
    S.flagged = wrong;
    S.selected = null;
    play('wrong');
    renderDynamic();
    toast(`${cap(P.people[wrong].name)}'s position doesn't hold up.`);
    saveStore();
    return;
  }
  if (P.impostor >= 0 && !S.liarKnown) return liarHint();
  // then, for the next person logic can pin down: 1) name them, 2) explain why, 3) place them
  const h = explainNext(truthView(), S.placed);
  const next = h ? h.target : P.deduction.find((k) => S.placed[k] == null);
  if (next == null) return;
  const name = P.people[next].name;
  S.hints++;
  if (S.hintFocus !== next || !S.hintStage) {
    S.hintFocus = next;
    S.hintStage = 1;
    S.hintMarks = null;
    hideHintSlip();
    play('hint');
    renderDynamic();
    toast(`Look closely at ${name}. Tap Hint again for a clue.`, false);
  } else if (S.hintStage === 1) {
    S.hintStage = 2;
    S.selected = next;
    S.crossMode = false;
    S.hintMarks = h?.marks?.size ? h.marks : null;
    play('hint');
    renderDynamic();
    showHintSlip(name, h ? h.steps : [`Think about which of ${name}'s squares are still free.`]);
    $('#board')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setStatus(`Tap Hint once more to place ${name}.`);
  } else {
    snapshot();
    const cell = P.solution[next];
    const occupant = S.placed.indexOf(cell);
    if (occupant >= 0) S.placed[occupant] = null;
    S.placed[next] = cell;
    S.marks.delete(cell);
    S.fresh = next;
    S.selected = null;
    clearHint();
    play('place');
    toast(`An informant places ${name}.`, false);
    afterChange();
    return;
  }
  saveStore();
}

// Hard Zeta-9: before anything else, the hints unmask the impostor in three steps.
function liarHint() {
  const L = P.impostor;
  const name = P.people[L].name;
  S.hints++;
  if (S.hintFocus !== L || !S.hintStage) {
    S.hintFocus = L;
    S.hintStage = 1;
    S.hintMarks = null;
    hideHintSlip();
    play('hint');
    renderDynamic();
    toast(`One statement is a lie. Look closely at ${name}. Tap Hint again for a clue.`, false);
  } else if (S.hintStage === 1) {
    S.hintStage = 2;
    // find a wrong suspicion whose collapse is easy to describe (someone else gets stranded)
    let other = -1, stuck = 'someone';
    for (const [k, pr] of P.people.entries()) {
      if (pr.isVictim || k === L) continue;
      const r = logicalSolve(withLiar(P, k), {});
      if (other < 0 || (r.stuck >= 0 && r.stuck !== k)) {
        other = k;
        stuck = r.stuck >= 0 ? P.people[r.stuck].name : 'someone';
        if (r.stuck >= 0 && r.stuck !== k) break;
      }
    }
    play('hint');
    renderDynamic();
    showHintSlip(name, [
      'Exactly one crew member is a human in disguise, and only their statement is false.',
      `Try blaming each crew member in turn. If ${P.people[other].name} were the liar, ${stuck} would end up with nowhere to stand.`,
      `The same happens whoever you blame, except ${name}. Only with ${name}'s statement as the lie does everyone fit.`,
    ]);
    setStatus(`Tap Hint once more to unmask ${name}.`);
  } else {
    S.liarKnown = true;
    S.suspect = L;
    clearHint();
    play('place');
    renderDynamic();
    toast(`${name} is the human! Their statement is false.`, false);
  }
  saveStore();
}

function toggleSuspect(k) {
  if (S.solved || (S.liarKnown && P.impostor !== k)) return;
  S.suspect = S.suspect === k ? null : k;
  play('select');
  renderDynamic();
  saveStore();
}

// Egypt: which masks does each alibi fit?
function alibiTable() {
  const masks = P.people.map((_, k) => k).filter((k) => !P.people[k].isVictim);
  return P.unmask.suspects.map((sp) => masks.filter((m) => alibiFits(P, sp.alibi, m)));
}

function unmaskHint() {
  const ks = killerSuspect();
  const who = P.unmask.suspects[ks].name;
  const mask = P.people[P.murderer].name;
  S.hints++;
  if (S.hintStage === 0) {
    S.hintStage = 1;
    play('hint');
    toast(`Whose alibi fits where ${mask} stood? Tap Hint again for a clue.`, false);
  } else if (S.hintStage === 1) {
    S.hintStage = 2;
    const table = alibiTable();
    const lines = P.unmask.suspects.map((sp, i) => {
      const fits = table[i].map((m) => P.people[m].name);
      return `${sp.name}'s alibi fits ${fits.length === 1 ? `only ${fits[0]}` : fits.slice(0, -1).join(', ') + ' or ' + fits[fits.length - 1]}.`;
    });
    lines.push('Start with an alibi that fits only one mask, cross that mask off for everyone else, and repeat.');
    play('hint');
    showHintSlip(mask, lines);
    setStatus(`Tap Hint once more to unmask ${mask}.`);
  } else {
    clearHint();
    closeModal();
    accuse(ks);
    toast(`An informant whispers: it was ${who}.`, false);
  }
  saveStore();
}

function showHintSlip(name, steps) {
  const el = $('.hint-slip');
  if (!el) return;
  el.innerHTML = `<div class="hint-kicker">Informant's note on ${escapeHtml(name)}</div>
    <ol>${steps.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ol><button class="hint-close" data-act="close-hint" aria-label="Close hint">✕</button>`;
  el.hidden = false;
}
function hideHintSlip() {
  const el = $('.hint-slip');
  if (el) el.hidden = true;
}
function clearHint() {
  S.hintFocus = null;
  S.hintStage = 0;
  S.hintMarks = null;
  hideHintSlip();
}

function restart() {
  modal(`
    <h2>Restart the case?</h2>
    <p>This clears every suspect, note and cross from ${THEMES[P.themeId].short} · ${DESKS[P.desk].name} No. ${P.num}.</p>
    <div class="actions">
      <button class="btn" data-act="close">Keep going</button>
      <button class="btn primary" data-act="do-restart">Restart</button>
    </div>`);
}

function doRestart() {
  // keep the recipe stamp: restarting must give the same case back, not a new one
  store.progress[P.key] = { gen: P.gen };
  const [t, d, n] = [P.themeId, P.desk, P.num];
  S = null; // otherwise openCase would save the current board straight back
  closeModal();
  play('restart');
  openCase(t, d, n);
  toast('Case restarted. Fresh start, detective.', false);
}

// ---------- overlays ----------

function modal(html, cls = '') {
  closeModal();
  const el = document.createElement('div');
  el.className = `overlay ${P ? `theme-${P.themeId}` : ''}`;
  el.innerHTML = `<div class="sheet ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  el.addEventListener('click', (ev) => { if (ev.target === el) closeModal(); });
  document.body.appendChild(el);
}
function closeModal() {
  document.querySelectorAll('.overlay').forEach((o) => o.remove());
}

function fmtTime(ms) {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Egypt: the masks are placed; now name the person behind the killer's mask.
function showAccuse() {
  if (!accusing()) return;
  const k = P.murderer;
  const mask = P.people[k];
  const victim = P.people[P.victim];
  const room = P.areas[P.cells[P.solution[P.victim]].area].name;
  modal(`
    <div class="kicker">The masks are all in place</div>
    <h2>Who was ${mask.name}?</h2>
    <div class="mugshot" style="--pc:${inkOf(k)}">${portraitSvg(mask, { color: inkOf(k), tint: tintOf(k) })}</div>
    <p>${cap(mask.name)} was alone with ${victim.name} in the <b>${room}</b>. Check the alibis: only one of these people can have been behind that mask.</p>
    <div class="accuse-list">${P.unmask.suspects.map((sp, i) => `<button class="btn" data-act="name-killer" data-i="${i}">${sp.name}</button>`).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Look at the alibis again</button></div>`, 'accuse');
}

function accuse(i) {
  if (!accusing()) return;
  if (i === killerSuspect()) {
    closeModal();
    closeCase();
    return;
  }
  S.misses++;
  play('wrong');
  const btn = document.querySelector(`.accuse-list [data-i="${i}"]`);
  if (btn) { btn.disabled = true; btn.classList.add('wrong'); }
  toast(`Not ${P.unmask.suspects[i].name}: their alibi doesn't fit that square.`);
  saveStore();
}

function showSolved() {
  play('solved');
  const km = P.murderer;
  const killer = P.people[km];
  const victim = P.people[P.victim];
  const room = P.areas[P.cells[P.solution[P.victim]].area].name;
  const unmasked = P.unmask ? P.unmask.suspects[killerSuspect()] : null;
  const who = unmasked ? unmasked.name : cap(killer.name);
  const face = unmasked
    ? `<div class="mugshots"><div class="mugshot" style="--pc:${inkOf(km)}">${portraitSvg(killer, { color: inkOf(km), tint: tintOf(km) })}</div><div class="mugshot" style="--pc:${inkOf(km)}">${portraitSvg(unmasked, { color: inkOf(km), tint: tintOf(km) })}</div></div>`
    : `<div class="mugshot" style="--pc:${inkOf(km)}">${portraitSvg(killer, { color: inkOf(km), tint: tintOf(km) })}</div>`;
  modal(`
    <div class="kicker">★ Case closed ★</div>
    <h2>${who} did it!</h2>
    ${face}
    <div class="caption">${unmasked ? `${unmasked.name}, ${unmasked.title}, behind the ${killer.title}.` : `${who}, ${killer.title}.`}</div>
    <p>${who} was alone with ${victim.name} in the <b>${room}</b>. ${store.detective ? `Well done, ${detective()}!` : 'Well done, detective!'}</p>
    ${P.impostor >= 0 ? `<p>And the human in disguise? <b>${P.people[P.impostor].alienName}</b>, better known on Earth as <b>${P.people[P.impostor].earthName}</b>.</p>` : ''}
    ${killer.ghost ? '<p>The killer was the ghost, which makes the arrest awkward.</p>' : ''}
    <div class="stats"><span>Time ${fmtTime(S.elapsed)}</span><span>Hints ${S.hints}</span>${S.misses ? `<span>Wrong guesses ${S.misses}</span>` : ''}</div>
    <div class="actions">
      <button class="btn" data-act="close">View scene</button>
      <button class="btn" data-act="home">All cases</button>
      <button class="btn primary" data-act="next">Next case ▸</button>
    </div>`, 'extra');
}

function showRules() {
  const kinds = P ? [...new Set(P.cells.map((c) => c.obj).filter(Boolean))] : ['chair', 'bed', 'rug', 'bench', 'sofa', 'tree', 'bush', 'table', 'shelf', 'plant', 'piano', 'stove'];
  const legend = (list) => list.map((o) => `
    <figure><svg class="art" viewBox="0 0 100 100">${objectSvg(o)}</svg><figcaption>${OBJECTS[o].name}</figcaption></figure>`).join('');
  const seats = kinds.filter((o) => OBJECTS[o].occupiable), blocks = kinds.filter((o) => !OBJECTS[o].occupiable);
  const themed = P && EDITIONS[P.themeId].intro;
  modal(`
    <h2>How to play</h2>
    <ul>
      <li>Nobody shared a <b>row</b> or a <b>column</b>. On a square board that means exactly one person in each; on other shapes, the shorter direction is completely filled.</li>
      <li>Some furniture can be <b>occupied</b>; the rest blocks its square. A bed, sofa or table may cover two squares.</li>
      <li><b>Beside</b> means directly above, below, left or right, and in the same room.</li>
      <li>The victim was <b>alone with the murderer</b>: exactly one suspect shares the victim's room.</li>
      <li>North is the top of the board. "One row north of Hugo" means the row directly above his; "somewhere north" means any row above.</li>
      <li><b>The only one</b> in a room (or on a kind of seat) means nobody else was there.</li>
      ${themed ? themed.map((x) => `<li>${x}</li>`).join('') : ''}
    </ul>
    <p><b>Controls.</b> Tap a suspect to pick them. Then <b>tap</b> a square to pencil in their initial, or <b>swipe</b> across squares to note several at once. <b>Hold</b> a square to place them for good: their row and column get crossed out. Hold their letter to take them back off. Use <b>Cross</b> to tap or swipe ✕ onto squares yourself.</p>
    ${seats.length ? `<h4>Can be occupied</h4><div class="mini-legend">${legend(seats)}</div>` : ''}
    ${blocks.length ? `<h4>Blocks the square</h4><div class="mini-legend">${legend(blocks)}</div>` : ''}
    <label class="setting"><input type="checkbox" id="opt-autox" ${store.settings.autoX ? 'checked' : ''}> Cross out the row and column of everyone placed</label>
    <label class="setting"><input type="checkbox" id="opt-sound" ${store.settings.sound ? 'checked' : ''}> Sound effects</label>
    <label class="setting"><input type="checkbox" id="opt-highlight" ${store.settings.highlight ? 'checked' : ''}> Highlight what a selected statement mentions</label>
    <div class="actions"><button class="btn primary" data-act="close">${P ? 'Back to the case' : 'Close'}</button></div>`);
  $('#opt-autox').addEventListener('change', (ev) => {
    store.settings.autoX = ev.target.checked;
    saveStore();
    if (P) renderDynamic();
  });
  $('#opt-sound').addEventListener('change', (ev) => {
    store.settings.sound = ev.target.checked;
    setSoundEnabled(store.settings.sound);
    saveStore();
    play('select');
  });
  $('#opt-highlight').addEventListener('change', (ev) => {
    store.settings.highlight = ev.target.checked;
    saveStore();
    if (P) renderDynamic();
  });
}

// ---------- wiring ----------

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  const act = el?.dataset.act;
  if (act) {
    ({
      undo, hint, restart, cross: toggleCross, rules: showRules, close: closeModal, 'do-restart': doRestart,
      'close-hint': () => { hideHintSlip(); S.hintMarks = null; renderDynamic(); },
      next: () => { closeModal(); const t = P.themeId, d = P.desk; saveStore(); openCase(t, d, nextNewCase(t, d)); },
      theme: () => { store.theme = el.dataset.theme; saveStore(); play('select'); renderHome(); },
      intro: () => showIntro(el.dataset.theme),
      names: () => setEarthNames(el.dataset.earth === '1'),
      suspect: () => toggleSuspect(Number(el.dataset.k)),
      alibi: () => tapAlibi(Number(el.dataset.i)),
      guess: () => cycleGuess(Number(el.dataset.i)),
      accuse: showAccuse,
      'name-killer': () => accuse(Number(el.dataset.i)),
      home: showHome,
      open: () => { closeModal(); const c = parseKey(el.dataset.case); if (c) openCase(...c); },
    })[act]?.();
    return;
  }
  const card = ev.target.closest('.card');
  if (card) tapCard(Number(card.dataset.person));
});

// board gestures (delegated: the board element is re-rendered per case)
document.addEventListener('pointerdown', (ev) => {
  unlock();
  const board = ev.target.closest?.('#board');
  if (board) onPointerDown(ev, board);
});
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('pointerup', onPointerUp);
document.addEventListener('pointercancel', onPointerUp);
document.addEventListener('contextmenu', (ev) => { if (ev.target.closest?.('#board')) ev.preventDefault(); });

document.addEventListener('keydown', (ev) => {
  if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { ev.preventDefault(); if (S) undo(); }
  if (ev.key === 'Escape') { closeModal(); if (S) { S.selected = null; renderDynamic(); setStatus(defaultStatus()); } }
});

document.addEventListener('visibilitychange', () => {
  if (!S) return;
  if (document.hidden) saveStore();
  else S.tick = Date.now();
});

window.addEventListener('hashchange', () => {
  const c = parseKey(location.hash.slice(1));
  if (c && caseKey(...c) !== P?.key) openCase(...c);
  else if (!c && P) showHome();
});

const fromHash = parseKey(location.hash.slice(1));
if (fromHash) openCase(...fromHash);
else renderHome();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
