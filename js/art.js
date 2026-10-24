// Ink-and-paper SVG art. Everything is drawn in a 100x100 box with three "inks":
//   .f  paper fill + ink outline     .d  solid ink      .s  ink stroke only      .t thin stroke
// Colours come from CSS variables so the whole look can be re-themed in style.css.

import { Rng } from './rng.js';
import { ROLES } from './themes.js';

// ---------- floor patterns (one per room, B&W like newsprint) ----------

export const PATTERN_DEFS = `
<pattern id="pt-grass" width="34" height="34" patternUnits="userSpaceOnUse">
  <path class="pt" d="M5 14 l3 -7 l2 6 M20 30 l3 -7 l2 6 M25 10 l2 -5 l2 5 M8 31 l2 -5 l2 4"/>
</pattern>
<pattern id="pt-boards" width="50" height="20" patternUnits="userSpaceOnUse">
  <path class="pt" d="M0 19.5 H50 M18 0 V20 M44 0 v4 M8 10 h4"/>
</pattern>
<pattern id="pt-diag" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <path class="pt" d="M0 6 H12"/>
</pattern>
<pattern id="pt-diag2" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
  <path class="pt" d="M0 8 H16"/>
</pattern>
<pattern id="pt-tiles" width="25" height="25" patternUnits="userSpaceOnUse">
  <path class="pt" d="M0 0.5 H25 M0.5 0 V25"/>
</pattern>
<pattern id="pt-dots" width="10" height="10" patternUnits="userSpaceOnUse">
  <circle class="ptd" cx="5" cy="5" r="1.3"/>
</pattern>
<pattern id="pt-cross" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <path class="pt" d="M0 7 H14 M7 0 V14"/>
</pattern>
<pattern id="pt-checker" width="50" height="50" patternUnits="userSpaceOnUse">
  <rect class="ptd" x="0" y="0" width="25" height="25" opacity="0.5"/>
  <rect class="ptd" x="25" y="25" width="25" height="25" opacity="0.5"/>
</pattern>
<pattern id="pt-hlines" width="10" height="9" patternUnits="userSpaceOnUse">
  <path class="pt" d="M0 4.5 H10"/>
</pattern>
<pattern id="pt-halftone" width="6" height="6" patternUnits="userSpaceOnUse">
  <circle class="ptd" cx="3" cy="3" r="1.1"/>
</pattern>
<pattern id="pt-shade" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <path class="pts" d="M0 2.5 H5"/>
</pattern>
`;

// ---------- furniture ----------

