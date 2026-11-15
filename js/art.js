// Furniture and scenery, drawn as flat colour cartoons with a dark outline (the look of the
// Murdoku books). Single pieces live in a 100x100 box, two-square pieces in 200x100 and the big
// rug in 200x200. Classes:
//   .o outline (ink stroke, fill given inline)   .o2 thinner outline   .s stroke only   .t thin stroke
//   .d ink fill   .n no outline   .sh soft shadow overlay   .hl white highlight stroke

// One palette, so every room and theme sits together.
const C = {
  wood: '#c98b55', woodD: '#a56a3a', woodL: '#e0ad7a',
  leaf: '#74c276', leafD: '#4e9f58', leafL: '#a4dd9c',
  blue: '#8db9e3', blueD: '#5c8fc9', blueL: '#c4dcf4',
  white: '#fffaf0', cream: '#f6e7c8',
  red: '#e0605a', redD: '#b9403d', pink: '#f1a6b6', rose: '#e58c9d',
  purple: '#a58bd3', purpleD: '#7e63b3', lilac: '#d5c6f0',
  gold: '#f3c24f', goldD: '#d79a2b', orange: '#f29b4b',
  stone: '#bdb8cb', stoneD: '#938ea8', stoneL: '#dedbe8',
  metal: '#aebbca', metalD: '#7c8b9d', dark: '#3d3852',
  teal: '#5dbcae', tealD: '#3b978a', cyan: '#bfe9ec',
  sand: '#ead29a', sandD: '#cfae6a', terra: '#d07d52', lapis: '#3f6fbf', turq: '#45b8b0',
  glow: '#a8f07a',
};

// ---------- floor patterns ----------

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
<pattern id="pt-dots" width="12" height="12" patternUnits="userSpaceOnUse">
  <circle class="ptd" cx="6" cy="6" r="1.5"/>
</pattern>
<pattern id="pt-cross" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <path class="pt" d="M0 7 H14 M7 0 V14"/>
</pattern>
<pattern id="pt-checker" width="50" height="50" patternUnits="userSpaceOnUse">
  <rect class="ptd" x="0" y="0" width="25" height="25" opacity="0.45"/>
  <rect class="ptd" x="25" y="25" width="25" height="25" opacity="0.45"/>
</pattern>
<pattern id="pt-hlines" width="10" height="10" patternUnits="userSpaceOnUse">
  <path class="pt" d="M0 5 H10"/>
</pattern>
<pattern id="pt-snow" width="44" height="44" patternUnits="userSpaceOnUse">
  <circle cx="8" cy="10" r="2.4" fill="#fff"/><circle cx="30" cy="26" r="2" fill="#fff"/><circle cx="17" cy="35" r="1.5" fill="#fff"/><circle cx="37" cy="7" r="1.4" fill="#fff"/>
  <path d="M3 24 q5 -4 10 0 M24 40 q5 -4 10 0" fill="none" stroke="#8fb0d4" stroke-width="1.4" opacity="0.45" stroke-linecap="round"/>
</pattern>
<pattern id="pt-halftone" width="7" height="7" patternUnits="userSpaceOnUse">
  <circle cx="3.5" cy="3.5" r="1.1" fill="#fff" opacity="0.5"/>
</pattern>
`;

export function patternDefsSvg() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${PATTERN_DEFS}</defs></svg>`;
}

// ---------- single-square furniture ----------

