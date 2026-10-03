import React, { useState } from 'react';
import { AppLanguage, ResourceItem, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { SUBJECT_METADATA } from '../data/curriculumData';
import {
  X,
  Download,
  Bookmark,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  FileText,
  ExternalLink,
  Maximize2,
  Minimize2,
  Eye,
  Plus,
  ArrowLeft,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface ResourceViewerModalProps {
  resource: ResourceItem | null;
  onClose: () => void;
  isCompleted: boolean;
  isBookmarked: boolean;
  onToggleComplete: () => void;
  onToggleBookmark: () => void;
  onLaunchQuiz: () => void;
  lang: AppLanguage;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'signup', notice?: string) => void;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  resource,
  onClose,
  isCompleted,
  isBookmarked,
  onToggleComplete,
  onToggleBookmark,
  onLaunchQuiz,
  lang,
  currentUser,
  onOpenAuthModal,
}) => {
  // Default to summary view as requested ("Academic Summary & Core Scope" with "Key Examination Points")
  const [viewMode, setViewMode] = useState<'summary' | 'pdf'>('summary');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  if (!resource) return null;

  const t = TRANSLATIONS[lang];
  const meta = SUBJECT_METADATA[resource.subject];

  const timeDisplay = resource.time || (resource.estimatedMinutes ? `${resource.estimatedMinutes} min` : '40 min');
  const pageDisplay = resource.pages ? `${resource.pages} Pages` : '4 Pages';
  const examPoints = resource.keyExaminationPoints || resource.keyPoints || [];
  const descriptionText = resource.description || resource.summaryText || '';

  const handleDownload = () => {
    if (!currentUser) {
      onOpenAuthModal?.(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous ou créez un compte gratuit pour télécharger les cours, exercices et examens en PDF !'
          : 'Please sign in or create a free account to download official courses, exercises, and exam PDFs!'
      );
      return;
    }

    if (resource.pdf) {
      const link = document.createElement('a');
      link.href = resource.pdf;
      link.download = (resource.title || 'document') + '.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (!currentUser) {
      onOpenAuthModal?.(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous à votre compte pour ouvrir et télécharger les documents PDF officiels.'
          : 'Please sign in to your account to open and view the official PDF documents.'
      );
      return;
    }

    if (resource.pdf) {
      window.open(resource.pdf, '_blank');
    }
  };

  const handleSwitchToPdf = () => {
    if (!currentUser) {
      onOpenAuthModal?.(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous pour débloquer l’aperçu du document PDF et télécharger le fichier !'
          : 'Please sign in to unlock full PDF preview and download this document!'
      );
      return;
    }
    setViewMode('pdf');
  };

  return (
    <div
      id="modal-resource-viewer"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1628]/70 backdrop-blur-md animate-fadeUp"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full rounded-3xl shadow-2xl border border-[#0A1628]/10 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-2 sm:inset-4 z-50 max-w-none max-h-none h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)]'
            : 'max-w-4xl max-h-[92vh] h-[85vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-[#0A1628]/10 flex items-start justify-between bg-white gap-3">
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg leading-none flex-shrink-0 mt-0.5">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#C9A84C]">
                  {resource.subject}
                </span>
                <span className="text-xs text-[#8A99B0]">• {resource.grade}</span>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold uppercase text-[10px] tracking-wider border border-blue-100">
                  {resource.type}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold font-serif-display text-[#0A1628] mt-1 leading-snug">
                {resource.title}
              </h2>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {viewMode === 'pdf' && (
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className="px-3 py-1.5 rounded-xl bg-[#F5F7FA] text-[#0A1628] text-xs font-bold hover:bg-[#0A1628]/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Retour Résumé' : 'Back to Summary'}</span>
              </button>
            )}

            {resource.pdf && viewMode === 'pdf' && (
              <button
                onClick={handleOpenInNewTab}
                className="p-2 rounded-xl hover:bg-[#0A1628]/10 text-[#8A99B0] hover:text-[#0A1628] transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title={lang === 'fr' ? 'Ouvrir dans un nouvel onglet' : 'Open in new tab'}
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl hover:bg-[#0A1628]/10 text-[#8A99B0] hover:text-[#0A1628] transition-all cursor-pointer min-w-[36px] min-h-[36px] hidden sm:flex items-center justify-center"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-rose-50 text-[#8A99B0] hover:text-rose-600 transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden relative">
          {viewMode === 'summary' ? (
            /* Summary & Key Examination Points (Exact visual match to Screenshot 2) */
            <div className="w-full h-full overflow-y-auto p-4 sm:p-7 space-y-6">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeDisplay} study</span>
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{pageDisplay}</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl">
                  100% Free
                </span>
              </div>

              {/* Academic Summary & Core Scope Section */}
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A1628] mb-2.5 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C9A84C]" />
                  <span>
                    {lang === 'fr' ? 'RÉSUMÉ ACADÉMIQUE & OBJECTIFS CLÉS' : 'ACADEMIC SUMMARY & CORE SCOPE'}
                  </span>
                </h3>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/5 text-xs sm:text-sm text-[#0A1628]/90 leading-relaxed font-normal">
                  {descriptionText ||
                    (lang === 'fr'
                      ? 'Théorème des valeurs intermédiaires (TVI), formes indéterminées et levée par factorisation ou quantité conjuguée, dérivabilité et équation de la tangente.'
                      : 'Comprehensive official curriculum summary, fundamental concepts, and essential demonstration methods.')}
                </div>
              </div>

              {/* Key Examination Points & Rules Section */}
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A1628] mb-2.5">
                  {lang === 'fr' ? "POINTS CLÉS D'EXAMEN & RÈGLES" : 'KEY EXAMINATION POINTS & RULES'}
                </h3>
                <div className="space-y-2.5">
                  {examPoints.length > 0 ? (
                    examPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#0A1628]/10 shadow-xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-100/90 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs sm:text-sm text-[#0A1628] font-medium leading-relaxed">
                          {pt}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#0A1628]/10 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-amber-100/90 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          1
                        </span>
                        <span className="text-xs sm:text-sm text-[#0A1628] font-medium leading-relaxed">
                          Continuité sur un intervalle et image d'un intervalle
                        </span>
                      </div>
                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#0A1628]/10 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-amber-100/90 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          2
                        </span>
                        <span className="text-xs sm:text-sm text-[#0A1628] font-medium leading-relaxed">
                          Théorème de la bijection
                        </span>
                      </div>
                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#0A1628]/10 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-amber-100/90 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          3
                        </span>
                        <span className="text-xs sm:text-sm text-[#0A1628] font-medium leading-relaxed">
                          Tableau de variation et tracé de la courbe représentative (Cf)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Ready to test your comprehension? Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0A1628] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      {lang === 'fr' ? 'Prêt à vous tester ?' : 'Ready to test your comprehension?'}
                    </span>
                  </h4>
                  <p className="text-xs text-[#8A99B0]">
                    {lang === 'fr'
                      ? 'Répondez à nos quiz interactifs pour booster votre série et gagner des XP.'
                      : 'Answer quick interactive multiple-choice questions to boost your streak & XP.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onLaunchQuiz();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer whitespace-nowrap min-h-[40px] shadow-sm flex items-center justify-center"
                >
                  {t.practiceQuiz}
                </button>
              </div>
            </div>
          ) : (
            /* Full PDF View mode */
            <div className="w-full h-full flex flex-col bg-slate-900">
              {resource.pdf && !pdfLoadError ? (
                <iframe
                  src={`${resource.pdf}#toolbar=1&navpanes=0`}
                  title={resource.title}
                  className="w-full h-full border-0"
                  onError={() => setPdfLoadError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-white">
                  <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
                  <h3 className="text-base font-bold text-[#0A1628]">
                    {lang === 'fr' ? 'Aperçu PDF en cours de chargement' : 'PDF Document Viewer'}
                  </h3>
                  <p className="text-xs text-[#8A99B0] max-w-md mt-1 mb-4">
                    {lang === 'fr'
                      ? 'Le fichier PDF peut être téléchargé directement ou visualisé avec les points clés d\'examen.'
                      : 'You can download the PDF document directly or review the key examination points and academic scope.'}
                  </p>
                  <button
                    onClick={() => setViewMode('summary')}
                    className="px-4 py-2 rounded-xl bg-[#0A1628] text-[#C9A84C] text-xs font-bold cursor-pointer"
                  >
                    {lang === 'fr' ? 'Voir le résumé & points clés' : 'View Summary & Key Points'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions Bar (Matches Screenshot 2) */}
        <div className="p-4 sm:p-5 border-t border-[#0A1628]/10 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Left Buttons: Complete & Bookmark */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleComplete}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[42px] ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-[#0A1628]/15 text-[#0A1628] hover:border-emerald-500'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCompleted ? t.markUncompleted : t.markCompleted}</span>
            </button>

            <button
              onClick={onToggleBookmark}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[42px] ${
                isBookmarked
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-[#0A1628]/15 text-[#0A1628] hover:border-amber-500'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isBookmarked ? t.bookmarked : t.bookmark}</span>
            </button>
          </div>

          {/* Right Buttons: Preview PDF inside modal & Download PDF */}
          <div className="flex items-center gap-2 sm:gap-3">
            {viewMode === 'summary' && resource.pdf && (
              <button
                onClick={handleSwitchToPdf}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-white border border-[#0A1628]/20 text-[#0A1628] text-xs sm:text-sm font-bold hover:bg-[#F5F7FA] transition-all cursor-pointer min-h-[42px]"
              >
                {!currentUser ? (
                  <Lock className="w-4 h-4 text-[#C9A84C]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#C9A84C]" />
                )}
                <span>{lang === 'fr' ? 'Aperçu PDF' : 'Preview PDF'}</span>
                {!currentUser && (
                  <span className="text-[10px] text-[#8A99B0]">🔒</span>
                )}
              </button>
            )}

            <button
              id="btn-resource-download-pdf"
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-2xl bg-[#0A1628] text-white text-xs sm:text-sm font-bold hover:bg-[#122442] shadow-sm transition-all cursor-pointer min-h-[42px]"
            >
              {!currentUser ? (
                <>
                  <Lock className="w-4 h-4 text-[#C9A84C]" />
                  <span>{t.downloadPdf}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[#C9A84C]">
                    {lang === 'fr' ? 'Verrouillé' : 'Locked'}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#C9A84C]" />
                  <span>{t.downloadPdf}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
