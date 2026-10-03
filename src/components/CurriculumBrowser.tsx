import React, { useState, useMemo } from 'react';
import { AppLanguage, GradeId, ResourceItem, ResourceType, SubjectName, UserProgressState } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ALL_GRADES, getSubjectsForGrade, SUBJECT_METADATA } from '../data/curriculumData';
import { getMergedCurriculumResources } from '../services/curriculumAutoLoader';
import {
  BookOpen,
  Search,
  CheckCircle,
  Bookmark,
  Eye,
  Sparkles,
  Clock,
  Plus,
} from 'lucide-react';

interface CurriculumBrowserProps {
  selectedGrade: GradeId;
  onSelectGrade: (grade: GradeId) => void;
  progress: UserProgressState;
  onToggleComplete: (resourceId: string) => void;
  onToggleBookmark: (resourceId: string) => void;
  onOpenResource: (resource: ResourceItem) => void;
  onOpenQuiz: () => void;
  lang: AppLanguage;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  selectedGrade,
  onSelectGrade,
  progress,
  onToggleComplete,
  onToggleBookmark,
  onOpenResource,
  onOpenQuiz,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const [activeSubject, setActiveSubject] = useState<SubjectName | 'ALL'>('ALL');
  const [activeTypeTab, setActiveTypeTab] = useState<ResourceType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load all merged resources (from file system folders + preset resources)
  const allResources = useMemo(() => getMergedCurriculumResources(), []);

  const subjects = useMemo(
    () => getSubjectsForGrade(selectedGrade, allResources),
    [selectedGrade, allResources]
  );

  // Filter resources for current grade
  const gradeResources = allResources.filter((r) => r.grade === selectedGrade);

  const filteredResources = gradeResources.filter((r) => {
    const matchSubject = activeSubject === 'ALL' || r.subject === activeSubject;
    const matchType = activeTypeTab === 'ALL' || r.type === activeTypeTab;
    const matchSearch =
      searchQuery.trim() === '' ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.summaryText && r.summaryText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.keyExaminationPoints &&
        r.keyExaminationPoints.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchSubject && matchType && matchSearch;
  });

