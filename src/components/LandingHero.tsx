import React, { useState, useEffect } from 'react';
import { AppLanguage, GradeId, SchoolLevelId, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ALL_GRADES } from '../data/curriculumData';
import {
  Flame,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Users,
  Layers,
  GraduationCap,
  Clock,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';

interface LandingHeroProps {
  lang: AppLanguage;
  streakCount: number;
  onExploreGrade: (grade: GradeId) => void;
  onOpenDashboard: () => void;
  onOpenTimer: () => void;
  onLogStreak: () => void;
  hasCheckedInToday: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'signup', notice?: string) => void;
}

const ROTATING_QUOTES = {
  en: [
    'Success is the sum of small efforts, repeated day in and day out 🌱',
    "You're doing amazing — keep going! ✨",
    'Every page you study is a step forward 📚',
    "Rest if you must, but don't quit 💪",
    'Your future self will thank you 🌟',
    'Small steps every day lead to big results 🚀',
    "Believe in yourself — you've got this! 🎯",
    'Every page studied today is a victory for your future self 🏆',
    'Discipline is the bridge between goals and academic mastery 🌉',
    'Believe in your intellect, work consistently, and achieve excellence 🎓',
    'Focus on progress, not perfection 📈',
    'A little progress each day adds up to big results ⏳',
    'Mistakes are proof that you are trying and learning 💡',
    'Stay curious, stay dedicated, and stay hungry for knowledge 🧠',
    'Your potential is limitless when you put your mind to it ⚡',
    "Today's hard work unlocks tomorrow's dream career 🗝️",
    'Turn your doubts into determination and keep climbing 🧗',
    'Mastery takes patience, practice, and persistence 🔨',
    'The expert in anything was once a beginner 🌱',
    'Great minds are built one study session at a time 🏛️',
  ],
  fr: [
    'Le succès est la somme de petits efforts répétés jour après jour 🌱',
    'Vous faites un travail formidable — continuez ! ✨',
    'Chaque page étudiée est un pas en avant 📚',
    'Reposez-vous si nécessaire, mais n’abandonnez pas 💪',
    'Votre futur vous vous remerciera 🌟',
    'De petits pas chaque jour mènent à de grands résultats 🚀',
    'Croyez en vous — vous allez y arriver ! 🎯',
    'Chaque page révisée aujourd’hui est une victoire pour votre avenir 🏆',
    'La discipline est le pont qui relie vos ambitions à l’excellence 🌉',
    'Croyez en votre potentiel, travaillez avec régularité et réussissez 🎓',
    'Concentrez-vous sur le progrès, pas sur la perfection 📈',
    "Un peu de travail chaque jour produit d'immenses résultats ⏳",
    'Les erreurs sont la preuve que vous essayez et apprenez 💡',
    'Restez curieux, déterminé et assoiffé de connaissances 🧠',
    'Votre potentiel est infini quand vous y mettez tout votre cœur ⚡',
    "L'effort d'aujourd'hui ouvre les portes de votre avenir 🗝️",
    "Transformez vos doutes en détermination et continuez d'avancer 🧗",
    'La maîtrise s’acquiert avec patience, pratique et persévérance 🔨',
    'Chaque expert a commencé comme un simple débutant 🌱',
    'Les grands esprits se construisent une session d’étude à la fois 🏛️',
  ],
};

