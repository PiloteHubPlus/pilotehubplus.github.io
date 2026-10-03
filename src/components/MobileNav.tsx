import React from 'react';
import { AppLanguage, AppView, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useStudyTimer } from '../context/TimerContext';
import { Home, BookOpen, LayoutDashboard, Timer, Star, Lock } from 'lucide-react';

interface MobileNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  lang: AppLanguage;
  streakCount: number;
  isVisible?: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'signup', notice?: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  lang,
  streakCount,
  isVisible = true,
  currentUser,
  onOpenAuthModal,
}) => {
  const { isRunning, timeLeft, totalDurationSeconds, remainingMinutesLabel, openModal } =
    useStudyTimer();

  if (!isVisible) return null;

  const t = TRANSLATIONS[lang];
  const isTimerActive = isRunning || (timeLeft < totalDurationSeconds && timeLeft > 0);

  const tabs: {
    view: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    isPulsing?: boolean;
  }[] = [
    { view: 'home', label: t.navHome, icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" /> },
    {
      view: 'curriculum',
      label: t.navCurriculum,
      icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      view: 'dashboard',
      label: t.navDashboard,
      icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />,
      badge: currentUser ? (streakCount > 0 ? streakCount : undefined) : undefined,
    },
    {
      view: 'timer',
      label: t.navTimer,
      icon: (
        <span className="relative flex items-center justify-center">
          <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${isRunning ? 'animate-spin-slow text-amber-500' : ''}`} />
          {!currentUser && (
            <Lock className="w-2.5 h-2.5 text-amber-500 absolute -top-1 -right-1.5" />
          )}
        </span>
      ),
      badge: isTimerActive ? remainingMinutesLabel : !currentUser ? (lang === 'fr' ? '🔒' : '🔒') : undefined,
      badgeColor: isRunning ? 'bg-amber-600' : 'bg-[#0A1628]',
    },
    { view: 'reviews', label: t.navReviews, icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <nav
      id="mobile-bottom-navbar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#0A1628]/10 px-1.5 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(10,22,40,0.08)]"
    >
      <div className="grid grid-cols-5 gap-0.5 max-w-md mx-auto items-center">
        {tabs.map((tab) => {
          const isActive = currentView === tab.view;
          return (
            <button
              key={tab.view}
              id={`mobile-tab-${tab.view}`}
              onClick={() => {
                if (tab.view === 'timer') {
                  if (!currentUser) {
                    onOpenAuthModal?.(
                      'signin',
                      lang === 'fr'
                        ? 'Connectez-vous ou créez un compte gratuit pour utiliser le chronomètre Pomodoro et enregistrer vos sessions.'
                        : 'Please sign in or create a free account to use the Pomodoro timer and study focus tools.'
                    );
                    return;
                  }
                  openModal();
                } else {
                  onNavigate(tab.view);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all active:scale-90 cursor-pointer min-h-[48px] ${
                isActive
                  ? 'text-[#0A1628]'
                  : 'text-[#8A99B0] hover:text-[#0A1628]'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#0A1628] text-[#C9A84C] shadow-xs scale-105' : ''
                }`}
              >
                {tab.icon}

                {/* Badge (e.g. 24m countdown or streak) */}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2 px-1 min-w-[15px] h-3.5 rounded-full text-white font-black text-[8px] flex items-center justify-center shadow-xs border border-white whitespace-nowrap ${
                      tab.badgeColor || 'bg-amber-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] tracking-tight truncate max-w-full mt-0.5 ${
                  isActive ? 'font-extrabold text-[#0A1628]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-0.5 bg-[#C9A84C] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