const OBJ = {
  // ----- the Manor -----
  chair: `
    <path class="s" d="M22 76 V87 M78 76 V87"/>
    <path class="o" fill="${C.blue}" d="M28 32 C28 15 72 15 72 32 L72 60 L28 60 Z"/>
    <circle class="n" fill="${C.blueD}" cx="40" cy="31" r="2.2"/><circle class="n" fill="${C.blueD}" cx="50" cy="29" r="2.2"/><circle class="n" fill="${C.blueD}" cx="60" cy="31" r="2.2"/>
    <circle class="n" fill="${C.blueD}" cx="45" cy="42" r="2.2"/><circle class="n" fill="${C.blueD}" cx="55" cy="42" r="2.2"/>
    <path class="o" fill="${C.blueL}" d="M17 46 C17 35 33 35 33 46 L33 77 L17 77 Z"/>
    <path class="o" fill="${C.blueL}" d="M67 46 C67 35 83 35 83 46 L83 77 L67 77 Z"/>
    <path class="o" fill="${C.blueL}" d="M32 60 C32 55 68 55 68 60 L68 77 L32 77 Z"/>
    <path class="sh" d="M69 48 L81 48 L81 75 L69 75 Z"/>`,
  bed: `
    <rect class="o" fill="${C.wood}" x="15" y="6" width="70" height="88" rx="6"/>
    <rect class="o" fill="${C.white}" x="20" y="16" width="60" height="73" rx="3"/>
    <rect class="o" fill="${C.white}" x="28" y="20" width="44" height="16" rx="8"/>
    <path class="o" fill="${C.blue}" d="M20 46 Q50 53 80 46 L80 89 L20 89 Z"/>
    <path class="n" fill="${C.blueL}" d="M20 46 Q50 53 80 46 L80 56 Q50 63 20 56 Z"/>
    <path class="t" d="M35 66 V86 M50 68 V88 M65 66 V86" opacity="0.5"/>`,
  rug: `
    <path class="t" d="M16 26 h-6 M16 34 h-6 M16 42 h-6 M16 50 h-6 M16 58 h-6 M16 66 h-6 M16 74 h-6 M84 26 h6 M84 34 h6 M84 42 h6 M84 50 h6 M84 58 h6 M84 66 h6 M84 74 h6"/>
    <rect class="o" fill="${C.purple}" x="16" y="20" width="68" height="60" rx="2"/>
    <rect class="n" fill="${C.lilac}" x="23" y="27" width="54" height="46"/>
    <path class="o2" fill="${C.gold}" d="M50 31 L70 50 L50 69 L30 50 Z"/>
    <circle class="n" fill="${C.red}" cx="50" cy="50" r="6"/>`,
  bench: `
    <path class="s" d="M22 26 V60 M78 26 V60"/>
    <rect class="o" fill="${C.wood}" x="12" y="23" width="76" height="10" rx="3"/>
    <rect class="o" fill="${C.wood}" x="12" y="38" width="76" height="10" rx="3"/>
    <rect class="o" fill="${C.woodL}" x="8" y="54" width="84" height="11" rx="3"/>
    <path class="s" d="M18 65 Q14 75 16 87 M82 65 Q86 75 84 87 M12 87 h9 M79 87 h9"/>`,
  tree: `
    <path class="o" fill="${C.woodD}" d="M43 93 L46 62 L54 62 L57 93 Z"/>
    <path class="o" fill="${C.leaf}" d="M50 6 C63 6 71 17 69 27 C82 29 86 46 75 54 C79 67 64 75 52 70 C40 76 23 68 27 55 C14 49 17 31 31 29 C29 17 37 6 50 6 Z"/>
    <path class="n" fill="${C.leafD}" d="M75 54 C79 67 64 75 52 70 C61 65 71 60 73 46 C77 48 77 52 75 54 Z"/>
    <path class="n" fill="${C.leafL}" d="M38 22 C42 16 50 15 54 20 C48 20 43 23 40 28 Z"/>
    <circle class="n" fill="${C.red}" cx="40" cy="46" r="3.4"/><circle class="n" fill="${C.red}" cx="60" cy="36" r="3.4"/><circle class="n" fill="${C.red}" cx="56" cy="58" r="3.4"/>`,
  bush: `
    <path class="o" fill="${C.leaf}" d="M13 80 C4 71 11 54 24 56 C24 39 43 35 49 46 C55 31 78 35 76 50 C90 50 96 71 86 80 Z"/>
    <path class="n" fill="${C.leafD}" d="M86 80 C96 71 90 50 76 50 C80 61 73 73 61 80 Z"/>
    <circle class="n" fill="${C.pink}" cx="30" cy="66" r="4"/><circle class="n" fill="${C.pink}" cx="50" cy="58" r="4"/><circle class="n" fill="${C.pink}" cx="66" cy="68" r="4"/><circle class="n" fill="${C.pink}" cx="42" cy="73" r="3"/>
    <path class="s" d="M9 81 H91"/>`,
  table: `
    <path class="s" d="M30 66 L27 91 M70 66 L73 91" stroke-width="4"/>
    <path class="o" fill="${C.white}" d="M11 42 C11 62 17 69 21 69 L79 69 C83 69 89 62 89 42 Z"/>
    <path class="sh" d="M68 46 L88 44 C88 60 83 67 79 69 L68 69 Z"/>
    <ellipse class="o" fill="${C.woodL}" cx="50" cy="42" rx="39" ry="11"/>
    <rect class="o" fill="${C.white}" x="46" y="20" width="8" height="20" rx="1"/>
    <path class="o2" fill="${C.gold}" d="M50 7 C55 13 54 19 50 21 C46 19 45 13 50 7 Z"/>`,
  shelf: `
    <rect class="o" fill="${C.woodD}" x="15" y="5" width="70" height="90" rx="2"/>
    <rect class="n" fill="${C.cream}" x="20" y="10" width="60" height="23"/><rect class="n" fill="${C.cream}" x="20" y="38" width="60" height="23"/><rect class="n" fill="${C.cream}" x="20" y="66" width="60" height="24"/>
    <rect class="o2" fill="${C.red}" x="22" y="12" width="7" height="21"/><rect class="o2" fill="${C.blue}" x="29" y="15" width="7" height="18"/>
    <rect class="o2" fill="${C.gold}" x="36" y="11" width="6" height="22"/><rect class="o2" fill="${C.leaf}" x="42" y="14" width="8" height="19"/>
    <path class="o2" fill="${C.purple}" d="M53 33 L60 14 L66 16 L59 33 Z"/><rect class="o2" fill="${C.teal}" x="69" y="13" width="8" height="20"/>
    <rect class="o2" fill="${C.teal}" x="22" y="43" width="8" height="18"/><rect class="o2" fill="${C.red}" x="30" y="40" width="6" height="21"/>
    <rect class="o2" fill="${C.purple}" x="36" y="42" width="9" height="19"/><rect class="o2" fill="${C.gold}" x="49" y="44" width="7" height="17"/>
    <rect class="o2" fill="${C.blue}" x="56" y="40" width="6" height="21"/><rect class="o2" fill="${C.leaf}" x="62" y="43" width="14" height="18"/>
    <rect class="o2" fill="${C.gold}" x="22" y="70" width="7" height="20"/><rect class="o2" fill="${C.blue}" x="29" y="72" width="8" height="18"/>
    <rect class="o2" fill="${C.red}" x="44" y="76" width="22" height="7"/><rect class="o2" fill="${C.purple}" x="44" y="83" width="24" height="7"/>
    <rect class="o2" fill="${C.leaf}" x="71" y="70" width="6" height="20"/>`,
  plant: `
    <path class="o" fill="${C.leaf}" d="M50 60 C40 44 22 40 11 42 C24 46 34 52 44 62 Z"/>
    <path class="o" fill="${C.leaf}" d="M50 60 C60 44 78 40 89 42 C76 46 66 52 56 62 Z"/>
    <path class="o" fill="${C.leafL}" d="M50 60 C38 36 34 20 40 7 C46 22 52 40 52 60 Z"/>
    <path class="o" fill="${C.leafD}" d="M50 60 C62 36 70 24 66 11 C58 26 50 40 48 60 Z"/>
    <path class="o" fill="${C.terra}" d="M32 62 L68 62 L62 93 L38 93 Z"/>
    <path class="sh" d="M56 62 L68 62 L62 93 L54 93 Z"/>
    <rect class="o" fill="${C.terra}" x="28" y="57" width="44" height="8" rx="2"/>`,
  piano: `
    <path class="s" d="M16 70 V93 M84 70 V93 M11 93 h10 M79 93 h10" stroke-width="4"/>
    <rect class="o" fill="${C.dark}" x="11" y="9" width="78" height="48" rx="3"/>
    <rect class="n" fill="#57506f" x="15" y="13" width="70" height="11"/>
    <path class="hl" d="M30 36 q6 -6 12 0 q6 6 12 0 q6 -6 12 0"/>
    <rect class="o" fill="${C.white}" x="7" y="56" width="86" height="15" rx="2"/>
    <path class="t" d="M17 56 V71 M26 56 V71 M35 56 V71 M44 56 V71 M53 56 V71 M62 56 V71 M71 56 V71 M80 56 V71"/>
    <rect class="d" x="14" y="56" width="5" height="9"/><rect class="d" x="23" y="56" width="5" height="9"/><rect class="d" x="41" y="56" width="5" height="9"/>
    <rect class="d" x="50" y="56" width="5" height="9"/><rect class="d" x="59" y="56" width="5" height="9"/><rect class="d" x="77" y="56" width="5" height="9"/>`,
  stove: `
    <rect class="o" fill="${C.metalD}" x="61" y="3" width="11" height="22"/>
    <rect class="o" fill="${C.metal}" x="13" y="23" width="74" height="68" rx="4"/>
    <rect class="o" fill="${C.dark}" x="13" y="23" width="74" height="12" rx="3"/>
    <ellipse class="n" fill="${C.red}" cx="32" cy="29" rx="9" ry="3"/><ellipse class="n" fill="${C.red}" cx="68" cy="29" rx="9" ry="3"/>
    <rect class="o" fill="${C.stoneL}" x="23" y="44" width="54" height="36" rx="3"/>
    <rect class="o2" fill="${C.orange}" x="30" y="50" width="40" height="19" rx="2"/>
    <path class="n" fill="${C.gold}" d="M40 69 C38 60 46 60 44 53 C52 58 50 64 56 60 C58 64 58 67 57 69 Z"/>
    <path class="s" d="M36 75 H64"/><path class="s" d="M20 91 v4 M80 91 v4"/>`,
  sofa: `
    <path class="s" d="M18 78 V88 M82 78 V88"/>
    <path class="o" fill="${C.rose}" d="M16 34 C16 20 84 20 84 34 L84 60 L16 60 Z"/>
    <path class="o" fill="${C.pink}" d="M8 48 C8 38 22 38 22 48 L22 79 L8 79 Z"/>
    <path class="o" fill="${C.pink}" d="M78 48 C78 38 92 38 92 48 L92 79 L78 79 Z"/>
    <path class="o" fill="${C.pink}" d="M21 60 H79 V79 H21 Z"/><path class="t" d="M50 60 V79"/>
    <path class="sh" d="M80 50 L90 50 L90 77 L80 77 Z"/>`,
  fountain: `
    <ellipse class="o" fill="${C.stone}" cx="50" cy="74" rx="40" ry="16"/>
    <ellipse class="o" fill="${C.blue}" cx="50" cy="71" rx="33" ry="11"/>
    <path class="hl" d="M28 70 q6 -4 12 0 M58 73 q6 -4 12 0"/>
    <path class="o" fill="${C.stoneL}" d="M44 72 L46 44 H54 L56 72 Z"/>
    <ellipse class="o" fill="${C.stone}" cx="50" cy="43" rx="18" ry="6"/>
    <ellipse class="n" fill="${C.blue}" cx="50" cy="42" rx="13" ry="3.5"/>
    <path class="s" d="M50 40 V22 M50 24 C42 18 36 26 36 36 M50 24 C58 18 64 26 64 36" style="stroke:${C.blueD}"/>
    <circle class="n" fill="${C.blueL}" cx="50" cy="19" r="4"/>`,
  fireplace: `
    <rect class="o" fill="${C.stoneL}" x="8" y="12" width="84" height="12" rx="2"/>
    <path class="o" fill="${C.terra}" d="M14 24 H86 V92 H14 Z"/>
    <path class="t" d="M14 40 H86 M14 56 H30 M70 56 H86 M14 72 H30 M70 72 H86 M34 24 V40 M60 24 V40 M22 40 V56 M78 40 V56" opacity="0.55"/>
    <path class="o" fill="${C.dark}" d="M30 92 V60 C30 44 70 44 70 60 V92 Z"/>
    <path class="o2" fill="${C.orange}" d="M38 90 C34 76 44 76 42 64 C52 70 50 78 56 72 C62 78 64 84 62 90 Z"/>
    <path class="n" fill="${C.gold}" d="M45 90 C43 82 49 82 48 75 C54 79 53 84 56 82 C58 85 58 88 57 90 Z"/>`,
  barrel: `
    <path class="o" fill="${C.wood}" d="M26 10 H74 C86 30 86 70 74 90 H26 C14 70 14 30 26 10 Z"/>
    <path class="t" d="M38 10 C32 30 32 70 38 90 M50 10 V90 M62 10 C68 30 68 70 62 90" opacity="0.6"/>
    <path class="o" fill="${C.metalD}" d="M20 26 H80 L82 34 H18 Z"/><path class="o" fill="${C.metalD}" d="M18 66 H82 L80 74 H20 Z"/>
    <circle class="o2" fill="${C.dark}" cx="50" cy="50" r="5"/>`,

  // ----- Outpost Zeta-9 -----
  hoverchair: `
    <ellipse class="n" fill="${C.glow}" cx="50" cy="88" rx="26" ry="5" opacity="0.7"/>
    <path class="o" fill="${C.teal}" d="M28 30 C28 13 72 13 72 30 L72 55 L28 55 Z"/>
    <path class="o" fill="${C.cyan}" d="M17 42 C17 32 31 32 31 42 L31 65 L17 65 Z"/>
    <path class="o" fill="${C.cyan}" d="M69 42 C69 32 83 32 83 42 L83 65 L69 65 Z"/>
    <path class="o" fill="${C.cyan}" d="M30 55 C30 51 70 51 70 55 L70 65 L30 65 Z"/>
    <path class="o" fill="${C.metalD}" d="M24 65 L76 65 L68 74 L32 74 Z"/>
    <circle class="n" fill="${C.glow}" cx="50" cy="28" r="4"/>`,
  sleeppod: `
    <path class="s" d="M24 76 L20 89 M76 76 L80 89"/>
    <rect class="o" fill="${C.white}" x="7" y="31" width="86" height="46" rx="23"/>
    <path class="o" fill="${C.cyan}" d="M27 56 C27 37 73 37 73 56 Z"/>
    <path class="n" fill="${C.white}" d="M36 50 C38 43 46 41 52 42 C44 44 40 47 39 52 Z" opacity="0.8"/>
    <path class="s" d="M8 62 H92"/>
    <circle class="n" fill="${C.glow}" cx="19" cy="54" r="3.5"/><circle class="n" fill="${C.red}" cx="81" cy="54" r="3.5"/>`,
  grate: `
    <rect class="o" fill="${C.metal}" x="13" y="13" width="74" height="74" rx="6"/>
    <path class="s" d="M28 26 V74 M40 26 V74 M52 26 V74 M64 26 V74 M76 26 V74" style="stroke:${C.dark};stroke-width:5"/>
    <circle class="d" cx="20" cy="20" r="2.6"/><circle class="d" cx="80" cy="20" r="2.6"/><circle class="d" cx="20" cy="80" r="2.6"/><circle class="d" cx="80" cy="80" r="2.6"/>`,
  specimen: `
    <rect class="o" fill="${C.dark}" x="21" y="5" width="58" height="10" rx="3"/>
    <rect class="o" fill="${C.cyan}" x="25" y="15" width="50" height="69"/>
    <path class="n" fill="${C.teal}" d="M27 36 H73 V82 H27 Z" opacity="0.55"/>
    <path class="o" fill="${C.glow}" d="M40 68 C35 52 45 42 52 47 C60 42 67 56 61 68 C67 74 58 80 50 75 C42 80 33 74 40 68 Z"/>
    <circle class="d" cx="47" cy="57" r="2.8"/><circle class="d" cx="56" cy="58" r="2.8"/>
    <circle class="n" fill="${C.white}" cx="36" cy="27" r="3"/><circle class="n" fill="${C.white}" cx="62" cy="23" r="3.5"/><circle class="n" fill="${C.white}" cx="58" cy="32" r="2"/>
    <rect class="o" fill="${C.dark}" x="19" y="84" width="62" height="10" rx="3"/>`,
  console: `
    <rect class="o" fill="${C.dark}" x="29" y="6" width="42" height="29" rx="4"/>
    <rect class="n" fill="#1f3b3a" x="33" y="10" width="34" height="21" rx="2"/>
    <path class="s" d="M36 24 l6 -6 6 8 6 -10 6 7" style="stroke:${C.glow};stroke-width:2.4"/>
    <path class="o" fill="${C.metal}" d="M9 62 L24 34 L76 34 L91 62 Z"/>
    <circle class="o2" fill="${C.red}" cx="30" cy="48" r="4.5"/><circle class="o2" fill="${C.gold}" cx="43" cy="48" r="4.5"/>
    <rect class="o2" fill="${C.glow}" x="54" y="44" width="19" height="8" rx="3"/>
    <rect class="o" fill="${C.metalD}" x="9" y="62" width="82" height="27" rx="2"/>
    <path class="hl" d="M20 72 h22 M20 80 h13"/>`,
  crate: `
    <rect class="o" fill="${C.goldD}" x="11" y="14" width="78" height="11" rx="2"/>
    <rect class="o" fill="${C.gold}" x="13" y="25" width="74" height="64"/>
    <rect class="o2" fill="${C.orange}" x="21" y="33" width="58" height="48"/>
    <path class="s" d="M21 33 L79 81 M79 33 L21 81"/>
    <path class="sh" d="M72 25 h15 v64 h-15z"/>`,
  reactor: `
    <path class="s" d="M17 30 h11 M17 72 h11 M72 30 h11 M72 72 h11" stroke-width="4"/>
    <rect class="o" fill="${C.metal}" x="29" y="11" width="42" height="80" rx="10"/>
    <ellipse class="o" fill="${C.metalD}" cx="50" cy="13" rx="21" ry="6"/>
    <rect class="o2" fill="${C.dark}" x="36" y="25" width="28" height="58" rx="7"/>
    <circle class="o2" fill="${C.glow}" cx="50" cy="53" r="14"/>
    <path class="d" d="M50 53 L43 42 A13 13 0 0 1 57 42 Z M50 53 L63 55 A13 13 0 0 1 57 64 Z M50 53 L43 64 A13 13 0 0 1 37 55 Z"/>`,
  hydro: `
    <path class="o" fill="${C.leaf}" d="M30 62 C25 44 29 30 36 22 C40 34 39 50 37 62 Z"/>
    <path class="o" fill="${C.leafD}" d="M50 62 C49 40 56 30 64 25 C62 40 58 52 57 62 Z"/>
    <path class="o" fill="${C.leafL}" d="M66 62 C68 52 75 45 84 44 C81 53 76 58 73 62 Z"/>
    <circle class="o2" fill="${C.pink}" cx="36" cy="19" r="7"/><circle class="o2" fill="${C.purple}" cx="64" cy="22" r="6"/>
    <path class="o" fill="${C.white}" d="M11 62 L89 62 L83 91 L17 91 Z"/>
    <path class="n" fill="${C.cyan}" d="M14 66 H86 L85 72 H15 Z"/>
    <path class="sh" d="M66 73 h19 l-4 17 h-15z"/>`,

  // ----- Hollow Hill House -----
  pew: `
    <path class="s" d="M14 66 V91 M86 66 V91" stroke-width="4"/>
    <rect class="o" fill="${C.woodD}" x="9" y="15" width="82" height="40" rx="5"/>
    <path class="hl" d="M15 29 H85" opacity="0.5"/>
    <circle class="o2" fill="${C.gold}" cx="50" cy="40" r="7"/><path class="s" d="M50 36 V44 M46.5 39 H53.5" stroke-width="2"/>
    <rect class="o" fill="${C.wood}" x="5" y="54" width="90" height="13" rx="3"/>`,
  coffin: `
    <path class="o" fill="${C.woodD}" d="M36 5 L64 5 L79 30 L67 95 L33 95 L21 30 Z"/>
    <path class="sh" d="M60 9 L74 30 L63 91 L55 91 Z"/>
    <path class="s" d="M50 28 V66 M39 41 H61" style="stroke:${C.gold};stroke-width:5"/>`,
  wardrobe: `
    <path class="o" fill="${C.woodD}" d="M10 6 H90 V17 H10 Z"/>
    <rect class="o" fill="${C.wood}" x="16" y="17" width="68" height="76"/>
    <path class="s" d="M50 20 V90"/>
    <rect class="o2" fill="${C.woodL}" x="22" y="25" width="22" height="60"/><rect class="o2" fill="${C.woodL}" x="56" y="25" width="22" height="60"/>
    <circle class="o2" fill="${C.gold}" cx="46" cy="55" r="3"/><circle class="o2" fill="${C.gold}" cx="54" cy="55" r="3"/>
    <path class="sh" d="M68 20 h13 v70 h-13z"/>`,
  clock: `
    <rect class="o" fill="${C.woodD}" x="30" y="4" width="40" height="38" rx="11"/>
    <circle class="o" fill="${C.white}" cx="50" cy="23" r="13"/>
    <path class="s" d="M50 23 V14 M50 23 L57 27" stroke-width="2.4"/>
    <rect class="o" fill="${C.wood}" x="35" y="42" width="30" height="44"/>
    <rect class="n" fill="${C.dark}" x="40" y="46" width="20" height="34" rx="2"/>
    <path class="s" d="M50 46 V68" style="stroke:${C.gold};stroke-width:2.4"/><circle class="o2" fill="${C.gold}" cx="50" cy="72" r="6"/>
    <rect class="o" fill="${C.woodD}" x="28" y="86" width="44" height="10" rx="2"/>`,
  candelabra: `
    <path class="s" d="M50 86 V46 M30 50 Q30 62 50 62 Q70 62 70 50 M30 50 V42 M70 50 V42" style="stroke:${C.goldD};stroke-width:5"/>
    <path class="o" fill="${C.gold}" d="M35 93 H65 L58 82 H42 Z"/>
    <rect class="o2" fill="${C.white}" x="25.5" y="27" width="9" height="16"/><rect class="o2" fill="${C.white}" x="45.5" y="19" width="9" height="28"/><rect class="o2" fill="${C.white}" x="65.5" y="27" width="9" height="16"/>
    <path class="o2" fill="${C.orange}" d="M30 11 C34.5 17 34.5 22 30 25 C25.5 22 25.5 17 30 11 Z M50 3 C54.5 9 54.5 14 50 17 C45.5 14 45.5 9 50 3 Z M70 11 C74.5 17 74.5 22 70 25 C65.5 22 65.5 17 70 11 Z"/>`,
  mirror: `
    <path class="s" d="M50 74 V87 M32 94 L50 86 L68 94" stroke-width="4"/>
    <ellipse class="o" fill="${C.gold}" cx="50" cy="40" rx="29" ry="35"/>
    <ellipse class="o2" fill="${C.blueL}" cx="50" cy="40" rx="21" ry="27"/>
    <path class="hl" d="M39 24 L55 48 M46 19 L60 40" stroke-width="3"/>`,
  gravestone: `
    <path class="o" fill="${C.stone}" d="M23 89 V40 C23 14 77 14 77 40 V89 Z"/>
    <path class="n" fill="${C.stoneD}" d="M64 23 C73 29 77 37 77 46 V89 H67 Z" opacity="0.6"/>
    <path class="s" d="M38 43 H62 M38 54 H58 M38 65 H54" style="stroke:${C.stoneD};stroke-width:3"/>
    <path class="o2" fill="${C.leaf}" d="M10 91 L16 80 L20 88 L25 79 L29 91 Z M72 91 L77 81 L81 88 L86 80 L90 91 Z"/>
    <path class="s" d="M8 91 H92"/>`,

  // ----- Sands of Egypt -----
  throne: `
    <path class="o" fill="${C.gold}" d="M30 6 H70 L74 58 H26 Z"/>
    <path class="o2" fill="${C.turq}" d="M37 14 H63 L65 50 H35 Z"/>
    <circle class="o2" fill="${C.red}" cx="50" cy="28" r="6"/>
    <path class="o" fill="${C.goldD}" d="M16 44 H30 V82 H16 Z"/><path class="o" fill="${C.goldD}" d="M70 44 H84 V82 H70 Z"/>
    <path class="o" fill="${C.red}" d="M30 58 H70 V72 H30 Z"/>
    <path class="o" fill="${C.gold}" d="M24 72 H76 V84 H24 Z"/>
    <path class="s" d="M26 84 V94 M74 84 V94" stroke-width="5"/>`,
  mat: `
    <path class="t" d="M14 28 h-5 M14 40 h-5 M14 52 h-5 M14 64 h-5 M14 76 h-5 M86 28 h5 M86 40 h5 M86 52 h5 M86 64 h5 M86 76 h5"/>
    <rect class="o" fill="${C.sand}" x="14" y="20" width="72" height="62" rx="3"/>
    <path class="s" d="M14 32 H86 M14 44 H86 M14 56 H86 M14 68 H86" style="stroke:${C.sandD};stroke-width:3"/>
    <path class="s" d="M32 20 V82 M68 20 V82" style="stroke:${C.terra};stroke-width:4"/>`,
  boat: `
    <path class="n" fill="${C.blue}" d="M4 74 q8 -7 16 0 q8 7 16 0 q8 -7 16 0 q8 7 16 0 q8 -7 16 0 q8 7 12 2 V92 H4 Z"/>
    <path class="o" fill="${C.sand}" d="M8 50 C22 66 78 66 92 50 C90 76 70 80 50 80 C30 80 10 76 8 50 Z"/>
    <path class="s" d="M24 62 V78 M38 66 V80 M62 66 V80 M76 62 V78" style="stroke:${C.sandD};stroke-width:3"/>
    <path class="o" fill="${C.sand}" d="M8 50 C2 44 4 34 12 32 C10 40 12 46 16 52 Z"/><path class="o" fill="${C.sand}" d="M92 50 C98 44 96 34 88 32 C90 40 88 46 84 52 Z"/>`,
  sarcophagus: `
    <path class="o" fill="${C.gold}" d="M34 6 C40 2 60 2 66 6 L76 30 L68 94 H32 L24 30 Z"/>
    <path class="o2" fill="${C.lapis}" d="M36 10 C42 6 58 6 64 10 L70 30 L64 44 H36 L30 30 Z"/>
    <ellipse class="o2" fill="${C.sand}" cx="50" cy="26" rx="10" ry="12"/>
    <circle class="d" cx="46" cy="25" r="1.8"/><circle class="d" cx="54" cy="25" r="1.8"/><path class="t" d="M47 31 Q50 33 53 31"/>
    <path class="s" d="M33 54 H67 M34 66 H66 M35 78 H65" style="stroke:${C.lapis};stroke-width:5"/>
    <path class="s" d="M40 48 L60 48" style="stroke:${C.red};stroke-width:4"/>`,
  urn: `
    <path class="s" d="M36 30 C20 30 20 52 32 54 M64 30 C80 30 80 52 68 54" stroke-width="5"/>
    <path class="s" d="M36 30 C20 30 20 52 32 54 M64 30 C80 30 80 52 68 54" style="stroke:${C.terra};stroke-width:2.4"/>
    <path class="o" fill="${C.terra}" d="M40 18 H60 V30 C76 38 80 62 66 84 L60 92 H40 L34 84 C20 62 24 38 40 30 Z"/>
    <path class="o" fill="${C.cream}" d="M36 12 H64 V20 H36 Z"/>
    <path class="n" fill="${C.cream}" d="M27 52 C27 58 28 62 30 66 H70 C72 62 73 58 73 52 Z"/>
    <path class="s" d="M26 52 H74 M29 66 H71" style="stroke-width:2.2"/>
    <path class="s" d="M32 59 l5 -5 5 5 5 -5 5 5 5 -5 5 5 5 -5" style="stroke:${C.lapis};stroke-width:2.4"/>
    <path class="sh" d="M60 30 C76 38 80 62 66 84 L60 92 H54 C68 74 68 44 56 30 Z"/>
    <rect class="o" fill="${C.woodD}" x="36" y="90" width="28" height="6" rx="2"/>`,
  statue: `
    <rect class="o" fill="${C.stoneD}" x="18" y="80" width="64" height="14" rx="2"/>
    <path class="o" fill="${C.stone}" d="M30 80 V52 C30 44 38 42 42 42 H58 C62 42 70 44 70 52 V80 Z"/>
    <path class="o" fill="${C.stoneL}" d="M30 26 C30 10 70 10 70 26 L74 46 H26 Z"/>
    <path class="t" d="M32 22 L28 44 M38 16 L34 44 M68 22 L72 44 M62 16 L66 44" opacity="0.6"/>
    <ellipse class="o" fill="${C.stone}" cx="50" cy="30" rx="11" ry="13"/>
    <circle class="d" cx="46" cy="29" r="1.8"/><circle class="d" cx="54" cy="29" r="1.8"/><path class="t" d="M46 36 H54"/>
    <path class="o2" fill="${C.stoneL}" d="M47 42 H53 V54 H47 Z"/>
    <path class="sh" d="M60 44 C66 44 70 46 70 52 V80 H60 Z"/>`,
  obelisk: `
    <rect class="o" fill="${C.stoneD}" x="26" y="84" width="48" height="11" rx="2"/>
    <path class="o" fill="${C.sand}" d="M38 84 L42 20 H58 L62 84 Z"/>
    <path class="o" fill="${C.gold}" d="M42 20 L50 4 L58 20 Z"/>
    <path class="sh" d="M52 20 H58 L62 84 H53 Z"/>
    <path class="s" d="M46 32 h5 M45 42 h7 M46 52 l4 5 l3 -5 M45 66 h8 M46 75 h5" style="stroke:${C.terra};stroke-width:2.6"/>`,
  palm: `
    <path class="o" fill="${C.woodD}" d="M44 94 C46 74 44 58 50 40 L57 42 C53 60 56 76 56 94 Z"/>
    <path class="t" d="M45 82 h10 M46 70 h9 M47 58 h8 M49 48 h7" opacity="0.6"/>
    <path class="o" fill="${C.leaf}" d="M52 40 C40 26 22 26 10 36 C26 34 38 38 48 46 Z"/>
    <path class="o" fill="${C.leafD}" d="M52 40 C64 26 82 26 92 38 C76 34 66 38 56 46 Z"/>
    <path class="o" fill="${C.leafL}" d="M52 40 C46 22 32 10 18 10 C32 18 40 30 46 44 Z"/>
    <path class="o" fill="${C.leaf}" d="M52 40 C58 22 72 10 86 12 C72 18 64 30 58 44 Z"/>
    <path class="o" fill="${C.leafD}" d="M52 42 C50 26 52 12 50 4 C58 14 58 30 56 42 Z"/>
    <circle class="o2" fill="${C.orange}" cx="47" cy="47" r="4"/><circle class="o2" fill="${C.orange}" cx="56" cy="49" r="4"/>`,
  brazier: `
    <path class="s" d="M36 62 L26 93 M64 62 L74 93 M50 62 V93" stroke-width="4"/>
    <path class="o2" fill="${C.orange}" d="M34 46 C28 28 42 28 40 12 C52 22 50 32 58 22 C68 30 70 40 66 46 Z"/>
    <path class="n" fill="${C.gold}" d="M42 46 C39 36 48 34 47 25 C55 31 54 38 58 36 C61 40 60 44 59 46 Z"/>
    <path class="o" fill="${C.goldD}" d="M22 46 H78 C78 60 66 66 50 66 C34 66 22 60 22 46 Z"/>
    <path class="hl" d="M30 52 C36 58 44 60 50 60" opacity="0.6"/>`,
  chest: `
    <path class="o" fill="${C.woodD}" d="M12 44 C12 22 88 22 88 44 Z"/>
    <path class="n" fill="${C.gold}" d="M22 44 C30 30 42 36 50 28 C58 36 70 30 78 44 Z"/>
    <circle class="o2" fill="${C.red}" cx="38" cy="38" r="4.5"/><circle class="o2" fill="${C.turq}" cx="60" cy="37" r="4.5"/><circle class="o2" fill="${C.gold}" cx="49" cy="33" r="4"/>
    <rect class="o" fill="${C.wood}" x="10" y="44" width="80" height="44" rx="3"/>
    <path class="s" d="M26 44 V88 M74 44 V88" style="stroke:${C.goldD};stroke-width:6"/>
    <rect class="o2" fill="${C.gold}" x="43" y="52" width="14" height="16" rx="3"/><circle class="d" cx="50" cy="59" r="2.4"/>`,
  pillar: `
    <rect class="o" fill="${C.stoneD}" x="22" y="84" width="56" height="11" rx="2"/>
    <rect class="o" fill="${C.cream}" x="32" y="30" width="36" height="54"/>
    <path class="s" d="M32 42 H68" style="stroke:${C.lapis};stroke-width:6"/><path class="s" d="M32 54 H68" style="stroke:${C.red};stroke-width:5"/><path class="s" d="M32 66 H68" style="stroke:${C.gold};stroke-width:5"/>
    <path class="o" fill="${C.turq}" d="M32 30 C22 24 18 14 20 6 H80 C82 14 78 24 68 30 Z"/>
    <path class="t" d="M34 8 C36 18 40 24 44 28 M50 8 V28 M66 8 C64 18 60 24 56 28" opacity="0.6"/>
    <path class="sh" d="M58 30 h10 v54 h-10z"/>`,
  scrolls: `
    <rect class="o" fill="${C.woodD}" x="12" y="10" width="76" height="82" rx="3"/>
    <rect class="n" fill="${C.wood}" x="17" y="15" width="66" height="22"/><rect class="n" fill="${C.wood}" x="17" y="41" width="66" height="22"/><rect class="n" fill="${C.wood}" x="17" y="67" width="66" height="20"/>
    <circle class="o2" fill="${C.cream}" cx="28" cy="26" r="8"/><circle class="o2" fill="${C.cream}" cx="46" cy="27" r="8"/><circle class="o2" fill="${C.cream}" cx="66" cy="26" r="8"/>
    <circle class="o2" fill="${C.cream}" cx="34" cy="52" r="8"/><circle class="o2" fill="${C.cream}" cx="56" cy="53" r="8"/><circle class="o2" fill="${C.cream}" cx="73" cy="52" r="7"/>
    <circle class="o2" fill="${C.cream}" cx="27" cy="77" r="7.5"/><circle class="o2" fill="${C.cream}" cx="48" cy="77" r="7.5"/><circle class="o2" fill="${C.cream}" cx="68" cy="77" r="7.5"/>
    <circle class="n" fill="${C.red}" cx="28" cy="26" r="2.4"/><circle class="n" fill="${C.lapis}" cx="46" cy="27" r="2.4"/><circle class="n" fill="${C.red}" cx="56" cy="53" r="2.4"/><circle class="n" fill="${C.lapis}" cx="48" cy="77" r="2.4"/>`,

  // ----- the North Pole -----
  stool: `
    <path class="s" d="M32 58 L25 90 M68 58 L75 90 M50 60 V88 M29 76 H71"/>
    <ellipse class="o" fill="${C.wood}" cx="50" cy="50" rx="31" ry="12"/>
    <ellipse class="n" fill="${C.woodL}" cx="50" cy="48" rx="22" ry="6.5"/>`,
  hay: `
    <rect class="o" fill="${C.gold}" x="10" y="30" width="80" height="54" rx="7"/>
    <path class="t" d="M12 47 H88 M12 66 H88 M24 34 V44 M50 50 V62 M70 70 V80 M36 70 V80" opacity="0.5"/>
    <rect class="o2" fill="${C.woodD}" x="28" y="28" width="8" height="58"/><rect class="o2" fill="${C.woodD}" x="64" y="28" width="8" height="58"/>
    <path class="t" d="M14 30 l-5 -6 M86 30 l6 -5 M48 30 l1 -8 M12 84 l-5 6 M88 84 l5 5"/>`,
  sledge: `
    <path class="s" d="M12 80 H76 C92 80 92 62 80 62" style="stroke-width:5"/>
    <path class="s" d="M28 80 V62 M62 80 V62"/>
    <path class="o" fill="${C.red}" d="M10 48 H74 C82 48 84 62 76 62 H10 Z"/>
    <path class="t" d="M26 48 V62 M42 48 V62 M58 48 V62"/>
    <path class="hl" d="M16 53 H68"/>`,
  sleigh: `
    <path class="s" d="M12 88 H72 C90 88 92 72 82 70" style="stroke:${C.goldD};stroke-width:5"/>
    <path class="s" d="M30 88 V74 M60 88 V74"/>
    <path class="o" fill="${C.red}" d="M10 42 C10 28 23 26 27 35 L31 52 H61 L69 30 C73 20 89 23 87 36 L80 66 C78 72 72 75 66 75 H24 C14 75 10 66 10 56 Z"/>
    <path class="n" fill="${C.redD}" d="M31 52 H61 L58 63 H34 Z"/>
    <path class="s" d="M15 44 C21 49 23 57 21 67" style="stroke:${C.gold};stroke-width:3"/>
    <circle class="o2" fill="${C.gold}" cx="78" cy="40" r="4.5"/>`,
  xtree: `
    <rect class="o" fill="${C.woodD}" x="44" y="80" width="12" height="13"/>
    <path class="o" fill="${C.leafD}" d="M50 12 L68 37 H60 L76 59 H66 L85 83 H15 L34 59 H24 L40 37 H32 Z"/>
    <path class="s" d="M37 41 Q50 49 63 39 M29 63 Q50 74 71 61" style="stroke:${C.gold};stroke-width:2.8"/>
    <circle class="o2" fill="${C.red}" cx="46" cy="31" r="4"/><circle class="o2" fill="${C.red}" cx="60" cy="53" r="4"/><circle class="o2" fill="${C.red}" cx="34" cy="74" r="4"/>
    <circle class="o2" fill="${C.blueL}" cx="44" cy="56" r="4"/><circle class="o2" fill="${C.blueL}" cx="66" cy="74" r="4"/><circle class="o2" fill="${C.gold}" cx="52" cy="75" r="4"/>
    <path class="o2" fill="${C.gold}" d="M50 1 L52.800 8 L60 8.600 L54.500 13.300 L56.200 20.400 L50 16.500 L43.800 20.400 L45.500 13.300 L40 8.600 L47.200 8 Z"/>`,
  pine: `
    <rect class="o" fill="${C.woodD}" x="45" y="78" width="10" height="15"/>
    <path class="o" fill="${C.tealD}" d="M50 7 L70 41 H61 L82 81 H18 L39 41 H30 Z"/>
    <path class="o2" fill="${C.white}" d="M50 7 L61 26 C57 30 54 24 50 28 C46 24 43 30 39 26 Z"/>
    <path class="o2" fill="${C.white}" d="M39 41 L34 51 C40 56 45 49 50 53 C55 49 60 56 66 51 L61 41 Z"/>
    <path class="o2" fill="${C.white}" d="M18 81 C24 72 31 80 38 74 C44 80 54 72 61 78 C68 72 76 78 82 81 Z"/>`,
  snowman: `
    <path class="s" d="M28 62 L9 49 M14 52 l-1 -8 M72 62 L91 49 M86 52 l1 -8" style="stroke:${C.woodD}"/>
    <circle class="o" fill="${C.white}" cx="50" cy="68" r="24"/>
    <circle class="o" fill="${C.white}" cx="50" cy="36" r="16"/>
    <rect class="o" fill="${C.dark}" x="40" y="5" width="20" height="17"/><rect class="o" fill="${C.dark}" x="33" y="20" width="34" height="5" rx="2"/>
    <rect class="n" fill="${C.red}" x="41.500" y="15" width="17" height="4"/>
    <circle class="d" cx="44" cy="33" r="2.2"/><circle class="d" cx="56" cy="33" r="2.2"/>
    <path class="o2" fill="${C.orange}" d="M50 36 L65 40 L50 42.500 Z"/>
    <path class="o2" fill="${C.red}" d="M35 47 Q50 56 65 47 L66 53 Q50 62 34 53 Z"/><path class="o2" fill="${C.red}" d="M57 54 L64 70 L56 71 L53 56 Z"/>
    <circle class="d" cx="48" cy="66" r="2.4"/><circle class="d" cx="48" cy="77" r="2.4"/>
    <path class="sh" d="M66 50 C78 60 76 82 60 90 C70 80 70 62 66 50 Z"/>`,
  reindeer: `
    <path class="s" d="M37 30 C31 21 27 14 29 5 M33 22 L22 19 M30 13 L21 8 M63 30 C69 21 73 14 71 5 M67 22 L78 19 M70 13 L79 8" style="stroke:${C.woodD};stroke-width:4"/>
    <path class="o" fill="${C.wood}" d="M29 94 C27 72 33 64 40 60 L60 60 C67 64 73 72 71 94 Z"/>
    <path class="o" fill="${C.woodL}" d="M20 37 L35 33 L37 43 Z M80 37 L65 33 L63 43 Z"/>
    <path class="o" fill="${C.wood}" d="M34 35 C34 24 66 24 66 35 L62 58 C60 71 40 71 38 58 Z"/>
    <ellipse class="n" fill="${C.woodL}" cx="50" cy="59" rx="10.500" ry="8"/>
    <ellipse class="d" cx="50" cy="59" rx="5.500" ry="4.200"/>
    <circle class="d" cx="42" cy="43" r="2.800"/><circle class="d" cx="58" cy="43" r="2.800"/>
    <path class="o2" fill="${C.red}" d="M35 76 H65 V83 H35 Z"/><circle class="o2" fill="${C.gold}" cx="50" cy="87" r="5"/><path class="t" d="M50 87 V91"/>`,
  workbench: `
    <path class="s" d="M20 62 V91 M80 62 V91 M20 80 H80"/>
    <rect class="o" fill="${C.wood}" x="8" y="48" width="84" height="15" rx="2"/>
    <path class="t" d="M30 48 V63 M56 48 V63 M74 48 V63" opacity="0.45"/>
    <path class="o2" fill="${C.metal}" d="M16 48 V34 H22 V30 H34 V34 H40 V48 Z"/>
    <path class="s" d="M62 48 L70 28" style="stroke:${C.woodD};stroke-width:4.500"/><path class="o2" fill="${C.metalD}" d="M60 22 L80 28 L78 36 L58 30 Z"/>
    <path class="o2" fill="${C.gold}" d="M44 48 L48 38 H56 L52 48 Z"/>`,
  toyshelf: `
    <rect class="o" fill="${C.wood}" x="10" y="8" width="80" height="84" rx="3"/>
    <rect class="n" fill="${C.woodD}" x="16" y="14" width="68" height="21"/><rect class="n" fill="${C.woodD}" x="16" y="40" width="68" height="21"/><rect class="n" fill="${C.woodD}" x="16" y="66" width="68" height="21"/>
    <circle class="o2" fill="${C.red}" cx="28" cy="27" r="7"/><rect class="o2" fill="${C.blue}" x="42" y="20" width="14" height="14"/><path class="o2" fill="${C.gold}" d="M64 34 L72 18 L80 34 Z"/>
    <rect class="o2" fill="${C.leaf}" x="20" y="47" width="18" height="13"/><circle class="o2" fill="${C.gold}" cx="52" cy="53" r="7"/><rect class="o2" fill="${C.purple}" x="66" y="45" width="12" height="15"/>
    <path class="o2" fill="${C.teal}" d="M20 86 L28 70 L36 86 Z"/><circle class="o2" fill="${C.pink}" cx="50" cy="79" r="7"/><rect class="o2" fill="${C.orange}" x="64" y="73" width="15" height="13"/>
    <path class="s" d="M10 37.500 H90 M10 63.500 H90"/>`,
  mailsack: `
    <path class="o2" fill="${C.white}" d="M42 16 L60 11 L64 26 L46 31 Z"/><path class="t" d="M44 18 L55 23 L60 13"/>
    <path class="o" fill="${C.sand}" d="M30 34 C13 50 11 80 25 91 H75 C89 80 87 50 70 34 Z"/>
    <path class="o" fill="${C.sandD}" d="M31 23 C40 30 60 30 69 23 L71 35 H29 Z"/>
    <path class="s" d="M30 35 H70" style="stroke:${C.redD};stroke-width:4.500"/>
    <rect class="o2" fill="${C.white}" x="36" y="52" width="28" height="19"/><path class="t" d="M36 52 L50 63 L64 52"/>
    <path class="sh" d="M70 36 C86 50 88 80 75 91 H64 C76 76 76 52 62 36 Z"/>`,
  candycane: `
    <path class="s" d="M38 90 V36 C38 12 74 12 74 36 V44" style="stroke-width:19"/>
    <path class="s" d="M38 90 V36 C38 12 74 12 74 36 V44" style="stroke:${C.white};stroke-width:13"/>
    <path class="s" d="M38 90 V36 C38 12 74 12 74 36 V44" style="stroke:${C.red};stroke-width:13;stroke-dasharray:9 12;stroke-linecap:butt"/>
    <path class="o2" fill="${C.leaf}" d="M38 60 C28 50 18 56 22 64 C26 70 34 66 38 60 Z M38 60 C48 50 58 56 54 64 C50 70 42 66 38 60 Z"/><circle class="o2" fill="${C.gold}" cx="38" cy="61" r="4"/>`,
  gingerbread: `
    <path class="o" fill="${C.woodD}" d="M18 48 H82 V91 H18 Z"/>
    <path class="o" fill="${C.wood}" d="M8 52 L50 13 L92 52 Z"/>
    <path class="s" d="M13 51 Q21 60 29 51 Q37 60 45 51 Q53 60 61 51 Q69 60 77 51 Q83 58 88 51" style="stroke:${C.white};stroke-width:4.500"/>
    <path class="o2" fill="${C.red}" d="M42 91 V74 C42 63 58 63 58 74 V91 Z"/><circle class="n" fill="${C.gold}" cx="54" cy="79" r="1.800"/>
    <circle class="o2" fill="${C.white}" cx="29" cy="72" r="6.500"/><circle class="o2" fill="${C.white}" cx="71" cy="72" r="6.500"/><path class="t" d="M29 65.500 V78.500 M22.500 72 H35.500 M71 65.500 V78.500 M64.500 72 H77.500"/>
    <circle class="o2" fill="${C.red}" cx="50" cy="31" r="4.500"/><circle class="o2" fill="${C.leaf}" cx="36" cy="41" r="3.500"/><circle class="o2" fill="${C.gold}" cx="64" cy="41" r="3.500"/>`,
  lantern: `
    <path class="s" d="M39 24 C39 4 61 4 61 24"/>
    <path class="o" fill="${C.dark}" d="M30 22 H70 L63 33 H37 Z"/>
    <rect class="o" fill="${C.gold}" x="34" y="33" width="32" height="44"/>
    <path class="n" fill="${C.orange}" d="M50 44 C59 55 57 67 50 70 C43 67 41 55 50 44 Z"/><path class="n" fill="${C.white}" d="M50 56 C54 61 53 67 50 68 C47 67 46 61 50 56 Z"/>
    <path class="t" d="M34 33 L66 77 M66 33 L34 77" opacity="0.35"/>
    <path class="o" fill="${C.dark}" d="M29 77 H71 L75 91 H25 Z"/>`,
  // ----- toys: what the wrapped presents hide -----
  drum: `
    <path class="s" d="M22 12 L45 36 M78 12 L55 36" style="stroke:${C.woodD};stroke-width:4"/><circle class="o2" fill="${C.woodL}" cx="22" cy="12" r="5"/><circle class="o2" fill="${C.woodL}" cx="78" cy="12" r="5"/>
    <path class="o" fill="${C.red}" d="M15 42 V76 C15 93 85 93 85 76 V42 Z"/>
    <path class="s" d="M15 54 L29 84 L43 58 L57 86 L71 58 L85 80" style="stroke:${C.gold};stroke-width:2.800"/>
    <path class="s" d="M15 76 C15 93 85 93 85 76" style="stroke:${C.gold};stroke-width:5"/><path class="s" d="M15 76 C15 93 85 93 85 76" style="stroke-width:1.500" transform="translate(0 3)"/>
    <ellipse class="o" fill="${C.cream}" cx="50" cy="42" rx="35" ry="11.500"/>`,
  teddy: `
    <circle class="o" fill="${C.wood}" cx="30" cy="21" r="9.500"/><circle class="o" fill="${C.wood}" cx="70" cy="21" r="9.500"/>
    <circle class="n" fill="${C.woodL}" cx="30" cy="21" r="4.500"/><circle class="n" fill="${C.woodL}" cx="70" cy="21" r="4.500"/>
    <circle class="o" fill="${C.wood}" cx="23" cy="62" r="9.500"/><circle class="o" fill="${C.wood}" cx="77" cy="62" r="9.500"/>
    <ellipse class="o" fill="${C.wood}" cx="50" cy="70" rx="24" ry="22"/>
    <circle class="o" fill="${C.wood}" cx="34" cy="88" r="9.500"/><circle class="o" fill="${C.wood}" cx="66" cy="88" r="9.500"/>
    <ellipse class="n" fill="${C.woodL}" cx="50" cy="73" rx="13" ry="13"/>
    <circle class="o" fill="${C.wood}" cx="50" cy="36" r="22"/>
    <ellipse class="o2" fill="${C.woodL}" cx="50" cy="43" rx="10" ry="8"/>
    <circle class="d" cx="42" cy="32" r="2.500"/><circle class="d" cx="58" cy="32" r="2.500"/><ellipse class="d" cx="50" cy="40" rx="3.200" ry="2.300"/><path class="t" d="M50 42 V46 M46 47.500 Q50 50 54 47.500"/>
    <path class="o2" fill="${C.red}" d="M50 57 L39 52 V62 Z M50 57 L61 52 V62 Z"/><circle class="o2" fill="${C.red}" cx="50" cy="57" r="2.800"/>`,
  train: `
    <circle class="o2" fill="${C.white}" cx="24" cy="13" r="6"/><circle class="o2" fill="${C.white}" cx="35" cy="7" r="4.500"/>
    <path class="o" fill="${C.dark}" d="M19 46 V30 H15 V23 H35 V30 H31 V46 Z"/>
    <rect class="o" fill="${C.red}" x="10" y="46" width="48" height="28" rx="5"/>
    <rect class="o" fill="${C.blue}" x="54" y="30" width="34" height="44" rx="3"/>
    <rect class="o2" fill="${C.cyan}" x="61" y="38" width="20" height="15"/>
    <rect class="o" fill="${C.gold}" x="49" y="24" width="44" height="8" rx="2"/>
    <path class="s" d="M10 60 H54" style="stroke:${C.gold};stroke-width:3"/>
    <circle class="o" fill="${C.gold}" cx="24" cy="80" r="10"/><circle class="o" fill="${C.gold}" cx="48" cy="80" r="10"/><circle class="o" fill="${C.gold}" cx="76" cy="78" r="12"/>
    <circle class="d" cx="24" cy="80" r="3"/><circle class="d" cx="48" cy="80" r="3"/><circle class="d" cx="76" cy="78" r="3.500"/>`,
  horse: `
    <path class="s" d="M10 76 C30 97 70 97 90 76" style="stroke-width:9"/><path class="s" d="M10 76 C30 97 70 97 90 76" style="stroke:${C.red};stroke-width:5"/>
    <path class="s" d="M35 64 L30 86 M63 64 L70 86" style="stroke-width:7"/><path class="s" d="M35 64 L30 86 M63 64 L70 86" style="stroke:${C.wood};stroke-width:3.500"/>
    <path class="o2" fill="${C.dark}" d="M27 48 C15 50 12 62 17 72 C21 65 24 59 30 56 Z"/>
    <path class="o" fill="${C.wood}" d="M26 52 C26 43 36 41 44 44 H58 C62 34 60 24 68 15 L78 19 L76 26 L87 35 L83 44 L72 41 C72 52 72 62 66 67 H32 C26 65 26 58 26 52 Z"/>
    <path class="o2" fill="${C.dark}" d="M61 26 C57 33 57 39 59 44 L66 42 C64 36 66 30 69 23 Z"/>
    <path class="o2" fill="${C.red}" d="M40 43 H56 V55 H40 Z"/><path class="s" d="M72 30 L62 40" style="stroke:${C.red};stroke-width:2.500"/>
    <circle class="d" cx="76" cy="27" r="2"/>`,
  robot: `
    <path class="s" d="M50 8 V19"/><circle class="o2" fill="${C.red}" cx="50" cy="7" r="4.500"/>
    <rect class="o" fill="${C.metalD}" x="11" y="52" width="11" height="25" rx="4"/><rect class="o" fill="${C.metalD}" x="78" y="52" width="11" height="25" rx="4"/>
    <rect class="o" fill="${C.metalD}" x="33" y="78" width="13" height="14" rx="2"/><rect class="o" fill="${C.metalD}" x="54" y="78" width="13" height="14" rx="2"/>
    <rect class="o" fill="${C.metal}" x="29" y="18" width="42" height="29" rx="6"/>
    <circle class="o2" fill="${C.gold}" cx="41" cy="30" r="5.500"/><circle class="o2" fill="${C.gold}" cx="59" cy="30" r="5.500"/><circle class="d" cx="41" cy="30" r="1.800"/><circle class="d" cx="59" cy="30" r="1.800"/>
    <path class="s" d="M40 40 H60 M45 38 V42 M50 38 V42 M55 38 V42" style="stroke-width:2"/>
    <rect class="o" fill="${C.teal}" x="24" y="49" width="52" height="31" rx="5"/>
    <rect class="o2" fill="${C.cyan}" x="34" y="55" width="32" height="11" rx="2"/>
    <circle class="o2" fill="${C.red}" cx="40" cy="73" r="3"/><circle class="o2" fill="${C.gold}" cx="50" cy="73" r="3"/><circle class="o2" fill="${C.leaf}" cx="60" cy="73" r="3"/>`,
  top: `
    <path class="s" d="M50 5 V24" style="stroke-width:8"/><path class="s" d="M50 5 V24" style="stroke:${C.wood};stroke-width:4.500"/>
    <path class="o" fill="${C.red}" d="M12 42 C12 25 88 25 88 42 C88 58 60 70 50 94 C40 70 12 58 12 42 Z"/>
    <path class="n" fill="${C.gold}" d="M13.500 44 C24 54 76 54 86.500 44 C85 51 80 57 73 61 C58 66 42 66 27 61 C20 57 15 51 13.500 44 Z"/>
    <path class="n" fill="${C.blue}" d="M36 67 C45 70 55 70 64 67 C58 74 55 80 52.500 86 H47.500 C45 80 42 74 36 67 Z"/>
    <path class="o" fill="none" d="M12 42 C12 25 88 25 88 42 C88 58 60 70 50 94 C40 70 12 58 12 42 Z"/>
    <path class="hl" d="M24 35 Q40 29 58 31"/>`,
  duck: `
    <path class="s" d="M4 90 Q14 83 24 90 T44 90 T64 90 T84 90 T96 88" style="stroke:${C.blueD};stroke-width:3"/>
    <path class="o" fill="${C.gold}" d="M16 60 L5 44 L26 51 Z"/>
    <ellipse class="o" fill="${C.gold}" cx="46" cy="66" rx="35" ry="22"/>
    <circle class="o" fill="${C.gold}" cx="66" cy="36" r="19"/>
    <path class="n" fill="${C.gold}" d="M50 44 C56 52 70 54 80 48 L74 62 L50 60 Z"/>
    <path class="o2" fill="${C.orange}" d="M82 33 L97 39 L82 46 C80 42 80 37 82 33 Z"/><path class="t" d="M83 39.500 H94"/>
    <circle class="d" cx="71" cy="31" r="2.800"/><circle class="p" cx="72" cy="30" r="1"/>
    <path class="o2" fill="${C.goldD}" d="M26 66 C32 54 54 54 60 66 C54 78 34 78 26 66 Z"/>`,
  kite: `
    <path class="s" d="M50 80 C42 86 58 88 52 94 C50 96 54 98 56 97" style="stroke-width:2.200"/>
    <path class="o" fill="${C.red}" d="M50 5 L82 40 L50 80 L18 40 Z"/>
    <path class="n" fill="${C.gold}" d="M50 7 L80 40 H50 Z"/><path class="n" fill="${C.blue}" d="M20 40 H50 V78 Z"/>
    <path class="s" d="M50 5 V80 M18 40 H82" style="stroke-width:2.200"/>
    <path class="o" fill="none" d="M50 5 L82 40 L50 80 L18 40 Z"/>
    <path class="o2" fill="${C.gold}" d="M47 86 L39 82 V90 Z M47 86 L55 82 V90 Z"/>`,
};

