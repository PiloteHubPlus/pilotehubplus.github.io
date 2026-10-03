import { GradeId, ResourceItem, ResourceType, SchoolLevelId, SubjectName } from '../types';
import { RAW_RESOURCES } from '../data/curriculumData';

// Map grade folder slugs to GradeId & SchoolLevelId
export const GRADE_SLUG_MAP: Record<string, { id: GradeId; level: SchoolLevelId }> = {
  '7th-grade': { id: '7th Grade', level: 'Middle School' },
  '7th': { id: '7th Grade', level: 'Middle School' },
  '7eme': { id: '7th Grade', level: 'Middle School' },
  '7eme-base': { id: '7th Grade', level: 'Middle School' },
  '8th-grade': { id: '8th Grade', level: 'Middle School' },
  '8th': { id: '8th Grade', level: 'Middle School' },
  '8eme': { id: '8th Grade', level: 'Middle School' },
  '8eme-base': { id: '8th Grade', level: 'Middle School' },
  '9th-grade': { id: '9th Grade', level: 'Middle School' },
  '9th': { id: '9th Grade', level: 'Middle School' },
  '9eme': { id: '9th Grade', level: 'Middle School' },
  '9eme-base': { id: '9th Grade', level: 'Middle School' },
  '9eme-pilote': { id: '9th Grade', level: 'Middle School' },
  '1st-secondary': { id: 'Freshman', level: 'High School' },
  '1ere-secondaire': { id: 'Freshman', level: 'High School' },
  '1ere': { id: 'Freshman', level: 'High School' },
  'freshman': { id: 'Freshman', level: 'High School' },
  '2nd-secondary': { id: 'Sophomore', level: 'High School' },
  '2eme-secondaire': { id: 'Sophomore', level: 'High School' },
  '2eme': { id: 'Sophomore', level: 'High School' },
  'sophomore': { id: 'Sophomore', level: 'High School' },
  '3rd-secondary': { id: 'Junior', level: 'High School' },
  '3eme-secondaire': { id: 'Junior', level: 'High School' },
  '3eme': { id: 'Junior', level: 'High School' },
  'junior': { id: 'Junior', level: 'High School' },
  '4th-secondary': { id: 'Senior', level: 'High School' },
  '4eme-secondaire': { id: 'Senior', level: 'High School' },
  '4eme': { id: 'Senior', level: 'High School' },
  'bac': { id: 'Senior', level: 'High School' },
  'baccalaureat': { id: 'Senior', level: 'High School' },
  'baccalaureate': { id: 'Senior', level: 'High School' },
  'senior': { id: 'Senior', level: 'High School' },
};

// Map subject folder slugs to SubjectName
export const SUBJECT_SLUG_MAP: Record<string, SubjectName> = {
  math: 'Math',
  mathematics: 'Math',
  mathematiques: 'Math',
  maths: 'Math',
  physics: 'Physics',
  physique: 'Physics',
  'sciences-physiques': 'Physics',
  science: 'Science',
  svt: 'Science',
  sciences: 'Science',
  arabic: 'Arabic',
  arabe: 'Arabic',
  french: 'French',
  francais: 'French',
  english: 'English',
  anglais: 'English',
  technology: 'Technology',
  technologie: 'Technology',
  tech: 'Technology',
  'computer-science': 'Computer Science',
  informatique: 'Computer Science',
  info: 'Computer Science',
  'islamic-education': 'Islamic Education',
  islamique: 'Islamic Education',
  'education-islamique': 'Islamic Education',
  'civic-education': 'Civic Education',
  civique: 'Civic Education',
  'education-civique': 'Civic Education',
  geography: 'Geography',
  geographie: 'Geography',
  history: 'History',
  histoire: 'History',
  philosophy: 'Philosophy',
  philosophie: 'Philosophy',
  philo: 'Philosophy',
  'optional-language': 'Optional Language',
  'langue-optionnelle': 'Optional Language',
};

