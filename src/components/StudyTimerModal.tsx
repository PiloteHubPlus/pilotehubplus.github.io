import React, { useState, useEffect } from 'react';
import { AppLanguage, UserProfile, UserProgressState, CustomTimerPreset } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useStudyTimer, TimerPresetMode } from '../context/TimerContext';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Clock,
  Sparkles,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Bookmark,
  Lock,
  LogIn,
  UserCheck,
  ShieldAlert,
  Flame,
  Award,
} from 'lucide-react';

const STORAGE_KEY_PREFIX_CUSTOM_PRESETS = 'pilotehub_study_timer_custom_presets_';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'signup', notice?: string) => void;
  progress?: UserProgressState;
  onUpdateProgress?: (updated: Partial<UserProgressState>) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUser,
  onOpenAuthModal,
  progress,
  onUpdateProgress,
}) => {
  const t = TRANSLATIONS[lang];
  const {
    mode,
    chosenMinutes,
    isRunning,
    completedSessions,
    toggleTimer,
    resetTimer,
    setMode,
    setCustomDuration,
    formattedTime,
    progressPercent,
    remainingMinutesLabel,
  } = useStudyTimer();

  // Accordion / View toggle for "Explore Options"
  const [showExploreOptions, setShowExploreOptions] = useState<boolean>(false);
  const [isAddingNewPreset, setIsAddingNewPreset] = useState<boolean>(false);

  // New preset form state
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetMinutes, setNewPresetMinutes] = useState<number>(30);
  const [newPresetCategory, setNewPresetCategory] = useState<'focus' | 'exam' | 'break' | 'custom'>('focus');

  // Load custom presets synced to the current user's profile
  const [customPresets, setCustomPresets] = useState<CustomTimerPreset[]>(() => {
    if (progress?.customTimerPresets && progress.customTimerPresets.length > 0) {
      return progress.customTimerPresets;
    }
    if (currentUser?.uid) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PREFIX_CUSTOM_PRESETS + currentUser.uid);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {}
    }
    return [
      { id: 'preset-math', name: lang === 'fr' ? 'Maths Spécialité' : 'Math Practice', minutes: 40, category: 'exam' },
      { id: 'preset-flash', name: lang === 'fr' ? 'Flashcards / Mémorisation' : 'Flashcards Review', minutes: 20, category: 'focus' },
    ];
  });

  // Sync custom presets whenever currentUser or progress changes
  useEffect(() => {
    if (currentUser && progress?.customTimerPresets) {
      setCustomPresets(progress.customTimerPresets);
    } else if (currentUser?.uid) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PREFIX_CUSTOM_PRESETS + currentUser.uid);
        if (saved) {
          setCustomPresets(JSON.parse(saved));
        }
      } catch {}
    } else {
      // Guest state: reset active custom preset selection
      setActiveCustomPresetId(null);
    }
  }, [currentUser?.uid, progress?.customTimerPresets]);

  const [activeCustomPresetId, setActiveCustomPresetId] = useState<string | null>(null);

  // Custom minute picker input state
  const [customInputMins, setCustomInputMins] = useState<string>(
    mode === 'custom' ? String(chosenMinutes) : '30'
  );

  if (!isOpen) return null;

  // Prompt guest to log in
  const handlePromptLogin = (actionDescription?: string) => {
    const notice = actionDescription || (lang === 'fr'
      ? 'Veuillez vous connecter ou créer un compte pour régler le chronomètre d’étude et synchroniser vos préréglages personnalisés.'
      : 'Please sign in or create an account to set study timers and sync your personalized presets.');
    
    onClose();
    onOpenAuthModal?.('signin', notice);
  };

  const handleSelectStandardPreset = (preset: TimerPresetMode) => {
    if (!currentUser) {
      handlePromptLogin();
      return;
    }
    setActiveCustomPresetId(null);
    setMode(preset);
  };

  const handleSelectCustomPreset = (preset: CustomTimerPreset) => {
    if (!currentUser) {
      handlePromptLogin();
      return;
    }
    setActiveCustomPresetId(preset.id);
    setCustomDuration(preset.minutes);
  };

  const handleApplyCustomMinutes = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      handlePromptLogin();
      return;
    }
    const val = parseInt(customInputMins, 10);
    if (!isNaN(val) && val >= 1 && val <= 180) {
      setActiveCustomPresetId(null);
      setCustomDuration(val);
    }
  };

  const handleCreateCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      handlePromptLogin();
      return;
    }

    const trimmedName = newPresetName.trim();
    if (!trimmedName) return;

    const validMinutes = Math.max(1, Math.min(180, Math.round(newPresetMinutes || 25)));
    const newPreset: CustomTimerPreset = {
      id: `preset-${Date.now()}`,
      name: trimmedName,
      minutes: validMinutes,
      category: newPresetCategory,
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    setActiveCustomPresetId(newPreset.id);
    setCustomDuration(validMinutes);

    // Save to user account / progress
    if (currentUser?.uid) {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX_CUSTOM_PRESETS + currentUser.uid, JSON.stringify(updated));
      } catch {}
      onUpdateProgress?.({ customTimerPresets: updated });
    }

    // Reset form
    setNewPresetName('');
    setNewPresetMinutes(30);
    setIsAddingNewPreset(false);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      handlePromptLogin();
      return;
    }
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    if (activeCustomPresetId === id) {
      setActiveCustomPresetId(null);
    }

    // Save to user account / progress
    if (currentUser?.uid) {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX_CUSTOM_PRESETS + currentUser.uid, JSON.stringify(updated));
      } catch {}
      onUpdateProgress?.({ customTimerPresets: updated });
    }
  };

  const handleToggleTimerWithAuth = () => {
    if (!currentUser) {
      handlePromptLogin(
        lang === 'fr'
          ? 'Connectez-vous pour lancer une session de travail et enregistrer votre temps d’étude sur votre profil.'
          : 'Sign in to start focus sessions and log study time to your student profile.'
      );
      return;
    }
    toggleTimer();
  };

  const handleToggleExploreOptionsWithAuth = () => {
    if (!currentUser) {
      handlePromptLogin(
        lang === 'fr'
          ? 'Connectez-vous pour explorer et créer des préréglages de révision synchronisés avec votre compte.'
          : 'Sign in to explore and create study presets synced with your student account.'
      );
      return;
    }
    setShowExploreOptions((prev) => !prev);
  };

  // Get active preset display label
  const getActivePresetLabel = () => {
    if (activeCustomPresetId) {
      const found = customPresets.find((p) => p.id === activeCustomPresetId);
      if (found) return `${found.name} (${found.minutes}m)`;
    }
    if (mode === 'pomodoro') return lang === 'fr' ? 'Pomodoro (25m)' : 'Pomodoro (25m)';
    if (mode === 'quickFocus') return lang === 'fr' ? 'Sprint Express (15m)' : 'Sprint (15m)';
    if (mode === 'deepWork') return lang === 'fr' ? 'Approfondi (45m)' : 'Deep Work (45m)';
    if (mode === 'powerHour') return lang === 'fr' ? '1 Heure (60m)' : '1 Hour (60m)';
    if (mode === 'shortBreak') return lang === 'fr' ? 'Pause (5m)' : 'Break (5m)';
    if (mode === 'longBreak') return lang === 'fr' ? 'Grande Pause (15m)' : 'Long Break (15m)';
    return `${chosenMinutes}m ${lang === 'fr' ? 'Personnalisé' : 'Custom'}`;
  };

  return (
    <div
      id="modal-study-timer"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1628]/60 backdrop-blur-sm animate-fadeUp"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#0A1628]/10 overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#0A1628]/10 flex items-center justify-between bg-[#F5F7FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0A1628] text-[#C9A84C] flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-serif-display text-[#0A1628]">
                {t.timerTitle}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-[#8A99B0]">
                {currentUser ? (
                  <>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isRunning ? 'bg-emerald-500' : 'bg-[#8A99B0]'
                      }`}
                    />
                    <span>
                      {isRunning
                        ? lang === 'fr'
                          ? 'Actif en arrière-plan'
                          : 'Running in background'
                        : lang === 'fr'
                        ? 'En pause / Prêt'
                        : 'Paused / Ready'}
                    </span>
                    <span className="text-[#0A1628]/40">•</span>
                    <span className="font-semibold text-[#0A1628]/70 truncate max-w-[140px] sm:max-w-[200px]">
                      {getActivePresetLabel()}
                    </span>
                  </>
                ) : (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {lang === 'fr' ? 'Connexion requise' : 'Sign in required'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {currentUser && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                <UserCheck className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{currentUser.displayName}</span>
              </span>
            )}
            <button
              id="btn-close-timer-modal"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#0A1628]/10 text-[#8A99B0] hover:text-[#0A1628] transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 text-center space-y-4 sm:space-y-5">
          {/* Guest Auth Notice Banner (when not logged in) */}
          {!currentUser && (
            <div
              id="banner-timer-guest-locked"
              className="p-4 rounded-2xl bg-gradient-to-br from-[#0A1628] to-[#152a4a] text-white border-2 border-[#C9A84C]/50 shadow-md text-left space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C9A84C] text-[#0A1628] flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#C9A84C]">
                    {lang === 'fr'
                      ? 'Synchronisation & Sessions d’Étude Personnalisées'
                      : 'Account Sync & Personalized Focus Presets'}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    {lang === 'fr'
                      ? 'Connectez-vous pour définir un chronomètre, créer vos préréglages personnalisés et synchroniser automatiquement votre temps d’étude avec votre Streak et votre profil.'
                      : 'Sign in to start study timers, create customized named presets, and automatically sync your focus sessions with your streak and student profile.'}
                  </p>
                </div>
              </div>

              {/* Sync benefits pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] pt-1 text-white/90">
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                  <Bookmark className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>{lang === 'fr' ? 'Préréglages dédiés' : 'Custom presets'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Streak & XP</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'fr' ? 'Stats d’apprentissage' : 'Focus history'}</span>
                </div>
              </div>

              {/* Auth CTA Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  id="btn-timer-auth-signin"
                  type="button"
                  onClick={() =>
                    handlePromptLogin(
                      lang === 'fr'
                        ? 'Connectez-vous pour régler le chronomètre d’étude et charger vos préréglages synchronisés.'
                        : 'Sign in to configure the study timer and load your synced presets.'
                    )
                  }
                  className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-[#C9A84C] to-amber-500 text-[#0A1628] font-extrabold text-xs sm:text-sm rounded-xl hover:from-[#E4C87F] hover:to-amber-400 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Se connecter pour régler' : 'Sign In to Set Timer'}</span>
                </button>
                <button
                  id="btn-timer-auth-signup"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal?.(
                      'signup',
                      lang === 'fr'
                        ? 'Créez un compte gratuit pour débloquer le chronomètre d’étude et vos préréglages personnalisés.'
                        : 'Create a free student account to unlock the study timer and custom presets.'
                    );
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/20"
                >
                  {lang === 'fr' ? 'Créer un compte' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* Explore Options Primary Toggle Button */}
          <div className="space-y-2">
            <button
              id="btn-explore-timer-options"
              type="button"
              onClick={handleToggleExploreOptionsWithAuth}
              className={`w-full py-2.5 px-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xs active:scale-[0.99] ${
                showExploreOptions && currentUser
                  ? 'bg-[#0A1628] text-white border-[#0A1628]'
                  : 'bg-[#F5F7FA] text-[#0A1628] border-[#0A1628]/15 hover:border-[#C9A84C] hover:bg-[#F0F3F8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sliders
                  className={`w-4 h-4 transition-transform ${
                    showExploreOptions && currentUser ? 'text-[#C9A84C] rotate-90' : 'text-[#C9A84C]'
                  }`}
                />
                <span className="text-xs sm:text-sm font-extrabold">
                  {lang === 'fr' ? 'Explorer les options' : 'Explore Options'}
                </span>
                {currentUser && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      showExploreOptions
                        ? 'bg-white/15 text-[#C9A84C]'
                        : 'bg-[#0A1628]/10 text-[#0A1628]'
                    }`}
                  >
                    {chosenMinutes} min
                  </span>
                )}
                {!currentUser && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {lang === 'fr' ? 'Verrouillé' : 'Locked'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] opacity-70 hidden sm:inline">
                  {currentUser
                    ? showExploreOptions
                      ? lang === 'fr'
                        ? 'Masquer'
                        : 'Hide presets'
                      : lang === 'fr'
                      ? 'Préréglages & Personnalisation'
                      : 'Presets & Custom'
                    : lang === 'fr'
                    ? 'Connexion requise'
                    : 'Sign in to customize'}
                </span>
                {showExploreOptions && currentUser ? (
                  <ChevronUp className="w-4 h-4 text-[#C9A84C]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#C9A84C]" />
                )}
              </div>
            </button>

            {/* Expandable Options Tray (Active when Logged In) */}
            {showExploreOptions && currentUser && (
              <div className="p-3 sm:p-4 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 space-y-4 text-left animate-fadeIn">
                {/* 1. Default Standard Presets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#8A99B0] uppercase tracking-wider">
                      {lang === 'fr' ? 'Préréglages Standard' : 'Standard Focus Presets'}
                    </span>
                    <span className="text-[10px] text-[#8A99B0]">
                      {lang === 'fr' ? 'Sélection rapide' : 'Quick select'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectStandardPreset('pomodoro')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate text-center ${
                        mode === 'pomodoro' && !activeCustomPresetId
                          ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm ring-2 ring-[#C9A84C]'
                          : 'bg-white text-[#0A1628]/80 hover:text-[#0A1628] hover:bg-white/80 border border-[#0A1628]/10'
                      }`}
                    >
                      25m {lang === 'fr' ? 'Pomodoro' : 'Pomodoro'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectStandardPreset('quickFocus')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate text-center ${
                        mode === 'quickFocus' && !activeCustomPresetId
                          ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm ring-2 ring-[#C9A84C]'
                          : 'bg-white text-[#0A1628]/80 hover:text-[#0A1628] hover:bg-white/80 border border-[#0A1628]/10'
                      }`}
                    >
                      15m {lang === 'fr' ? 'Sprint' : 'Sprint'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectStandardPreset('deepWork')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate text-center ${
                        mode === 'deepWork' && !activeCustomPresetId
                          ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm ring-2 ring-[#C9A84C]'
                          : 'bg-white text-[#0A1628]/80 hover:text-[#0A1628] hover:bg-white/80 border border-[#0A1628]/10'
                      }`}
                    >
                      45m {lang === 'fr' ? 'Approfondi' : 'Deep Work'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectStandardPreset('powerHour')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate text-center ${
                        mode === 'powerHour' && !activeCustomPresetId
                          ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm ring-2 ring-[#C9A84C]'
                          : 'bg-white text-[#0A1628]/80 hover:text-[#0A1628] hover:bg-white/80 border border-[#0A1628]/10'
                      }`}
                    >
                      60m {lang === 'fr' ? '1 Heure' : '1 Hour'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectStandardPreset('shortBreak')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate text-center ${
                        mode === 'shortBreak' && !activeCustomPresetId
                          ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-white text-[#0A1628]/80 hover:text-[#0A1628] hover:bg-white/80 border border-[#0A1628]/10'
                      }`}
                    >
                      5m {lang === 'fr' ? 'Pause' : 'Break'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectStandardPreset('longBreak')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate text-center ${
                        mode === 'longBreak' && !activeCustomPresetId
                          ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-white text-[#0A1628]/80 hover:text-[#0A1628] hover:bg-white/80 border border-[#0A1628]/10'
                      }`}
                    >
                      15m {lang === 'fr' ? 'Gde Pause' : 'Long Break'}
                    </button>
                  </div>
                </div>

                {/* 2. Custom Named Presets List Synced to User Account */}
                <div className="pt-2 border-t border-[#0A1628]/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-[#C9A84C]" />
                      <span className="text-[11px] font-bold text-[#8A99B0] uppercase tracking-wider">
                        {lang === 'fr' ? 'Mes Préréglages Synchronisés' : 'My Synced Presets'}
                      </span>
                    </div>

                    {!isAddingNewPreset && (
                      <button
                        id="btn-add-custom-preset-toggle"
                        type="button"
                        onClick={() => setIsAddingNewPreset(true)}
                        className="text-xs font-bold text-[#C9A84C] hover:text-amber-700 flex items-center gap-1 transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#C9A84C]/30 shadow-2xs active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'fr' ? '+ Nouveau' : '+ Add Preset'}</span>
                      </button>
                    )}
                  </div>

                  {/* Add Preset Form */}
                  {isAddingNewPreset && (
                    <form
                      onSubmit={handleCreateCustomPreset}
                      className="p-3 bg-white rounded-xl border-2 border-[#C9A84C]/50 mb-3 space-y-2.5 shadow-sm animate-fadeIn"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#0A1628]">
                          {lang === 'fr' ? 'Créer un préréglage pour mon compte' : 'Create Preset on My Account'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewPreset(false)}
                          className="text-xs text-[#8A99B0] hover:text-[#0A1628] p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor="input-preset-name"
                          className="block text-[11px] font-bold text-[#0A1628]/80 mb-1"
                        >
                          {lang === 'fr' ? 'Nom du préréglage / Matière :' : 'Preset Name / Subject:'}
                        </label>
                        <input
                          id="input-preset-name"
                          type="text"
                          required
                          maxLength={35}
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                          placeholder={
                            lang === 'fr'
                              ? 'Ex: Révision Bac Math, Philosophie...'
                              : 'e.g. Physics Exam Prep, Math Practice...'
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#0A1628]/20 bg-[#F5F7FA] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C9A84C]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label
                            htmlFor="input-preset-minutes"
                            className="block text-[11px] font-bold text-[#0A1628]/80 mb-1"
                          >
                            {lang === 'fr' ? 'Durée (minutes) :' : 'Duration (minutes):'}
                          </label>
                          <input
                            id="input-preset-minutes"
                            type="number"
                            min="1"
                            max="180"
                            value={newPresetMinutes}
                            onChange={(e) => setNewPresetMinutes(Number(e.target.value))}
                            className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-[#0A1628]/20 bg-[#F5F7FA] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C9A84C]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="select-preset-category"
                            className="block text-[11px] font-bold text-[#0A1628]/80 mb-1"
                          >
                            {lang === 'fr' ? 'Catégorie :' : 'Category tag:'}
                          </label>
                          <select
                            id="select-preset-category"
                            value={newPresetCategory}
                            onChange={(e) =>
                              setNewPresetCategory(
                                e.target.value as 'focus' | 'exam' | 'break' | 'custom'
                              )
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#0A1628]/20 bg-[#F5F7FA] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C9A84C]"
                          >
                            <option value="focus">{lang === 'fr' ? '🎯 Focus' : '🎯 Focus'}</option>
                            <option value="exam">{lang === 'fr' ? '📝 Examen' : '📝 Exam'}</option>
                            <option value="break">{lang === 'fr' ? '☕ Pause' : '☕ Break'}</option>
                            <option value="custom">{lang === 'fr' ? '⭐ Personnalisé' : '⭐ Custom'}</option>
                          </select>
                        </div>
                      </div>

                      {/* Quick minute suggestion chips */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-[#8A99B0]">
                          {lang === 'fr' ? 'Suggestions :' : 'Quick picks:'}
                        </span>
                        {[20, 30, 40, 50, 90].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setNewPresetMinutes(mins)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0A1628]/5 hover:bg-[#C9A84C]/20 text-[#0A1628] transition-colors cursor-pointer"
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingNewPreset(false)}
                          className="px-3 py-1 text-xs text-[#8A99B0] hover:text-[#0A1628] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          {lang === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                        <button
                          id="btn-save-custom-preset"
                          type="submit"
                          className="px-3.5 py-1.5 bg-[#0A1628] text-[#C9A84C] font-extrabold text-xs rounded-lg hover:bg-[#152a4a] transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {lang === 'fr' ? 'Enregistrer & Activer' : 'Save to Account'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of custom presets */}
                  {customPresets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customPresets.map((preset) => {
                        const isSelected = activeCustomPresetId === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectCustomPreset(preset)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                              isSelected
                                ? 'bg-[#0A1628] text-white border-[#0A1628] ring-2 ring-[#C9A84C] shadow-xs'
                                : 'bg-white text-[#0A1628] border-[#0A1628]/10 hover:border-[#C9A84C]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-[#C9A84C] text-[#0A1628]'
                                    : 'bg-[#0A1628]/5 text-[#C9A84C]'
                                }`}
                              >
                                {preset.category === 'exam'
                                  ? '📝'
                                  : preset.category === 'break'
                                  ? '☕'
                                  : '🎯'}
                              </span>
                              <div className="truncate">
                                <div className="text-xs font-bold truncate leading-tight">
                                  {preset.name}
                                </div>
                                <div
                                  className={`text-[10px] font-mono ${
                                    isSelected ? 'text-[#C9A84C]' : 'text-[#8A99B0]'
                                  }`}
                                >
                                  {preset.minutes} {lang === 'fr' ? 'minutes' : 'minutes'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                                className={`p-1 rounded-md transition-colors opacity-60 hover:opacity-100 ${
                                  isSelected
                                    ? 'text-white hover:bg-white/20'
                                    : 'text-[#8A99B0] hover:text-rose-600 hover:bg-rose-50'
                                }`}
                                title={lang === 'fr' ? 'Supprimer' : 'Delete preset'}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-[#8A99B0] italic bg-white/50 rounded-xl border border-dashed border-[#0A1628]/15">
                      {lang === 'fr'
                        ? 'Aucun préréglage personnalisé. Cliquez sur "+ Nouveau" pour en créer un !'
                        : 'No custom presets yet. Click "+ Add Preset" to create one!'}
                    </div>
                  )}
                </div>

                {/* 3. Direct Custom Duration Slider / Minute Form */}
                <div className="pt-2 border-t border-[#0A1628]/10 flex items-center justify-between gap-2">
                  <label
                    htmlFor="input-custom-mins"
                    className="text-[11px] font-bold text-[#0A1628] flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3 text-[#C9A84C]" />
                    <span>{lang === 'fr' ? 'Minutes directes :' : 'Exact minutes:'}</span>
                  </label>
                  <form onSubmit={handleApplyCustomMinutes} className="flex items-center gap-1.5">
                    <input
                      id="input-custom-mins"
                      type="number"
                      min="1"
                      max="180"
                      value={customInputMins}
                      onChange={(e) => setCustomInputMins(e.target.value)}
                      className="w-16 px-2.5 py-1 text-center font-extrabold text-xs rounded-xl border border-[#0A1628]/20 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C9A84C]"
                      placeholder="25"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-[#0A1628] text-[#C9A84C] rounded-xl text-xs font-bold hover:bg-[#152a4a] transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {lang === 'fr' ? 'Régler' : 'Set'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Large Digital Clock & Progress */}
          <div className="relative py-1 sm:py-2 flex flex-col items-center justify-center">
            <div className="text-6xl sm:text-7xl font-extrabold font-serif-display text-[#0A1628] tracking-tight">
              {formattedTime}
            </div>

            {/* Linear Progress Bar with glowing accent */}
            <div className="mt-3 w-full bg-[#0A1628]/5 rounded-full h-2.5 overflow-hidden max-w-sm mx-auto p-0.5 border border-[#0A1628]/5">
              <div
                className="h-full bg-gradient-to-r from-[#C9A84C] to-amber-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${currentUser ? progressPercent : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full max-w-sm mt-2 text-[11px] text-[#8A99B0] px-1">
              <span>
                {currentUser ? `${Math.round(progressPercent)}% ${lang === 'fr' ? 'écoulé' : 'elapsed'}` : (lang === 'fr' ? 'Prêt pour la session' : 'Ready for focus session')}
              </span>
              <span className="font-bold text-[#0A1628]">
                {remainingMinutesLabel} {lang === 'fr' ? 'restantes' : 'remaining'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <button
              id="btn-timer-toggle"
              onClick={handleToggleTimerWithAuth}
              className={`flex-1 px-6 sm:px-8 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer min-h-[48px] ${
                !currentUser
                  ? 'bg-[#0A1628] text-[#C9A84C] hover:bg-[#152a4a] shadow-[#0A1628]/20 ring-2 ring-[#C9A84C]/40'
                  : isRunning
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-[#0A1628] text-[#C9A84C] hover:bg-[#152a4a] shadow-[#0A1628]/20'
              }`}
            >
              {!currentUser ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{lang === 'fr' ? 'Se connecter pour démarrer' : 'Sign In to Start Timer'}</span>
                </>
              ) : isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>{t.pauseTimer}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t.startTimer}</span>
                </>
              )}
            </button>

            {currentUser && (
              <button
                id="btn-timer-reset"
                onClick={resetTimer}
                className="p-3.5 rounded-2xl border border-[#0A1628]/15 bg-white text-[#0A1628] hover:bg-[#F5F7FA] hover:border-[#0A1628]/30 transition-all cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center shadow-xs active:scale-90"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Background Tip & Stats Footer */}
          <div className="pt-3 border-t border-[#0A1628]/10 text-xs text-[#8A99B0] flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-left text-[11.5px] text-[#0A1628]/80">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
              <span>
                {currentUser
                  ? (lang === 'fr'
                    ? 'Le chronomètre continue de tourner pendant que vous explorez les cours !'
                    : 'Timer runs continuously in background as you browse lessons & quizzes.')
                  : (lang === 'fr'
                    ? 'Les sessions terminées attribuent des points d’XP et comptabilisent votre temps.'
                    : 'Completed sessions award XP and automatically log focus minutes.')}
              </span>
            </div>
            {currentUser && (
              <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#0A1628] whitespace-nowrap">
                <span>{lang === 'fr' ? 'Sessions :' : 'Blocks :'}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#0A1628]/5 text-[#C9A84C] font-extrabold">
                  {completedSessions}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