const OBJ = {
  chair: `
    <path class="f" d="M28 32 C28 16 72 16 72 32 L72 58 L28 58 Z"/>
    <circle class="d" cx="40" cy="32" r="1.8"/><circle class="d" cx="50" cy="30" r="1.8"/><circle class="d" cx="60" cy="32" r="1.8"/>
    <circle class="d" cx="45" cy="43" r="1.8"/><circle class="d" cx="55" cy="43" r="1.8"/>
    <path class="f" d="M18 46 C18 36 32 36 32 46 L32 76 L18 76 Z"/>
    <path class="f" d="M68 46 C68 36 82 36 82 46 L82 76 L68 76 Z"/>
    <path class="f" d="M31 60 C31 56 69 56 69 60 L69 76 L31 76 Z"/>
    <path class="sh" d="M70 48 L80 48 L80 74 L70 74 Z"/>
    <path class="s" d="M22 76 L22 86 M78 76 L78 86"/>`,
  bed: `
    <rect class="f" x="16" y="8" width="68" height="84" rx="4"/>
    <rect class="d" x="16" y="8" width="68" height="11" rx="3"/>
    <rect class="f" x="26" y="24" width="48" height="15" rx="7"/>
    <path class="t" d="M34 31 Q50 35 66 31"/>
    <path class="f" d="M16 46 Q50 52 84 46 L84 92 L16 92 Z"/>
    <path class="sh" d="M16 46 Q50 52 84 46 L84 58 Q50 64 16 58 Z"/>
    <path class="t" d="M30 64 L30 92 M50 66 L50 92 M70 64 L70 92"/>`,
  rug: `
    <path class="t" d="M16 26 h-6 M16 34 h-6 M16 42 h-6 M16 50 h-6 M16 58 h-6 M16 66 h-6 M16 74 h-6
      M84 26 h6 M84 34 h6 M84 42 h6 M84 50 h6 M84 58 h6 M84 66 h6 M84 74 h6"/>
    <rect class="f" x="16" y="20" width="68" height="60"/>
    <rect class="s" x="23" y="27" width="54" height="46" style="stroke-width:2"/>
    <path class="sh" d="M50 32 L68 50 L50 68 L32 50 Z"/>
    <path class="s" d="M50 32 L68 50 L50 68 L32 50 Z" style="stroke-width:2.2"/>
    <circle class="d" cx="50" cy="50" r="4"/>`,
  bench: `
    <path class="s" d="M22 26 L22 60 M78 26 L78 60"/>
    <rect class="f" x="12" y="24" width="76" height="9" rx="2"/>
    <rect class="f" x="12" y="38" width="76" height="9" rx="2"/>
    <rect class="f" x="8" y="54" width="84" height="10" rx="2"/>
    <path class="s" d="M18 64 Q14 74 16 86 M82 64 Q86 74 84 86 M16 86 h6 M78 86 h6"/>`,
  tree: `
    <path class="f" d="M44 92 L46 66 L54 66 L56 92 Z"/>
    <path class="t" d="M50 72 L50 90"/>
    <path class="f" d="M50 8 C62 8 70 18 68 28 C80 30 84 46 74 54 C78 66 64 74 52 70 C40 76 24 68 28 56 C16 50 18 32 32 30 C30 18 38 8 50 8 Z"/>
    <path class="sh" d="M74 54 C78 66 64 74 52 70 C60 64 70 60 72 46 C76 48 76 52 74 54 Z"/>
    <path class="t" d="M40 30 q4 4 8 2 M56 40 q4 4 8 1 M36 50 q4 4 8 2 M54 58 q3 3 7 1"/>`,
  bush: `
    <path class="f" d="M14 78 C6 70 12 54 24 56 C24 40 42 36 48 46 C54 32 76 36 74 50 C88 50 94 70 84 78 Z"/>
    <path class="sh" d="M84 78 C94 70 88 50 74 50 C78 60 72 72 60 78 Z"/>
    <path class="t" d="M28 66 l4 -5 l3 5 M46 58 l4 -5 l3 5 M62 66 l4 -5 l3 5 M38 72 l3 -4 l3 4"/>
    <path class="s" d="M10 80 H90"/>`,
  table: `
    <path class="s" d="M30 66 L27 90 M70 66 L73 90 M50 66 L50 92"/>
    <path class="f" d="M12 42 C12 62 18 68 22 68 L78 68 C82 68 88 62 88 42 Z"/>
    <path class="t" d="M22 68 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0"/>
    <path class="sh" d="M70 46 L86 44 C86 60 82 66 78 68 L70 68 Z"/>
    <ellipse class="f" cx="50" cy="42" rx="38" ry="10"/>
    <path class="f" d="M47 22 L53 22 L54 40 L46 40 Z"/>
    <path class="d" d="M50 10 C54 15 53 20 50 21 C47 20 46 15 50 10 Z"/>`,
  shelf: `
    <rect class="f" x="16" y="6" width="68" height="88"/>
    <path class="s" d="M16 34 H84 M16 62 H84"/>
    <rect class="d" x="21" y="12" width="6" height="22"/><rect class="f" x="27" y="15" width="7" height="19"/>
    <rect class="d" x="34" y="11" width="5" height="23"/><rect class="sh2" x="39" y="14" width="8" height="20"/>
    <path class="f" d="M50 34 L58 15 L63 17 L55 34 Z"/><rect class="d" x="68" y="13" width="9" height="21"/>
    <rect class="f" x="21" y="43" width="8" height="19"/><rect class="d" x="29" y="40" width="5" height="22"/>
    <rect class="sh2" x="34" y="42" width="9" height="20"/><rect class="d" x="47" y="44" width="7" height="18"/>
    <rect class="f" x="54" y="40" width="6" height="22"/><rect class="d" x="60" y="42" width="5" height="20"/>
    <rect class="f" x="65" y="45" width="13" height="17"/>
    <rect class="d" x="21" y="70" width="7" height="24"/><rect class="f" x="28" y="72" width="8" height="22"/>
    <rect class="sh2" x="44" y="76" width="22" height="7"/><rect class="f" x="44" y="83" width="24" height="7"/>
    <rect class="d" x="72" y="70" width="6" height="24"/>`,
  plant: `
    <path class="f" d="M50 60 C40 44 22 40 12 42 C24 46 34 52 44 62 Z"/>
    <path class="f" d="M50 60 C60 44 78 40 88 42 C76 46 66 52 56 62 Z"/>
    <path class="f" d="M50 60 C38 36 34 20 40 8 C46 22 52 40 52 60 Z"/>
    <path class="f" d="M50 60 C62 36 70 24 66 12 C58 26 50 40 48 60 Z"/>
    <path class="f" d="M50 60 C34 54 22 58 16 66 C28 62 40 62 48 64 Z"/>
    <path class="f" d="M32 62 L68 62 L62 92 L38 92 Z"/>
    <path class="sh" d="M56 62 L68 62 L62 92 L54 92 Z"/>
    <rect class="f" x="29" y="58" width="42" height="7"/>`,
  piano: `
    <rect class="f" x="12" y="10" width="76" height="46"/>
    <path class="sh" d="M14 12 L86 12 L86 24 L14 24 Z"/>
    <path class="t" d="M30 32 q6 -6 12 0 q6 6 12 0 q6 -6 12 0"/>
    <rect class="f" x="8" y="56" width="84" height="14"/>
    <path class="t" d="M17 56 V70 M26 56 V70 M35 56 V70 M44 56 V70 M53 56 V70 M62 56 V70 M71 56 V70 M80 56 V70"/>
    <rect class="d" x="14" y="56" width="5" height="8"/><rect class="d" x="23" y="56" width="5" height="8"/>
    <rect class="d" x="41" y="56" width="5" height="8"/><rect class="d" x="50" y="56" width="5" height="8"/>
    <rect class="d" x="59" y="56" width="5" height="8"/><rect class="d" x="77" y="56" width="5" height="8"/>
    <path class="s" d="M16 70 L16 92 M84 70 L84 92 M12 92 h8 M80 92 h8"/>`,
  stove: `
    <rect class="f" x="62" y="4" width="10" height="20"/>
    <rect class="f" x="14" y="24" width="72" height="66" rx="3"/>
    <rect class="d" x="14" y="24" width="72" height="10"/>
    <ellipse class="f" cx="32" cy="29" rx="9" ry="3"/><ellipse class="f" cx="68" cy="29" rx="9" ry="3"/>
    <rect class="f" x="24" y="44" width="52" height="34" rx="2"/>
    <rect class="sh" x="30" y="50" width="40" height="18"/>
    <path class="s" d="M36 74 H64"/>
    <path class="s" d="M20 90 v4 M80 90 v4"/>`,

  // ----- Outpost Zeta-9 -----
  hoverchair: `
    <path class="f" d="M28 30 C28 14 72 14 72 30 L72 54 L28 54 Z"/>
    <path class="f" d="M18 42 C18 33 31 33 31 42 L31 64 L18 64 Z"/>
    <path class="f" d="M69 42 C69 33 82 33 82 42 L82 64 L69 64 Z"/>
    <path class="f" d="M30 55 C30 51 70 51 70 55 L70 64 L30 64 Z"/>
    <path class="f" d="M24 64 L76 64 L68 72 L32 72 Z"/>
    <path class="sh" d="M70 44 L80 44 L80 62 L70 62 Z"/>
    <path class="t" d="M34 80 L30 88 M44 80 L42 92 M56 80 L58 92 M66 80 L70 88" stroke-dasharray="3 3"/>`,
  sleeppod: `
    <rect class="f" x="8" y="32" width="84" height="44" rx="22"/>
    <path class="f" d="M28 56 C28 38 72 38 72 56 Z"/>
    <path class="sh" d="M34 54 C34 44 66 44 66 54 Z"/>
    <path class="s" d="M8 62 H92"/>
    <circle class="d" cx="20" cy="54" r="3"/><circle class="d" cx="80" cy="54" r="3"/>
    <path class="s" d="M24 76 L20 88 M76 76 L80 88"/>`,
  grate: `
    <rect class="f" x="14" y="14" width="72" height="72" rx="5"/>
    <path class="s" d="M28 26 V74 M40 26 V74 M52 26 V74 M64 26 V74 M76 26 V74" style="stroke-width:4.5"/>
    <circle class="d" cx="20" cy="20" r="2.5"/><circle class="d" cx="80" cy="20" r="2.5"/>
    <circle class="d" cx="20" cy="80" r="2.5"/><circle class="d" cx="80" cy="80" r="2.5"/>`,
  specimen: `
    <rect class="d" x="22" y="6" width="56" height="9" rx="2"/>
    <rect class="f" x="26" y="15" width="48" height="68"/>
    <path class="sh" d="M28 38 L72 38 L72 81 L28 81 Z"/>
    <path class="f" d="M40 68 C35 52 45 42 52 47 C60 42 67 56 61 68 C67 74 58 80 50 75 C42 80 33 74 40 68 Z"/>
    <circle class="d" cx="47" cy="56" r="2.6"/><circle class="d" cx="56" cy="57" r="2.6"/>
    <circle class="t" cx="36" cy="28" r="2.5"/><circle class="t" cx="62" cy="24" r="3"/><circle class="t" cx="58" cy="32" r="1.8"/>
    <rect class="d" x="20" y="83" width="60" height="10" rx="2"/>`,
  console: `
    <rect class="f" x="30" y="8" width="40" height="26" rx="3"/>
    <path class="sh" d="M33 11 h34 v20 h-34z"/>
    <path class="s" d="M36 24 l6 -5 6 7 6 -9 6 6" style="stroke-width:2"/>
    <path class="f" d="M10 62 L24 34 L76 34 L90 62 Z"/>
    <circle class="d" cx="30" cy="48" r="3.5"/><circle class="f" cx="42" cy="48" r="3.5"/>
    <rect class="d" x="54" y="44" width="18" height="7" rx="2"/>
    <rect class="f" x="10" y="62" width="80" height="26"/>
    <path class="s" d="M22 72 h20 M22 80 h12"/>`,
  crate: `
    <rect class="d" x="12" y="16" width="76" height="9"/>
    <rect class="f" x="14" y="25" width="72" height="62"/>
    <rect class="s" x="21" y="32" width="58" height="48" style="stroke-width:2"/>
    <path class="s" d="M21 32 L79 80 M79 32 L21 80" style="stroke-width:2.4"/>
    <path class="sh" d="M70 25 h16 v62 h-16z"/>`,
  reactor: `
    <rect class="f" x="30" y="12" width="40" height="78" rx="9"/>
    <ellipse class="f" cx="50" cy="13" rx="20" ry="5"/>
    <rect class="sh" x="36" y="24" width="28" height="58" rx="6"/>
    <circle class="f" cx="50" cy="52" r="13"/>
    <path class="d" d="M50 52 L43 41 A13 13 0 0 1 57 41 Z M50 52 L63 54 A13 13 0 0 1 57 63 Z M50 52 L43 63 A13 13 0 0 1 37 54 Z"/>
    <path class="s" d="M18 30 h10 M18 72 h10 M72 30 h10 M72 72 h10"/>`,
  hydro: `
    <path class="f" d="M30 62 C25 44 29 30 36 22 C40 34 39 50 37 62 Z"/>
    <path class="f" d="M50 62 C49 40 56 30 64 25 C62 40 58 52 57 62 Z"/>
    <path class="f" d="M66 62 C68 52 75 45 84 44 C81 53 76 58 73 62 Z"/>
    <circle class="f" cx="36" cy="19" r="6"/><circle class="d" cx="64" cy="23" r="5"/>
    <path class="f" d="M12 62 L88 62 L82 90 L18 90 Z"/>
    <path class="s" d="M14 71 H86"/><path class="sh" d="M66 72 h18 l-4 16 h-14z"/>`,

  // ----- Hollow Hill House -----
  pew: `
    <rect class="f" x="10" y="16" width="80" height="38" rx="4"/>
    <path class="s" d="M14 30 H86" style="stroke-width:2"/>
    <circle class="s" cx="50" cy="40" r="6" style="stroke-width:2"/>
    <rect class="f" x="6" y="54" width="88" height="12" rx="2"/>
    <path class="s" d="M14 66 V90 M86 66 V90"/>`,
  coffin: `
    <path class="f" d="M36 6 L64 6 L78 30 L66 94 L34 94 L22 30 Z"/>
    <path class="sh" d="M60 10 L73 30 L63 90 L55 90 Z"/>
    <path class="s" d="M50 28 V64 M40 40 H60"/>`,
  wardrobe: `
    <path class="d" d="M12 8 H88 V17 H12 Z"/>
    <rect class="f" x="17" y="17" width="66" height="75"/>
    <path class="s" d="M50 21 V88"/>
    <rect class="s" x="23" y="25" width="21" height="58" style="stroke-width:1.8"/>
    <rect class="s" x="56" y="25" width="21" height="58" style="stroke-width:1.8"/>
    <circle class="d" cx="46" cy="54" r="2.6"/><circle class="d" cx="54" cy="54" r="2.6"/>
    <path class="sh" d="M66 21 h13 v67 h-13z"/>`,
  clock: `
    <rect class="f" x="31" y="5" width="38" height="36" rx="10"/>
    <circle class="f" cx="50" cy="23" r="12"/>
    <path class="s" d="M50 23 V15 M50 23 L57 27" style="stroke-width:2.2"/>
    <rect class="f" x="36" y="41" width="28" height="44"/>
    <path class="s" d="M50 45 V68" style="stroke-width:2"/><circle class="d" cx="50" cy="72" r="5.5"/>
    <rect class="f" x="29" y="85" width="42" height="10"/>`,
  candelabra: `
    <path class="s" d="M50 86 V46 M30 50 Q30 61 50 61 Q70 61 70 50 M30 50 V42 M70 50 V42"/>
    <path class="f" d="M36 92 H64 L57 82 H43 Z"/>
    <rect class="f" x="26" y="28" width="8" height="14"/><rect class="f" x="46" y="20" width="8" height="26"/><rect class="f" x="66" y="28" width="8" height="14"/>
    <path class="d" d="M30 13 C33.5 18 33.5 22 30 24.5 C26.5 22 26.5 18 30 13 Z M50 5 C53.5 10 53.5 14 50 16.5 C46.5 14 46.5 10 50 5 Z M70 13 C73.5 18 73.5 22 70 24.5 C66.5 22 66.5 18 70 13 Z"/>`,
  mirror: `
    <ellipse class="f" cx="50" cy="40" rx="27" ry="33"/>
    <ellipse class="sh" cx="50" cy="40" rx="19" ry="25"/>
    <ellipse class="s" cx="50" cy="40" rx="19" ry="25" style="stroke-width:1.6"/>
    <path class="t" d="M39 24 L55 48 M45 20 L60 41"/>
    <path class="s" d="M50 73 V86 M33 93 L50 85 L67 93"/>`,
  gravestone: `
    <path class="f" d="M24 88 V40 C24 16 76 16 76 40 V88 Z"/>
    <path class="sh" d="M63 24 C72 30 76 37 76 46 V88 H66 Z"/>
    <path class="s" d="M38 44 H62 M38 54 H58 M38 64 H54" style="stroke-width:2.4"/>
    <path class="s" d="M12 90 H88"/>
    <path class="t" d="M16 90 l4 -7 3 7 M80 90 l3 -7 4 7"/>`,
};

