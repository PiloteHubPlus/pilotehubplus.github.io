export type SchoolLevelId = 'Middle School' | 'High School';

export type MiddleSchoolGrade = '7th Grade' | '8th Grade' | '9th Grade';
export type HighSchoolGrade = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
export type GradeId = MiddleSchoolGrade | HighSchoolGrade;

export type SubjectName =
  | 'Arabic'
  | 'French'
  | 'English'
  | 'Math'
  | 'Physics'
  | 'Science'
  | 'Technology'
  | 'Computer Science'
  | 'Islamic Education'
  | 'Civic Education'
  | 'Geography'
  | 'History'
  | 'Philosophy'
  | 'Optional Language';

export type ResourceType = 'courses' | 'exercises' | 'exams';

export interface ResourceItem {
  id: string;
  title: string;
  pdf?: string;
  description?: string;
  estimatedMinutes?: number;
  time?: string;
  grade: GradeId;
  level: SchoolLevelId;
  subject: SubjectName;
  type: ResourceType;
  pages?: number;
  term?: 1 | 2 | 3;
  summaryText?: string;
  keyPoints?: string[];
  keyExaminationPoints?: string[];
}

export interface SubjectData {
  name: SubjectName;
  icon: string;
  color: string;
  courses: ResourceItem[];
  exercises: ResourceItem[];
  exams: ResourceItem[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  school?: string;
  grade: GradeId;
  level: SchoolLevelId;
  createdAt: string;
  isGuest?: boolean;
}

export interface CustomTimerPreset {
  id: string;
  name: string;
  minutes: number;
  category?: 'focus' | 'exam' | 'break' | 'custom';
}

export interface UserProgressState {
  userId?: string;
  completedResourceIds: string[];
  bookmarkedResourceIds: string[];
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  activityHistory: Record<string, number>; // date string -> minutes studied
  totalMinutesStudied: number;
  dailyGoalMinutes: number;
  xp: number;
  unlockedBadges: string[];
  notes: Record<string, string>; // subject or resourceId -> text
  selectedGrade: GradeId;
  selectedLevel: SchoolLevelId;
  userName: string;
  customTimerPresets?: CustomTimerPreset[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredXp?: number;
  requiredStreak?: number;
  requiredCompleted?: number;
  category: 'streak' | 'learning' | 'mastery' | 'focus';
}

export interface Review {
  id: string;
  author: string;
  email?: string;
  school?: string;
  grade?: string;
  stars: number;
  comment: string;
  date: string;
  verified?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: SubjectName;
  grade: GradeId;
}

export type AppLanguage = 'en' | 'fr';
export type AppView = 'home' | 'curriculum' | 'dashboard' | 'timer' | 'reviews' | 'about';