export const LandingHero: React.FC<LandingHeroProps> = ({
  lang,
  streakCount,
  onExploreGrade,
  onOpenDashboard,
  onOpenTimer,
  onLogStreak,
  hasCheckedInToday,
  currentUser,
  onOpenAuthModal,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedLevelTab, setSelectedLevelTab] = useState<SchoolLevelId>('Middle School');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeQuote, setFadeQuote] = useState(true);

  const handleStreakButtonClick = () => {
    if (!currentUser) {
      onOpenAuthModal?.(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous pour débloquer votre Streak d’étude quotidien et sauvegarder vos récompenses !'
          : 'Sign in to unlock your daily study streak and save your achievements!'
      );
      return;
    }
    onLogStreak();
  };

  const activeQuotes = ROTATING_QUOTES[lang] || ROTATING_QUOTES.en;

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeQuote(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % activeQuotes.length);
        setFadeQuote(true);
      }, 250);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeQuotes.length]);

  const currentQuote = activeQuotes[quoteIndex % activeQuotes.length];

  const middleGrades = ALL_GRADES.filter((g) => g.level === 'Middle School');
  const highGrades = ALL_GRADES.filter((g) => g.level === 'High School');

  return (
    <div className="w-full space-y-16 sm:space-y-24">
      {/* 1. Top Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-16 overflow-hidden">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-br from-[#C9A84C]/10 via-[#0A1628]/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A1628]/5 border border-[#0A1628]/10 text-xs sm:text-sm font-semibold text-[#0A1628] mb-6 animate-pulse-subtle shadow-xs">
            <Sparkles className="w-4 h-4 text-[#C9A84C]" />
            <span>{t.heroBadge}</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0A1628] leading-[1.18] sm:leading-[1.12]">
            {t.heroTitlePart1}{' '}
            <span className="font-serif-display italic font-bold text-[#0A1628] relative inline-block">
              {t.heroTitleHighlight}
              <span className="absolute left-0 bottom-1 w-full h-3 bg-[#C9A84C]/25 -z-10 rounded-sm" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-[#8A99B0] max-w-3xl mx-auto font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto">
            <button
              id="btn-hero-explore-curriculum"
              onClick={() => onExploreGrade('9th Grade')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#0A1628] text-[#C9A84C] font-bold text-sm sm:text-base shadow-lg shadow-[#0A1628]/20 hover:bg-[#122442] hover:shadow-xl transition-all cursor-pointer group min-h-[48px]"
            >
              <BookOpen className="w-5 h-5 text-[#C9A84C]" />
              <span>{t.btnExploreCurriculum}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              id="btn-hero-dashboard"
              onClick={onOpenDashboard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white border-2 border-[#0A1628]/15 text-[#0A1628] font-bold text-sm sm:text-base shadow-sm hover:border-[#C9A84C] hover:bg-[#F5F7FA] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{t.btnOpenDashboard}</span>
            </button>

            {/* Quick Check-in CTA button */}
            <button
              id="btn-hero-streak-checkin"
              onClick={handleStreakButtonClick}
              disabled={hasCheckedInToday && !!currentUser}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer min-h-[48px] ${
                hasCheckedInToday && currentUser
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : !currentUser
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:from-amber-700 hover:to-orange-700 active:scale-95'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600 active:scale-95'
              }`}
            >
              {!currentUser ? (
                <Lock className="w-4 h-4 text-white" />
              ) : (
                <Flame className="w-5 h-5 text-white" />
              )}
              <span>
                {hasCheckedInToday && currentUser
                  ? t.alreadyCheckedIn
                  : !currentUser
                  ? (lang === 'fr' ? 'Streak (Connexion)' : 'Daily Streak (Sign In)')
                  : t.checkInBtn}
              </span>
            </button>
          </div>

          {/* Daily Quote Card */}
          <div
            id="hero-rotating-quote-card"
            className="mt-8 sm:mt-12 max-w-2xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#0A1628]/8 text-xs sm:text-sm italic text-[#0A1628]/80 shadow-xs flex items-center justify-center gap-2.5 sm:gap-3 min-h-[52px]"
          >
            <span className="text-xl text-[#C9A84C] font-serif flex-shrink-0">“</span>
            <span
              className={`transition-opacity duration-300 ${
                fadeQuote ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {currentQuote}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Platform Key Stats Strip */}
      <section className="max-w-6xl mx-auto px-2 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#0A1628]/8 shadow-xs hover:border-[#C9A84C]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#C9A84C] font-serif-display">100%</span>
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-[#C9A84C]">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-[#0A1628]">{t.statFreeLabel}</p>
            <p className="text-[11px] sm:text-xs text-[#8A99B0] mt-0.5">Forever free for students</p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#0A1628]/8 shadow-xs hover:border-[#C9A84C]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0A1628] font-serif-display">250+</span>
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-[#0A1628]">{t.statResourcesLabel}</p>
            <p className="text-[11px] sm:text-xs text-[#8A99B0] mt-0.5">Courses & exam archives</p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#0A1628]/8 shadow-xs hover:border-[#C9A84C]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0A1628] font-serif-display">14</span>
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-[#0A1628]">{t.statSubjectsLabel}</p>
            <p className="text-[11px] sm:text-xs text-[#8A99B0] mt-0.5">Math, Physics, Arabic & more</p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#0A1628]/8 shadow-xs hover:border-[#C9A84C]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0A1628] font-serif-display">7+</span>
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-[#0A1628]">{t.statSchoolsLabel}</p>
            <p className="text-[11px] sm:text-xs text-[#8A99B0] mt-0.5">Model & pilot schools</p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Level & Grade Pathway Explorer */}
      <section className="max-w-6xl mx-auto px-2 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A1628] font-serif-display">
            {t.levelsTitle}
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#8A99B0]">{t.levelsSubtitle}</p>

          {/* Level Switcher Tabs */}
          <div className="mt-6 sm:mt-8 inline-flex flex-col sm:flex-row p-1.5 rounded-2xl bg-[#0A1628]/5 border border-[#0A1628]/10 w-full sm:w-auto gap-1">
            <button
              id="tab-level-middle"
              onClick={() => setSelectedLevelTab('Middle School')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedLevelTab === 'Middle School'
                  ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm'
                  : 'text-[#0A1628]/70 hover:text-[#0A1628]'
              }`}
            >
              🏫 {t.middleSchool} ({lang === 'fr' ? 'Collège' : 'Grades 7–9'})
            </button>
            <button
              id="tab-level-high"
              onClick={() => setSelectedLevelTab('High School')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedLevelTab === 'High School'
                  ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm'
                  : 'text-[#0A1628]/70 hover:text-[#0A1628]'
              }`}
            >
              🎓 {t.highSchool} ({lang === 'fr' ? 'Lycée' : 'Grades 10–12'})
            </button>
          </div>
        </div>

        {/* Grade Cards Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {(selectedLevelTab === 'Middle School' ? middleGrades : highGrades).map((gradeObj) => {
            const isFeatured = gradeObj.id === '9th Grade' || gradeObj.id === 'Junior';
            return (
              <div
                key={gradeObj.id}
                id={`card-grade-${gradeObj.id.toLowerCase().replace(/\s+/g, '-')}`}
                className={`relative rounded-3xl p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer ${
                  isFeatured
                    ? 'bg-gradient-to-b from-[#0A1628] to-[#122442] text-white border-2 border-[#C9A84C]/60 shadow-lg'
                    : 'bg-white text-[#0A1628] border border-[#0A1628]/10 hover:border-[#C9A84C]/40 shadow-sm'
                }`}
                onClick={() => onExploreGrade(gradeObj.id)}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#C9A84C] text-[#0A1628] font-extrabold text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{lang === 'fr' ? 'Très Populaire' : 'Full Exam Vault'}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">
                      {gradeObj.level === 'Middle School' ? '📘' : '🎓'}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        isFeatured
                          ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                          : 'bg-[#0A1628]/5 text-[#8A99B0]'
                      }`}
                    >
                      12+ Subjects
                    </span>
                  </div>

                  <h3
                    className={`text-xl sm:text-2xl font-bold font-serif-display ${
                      isFeatured ? 'text-white' : 'text-[#0A1628]'
                    }`}
                  >
                    {lang === 'fr' ? gradeObj.frLabel : gradeObj.label}
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      isFeatured ? 'text-gray-300' : 'text-[#8A99B0]'
                    }`}
                  >
                    {gradeObj.id === '9th Grade'
                      ? lang === 'fr'
                        ? 'Préparation complète au concours 9ème (Math, Arabe, SVT, Anglais, Français, devoirs de synthèse).'
                        : 'Complete National Exam prep (Math, Arabic grammar, SVT communication, English, French & synthesis tests).'
                      : gradeObj.id === 'Junior'
                      ? lang === 'fr'
                        ? 'Modules avancés pour la 3ème secondaire : analyse mathématique, oscillateurs RC/RL, philosophie.'
                        : 'Advanced modules for Junior year: Mathematical analysis, RC/RL physics, philosophy essays.'
                      : lang === 'fr'
                      ? 'Cours fondamentaux, fiches de révision et exercices progressifs avec corrections.'
                      : 'Structured foundational courses, chapter summaries, and progressive exercise series.'}
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 ${isFeatured ? 'text-[#C9A84C]' : 'text-emerald-500'}`}
                      />
                      <span>Official Curriculum Lessons & Summary PDFs</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 ${isFeatured ? 'text-[#C9A84C]' : 'text-emerald-500'}`}
                      />
                      <span>Devoirs de Contrôle & Devoirs de Synthèse</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 pt-4 border-t border-current/10 flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isFeatured ? 'text-[#C9A84C]' : 'text-[#0A1628]'
                    }`}
                  >
                    {t.viewGradeResources}
                  </span>
                  <div
                    className={`p-2 rounded-xl transition-transform group-hover:translate-x-1 ${
                      isFeatured ? 'bg-[#C9A84C] text-[#0A1628]' : 'bg-[#0A1628]/5 text-[#0A1628]'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Features & Student Mastery Section */}
      <section className="max-w-6xl mx-auto px-2 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A1628] font-serif-display">
            {t.featuresTitle}
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#8A99B0]">{t.featuresSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div
            id="feat-streaks"
            onClick={onOpenDashboard}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#0A1628]/10 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0A1628]">{t.featStreakTitle}</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#8A99B0] leading-relaxed">{t.featStreakDesc}</p>
          </div>

          <div
            id="feat-vault"
            onClick={() => onExploreGrade('9th Grade')}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#0A1628]/10 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0A1628]">{t.featVaultTitle}</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#8A99B0] leading-relaxed">{t.featVaultDesc}</p>
          </div>

          <div
            id="feat-progress"
            onClick={onOpenDashboard}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#0A1628]/10 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0A1628]">{t.featProgressTitle}</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#8A99B0] leading-relaxed">{t.featProgressDesc}</p>
          </div>

          <div
            id="feat-timer"
            onClick={() => {
              if (!currentUser) {
                onOpenAuthModal?.(
                  'signin',
                  lang === 'fr'
                    ? 'Connectez-vous pour débloquer le chronomètre Pomodoro et enregistrer vos sessions de concentration !'
                    : 'Sign in to unlock the Pomodoro focus timer and track your study sessions!'
                );
              } else {
                onOpenTimer();
              }
            }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#0A1628]/10 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform relative">
              <Clock className="w-6 h-6" />
              {!currentUser && (
                <Lock className="w-3 h-3 text-amber-600 absolute top-1.5 right-1.5" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#0A1628]">{t.featTimerTitle}</h3>
              {!currentUser && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {lang === 'fr' ? 'Verrouillé' : 'Locked'}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[#8A99B0] leading-relaxed">{t.featTimerDesc}</p>
          </div>
        </div>
      </section>

      {/* 5. Contributor Callout Banner */}
      <section className="max-w-6xl mx-auto px-2 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0A1628] via-[#122442] to-[#1A3158] p-6 sm:p-12 text-white overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#C9A84C]">
              {t.joinTitle}
            </span>
            <h3 className="mt-2 text-xl sm:text-3xl font-bold font-serif-display">
              {lang === 'fr'
                ? "Aidez-nous à faire grandir l'éducation libre en Tunisie"
                : 'Help Expand Equal Access to High Quality Education'}
            </h3>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-gray-300 leading-relaxed">
              {t.joinDesc}
            </p>
            <div className="mt-5 sm:mt-6 flex flex-wrap gap-4">
              <button
                id="btn-apply-contributor"
                onClick={() =>
                  window.open('https://forms.gle/pilotehub-contributor-application', '_blank')
                }
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C9A84C] text-[#0A1628] font-bold text-sm hover:bg-[#E4C87F] transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>{t.applyButton}</span>
              </button>
            </div>
          </div>

          <div className="absolute right-4 -bottom-8 opacity-10 sm:opacity-20 pointer-events-none">
            <GraduationCap className="w-56 h-56 sm:w-72 sm:h-72 text-white" />
          </div>
        </div>
      </section>
    </div>
  );
};
