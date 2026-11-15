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
  // richer scenes (recipe 2 onwards)
  sofa: { name: 'sofa', occupiable: true, onText: 'sitting on {a} <b>sofa</b>' },
  fountain: { name: 'fountain', occupiable: false },
  fireplace: { name: 'fireplace', occupiable: false },
  barrel: { name: 'barrel', occupiable: false },
  // Egypt
  throne: { name: 'throne', occupiable: true, onText: 'seated on {a} <b>throne</b>' },
  mat: { name: 'reed mat', occupiable: true, onText: 'kneeling on {a} <b>reed mat</b>' },
  boat: { name: 'reed boat', occupiable: true, onText: 'sitting in {a} <b>reed boat</b>' },
  sarcophagus: { name: 'sarcophagus', occupiable: false },
  urn: { name: 'urn', occupiable: false },
  statue: { name: 'statue', occupiable: false },
  obelisk: { name: 'obelisk', occupiable: false },
  palm: { name: 'palm tree', occupiable: false },
  brazier: { name: 'brazier', occupiable: false },
  chest: { name: 'treasure chest', occupiable: false },
  pillar: { name: 'pillar', occupiable: false },
  scrolls: { name: 'scroll rack', occupiable: false },
  // The North Pole (recipe 3)
  stool: { name: 'stool', occupiable: true, onText: 'perched on {a} <b>stool</b>' },
  hay: { name: 'hay bale', occupiable: true, onText: 'sitting on {a} <b>hay bale</b>' },
  sledge: { name: 'sledge', occupiable: true, onText: 'sitting on {a} <b>sledge</b>' },
  sleigh: { name: 'sleigh', occupiable: true, onText: 'sitting in {a} <b>sleigh</b>' },
  xtree: { name: 'Christmas tree', occupiable: false },
  pine: { name: 'snowy pine', occupiable: false },
  snowman: { name: 'snowman', occupiable: false },
  reindeer: { name: 'reindeer', occupiable: false },
  workbench: { name: 'workbench', occupiable: false },
  toyshelf: { name: 'toy shelf', occupiable: false },
  mailsack: { name: 'mail sack', occupiable: false },
  candycane: { name: 'candy cane', occupiable: false },
  gingerbread: { name: 'gingerbread house', occupiable: false },
  lantern: { name: 'lantern', occupiable: false },
  // a wrapped present hides one of the toys below; nobody knows which until it is worked out
  gift: { name: 'wrapped present', occupiable: false },
  drum: { name: 'drum', occupiable: false, toy: true },
  teddy: { name: 'teddy bear', occupiable: false, toy: true },
  train: { name: 'toy train', occupiable: false, toy: true },
  horse: { name: 'rocking horse', occupiable: false, toy: true },
  robot: { name: 'toy robot', occupiable: false, toy: true },
  top: { name: 'spinning top', occupiable: false, toy: true },
  duck: { name: 'rubber duck', occupiable: false, toy: true },
  kite: { name: 'kite', occupiable: false, toy: true },
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

// ---------- recipe 2: richer rooms ----------
// big: furniture that covers more than one square, as [kind, squares wide, squares tall, weight].
// These lists are separate from the originals above so that older cases never change.

