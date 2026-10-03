import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import confetti from 'canvas-confetti';

export type TimerPresetMode =
  | 'pomodoro' // 25 min
  | 'quickFocus' // 15 min
  | 'deepWork' // 45 min
  | 'powerHour' // 60 min
  | 'shortBreak' // 5 min
  | 'longBreak' // 15 min
  | 'custom'; // user chosen minutes

export const PRESET_DURATIONS_MINUTES: Record<TimerPresetMode, number> = {
  pomodoro: 25,
  quickFocus: 15,
  deepWork: 45,
  powerHour: 60,
  shortBreak: 5,
  longBreak: 15,
  custom: 30,
};

interface TimerContextValue {
  mode: TimerPresetMode;
  chosenMinutes: number;
  totalDurationSeconds: number;
  timeLeft: number;
  isRunning: boolean;
  completedSessions: number;
  isModalOpen: boolean;
  remainingMinutes: number; // e.g. 24
  remainingMinutesLabel: string; // e.g. "24m"
  formattedTime: string; // e.g. "24:35"
  progressPercent: number; // 0 to 100
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: TimerPresetMode, customMins?: number) => void;
  setCustomDuration: (minutes: number) => void;
  openModal: () => void;
  closeModal: () => void;
  dismissCompletionBanner: () => void;
  lastCompletedSessionInfo: { minutes: number; time: string } | null;
}

const TimerContext = createContext<TimerContextValue | null>(null);

const STORAGE_KEY_TIMER_STATE = 'pilotehub_study_timer_state_v1';

export const TimerProvider: React.FC<{
  children: ReactNode;
  onLogStudyMinutes?: (minutes: number) => void;
}> = ({ children, onLogStudyMinutes }) => {
  // Load saved state or default to 25m Pomodoro
  const [mode, setModeState] = useState<TimerPresetMode>('pomodoro');
  const [chosenMinutes, setChosenMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lastCompletedSessionInfo, setLastCompletedSessionInfo] = useState<{
    minutes: number;
    time: string;
  } | null>(null);

  const timerRef = useRef<any>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  // Play audio chime using Web Audio synthesizer
  const playChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Chord chime: D5 -> A5 with harmonious decay
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
    } catch {
      // Audio context might be guarded in restricted autoplay
    }
  }, []);

  const totalDurationSeconds = chosenMinutes * 60;

  // Handle countdown tick with accurate timestamp delta
  useEffect(() => {
    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.round((targetEndTimeRef.current! - Date.now()) / 1000)
        );

        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          targetEndTimeRef.current = null;
          setIsRunning(false);
          playChime();

          // Log completed focus minutes if it was a focus block
          const isFocusSession = mode !== 'shortBreak' && mode !== 'longBreak';
          if (isFocusSession) {
            onLogStudyMinutes?.(chosenMinutes);
            setCompletedSessions((s) => s + 1);
            setLastCompletedSessionInfo({
              minutes: chosenMinutes,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#C9A84C', '#0A1628', '#3B82F6', '#10B981'],
              });
            } catch {}
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      targetEndTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, chosenMinutes, onLogStudyMinutes, playChime]);

  const startTimer = useCallback(() => {
    if (timeLeft <= 0) {
      const duration = chosenMinutes * 60;
      setTimeLeft(duration);
      targetEndTimeRef.current = Date.now() + duration * 1000;
    } else {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
    }
    setIsRunning(true);
  }, [chosenMinutes, timeLeft]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, pauseTimer, startTimer]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = chosenMinutes * 60;
    setTimeLeft(duration);
  }, [chosenMinutes]);

  const setMode = useCallback((newMode: TimerPresetMode, customMins?: number) => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);

    setModeState(newMode);
    let mins = PRESET_DURATIONS_MINUTES[newMode];
    if (newMode === 'custom' && customMins && customMins > 0) {
      mins = customMins;
    }
    setChosenMinutes(mins);
    setTimeLeft(mins * 60);
  }, []);

  const setCustomDuration = useCallback((minutes: number) => {
    const validMins = Math.max(1, Math.min(180, Math.round(minutes)));
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);

    setModeState('custom');
    setChosenMinutes(validMins);
    setTimeLeft(validMins * 60);
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const dismissCompletionBanner = useCallback(() => setLastCompletedSessionInfo(null), []);

  const remainingMinutes = Math.max(0, Math.ceil(timeLeft / 60));
  const remainingMinutesLabel =
    timeLeft < 60 && timeLeft > 0 ? '<1m' : `${remainingMinutes}m`;

  const minutesDisplay = Math.floor(timeLeft / 60);
  const secondsDisplay = timeLeft % 60;
  const formattedTime = `${String(minutesDisplay).padStart(2, '0')}:${String(
    secondsDisplay
  ).padStart(2, '0')}`;

  // Sync document title with countdown while running
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      document.title = `(${remainingMinutesLabel}) Pilotehub+ | ${formattedTime}`;
    } else {
      document.title = 'Pilotehub+ | Academic Excellence Platform';
    }
  }, [isRunning, timeLeft, remainingMinutesLabel, formattedTime]);

  const progressPercent =
    totalDurationSeconds > 0
      ? Math.min(100, Math.max(0, ((totalDurationSeconds - timeLeft) / totalDurationSeconds) * 100))
      : 0;

  return (
    <TimerContext.Provider
      value={{
        mode,
        chosenMinutes,
        totalDurationSeconds,
        timeLeft,
        isRunning,
        completedSessions,
        isModalOpen,
        remainingMinutes,
        remainingMinutesLabel,
        formattedTime,
        progressPercent,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        setMode,
        setCustomDuration,
        openModal,
        closeModal,
        dismissCompletionBanner,
        lastCompletedSessionInfo,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useStudyTimer = (): TimerContextValue => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useStudyTimer must be used within a TimerProvider');
  }
  return context;
};
