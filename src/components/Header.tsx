import React, { useEffect, useRef, useState } from 'react';
import { AppLanguage, AppView, GradeId, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { UserProfileMenu } from './UserProfileMenu';
import { useStudyTimer } from '../context/TimerContext';
import {
  Flame,
  Search,
  BookOpen,
  LayoutDashboard,
  Timer,
  Star,
  Globe,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  lang: AppLanguage;
  onToggleLang: () => void;
  streakCount: number;
  onOpenSearch: () => void;
  user: UserProfile | null;
  onOpenAuthModal: (tab?: 'signin' | 'signup', notice?: string) => void;
  onSignOut: () => void;
  onDeleteAccount?: () => void;
  onUpdateGrade: (grade: GradeId) => void;
  onNavFitsChange?: (fits: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  lang,
  onToggleLang,
  streakCount,
  onOpenSearch,
  user,
  onOpenAuthModal,
  onSignOut,
  onDeleteAccount,
  onUpdateGrade,
  onNavFitsChange,
}) => {
  const t = TRANSLATIONS[lang];
  const {
    isRunning,
    timeLeft,
    totalDurationSeconds,
    remainingMinutesLabel,
    openModal,
  } = useStudyTimer();

  const isTimerActive = isRunning || (timeLeft < totalDurationSeconds && timeLeft > 0);

  const navItems: {
    view: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    { view: 'home', label: t.navHome, icon: null },
    { view: 'curriculum', label: t.navCurriculum, icon: <BookOpen className="w-4 h-4" /> },
    { view: 'dashboard', label: t.navDashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      view: 'timer',
      label: t.navTimer,
      icon: (
        <span className="relative flex items-center">
          <Timer
            className={`w-4 h-4 ${
              isRunning ? 'text-amber-500 animate-spin-slow' : ''
            }`}
          />
          {!user && (
            <Lock className="w-2.5 h-2.5 text-amber-500 absolute -top-1.5 -right-2" />
          )}
        </span>
      ),
      badge: isTimerActive ? remainingMinutesLabel : !user ? (lang === 'fr' ? '🔒' : '🔒') : undefined,
    },
    { view: 'reviews', label: t.navReviews, icon: <Star className="w-4 h-4" /> },
  ];

  // ----- Space-aware nav collapsing -----
  const rowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const measureNavRef = useRef<HTMLDivElement>(null);

  const [navFits, setNavFits] = useState(true);

  useEffect(() => {
    const recalculate = () => {
      const row = rowRef.current;
      const logo = logoRef.current;
      const actions = actionsRef.current;
      const measureNav = measureNavRef.current;
      if (!row || !logo || !actions || !measureNav) return;

      const GAP_BUFFER = 48; // safe margin between sections to guarantee no touch/overlap
      const availableForNav = row.clientWidth - logo.offsetWidth - actions.offsetWidth - GAP_BUFFER;
      const navNeeds = measureNav.scrollWidth;

      const fits = navNeeds <= availableForNav && availableForNav > 0;
      setNavFits(fits);
      onNavFitsChange?.(fits);
    };

    recalculate();

    const observer = new ResizeObserver(recalculate);
    if (rowRef.current) observer.observe(rowRef.current);
    if (logoRef.current) observer.observe(logoRef.current);
    if (actionsRef.current) observer.observe(actionsRef.current);

    window.addEventListener('resize', recalculate);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recalculate);
    };
  }, [lang, onNavFitsChange, isTimerActive]);

  const navLinkClasses = (isActive: boolean) =>
    `flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
      isActive
        ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm font-bold'
        : 'text-[#0A1628]/80 hover:text-[#0A1628] hover:bg-[#0A1628]/5'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#0A1628]/10 transition-colors shadow-xs">
      <div
        ref={rowRef}
        className="relative w-full px-4 sm:px-6 lg:px-8 h-14 sm:h-18 lg:h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap"
      >
        {/* Invisible clone of the nav, used to measure needed width */}
        <div
          ref={measureNavRef}
          aria-hidden="true"
          className="flex items-center gap-1 xl:gap-2 absolute top-0 left-0 opacity-0 pointer-events-none -z-10 whitespace-nowrap"
        >
          {navItems.map((item) => (
            <div key={item.view} className={navLinkClasses(false)}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold font-mono">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Brand Crest & Logo */}
        <div
          ref={logoRef}
          id="header-brand-logo"
          onClick={() => onNavigate('home')}
          className="cursor-pointer transition-transform active:scale-95 flex-shrink-0 flex items-center"
        >
          <BrandLogo
            size="md"
            responsiveHideText={true}
            responsiveHideMotto={true}
          />
        </div>

        {/* Desktop Navigation Links — shown fully inline ONLY when there is ample room */}
        {navFits && (
          <nav className="flex-1 flex items-center justify-center gap-1 xl:gap-2 min-w-0 px-2">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  id={`nav-link-${item.view}`}
                  onClick={() => {
                    if (item.view === 'timer') {
                      if (!user) {
                        onOpenAuthModal(
                          'signin',
                          lang === 'fr'
                            ? 'Connectez-vous ou créez un compte gratuit pour accéder au chronomètre Pomodoro et enregistrer vos sessions.'
                            : 'Please sign in or create a free account to access the Pomodoro focus timer and log your study sessions.'
                        );
                      } else {
                        openModal();
                      }
                    } else {
                      onNavigate(item.view);
                    }
                  }}
                  className={navLinkClasses(isActive)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-mono font-extrabold shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Action Controls & User Account Menu */}
        <div
          ref={actionsRef}
          className="flex items-center gap-1.5 sm:gap-2.5 xl:gap-3 min-w-0 flex-shrink-0 justify-end"
        >
          {/* Quick Global Search Button */}
          <button
            id="btn-global-search"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#8A99B0] hover:text-[#0A1628] hover:border-[#C9A84C]/50 hover:bg-white transition-all cursor-pointer min-h-[36px] min-w-[36px] justify-center flex-shrink-0"
            title="Search materials (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
            <span className="hidden xl:inline text-xs font-semibold text-[#0A1628]/80">{t.search}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-[#0A1628]/10 rounded-md font-mono text-[#8A99B0]">
              ⌘K
            </kbd>
          </button>

          {/* Interactive Streak Counter Pill */}
          <button
            id="btn-header-streak"
            onClick={() => {
              if (!user) {
                onOpenAuthModal(
                  'signin',
                  lang === 'fr'
                    ? 'Connectez-vous pour débloquer votre Streak d’étude quotidien, gagner des XP et sauvegarder vos récompenses !'
                    : 'Log in to unlock your daily study streak, earn XP, and save your achievements!'
                );
              } else {
                onNavigate('dashboard');
              }
            }}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/80 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer group flex-shrink-0 min-h-[36px]"
            title={!user ? (lang === 'fr' ? 'Streak verrouillé (Connexion requise)' : 'Daily streak locked (Sign in required)') : `${streakCount} ${t.streakDays}`}
          >
            {!user ? (
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
            ) : (
              <Flame
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 flex-shrink-0 ${
                  streakCount > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-[#8A99B0]'
                }`}
              />
            )}
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="font-extrabold text-xs sm:text-sm text-amber-700">
                {!user ? 'Streak' : streakCount}
              </span>
              <span className="hidden md:inline text-[11px] font-semibold text-amber-900/80">
                {!user ? '🔒' : streakCount === 1 ? 'day' : 'days'}
              </span>
            </div>
          </button>

          {/* Language Switcher */}
          <button
            id="btn-toggle-language"
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#0A1628]/10 text-xs font-bold text-[#0A1628] hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all cursor-pointer min-h-[36px] flex-shrink-0"
            title="Switch Language (EN / FR)"
          >
            <Globe className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-extrabold">{lang.toUpperCase()}</span>
          </button>


          {/* User Profile & Authentication Menu */}
          <div className="flex-shrink-0">
            <UserProfileMenu
              user={user}
              currentStreak={streakCount}
              onOpenAuthModal={onOpenAuthModal}
              onSignOut={onSignOut}
              onDeleteAccount={onDeleteAccount}
              onUpdateGrade={onUpdateGrade}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