export const MANOR_ROOMS2 = [
  { id: 'garden', name: 'Garden', outdoor: true, pattern: 'grass', objects: { tree: 3, bush: 3, bench: 2, fountain: 1 }, big: [['bench', 2, 1, 2]] },
  { id: 'terrace', name: 'Terrace', outdoor: true, pattern: 'tiles', objects: { bench: 2, bush: 2, fountain: 1, table: 1 }, big: [['bench', 2, 1, 2]] },
  { id: 'bedroom', name: 'Bedroom', pattern: 'boards', objects: { rug: 2, chair: 1, plant: 1, bed: 1 }, big: [['bed', 1, 2, 5], ['bed', 2, 1, 2], ['rug', 2, 2, 1]] },
  { id: 'library', name: 'Library', pattern: 'diag', objects: { shelf: 4, chair: 2, rug: 1, table: 1 }, big: [['shelf', 2, 1, 3], ['sofa', 2, 1, 1]] },
  { id: 'kitchen', name: 'Kitchen', pattern: 'tiles', objects: { stove: 2, table: 2, chair: 2, barrel: 1 }, big: [['table', 2, 1, 2]] },
  { id: 'parlour', name: 'Parlour', pattern: 'dots', objects: { piano: 2, chair: 2, rug: 1, plant: 1, fireplace: 1 }, big: [['sofa', 2, 1, 3], ['rug', 2, 2, 1]] },
  { id: 'dining', name: 'Dining Room', pattern: 'cross', objects: { chair: 3, plant: 1, table: 1 }, big: [['table', 2, 1, 4], ['table', 1, 2, 2]] },
  { id: 'study', name: 'Study', pattern: 'diag2', objects: { shelf: 2, table: 2, chair: 2, rug: 1, fireplace: 1 }, big: [['shelf', 2, 1, 2]] },
  { id: 'hall', name: 'Hallway', pattern: 'checker', objects: { plant: 2, rug: 2, chair: 1 }, big: [['rug', 2, 1, 2], ['rug', 1, 2, 2]] },
  { id: 'conservatory', name: 'Conservatory', pattern: 'hlines', objects: { plant: 4, bench: 2, fountain: 1, chair: 1 }, big: [['bench', 2, 1, 1]] },
  { id: 'cellar', name: 'Wine Cellar', pattern: 'cross', objects: { barrel: 4, shelf: 1, table: 1, chair: 1 }, big: [['shelf', 2, 1, 1]] },
  { id: 'ballroom', name: 'Ballroom', pattern: 'checker', objects: { piano: 1, chair: 2, plant: 1, rug: 1 }, big: [['sofa', 2, 1, 2], ['rug', 2, 2, 2]] },
];

export const ZETA_ROOMS2 = [
  { id: 'airlock', name: 'Airlock', pattern: 'hlines', objects: { crate: 3, grate: 2, console: 1 } },
  { id: 'hydroponics', name: 'Hydroponics', pattern: 'grass', objects: { hydro: 2, grate: 1, hoverchair: 1 }, big: [['hydro', 2, 1, 3], ['hydro', 1, 2, 2]] },
  { id: 'lab', name: 'Xeno Lab', pattern: 'tiles', objects: { specimen: 3, console: 2, hoverchair: 2 }, big: [['console', 2, 1, 1]] },
  { id: 'reactor', name: 'Reactor', pattern: 'cross', objects: { reactor: 2, console: 2, grate: 2 } },
  { id: 'mess', name: 'Mess Hall', pattern: 'checker', objects: { crate: 1, hoverchair: 3, console: 1 } },
  { id: 'sleepbay', name: 'Sleep Bay', pattern: 'boards', objects: { sleeppod: 2, crate: 1, grate: 1 }, big: [['sleeppod', 1, 2, 4], ['sleeppod', 2, 1, 2]] },
  { id: 'bridge', name: 'Command Deck', pattern: 'dots', objects: { console: 2, hoverchair: 3 }, big: [['console', 2, 1, 3]] },
  { id: 'vault', name: 'Specimen Vault', pattern: 'diag2', objects: { specimen: 4, grate: 2 } },
];

