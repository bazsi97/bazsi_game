// UI: front page (pick a case), the case itself, taps, saved progress.

import { generatePuzzle, DIFFICULTY } from './generator.js';
import { clueText, isFree } from './clues.js';
import { OBJECTS } from './themes.js';
import { objectSvg, portraitSvg, patternDefsSvg } from './art.js';
import { explainNext } from './hints.js';
import { play, unlock, setSoundEnabled } from './sound.js';

const STORE_KEY = 'murdoku:v2';
const CELL = 100;
// Centre a capital letter on a point by its cap height (Playfair Display: 0.708em) rather than
// dominant-baseline, which iOS Safari positions differently from other browsers.
const CAP_OFFSET = (fontSize) => +(fontSize * 0.708 / 2).toFixed(1);
const $ = (sel, el = document) => el.querySelector(sel);

const store = loadStore();
setSoundEnabled(store.settings.sound);
let P = null; // current puzzle
let S = null; // play state
let toastTimer = null;

// Saved per device: { detective, settings, progress: { 'medium-3': {...} }, last: 'medium-3' }
function loadStore() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { /* private mode */ }
  s.detective ??= '';
  s.progress ||= {};
  s.settings ||= {};
  s.settings.autoX ??= true;
  s.settings.highlight ??= true;
  s.settings.sound ??= true;
  return s;
}
function saveStore() {
  if (S && P) {
    const now = Date.now();
    if (!S.solved && !document.hidden) S.elapsed += now - S.tick;
    S.tick = now;
    store.progress[P.key] = {
      placed: S.placed, marks: [...S.marks], notes: notesToJson(S.notes), hints: S.hints, elapsed: S.elapsed,
      solved: S.solved, touched: S.placed.some((x) => x != null) || S.marks.size > 0 || S.notes.size > 0,
    };
  }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

// notes: Map<cell, Set<personIndex>>, stored as [[cell, [k, ...]], ...]
const notesToJson = (notes) => [...notes].filter(([, ks]) => ks.size).map(([i, ks]) => [i, [...ks]]);
const notesFromJson = (arr) => new Map((arr || []).map(([i, ks]) => [i, new Set(ks)]));

const DESKS = {
  easy: { name: 'Easy', stars: '★☆☆', beat: 'The Village Beat', blurb: 'A 5×5 scene. Statements about rooms and furniture only.' },
  medium: { name: 'Medium', stars: '★★☆', beat: 'The City Desk', blurb: 'A 6×6 scene, with at most one "one row north of…" twist.' },
  hard: { name: 'Hard', stars: '★★★', beat: 'The Night Shift', blurb: 'A 6×6 scene full of who-stood-where-of-whom.' },
};
const caseKey = (d, n) => `${d}-${n}`;
const parseKey = (k) => { const m = /^(easy|medium|hard)-(\d+)$/.exec(k || ''); return m ? [m[1], Number(m[2])] : null; };
const solvedCount = (d) => Object.entries(store.progress).filter(([k, v]) => k.startsWith(d + '-') && v.solved).length;
// the lowest case number not yet played, so solved cases never come round again
function nextNewCase(d) {
  let n = 1;
  while (store.progress[caseKey(d, n)]?.solved || store.progress[caseKey(d, n)]?.touched) n++;
  return n;
}
const inProgress = (d) => Object.entries(store.progress)
  .filter(([k, v]) => k.startsWith(d + '-') && !v.solved && v.touched)
  .map(([k]) => parseKey(k)[1]).sort((a, b) => a - b);

// ---------- colours ----------
// Each suspect gets an ink of their own; the victim is always printed in red.
const INKS = ['#1f5fa8', '#2e7d32', '#c25e00', '#7b3fa0', '#00838f', '#ad1457', '#5d6b1f', '#3949ab'];
const VICTIM_INK = '#a3241b';
const PAPER = '#f1e9d6';
function mixHex(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v * t + pb[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
}
const inkOf = (k) => (P.people[k].isVictim ? VICTIM_INK : INKS[k % INKS.length]);
const tintOf = (k) => mixHex(inkOf(k), PAPER, 0.16);

// ---------- case lifecycle ----------

function setHash(h) {
  try {
    if (location.hash !== h) history.replaceState(null, '', h || location.pathname);
  } catch { /* sandboxed frames may refuse URL changes */ }
}

function openCase(d, n) {
  if (S && P) saveStore();
  n = Math.max(1, n);
  P = generatePuzzle({ seed: n, difficulty: d });
  P.key = caseKey(d, n);
  P.num = n;
  P.desk = d;
  store.last = P.key;
  const saved = store.progress[P.key];
  S = {
    placed: saved?.placed ?? new Array(P.people.length).fill(null),
    marks: new Set(saved?.marks ?? []),
    notes: notesFromJson(saved?.notes),
    crossMode: false,
    hints: saved?.hints ?? 0,
    elapsed: saved?.elapsed ?? 0,
    solved: saved?.solved ?? false,
    tick: Date.now(),
    selected: null,
    history: [],
    fresh: null,
    flagged: null,
    hintFocus: null,
    hintStage: 0,
    hintMarks: null,
  };
  setHash(`#${P.key}`);
  renderPage();
  saveStore();
  window.scrollTo(0, 0);
}

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

function mastheadHtml(meta) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `
    <header class="masthead">
      <div class="mast-meta">${meta}</div>
      <h1 class="mast-title"><span class="the">The</span>Murdoku Gazette</h1>
      <div class="mast-rule"></div>
      <div class="mast-sub"><span>${today}</span><span>Price: one clue</span></div>
    </header>`;
}

function renderHome() {
  const total = ['easy', 'medium', 'hard'].reduce((a, d) => a + solvedCount(d), 0);
  const last = parseKey(store.last);
  const lastP = last && store.progress[store.last];
  const resume = lastP && !lastP.solved && lastP.touched
    ? `<button class="resume" data-act="open" data-case="${store.last}">
         <span class="kicker">Unfinished business</span>
         <span class="resume-title">Continue ${DESKS[last[0]].name} Case No. ${last[1]} ▸</span>
       </button>` : '';
  const desks = Object.entries(DESKS).map(([d, D]) => {
    const open = inProgress(d).filter((n) => caseKey(d, n) !== store.last).slice(0, 4);
    return `
      <article class="desk">
        <div class="desk-head"><span class="desk-stars">${D.stars}</span><span class="desk-solved">${solvedCount(d)} solved</span></div>
        <h3>${D.name}</h3>
        <div class="desk-beat">${D.beat}</div>
        <p>${D.blurb}</p>
        <button class="tool primary" data-act="open" data-case="${caseKey(d, nextNewCase(d))}">New case · No. ${nextNewCase(d)}</button>
        ${open.length ? `<div class="desk-open">In progress: ${open.map((n) => `<button data-act="open" data-case="${caseKey(d, n)}">No. ${n}</button>`).join(' ')}</div>` : ''}
      </article>`;
  }).join('');
  $('#app').innerHTML = `
    ${patternDefsSvg()}
    <div class="page home">
      ${mastheadHtml(`<span>${total} ${total === 1 ? 'case' : 'cases'} closed</span><span class="difficulty">Front page</span>`)}
      <main class="home-main">
        <h2 class="headline">Pick your case, ${detective()}</h2>
        <label class="detective-name">Your name on the byline
          <input id="detective" type="text" maxlength="24" autocomplete="nickname" placeholder="e.g. Marple" value="${escapeHtml(store.detective)}">
        </label>
        ${resume}
        <div class="desks">${desks}</div>
        <p class="home-foot">Every case is generated for you and checked to have exactly one solution. Solved cases never come round again on this device. <button class="link" data-act="rules">How to play</button></p>
      </main>
    </div>`;
  $('#detective').addEventListener('change', (ev) => {
    store.detective = ev.target.value.trim();
    saveStore();
    renderHome();
  });
}

function renderPage() {
  const D = DESKS[P.desk];
  $('#app').innerHTML = `
    ${patternDefsSvg()}
    <div class="page">
      ${mastheadHtml(`
        <button class="back" data-act="home" aria-label="All cases">◂ Cases</button>
        <span>${D.name} · Case No. ${P.num}</span>
        <span class="difficulty">${D.stars}</span>`)}
      <main class="layout">
        <section class="story">
          <h2 class="headline">${P.headline}</h2>
          <p class="deck">Every suspect stood in a different row and column. The victim was alone with the killer.</p>
          <p class="lede">${P.lede}</p>
        </section>
        <section class="board-wrap">${boardSvg()}</section>
        <section class="dossier">
          <h3>The Statements</h3>
          <div class="cards">${P.people.map(cardHtml).join('')}</div>
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

function cardHtml(person, k) {
  const clues = person.isVictim
    ? '<b>The Victim.</b> Alone with the murderer.'
    : person.clues.map((c) => clueText(P, person, c)).join(' ')
      .replace(/data-who="(\d+)"/g, (_, j) => `style="color:${inkOf(Number(j))}"`);
  return `
    <button class="card ${person.isVictim ? 'victim' : ''}" data-person="${k}" aria-label="${person.name}" style="--pc:${inkOf(k)};--pc-tint:${tintOf(k)}">
      <div class="frame">${portraitSvg(person, { dead: person.isVictim, color: inkOf(k), tint: tintOf(k) })}</div>
      <div class="meta">
        <div class="name"><span class="init">${person.initial}</span>${person.name}</div>
        <div class="role">${person.title}</div>
      </div>
      <div class="clue">${clues}</div>
    </button>`;
}

// Give neighbouring rooms different paper tones (greedy colouring, spreading tones evenly).
const TONES = 6;
function roomTones() {
  const n = P.n, adj = P.areas.map(() => new Set());
  for (let i = 0; i < n * n; i++) {
    const a = P.cells[i].area;
    if (i % n < n - 1 && P.cells[i + 1].area !== a) { adj[a].add(P.cells[i + 1].area); adj[P.cells[i + 1].area].add(a); }
    if (i + n < n * n && P.cells[i + n].area !== a) { adj[a].add(P.cells[i + n].area); adj[P.cells[i + n].area].add(a); }
  }
  const tones = [];
  P.areas.forEach((_, a) => {
    const taken = new Set([...adj[a]].map((b) => tones[b]));
    let t = (a * 2) % TONES; // alternate light/dark tones
    while (taken.has(t)) t = (t + 1) % TONES;
    tones[a] = t;
  });
  return tones;
}

function boardSvg() {
  const n = P.n, W = n * CELL;
  const tones = roomTones();
  const out = [];
  out.push(`<svg class="board" id="board" viewBox="-8 -40 ${W + 16} ${W + 48}" role="grid" aria-label="Crime scene, north is up">`);
  out.push(`<text class="caption" x="0" y="-16">The scene of the crime</text>`);
  out.push(`<text class="caption compass" x="${W}" y="-16" text-anchor="end">▲ NORTH</text>`);
  out.push(`<rect x="0" y="0" width="${W}" height="${W}" fill="var(--paper)"/>`);
  for (let i = 0; i < n * n; i++) {
    const x = (i % n) * CELL, y = Math.floor(i / n) * CELL;
    const area = P.areas[P.cells[i].area];
    out.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="var(--room-${tones[P.cells[i].area]})"/>`);
    out.push(`<rect class="floor" x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="url(#pt-${area.pattern})"/>`);
  }
  // dotted grid inside rooms
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, x = c * CELL, y = r * CELL;
    if (c < n - 1 && P.cells[i].area === P.cells[i + 1].area) out.push(`<line class="gridline" x1="${x + CELL}" y1="${y}" x2="${x + CELL}" y2="${y + CELL}"/>`);
    if (r < n - 1 && P.cells[i].area === P.cells[i + n].area) out.push(`<line class="gridline" x1="${x}" y1="${y + CELL}" x2="${x + CELL}" y2="${y + CELL}"/>`);
  }
  // furniture
  for (let i = 0; i < n * n; i++) {
    const o = P.cells[i].obj;
    if (!o) continue;
    const x = (i % n) * CELL, y = Math.floor(i / n) * CELL;
    out.push(`<g class="obj" data-cell="${i}" transform="translate(${x + 8} ${y + 8}) scale(0.84)">${objectSvg(o)}</g>`);
  }
  // walls between rooms
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, x = c * CELL, y = r * CELL;
    if (c < n - 1 && P.cells[i].area !== P.cells[i + 1].area) out.push(`<line class="wall" x1="${x + CELL}" y1="${y}" x2="${x + CELL}" y2="${y + CELL}"/>`);
    if (r < n - 1 && P.cells[i].area !== P.cells[i + n].area) out.push(`<line class="wall" x1="${x}" y1="${y + CELL}" x2="${x + CELL}" y2="${y + CELL}"/>`);
  }
  out.push(`<rect class="outer" x="0" y="0" width="${W}" height="${W}"/>`);
  // room name tags, bottom-right cell of each room
  P.areas.forEach((a, id) => {
    let best = -1;
    for (let i = 0; i < n * n; i++) {
      if (P.cells[i].area !== id) continue;
      if (best < 0 || Math.floor(i / n) > Math.floor(best / n) || (Math.floor(i / n) === Math.floor(best / n) && i % n > best % n)) best = i;
    }
    const w = a.name.length * 11.5 + 16;
    const x = (best % n) * CELL + CELL - w - 3, y = Math.floor(best / n) * CELL + CELL - 24;
    out.push(`<g class="tag" pointer-events="none"><rect x="${x}" y="${y}" width="${w}" height="21" rx="10"/><text x="${x + w / 2}" y="${y + 15.5}" text-anchor="middle">${a.name}</text></g>`);
  });
  out.push('<g id="dyn"></g><g id="press"></g>');
  out.push('</svg>');
  return out.join('');
}