// ---------- two-square furniture (200x100, drawn lying left to right) ----------
// Pieces in PLAN are drawn from above, so turning them 90 degrees for a tall slot works.

const OBJ2 = {
  bed: `
    <rect class="o" fill="${C.wood}" x="8" y="10" width="184" height="80" rx="7"/>
    <rect class="o" fill="${C.white}" x="20" y="16" width="166" height="68" rx="3"/>
    <rect class="o" fill="${C.white}" x="26" y="22" width="26" height="56" rx="10"/>
    <path class="o" fill="${C.blue}" d="M70 16 Q78 50 70 84 H186 V16 Z"/>
    <path class="n" fill="${C.blueL}" d="M70 16 Q78 50 70 84 H84 Q92 50 84 16 Z"/>
    <path class="t" d="M112 22 V78 M140 22 V78 M168 22 V78" opacity="0.45"/>`,
  table: `
    <rect class="o" fill="${C.woodL}" x="10" y="14" width="180" height="72" rx="10"/>
    <rect class="n" fill="${C.red}" x="11.5" y="38" width="177" height="24" opacity="0.85"/>
    <path class="t" d="M10 38 H190 M10 62 H190"/>
    <circle class="o2" fill="${C.white}" cx="38" cy="50" r="13"/><circle class="t" cx="38" cy="50" r="7"/>
    <circle class="o2" fill="${C.white}" cx="162" cy="50" r="13"/><circle class="t" cx="162" cy="50" r="7"/>
    <circle class="o2" fill="${C.white}" cx="100" cy="26" r="9"/><circle class="o2" fill="${C.white}" cx="100" cy="74" r="9"/>
    <circle class="o2" fill="${C.gold}" cx="76" cy="50" r="6"/><circle class="o2" fill="${C.gold}" cx="124" cy="50" r="6"/>
    <circle class="n" fill="${C.orange}" cx="76" cy="50" r="2.6"/><circle class="n" fill="${C.orange}" cx="124" cy="50" r="2.6"/>`,
  sofa: `
    <path class="s" d="M26 80 V90 M174 80 V90"/>
    <path class="o" fill="${C.rose}" d="M22 34 C22 18 178 18 178 34 L178 60 L22 60 Z"/>
    <path class="o" fill="${C.pink}" d="M8 48 C8 37 28 37 28 48 L28 81 L8 81 Z"/>
    <path class="o" fill="${C.pink}" d="M172 48 C172 37 192 37 192 48 L192 81 L172 81 Z"/>
    <path class="o" fill="${C.pink}" d="M27 60 H173 V81 H27 Z"/><path class="t" d="M76 60 V81 M124 60 V81"/>
    <circle class="n" fill="${C.redD}" cx="60" cy="38" r="2.6"/><circle class="n" fill="${C.redD}" cx="100" cy="35" r="2.6"/><circle class="n" fill="${C.redD}" cx="140" cy="38" r="2.6"/>
    <path class="o2" fill="${C.gold}" d="M34 46 h24 v16 h-24z" transform="rotate(-8 46 54)"/>
    <path class="sh" d="M174 50 h16 v29 h-16z"/>`,
  bench: `
    <path class="s" d="M28 26 V60 M172 26 V60 M100 26 V60"/>
    <rect class="o" fill="${C.wood}" x="14" y="23" width="172" height="10" rx="3"/>
    <rect class="o" fill="${C.wood}" x="14" y="38" width="172" height="10" rx="3"/>
    <rect class="o" fill="${C.woodL}" x="8" y="54" width="184" height="11" rx="3"/>
    <path class="s" d="M22 65 Q18 75 20 87 M178 65 Q182 75 180 87 M100 65 V87 M15 87 h10 M175 87 h10"/>`,
  shelf: `
    <rect class="o" fill="${C.woodD}" x="10" y="5" width="180" height="90" rx="2"/>
    <rect class="n" fill="${C.cream}" x="15" y="10" width="170" height="23"/><rect class="n" fill="${C.cream}" x="15" y="38" width="170" height="23"/><rect class="n" fill="${C.cream}" x="15" y="66" width="170" height="24"/>
    <path class="t" d="M100 10 V90" opacity="0.5"/>
    <rect class="o2" fill="${C.red}" x="18" y="12" width="7" height="21"/><rect class="o2" fill="${C.blue}" x="25" y="15" width="8" height="18"/><rect class="o2" fill="${C.gold}" x="33" y="11" width="6" height="22"/>
    <rect class="o2" fill="${C.leaf}" x="39" y="14" width="9" height="19"/><path class="o2" fill="${C.purple}" d="M52 33 L59 14 L65 16 L58 33 Z"/><rect class="o2" fill="${C.teal}" x="70" y="13" width="8" height="20"/><rect class="o2" fill="${C.red}" x="78" y="16" width="7" height="17"/>
    <rect class="o2" fill="${C.purple}" x="104" y="12" width="8" height="21"/><rect class="o2" fill="${C.gold}" x="112" y="15" width="7" height="18"/><rect class="o2" fill="${C.blue}" x="119" y="11" width="6" height="22"/>
    <circle class="o2" fill="${C.teal}" cx="146" cy="23" r="9"/><path class="t" d="M137 23 H155 M146 14 V32"/><rect class="o2" fill="${C.leaf}" x="164" y="13" width="8" height="20"/><rect class="o2" fill="${C.red}" x="172" y="16" width="8" height="17"/>
    <rect class="o2" fill="${C.teal}" x="18" y="43" width="8" height="18"/><rect class="o2" fill="${C.red}" x="26" y="40" width="6" height="21"/><rect class="o2" fill="${C.purple}" x="32" y="42" width="9" height="19"/>
    <rect class="o2" fill="${C.gold}" x="52" y="48" width="26" height="6"/><rect class="o2" fill="${C.blue}" x="50" y="54" width="30" height="7"/>
    <rect class="o2" fill="${C.leaf}" x="104" y="41" width="7" height="20"/><rect class="o2" fill="${C.gold}" x="111" y="44" width="8" height="17"/><rect class="o2" fill="${C.red}" x="119" y="40" width="6" height="21"/><rect class="o2" fill="${C.blue}" x="125" y="43" width="9" height="18"/>
    <rect class="o2" fill="${C.purple}" x="150" y="42" width="7" height="19"/><rect class="o2" fill="${C.teal}" x="157" y="40" width="8" height="21"/><rect class="o2" fill="${C.gold}" x="165" y="44" width="14" height="17"/>
    <rect class="o2" fill="${C.gold}" x="18" y="70" width="7" height="20"/><rect class="o2" fill="${C.blue}" x="25" y="72" width="8" height="18"/><rect class="o2" fill="${C.red}" x="40" y="76" width="22" height="7"/><rect class="o2" fill="${C.purple}" x="40" y="83" width="26" height="7"/>
    <rect class="o2" fill="${C.leaf}" x="74" y="70" width="6" height="20"/><rect class="o2" fill="${C.teal}" x="104" y="71" width="9" height="19"/><rect class="o2" fill="${C.red}" x="113" y="69" width="6" height="21"/>
    <rect class="o2" fill="${C.blue}" x="130" y="74" width="8" height="16"/><rect class="o2" fill="${C.gold}" x="138" y="70" width="7" height="20"/><rect class="o2" fill="${C.purple}" x="160" y="72" width="8" height="18"/><rect class="o2" fill="${C.leaf}" x="168" y="70" width="10" height="20"/>`,
  rug: `
    <path class="t" d="M12 22 h-6 M12 32 h-6 M12 42 h-6 M12 52 h-6 M12 62 h-6 M12 72 h-6 M188 22 h6 M188 32 h6 M188 42 h6 M188 52 h6 M188 62 h6 M188 72 h6"/>
    <rect class="o" fill="${C.purple}" x="12" y="16" width="176" height="68" rx="2"/>
    <rect class="n" fill="${C.lilac}" x="20" y="24" width="160" height="52"/>
    <path class="o2" fill="${C.gold}" d="M50 30 L70 50 L50 70 L30 50 Z"/><path class="o2" fill="${C.teal}" d="M100 30 L120 50 L100 70 L80 50 Z"/><path class="o2" fill="${C.gold}" d="M150 30 L170 50 L150 70 L130 50 Z"/>
    <circle class="n" fill="${C.red}" cx="50" cy="50" r="5"/><circle class="n" fill="${C.red}" cx="100" cy="50" r="5"/><circle class="n" fill="${C.red}" cx="150" cy="50" r="5"/>`,
  pew: `
    <path class="s" d="M16 66 V91 M184 66 V91 M100 66 V91" stroke-width="4"/>
    <rect class="o" fill="${C.woodD}" x="10" y="15" width="180" height="40" rx="5"/>
    <path class="hl" d="M18 29 H182" opacity="0.5"/>
    <circle class="o2" fill="${C.gold}" cx="55" cy="40" r="7"/><path class="s" d="M55 36 V44 M51.5 39 H58.5" stroke-width="2"/>
    <circle class="o2" fill="${C.gold}" cx="145" cy="40" r="7"/><path class="s" d="M145 36 V44 M141.5 39 H148.5" stroke-width="2"/>
    <rect class="o" fill="${C.wood}" x="5" y="54" width="190" height="13" rx="3"/>`,
  sleeppod: `
    <rect class="o" fill="${C.white}" x="8" y="14" width="184" height="72" rx="36"/>
    <path class="o" fill="${C.cyan}" d="M56 26 H150 C166 26 174 38 174 50 C174 62 166 74 150 74 H56 Z"/>
    <path class="n" fill="${C.white}" d="M66 32 H120 L112 40 H66 Z" opacity="0.8"/>
    <path class="s" d="M56 14 V86"/>
    <circle class="n" fill="${C.glow}" cx="34" cy="38" r="5"/><circle class="n" fill="${C.red}" cx="34" cy="62" r="5"/>
    <path class="t" d="M24 50 H44"/>`,
  hydro: `
    <rect class="o" fill="${C.white}" x="8" y="18" width="184" height="64" rx="10"/>
    <rect class="o2" fill="${C.woodD}" x="18" y="27" width="164" height="46" rx="6"/>
    <circle class="o2" fill="${C.leaf}" cx="42" cy="50" r="17"/><circle class="n" fill="${C.pink}" cx="42" cy="50" r="6"/>
    <circle class="o2" fill="${C.leafD}" cx="82" cy="50" r="17"/><circle class="n" fill="${C.gold}" cx="82" cy="50" r="6"/>
    <circle class="o2" fill="${C.leafL}" cx="120" cy="50" r="17"/><circle class="n" fill="${C.purple}" cx="120" cy="50" r="6"/>
    <circle class="o2" fill="${C.leaf}" cx="158" cy="50" r="17"/><circle class="n" fill="${C.red}" cx="158" cy="50" r="6"/>`,
  console: `
    <rect class="o" fill="${C.dark}" x="24" y="6" width="68" height="30" rx="4"/><rect class="n" fill="#1f3b3a" x="28" y="10" width="60" height="22" rx="2"/>
    <path class="s" d="M32 25 l8 -7 8 8 8 -11 8 8 8 -5 4 3" style="stroke:${C.glow};stroke-width:2.4"/>
    <rect class="o" fill="${C.dark}" x="108" y="6" width="68" height="30" rx="4"/><rect class="n" fill="#1f3b3a" x="112" y="10" width="60" height="22" rx="2"/>
    <circle class="s" cx="142" cy="21" r="8" style="stroke:${C.glow};stroke-width:2.4"/><circle class="n" fill="${C.glow}" cx="146" cy="18" r="2.6"/>
    <path class="o" fill="${C.metal}" d="M8 62 L24 35 H176 L192 62 Z"/>
    <circle class="o2" fill="${C.red}" cx="40" cy="49" r="5"/><circle class="o2" fill="${C.gold}" cx="56" cy="49" r="5"/><circle class="o2" fill="${C.glow}" cx="72" cy="49" r="5"/>
    <rect class="o2" fill="${C.cyan}" x="96" y="44" width="34" height="10" rx="3"/><rect class="o2" fill="${C.red}" x="142" y="44" width="22" height="10" rx="3"/>
    <rect class="o" fill="${C.metalD}" x="8" y="62" width="184" height="28" rx="2"/>
    <path class="hl" d="M22 72 h40 M22 81 h24 M120 76 h50"/>`,
  coffin: `
    <path class="o" fill="${C.woodD}" d="M8 38 L52 18 H186 Q192 50 186 82 H52 L8 62 Z"/>
    <path class="n" fill="${C.wood}" d="M20 42 L54 27 H178 Q182 50 178 73 H54 L20 58 Z"/>
    <path class="s" d="M60 50 H150 M82 32 V68" style="stroke:${C.gold};stroke-width:6"/>
    <circle class="o2" fill="${C.gold}" cx="170" cy="30" r="4"/><circle class="o2" fill="${C.gold}" cx="170" cy="70" r="4"/>`,
  sarcophagus: `
    <path class="o" fill="${C.gold}" d="M8 34 C8 22 20 16 34 16 H178 Q194 50 178 84 H34 C20 84 8 78 8 66 Z"/>
    <path class="o2" fill="${C.lapis}" d="M14 36 C14 26 24 22 34 22 H64 L78 50 L64 78 H34 C24 78 14 74 14 64 Z"/>
    <ellipse class="o2" fill="${C.sand}" cx="38" cy="50" rx="15" ry="13"/>
    <circle class="d" cx="36" cy="45" r="2.2"/><circle class="d" cx="36" cy="55" r="2.2"/><path class="t" d="M44 46 Q47 50 44 54"/>
    <path class="s" d="M96 22 V78 M118 21 V79 M140 21 V79 M162 23 V77" style="stroke:${C.lapis};stroke-width:6"/>
    <path class="s" d="M84 32 V68" style="stroke:${C.red};stroke-width:5"/>
    <path class="o2" fill="${C.turq}" d="M100 44 h54 v12 h-54z"/>`,
  boat: `
    <path class="n" fill="${C.blue}" d="M4 72 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q8 6 12 2 V94 H4 Z"/>
    <path class="s" d="M100 62 V12" stroke-width="4"/><path class="o" fill="${C.white}" d="M100 14 H150 L140 34 L150 52 H100 Z"/>
    <path class="s" d="M104 26 H140 M104 40 H140" style="stroke:${C.red};stroke-width:3"/>
    <path class="o" fill="${C.sand}" d="M12 46 C40 66 160 66 188 46 C184 78 150 80 100 80 C50 80 16 78 12 46 Z"/>
    <path class="s" d="M40 60 V78 M62 64 V80 M84 66 V80 M116 66 V80 M138 64 V80 M160 60 V78" style="stroke:${C.sandD};stroke-width:3"/>
    <path class="o" fill="${C.sand}" d="M12 46 C4 38 6 24 18 20 C14 32 18 42 24 50 Z"/><path class="o" fill="${C.sand}" d="M188 46 C196 38 194 24 182 20 C186 32 182 42 176 50 Z"/>`,
};
OBJ2.sleigh = `
    <path class="s" d="M18 89 H150 C178 89 186 66 168 62" style="stroke:${C.goldD};stroke-width:5.500"/>
    <path class="s" d="M50 89 V74 M124 89 V74"/>
    <path class="o" fill="${C.sand}" d="M58 52 C50 34 62 20 78 25 C92 19 106 34 98 52 Z"/><path class="s" d="M70 27 Q78 21 86 27" style="stroke:${C.redD};stroke-width:3.500"/>
    <path class="o" fill="${C.red}" d="M12 36 C12 20 30 18 36 29 L44 51 H120 L134 26 C140 13 166 16 163 33 L152 65 C150 72 142 75 134 75 H38 C22 75 12 64 12 52 Z"/>
    <path class="n" fill="${C.redD}" d="M44 51 H120 L115 63 H49 Z"/>
    <path class="s" d="M19 40 C28 47 30 57 28 69 M151 30 C146 44 146 57 141 69" style="stroke:${C.gold};stroke-width:3.200"/>
    <circle class="o2" fill="${C.gold}" cx="155" cy="37" r="5.500"/><path class="hl" d="M60 69 H112"/>`;