export const HAUNTED_ROOMS2 = [
  { id: 'graveyard', name: 'Graveyard', outdoor: true, pattern: 'grass', objects: { gravestone: 4, tree: 2, bench: 1 }, big: [['bench', 2, 1, 1]] },
  { id: 'seance', name: 'Séance Room', pattern: 'dots', objects: { candelabra: 2, chair: 3, mirror: 1, table: 1 }, big: [['table', 2, 1, 3]] },
  { id: 'crypt', name: 'Crypt', pattern: 'cross', objects: { coffin: 2, candelabra: 1, rug: 1 }, big: [['coffin', 1, 2, 3], ['coffin', 2, 1, 2]] },
  { id: 'attic', name: 'Attic', pattern: 'boards', objects: { wardrobe: 3, mirror: 2, rug: 1 }, big: [['rug', 2, 2, 1]] },
  { id: 'chapel', name: 'Chapel', pattern: 'checker', objects: { pew: 2, candelabra: 2 }, big: [['pew', 2, 1, 4]] },
  { id: 'hgallery', name: 'Portrait Hall', pattern: 'diag', objects: { mirror: 2, clock: 2, chair: 1, rug: 1 }, big: [['rug', 2, 1, 2], ['rug', 1, 2, 2]] },
  { id: 'hbedroom', name: 'Master Bedroom', pattern: 'hlines', objects: { wardrobe: 2, rug: 1, bed: 1 }, big: [['bed', 1, 2, 4], ['bed', 2, 1, 2]] },
  { id: 'music', name: 'Music Room', pattern: 'diag2', objects: { piano: 2, chair: 2, clock: 1 }, big: [['sofa', 2, 1, 2]] },
  { id: 'hparlour', name: 'Drawing Room', pattern: 'tiles', objects: { fireplace: 1, chair: 2, clock: 1, candelabra: 1 }, big: [['sofa', 2, 1, 3]] },
];

// ---------- Egypt ----------

export const EGYPT_ROOMS = [
  { id: 'burial', name: 'Burial Chamber', pattern: 'tiles', objects: { urn: 3, brazier: 1, mat: 2, sarcophagus: 1 }, big: [['sarcophagus', 1, 2, 4], ['sarcophagus', 2, 1, 3]] },
  { id: 'treasury', name: 'Treasury', pattern: 'dots', objects: { chest: 4, urn: 2, statue: 1, mat: 2 } },
  { id: 'embalm', name: 'Embalming Room', pattern: 'hlines', objects: { urn: 3, brazier: 2, mat: 2, chest: 1 } },
  { id: 'temple', name: 'Temple Hall', pattern: 'checker', objects: { pillar: 3, statue: 2, brazier: 1, mat: 2 } },
  { id: 'throne', name: 'Throne Room', pattern: 'diag', objects: { throne: 3, pillar: 2, mat: 1, statue: 1 } },
  { id: 'scribes', name: 'Hall of Scribes', pattern: 'boards', objects: { scrolls: 3, mat: 3, brazier: 1 } },
  { id: 'nile', name: 'Nile Bank', outdoor: true, pattern: 'grass', objects: { palm: 3, boat: 1, obelisk: 1, mat: 1 }, big: [['boat', 2, 1, 4]] },
  { id: 'court', name: 'Sphinx Court', outdoor: true, pattern: 'cross', objects: { obelisk: 2, statue: 2, palm: 2, mat: 2 } },
];

export const EGYPT_ROLES = [
  { id: 'priest', title: 'the High Priest', gender: 'm' }, { id: 'priestess', title: 'the High Priestess', gender: 'f' },
  { id: 'scribe', title: 'the Scribe', gender: 'any' }, { id: 'embalmer', title: 'the Embalmer', gender: 'any' },
  { id: 'vizier', title: 'the Vizier', gender: 'm' }, { id: 'queen', title: 'the Queen', gender: 'f' },
  { id: 'architect', title: 'the Architect', gender: 'any' }, { id: 'dancer', title: 'the Dancer', gender: 'f' },
  { id: 'robber', title: 'the Tomb Robber', gender: 'm' }, { id: 'merchant', title: 'the Merchant', gender: 'any' },
  { id: 'general', title: 'the General', gender: 'm' }, { id: 'fanbearer', title: 'the Fan-Bearer', gender: 'any' },
  { id: 'mason', title: 'the Stonemason', gender: 'm' }, { id: 'pharaoh', title: 'the Pharaoh', gender: 'any' },
];

