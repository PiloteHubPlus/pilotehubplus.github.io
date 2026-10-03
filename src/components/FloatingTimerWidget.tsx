import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppLanguage, UserProfile } from '../types';
import { useStudyTimer } from '../context/TimerContext';
import { Play, Pause, RotateCcw, Maximize2, Clock, CheckCircle2, X, GripVertical, Lock } from 'lucide-react';

interface FloatingTimerWidgetProps {
  lang: AppLanguage;
  hasBottomNav?: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'signup', notice?: string) => void;
}

export const FloatingTimerWidget: React.FC<FloatingTimerWidgetProps> = ({
  lang,
  hasBottomNav = false,
  currentUser,
  onOpenAuthModal,
}) => {
  const {
    isRunning,
    timeLeft,
    totalDurationSeconds,
    formattedTime,
    remainingMinutesLabel,
    progressPercent,
    toggleTimer,
    resetTimer,
    openModal,
    lastCompletedSessionInfo,
    dismissCompletionBanner,
  } = useStudyTimer();

  const isTimerActive = isRunning || (timeLeft < totalDurationSeconds && timeLeft > 0);

  // Position state (in px from top-left of window)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasUserMovedRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number; hasMoved: boolean }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    hasMoved: false,
  });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Calculate safe boundary constraints
  const getBounds = useCallback(() => {
    const headerEl = document.querySelector('header');
    const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 80;
    
    // Top boundary must stay strictly BELOW the header & nav items
    const minY = Math.max(headerBottom + 12, 76);
    
    const widgetWidth = widgetRef.current?.offsetWidth || 240;
    const widgetHeight = widgetRef.current?.offsetHeight || 56;
    
    const bottomNavOffset = hasBottomNav ? 84 : 24;
    const maxY = Math.max(minY, window.innerHeight - widgetHeight - bottomNavOffset);
    
    const minX = 12;
    const maxX = Math.max(minX, window.innerWidth - widgetWidth - 12);

    return { minX, maxX, minY, maxY, widgetWidth, widgetHeight };
  }, [hasBottomNav]);

  // Compute default resting position:
  // On desktop / larger screens where header is full (!hasBottomNav), center horizontally at lower screen bottom
  const getDefaultPosition = useCallback(() => {
    const { minX, maxX, minY, maxY, widgetWidth } = getBounds();
    if (!hasBottomNav) {
      // Centered at the lower screen bottom
      const centerX = Math.round((window.innerWidth - widgetWidth) / 2);
      return {
        x: Math.min(Math.max(centerX, minX), maxX),
        y: maxY,
      };
    } else {
      // Mobile / tablet with bottom nav
      return {
        x: maxX,
        y: maxY,
      };
    }
  }, [hasBottomNav, getBounds]);

  // Set initial position and handle viewport resizing
  useEffect(() => {
    const handleResizeOrInit = () => {
      const { minX, maxX, minY, maxY } = getBounds();
      setPosition((prev) => {
        // If user hasn't explicitly dragged the widget, always keep the ideal default (centered on desktop bottom)
        if (!hasUserMovedRef.current || !prev) {
          return getDefaultPosition();
        }
        // Clamp existing user-placed position within the safe boundary
        return {
          x: Math.min(Math.max(prev.x, minX), maxX),
          y: Math.min(Math.max(prev.y, minY), maxY),
        };
      });
    };

    handleResizeOrInit();
    window.addEventListener('resize', handleResizeOrInit);
    return () => window.removeEventListener('resize', handleResizeOrInit);
  }, [getBounds, getDefaultPosition]);

  // Pointer drag listeners with boundary clamping
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary pointer
    if (e.button !== 0) return;
    
    const widgetEl = widgetRef.current;
    if (!widgetEl) return;

    const rect = widgetEl.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: rect.left,
      posY: rect.top,
      hasMoved: false,
    };

    setIsDragging(true);
    widgetEl.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragStartRef.current.hasMoved = true;
      hasUserMovedRef.current = true;
    }

    const nextX = dragStartRef.current.posX + deltaX;
    const nextY = dragStartRef.current.posY + deltaY;

    const { minX, maxX, minY, maxY } = getBounds();

    setPosition({
      x: Math.min(Math.max(nextX, minX), maxX),
      y: Math.min(Math.max(nextY, minY), maxY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      widgetRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuthModal?.(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous pour régler et démarrer le chronomètre d’étude.'
          : 'Please sign in to set and start your study timer sessions.'
      );
      return;
    }
    toggleTimer();
  };

  // Completion toast notification popup
  const renderCompletionBanner = () => (
    <div className="fixed bottom-24 right-4 sm:right-8 z-50 animate-bounce max-w-sm bg-[#0A1628] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#C9A84C] flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-[#C9A84C] text-[#0A1628] flex items-center justify-center font-bold flex-shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-[#C9A84C]">
          {lang === 'fr' ? 'Session de Travail Terminée !' : 'Study Block Completed!'}
        </h4>
        <p className="text-xs text-gray-200 mt-0.5">
          {lang === 'fr'
            ? `Bravo ! ${lastCompletedSessionInfo?.minutes} minutes enregistrées.`
            : `Well done! ${lastCompletedSessionInfo?.minutes} focus minutes logged.`}
        </p>
      </div>
      <button
        onClick={dismissCompletionBanner}
        className="text-gray-400 hover:text-white p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      {lastCompletedSessionInfo && renderCompletionBanner()}

      {isTimerActive && (
        <div
          id="floating-study-timer"
          ref={widgetRef}
          style={{
            position: 'fixed',
            left: position ? `${position.x}px` : undefined,
            top: position ? `${position.y}px` : undefined,
            right: !position ? (hasBottomNav ? '12px' : undefined) : undefined,
            bottom: !position ? (hasBottomNav ? '80px' : '24px') : undefined,
            transform: !position && !hasBottomNav ? 'translateX(-50%)' : undefined,
            ...( !position && !hasBottomNav ? { left: '50%' } : {} ),
            touchAction: 'none',
          }}
          className={`z-40 transition-shadow select-none ${
            isDragging ? 'cursor-grabbing scale-[1.02] shadow-2xl' : 'cursor-grab'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="bg-[#0A1628]/95 backdrop-blur-md text-white px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl shadow-2xl border border-[#C9A84C]/40 flex items-center gap-2 sm:gap-3 group hover:border-[#C9A84C] hover:shadow-[#C9A84C]/15 transition-all">
            {/* Subtle Grip Drag Handle indicator */}
            <div
              className="flex items-center justify-center text-white/35 group-hover:text-[#C9A84C] transition-colors cursor-grab active:cursor-grabbing p-0.5"
              title={lang === 'fr' ? 'Glisser pour déplacer' : 'Drag to reposition'}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Clock Icon with Countdown Badge */}
            <button
              onClick={(e) => {
                if (dragStartRef.current.hasMoved) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                openModal();
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer active:scale-95 transition-transform"
              title={lang === 'fr' ? 'Cliquer pour ouvrir le chronomètre' : 'Click to expand study timer'}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                    isRunning
                      ? 'bg-gradient-to-br from-[#C9A84C] to-amber-600 text-[#0A1628] shadow-md shadow-[#C9A84C]/25'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-xs sm:text-sm text-[#C9A84C] tracking-wide">
                    {formattedTime}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-white/60 hidden sm:inline">
                    ({remainingMinutesLabel})
                  </span>
                </div>
                <div className="w-16 sm:w-20 bg-white/15 rounded-full h-1 overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#C9A84C] to-amber-400 transition-all duration-300"
                    style={{ width: `${currentUser ? progressPercent : 0}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Quick Inline Controls */}
            <div
              className="flex items-center gap-1 pl-1.5 border-l border-white/15"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={handlePlayToggle}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  !currentUser
                    ? 'hover:bg-amber-500/20 text-[#C9A84C]'
                    : isRunning
                    ? 'hover:bg-amber-500/20 text-amber-300'
                    : 'hover:bg-emerald-500/20 text-emerald-300'
                }`}
                title={
                  !currentUser
                    ? (lang === 'fr' ? 'Connexion requise' : 'Sign in to start')
                    : isRunning
                    ? (lang === 'fr' ? 'Pause' : 'Pause')
                    : (lang === 'fr' ? 'Démarrer' : 'Start')
                }
              >
                {!currentUser ? (
                  <Lock className="w-3.5 h-3.5 text-[#C9A84C]" />
                ) : isRunning ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
              </button>

              {currentUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetTimer();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                  title={lang === 'fr' ? 'Réinitialiser' : 'Reset'}
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal();
                }}
                className="p-1.5 rounded-lg hover:bg-[#C9A84C]/20 text-[#C9A84C] transition-all cursor-pointer"
                title={lang === 'fr' ? 'Agrandir' : 'Expand Full Timer'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
