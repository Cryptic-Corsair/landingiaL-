export type SiteTheme = 'cream' | 'plum';
export type PreviewThemeId = 'cream' | 'plum' | 'dune' | 'classic';
export type MoodSwatchId = 'classic' | 'cream' | 'dune' | 'midnight';

export interface GlobalMetrics {
  units: number;
  topics: number;
  hoursLabel: string;
  totalMinutes: number;
  workedExamples: number;
}

export interface IalUnit {
  code: 'WCH11' | 'WCH12' | 'WCH13' | 'WCH14' | 'WCH15' | 'WCH16';
  shortLabel: string;
  levelTag: string;
  title: string;
  topicsCount: number;
  minutes: number;
  accentHex: string;
  scope: string;
  sampleTopics: string[];
}

export interface SpecChip {
  id: string;
  code: string;
  label: string;
  unitCode: IalUnit['code'];
  minutes: number;
  pages: number;
  accentHex: string;
}

export interface SearchEntry {
  id: string;
  kind: 'unit' | 'topic';
  code: string;
  title: string;
  unitCode: IalUnit['code'];
  unitTitle: string;
  category: string;
  minutes: number;
  targetAnchor: string;
  keywords: string[];
}

export interface PreviewThemeTokens {
  id: PreviewThemeId;
  label: string;
  bg: string;
  surface: string;
  surfaceElevated: string;
  ink: string;
  inkMuted: string;
  border: string;
  accent: string;
  useSerifHeading: boolean;
}

export interface HeroTabData {
  id: 'definitions' | 'equations' | 'examples';
  label: string;
  commandQuery: string;
  unitLabel: string;
  title: string;
  meta: string;
  blocks: Array<{ key: string; detail: string; metric: string }>;
}

export interface MoodSwatch {
  id: MoodSwatchId;
  name: string;
  tag: string;
  bg: string;
  surface: string;
  ink: string;
  inkMuted: string;
  border: string;
  accent: string;
  useSerifHeading: boolean;
}

export interface SandboxPillDef {
  id: string;
  label: string;
  color: string;
  textColor: string;
}

export const GLOBAL_METRICS: GlobalMetrics = {
  units: 6,
  topics: 33,
  hoursLabel: '~13 Hours',
  totalMinutes: 756,
  workedExamples: 30,
};

export const IAL_UNITS: readonly IalUnit[] = [
  {
    code: 'WCH11',
    shortLabel: 'Unit 1 · IAS',
    levelTag: 'IAS',
    title: 'Structure, Bonding and Introduction to Organic Chemistry',
    topicsCount: 5,
    minutes: 120,
    accentHex: '#FF5C35',
    scope: 'Topics 1–5: Formulae, atomic structure, bonding, periodicity, and alkanes/alkenes.',
    sampleTopics: [
      'Topic 1 · Formulae, equations and amounts',
      'Topic 2 · Atomic structure and periodicity',
      'Topic 3 · Bonding and structure',
      'Topic 4 · Introductory organic chemistry',
      'Topic 5 · Alkenes and reaction pathways',
    ],
  },
  {
    code: 'WCH12',
    shortLabel: 'Unit 2 · IAS',
    levelTag: 'IAS',
    title: 'Energetics, Group Chemistry, Halogenoalkanes and Alcohols',
    topicsCount: 5,
    minutes: 130,
    accentHex: '#8B5CF6',
    scope: 'Topics 6–10: Enthalpy, kinetics, equilibria, Group 1/2/7, and organic mechanisms.',
    sampleTopics: [
      'Topic 6 · Energetics and Hess cycles',
      'Topic 7 · Intermolecular forces',
      'Topic 8 · Redox and Group 1, 2 & 7',
      'Topic 9 · Kinetics and equilibria',
      'Topic 10 · Halogenoalkanes, alcohols and spectra',
    ],
  },
  {
    code: 'WCH13',
    shortLabel: 'Unit 3 · IAS · Practical',
    levelTag: 'Practical',
    title: 'Practical Skills in Chemistry I',
    topicsCount: 9,
    minutes: 182,
    accentHex: '#14B8A6',
    scope: 'Qualitative ion and gas tests, core practicals, apparatus rigs, and uncertainty.',
    sampleTopics: [
      'Qualitative anion and cation analysis',
      'Gas identification procedures',
      'Titration accuracy and burette precision',
      'Percentage uncertainty propagation',
    ],
  },
  {
    code: 'WCH14',
    shortLabel: 'Unit 4 · IA2',
    levelTag: 'IA2',
    title: 'Rates, Equilibria and Further Organic Chemistry',
    topicsCount: 6,
    minutes: 142,
    accentHex: '#F59E0B',
    scope: 'Topics 11–16: Rate equations, entropy, acid–base equilibria, carbonyls, and chirality.',
    sampleTopics: [
      'Topic 11 · Kinetics and rate equations',
      'Topic 12 · Entropy and energetics',
      'Topic 13 · Chemical equilibria',
      'Topic 14 · Acid–base equilibria and buffers',
      'Topic 15 · Chirality, carbonyls and carboxylic acids',
    ],
  },
  {
    code: 'WCH15',
    shortLabel: 'Unit 5 · IA2',
    levelTag: 'IA2',
    title: 'Transition Metals and Organic Nitrogen Chemistry',
    topicsCount: 5,
    minutes: 122,
    accentHex: '#EC4899',
    scope: 'Topics 17–21: Electrode potentials, transition complexes, arenes, and nitrogen synthesis.',
    sampleTopics: [
      'Topic 17 · Redox equilibria and electrode potentials',
      'Topic 18 · Transition metals and ligand exchange',
      'Topic 19 · Arenes and electrophilic substitution',
      'Topic 20 · Organic nitrogen compounds',
      'Topic 21 · Multi-stage organic synthesis',
    ],
  },
  {
    code: 'WCH16',
    shortLabel: 'Unit 6 · IA2 · Practical',
    levelTag: 'Practical',
    title: 'Practical Skills in Chemistry II',
    topicsCount: 3,
    minutes: 60,
    accentHex: '#3B82F6',
    scope: 'A2 kinetics experiments, organic synthesis techniques, and practical exam method.',
    sampleTopics: [
      'Continuous and initial-rate kinetics rigs',
      'Reflux, distillation and recrystallisation',
      'Planning and evaluation method',
    ],
  },
];