export const EGYPT_NAMES = {
  f: ['Nefertari', 'Hatshepsut', 'Ankhesen', 'Tiye', 'Meritaten', 'Sitamun', 'Iset', 'Bintanath', 'Kiya',
    'Duathor', 'Renpet', 'Wadjet', 'Peseshet', 'Qalhata', 'Userit', 'Yunet', 'Zerah', 'Ohanna', 'Gilukhepa',
    'Ebana', 'Nitocris', 'Tausret', 'Henut', 'Maat'],
  m: ['Ramses', 'Imhotep', 'Khufu', 'Senmut', 'Djoser', 'Userkaf', 'Ptahmose', 'Yuya', 'Bek', 'Ahmose',
    'Horemheb', 'Thutmose', 'Menna', 'Nakht', 'Zannanza', 'Qenna', 'Wenamun', 'Ineni', 'Rekhmire', 'Kagemni',
    'Paneb', 'Sobek', 'Osorkon', 'Ebana', 'Ginger', 'Djehuty'],
};
EGYPT_NAMES.m = EGYPT_NAMES.m.filter((n) => n !== 'Ginger' && n !== 'Ebana');

// Masks of the gods: the suspects wore them, so on the board you place masks, not names.
export const MASKS = [
  { id: 'jackal', name: 'the Jackal', god: 'Anubis' }, { id: 'cat', name: 'the Cat', god: 'Bastet' },
  { id: 'falcon', name: 'the Falcon', god: 'Horus' }, { id: 'ibis', name: 'the Ibis', god: 'Thoth' },
  { id: 'lioness', name: 'the Lioness', god: 'Sekhmet' }, { id: 'ram', name: 'the Ram', god: 'Khnum' },
  { id: 'scarab', name: 'the Scarab', god: 'Khepri' }, { id: 'hippo', name: 'the Hippo', god: 'Taweret' },
  { id: 'baboon', name: 'the Baboon', god: 'Babi' }, { id: 'vulture', name: 'the Vulture', god: 'Nekhbet' },
];

export const EGYPT_PLACES = ['the Tomb of Khenti', 'the Temple of Sobek', 'the Valley of Whispers',
  'the Pyramid of Unas', 'the House of Eternity', 'the Palace at Thebes'];
export const EGYPT_HEADLINES = ['Murder in {estate}!', 'Death on the Nile Bank', 'A Curse at {estate}?',
  'The Mummy Did Not Do It', 'Sacrilege in {estate}'];
export const EGYPT_LEDES = [
  '{victim}, {vrole}, was found face down in the sand at {estate}. The priests blame a curse. You blame one of the {count} suspects.',
  'The torches went out in {estate}. When they were lit again, {victim} had joined the ancestors early. {count} suspects stood nearby.',
  'Somebody at {estate} could not wait for the afterlife to deal with {victim}. {count} suspects, and the gods are watching.',
];

// ---------- board shapes (recipe 2) ----------
// [name, weight]. A shape is a w x h grid; some cut squares away (notches, pyramid steps).
// The number of people is the shorter side, so every row (or every column) holds exactly one.

