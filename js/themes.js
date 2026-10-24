// Content tables: furniture, rooms, cast. Everything a theme pack would swap out.

export const OBJECTS = {
  // occupiable
  chair: { name: 'chair', occupiable: true, onText: 'sitting in {a} <b>chair</b>' },
  bed: { name: 'bed', occupiable: true, onText: 'lying on {a} <b>bed</b>' },
  rug: { name: 'rug', occupiable: true, onText: 'standing on {a} <b>rug</b>' },
  bench: { name: 'bench', occupiable: true, onText: 'sitting on {a} <b>bench</b>' },
  // blocking
  tree: { name: 'tree', occupiable: false },
  bush: { name: 'bush', occupiable: false },
  table: { name: 'table', occupiable: false },
  shelf: { name: 'bookshelf', occupiable: false },
  plant: { name: 'potted plant', occupiable: false },
  piano: { name: 'piano', occupiable: false },
  stove: { name: 'stove', occupiable: false },
  // Outpost Zeta-9
  hoverchair: { name: 'hover chair', occupiable: true, onText: 'floating in {a} <b>hover chair</b>' },
  sleeppod: { name: 'sleep pod', occupiable: true, onText: 'curled up in {a} <b>sleep pod</b>' },
  grate: { name: 'floor grate', occupiable: true, onText: 'standing on {a} <b>floor grate</b>' },
  specimen: { name: 'specimen tank', occupiable: false },
  console: { name: 'console', occupiable: false },
  crate: { name: 'cargo crate', occupiable: false },
  reactor: { name: 'reactor core', occupiable: false },
  hydro: { name: 'hydroponic planter', occupiable: false },
  // Hollow Hill House
  pew: { name: 'pew', occupiable: true, onText: 'sitting in {a} <b>pew</b>' },
  coffin: { name: 'coffin', occupiable: false },
  wardrobe: { name: 'wardrobe', occupiable: false },
  clock: { name: 'grandfather clock', occupiable: false },
  candelabra: { name: 'candelabra', occupiable: false },
  mirror: { name: 'mirror', occupiable: false },
  gravestone: { name: 'gravestone', occupiable: false },
};

// weights = how likely each object is to appear in a room of this type
export const ROOM_TYPES = [
  { id: 'garden', name: 'Garden', outdoor: true, pattern: 'grass', objects: { tree: 3, bush: 3, bench: 2 } },
  { id: 'bedroom', name: 'Bedroom', pattern: 'boards', objects: { bed: 3, rug: 2, chair: 1, plant: 1 } },
  { id: 'library', name: 'Library', pattern: 'diag', objects: { shelf: 4, chair: 2, rug: 1, table: 1 } },
  { id: 'kitchen', name: 'Kitchen', pattern: 'tiles', objects: { stove: 2, table: 2, chair: 2 } },
  { id: 'parlour', name: 'Parlour', pattern: 'dots', objects: { piano: 2, chair: 2, rug: 2, plant: 1 } },
  { id: 'dining', name: 'Dining Room', pattern: 'cross', objects: { table: 3, chair: 3, plant: 1 } },
  { id: 'study', name: 'Study', pattern: 'diag2', objects: { shelf: 2, table: 2, chair: 2, rug: 1 } },
  { id: 'hall', name: 'Hallway', pattern: 'checker', objects: { plant: 2, rug: 3, chair: 1 } },
];

// Indoor floor patterns that can be reassigned if two rooms would clash.
export const INDOOR_PATTERNS = ['boards', 'diag', 'tiles', 'dots', 'cross', 'diag2', 'checker', 'hlines'];

export const ROLES = [
  { id: 'butler', title: 'the Butler', gender: 'm', outfit: 'tails' },
  { id: 'maid', title: 'the Maid', gender: 'f', outfit: 'maid' },
  { id: 'heiress', title: 'the Heiress', gender: 'f', outfit: 'gown' },
  { id: 'colonel', title: 'the Colonel', gender: 'm', outfit: 'uniform' },
  { id: 'doctor', title: 'the Doctor', gender: 'any', outfit: 'suit', accessory: 'glasses' },
  { id: 'cook', title: 'the Cook', gender: 'any', outfit: 'apron', hat: 'chef' },
  { id: 'gardener', title: 'the Gardener', gender: 'm', outfit: 'overalls', hat: 'flatcap' },
  { id: 'widow', title: 'the Widow', gender: 'f', outfit: 'gown', hat: 'cloche' },
  { id: 'professor', title: 'the Professor', gender: 'any', outfit: 'suit', accessory: 'glasses' },
  { id: 'chauffeur', title: 'the Chauffeur', gender: 'any', outfit: 'uniform', hat: 'peaked' },
  { id: 'banker', title: 'the Banker', gender: 'm', outfit: 'suit', hat: 'tophat', accessory: 'monocle' },
  { id: 'actress', title: 'the Actress', gender: 'f', outfit: 'gown' },
  { id: 'vicar', title: 'the Vicar', gender: 'm', outfit: 'clergy' },
  { id: 'nurse', title: 'the Nurse', gender: 'f', outfit: 'maid' },
  { id: 'novelist', title: 'the Novelist', gender: 'any', outfit: 'suit' },
  { id: 'baroness', title: 'the Baroness', gender: 'f', outfit: 'gown', hat: 'cloche' },
];