// Zeta-9 teleporter pad, drawn on the floor under anything else in the square.
export function padSvg() {
  return `
    <circle class="pad-ring" cx="50" cy="50" r="40"/>
    <circle class="pad-ring2" cx="50" cy="50" r="30"/>
    <path class="pad-bolt" d="M54 26 L40 54 L52 54 L46 76 L62 44 L50 44 Z"/>`;
}

export function objectSvg(kind) {
  return OBJ[kind] || '';
}

// ---------- portraits ----------
// Rubber-hose-era cartoon busts, built from parts. Same seed => same face.

const HEAD = { cx: 50, cy: 47, rx: 18, ry: 21 };

const HAIR = {
  slick: `<path class="d" d="M31 47 C28 26 40 22 52 22 C64 22 72 30 69 47 C68 38 62 32 52 32 C42 32 36 36 31 47 Z"/>
          <path class="hl" d="M40 27 Q50 24 60 27"/>`,
  part: `<path class="d" d="M31 46 C28 24 42 20 52 21 C64 22 72 30 69 46 C66 34 58 30 46 32 C40 33 34 38 31 46 Z"/>
         <path class="hl" d="M44 22 Q42 26 44 31"/>`,
  bald: `<path class="d" d="M32 50 C30 42 33 38 35 36 C34 42 36 46 34 52 Z M68 50 C70 42 67 38 65 36 C66 42 64 46 66 52 Z"/>
         <path class="t" d="M44 29 q2 -3 4 0"/>`,
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
};
const LONG_BACK = new Set(['long']);