export const SHAPES = {
  sq5: { w: 5, h: 5 }, tall5: { w: 5, h: 6 }, wide5: { w: 6, h: 5 }, ell5: { w: 5, h: 7, notch: [2, 2] },
  sq6: { w: 6, h: 6 }, tall6: { w: 6, h: 7 }, wide6: { w: 7, h: 6 }, long6: { w: 6, h: 8 },
  ell6: { w: 6, h: 8, notch: [2, 2] }, ell6w: { w: 7, h: 6, notch: [1, 2] }, ell6t: { w: 6, h: 7, notch: [2, 1] },
  pyramid: { w: 7, h: 6, rows: [3, 3, 5, 5, 7, 7] }, pyramidApex: { w: 7, h: 6, rows: [1, 3, 5, 5, 7, 7] },
  // Christmas trees (recipe 3): the same stepped rows, with a star's worth of room at the top
  tree5: { w: 7, h: 5, rows: [1, 3, 5, 5, 7], tree: true }, tree6: { w: 7, h: 6, rows: [1, 3, 5, 5, 7, 7], tree: true },
};
const SHAPES_EASY = [['sq5', 3], ['tall5', 2], ['wide5', 2], ['ell5', 1]];
const SHAPES_FULL = [['sq6', 3], ['tall6', 2], ['wide6', 2], ['long6', 1], ['ell6', 1], ['ell6w', 1], ['ell6t', 1]];
const SHAPES_PYRAMID = [['pyramid', 3], ['pyramidApex', 2]];

// ---------- the North Pole: Who Killed Santa? (recipe 3) ----------

export const XMAS_ROOMS = [
  { id: 'yard', name: 'Snowy Yard', outdoor: true, pattern: 'snow', objects: { snowman: 3, pine: 3, sledge: 2, lantern: 1 } },
  { id: 'grove', name: 'Pine Grove', outdoor: true, pattern: 'snow', objects: { pine: 4, snowman: 1, bench: 2, lantern: 1 }, big: [['bench', 2, 1, 2]] },
  { id: 'workshop', name: 'Workshop', pattern: 'boards', objects: { workbench: 3, toyshelf: 2, stool: 3, barrel: 1 }, big: [['table', 2, 1, 2], ['shelf', 2, 1, 1]] },
  { id: 'stable', name: 'Reindeer Stable', pattern: 'hlines', objects: { reindeer: 3, hay: 3, barrel: 1, lantern: 1 } },
  { id: 'grotto', name: 'Fireside Den', pattern: 'diag', objects: { xtree: 1, fireplace: 2, chair: 2, rug: 1, shelf: 1 }, big: [['sofa', 2, 1, 2], ['rug', 2, 2, 1]] },
  { id: 'bakery', name: 'Cookie Kitchen', pattern: 'tiles', objects: { stove: 2, gingerbread: 2, stool: 2, table: 1, barrel: 1 }, big: [['table', 2, 1, 2]] },
  { id: 'mailroom', name: 'Mail Room', pattern: 'cross', objects: { mailsack: 4, bench: 2, table: 1, shelf: 1 }, big: [['shelf', 2, 1, 2], ['bench', 2, 1, 1]] },
  { id: 'shed', name: 'Sleigh Shed', pattern: 'diag2', objects: { sleigh: 1, barrel: 2, lantern: 2, stool: 1, workbench: 1 }, big: [['sleigh', 2, 1, 5]] },
  { id: 'bunks', name: 'Elf Bunkhouse', pattern: 'dots', objects: { rug: 2, wardrobe: 1, chair: 1, candycane: 1, bed: 1 }, big: [['bed', 1, 2, 4], ['bed', 2, 1, 2]] },
  { id: 'greathall', name: 'Great Hall', pattern: 'checker', objects: { xtree: 2, candycane: 2, chair: 2, rug: 1, fireplace: 1 }, big: [['sofa', 2, 1, 1], ['rug', 2, 2, 2], ['table', 2, 1, 1]] },
];

