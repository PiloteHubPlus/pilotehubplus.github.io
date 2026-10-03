import React, { useState, useEffect, useMemo } from 'react';
import { AppLanguage, ResourceItem } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumData';
import { getMergedCurriculumResources } from '../services/curriculumAutoLoader';
import { TRANSLATIONS } from '../data/translations';
import { Search, X, BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResource: (resource: ResourceItem) => void;
  lang: AppLanguage;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResource,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allResources = useMemo(() => getMergedCurriculumResources(), []);

  const results =
    query.trim() === ''
      ? allResources.slice(0, 6)
      : allResources.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.subject.toLowerCase().includes(query.toLowerCase()) ||
            r.grade.toLowerCase().includes(query.toLowerCase()) ||
            (r.description && r.description.toLowerCase().includes(query.toLowerCase())) ||
            (r.summaryText && r.summaryText.toLowerCase().includes(query.toLowerCase())) ||
            (r.keyExaminationPoints &&
              r.keyExaminationPoints.some((p) => p.toLowerCase().includes(query.toLowerCase())))
        );

  return (
    <div
      id="modal-global-search"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-20 bg-[#0A1628]/60 backdrop-blur-sm animate-fadeUp"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#0A1628]/10 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-5 border-b border-[#0A1628]/10 flex items-center gap-2.5 sm:gap-3">
          <Search className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 text-sm sm:text-base text-[#0A1628] font-medium outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#8A99B0] hover:text-[#0A1628] cursor-pointer px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8A99B0] hover:text-[#0A1628] transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-2 flex-1">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8A99B0] mb-2">
            {allResources.length === 0
              ? lang === 'fr'
                ? 'Bibliothèque de documents'
                : 'Curriculum Library'
              : query.trim() === ''
              ? lang === 'fr'
                ? 'Ressources récentes'
                : 'Recommended Study Materials'
              : `Found ${results.length} results`}
          </div>

          {allResources.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-[#C9A84C] flex items-center justify-center border border-amber-200/60 shadow-xs mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#0A1628] font-serif-display">
                {lang === 'fr' ? 'Bientôt disponible • Nous y travaillons !' : "Coming Soon • We're working on it!"}
              </h4>
              <p className="text-xs sm:text-sm text-[#8A99B0] max-w-sm mx-auto leading-relaxed">
                {lang === 'fr'
                  ? 'Nous préparons et vérifions activement la bibliothèque de cours et devoirs. Revenez très bientôt !'
                  : "We are actively curating and verifying course materials and past exam archives. Check back soon!"}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-xs sm:text-sm text-[#8A99B0]">
              No educational materials matched &quot;{query}&quot;.
            </div>
          ) : (
            results.map((item) => {
              const meta = SUBJECT_METADATA[item.subject];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectResource(item);
                    onClose();
                  }}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#F5F7FA] hover:bg-[#C9A84C]/10 border border-[#0A1628]/5 transition-all flex items-center justify-between cursor-pointer group min-h-[48px]"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="text-lg sm:text-xl flex-shrink-0">{meta?.icon || '📚'}</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0A1628] group-hover:text-[#C9A84C] transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <span className="text-[10px] sm:text-[11px] text-[#8A99B0]">
                        {item.subject} • {item.grade} • {item.type}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#8A99B0] group-hover:text-[#C9A84C] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
