import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    subject: 'Math',
    grade: '9th Grade',
    question: 'In the Thales Theorem configuration on triangle ABC with (MN) // (BC) where M ∈ [AB] and N ∈ [AC], which ratio relationship is always true?',
    options: [
      'AM / AB = AN / AC = MN / BC',
      'AM / MB = AN / NC = BC / MN',
      'AB / AM = AC / AN = BC / MN',
      'AM + AN = MB + NC'
    ],
    correctIndex: 0,
    explanation: 'By Thales theorem on parallel lines intersecting triangle sides, the side ratios are equal: AM / AB = AN / AC = MN / BC.'
  },
  {
    id: 'q2',
    subject: 'Arabic',
    grade: '9th Grade',
    question: 'ما هو وزن تصغير الاسم الرباعي (مثل: دِرْهَم - مَسْجِد) في قواعد اللغة العربية؟',
    options: [
      'فُعَيْل',
      'فُعَيْعِل',
      'فُعَيْعِيل',
      'مُفَيْعِل'
    ],
    correctIndex: 1,
    explanation: 'يصغر الاسم الرباعي على وزن (فُعَيْعِل) بضم أوله وفتح ثانيه وزيادة ياء ساكنة تسمى ياء التصغير وكسر ما بعدها (مَسْجِد -> مُسَيْجِد).'
  },
  {
    id: 'q3',
    subject: 'Science',
    grade: '9th Grade',
    question: 'What is the junction area called through which a nerve impulse is transmitted between two neurons?',
    options: [
      'Axon hillock',
      'Myelin sheath',
      'Synapse',
      'Dendrite node'
    ],
    correctIndex: 2,
    explanation: 'A synapse is the microscopic biological junction across which electrical or chemical signals travel from an axon terminal to the recipient neuron or effector cell.'
  },
  {
    id: 'q4',
    subject: 'English',
    grade: '9th Grade',
    question: 'Choose the correct connector: "Plastic pollution continues to endanger marine life _______ many countries have banned single-use bags."',
    options: [
      'because of',
      'even though',
      'therefore',
      'in order to'
    ],
    correctIndex: 1,
    explanation: '"Even though" is a concessive connector showing contrast between ongoing pollution and legislative bans.'
  },
  {
    id: 'q5',
    subject: 'Physics',
    grade: 'Freshman',
    question: 'What is the relationship between the amount of substance (n in moles), mass (m in g), and molar mass (M in g/mol)?',
    options: [
      'n = m × M',
      'n = m / M',
      'n = M / m',
      'n = m + M'
    ],
    correctIndex: 1,
    explanation: 'The fundamental mole quantity formula is n = m / M, where mass in grams is divided by molar mass in g/mol.'
  },
  {
    id: 'q6',
    subject: 'French',
    grade: '9th Grade',
    question: 'Dans la phrase : "L’élève a réussi son examen grâce à ses efforts soutenus", l’expression "grâce à" introduit :',
    options: [
      'Une conséquence négative',
      'Une cause à effet positif ou valorisant',
      'Une condition irréelle',
      'Une opposition temporelle'
    ],
    correctIndex: 1,
    explanation: '"Grâce à" (+ nom) introduit une cause ayant une conséquence favorable ou positive (contrairement à "à cause de").'
  }
];

export const BADGES_LIST = [
  {
    id: 'badge-first-step',
    title: 'First Step',
    description: 'Completed your first study resource or lesson.',
    icon: '🌱',
    requiredCompleted: 1,
    category: 'learning' as const
  },
  {
    id: 'badge-3-streak',
    title: 'Spark of Habit',
    description: 'Maintained a 3-day consecutive study streak.',
    icon: '🔥',
    requiredStreak: 3,
    category: 'streak' as const
  },
  {
    id: 'badge-7-streak',
    title: 'Flame of Dedication',
    description: 'Maintained a full 7-day study streak across the week.',
    icon: '⚡',
    requiredStreak: 7,
    category: 'streak' as const
  },
  {
    id: 'badge-14-streak',
    title: 'Master of Consistency',
    description: 'Reached a remarkable 14-day study streak milestone.',
    icon: '👑',
    requiredStreak: 14,
    category: 'streak' as const
  },
  {
    id: 'badge-math-whiz',
    title: 'Math & Logic Explorer',
    description: 'Completed 5 math courses or exercise sheets.',
    icon: '📐',
    requiredCompleted: 5,
    category: 'mastery' as const
  },
  {
    id: 'badge-focus-champion',
    title: 'Deep Focus Scholar',
    description: 'Accumulated over 120 minutes of tracked study focus.',
    icon: '⏱️',
    requiredXp: 150,
    category: 'focus' as const
  }
];