function cross(i, cls, size = 26) {
  const n = P.n;
  const x = (i % n) * CELL, y = Math.floor(i / n) * CELL;
  const cx = x + CELL / 2, cy = y + CELL / 2;
  const j = ((i * 37) % 7) - 3; // hand-drawn wobble
  return `<rect class="${cls}-shade" x="${x}" y="${y}" width="${CELL}" height="${CELL}"/><path class="${cls}" d="M${cx - size} ${cy - size + j} L${cx + size} ${cy + size - j} M${cx + size + j} ${cy - size} L${cx - size - j} ${cy + size}"/>`;
}

function renderDynamic() {
  const n = P.n;
  const dyn = $('#dyn');
  const out = [];
  const occupied = new Map();
  S.placed.forEach((cell, k) => { if (cell != null) occupied.set(cell, k); });
  const rows = new Map(), cols = new Map();
  S.placed.forEach((cell, k) => {
    if (cell == null) return;
    const r = Math.floor(cell / n), c = cell % n;
    rows.set(r, [...(rows.get(r) || []), k]);
    cols.set(c, [...(cols.get(c) || []), k]);
  });
  const conflicts = new Set();
  for (const m of [rows, cols]) for (const ks of m.values()) if (ks.length > 1) ks.forEach((k) => conflicts.add(k));

  if (S.selected != null && store.settings.highlight) out.push(...clueHighlights(S.selected));
  if (S.hintMarks) for (const i of S.hintMarks) out.push(`<rect class="hint-hi" x="${(i % n) * CELL}" y="${Math.floor(i / n) * CELL}" width="${CELL}" height="${CELL}"/>`);
  if (S.selected != null) {
    const sel = S.placed[S.selected];
    if (sel != null) out.push(`<rect class="cell-hi" x="${(sel % n) * CELL}" y="${Math.floor(sel / n) * CELL}" width="${CELL}" height="${CELL}"/>`);
  }
  for (let i = 0; i < n * n; i++) {
    if (occupied.has(i)) continue;
    const auto = store.settings.autoX && (rows.has(Math.floor(i / n)) || cols.has(i % n));
    // one look for every excluded square: crossed by you, by a placed person's row/column,
    // and blocked furniture squares in those rows/columns too
    if (S.marks.has(i) || auto) out.push(cross(i, 'excluded'));
    if (!isFree(P, i)) continue;
    // notes are kept but hidden while crossed out or once that person is placed
    const ks = [...(S.notes.get(i) || [])].filter((k) => S.placed[k] == null);
    if (ks.length && !auto && !S.marks.has(i)) out.push(notesSvg(i, ks));
  }
  if (S.solved) {
    const vCell = S.placed[P.victim];
    const area = P.cells[vCell].area;
    // ring the scene of the crime
    for (let i = 0; i < n * n; i++) if (P.cells[i].area === area) out.push(`<rect class="cell-hi" x="${(i % n) * CELL}" y="${Math.floor(i / n) * CELL}" width="${CELL}" height="${CELL}"/>`);
  }
  for (const [cell, k] of occupied) {
    const person = P.people[k];
    const cx = (cell % n) * CELL + CELL / 2, cy = Math.floor(cell / n) * CELL + CELL / 2;
    const cls = ['token'];
    if (person.isVictim) cls.push('victim');
    if (k === S.selected) cls.push('selected');
    if (conflicts.has(k)) cls.push('conflict');
    if (k === S.flagged) cls.push('flagged');
    if (k === S.fresh) cls.push('fresh');
    if (S.solved && k === P.murderer) cls.push('killer');
    const ink = inkOf(k);
    const style = S.solved && k === P.murderer ? `--pc:${ink};--pc-tint:${ink}` : `--pc:${ink};--pc-tint:${tintOf(k)}`;
    out.push(`<g class="${cls.join(' ')}" style="${style}"><g transform="translate(${cx} ${cy})"><circle class="ring" r="32"/><circle class="inner" r="26"/><text y="${CAP_OFFSET(44)}">${person.initial}</text></g></g>`);
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
    el.setAttribute('aria-pressed', String(k === S.selected));
  });
  const undo = $('[data-act="undo"]');
  if (undo) undo.disabled = !S.history.length || S.solved;
  const hint = $('[data-act="hint"]');
  if (hint) hint.disabled = S.solved;
  const crossBtn = $('[data-act="cross"]');
  if (crossBtn) {
    crossBtn.classList.toggle('on', S.crossMode);
    crossBtn.setAttribute('aria-pressed', String(S.crossMode));
    crossBtn.disabled = S.solved;
  }
  // while painting notes/crosses, a finger drag on the board must not scroll the page
  $('#board')?.classList.toggle('painting', !S.solved && (S.crossMode || S.selected != null));
}