export const SPEC_CHIPS: readonly SpecChip[] = [
  {
    id: 'spec-1.4c',
    code: '1.4c',
    label: 'Ionisation energy trends',
    unitCode: 'WCH11',
    minutes: 8,
    pages: 3,
    accentHex: '#FF5C35',
  },
  {
    id: 'spec-2.7a',
    code: '2.7a',
    label: 'Hess cycle templates',
    unitCode: 'WCH12',
    minutes: 10,
    pages: 4,
    accentHex: '#8B5CF6',
  },
  {
    id: 'spec-4.3b',
    code: '4.3b',
    label: 'Buffer pH calculations',
    unitCode: 'WCH14',
    minutes: 12,
    pages: 5,
    accentHex: '#F59E0B',
  },
  {
    id: 'spec-5.2e',
    code: '5.2e',
    label: 'Electrophilic substitution',
    unitCode: 'WCH15',
    minutes: 8,
    pages: 4,
    accentHex: '#EC4899',
  },
];

export const SEARCH_ITEMS: readonly SearchEntry[] = [
  ...IAL_UNITS.map((unit) => ({
    id: `unit-${unit.code}`,
    kind: 'unit' as const,
    code: unit.code,
    title: unit.title,
    unitCode: unit.code,
    unitTitle: unit.shortLabel,
    category: unit.levelTag,
    minutes: unit.minutes,
    targetAnchor: '#units',
    keywords: [unit.scope, ...unit.sampleTopics],
  })),
  {
    id: 'topic-atomic',
    kind: 'topic',
    code: '1.4c',
    title: 'Atomic Structure & Ionisation Energy',
    unitCode: 'WCH11',
    unitTitle: 'WCH11 · Unit 1',
    category: 'Spec 1.4c',
    minutes: 22,
    targetAnchor: '#units',
    keywords: ['orbitals', 'subshells', 'successive ionisation', 'periodicity'],
  },
  {
    id: 'topic-hess',
    kind: 'topic',
    code: '2.7a',
    title: "Enthalpy Cycles & Hess's Law",
    unitCode: 'WCH12',
    unitTitle: 'WCH12 · Unit 2',
    category: 'Spec 2.7a',
    minutes: 25,
    targetAnchor: '#units',
    keywords: ['hess cycle', 'calorimetry', 'mean bond enthalpy'],
  },
  {
    id: 'topic-flame',
    kind: 'topic',
    code: '3.2a',
    title: 'Flame Tests & Uncertainty Propagation',
    unitCode: 'WCH13',
    unitTitle: 'WCH13 · Unit 3',
    category: 'IAS Practical',
    minutes: 24,
    targetAnchor: '#units',
    keywords: ['burette', 'pipette', 'percentage error', 'ion test', 'flame'],
  },
  {
    id: 'topic-buffers',
    kind: 'topic',
    code: '4.3b',
    title: 'Buffer pH & Acid–Base Equilibria',
    unitCode: 'WCH14',
    unitTitle: 'WCH14 · Unit 4',
    category: 'Spec 4.3b',
    minutes: 26,
    targetAnchor: '#units',
    keywords: ['pH', 'Ka', 'pKa', 'henderson', 'weak acid', 'buffer'],
  },
  {
    id: 'topic-arenes',
    kind: 'topic',
    code: '5.2e',
    title: 'Arenes & Transition Complexes',
    unitCode: 'WCH15',
    unitTitle: 'WCH15 · Unit 5',
    category: 'Spec 5.2e',
    minutes: 24,
    targetAnchor: '#units',
    keywords: ['benzene', 'nitration', 'ligand exchange', 'electrode potential'],
  },
  {
    id: 'topic-kinetics-2',
    kind: 'topic',
    code: '6.1c',
    title: 'A2 Kinetics & Organic Synthesis Method',
    unitCode: 'WCH16',
    unitTitle: 'WCH16 · Unit 6',
    category: 'IA2 Practical',
    minutes: 20,
    targetAnchor: '#units',
    keywords: ['iodine clock', 'recrystallisation', 'distillation', 'reflux'],
  },
];

