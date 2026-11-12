export type SiteTheme = 'obsidian' | 'cream';
export type PreviewThemeId = 'dark' | 'cream' | 'dune' | 'classic';

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
  id: 'definitions' | 'equations' | 'worked';
  indexLabel: string;
  label: string;
  commandQuery: string;
  unitLabel: string;
  title: string;
  meta: string;
  lines: Array<{ key: string; detail: string; metric: string }>;
}

export interface WorkflowChapter {
  id: 'pinpoint' | 'assemble' | 'retain';
  index: string;
  label: string;
  summary: string;
  detail: string;
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
    label: '1.4c · Ionisation energy trends',
    unitCode: 'WCH11',
    minutes: 14,
    pages: 4,
  },
  {
    id: 'spec-2.7a',
    code: '2.7a',
    label: '2.7a · Hess cycle calculations',
    unitCode: 'WCH12',
    minutes: 12,
    pages: 5,
  },
  {
    id: 'spec-4.3b',
    code: '4.3b',
    label: '4.3b · Buffer calculations',
    unitCode: 'WCH14',
    minutes: 16,
    pages: 6,
  },
  {
    id: 'spec-5.2e',
    code: '5.2e',
    label: '5.2e · Electrophilic substitution',
    unitCode: 'WCH15',
    minutes: 14,
    pages: 5,
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
    id: 'topic-1',
    kind: 'topic',
    code: 'Topic 1',
    title: 'Topic 1 · Amount of substance',
    unitCode: 'WCH11',
    unitTitle: 'WCH11 · Unit 1',
    category: 'IAS Topic',
    minutes: 24,
    targetAnchor: '#units',
    keywords: ['moles', 'titration', 'empirical formula', 'ideal gas'],
  },
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
    id: 'topic-6',
    kind: 'topic',
    code: 'Topic 6',
    title: 'Topic 6 · Energetics',
    unitCode: 'WCH12',
    unitTitle: 'WCH12 · Unit 2',
    category: 'IAS Topic',
    minutes: 26,
    targetAnchor: '#units',
    keywords: ['enthalpy', 'combustion', 'formation', 'bond enthalpy'],
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
    id: 'topic-maxwell',
    kind: 'topic',
    code: '2.9b',
    title: 'Maxwell–Boltzmann & Equilibria',
    unitCode: 'WCH12',
    unitTitle: 'WCH12 · Unit 2',
    category: 'Spec 2.9b',
    minutes: 24,
    targetAnchor: '#units',
    keywords: ['activation energy', 'catalyst', 'le chatelier', 'yield'],
  },
  {
    id: 'topic-practical-1',
    kind: 'topic',
    code: '3.2a',
    title: 'Core Practicals & Uncertainty',
    unitCode: 'WCH13',
    unitTitle: 'WCH13 · Unit 3',
    category: 'IAS Practical',
    minutes: 28,
    targetAnchor: '#units',
    keywords: ['burette', 'pipette', 'percentage error', 'ion test'],
  },
  {
    id: 'topic-titration',
    kind: 'topic',
    code: 'CP 02',
    title: 'Core Practical · Titration & uncertainty',
    unitCode: 'WCH13',
    unitTitle: 'WCH13 · Unit 3',
    category: 'IAS Practical',
    minutes: 20,
    targetAnchor: '#units',
    keywords: ['standard solution', 'concordant titres', 'apparatus uncertainty'],
  },
  {
    id: 'topic-13',
    kind: 'topic',
    code: 'Topic 13',
    title: 'Topic 13 · Acid–base equilibria',
    unitCode: 'WCH14',
    unitTitle: 'WCH14 · Unit 4',
    category: 'IA2 Topic',
    minutes: 28,
    targetAnchor: '#units',
    keywords: ['pH', 'Ka', 'pKa', 'buffer', 'titration curve'],
  },
  {
    id: 'topic-buffers',
    kind: 'topic',
    code: '4.3b',
    title: 'Buffer Calculations & Titration Curves',
    unitCode: 'WCH14',
    unitTitle: 'WCH14 · Unit 4',
    category: 'Spec 4.3b',
    minutes: 22,
    targetAnchor: '#units',
    keywords: ['henderson', 'weak acid', 'equivalence point', 'indicator'],
  },
  {
    id: 'topic-18',
    kind: 'topic',
    code: 'Topic 18',
    title: 'Topic 18 · Transition metals',
    unitCode: 'WCH15',
    unitTitle: 'WCH15 · Unit 5',
    category: 'IA2 Topic',
    minutes: 26,
    targetAnchor: '#units',
    keywords: ['d-block', 'ligands', 'coordination', 'redox catalyst'],
  },
  {
    id: 'topic-arenes',
    kind: 'topic',
    code: '5.2e',
    title: 'Transition Metal Complexes & Arenes',
    unitCode: 'WCH15',
    unitTitle: 'WCH15 · Unit 5',
    category: 'Spec 5.2e',
    minutes: 24,
    targetAnchor: '#units',
    keywords: ['benzene', 'nitration', 'friedel-crafts', 'ligand exchange'],
  },
  {
    id: 'topic-a2-kinetics',
    kind: 'topic',
    code: '6.1c',
    title: 'A2 Kinetics & Organic Analysis',
    unitCode: 'WCH16',
    unitTitle: 'WCH16 · Unit 6',
    category: 'IA2 Practical',
    minutes: 20,
    targetAnchor: '#units',
    keywords: ['iodine clock', 'recrystallisation', 'melting point', 'synthesis'],
  },
];

