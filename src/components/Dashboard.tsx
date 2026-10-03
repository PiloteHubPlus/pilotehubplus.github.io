import React, { useState, useMemo } from 'react';
import { AppLanguage, GradeId, ResourceItem, UserProgressState, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ALL_GRADES, getSubjectsForGrade, SUBJECT_METADATA } from '../data/curriculumData';
import { getMergedCurriculumResources } from '../services/curriculumAutoLoader';
import { BADGES_LIST } from '../data/quizData';
import { useStudyTimer } from '../context/TimerContext';
import confetti from 'canvas-confetti';
import {
  Flame,
  Clock,
  Award,
  BookOpen,
  Bookmark,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  FileText,
  Calendar,
  Zap,
  Target,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface DashboardProps {
  progress: UserProgressState;
  onUpdateProgress: (updated: Partial<UserProgressState>) => void;
  lang: AppLanguage;
  onOpenResource: (resource: ResourceItem) => void;
  onOpenTimer: () => void;
  onExploreCurriculum: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'signup', notice?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  onUpdateProgress,
  lang,
  onOpenResource,
  onOpenTimer,
  onExploreCurriculum,
  currentUser,
  onOpenAuthModal,
}) => {
  const t = TRANSLATIONS[lang];
  const { isRunning, timeLeft, totalDurationSeconds, formattedTime, remainingMinutesLabel } =
    useStudyTimer();
  const isTimerActive = isRunning || (timeLeft < totalDurationSeconds && timeLeft > 0);
  const [activeNotesTab, setActiveNotesTab] = useState<string>('general');

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = progress.lastStudyDate === todayStr;

  // Load all merged resources (preset + auto-loaded sidecars/PDFs)
  const allResources = useMemo(() => getMergedCurriculumResources(), []);

  // Compute stats
  const gradeSubjects = useMemo(
    () => getSubjectsForGrade(progress.selectedGrade, allResources),
    [progress.selectedGrade, allResources]
  );
  const gradeResources = allResources.filter((r) => r.grade === progress.selectedGrade);
  const totalGradeItems = gradeResources.length;
  const completedInGrade = gradeResources.filter((r) =>
    progress.completedResourceIds.includes(r.id)
  ).length;
  const gradeProgressPercent =
    totalGradeItems > 0
      ? Math.min(100, Math.round((completedInGrade / totalGradeItems) * 100))
      : 0;

  const todayMinutes = progress.activityHistory[todayStr] || 0;
  const dailyGoalPercent = Math.min(
    100,
    Math.round((todayMinutes / progress.dailyGoalMinutes) * 100)
  );

  // Check-in trigger with confetti (Only when user is logged in)
  const handleCheckIn = () => {
    if (!currentUser) {
      onOpenAuthModal?.(
        'signin',
        lang === 'fr'
          ? 'Veuillez vous connecter ou créer un compte pour activer votre Streak d’étude et enregistrer vos statistiques.'
          : 'Please log in or create an account to start your daily study streak and track your progress.'
      );
      return;
    }

    if (hasCheckedInToday) return;

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A84C', '#0A1628', '#3B82F6', '#10B981'],
      });
    } catch {
      // safe fallback
    }

    const newStreak = progress.currentStreak + 1;
    const newLongest = Math.max(progress.longestStreak, newStreak);
    const newHistory = {
      ...progress.activityHistory,
      [todayStr]: (progress.activityHistory[todayStr] || 0) + 15,
    };

    onUpdateProgress({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastStudyDate: todayStr,
      activityHistory: newHistory,
      totalMinutesStudied: progress.totalMinutesStudied + 15,
      xp: progress.xp + 50,
    });
  };

  // 7-day weekly schedule indicators
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // Mon=0, Sun=6

  const bookmarkedItems = allResources.filter((r) =>
    progress.bookmarkedResourceIds.includes(r.id)
  );

  const completedItems = allResources.filter((r) =>
    progress.completedResourceIds.includes(r.id)
  );

  return (
    <div className="w-full space-y-6 sm:space-y-12">
      {/* Top Header & Grade Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[#0A1628]/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A84C]">
              {t.dashboardTitle}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
              {!currentUser ? (
                <>
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>{lang === 'fr' ? 'XP Verrouillé' : 'XP Locked'}</span>
                </>
              ) : (
                <span>{progress.xp} XP</span>
              )}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0A1628] font-serif-display mt-1">
            {lang === 'fr' ? 'Mon Espace d’Apprentissage' : 'Student Learning Hub'}
          </h1>
          <p className="text-xs sm:text-sm text-[#8A99B0] mt-1">{t.dashboardSubtitle}</p>
        </div>

        {/* Grade Switcher Dropdown */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-white p-2 rounded-2xl border border-[#0A1628]/10 shadow-xs">
          <span className="text-xs font-bold text-[#8A99B0] pl-1.5 sm:pl-2">{t.enrolledGrade}:</span>
          <select
            id="select-dashboard-grade"
            value={progress.selectedGrade}
            onChange={(e) => onUpdateProgress({ selectedGrade: e.target.value as GradeId })}
            className="flex-1 sm:flex-none bg-[#F5F7FA] border border-[#0A1628]/10 text-[#0A1628] text-xs sm:text-sm font-bold rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 outline-none focus:border-[#C9A84C] cursor-pointer"
          >
            {ALL_GRADES.map((g) => (
              <option key={g.id} value={g.id}>
                {lang === 'fr' ? g.frLabel : g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Lock Notification Banner */}
      {!currentUser && (
        <div
          id="banner-dashboard-features-locked"
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0A1628] via-[#122442] to-[#0A1628] text-white border-2 border-[#C9A84C]/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A84C] text-[#0A1628] flex items-center justify-center flex-shrink-0 font-bold shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[#C9A84C]">
                  {lang === 'fr' ? 'Fonctionnalités Étudiant Verrouillées' : 'Student Features Locked'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded-full text-white/90">
                  {lang === 'fr' ? 'Connexion requise' : 'Sign in required'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-2xl leading-relaxed">
                {lang === 'fr'
                  ? 'Le Streak quotidien, le gain d’XP, le chronomètre Pomodoro et vos notes de révision par matière sont débloqués une fois connecté.'
                  : 'Daily streak check-ins, XP tracking, the Pomodoro focus timer, and personal subject revision notes unlock once you sign in or create an account.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
            <button
              onClick={() =>
                onOpenAuthModal?.(
                  'signin',
                  lang === 'fr'
                    ? 'Connectez-vous pour débloquer votre Streak, vos XP, le chronomètre et vos notes !'
                    : 'Sign in to unlock your daily streak, XP, timer, and revision notes!'
                )
              }
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-amber-500 text-[#0A1628] font-extrabold text-xs sm:text-sm shadow-md hover:from-[#E4C87F] hover:to-amber-400 cursor-pointer"
            >
              {lang === 'fr' ? 'Se connecter' : 'Sign In'}
            </button>
            <button
              onClick={() =>
                onOpenAuthModal?.(
                  'signup',
                  lang === 'fr'
                    ? 'Créez un compte gratuit pour débloquer toutes les fonctionnalités étudiantes !'
                    : 'Create a free account to unlock all student features!'
                )
              }
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 cursor-pointer"
            >
              {lang === 'fr' ? 'Créer un compte' : 'Sign Up Free'}
            </button>
          </div>
        </div>
      )}

      {/* Grid: Streak Counter & Daily Goal Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. STREAK COUNTER CARD */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#0F1F38] to-[#1A3158] text-white p-4 sm:p-8 relative overflow-hidden shadow-xl border-2 border-[#C9A84C]/30">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                  {!currentUser ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  )}
                  <span>
                    {!currentUser
                      ? (lang === 'fr' ? 'Streak Verrouillé' : 'Streak Locked')
                      : t.streakCardTitle}
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5 sm:gap-3 mt-3 sm:mt-4">
                  <span className="text-4xl sm:text-6xl font-extrabold font-serif-display text-white">
                    {!currentUser ? '0' : progress.currentStreak}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[#C9A84C]">
                    {!currentUser
                      ? (lang === 'fr' ? 'Connexion requise' : 'Sign In Required')
                      : progress.currentStreak === 1
                      ? 'Day Active'
                      : 'Days Streak'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  {!currentUser
                    ? (lang === 'fr'
                      ? 'Connectez-vous pour commencer à enregistrer vos jours d’étude consécutifs.'
                      : 'Sign in to start recording your consecutive daily study sessions.')
                    : (progress.currentStreak > 3 ? t.streakAwesome : t.streakKeepGoing) +
                      ` (Longest: ${progress.longestStreak} days)`}
                </p>
              </div>

              {/* Check in Action Button */}
              <button
                id="btn-dashboard-checkin"
                onClick={handleCheckIn}
                disabled={hasCheckedInToday && !!currentUser}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                  hasCheckedInToday && currentUser
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-default'
                    : 'bg-gradient-to-r from-[#C9A84C] to-amber-500 text-[#0A1628] hover:from-[#E4C87F] hover:to-amber-400 active:scale-95'
                }`}
              >
                {!currentUser ? (
                  <>
                    <Lock className="w-4 h-4 text-[#0A1628]" />
                    <span>{lang === 'fr' ? 'Se connecter pour le Streak' : 'Sign in to start streak'}</span>
                  </>
                ) : hasCheckedInToday ? (
                  <span>✓ {t.alreadyCheckedIn}</span>
                ) : (
                  <span>{t.checkInBtn}</span>
                )}
              </button>
            </div>

            {/* 7-Day Weekly Grid Indicators */}
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {t.weeklyActivity}
              </span>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-3 mt-2 sm:mt-3">
                {dayNames.map((d, idx) => {
                  const isToday = idx === currentDayIndex;
                  const isPastOrToday = idx <= currentDayIndex;
                  const isChecked = isPastOrToday && (isToday ? hasCheckedInToday : true);

                  return (
                    <div
                      key={d}
                      className={`flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-2xl border transition-all ${
                        isToday
                          ? 'border-[#C9A84C] bg-[#C9A84C]/15 ring-2 ring-[#C9A84C]/40'
                          : isChecked
                          ? 'border-white/15 bg-white/5'
                          : 'border-white/5 bg-white/[0.02]'
                      }`}
                    >
                      <span className="text-[10px] sm:text-[11px] font-semibold text-gray-300">{d}</span>
                      <div className="mt-1 flex items-center justify-center">
                        {isChecked ? (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
                            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] sm:text-[10px] text-gray-400">
                            •
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. TODAY FOCUS & DAILY GOAL CARD */}
        <div className="rounded-3xl bg-white border border-[#0A1628]/10 p-4 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#8A99B0]">
                {t.dailyGoal}
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Target className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0A1628] font-serif-display">
                {todayMinutes}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#8A99B0]">
                / {progress.dailyGoalMinutes} {t.minutes}
              </span>
            </div>

            {/* Goal Progress Bar */}
            <div className="mt-3 w-full bg-[#0A1628]/5 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-[#8A99B0] mt-1.5 block">
              {dailyGoalPercent >= 100
                ? '🎉 Daily goal achieved!'
                : `${progress.dailyGoalMinutes - todayMinutes} min remaining to reach goal`}
            </span>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-[#0A1628]/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#0A1628]">
              <span>{t.totalStudyTime}</span>
              <strong className="text-[#0A1628] font-bold">
                {Math.round((progress.totalMinutesStudied / 60) * 10) / 10} {t.hours}
              </strong>
            </div>

            <button
              id="btn-dashboard-start-focus"
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal?.(
                    'signin',
                    lang === 'fr'
                      ? 'Connectez-vous pour utiliser le chronomètre Pomodoro et enregistrer vos sessions.'
                      : 'Sign in to use the Pomodoro timer and log study sessions.'
                  );
                } else {
                  onOpenTimer();
                }
              }}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px] ${
                !currentUser
                  ? 'bg-[#0A1628] text-[#C9A84C] hover:bg-[#122442]'
                  : isRunning
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20 animate-pulse'
                  : isTimerActive
                  ? 'bg-[#0A1628] text-amber-300 hover:bg-[#122442]'
                  : 'bg-[#0A1628] text-[#C9A84C] hover:bg-[#122442]'
              }`}
            >
              {!currentUser ? (
                <>
                  <Lock className="w-4 h-4 text-[#C9A84C]" />
                  <span>{lang === 'fr' ? 'Se connecter pour le timer' : 'Sign in to Start Timer'}</span>
                </>
              ) : (
                <>
                  <Clock className={`w-4 h-4 ${isRunning ? 'animate-spin-slow text-white' : 'text-[#C9A84C]'}`} />
                  <span>
                    {isRunning
                      ? `${lang === 'fr' ? 'Session en cours :' : 'Focus in progress:'} ${formattedTime} (${remainingMinutesLabel})`
                      : isTimerActive
                      ? `${lang === 'fr' ? 'Reprendre session' : 'Resume focus'} (${remainingMinutesLabel})`
                      : t.startTimer}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overall Grade Mastery & Subject Breakdown */}
      <section className="rounded-3xl bg-white border border-[#0A1628]/10 p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-[#0A1628]">
              {t.subjectProgressTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#8A99B0] mt-0.5">
              {totalGradeItems > 0
                ? `${completedInGrade} of ${totalGradeItems} items completed in ${progress.selectedGrade}`
                : lang === 'fr'
                ? `Bientôt disponible pour ${progress.selectedGrade} • Nous y travaillons !`
                : `Coming soon for ${progress.selectedGrade} • We're working on it!`}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="text-left sm:text-right">
              <span className="text-xl sm:text-2xl font-extrabold text-[#0A1628] font-serif-display">
                {gradeProgressPercent}%
              </span>
              <span className="block text-[10px] text-[#8A99B0] uppercase font-bold tracking-wider">
                {t.overallCompletion}
              </span>
            </div>
            <button
              onClick={onExploreCurriculum}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#F5F7FA] hover:bg-[#0A1628]/10 text-xs font-bold text-[#0A1628] transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px]"
            >
              <span>{t.viewAll}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subjects Progress Bar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-1 sm:pt-2">
          {gradeSubjects.map((subject) => {
            const subjItems = allResources.filter(
              (r) => r.grade === progress.selectedGrade && r.subject === subject.name
            );
            const total = subjItems.length;
            const completed = subjItems.filter((r) =>
              progress.completedResourceIds.includes(r.id)
            ).length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            const displayName =
              lang === 'fr'
                ? SUBJECT_METADATA[subject.name]?.frName || subject.name
                : subject.name;

            return (
              <div
                key={subject.name}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/5 hover:border-[#C9A84C]/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl">{subject.icon}</span>
                    <span className="font-bold text-xs sm:text-sm text-[#0A1628]">{displayName}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#0A1628]">{percent}%</span>
                </div>

                <div className="w-full bg-[#0A1628]/10 rounded-full h-2 overflow-hidden my-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: subject.color || '#3B82F6',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8A99B0]">
                  <span>
                    {total > 0
                      ? `${completed}/${total} ${t.itemsCount}`
                      : lang === 'fr'
                      ? '0 élément • Bientôt dispo'
                      : '0 items • Coming Soon'}
                  </span>
                  <span>
                    {total > 0 && completed === total
                      ? lang === 'fr'
                        ? '✓ Maîtrisé'
                        : '✓ Mastered'
                      : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bookmarks & Achievements Dual Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bookmarked Materials */}
        <div className="rounded-3xl bg-white border border-[#0A1628]/10 p-4 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A84C]" />
              <h3 className="text-base sm:text-lg font-bold font-serif-display text-[#0A1628]">
                {t.bookmarksTitle}
              </h3>
            </div>
            <span className="text-xs font-bold text-[#8A99B0]">
              {bookmarkedItems.length} saved
            </span>
          </div>

          {bookmarkedItems.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-[#8A99B0]">
              <p>{t.noBookmarks}</p>
              <button
                onClick={onExploreCurriculum}
                className="mt-3 text-xs font-bold text-[#C9A84C] hover:underline cursor-pointer"
              >
                Browse Curriculum Vault →
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
              {bookmarkedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenResource(item)}
                  className="p-3 rounded-xl bg-[#F5F7FA] hover:bg-[#C9A84C]/10 border border-[#0A1628]/5 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="text-base sm:text-lg">📄</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A1628] line-clamp-1">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-[#8A99B0]">
                        {item.subject} • {item.grade} • {item.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#C9A84C] flex-shrink-0">Open →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges & Achievements */}
        <div className="rounded-3xl bg-white border border-[#0A1628]/10 p-4 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A84C]" />
              <h3 className="text-base sm:text-lg font-bold font-serif-display text-[#0A1628]">
                {t.achievementsTitle}
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              {!currentUser && <Lock className="w-3 h-3" />}
              <span>
                {!currentUser
                  ? (lang === 'fr' ? 'Verrouillé' : 'Locked')
                  : `${
                      BADGES_LIST.filter(
                        (b) =>
                          (b.requiredStreak && progress.longestStreak >= b.requiredStreak) ||
                          (b.requiredCompleted &&
                            progress.completedResourceIds.length >= b.requiredCompleted)
                      ).length
                    } / ${BADGES_LIST.length}`}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {BADGES_LIST.map((badge) => {
              const isUnlocked =
                (badge.requiredStreak && progress.longestStreak >= badge.requiredStreak) ||
                (badge.requiredCompleted &&
                  progress.completedResourceIds.length >= badge.requiredCompleted) ||
                (badge.requiredXp && progress.xp >= badge.requiredXp);

              return (
                <div
                  key={badge.id}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-xs'
                      : 'bg-gray-50/50 border-gray-200/60 opacity-60'
                  }`}
                  title={badge.description}
                >
                  <span className="text-xl sm:text-2xl mb-1">{badge.icon}</span>
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#0A1628] leading-tight line-clamp-1">
                    {badge.title}
                  </h4>
                  <span className="text-[9.5px] sm:text-[10px] text-[#8A99B0] mt-1 line-clamp-1">
                    {isUnlocked ? 'Unlocked ✨' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Study Scratchpad / Personal Subject Notes */}
      <div className="rounded-3xl bg-white border border-[#0A1628]/10 p-4 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A84C]" />
            <h3 className="text-base sm:text-lg font-bold font-serif-display text-[#0A1628]">
              {t.quickNotesTitle}
            </h3>
          </div>
          {currentUser ? (
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">
              ✓ {lang === 'fr' ? 'Sauvegarde automatique' : 'Auto-saved to account'}
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-amber-200">
              <Lock className="w-3 h-3" />
              <span>{lang === 'fr' ? 'Connexion requise' : 'Sign in required'}</span>
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            id="textarea-dashboard-notes"
            disabled={!currentUser}
            value={currentUser ? progress.notes['general'] || '' : ''}
            onChange={(e) =>
              onUpdateProgress({
                notes: {
                  ...progress.notes,
                  general: e.target.value,
                },
              })
            }
            placeholder={
              !currentUser
                ? (lang === 'fr'
                  ? 'Connectez-vous pour débloquer votre bloc-notes personnel et sauvegarder vos fiches de révision...'
                  : 'Sign in to unlock your personal scratchpad and save revision notes...')
                : t.notesPlaceholder
            }
            rows={!currentUser ? 7 : 5}
            className={`w-full p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-[#0A1628] text-xs sm:text-sm focus:border-[#C9A84C] outline-none transition-all resize-none ${
              !currentUser ? 'opacity-30 cursor-not-allowed select-none min-h-[210px] sm:min-h-[220px]' : 'min-h-[130px]'
            }`}
          />

          {/* Locked Overlay for Guest Users */}
          {!currentUser && (
            <div
              id="overlay-notes-locked"
              className="absolute inset-0 bg-white/85 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center p-5 sm:p-7 text-center border border-[#0A1628]/10 shadow-xs"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#0A1628] to-[#14233D] text-[#C9A84C] flex items-center justify-center mb-3 shadow-md ring-4 ring-[#C9A84C]/15 transition-transform hover:scale-105">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#0A1628] tracking-tight">
                {lang === 'fr' ? 'Notes Personnelles Verrouillées' : 'Personal Revision Notes Locked'}
              </h4>
              <p className="text-xs sm:text-[13px] text-[#5A6D87] max-w-md mt-1.5 mb-4 leading-relaxed">
                {lang === 'fr'
                  ? 'Connectez-vous ou créez un compte gratuit pour rédiger, sauvegarder et synchroniser vos notes de révision par matière.'
                  : 'Sign in or create a free account to write, save, and sync your personal revision notes and formulas.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    onOpenAuthModal?.(
                      'signin',
                      lang === 'fr'
                        ? 'Connectez-vous pour débloquer votre bloc-notes personnel.'
                        : 'Sign in to unlock your personal revision notes.'
                    )
                  }
                  className="px-4.5 py-2.5 bg-[#0A1628] hover:bg-[#122442] text-[#C9A84C] text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-2 border border-[#C9A84C]/25"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Se connecter' : 'Sign In to Unlock'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onOpenAuthModal?.(
                      'signup',
                      lang === 'fr'
                        ? 'Créez un compte gratuit pour sauvegarder vos notes de révision.'
                        : 'Create a free account to save your revision notes.'
                    )
                  }
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0A1628] text-xs sm:text-sm font-semibold rounded-xl border border-[#0A1628]/15 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>{lang === 'fr' ? 'Créer un compte' : 'Join Free'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