export const NAMES = {
  f: ['Agatha', 'Beatrice', 'Clementine', 'Dorothy', 'Edith', 'Florence', 'Greta', 'Harriet', 'Ivy',
    'Josephine', 'Lavinia', 'Mabel', 'Nell', 'Olive', 'Pearl', 'Rosalind', 'Sybil', 'Violet', 'Winifred',
    'Ursula', 'Theodora', 'Queenie', 'Kitty', 'Ada', 'Elsie', 'Matilda', 'Gwendolyn', 'Philippa'],
  m: ['Archibald', 'Bartholomew', 'Cornelius', 'Desmond', 'Edmund', 'Fitzgerald', 'Gideon', 'Horace',
    'Ignatius', 'Jasper', 'Leopold', 'Montague', 'Nigel', 'Oswald', 'Percival', 'Reginald', 'Silas',
    'Thaddeus', 'Wallace', 'Ambrose', 'Basil', 'Cuthbert', 'Felix', 'Hugo', 'Lionel', 'Rupert', 'Quentin', 'Victor'],
};

export const ESTATES = ['Blackwood Manor', 'Gravesend Hall', 'Hollowmere House', 'Ashcombe Abbey',
  'Thornfield Lodge', 'Ravenscroft Villa', 'Wexley Grange', 'Mordaunt Court', 'Fenwick Priory',
  'Crowhurst Place', 'Larkspur Cottage', 'Duskwood Castle'];

export const HEADLINES = [
  'Murder at {estate}!',
  'Foul Play at {estate}',
  'Death Comes to {estate}',
  'Body Found at {estate}',
  'Scandal at {estate}',
  'A Killer Among the Guests',
];

export const LEDES = [
  '{victim}, {vrole}, was found dead at {estate} late last night. Police have rounded up {count} suspects — and one of them did it.',
  'A scream rang out at {estate} just after the clock struck midnight. By dawn, {victim} was cold and {count} guests had some explaining to do.',
  'Tea was served, the candles were lit, and {victim} never saw the morning. Our reporter has the statements of all {count} suspects.',
  'The guests of {estate} swear they saw nothing. {victim} cannot argue. Somebody in this house is lying.',
];

// ---------- Outpost Zeta-9 ----------

export const ZETA_ROOMS = [
  { id: 'airlock', name: 'Airlock', pattern: 'hlines', objects: { crate: 3, grate: 2, console: 1 } },
  { id: 'hydroponics', name: 'Hydroponics', pattern: 'grass', objects: { hydro: 4, grate: 1, hoverchair: 1 } },
  { id: 'lab', name: 'Xeno Lab', pattern: 'tiles', objects: { specimen: 3, console: 2, hoverchair: 2 } },
  { id: 'reactor', name: 'Reactor', pattern: 'cross', objects: { reactor: 2, console: 2, grate: 2 } },
  { id: 'mess', name: 'Mess Hall', pattern: 'checker', objects: { crate: 1, hoverchair: 3, console: 1 } },
  { id: 'sleepbay', name: 'Sleep Bay', pattern: 'boards', objects: { sleeppod: 4, crate: 1 } },
  { id: 'bridge', name: 'Command Deck', pattern: 'dots', objects: { console: 3, hoverchair: 3 } },
  { id: 'vault', name: 'Specimen Vault', pattern: 'diag2', objects: { specimen: 4, grate: 2 } },
];

export const ZETA_ROLES = [
  { id: 'captain', title: 'the Captain' }, { id: 'navigator', title: 'the Navigator' },
  { id: 'engineer', title: 'the Engineer' }, { id: 'xenobio', title: 'the Xenobiologist' },
  { id: 'cook', title: 'the Space Cook' }, { id: 'medic', title: 'the Medic' },
  { id: 'pilot', title: 'the Pilot' }, { id: 'janitor', title: 'the Janitor-Bot Handler' },
  { id: 'ambassador', title: 'the Ambassador' }, { id: 'botanist', title: 'the Botanist' },
];

// Alien names: looks alien, still readable. Earth aliases: as boring as humanly possible.
export const ALIEN_NAMES = ["Zx'qorth", 'Ŋülthra', "Ẍibb'oz", "Q'vaarn", "Thrr'gak", 'Ölmekk', "Vrix'tl",
  "Kh'zundra", 'Plorbix', 'Ǵnashk', "Yth'leen", 'Bzzt-Ŧorr', "Ix'ahl", 'Grümnok', "Wöq'ra", "Jjhar'ul",
  "Ŝ'kreel", "Øx'tli", "Ŕhuun", "Mh'gaal"];