// Outline whatever the selected person's statement talks about: every rug for "on a rug",
// every shelf for "beside a shelf", the whole room for "in the Library".
function clueHighlights(k) {
  const n = P.n, out = [];
  const box = (i) => `<rect class="clue-hi" x="${(i % n) * CELL + 5}" y="${Math.floor(i / n) * CELL + 5}" width="${CELL - 10}" height="${CELL - 10}" rx="12"/>`;
  const tint = (i) => `<rect class="area-hi" x="${(i % n) * CELL}" y="${Math.floor(i / n) * CELL}" width="${CELL}" height="${CELL}"/>`;
  const EDGE = { top: (i) => i < n, bottom: (i) => i >= n * (n - 1), left: (i) => i % n === 0, right: (i) => i % n === n - 1 };
  for (const c of P.people[k].clues) {
    for (let i = 0; i < n * n; i++) {
      if (c.obj && P.cells[i].obj === c.obj) out.push(box(i));
      else if (c.area != null && P.cells[i].area === c.area) out.push(tint(i));
      else if (c.type === 'edge' && EDGE[c.side](i)) out.push(tint(i));
    }
    if (c.type === 'rel' && S.placed[c.who] != null) out.push(box(S.placed[c.who]));
  }
  return out;
}

// People that the selected person's statement mentions ("one row north of Hugo").
function referencedPeople(k) {
  return new Set(P.people[k].clues.filter((c) => c.who != null).map((c) => c.who));
}