const PLAN = new Set(['bed', 'table', 'rug', 'sleeppod', 'hydro', 'coffin', 'sarcophagus']);

// The big rug (200x200).
const OBJ4 = {
  rug: `
    <path class="t" d="M12 30 h-7 M12 50 h-7 M12 70 h-7 M12 90 h-7 M12 110 h-7 M12 130 h-7 M12 150 h-7 M12 170 h-7 M188 30 h7 M188 50 h7 M188 70 h7 M188 90 h7 M188 110 h7 M188 130 h7 M188 150 h7 M188 170 h7"/>
    <rect class="o" fill="${C.purple}" x="12" y="14" width="176" height="172" rx="3"/>
    <rect class="n" fill="${C.lilac}" x="24" y="26" width="152" height="148"/>
    <rect class="o2" fill="${C.teal}" x="36" y="38" width="128" height="124"/>
    <path class="o2" fill="${C.gold}" d="M100 48 L152 100 L100 152 L48 100 Z"/>
    <path class="o2" fill="${C.purple}" d="M100 72 L128 100 L100 128 L72 100 Z"/>
    <circle class="n" fill="${C.red}" cx="100" cy="100" r="9"/>
    <circle class="n" fill="${C.red}" cx="48" cy="50" r="5"/><circle class="n" fill="${C.red}" cx="152" cy="50" r="5"/><circle class="n" fill="${C.red}" cx="48" cy="150" r="5"/><circle class="n" fill="${C.red}" cx="152" cy="150" r="5"/>`,
};

