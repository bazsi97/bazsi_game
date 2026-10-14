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