// Pencil marks: each person has a fixed slot (3 per row), top and bottom of the cell
// so the furniture in the middle stays readable.
function notesSvg(i, ks) {
  const n = P.n, N = P.people.length;
  const x0 = (i % n) * CELL, y0 = Math.floor(i / n) * CELL;
  const rowsN = Math.ceil(N / 3);
  const ys = rowsN === 1 ? [22] : rowsN === 2 ? [21, 81] : [21, 51, 81];
  return ks.sort((a, b) => a - b).map((k) => {
    const x = x0 + 22 + (k % 3) * 28, y = y0 + ys[Math.floor(k / 3)];
    return `<text class="note" x="${x}" y="${y + CAP_OFFSET(26)}" style="fill:${inkOf(k)}">${P.people[k].initial}</text>`;
  }).join('');
}

function defaultStatus() {
  if (S.solved) return `Case closed. ${P.people[P.murderer].name} did it.`;
  if (S.crossMode) return 'Cross-out mode: tap or swipe squares.';
  if (S.selected != null) {
    const pr = P.people[S.selected];
    return S.placed[S.selected] != null
      ? `${pr.name}: hold a square to move · hold ${pr.initial} to remove`
      : `${pr.name}: tap or swipe to note · hold to place`;
  }
  const left = S.placed.filter((x) => x == null).length;
  if (left === P.people.length) return 'Pick a statement. Tap a square to note, hold to place.';
  return `${left} ${left === 1 ? 'person' : 'people'} left to place.`;
}