export const XMAS_ROLES = [
  { id: 'headelf', title: 'the Head Elf', gender: 'any' }, { id: 'toymaker', title: 'the Toymaker', gender: 'any' },
  { id: 'wrapper', title: 'the Gift Wrapper', gender: 'any' }, { id: 'baker', title: 'the Cookie Baker', gender: 'any' },
  { id: 'keeper', title: 'the Reindeer Keeper', gender: 'any' }, { id: 'postie', title: 'the Mail Sorter', gender: 'any' },
  { id: 'mechanic', title: 'the Sleigh Mechanic', gender: 'any' }, { id: 'listkeeper', title: 'the List Keeper', gender: 'any' },
  { id: 'sweep', title: 'the Chimney Sweep', gender: 'any' }, { id: 'brewer', title: 'the Cocoa Brewer', gender: 'any' },
  { id: 'tester', title: 'the Toy Tester', gender: 'any' }, { id: 'singer', title: 'the Carol Singer', gender: 'any' },
  { id: 'shoveller', title: 'the Snow Shoveller', gender: 'any' }, { id: 'watch', title: 'the Night Watch', gender: 'any' },
  { id: 'tinsel', title: 'the Tinsel Hanger', gender: 'any' }, { id: 'intern', title: 'the New Elf', gender: 'any' },
];
// no name starts with S: that letter belongs to Santa
export const XMAS_NAMES = {
  f: ['Holly', 'Ivy', 'Noelle', 'Merry', 'Joy', 'Carol', 'Ginger', 'Tinsel', 'Bells', 'Clementine', 'Winter', 'Pixie',
    'Eve', 'Robin', 'Faith', 'Angel', 'Juniper', 'Dove', 'Garland', 'Olive', 'Hazel', 'Zuzu', 'Poppy', 'Kiki', 'Lumi', 'Una', 'Wren', 'Yula'],
  m: ['Jingle', 'Pip', 'Bramble', 'Frost', 'Nutmeg', 'Tinker', 'Figgy', 'Alabaster', 'Bushy', 'Wunorse', 'Yule', 'Twinkle',
    'Cedar', 'Dash', 'Elwood', 'Mistle', 'Gumdrop', 'Humbug', 'Icicle', 'Quill', 'Zest', 'Obie', 'Ludo', 'Kringle', 'Rudy', 'Vixen', 'Hob', 'Uri'],
};
export const SANTA = { name: 'Santa', initial: 'S', gender: 'm', role: 'santa', title: 'Father Christmas', santa: true };
export const TOYS = ['drum', 'teddy', 'train', 'horse', 'robot', 'top', 'duck', 'kite'];
// wrapping paper, by present number
export const GIFT_WRAPS = [
  { name: 'red', paper: '#e0605a', ribbon: '#f3c24f' },
  { name: 'green', paper: '#5fb26a', ribbon: '#fffaf0' },
  { name: 'blue', paper: '#6fa3e0', ribbon: '#f29b4b' },
  { name: 'purple', paper: '#a58bd3', ribbon: '#f3c24f' },
];
export const XMAS_PLACES = ['the North Pole Workshop', "Santa's Village", 'the Toy Works', 'the Reindeer Lodge', 'the North Pole'];
export const XMAS_HEADLINES = ['Who Killed Santa?', 'Not Again, Santa!', 'Ho Ho… Oh No', 'Silent Night, Deadly Night Shift',
  'Santa Down at {estate}', 'Coal for Somebody This Year', 'Slay Bells Ring'];
export const XMAS_LEDES = [
  'Santa was found face down in the tinsel at {estate}, days before the big night. {count} elves were on shift. One of them is getting coal.',
  'The sleigh bells stopped at {estate}. Santa lay still beside a half-eaten mince pie, and {count} elves swear they saw nothing.',
  'Somebody at {estate} has done Santa in. Again. {count} suspects, one sack of alibis, and Christmas is not going to save itself.',
  'It was a quiet night at {estate} until Santa hit the floor. {count} elves were close enough to have done it.',
];
// Santa is the victim every time, so every ending explains why he will be back for the next case.
export const XMAS_EPILOGUES = [
  'Good news: Santa comes round an hour later with a fruitcake-shaped bump. He will be fine by the 24th.',
  'Good news: it was only one of the stand-in Santas. The real one was asleep in the sleigh the whole time.',
  'Mrs Claus sighs, fetches the smelling salts and a mince pie, and Santa is back on his feet by teatime.',
  'A little Christmas magic and a lot of cocoa later, Santa is sitting up and asking who ate his biscuits.',
  'The doctor elf says it is nothing a nap and a new hat will not fix. Santa has had worse from chimneys.',
  'Santa wakes up, remembers nothing, and gives everybody a present anyway. Except one elf.',
];