// in keys and rules a wrapped present is shown in red paper
OBJ.gift = giftSvg({ paper: C.red, ribbon: C.gold });

export function objectSvg(kind) {
  return OBJ[kind] || '';
}

// A piece that covers several squares: { kind, w, h } in squares. Returns art for a
// (w*100)x(h*100) box, or null if this kind has no big version.
export function pieceSvg(piece) {
  const { kind, w, h } = piece;
  if (w === 2 && h === 2 && OBJ4[kind]) return OBJ4[kind];
  if (w === 2 && h === 1 && OBJ2[kind]) return OBJ2[kind];
  if (w === 1 && h === 2 && OBJ2[kind] && PLAN.has(kind)) return `<g transform="translate(100 0) rotate(90)">${OBJ2[kind]}</g>`;
  return null;
}

// A wrapped present: `wrap` is { paper, ribbon } (the North Pole).
export function giftSvg(wrap) {
  return `
    <rect class="o" fill="${wrap.paper}" x="15" y="42" width="70" height="49" rx="3"/>
    <path class="sh" d="M70 44 H84 V90 H70 Z"/>
    <circle class="n" fill="#fff" cx="27" cy="56" r="3" opacity="0.45"/><circle class="n" fill="#fff" cx="34" cy="76" r="3" opacity="0.45"/><circle class="n" fill="#fff" cx="66" cy="62" r="3" opacity="0.45"/><circle class="n" fill="#fff" cx="72" cy="82" r="3" opacity="0.45"/>
    <rect class="o2" fill="${wrap.ribbon}" x="43" y="42" width="14" height="49"/>
    <rect class="o" fill="${wrap.paper}" x="10" y="30" width="80" height="16" rx="3"/>
    <rect class="o2" fill="${wrap.ribbon}" x="43" y="30" width="14" height="16"/>
    <path class="o2" fill="${wrap.ribbon}" d="M50 30 C42 6 18 10 27 26 C33 33 44 32 50 30 Z M50 30 C58 6 82 10 73 26 C67 33 56 32 50 30 Z"/>
    <circle class="o2" fill="${wrap.ribbon}" cx="50" cy="29" r="5"/>`;
}