export const PREVIEW_THEMES: Record<PreviewThemeId, PreviewThemeTokens> = {
  cream: {
    id: 'cream',
    label: 'Cream',
    bg: '#FFF6EA',
    surface: '#FFFDF9',
    surfaceElevated: '#F5EBD9',
    ink: '#1E1A26',
    inkMuted: '#6A6178',
    border: 'rgba(30, 26, 38, 0.12)',
    accent: '#FF5C35',
    useSerifHeading: false,
  },
  plum: {
    id: 'plum',
    label: 'Plum',
    bg: '#15121C',
    surface: '#1E1A26',
    surfaceElevated: '#282334',
    ink: '#FFF6EA',
    inkMuted: '#A89EC0',
    border: 'rgba(255, 246, 234, 0.12)',
    accent: '#8B5CF6',
    useSerifHeading: false,
  },
  dune: {
    id: 'dune',
    label: 'Dune',
    bg: '#EFE4D1',
    surface: '#F7EFE0',
    surfaceElevated: '#E5D6BC',
    ink: '#2A2218',
    inkMuted: '#6D5E4C',
    border: 'rgba(42, 34, 24, 0.14)',
    accent: '#D97706',
    useSerifHeading: false,
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    bg: '#FFFDF8',
    surface: '#FFFFFF',
    surfaceElevated: '#F2EFE9',
    ink: '#18181B',
    inkMuted: '#60606A',
    border: 'rgba(24, 24, 27, 0.13)',
    accent: '#14B8A6',
    useSerifHeading: true,
  },
};

export const HERO_PREVIEW_TABS: readonly HeroTabData[] = [
  {
    id: 'definitions',
    label: '01 Definitions',
    commandQuery: 'spec:1.4c ionisation',
    unitLabel: 'WCH11 · Topic 2 · Spec 1.4c',
    title: 'Exact specification phrasing',
    meta: '14 min read · 4 mark-scheme checks',
    blocks: [
      { key: 'Statement 1.4c', detail: 'Verbatim mark-scheme cues highlighted cleanly inline', metric: '2 marks' },
      { key: 'Boundary rule', detail: 'State symbols and per-mole conditions isolated at a glance', metric: 'Verified' },
      { key: 'Quick jump', detail: 'Cross-referenced directly with Topic 8 & Topic 12', metric: '⌘K' },
    ],
  },
  {
    id: 'equations',
    label: '02 Equations',
    commandQuery: 'spec:4.3b buffers',
    unitLabel: 'WCH14 · Topic 14 · Spec 4.3b',
    title: 'Structured calculation flow',
    meta: '16 min read · 6 worked templates',
    blocks: [
      { key: 'Step order', detail: 'Molar ratio check isolated before Ka substitution', metric: '3 steps' },
      { key: 'Sig-fig guard', detail: 'Volume dm³ conversions flagged inside margin notes', metric: '3 s.f.' },
      { key: 'Pack export', detail: 'Bundle straight into a one-sheet printable study pack', metric: 'Ready' },
    ],
  },
  {
    id: 'examples',
    label: '03 Examples',
    commandQuery: 'spec:5.2e synthesis',
    unitLabel: 'WCH15 · Topic 21 · Spec 5.2e',
    title: 'Guided mark allocation',
    meta: '14 min read · Example 19 of 30',
    blocks: [
      { key: 'Step 01 · Reagent', detail: 'Reagent and condition pair isolated in structured callout', metric: 'M1' },
      { key: 'Step 02 · Route', detail: 'Intermediate verification checkpoint prior to yield check', metric: 'M2' },
      { key: 'Step 03 · Trap guard', detail: 'Examiner deduction warning flagged before final answer', metric: 'M3' },
    ],
  },
];