// ---------- the theme registry ----------
// rules per difficulty switch on each theme's twist.

export const THEMES = {
  manor: {
    id: 'manor', name: 'The Manor', short: 'Manor', cast: 'human',
    rooms: ROOM_TYPES, roles: ROLES, places: ESTATES, headlines: HEADLINES, ledes: LEDES,
    rules: { easy: {}, medium: {}, hard: {} },
    rooms2: MANOR_ROOMS2, shapes: { easy: SHAPES_EASY, medium: SHAPES_FULL, hard: SHAPES_FULL },
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
    rooms2: ZETA_ROOMS2,
    shapes: { easy: SHAPES_EASY, medium: SHAPES_FULL, hard: [['sq6', 3], ['tall6', 2], ['wide6', 2], ['ell6t', 1]] },
  },
  haunted: {
    id: 'haunted', name: 'Hollow Hill House', short: 'Hollow Hill', cast: 'human',
    rooms: HAUNTED_ROOMS, roles: ROLES, places: HAUNTED_PLACES, headlines: HAUNTED_HEADLINES, ledes: HAUNTED_LEDES,
    rules: { easy: { ghost: true }, medium: { ghost: true }, hard: { ghost: true } },
    rooms2: HAUNTED_ROOMS2, shapes: { easy: SHAPES_EASY, medium: SHAPES_FULL, hard: SHAPES_FULL },
  },
  // Egypt only exists from recipe 2 on.
  egypt: {
    id: 'egypt', name: 'Sands of Egypt', short: 'Egypt', cast: 'egypt', minGen: 2,
    rooms: EGYPT_ROOMS, roles: EGYPT_ROLES, names: EGYPT_NAMES, places: EGYPT_PLACES, headlines: EGYPT_HEADLINES, ledes: EGYPT_LEDES,
    rules: { easy: { masks: true }, medium: {}, hard: { masks: true } },
    rooms2: EGYPT_ROOMS,
    shapes: { easy: [['sq5', 3], ['tall5', 1], ['wide5', 1]], medium: SHAPES_PYRAMID, hard: SHAPES_PYRAMID },
    targets: { hard: { minLevel: 1, maxInitialSingles: 1 } },
  },
  // Who Killed Santa? only exists from recipe 3 on, and has a fixed number of cases per desk.
  xmas: {
    id: 'xmas', name: 'Who Killed Santa?', short: 'North Pole', cast: 'elf', minGen: 3, caseLimit: 30,
    rooms: XMAS_ROOMS, roles: XMAS_ROLES, names: XMAS_NAMES, places: XMAS_PLACES, headlines: XMAS_HEADLINES, ledes: XMAS_LEDES,
    rules: { easy: { list: true }, medium: { presents: 3 }, hard: { list: true, smudged: true, presents: 3 } },
    rooms2: XMAS_ROOMS,
    shapes: {
      easy: [['sq5', 5], ['tall5', 2], ['wide5', 2], ['ell5', 1]],
      medium: SHAPES_FULL,
      hard: [['sq6', 4], ['tall6', 2], ['wide6', 2], ['ell6t', 1], ['ell6w', 1]],
    },
    // now and then the whole board is a Christmas tree: these case numbers, and no others
    treeShapes: { easy: 'tree5', medium: 'tree6', hard: 'tree6' },
    treeCases: { easy: [8, 19, 27], medium: [6, 15, 24], hard: [11, 22, 30] },
    targets: { medium: { relMax: 1 }, hard: { minLevel: 1, maxInitialSingles: 1, relMax: 2 } },
  },
};
