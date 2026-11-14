// End-to-end browser test. Needs Playwright and a static server on :8123, for example:
//   npx http-server -p 8123 -c-1 . &
//   node tests/e2e.cjs [screenshot-dir]
// Plays the real app with a mouse: old saves surviving an update, every gesture, hints, sound,
// and all four themes (including the Egypt unmasking and the non-square boards).

const path = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright';
const { chromium } = require(path);

const BASE = 'http://localhost:8123';
const shots = process.argv[2];
let failures = 0;
const ok = (cond, msg) => { if (!cond) failures++; console.log(cond ? 'PASS' : 'FAIL', msg); };

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errors = [];

  async function newPage(viewport = { width: 390, height: 844 }, store = null) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await p.addInitScript(() => {
      window.__sounds = 0;
      const AC = window.AudioContext;
      if (!AC) return;
      const o = AC.prototype.createBufferSource, q = AC.prototype.createOscillator;
      AC.prototype.createBufferSource = function () { window.__sounds++; return o.call(this); };
      AC.prototype.createOscillator = function () { window.__sounds++; return q.call(this); };
    });
    // seed storage from a page that does not run the app (the app saves on unload)
    await p.goto(`${BASE}/tests/gallery.html`);
    await p.evaluate((s) => { localStorage.clear(); if (s) localStorage.setItem('murdoku:v2', JSON.stringify(s)); }, store);
    return p;
  }
  const seen = { seenIntro: { zeta: true, haunted: true, egypt: true } };
  const open = async (p, key) => { await p.goto(`${BASE}/${key ? `#${key}` : ''}`); await p.reload(); await p.waitForTimeout(500); };
  const gen = (p, theme, difficulty, seed, g) => p.evaluate(async ([theme, difficulty, seed, g]) => {
    const x = (await import('/js/generator.js')).generatePuzzle({ seed, difficulty, theme, gen: g });
    return { w: x.w, h: x.h, sol: x.solution, cells: x.cells, impostor: x.impostor ?? -1, ghost: x.people.findIndex((q) => q.ghost), victim: x.victim,
      murderer: x.murderer, wears: x.unmask ? x.unmask.wears : null, pieces: (x.pieces || []).length, gen: x.gen, people: x.people.length };
  }, [theme, difficulty, seed, g]);
  const xy = (p, i, w) => p.evaluate(([i, w]) => {
    const svg = document.getElementById('board');
    const pt = svg.createSVGPoint(); pt.x = (i % w) * 100 + 50; pt.y = Math.floor(i / w) * 100 + 50;
    const q = pt.matrixTransform(svg.getScreenCTM()); return [q.x, q.y];
  }, [i, w]);
  const tap = async (p, i, w) => { await p.locator('#board').scrollIntoViewIfNeeded(); const [x, y] = await xy(p, i, w); await p.mouse.click(x, y); };
  const hold = async (p, i, w) => { await p.locator('#board').scrollIntoViewIfNeeded(); const [x, y] = await xy(p, i, w); await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(620); await p.mouse.up(); };
  const swipe = async (p, cells, w) => {
    await p.locator('#board').scrollIntoViewIfNeeded();
    let [x, y] = await xy(p, cells[0], w); await p.mouse.move(x, y); await p.mouse.down();
    for (const c of cells.slice(1)) { [x, y] = await xy(p, c, w); await p.mouse.move(x, y, { steps: 4 }); }
    await p.mouse.up();
  };
  const place = async (p, k, i, w) => { await p.locator(`.card[data-person="${k}"]`).click(); await hold(p, i, w); };
  const count = (p, sel) => p.locator(sel).count();
  const stored = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('murdoku:v2')));
  const freeCell = (g, i) => !g.cells[i].void && (!g.cells[i].obj || ['chair', 'bed', 'rug', 'bench', 'sofa', 'hoverchair', 'sleeppod', 'grate', 'pew', 'throne', 'mat', 'boat'].includes(g.cells[i].obj));
  const shot = async (p, name, full = false) => { if (shots) await p.screenshot({ path: `${shots}/${name}.png`, fullPage: full }); };

  // ---------- 1. a save from before this update keeps its cases ----------
  {
    const p = await newPage();
    const old = await gen(p, 'manor', 'medium', 4, 1);
    const oldZ = await gen(p, 'zeta', 'easy', 2, 1);
    const save = { detective: 'Marple', last: 'medium-4', settings: { autoX: true, highlight: true, sound: true }, ...seen, progress: {
      'easy-1': { placed: [], marks: [], notes: [], hints: 0, elapsed: 61000, solved: true, touched: true },
      'medium-4': { placed: old.sol.map((c, k) => (k < 3 ? c : null)), marks: [], notes: [[old.sol[4], [4]]], hints: 1, elapsed: 30000, solved: false, touched: true },
      'zeta-easy-2': { placed: oldZ.sol.map((c, k) => (k < 2 ? c : null)), marks: [], notes: [], hints: 0, elapsed: 1000, solved: false, touched: true },
      'medium-9': { placed: [null, null, null, null, null, null], marks: [], notes: [], hints: 0, elapsed: 0, solved: false, touched: false },
    } };
    await p.evaluate((s) => localStorage.setItem('murdoku:v2', JSON.stringify(s)), save);
    await open(p, '');
    ok((await p.locator('.detective-name input').inputValue()) === 'Marple', 'old save: detective name kept');
    ok((await p.locator('.desk-easy .desk-solved').textContent()).includes('1 solved'), 'old save: solved case still counted');
    ok(await count(p, '.resume') === 1, 'old save: unfinished case offered');
    await p.locator('.resume').click(); await p.waitForTimeout(500);
    ok(await count(p, '.token') === 3 && await count(p, '.note') === 1, 'old save: placed suspects and notes back on the board');
    ok(await count(p, '.token.conflict') === 0, 'old save: board still fits its (recipe 1) puzzle');
    for (let k = 3; k < old.sol.length; k++) await place(p, k, old.sol[k], old.w);
    await p.waitForTimeout(1300);
    ok(await count(p, '.extra') === 1, 'old save: the case can be finished with its original answer');
    ok((await stored(p)).progress['medium-4'].gen === 1, 'old save: stamped as recipe 1');
    await open(p, 'zeta-easy-2');
    ok(await count(p, '.token') === 2 && await count(p, '.token.conflict') === 0, 'old themed save keeps its puzzle');
    await open(p, 'medium-9');
    ok((await stored(p)).progress['medium-9'].gen === 2, 'a case that was opened but never played gets the new recipe');
    await p.context().close();
  }

  // ---------- 2. gestures, hints and sound on a new-recipe Manor case ----------
  for (const [dev, vp] of [['phone', { width: 390, height: 844 }], ['tablet', { width: 1180, height: 820 }]]) {
    const p = await newPage(vp, seen);
    await open(p, 'medium-1');
    const g = await gen(p, 'manor', 'medium', 1, 2);
    ok((await stored(p)).progress['medium-1'].gen === 2, `${dev}: a new case is made with recipe 2`);
    const w = g.w;
    const solSet = new Set(g.sol);
    const r0 = Math.floor(g.sol[0] / w), c0 = g.sol[0] % w;
    const clear = [...Array(g.w * g.h).keys()].filter((i) => freeCell(g, i) && !solSet.has(i) && Math.floor(i / w) !== r0 && i % w !== c0);
    const sounds0 = await p.evaluate(() => window.__sounds);
    await p.locator('.card[data-person="0"]').click();
    await tap(p, clear[0], w);
    ok(await count(p, '.note') === 1, `${dev}: tap adds a note`);
    await tap(p, clear[0], w);
    ok(await count(p, '.note') === 0, `${dev}: tap again removes it`);
    await swipe(p, [clear[0], clear[1]], w);
    ok(await count(p, '.note') >= 2, `${dev}: swipe notes several squares`);
    ok(await count(p, '.token') === 0, `${dev}: notes never place anyone`);
    await hold(p, g.sol[0], w);
    ok(await count(p, '.token') === 1 && await count(p, 'path.excluded') > 0, `${dev}: hold places and crosses out the row and column`);
    ok(await count(p, '.card.placed') === 1 && await count(p, '.card.selected') === 0, `${dev}: card struck off and deselected`);
    await p.locator('[data-act="cross"]').click();
    const before = await count(p, 'path.excluded');
    await tap(p, clear[2], w);
    ok(await count(p, 'path.excluded') === before + 1, `${dev}: cross mode marks a square`);
    await p.locator('[data-act="cross"]').click();
    await tap(p, g.sol[0], w);
    ok(await count(p, '.card[data-person="0"].selected') === 1, `${dev}: tapping a letter selects that person`);
    await hold(p, g.sol[0], w);
    ok(await count(p, '.token') === 0, `${dev}: holding the letter takes them off`);
    await p.locator('[data-act="undo"]').click();
    ok(await count(p, '.token') === 1, `${dev}: undo puts them back`);
    ok(await p.evaluate(() => window.__sounds) > sounds0, `${dev}: actions make sounds`);
    // letters sit in the middle of their discs
    const off = await p.evaluate(() => {
      const t = document.querySelector('.token'); const c = t.querySelector('.disc').getBoundingClientRect(); const x = t.querySelector('text').getBoundingClientRect();
      return Math.abs((x.top + x.bottom) / 2 - (c.top + c.bottom) / 2) / c.height;
    });
    ok(off < 0.12, `${dev}: token letter roughly centred (text box offset ${(off * 100).toFixed(1)}%)`);
    // three-step hint
    await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(150);
    ok(/Look closely/.test(await p.locator('.status').textContent()) && await count(p, '.card.hinted') === 1, `${dev}: hint 1 points at a suspect`);
    await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(600);
    ok(await p.locator('.hint-slip').isVisible() && await count(p, '.token') === 1, `${dev}: hint 2 explains without placing`);
    if (dev === 'phone') await shot(p, 'e2e-hint');
    await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(400);
    ok(await count(p, '.token') === 2, `${dev}: hint 3 places them`);
    // restart gives the same case back
    await p.locator('[data-act="restart"]').click(); await p.locator('[data-act="do-restart"]').click(); await p.waitForTimeout(400);
    ok(await count(p, '.token') === 0 && await count(p, 'path.excluded') === 0, `${dev}: restart clears the board`);
    for (let k = 0; k < g.sol.length; k++) await place(p, k, g.sol[k], w);
    await p.waitForTimeout(1300);
    ok(await count(p, '.extra') === 1, `${dev}: restarted case is the same puzzle, and solving shows the reveal`);
    if (dev === 'phone') await shot(p, 'e2e-solved');
    await p.locator('.extra [data-act="next"]').click(); await p.waitForTimeout(400);
    ok(p.url().endsWith('#medium-2'), `${dev}: next case follows`);
    await p.locator('[data-act="home"]').click(); await p.waitForTimeout(300);
    ok((await p.locator('.desk-medium .desk-solved').textContent()).includes('1 solved'), `${dev}: solved count on the front page`);
    await p.context().close();
  }

  // ---------- 3. front page, themes ----------
  {
    const p = await newPage();
    await open(p, '');
    ok(await count(p, '.edition:not(.soon)') === 4 && await count(p, '.edition.soon') === 1, 'front page: four worlds and one coming soon');
    await p.locator('.edition[data-theme="egypt"]').click(); await p.waitForTimeout(200);
    ok((await p.locator('.desk-medium .desk-beat').textContent()) === 'The Pyramid', 'front page: Egypt desks describe the twists');
    await shot(p, 'e2e-home', true);
    await p.locator('.desk-easy .btn.primary').click(); await p.waitForTimeout(500);
    ok(p.url().endsWith('#egypt-easy-1') && await count(p, '.sheet') === 1, 'Egypt: first visit shows the briefing');
    await p.context().close();
  }

  // ---------- 4. Zeta-9 ----------
  {
    const p = await newPage({ width: 390, height: 844 }, seen);
    await open(p, 'zeta-medium-1');
    ok(await count(p, '#board .pad') === 2, 'Zeta: two teleporter pads');
    ok((await p.locator('.card .clue').first().textContent()).startsWith('Sensed:'), 'Zeta: statements are telepathic');
    const a = await p.locator('.card .name').first().textContent();
    await p.locator('[data-act="names"][data-earth="1"]').click(); await p.waitForTimeout(200);
    ok(a !== await p.locator('.card .name').first().textContent(), 'Zeta: name switch changes the cards');
    await shot(p, 'e2e-zeta', true);
    await open(p, 'zeta-hard-1');
    const g = await gen(p, 'zeta', 'hard', 1, 2);
    if (g.impostor >= 0) {
      await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(150);
      await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(400);
      ok(await p.locator('.hint-slip').isVisible(), 'Zeta hard: hint explains the impostor');
      await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(200);
      ok(await count(p, `.card.liar[data-person="${g.impostor}"]`) === 1, 'Zeta hard: impostor unmasked on their card');
    }
    for (let k = 0; k < g.sol.length; k++) await place(p, k, g.sol[k], g.w);
    await p.waitForTimeout(1300);
    ok(await count(p, '.extra') === 1, 'Zeta hard: solved');
    await p.context().close();
  }

  // ---------- 5. Hollow Hill ----------
  {
    const p = await newPage({ width: 390, height: 844 }, seen);
    let g, seed = 1;
    for (; seed < 20; seed++) { g = await gen(p, 'haunted', 'medium', seed, 2); if (!freeCell(g, g.sol[g.ghost])) break; }
    await open(p, `haunted-medium-${seed}`);
    await place(p, g.ghost, g.sol[g.ghost], g.w);
    ok(await count(p, '.token.ghost') === 1, `Hollow Hill: ghost placed inside a ${g.cells[g.sol[g.ghost]].obj}`);
    const other = g.sol.findIndex((_, k) => k !== g.ghost);
    const blocked = g.cells.findIndex((c, i) => !c.void && c.obj && !freeCell(g, i) && i !== g.sol[g.ghost]);
    await place(p, other, blocked, g.w);
    ok(await count(p, '.token') === 1, 'Hollow Hill: the living cannot stand inside furniture');
    await shot(p, 'e2e-haunted', true);
    await p.context().close();
  }

  // ---------- 6. Egypt: masks and the unmasking ----------
  {
    const p = await newPage({ width: 390, height: 844 }, seen);
    await open(p, 'egypt-easy-1');
    const g = await gen(p, 'egypt', 'easy', 1, 2);
    ok(await count(p, '.alibi') === g.people - 1, 'Egypt easy: one alibi per mask');
    ok(await count(p, '.legend .chip') > 3 && await count(p, '.clue .mini') > 0, 'Egypt easy: a key, and pictures inside the statements');
    ok(await count(p, '.dossier .key-slot .legend') === 1 && await count(p, '.board-wrap .legend') === 0
      && await p.evaluate(() => document.querySelector('.cards').getBoundingClientRect().top - document.querySelector('.board').getBoundingClientRect().bottom) < 70,
      'Phone: the key sits below the suspects, and the suspects start right under the board');
    await p.setViewportSize({ width: 1024, height: 768 }); await p.waitForTimeout(150);
    ok(await count(p, '.board-wrap .legend') === 1 && await p.locator('.key-slot').isHidden(), 'Tablet: the key moves under the board');
    await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(150);
    await p.locator('.legend .chip').first().click(); await p.waitForTimeout(150);
    ok(await count(p, '.legend-hi') > 0 && await count(p, '.chip.on') === 1, 'Egypt easy: tapping a key entry lights those objects up');
    await shot(p, 'e2e-legend', true);
    await p.locator('.legend .chip').first().click();
    const blockedCell = g.cells.findIndex((c) => !c.void && c.obj && !freeCell(g, g.cells.indexOf(c)));
    await tap(p, blockedCell, g.w); await p.waitForTimeout(100);
    ok(/That is an? /.test(await p.locator('.status').textContent()), 'Egypt easy: tapping an object says what it is');
    await p.locator('.alibi-main').first().click(); await p.waitForTimeout(150);
    ok(await count(p, '.clue-hi, .area-hi') > 0, 'Egypt easy: tapping an alibi lights it up on the board');
    await p.locator('.guess').first().click();
    ok((await p.locator('.guess').first().textContent()) !== '?', 'Egypt easy: mask guesses can be pencilled in');
    for (let k = 0; k < g.sol.length; k++) await place(p, k, g.sol[k], g.w);
    await p.waitForTimeout(1200);
    ok(await count(p, '.sheet.accuse') === 1 && await count(p, '.extra') === 0, 'Egypt easy: placing every mask asks who was behind the killer\'s mask');
    await shot(p, 'e2e-accuse');
    const right = g.wears.indexOf(g.murderer);
    const wrong = (right + 1) % g.wears.length;
    await p.locator(`.accuse-list [data-i="${wrong}"]`).click(); await p.waitForTimeout(200);
    ok(await count(p, '.extra') === 0 && await p.locator(`.accuse-list [data-i="${wrong}"]`).isDisabled(), 'Egypt easy: a wrong name is rejected');
    ok(await p.locator('.accuse-note').isVisible() && /^Not .+(not true of the square|Everybody wore a mask of their own)/.test(await p.locator('.accuse-why').textContent()),
      'Egypt easy: the unmasking explains itself, and a wrong name gets a reason');
    await shot(p, 'e2e-accuse-wrong');
    await p.locator('.sheet [data-act="close"]').click();
    await p.reload(); await p.waitForTimeout(500);
    ok(await count(p, '.accuse-btn') === 1, 'Egypt easy: after a reload the unmasking is still waiting');
    await p.locator('.alibi-main').first().click(); await p.waitForTimeout(150);
    ok(/alibi fits (only )?the /.test(await p.locator('.status').textContent()), 'Egypt easy: with the masks placed, tapping an alibi says which masks it fits');
    await p.locator('.alibi-main').first().click();
    await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(150);
    await p.locator('[data-act="hint"]').click(); await p.waitForTimeout(300);
    ok(await p.locator('.hint-slip').isVisible(), 'Egypt easy: hint lists which masks each alibi fits');
    await p.locator('.accuse-btn').click({ force: true }); await p.waitForTimeout(200);
    await p.locator(`.accuse-list [data-i="${right}"]`).click(); await p.waitForTimeout(1300);
    ok(await count(p, '.extra') === 1 && await count(p, '.mugshots .mugshot') === 2, 'Egypt easy: the right name closes the case and shows mask and face');
    await shot(p, 'e2e-unmasked');

    // the pyramid
    await open(p, 'egypt-medium-1');
    const m = await gen(p, 'egypt', 'medium', 1, 2);
    ok(m.w === 7 && m.h === 6 && m.cells.some((c) => c.void), 'Egypt medium: the board is a stepped pyramid');
    const voidCell = m.cells.findIndex((c) => c.void);
    await p.locator('.card[data-person="0"]').click();
    await hold(p, voidCell, m.w);
    ok(await count(p, '.token') === 0, 'Egypt medium: squares outside the pyramid cannot be used');
    await p.keyboard.press('Escape'); // let go of the selected person again
    await shot(p, 'e2e-pyramid', true);
    for (let k = 0; k < m.sol.length; k++) await place(p, k, m.sol[k], m.w);
    await p.waitForTimeout(1300);
    ok(await count(p, '.extra') === 1, 'Egypt medium: pyramid case solved');
    await p.context().close();
  }

  // ---------- 7. boards that are not square ----------
  {
    const p = await newPage({ width: 390, height: 844 }, seen);
    let g, seed = 1;
    for (; seed < 30; seed++) { g = await gen(p, 'manor', 'medium', seed, 2); if (g.w !== g.h && g.cells.some((c) => c.void)) break; }
    await open(p, `medium-${seed}`);
    await shot(p, 'e2e-ell', true);
    for (let k = 0; k < g.sol.length; k++) await place(p, k, g.sol[k], g.w);
    await p.waitForTimeout(1300);
    ok(await count(p, '.extra') === 1, `L-shaped ${g.w}x${g.h} Manor case (No. ${seed}) solved`);
    await p.context().close();
  }

  console.log(errors.length ? `page errors: ${errors.join(' | ')}` : 'no page errors');
  if (errors.length) failures++;
  console.log(failures ? `${failures} FAILED` : 'all ok');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