export const MOOD_SWATCHES: readonly MoodSwatch[] = [
  {
    id: 'classic',
    name: 'Classic Lab',
    tag: '#FFFDF8',
    bg: '#FFFDF8',
    surface: '#FFFFFF',
    ink: '#18181B',
    inkMuted: '#5C5C66',
    border: 'rgba(24, 24, 27, 0.12)',
    accent: '#14B8A6',
    useSerifHeading: true,
  },
  {
    id: 'cream',
    name: 'Daylight Cream',
    tag: '#FFF6EA',
    bg: '#FFF6EA',
    surface: '#FFFDF9',
    ink: '#1E1A26',
    inkMuted: '#6A6178',
    border: 'rgba(30, 26, 38, 0.12)',
    accent: '#FF5C35',
    useSerifHeading: false,
  },
  {
    id: 'dune',
    name: 'Warm Dune',
    tag: '#EFE4D1',
    bg: '#EFE4D1',
    surface: '#F7EFE0',
    ink: '#2A2218',
    inkMuted: '#6D5E4C',
    border: 'rgba(42, 34, 24, 0.15)',
    accent: '#F59E0B',
    useSerifHeading: false,
  },
  {
    id: 'midnight',
    name: 'Midnight Mood',
    tag: '#15121C',
    bg: '#15121C',
    surface: '#1E1A26',
    ink: '#FFF6EA',
    inkMuted: '#A89EC0',
    border: 'rgba(255, 246, 234, 0.14)',
    accent: '#8B5CF6',
    useSerifHeading: false,
  },
];

export const SANDBOX_PILLS: readonly SandboxPillDef[] = [
  { id: 'pill-wch11', label: 'WCH11', color: '#FF5C35', textColor: '#FFFDF9' },
  { id: 'pill-wch12', label: 'WCH12', color: '#8B5CF6', textColor: '#FFFDF9' },
  { id: 'pill-wch13', label: 'WCH13', color: '#14B8A6', textColor: '#0E1F1D' },
  { id: 'pill-wch14', label: 'WCH14', color: '#F59E0B', textColor: '#1E1A26' },
  { id: 'pill-wch15', label: 'WCH15', color: '#EC4899', textColor: '#FFFDF9' },
  { id: 'pill-wch16', label: 'WCH16', color: '#3B82F6', textColor: '#FFFDF9' },
  { id: 'pill-topics', label: '33 Topics', color: '#1E1A26', textColor: '#FFF6EA' },
  { id: 'pill-examples', label: '30 Examples', color: '#F5EBD9', textColor: '#1E1A26' },
  { id: 'pill-spec', label: 'Spec 1.4c', color: '#FF5C35', textColor: '#FFFDF9' },
  { id: 'pill-daily', label: 'Daily Pick', color: '#14B8A6', textColor: '#0E1F1D' },
  { id: 'pill-cmdk', label: '⌘K Search', color: '#8B5CF6', textColor: '#FFFDF9' },
  { id: 'pill-pack', label: 'Revision Pack', color: '#1E1A26', textColor: '#FFF6EA' },
  { id: 'pill-flame', label: 'Flame Tests', color: '#F59E0B', textColor: '#1E1A26' },
  { id: 'pill-buffer', label: 'Buffer pH', color: '#3B82F6', textColor: '#FFFDF9' },
];