// Zeta-9 teleporter pad, drawn on the floor under anything else in the square.
export function padSvg() {
  return `
    <circle class="n" fill="${C.glow}" cx="50" cy="50" r="42" opacity="0.45"/>
    <circle class="pad-ring" cx="50" cy="50" r="40"/>
    <circle class="pad-ring2" cx="50" cy="50" r="29"/>
    <path class="o2" fill="${C.gold}" d="M55 24 L38 54 L50 54 L45 78 L63 46 L51 46 Z"/>`;
}

// ---------- theme emblems (front page) ----------

const EMBLEMS = {
  manor: `
    <rect class="n" fill="${C.blueL}" x="0" y="0" width="100" height="100"/>
    <rect class="n" fill="${C.leafL}" x="0" y="76" width="100" height="24"/>
    <path class="o" fill="${C.terra}" d="M20 82 V44 H80 V82 Z"/>
    <rect class="o" fill="${C.terra}" x="64" y="16" width="9" height="20"/>
    <path class="o" fill="${C.dark}" d="M12 46 L50 16 L88 46 Z"/>
    <rect class="o" fill="${C.woodD}" x="43" y="60" width="14" height="22"/>
    <rect class="o2" fill="${C.gold}" x="26" y="52" width="11" height="12"/><rect class="o2" fill="${C.gold}" x="63" y="52" width="11" height="12"/>
    <circle class="o2" fill="${C.gold}" cx="50" cy="35" r="5"/>`,
  zeta: `
    <rect class="n" fill="${C.dark}" x="0" y="0" width="100" height="100"/>
    <circle class="n" fill="${C.white}" cx="16" cy="20" r="1.8"/><circle class="n" fill="${C.white}" cx="84" cy="16" r="1.8"/><circle class="n" fill="${C.white}" cx="80" cy="82" r="1.8"/><circle class="n" fill="${C.white}" cx="18" cy="78" r="1.4"/><circle class="n" fill="${C.white}" cx="60" cy="10" r="1.2"/>
    <path class="n" fill="${C.glow}" d="M36 58 L24 96 H76 L64 58 Z" opacity="0.4"/>
    <path class="o" fill="${C.cyan}" d="M32 44 C32 24 68 24 68 44 Z"/>
    <ellipse class="o" fill="${C.metal}" cx="50" cy="48" rx="38" ry="11"/>
    <circle class="o2" fill="${C.gold}" cx="28" cy="48" r="3.4"/><circle class="o2" fill="${C.red}" cx="50" cy="52" r="3.4"/><circle class="o2" fill="${C.gold}" cx="72" cy="48" r="3.4"/>
    <circle class="o2" fill="${C.glow}" cx="50" cy="36" r="6"/><circle class="d" cx="50" cy="36" r="2.4"/>`,
  haunted: `
    <rect class="n" fill="${C.purpleD}" x="0" y="0" width="100" height="100"/>
    <circle class="n" fill="${C.gold}" cx="76" cy="24" r="14"/><circle class="n" fill="${C.purpleD}" cx="83" cy="20" r="12"/>
    <path class="o" fill="${C.white}" d="M26 90 C24 60 22 22 50 18 C78 22 76 60 74 90 C68 84 64 96 58 90 C54 84 48 96 42 90 C38 84 32 96 26 90 Z"/>
    <ellipse class="d" cx="41" cy="44" rx="5" ry="7.5"/><ellipse class="d" cx="59" cy="44" rx="5" ry="7.5"/><ellipse class="d" cx="50" cy="62" rx="5" ry="6.5"/>`,
  egypt: `
    <rect class="n" fill="${C.blueL}" x="0" y="0" width="100" height="100"/>
    <circle class="o2" fill="${C.gold}" cx="74" cy="24" r="13"/>
    <path class="o" fill="${C.sandD}" d="M4 84 L42 22 L80 84 Z"/><path class="n" fill="${C.sand}" d="M42 24 L78 83 H42 Z"/>
    <path class="t" d="M30 42 H54 M22 56 H62 M14 70 H71" opacity="0.5"/>
    <path class="o" fill="${C.sand}" d="M52 84 L74 50 L96 84 Z"/>
    <rect class="n" fill="${C.sand}" x="0" y="84" width="100" height="16"/><path class="s" d="M0 84 H100"/>`,
  xmas: `
    <rect class="n" fill="#27407a" x="0" y="0" width="100" height="100"/>
    <circle class="n" fill="#fff" cx="14" cy="16" r="2"/><circle class="n" fill="#fff" cx="38" cy="9" r="1.500"/><circle class="n" fill="#fff" cx="88" cy="18" r="2"/><circle class="n" fill="#fff" cx="72" cy="8" r="1.300"/><circle class="n" fill="#fff" cx="9" cy="46" r="1.500"/><circle class="n" fill="#fff" cx="93" cy="60" r="1.500"/>
    <path class="n" fill="${C.white}" d="M0 82 Q28 70 54 80 T100 76 V100 H0 Z"/>
    <path class="o" fill="${C.red}" d="M22 68 C24 38 42 18 64 20 C79 22 86 34 83 46 C75 36 65 38 63 49 L72 68 Z"/>
    <circle class="o" fill="${C.white}" cx="85" cy="48" r="9.500"/>
    <rect class="o" fill="${C.white}" x="14" y="63" width="66" height="17" rx="8.500"/>`,
  heist: `
    <rect class="n" fill="${C.dark}" x="0" y="0" width="100" height="100"/>
    <path class="o" fill="${C.cyan}" d="M28 34 H72 L88 52 L50 90 L12 52 Z"/>
    <path class="o2" fill="${C.white}" d="M28 34 L40 52 H12 Z M72 34 L60 52 H88 Z"/><path class="o2" fill="${C.blueL}" d="M40 52 H60 L50 90 Z"/>
    <path class="hl" d="M22 12 l3 8 M16 18 l8 3 M80 10 l-3 8 M86 16 l-8 3" stroke-width="3"/>`,
};

export function emblemSvg(theme) {
  return `<svg class="art emblem" viewBox="0 0 100 100" aria-hidden="true">${EMBLEMS[theme] || ''}</svg>`;
}

export const PALETTE = C;