function setStatus(text, alert = false) {
  const el = $('.toolbar .status');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('alert', alert);
}

function toast(text, alert = true) {
  setStatus(text, alert);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setStatus(defaultStatus()), 2600);
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
  if (r < 0 || c < 0 || r >= P.n || c >= P.n) return -1;
  return r * P.n + c;
}

// Board gestures (person selected):  tap = toggle note · swipe = paint notes · hold = place.
// Cross mode:                          tap = toggle ✕   · swipe = paint ✕.
// No selection:                        tap a placed letter to select that person.
const HOLD_MS = 450;
let gesture = null;

function onPointerDown(ev, board) {
  if (!P || S.solved || ev.button > 0) return;
  const i = cellFromEvent(ev);
  if (i < 0) return;
  ev.preventDefault();
  try { board.setPointerCapture(ev.pointerId); } catch { /* ignore */ }
  gesture = { id: ev.pointerId, start: i, last: i, swiped: false, held: false, timer: null };
  if (S.selected != null && !S.crossMode && isFree(P, i)) {
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
  if (!isFree(P, i) || S.placed.includes(i)) return false;
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
  const n = P.n;
  $('#press').innerHTML = `<circle class="press" cx="${(i % n) * CELL + CELL / 2}" cy="${Math.floor(i / n) * CELL + CELL / 2}" r="40" pathLength="100" style="animation-duration:${HOLD_MS}ms"/>`;
}
function hidePress() {
  const el = $('#press');
  if (el) el.innerHTML = '';
}

function tapCell(i) {
  if (S.solved) return;
  S.flagged = null;
  const occupant = S.placed.indexOf(i);
  if (occupant >= 0) {
    // tapping a placed letter selects that person (tap again to let go)
    S.crossMode = false;
    S.selected = S.selected === occupant ? null : occupant;
    play('select');
    renderDynamic();
    setStatus(defaultStatus());
    return;
  }
  if (!isFree(P, i)) {
    if (S.selected != null) {
      play('bump');
      toast(`Nobody can stand on the ${OBJECTS[P.cells[i].obj].name}.`);
    }
    return;
  }
  if (!S.crossMode && S.selected == null) {
    toast('Pick a statement first, or switch on Cross.', false);
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
  if (S.solved || S.selected == null) return;
  const k = S.selected;
  const occupant = S.placed.indexOf(i);
  snapshot();
  if (occupant === k) {
    S.placed[k] = null;
    play('remove');
    toast(`${P.people[k].name} taken off the board.`, false);
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
  if (S.solved) return;
  S.crossMode = !S.crossMode;
  if (S.crossMode) S.selected = null;
  play('select');
  renderDynamic();
  setStatus(defaultStatus());
}

function tapCard(k) {
  if (S.solved) return;
  S.selected = S.selected === k ? null : k;
  S.crossMode = false;
  S.flagged = null;
  play('select');
  renderDynamic();
  setStatus(defaultStatus());
}

function afterChange() {
  if (S.hintFocus != null && S.placed[S.hintFocus] != null) clearHint();
  const full = S.placed.every((x) => x != null);
  if (full && S.placed.every((x, k) => x === P.solution[k])) {
    saveStore(); // bank the elapsed time first
    S.solved = true;
    S.selected = null;
    saveStore();
    renderDynamic();
    setStatus(defaultStatus());
    setTimeout(showSolved, 900);
    return;
  }
  renderDynamic();
  if (full) {
    play('wrong');
    toast('Everyone is placed… but the facts don\'t add up.');
  }
  else setStatus(defaultStatus());
  saveStore();
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

function hint() {
  if (S.solved) return;
  // 1) point out a mistake
  const wrong = S.placed.findIndex((cell, k) => cell != null && cell !== P.solution[k]);
  if (wrong >= 0) {
    S.hints++;
    S.flagged = wrong;
    S.selected = null;
    play('wrong');
    renderDynamic();
    toast(`${P.people[wrong].name}'s position doesn't hold up.`);
    saveStore();
    return;
  }
  // then, for the next person logic can pin down: 1) name them, 2) explain why, 3) place them
  const h = explainNext(P, S.placed);
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
    <div class="kicker">Start over?</div>
    <h2>Restart the case</h2>
    <div class="rule"></div>
    <p>Clear every suspect, note and cross from ${DESKS[P.desk].name} Case No. ${P.num}.</p>
    <div class="actions">
      <button class="tool" data-act="close">Keep going</button>
      <button class="tool primary" data-act="do-restart">Restart</button>
    </div>`);
}

function doRestart() {
  delete store.progress[P.key];
  S = null; // otherwise openCase would save the current board straight back
  closeModal();
  play('restart');
  openCase(P.desk, P.num);
  toast('Case restarted. Fresh start, detective.', false);
}

// ---------- overlays ----------

function modal(html, cls = '') {
  closeModal();
  const el = document.createElement('div');
  el.className = 'overlay';
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

function showSolved() {
  play('solved');
  const killer = P.people[P.murderer];
  const victim = P.people[P.victim];
  const room = P.areas[P.cells[P.solution[P.victim]].area].name;
  modal(`
    <div class="kicker">★ Extra! Extra! ★</div>
    <h2>${killer.name} did it!</h2>
    <div class="rule"></div>
    <div class="mugshot">${portraitSvg(killer)}</div>
    <div class="caption">${killer.name}, ${killer.title}, photographed leaving the ${room}.</div>
    <p>${killer.name} was alone with ${victim.name} in the <b>${room}</b>. ${store.detective ? detective() : "The Gazette's detective"} has cracked ${DESKS[P.desk].name} Case No. ${P.num}.</p>
    <div class="stats"><span>Time ${fmtTime(S.elapsed)}</span><span>Hints ${S.hints}</span></div>
    <div class="actions">
      <button class="tool" data-act="close">View scene</button>
      <button class="tool" data-act="home">All cases</button>
      <button class="tool primary" data-act="next">Next case ▸</button>
    </div>`, 'extra');
}

function showRules() {
  const legend = Object.keys(OBJECTS).map((o) => `
    <figure><svg class="art" viewBox="0 0 100 100">${objectSvg(o)}</svg>
    <figcaption class="cap">${OBJECTS[o].name}${OBJECTS[o].occupiable ? ' ✓' : ''}</figcaption></figure>`).join('');
  modal(`
    <div class="kicker">Notes for the detective</div>
    <h2>How to play</h2>
    <div class="rule"></div>
    <ul>
      <li>Every person was in a <b>different row and column</b>.</li>
      <li>Chairs, beds, rugs and benches can be stood on (✓). Everything else blocks the square.</li>
      <li><b>Beside</b> means directly above, below, left or right — and in the same room.</li>
      <li>The victim was <b>alone with the murderer</b>: exactly one suspect shares the victim's room.</li>
      <li>North is the top of the board. "One row north of Hugo" means the row directly above his; "somewhere north" means any row above.</li>
      <li><b>The only one</b> in a room (or on a kind of seat) means nobody else was there.</li>
      <li>Place everyone, and the killer is revealed.</li>
    </ul>
    <p><b>Controls.</b> Tap a statement to pick that person. Then <b>tap</b> a square to pencil in their initial, or <b>swipe</b> across squares to note several at once. <b>Hold</b> a square to place them for good: their row and column get crossed out. Hold their letter to take them back off. Use <b>Cross</b> to tap or swipe ✕ onto squares yourself.</p>
    <div class="mini-legend">${legend}</div>
    <label class="setting"><input type="checkbox" id="opt-autox" ${store.settings.autoX ? 'checked' : ''}> Cross out the row and column of everyone placed</label>
    <label class="setting"><input type="checkbox" id="opt-sound" ${store.settings.sound ? 'checked' : ''}> Sound effects</label>
    <label class="setting"><input type="checkbox" id="opt-highlight" ${store.settings.highlight ? 'checked' : ''}> Highlight what a selected statement mentions</label>
    <div class="actions"><button class="tool primary" data-act="close">Back to the case</button></div>`);
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
  const act = ev.target.closest('[data-act]')?.dataset.act;
  if (act) {
    ({
      undo, hint, restart, cross: toggleCross, 'close-hint': () => { hideHintSlip(); S.hintMarks = null; renderDynamic(); }, rules: showRules, close: closeModal, 'do-restart': doRestart,
      next: () => { closeModal(); const d = P.desk; saveStore(); openCase(d, nextNewCase(d)); },
      home: showHome,
      open: () => { closeModal(); const c = parseKey(ev.target.closest('[data-case]')?.dataset.case); if (c) openCase(...c); },
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
  if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { ev.preventDefault(); undo(); }
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