export const PREVIEW_THEMES: Record<PreviewThemeId, PreviewThemeTokens> = {
  dark: {
    id: 'dark',
    label: 'Dark',
    bg: '#0E0C12',
    surface: '#16131D',
    surfaceElevated: '#1F1B29',
    ink: '#FFF6EA',
    inkMuted: '#9D94B8',
    border: 'rgba(255, 246, 234, 0.11)',
    accent: '#C4B5FD',
    useSerifHeading: false,
  },
  cream: {
    id: 'cream',
    label: 'Cream',
    bg: '#FAF7F2',
    surface: '#FFFDF9',
    surfaceElevated: '#F3EDE2',
    ink: '#1E1A26',
    inkMuted: '#635B73',
    border: 'rgba(30, 26, 38, 0.12)',
    accent: '#4F46E5',
    useSerifHeading: false,
  },
  dune: {
    id: 'dune',
    label: 'Dune',
    bg: '#E8DEC9',
    surface: '#EFE6D5',
    surfaceElevated: '#E2D6BE',
    ink: '#2A2218',
    inkMuted: '#6A5D4D',
    border: 'rgba(42, 34, 24, 0.14)',
    accent: '#C26D3D',
    useSerifHeading: false,
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    bg: '#F7ECE0',
    surface: '#FFF6EA',
    surfaceElevated: '#EFE3D3',
    ink: '#1E1A26',
    inkMuted: '#5B5368',
    border: 'rgba(46, 41, 58, 0.22)',
    accent: '#2E293A',
    useSerifHeading: true,
  },
};

export const HERO_PREVIEW_TABS: readonly HeroTabData[] = [
  {
    id: 'definitions',
    indexLabel: '01',
    label: '01 Definitions',
    commandQuery: 'spec:1.4c ionisation',
    unitLabel: 'WCH11 · Topic 2 · Spec 1.4c',
    title: 'Indexed specification language',
    meta: '14 min read · 4 mark-scheme checks',
    lines: [
      { key: 'Statement 1.4c', detail: 'First-principles phrasing matched to Pearson mark schemes', metric: '2 marks' },
      { key: 'Examiner boundary', detail: 'Mandatory state symbols and per-mole conditions highlighted', metric: 'Verified' },
      { key: 'Quick jump', detail: 'Cross-linked directly to Topic 8 & Topic 12 comparisons', metric: '⌘K' },
    ],
  },
  {
    id: 'equations',
    indexLabel: '02',
    label: '02 Equations',
    commandQuery: 'spec:4.3b equilibria',
    unitLabel: 'WCH14 · Topic 14 · Spec 4.3b',
    title: 'Structured calculation templates',
    meta: '16 min read · 6 worked prompts',
    lines: [
      { key: 'Step sequence', detail: 'Balanced molar ratios isolated before substitution', metric: '3 steps' },
      { key: 'Unit consistency', detail: 'dm³ conversions and significant-figure checkpoints inline', metric: '3 sig fig' },
      { key: 'Pack export', detail: 'Include directly inside custom single-sheet revision packs', metric: 'Ready' },
    ],
  },
  {
    id: 'worked',
    indexLabel: '03',
    label: '03 Worked Example',
    commandQuery: 'spec:5.2e synthesis',
    unitLabel: 'WCH15 · Topic 21 · Spec 5.2e',
    title: 'Step-by-step mark allocation',
    meta: '14 min read · Worked sequence 19/30',
    lines: [
      { key: 'Mark 1 · Reagent', detail: 'Reagent & condition pair isolated in high-contrast callout', metric: 'M1' },
      { key: 'Mark 2 · Intermediate', detail: 'Intermediate route checkpoint verified prior to final step', metric: 'M2' },
      { key: 'Mark 3 · Evaluation', detail: 'Common deduction traps flagged before exam submission', metric: 'M3' },
    ],
  },
];

export const WORKFLOW_CHAPTERS: readonly WorkflowChapter[] = [
  {
    id: 'pinpoint',
    index: '01',
    label: 'Pinpoint',
    summary: 'Start from the exact specification index.',
    detail: 'Filter by unit code, core practical, or statement number without digging through bloated PDFs.',
  },
  {
    id: 'assemble',
    index: '02',
    label: 'Assemble',
    summary: 'Merge selected notes into one continuous read.',
    detail: 'Toggle individual specification statements to compile a focused, timed revision pack in seconds.',
  },
  {
    id: 'retain',
    index: '03',
    label: 'Retain',
    summary: 'Track completion and time spent across every unit.',
    detail: 'Private local progress logs keep topic readiness, worked examples, and weekly pace in view.',
  },
];