export const EARTH_NAMES = ['Jeff', 'Dave', 'Karen', 'Steve', 'Linda', 'Gary', 'Brenda', 'Kevin', 'Sharon',
  'Doug', 'Pam', 'Greg', 'Barb', 'Ron', 'Tina', 'Phil', 'Sue', 'Rick', 'Norm', 'Lorraine', 'Ian', 'Ursula',
  'Ed', 'Vicky', 'Wayne', 'Yvonne', 'Hank', 'Mandy', 'Alan', 'Carol', 'Oscar', 'Zoe', 'Xavier', 'Quentin', 'Jackie'];

export const ZETA_PLACES = ['Outpost Zeta-9', 'Zeta-9 Station', 'the Zeta-9 research base'];
export const ZETA_HEADLINES = [
  'Murder on {estate}!', 'Death Among the Stars', 'Crew Member Found Dead', 'Alien Homicide Shocks Galaxy',
  'Trouble on {estate}',
];
export const ZETA_LEDES = [
  '{victim}, {vrole}, was found floating very still in a corridor of {estate}. The {count} remaining crew all have alibis. Not all of them are true.',
  'The station lights flickered at 03:00 galactic time. By 03:05, {victim} was gone for good. {count} crew members are being questioned by the station AI.',
  'Nobody hears you scream in space. On {estate}, nobody heard {victim} at all. {count} suspects; several tentacles; one killer.',
];

// ---------- Hollow Hill House ----------

export const HAUNTED_ROOMS = [
  { id: 'graveyard', name: 'Graveyard', outdoor: true, pattern: 'grass', objects: { gravestone: 4, tree: 2, bench: 1 } },
  { id: 'seance', name: 'Séance Room', pattern: 'dots', objects: { table: 2, candelabra: 2, chair: 3, mirror: 1 } },
  { id: 'crypt', name: 'Crypt', pattern: 'cross', objects: { coffin: 4, candelabra: 1, rug: 1 } },
  { id: 'attic', name: 'Attic', pattern: 'boards', objects: { wardrobe: 3, mirror: 2, rug: 2 } },
  { id: 'chapel', name: 'Chapel', pattern: 'checker', objects: { pew: 4, candelabra: 2 } },
  { id: 'hgallery', name: 'Portrait Hall', pattern: 'diag', objects: { mirror: 2, clock: 2, rug: 2, chair: 1 } },
  { id: 'hbedroom', name: 'Master Bedroom', pattern: 'hlines', objects: { bed: 3, wardrobe: 2, rug: 1 } },
  { id: 'music', name: 'Music Room', pattern: 'diag2', objects: { piano: 2, chair: 2, clock: 1 } },
];
export const GHOST_NAMES = ['Lady Grey', 'Sir Wailsworth', 'Old Mortimer', 'Little Ethel', 'Baron Boo',
  'Widow Weep', 'Captain Clank', 'Mistress Moan'];
export const HAUNTED_PLACES = ['Hollow Hill House', 'Hollow Hill', 'the house on Hollow Hill'];
export const HAUNTED_HEADLINES = [
  'Terror at {estate}!', 'A Fresh Corpse at {estate}', 'Spirits Restless as Guest Dies',
  'Murder Most Ghostly', 'Death at {estate}',
];
export const HAUNTED_LEDES = [
  'The clocks at {estate} stopped at midnight, and so did {victim}. {count} suspects remain, and one of them has been dead for a century.',
  'Guests came to {estate} for a séance. {victim} got rather more than they bargained for. {count} suspects, one of them transparent.',
  'Something moved inside the wardrobe at {estate}. Now {victim} lies still, and {count} suspects, living and otherwise, deny everything.',
];

// ---------- the theme registry ----------
// rules per difficulty switch on each theme's twist.

export const THEMES = {
  manor: {
    id: 'manor', name: 'The Manor', short: 'Manor', cast: 'human',
    rooms: ROOM_TYPES, roles: ROLES, places: ESTATES, headlines: HEADLINES, ledes: LEDES,
    rules: { easy: {}, medium: {}, hard: {} },
  },
  zeta: {
    id: 'zeta', name: 'Outpost Zeta-9', short: 'Zeta-9', cast: 'alien',
    rooms: ZETA_ROOMS, roles: ZETA_ROLES, places: ZETA_PLACES, headlines: ZETA_HEADLINES, ledes: ZETA_LEDES,
    rules: {
      easy: { telepathy: true },
      medium: { telepathy: true, teleporters: true },
      hard: { telepathy: true, teleporters: true, impostor: true },
    },
    // unmasking the impostor is the hard part; the placement logic itself can be gentler
    targets: { hard: { minLevel: 1, maxInitialSingles: 1, relMax: 2 } },
  },
  haunted: {
    id: 'haunted', name: 'Hollow Hill House', short: 'Hollow Hill', cast: 'human',
    rooms: HAUNTED_ROOMS, roles: ROLES, places: HAUNTED_PLACES, headlines: HAUNTED_HEADLINES, ledes: HAUNTED_LEDES,
    rules: { easy: { ghost: true }, medium: { ghost: true }, hard: { ghost: true } },
  },
};