// Map resource type folder slugs
export const TYPE_SLUG_MAP: Record<string, ResourceType> = {
  courses: 'courses',
  cours: 'courses',
  course: 'courses',
  lessons: 'courses',
  exams: 'exams',
  examens: 'exams',
  exam: 'exams',
  devoirs: 'exams',
  ds: 'exams',
  dc: 'exams',
  exercises: 'exercises',
  exercices: 'exercises',
  exercise: 'exercises',
  series: 'exercises',
  serie: 'exercises',
};

export interface SidecarMetadata {
  title?: string;
  description?: string;
  summaryText?: string;
  time?: string;
  estimatedMinutes?: number;
  pages?: number;
  keyExaminationPoints?: string[];
  keyPoints?: string[];
  term?: 1 | 2 | 3;
}

/**
 * Clean up a raw filename to a readable title
 */
export function formatFilenameToTitle(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/[-_]/g, ' ') // replace dashes/underscores with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => (word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/**
 * Scan all JSON & text sidecar metadata files in /public/curriculum/
 */
function loadCurriculumFilesFromDisk(): ResourceItem[] {
  const discoveredItems: ResourceItem[] = [];

  // Vite glob for JSON files in public/curriculum
  const jsonModules = import.meta.glob('/public/curriculum/**/*.json', {
    eager: true,
    import: 'default',
  });

  // Vite glob for raw text files in public/curriculum (if any)
  const txtModules = import.meta.glob('/public/curriculum/**/*.txt', {
    eager: true,
    as: 'raw',
  });

  // Vite glob for PDF files in public/curriculum
  const pdfModules = import.meta.glob('/public/curriculum/**/*.pdf', {
    eager: true,
    as: 'url',
  });

  // Set of all paths processed to avoid duplication
  const processedBaseKeys = new Set<string>();

  // Process all JSON metadata sidecars
  for (const rawPath in jsonModules) {
    // rawPath format: /public/curriculum/<grade>/<subject>/<type>/<filename>.json
    const cleanPath = rawPath.replace(/^\/public/, '');
    const parts = cleanPath.split('/').filter(Boolean);

    // Expected parts: ['curriculum', gradeSlug, subjectSlug, typeSlug, fileWithExt]
    if (parts.length < 5) continue;

    const [, gradeSlug, subjectSlug, typeSlug, filenameWithExt] = parts;
    const gradeInfo = GRADE_SLUG_MAP[gradeSlug.toLowerCase()] || {
      id: '9th Grade' as GradeId,
      level: 'Middle School' as SchoolLevelId,
    };
    const subject = SUBJECT_SLUG_MAP[subjectSlug.toLowerCase()] || 'Math';
    const type = TYPE_SLUG_MAP[typeSlug.toLowerCase()] || 'courses';

    const baseName = filenameWithExt.replace(/\.[^/.]+$/, '');
    const baseKey = `${gradeSlug}/${subjectSlug}/${typeSlug}/${baseName}`;
    processedBaseKeys.add(baseKey);

    const jsonContent = jsonModules[rawPath] as SidecarMetadata;
    const correspondingPdfPath = `/curriculum/${gradeSlug}/${subjectSlug}/${typeSlug}/${baseName}.pdf`;

    // Parse time/minutes
    let estimatedMinutes = 30;
    let timeStr = '30 min';
    if (jsonContent.time) {
      timeStr = String(jsonContent.time);
      const matchNum = timeStr.match(/\d+/);
      if (matchNum) estimatedMinutes = parseInt(matchNum[0], 10);
    } else if (jsonContent.estimatedMinutes) {
      estimatedMinutes = jsonContent.estimatedMinutes;
      timeStr = `${estimatedMinutes} min`;
    }

    const keyPoints =
      jsonContent.keyExaminationPoints ||
      jsonContent.keyPoints ||
      [];

    const description =
      jsonContent.description ||
      jsonContent.summaryText ||
      '';

    const title = jsonContent.title || formatFilenameToTitle(baseName);

    discoveredItems.push({
      id: `auto-${gradeSlug}-${subjectSlug}-${typeSlug}-${baseName}`,
      title,
      description,
      summaryText: description,
      time: timeStr,
      estimatedMinutes,
      pages: jsonContent.pages || 4,
      term: jsonContent.term || 1,
      grade: gradeInfo.id,
      level: gradeInfo.level,
      subject,
      type,
      keyExaminationPoints: keyPoints,
      keyPoints,
      pdf: correspondingPdfPath,
    });
  }

  // Also check for standalone PDFs that may not have a .json sidecar yet
  for (const rawPath in pdfModules) {
    const cleanPath = rawPath.replace(/^\/public/, '');
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length < 5) continue;

    const [, gradeSlug, subjectSlug, typeSlug, filenameWithExt] = parts;
    const baseName = filenameWithExt.replace(/\.[^/.]+$/, '');
    const baseKey = `${gradeSlug}/${subjectSlug}/${typeSlug}/${baseName}`;

    // If already processed via JSON sidecar, skip
    if (processedBaseKeys.has(baseKey)) continue;

    const gradeInfo = GRADE_SLUG_MAP[gradeSlug.toLowerCase()] || {
      id: '9th Grade' as GradeId,
      level: 'Middle School' as SchoolLevelId,
    };
    const subject = SUBJECT_SLUG_MAP[subjectSlug.toLowerCase()] || 'Math';
    const type = TYPE_SLUG_MAP[typeSlug.toLowerCase()] || 'courses';

    discoveredItems.push({
      id: `auto-pdf-${gradeSlug}-${subjectSlug}-${typeSlug}-${baseName}`,
      title: formatFilenameToTitle(baseName),
      description: `Document pédagogique pour la classe de ${gradeInfo.id} en ${subject}.`,
      summaryText: `Document pédagogique pour la classe de ${gradeInfo.id} en ${subject}.`,
      time: '30 min',
      estimatedMinutes: 30,
      pages: 4,
      term: 1,
      grade: gradeInfo.id,
      level: gradeInfo.level,
      subject,
      type,
      keyExaminationPoints: [
        'Révision des notions fondamentales du programme officiel',
        'Application rigoureuse des définitions et théorèmes',
        'Vérification des résultats et justification méthodique',
      ],
      keyPoints: [
        'Révision des notions fondamentales du programme officiel',
        'Application rigoureuse des définitions et théorèmes',
      ],
      pdf: `/curriculum/${gradeSlug}/${subjectSlug}/${typeSlug}/${filenameWithExt}`,
    });
  }

  return discoveredItems;
}

/**
 * Returns all curriculum resources (auto-discovered from folders + preset resources)
 */
export function getMergedCurriculumResources(): ResourceItem[] {
  const autoItems = loadCurriculumFilesFromDisk();

  // Merge auto-discovered with existing RAW_RESOURCES, preventing duplicate titles if overlapping
  const merged: ResourceItem[] = [...autoItems];
  const autoTitles = new Set(autoItems.map((i) => `${i.grade}-${i.subject}-${i.type}-${i.title.toLowerCase()}`));

  for (const preset of RAW_RESOURCES) {
    const key = `${preset.grade}-${preset.subject}-${preset.type}-${preset.title.toLowerCase()}`;
    if (!autoTitles.has(key)) {
      // Ensure time string & keyExaminationPoints exist for presets
      const timeStr = preset.time || (preset.estimatedMinutes ? `${preset.estimatedMinutes} min` : '25 min');
      const keyExamPoints = preset.keyExaminationPoints || preset.keyPoints || [];
      const desc = preset.description || preset.summaryText || '';

      merged.push({
        ...preset,
        time: timeStr,
        description: desc,
        summaryText: desc,
        keyExaminationPoints: keyExamPoints,
        keyPoints: keyExamPoints,
      });
    }
  }

  return merged;
}