const HATS = {
  bowler: `<path class="d" d="M30 34 C30 12 70 12 70 34 Z"/><path class="hl" d="M33 30 H67"/>
           <ellipse class="d" cx="50" cy="34" rx="27" ry="4.5"/>`,
  tophat: `<path class="d" d="M34 34 L36 4 L64 4 L66 34 Z"/><rect class="p" x="35" y="26" width="30" height="5"/>
           <ellipse class="d" cx="50" cy="34" rx="27" ry="4.5"/>`,
  fedora: `<path class="d" d="M31 34 C30 16 40 13 50 18 C60 13 70 16 69 34 Z"/><rect class="p" x="31" y="28" width="38" height="4"/>
           <path class="d" d="M16 38 C24 32 76 32 84 38 C76 36 24 36 16 38 Z" style="stroke-width:4"/>`,
  cloche: `<path class="d" d="M27 47 C24 18 76 18 73 47 C66 38 34 38 27 47 Z"/><path class="hl" d="M30 38 Q50 32 70 38"/>
           <circle class="f" cx="66" cy="33" r="4.5"/><circle class="d" cx="66" cy="33" r="1.5"/>`,
  flatcap: `<path class="d" d="M30 38 C30 22 64 18 70 30 L80 36 C72 40 42 40 30 38 Z"/><path class="hl" d="M40 26 Q54 22 64 28"/>`,
  peaked: `<path class="d" d="M28 36 C24 14 76 14 72 36 Z"/><rect class="p" x="29" y="30" width="42" height="3"/>
           <path class="d" d="M30 36 Q50 42 70 36 L72 39 Q50 48 28 39 Z"/><circle class="p" cx="50" cy="24" r="3"/>`,
  chef: `<path class="f" d="M34 36 L34 20 C24 20 24 6 36 8 C38 0 62 0 64 8 C76 6 76 20 66 20 L66 36 Z"/>
         <path class="t" d="M42 20 L42 34 M50 18 L50 34 M58 20 L58 34"/>`,
  beret: `<path class="d" d="M28 36 C26 22 46 18 66 22 C78 26 76 34 70 36 Z"/><path class="d" d="M50 20 l2 -6"/>`,
};