  const getResourceTypeBadge = (type: ResourceType) => {
    switch (type) {
      case 'courses':
        return {
          label: 'COURSES',
          color: 'text-blue-600 bg-blue-50/90 border-blue-200/80',
        };
      case 'exercises':
        return {
          label: 'EXERCISES',
          color: 'text-emerald-600 bg-emerald-50/90 border-emerald-200/80',
        };
      case 'exams':
        return {
          label: 'EXAMS',
          color: 'text-purple-600 bg-purple-50/90 border-purple-200/80',
        };
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title and Grade Pills */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0A1628] font-serif-display">
              {t.curriculumTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#8A99B0] mt-1">{t.curriculumSubtitle}</p>
          </div>

          <button
            onClick={onOpenQuiz}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.practiceQuiz}</span>
          </button>
        </div>

        {/* Grade Selection Tabs (Scrollable on small screens) */}
        <div className="mt-4 sm:mt-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ALL_GRADES.map((g) => {
            const isSelected = g.id === selectedGrade;
            return (
              <button
                key={g.id}
                id={`btn-grade-tab-${g.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  onSelectGrade(g.id);
                  setActiveSubject('ALL');
                }}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm'
                    : 'bg-white border border-[#0A1628]/10 text-[#0A1628] hover:border-[#C9A84C]'
                }`}
              >
                {lang === 'fr' ? g.frLabel : g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Resource Filter Controls */}
      <div className="bg-white p-3.5 sm:p-6 rounded-3xl border border-[#0A1628]/10 shadow-xs space-y-3 sm:space-y-4">
        {/* Search input and type buttons */}
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-curriculum-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher un cours, devoir, exercice ou notion...' : t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTypeTab('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                activeTypeTab === 'ALL'
                  ? 'bg-[#0A1628] text-[#C9A84C]'
                  : 'bg-[#F5F7FA] text-[#0A1628] hover:bg-[#0A1628]/10'
              }`}
            >
              {lang === 'fr' ? 'Tous les types' : t.allSubjects}
            </button>
            <button
              onClick={() => setActiveTypeTab('courses')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                activeTypeTab === 'courses'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[#F5F7FA] text-[#0A1628] hover:bg-[#0A1628]/10'
              }`}
            >
              {lang === 'fr' ? '📘 Cours' : t.filterCourses}
            </button>
            <button
              onClick={() => setActiveTypeTab('exercises')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                activeTypeTab === 'exercises'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#F5F7FA] text-[#0A1628] hover:bg-[#0A1628]/10'
              }`}
            >
              {lang === 'fr' ? '📝 Séries & Exercices' : t.filterExercises}
            </button>
            <button
              onClick={() => setActiveTypeTab('exams')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                activeTypeTab === 'exams'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[#F5F7FA] text-[#0A1628] hover:bg-[#0A1628]/10'
              }`}
            >
              {lang === 'fr' ? '🎯 Devoirs & Examens' : t.filterExams}
            </button>
          </div>
        </div>

        {/* Subject Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-[#0A1628]/5">
          <button
            onClick={() => setActiveSubject('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
              activeSubject === 'ALL'
                ? 'bg-[#C9A84C] text-[#0A1628]'
                : 'bg-[#F5F7FA] text-[#0A1628] hover:bg-[#0A1628]/10'
            }`}
          >
            {lang === 'fr' ? 'Toutes les matières' : 'All Subjects'} ({gradeResources.length})
          </button>
          {subjects.map((subj) => {
            const count = gradeResources.filter((r) => r.subject === subj.name).length;
            const isSelected = activeSubject === subj.name;
            return (
              <button
                key={subj.name}
                onClick={() => setActiveSubject(subj.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#0A1628] text-[#C9A84C]'
                    : 'bg-[#F5F7FA] text-[#0A1628] hover:bg-[#0A1628]/10'
                }`}
              >
                <span>{subj.icon}</span>
                <span>{lang === 'fr' ? (SUBJECT_METADATA[subj.name]?.frName || subj.name) : subj.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#0A1628]/10 text-[#8A99B0] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-[#C9A84C] flex items-center justify-center border border-amber-200/60 shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A1628]/5 text-[#0A1628] text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>{lang === 'fr' ? 'En cours de préparation' : 'Coming Soon'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#0A1628] font-serif-display">
              {searchQuery.trim() !== ''
                ? lang === 'fr'
                  ? 'Aucun document correspondant'
                  : 'No Matching Materials'
                : lang === 'fr'
                ? 'Bientôt disponible • Nous y travaillons !'
                : "Coming Soon • We're working on it!"}
            </h3>
            <p className="text-xs sm:text-sm text-[#8A99B0] leading-relaxed">
              {searchQuery.trim() !== ''
                ? lang === 'fr'
                  ? 'Aucune ressource ne correspond à votre recherche. Essayez d’autres mots-clés ou réinitialisez les filtres.'
                  : 'No study materials matched your search query. Try adjusting your keywords or clearing active filters.'
                : lang === 'fr'
                ? 'Nous préparons et vérifions activement les cours, séries d’exercices et devoirs pour cette section. Revenez très bientôt !'
                : "We are currently curating and verifying comprehensive courses, exercises, and exam archives for this section. Stay tuned!"}
            </p>
          </div>
          {(searchQuery.trim() !== '' || activeSubject !== 'ALL' || activeTypeTab !== 'ALL') && (
            <button
              onClick={() => {
                setActiveSubject('ALL');
                setActiveTypeTab('ALL');
                setSearchQuery('');
              }}
              className="inline-block text-xs font-bold text-[#C9A84C] hover:underline cursor-pointer pt-2"
            >
              {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredResources.map((item) => {
            const isCompleted = progress.completedResourceIds.includes(item.id);
            const isBookmarked = progress.bookmarkedResourceIds.includes(item.id);
            const badge = getResourceTypeBadge(item.type);
            const meta = SUBJECT_METADATA[item.subject];
            const timeDisplay = item.time || (item.estimatedMinutes ? `${item.estimatedMinutes} min` : '40 min');
            const pageDisplay = item.pages ? `${item.pages} pages` : '4 pages';
            const desc = item.description || item.summaryText || '';

            return (
              <div
                key={item.id}
                id={`card-resource-${item.id}`}
                className={`rounded-[28px] p-5 sm:p-6 bg-white border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-[#0A1628]/10 hover:border-[#C9A84C]/40'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Subject & Type Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-sm leading-none border border-[#0A1628]/5">
                        {meta?.icon || '📚'}
                      </div>
                      <span className="text-sm font-bold text-[#0A1628]">
                        {lang === 'fr' ? meta?.frName || item.subject : item.subject}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Resource Title */}
                  <h3
                    onClick={() => onOpenResource(item)}
                    className="text-base sm:text-lg font-bold text-[#0A1628] font-serif-display leading-snug cursor-pointer hover:text-[#C9A84C] transition-colors line-clamp-2"
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  {desc && (
                    <p className="text-xs sm:text-sm text-[#8A99B0] line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  )}

                  {/* Time and Page Metadata Line */}
                  <div className="flex items-center gap-2 text-xs text-[#8A99B0] font-medium pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeDisplay}</span>
                    </span>
                    <span>•</span>
                    <span>{pageDisplay}</span>
                  </div>
                </div>

                {/* Card Actions Footer with Divider */}
                <div className="mt-5 pt-4 border-t border-[#0A1628]/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Completion Toggle */}
                    <button
                      id={`btn-complete-${item.id}`}
                      onClick={() => onToggleComplete(item.id)}
                      className={`w-10 h-10 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                        isCompleted
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                          : 'bg-white border-[#0A1628]/15 text-[#8A99B0] hover:text-[#0A1628] hover:border-[#0A1628]/30'
                      }`}
                      title={isCompleted ? t.markUncompleted : t.markCompleted}
                    >
                      <CheckCircle
                        className={`w-4 h-4 ${isCompleted ? 'fill-emerald-500 text-white' : ''}`}
                      />
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      id={`btn-bookmark-${item.id}`}
                      onClick={() => onToggleBookmark(item.id)}
                      className={`w-10 h-10 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                        isBookmarked
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-white border-[#0A1628]/15 text-[#8A99B0] hover:text-[#0A1628] hover:border-[#0A1628]/30'
                      }`}
                      title={isBookmarked ? t.bookmarked : t.bookmark}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-600' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Read Summary & Notes Button */}
                  <button
                    onClick={() => onOpenResource(item)}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#0A1628] text-[#C9A84C] text-xs sm:text-sm font-bold hover:bg-[#122442] shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[42px]"
                  >
                    <Eye className="w-4 h-4 text-[#C9A84C]" />
                    <span>{lang === 'fr' ? 'Lire Résumé & Notes' : 'Read Summary & Notes'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
