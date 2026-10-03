import { GradeId, ResourceItem, SchoolLevelId, SubjectData, SubjectName } from '../types';

export const SUBJECT_METADATA: Record<SubjectName, { icon: string; color: string; frName: string }> = {
  Math: { icon: '➕', color: '#3B82F6', frName: 'Mathématiques' },
  Physics: { icon: '⚡', color: '#8B5CF6', frName: 'Sciences Physiques' },
  Science: { icon: '🔬', color: '#10B981', frName: 'Sciences de la Vie et de la Terre' },
  Arabic: { icon: '🔤', color: '#F59E0B', frName: 'Arabe' },
  French: { icon: '🇫🇷', color: '#EC4899', frName: 'Français' },
  English: { icon: '🇬🇧', color: '#06B6D4', frName: 'Anglais' },
  Technology: { icon: '🔧', color: '#6366F1', frName: 'Technologie' },
  'Computer Science': { icon: '💻', color: '#14B8A6', frName: 'Informatique' },
  'Islamic Education': { icon: '☪️', color: '#84CC16', frName: 'Éducation Islamique' },
  'Civic Education': { icon: '🏛️', color: '#D97706', frName: 'Éducation Civique' },
  Geography: { icon: '🌍', color: '#059669', frName: 'Géographie' },
  History: { icon: '📜', color: '#B45309', frName: 'Histoire' },
  Philosophy: { icon: '🤔', color: '#7C3AED', frName: 'Philosophie' },
  'Optional Language': { icon: '🌐', color: '#2563EB', frName: 'Langue Optionnelle (Allemand/Italien/Espagnol)' },
};

export const ALL_GRADES: { id: GradeId; level: SchoolLevelId; label: string; frLabel: string; order: number }[] = [
  { id: '7th Grade', level: 'Middle School', label: '7th Grade', frLabel: '7ème Année de Base', order: 1 },
  { id: '8th Grade', level: 'Middle School', label: '8th Grade', frLabel: '8ème Année de Base', order: 2 },
  { id: '9th Grade', level: 'Middle School', label: '9th Grade', frLabel: '9ème Année de Base', order: 3 },
  { id: 'Freshman', level: 'High School', label: 'Freshman (1st Year)', frLabel: '1ère Année Secondaire', order: 4 },
  { id: 'Sophomore', level: 'High School', label: 'Sophomore (2nd Year)', frLabel: '2ème Année Secondaire', order: 5 },
  { id: 'Junior', level: 'High School', label: 'Junior (3rd Year)', frLabel: '3ème Année Secondaire', order: 6 },
  { id: 'Senior', level: 'High School', label: 'Senior (4th Year - Bac)', frLabel: '4ème Année Secondaire (Bac)', order: 7 },
];

/**
 * Pre-existing resources are cleared. All curriculum resources are loaded dynamically
 * from uploaded PDF files and JSON sidecars in `/public/curriculum/<grade>/<subject>/<type>/`.
 */
export const RAW_RESOURCES: ResourceItem[] = [];

export function getSubjectsForGrade(gradeId: GradeId, customResources?: ResourceItem[]): SubjectData[] {
  const source = customResources || RAW_RESOURCES;
  const gradeResources = source.filter((r) => r.grade === gradeId);
  const subjectsMap = new Map<SubjectName, SubjectData>();

  // Determine available subjects based on grade
  const isMiddleSchool =
    gradeId === '7th Grade' || gradeId === '8th Grade' || gradeId === '9th Grade';
  const isJuniorOrSenior = gradeId === 'Junior' || gradeId === 'Senior';

  // Middle School subjects in the EXACT order requested:
  // Arabic, French, English, Technology, Islamic Education, Civic Education, History, Geography, Physics, Science, Math, Computer Science
  const middleSchoolSubjects: SubjectName[] = [
    'Arabic',
    'French',
    'English',
    'Technology',
    'Islamic Education',
    'Civic Education',
    'History',
    'Geography',
    'Physics',
    'Science',
    'Math',
    'Computer Science',
  ];

  const highSchoolSubjects: SubjectName[] = [
    'Math',
    'Physics',
    'Science',
    'Arabic',
    'French',
    'English',
    'Technology',
    'Computer Science',
    'Islamic Education',
    'Civic Education',
    'Geography',
    'History',
    'Optional Language',
  ];

  if (isJuniorOrSenior) {
    // Insert Philosophy before Optional Language
    const index = highSchoolSubjects.indexOf('Optional Language');
    if (index !== -1) {
      highSchoolSubjects.splice(index, 0, 'Philosophy');
    } else {
      highSchoolSubjects.push('Philosophy');
    }
  }

  const subjectList = isMiddleSchool ? middleSchoolSubjects : highSchoolSubjects;

  subjectList.forEach((subj) => {
    const meta = SUBJECT_METADATA[subj];
    const courses = gradeResources.filter((r) => r.subject === subj && r.type === 'courses');
    const exercises = gradeResources.filter((r) => r.subject === subj && r.type === 'exercises');
    const exams = gradeResources.filter((r) => r.subject === subj && r.type === 'exams');

    subjectsMap.set(subj, {
      name: subj,
      icon: meta?.icon || '📚',
      color: meta?.color || '#3B82F6',
      courses,
      exercises,
      exams,
    });
  });

  return Array.from(subjectsMap.values());
}