const FACIAL = {
  handlebar: `<path class="d" d="M50 56 C44 53 38 54 35 58 C34 61 31 60 32 56 C34 62 44 61 50 59 C56 61 66 62 68 56 C69 60 66 61 65 58 C62 54 56 53 50 56 Z"/>`,
  toothbrush: `<rect class="d" x="45" y="55.5" width="10" height="4" rx="1"/>`,
  beard: `<path class="d" d="M32 50 C32 66 40 76 50 76 C60 76 68 66 68 50 C66 58 62 62 58 62 C56 58 44 58 42 62 C38 62 34 58 32 50 Z"/>`,
  chops: `<path class="d" d="M32 44 C32 56 36 62 40 62 C40 56 36 52 36 44 Z M68 44 C68 56 64 62 60 62 C60 56 64 52 64 44 Z"/>`,
  goatee: `<path class="d" d="M46 66 C46 72 54 72 54 66 C52 68 48 68 46 66 Z M45 57 Q50 55 55 57 L55 58.5 Q50 57 45 58.5 Z"/>`,
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
    <path class="p" d="M42 76 L50 96 L58 76 Z"/>
    <path class="d" d="M48 79 L52 79 L53.5 92 L50 97 L46.5 92 Z"/>
    <path class="hl" d="M40 77 L47 95 M60 77 L53 95"/>`,
  tails: `<path class="d" d="${SHOULDERS}"/>
    <path class="p" d="M40 76 L50 100 L60 76 Z"/>
    <path class="d" d="M50 80 L42 76 L42 84 Z M50 80 L58 76 L58 84 Z"/><circle class="d" cx="50" cy="80" r="2"/>
    <circle class="d" cx="50" cy="88" r="1.2"/><circle class="d" cx="50" cy="94" r="1.2"/>`,
  uniform: `<path class="d" d="${SHOULDERS}"/>
    <rect class="p" x="42" y="74" width="16" height="5"/>
    <circle class="p" cx="50" cy="85" r="1.8"/><circle class="p" cx="50" cy="93" r="1.8"/>
    <path class="p" d="M14 86 L30 80 L32 84 L16 90 Z M86 86 L70 80 L68 84 L84 90 Z"/>
    <circle class="p" cx="36" cy="90" r="2.4"/><circle class="p" cx="31" cy="92" r="2.4"/>`,
  gown: `<path class="d" d="${SHOULDERS}"/>
    <path class="p" d="M34 77 C40 92 60 92 66 77 Z"/>
    <g class="p"><circle cx="40" cy="81" r="1.8"/><circle cx="44" cy="85" r="1.8"/><circle cx="50" cy="86.5" r="1.8"/><circle cx="56" cy="85" r="1.8"/><circle cx="60" cy="81" r="1.8"/></g>`,
  maid: `<path class="d" d="${SHOULDERS}"/>
    <path class="f" d="M38 76 L50 84 L44 88 Z M62 76 L50 84 L56 88 Z"/>
    <path class="f" d="M38 90 L62 90 L62 100 L38 100 Z"/>`,
  apron: `<path class="hatch" d="${SHOULDERS}"/>
    <path class="f" d="M36 84 L64 84 L66 100 L34 100 Z"/>
    <path class="s" d="M38 84 L44 76 M62 84 L56 76"/><rect class="f" x="45" y="90" width="10" height="7"/>`,
  overalls: `<path class="hatch" d="${SHOULDERS}"/>
    <path class="d" d="M34 86 L66 86 L68 100 L32 100 Z"/>
    <path class="d" d="M34 86 L40 77 L44 77 L38 88 Z M66 86 L60 77 L56 77 L62 88 Z"/>
    <circle class="p" cx="38" cy="88" r="1.8"/><circle class="p" cx="62" cy="88" r="1.8"/>`,
  clergy: `<path class="d" d="${SHOULDERS}"/>
    <rect class="d" x="42" y="73" width="16" height="7"/><rect class="p" x="47" y="74" width="6" height="5"/>`,
};

export function makeLook(person) {
  const rng = new Rng(person.lookSeed);
  const role = ROLES.find((r) => r.id === person.role) || {};
  const f = person.gender === 'f';
  return {
    f,
    hair: rng.pick(f ? ['bob', 'bun', 'long', 'curly', 'waves'] : ['slick', 'part', 'bald', 'curly', 'wavy']),
    hat: role.hat || (rng.chance(f ? 0.15 : 0.3) ? rng.pick(f ? ['cloche', 'beret'] : ['bowler', 'fedora', 'flatcap']) : null),
    facial: f ? null : rng.chance(0.6) ? rng.pick(Object.keys(FACIAL)) : null,
    accessory: role.accessory || (rng.chance(0.2) ? rng.pick(['glasses', 'monocle']) : null),
    outfit: role.outfit || 'suit',
    brows: rng.int(BROWS.length),
    nose: rng.int(NOSES.length),
    mouth: f ? rng.int(LIPS.length) : rng.int(MOUTHS.length),
    earrings: f && rng.chance(0.5),
    rx: HEAD.rx + rng.range(-2, 2),
    ry: HEAD.ry + rng.range(-2, 2),
  };
}

export function portraitSvg(person, opts = {}) {
  if (person.species === 'alien') return alienPortraitSvg(person, opts);
  if (person.ghost) return ghostPortraitSvg(person, opts);
  return humanPortraitSvg(person, opts);
}

function wrapPortrait(parts, color) {
  const style = color ? ` style="--pc:${color}"` : '';
  return `<svg class="art portrait" viewBox="0 0 100 100" aria-hidden="true"${style}>${parts.join('')}</svg>`;
}

// Aliens: same ink-and-paper rules, different anatomy.
function alienPortraitSvg(person, { dead = false, color = null, tint = null } = {}) {
  const rng = new Rng(person.lookSeed);
  const head = rng.pick(['dome', 'tall', 'wide', 'squid']);
  const eyes = rng.pick([1, 2, 2, 3, 'stalks']);
  const antennae = eyes !== 'stalks' && rng.chance(0.6) ? rng.pick(['bobbles', 'curly']) : null;
  const mouth = rng.pick(['smile', 'fangs', 'o', 'flat']);
  const parts = [];
  if (tint) parts.push(`<rect width="100" height="100" fill="${tint}"/>`);
  parts.push(`<rect width="100" height="100" fill="url(#pt-halftone)" opacity="0.55"/>`);
  // space suit, coloured with the alien's ink
  parts.push(`<g class="outfit"><path class="d" d="M8 100 C12 82 30 77 50 77 C70 77 88 82 92 100 Z"/></g>
    <path class="f" d="M30 79 Q50 91 70 79 L70 84 Q50 96 30 84 Z"/><circle class="p" cx="64" cy="92" r="3"/><circle class="p" cx="36" cy="92" r="2"/>`);
  parts.push(`<path class="f" d="M44 64 L44 82 L56 82 L56 64 Z"/>`);
  let top = 22; // y of the top of the head, for antennae
  if (head === 'dome') { parts.push(`<ellipse class="f" cx="50" cy="44" rx="23" ry="25"/>`); top = 19; }
  else if (head === 'tall') { parts.push(`<path class="f" d="M50 8 C71 8 73 40 71 56 C69 70 59 74 50 74 C41 74 31 70 29 56 C27 40 29 8 50 8 Z"/>`); top = 8; }
  else if (head === 'wide') { parts.push(`<ellipse class="f" cx="50" cy="48" rx="31" ry="21"/>`); top = 27; }
  else {
    parts.push(`<path class="s" d="M38 62 C34 72 40 76 36 84 M46 66 C44 76 48 80 46 88 M54 66 C56 76 52 80 54 88 M62 62 C66 72 60 76 64 84"/>`);
    parts.push(`<ellipse class="f" cx="50" cy="42" rx="24" ry="24"/>`); top = 18;
  }
  parts.push(`<circle class="sh" cx="64" cy="54" r="5"/><circle class="t" cx="33" cy="38" r="2.5"/><circle class="t" cx="66" cy="34" r="2"/>`);
  if (antennae === 'bobbles') parts.push(`<path class="s" d="M42 ${top + 3} L34 ${top - 12} M58 ${top + 3} L66 ${top - 12}"/><circle class="d" cx="34" cy="${top - 14}" r="4"/><circle class="d" cx="66" cy="${top - 14}" r="4"/>`);
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
  return wrapPortrait(parts, color);
}

// The ghost: a bedsheet with ambitions.
function ghostPortraitSvg(person, { color = null, tint = null } = {}) {
  const parts = [];
  if (tint) parts.push(`<rect width="100" height="100" fill="${tint}"/>`);
  parts.push(`<rect width="100" height="100" fill="url(#pt-halftone)" opacity="0.4"/>`);
  parts.push(`<path class="t" d="M14 40 q-6 6 0 12 M86 40 q6 6 0 12 M10 62 q-5 5 0 10 M90 62 q5 5 0 10" opacity="0.7"/>`);
  parts.push(`<path class="f ghost-sheet" d="M24 92 C22 60 20 18 50 14 C80 18 78 60 76 92 C70 86 66 98 60 92 C55 86 50 98 44 92 C38 86 34 98 30 92 C28 90 26 90 24 92 Z"/>`);
  parts.push(`<g class="outfit"><path class="d" d="M30 74 Q50 82 70 74 L70 79 Q50 87 30 79 Z" opacity="0.85"/></g>`);
  parts.push(`<ellipse class="d" cx="41" cy="42" rx="5" ry="7.5"/><ellipse class="d" cx="59" cy="42" rx="5" ry="7.5"/>`);
  parts.push(`<ellipse class="d" cx="50" cy="60" rx="5" ry="6.5"/>`);
  parts.push(`<path class="sh" d="M66 30 C74 44 74 70 72 90 L66 92 C68 70 68 46 62 34 Z"/>`);
  return wrapPortrait(parts, color);
}

function humanPortraitSvg(person, { dead = false, color = null, tint = null } = {}) {
  const L = makeLook(person);
  const { cx, cy } = HEAD;
  const parts = [];
  if (tint) parts.push(`<rect x="0" y="0" width="100" height="100" fill="${tint}"/>`);
  parts.push(`<rect x="0" y="0" width="100" height="100" fill="url(#pt-halftone)" opacity="0.55"/>`);
  if (LONG_BACK.has(L.hair) && L.hat !== 'chef') parts.push(HAIR[L.hair]);
  parts.push(`<g class="outfit">${OUTFITS[L.outfit]}</g>`);
  parts.push(`<path class="f" d="M43 62 L43 78 Q50 81 57 78 L57 62 Z"/><path class="sh" d="M43 66 Q50 72 57 66 L57 70 Q50 75 43 70 Z"/>`);
  parts.push(`<circle class="f" cx="${cx - L.rx}" cy="${cy + 2}" r="4.5"/><circle class="f" cx="${cx + L.rx}" cy="${cy + 2}" r="4.5"/>`);
  if (L.earrings) parts.push(`<circle class="d" cx="${cx - L.rx}" cy="${cy + 8}" r="2"/><circle class="d" cx="${cx + L.rx}" cy="${cy + 8}" r="2"/>`);
  parts.push(`<ellipse class="f" cx="${cx}" cy="${cy}" rx="${L.rx}" ry="${L.ry}"/>`);
  parts.push(`<path class="t" d="M${cx - 6} ${cy + L.ry - 3} Q${cx} ${cy + L.ry - 1} ${cx + 6} ${cy + L.ry - 3}" opacity="0.6"/>`);
  // eyes
  if (dead) {
    parts.push(`<path class="s" d="M40 44 l6 6 M46 44 l-6 6 M54 44 l6 6 M60 44 l-6 6" style="stroke-width:2.6"/>`);
  } else {
    parts.push(`<ellipse class="d" cx="43" cy="47" rx="3.2" ry="4.6"/><ellipse class="d" cx="57" cy="47" rx="3.2" ry="4.6"/>
      <path class="p" d="M44.6 44 L42.6 45.6 L44.9 46.3 Z M58.6 44 L56.6 45.6 L58.9 46.3 Z"/>`);
    if (L.f) parts.push(`<path class="t" d="M39 43 l-2 -2 M41 41.5 l-1 -2.5 M61 43 l2 -2 M59 41.5 l1 -2.5"/>`);
  }
  parts.push(`<path class="s" d="${BROWS[L.brows]}"/>`);
  parts.push(NOSES[L.nose]);
  if (dead) parts.push('<path class="s" d="M44 63 Q47 61 50 63 Q53 65 56 63"/>');
  else parts.push(L.f ? LIPS[L.mouth] : MOUTHS[L.mouth]);
  if (L.facial) parts.push(FACIAL[L.facial]);
  if (L.accessory === 'glasses') {
    parts.push(`<circle class="s" cx="43" cy="47" r="6.5" style="stroke-width:2"/><circle class="s" cx="57" cy="47" r="6.5" style="stroke-width:2"/><path class="s" d="M49.5 47 Q50 45 50.5 47" style="stroke-width:2"/>`);
  } else if (L.accessory === 'monocle') {
    parts.push(`<circle class="s" cx="57" cy="47" r="7" style="stroke-width:2.2"/><path class="t" d="M63 51 Q66 66 60 76"/>`);
  }
  if (!LONG_BACK.has(L.hair) || L.hat) parts.push(L.hat && L.hair === 'long' ? HAIR.slick : HAIR[L.hair]);
  else parts.push(`<path class="d" d="M31 46 C28 26 40 22 50 22 C62 22 72 26 69 46 C64 36 58 32 50 32 C42 32 36 36 31 46 Z"/>`);
  if (L.hat) parts.push(HATS[L.hat]);
  const style = color ? ` style="--pc:${color}"` : '';
  return `<svg class="art portrait" viewBox="0 0 100 100" aria-hidden="true"${style}>${parts.join('')}</svg>`;
}

export function patternDefsSvg() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${PATTERN_DEFS}</defs></svg>`;
}
