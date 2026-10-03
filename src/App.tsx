import React, { useState, useEffect } from 'react';
import {
  AppLanguage,
  AppView,
  GradeId,
  ResourceItem,
  Review,
  UserProfile,
  UserProgressState,
} from './types';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { LandingHero } from './components/LandingHero';
import { Dashboard } from './components/Dashboard';
import { CurriculumBrowser } from './components/CurriculumBrowser';
import { ReviewsSection } from './components/ReviewsSection';
import { ResourceViewerModal } from './components/ResourceViewerModal';
import { QuizModal } from './components/QuizModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { FloatingTimerWidget } from './components/FloatingTimerWidget';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AboutModal } from './components/AboutModal';
import { AboutTeamView } from './components/AboutTeamView';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { RAW_RESOURCES } from './data/curriculumData';
import {
  getInitialAuthSession,
  signOutUser,
  deleteUserAccount,
  updateUserProfileData,
} from './services/authService';
import {
  loadUserProgress,
  saveUserProgress,
  createDefaultProgress,
} from './services/progressService';
import { isFirebaseActive, getFirebaseAuth } from './lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { TimerProvider, useStudyTimer } from './context/TimerContext';

const STORAGE_KEY_LANG = 'pilotehub_app_lang';
const STORAGE_KEY_REVIEWS = 'pilotehub_reviews_v2';

const DEFAULT_REVIEWS: Review[] = [];

export function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [lang, setLang] = useState<AppLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANG) as AppLanguage) || 'en';
  });

  // User Profile & Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return getInitialAuthSession();
  });

  // User Learning Progress State
  const [progress, setProgress] = useState<UserProgressState>(() => {
    if (currentUser) {
      return createDefaultProgress(
        currentUser.uid,
        currentUser.displayName,
        currentUser.grade,
        currentUser.level
      );
    }
    return createDefaultProgress('guest_init', 'Student Scholar', '9th Grade', 'Middle School');
  });

  // Community Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  // Header / Bottom Nav Space-aware State
  const [isNavExpandedInHeader, setIsNavExpandedInHeader] = useState(true);

  // Modal States
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);

  // Load User Progress whenever Current User changes
  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      loadUserProgress(
        currentUser.uid,
        currentUser.displayName,
        currentUser.grade,
        currentUser.level
      ).then((userProg) => {
        if (isMounted) {
          setProgress(userProg);
        }
      });
    } else {
      // When not logged in, reset progress to pristine guest state
      setProgress(createDefaultProgress('guest_init', 'Student Scholar', '9th Grade', 'Middle School'));
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseActive()) return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // Authenticated user found
        const updatedProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Student Scholar',
          grade: currentUser?.grade || '4th Bac (Math)',
          level: currentUser?.level || 'Secondary (Baccalaureate)',
          school: currentUser?.school || 'Tunisian Lycée',
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        };
        setCurrentUser(updatedProfile);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save Reviews to Local Storage on Change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  // Language switcher handler
  const toggleLanguage = () => {
    const nextLang: AppLanguage = lang === 'en' ? 'fr' : 'en';
    setLang(nextLang);
    localStorage.setItem(STORAGE_KEY_LANG, nextLang);
  };

  // Helper to persist user progress modifications
  const handleUpdateProgress = async (partial: Partial<UserProgressState>) => {
    const updated: UserProgressState = {
      ...progress,
      ...partial,
      lastStudyDate: new Date().toISOString().split('T')[0],
    };
    setProgress(updated);
    if (currentUser && currentUser.uid) {
      await saveUserProgress(updated);
    }
  };

  // Auth Modal Triggers
  const handleOpenAuth = (tab: 'signin' | 'signup' = 'signin', notice?: string) => {
    setAuthModalTab(tab);
    setAuthModalNotice(notice || null);
    setIsAuthOpen(true);
  };

  // Auth Success Callback
  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    setAuthModalNotice(null);

    // Sync progress from cloud
    const loadedProg = await loadUserProgress(user.uid, user.displayName, user.grade, user.level);
    setProgress(loadedProg);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C9A84C', '#0A1628', '#3B82F6'],
      });
    } catch {}
  };

  // User Sign Out Handler
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setProgress(createDefaultProgress('guest_init', 'Student Scholar', '9th Grade', 'Middle School'));
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    if (currentUser) {
      await deleteUserAccount(currentUser.uid);
      setCurrentUser(null);
      setProgress(createDefaultProgress('guest_init', 'Student Scholar', '9th Grade', 'Middle School'));
    }
  };

  // Update User Grade
  const handleUpdateUserGrade = async (newGrade: GradeId) => {
    if (currentUser) {
      const updatedUser = await updateUserProfileData(currentUser.uid, { grade: newGrade });
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
    handleUpdateProgress({ selectedGrade: newGrade });
  };

  // Toggle Resource Completion
  const handleToggleComplete = (resourceId: string) => {
    if (!currentUser) {
      handleOpenAuth(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous ou créez un compte gratuit pour cocher les cours, exercices ou examens terminés et enregistrer votre progression !'
          : 'Sign in or create a free account to mark lessons as completed and track your learning progress!'
      );
      return;
    }

    const isCompleted = progress.completedResourceIds.includes(resourceId);
    let newCompleted: string[];
    let earnedXp = 0;

    if (isCompleted) {
      newCompleted = progress.completedResourceIds.filter((id) => id !== resourceId);
      earnedXp = -50;
    } else {
      newCompleted = [...progress.completedResourceIds, resourceId];
      earnedXp = 50;

      // Celebrate resource completion
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#C9A84C', '#10B981'],
        });
      } catch {}
    }

    handleUpdateProgress({
      completedResourceIds: newCompleted,
      xp: Math.max(0, progress.xp + earnedXp),
    });
  };

  // Toggle Bookmark
  const handleToggleBookmark = (resourceId: string) => {
    if (!currentUser) {
      handleOpenAuth(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous ou créez un compte gratuit pour enregistrer des cours, exercices ou examens dans vos favoris !'
          : 'Sign in or create a free account to bookmark and save study materials to your library!'
      );
      return;
    }

    const isBookmarked = progress.bookmarkedResourceIds.includes(resourceId);
    const newBookmarked = isBookmarked
      ? progress.bookmarkedResourceIds.filter((id) => id !== resourceId)
      : [...progress.bookmarkedResourceIds, resourceId];

    handleUpdateProgress({
      bookmarkedResourceIds: newBookmarked,
    });
  };

  // Today Date String
  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = progress.lastStudyDate === todayStr;

  // Streak Check-in from Hero
  const handleHeroStreakCheckin = () => {
    if (!currentUser) {
      handleOpenAuth(
        'signin',
        lang === 'fr'
          ? 'Connectez-vous pour enregistrer votre série d’étude (Streak) sur votre compte !'
          : 'Sign in to log your daily study streak on your profile!'
      );
      return;
    }

    if (hasCheckedInToday) return;

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#C9A84C'],
      });
    } catch {}

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = progress.lastStudyDate === yesterday;
    const newStreak = isConsecutive ? progress.currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, progress.longestStreak);

    handleUpdateProgress({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastStudyDate: todayStr,
      xp: progress.xp + 50,
    });
  };

  // Add Review
  const handleAddReview = (newRev: Omit<Review, 'id' | 'date'>) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const reviewObj: Review = {
      ...newRev,
      author: currentUser?.displayName || newRev.author,
      school: currentUser?.school || newRev.school,
      grade: currentUser?.grade || newRev.grade,
      id: 'rev-' + Date.now(),
      date: dateStr,
    };
    setReviews([reviewObj, ...reviews]);
  };

  // Log study minutes from Timer
  const handleLogStudyMinutes = (minutes: number) => {
    const newHistory = {
      ...progress.activityHistory,
      [todayStr]: (progress.activityHistory[todayStr] || 0) + minutes,
    };
    handleUpdateProgress({
      activityHistory: newHistory,
      totalMinutesStudied: progress.totalMinutesStudied + minutes,
      xp: progress.xp + minutes * 2,
    });
  };

  const handleExploreGrade = (grade: GradeId) => {
    handleUpdateProgress({ selectedGrade: grade });
    setCurrentView('curriculum');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TimerProvider onLogStudyMinutes={handleLogStudyMinutes}>
      <AppContent
        currentView={currentView}
        setCurrentView={setCurrentView}
        lang={lang}
        toggleLanguage={toggleLanguage}
        progress={progress}
        currentUser={currentUser}
        reviews={reviews}
        isNavExpandedInHeader={isNavExpandedInHeader}
        setIsNavExpandedInHeader={setIsNavExpandedInHeader}
        activeResource={activeResource}
        setActiveResource={setActiveResource}
        isQuizOpen={isQuizOpen}
        setIsQuizOpen={setIsQuizOpen}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        isAboutOpen={isAboutOpen}
        setIsAboutOpen={setIsAboutOpen}
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={setIsAuthOpen}
        authModalTab={authModalTab}
        authModalNotice={authModalNotice}
        setAuthModalNotice={setAuthModalNotice}
        handleOpenAuth={handleOpenAuth}
        handleAuthSuccess={handleAuthSuccess}
        handleSignOut={handleSignOut}
        handleDeleteAccount={handleDeleteAccount}
        handleUpdateUserGrade={handleUpdateUserGrade}
        handleToggleComplete={handleToggleComplete}
        handleToggleBookmark={handleToggleBookmark}
        handleHeroStreakCheckin={handleHeroStreakCheckin}
        handleAddReview={handleAddReview}
        handleExploreGrade={handleExploreGrade}
        handleUpdateProgress={handleUpdateProgress}
        hasCheckedInToday={hasCheckedInToday}
      />
    </TimerProvider>
  );
}

// Inner App Content having access to Timer context
interface AppContentProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  lang: AppLanguage;
  toggleLanguage: () => void;
  progress: UserProgressState;
  currentUser: UserProfile | null;
  reviews: Review[];
  isNavExpandedInHeader: boolean;
  setIsNavExpandedInHeader: (val: boolean) => void;
  activeResource: ResourceItem | null;
  setActiveResource: (r: ResourceItem | null) => void;
  isQuizOpen: boolean;
  setIsQuizOpen: (val: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  isAboutOpen: boolean;
  setIsAboutOpen: (val: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (val: boolean) => void;
  authModalTab: 'signin' | 'signup';
  authModalNotice: string | null;
  setAuthModalNotice: (val: string | null) => void;
  handleOpenAuth: (tab?: 'signin' | 'signup', notice?: string) => void;
  handleAuthSuccess: (u: UserProfile) => void;
  handleSignOut: () => void;
  handleDeleteAccount: () => void;
  handleUpdateUserGrade: (g: GradeId) => void;
  handleToggleComplete: (id: string) => void;
  handleToggleBookmark: (id: string) => void;
  handleHeroStreakCheckin: () => void;
  handleAddReview: (r: Omit<Review, 'id' | 'date'>) => void;
  handleExploreGrade: (g: GradeId) => void;
  handleUpdateProgress: (p: Partial<UserProgressState>) => void;
  hasCheckedInToday: boolean;
}

const AppContent: React.FC<AppContentProps> = ({
  currentView,
  setCurrentView,
  lang,
  toggleLanguage,
  progress,
  currentUser,
  reviews,
  isNavExpandedInHeader,
  setIsNavExpandedInHeader,
  activeResource,
  setActiveResource,
  isQuizOpen,
  setIsQuizOpen,
  isSearchOpen,
  setIsSearchOpen,
  isAboutOpen,
  setIsAboutOpen,
  isAuthOpen,
  setIsAuthOpen,
  authModalTab,
  authModalNotice,
  setAuthModalNotice,
  handleOpenAuth,
  handleAuthSuccess,
  handleSignOut,
  handleDeleteAccount,
  handleUpdateUserGrade,
  handleToggleComplete,
  handleToggleBookmark,
  handleHeroStreakCheckin,
  handleAddReview,
  handleExploreGrade,
  handleUpdateProgress,
  hasCheckedInToday,
}) => {
  const { openModal, closeModal, isModalOpen } = useStudyTimer();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#0A1628] selection:bg-[#C9A84C]/30 selection:text-[#0A1628] overflow-x-hidden">
      {/* 1. Header Navigation */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'timer') {
            if (!currentUser) {
              handleOpenAuth(
                'signin',
                lang === 'fr'
                  ? 'Connectez-vous ou créez un compte gratuit pour accéder au chronomètre Pomodoro et enregistrer vos sessions.'
                  : 'Please sign in or create a free account to access the Pomodoro focus timer and log your study sessions.'
              );
            } else {
              openModal();
            }
          } else {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        lang={lang}
        onToggleLang={toggleLanguage}
        streakCount={progress.currentStreak}
        onOpenSearch={() => setIsSearchOpen(true)}
        user={currentUser}
        onOpenAuthModal={handleOpenAuth}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        onUpdateGrade={handleUpdateUserGrade}
        onNavFitsChange={setIsNavExpandedInHeader}
      />

      {/* 2. Main View Container */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 ${
          !isNavExpandedInHeader ? 'pb-28 sm:pb-32' : 'pb-12'
        }`}
      >
        {currentView === 'home' && (
          <LandingHero
            lang={lang}
            streakCount={progress.currentStreak}
            onExploreGrade={handleExploreGrade}
            onOpenDashboard={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTimer={() => {
              if (!currentUser) {
                handleOpenAuth(
                  'signin',
                  lang === 'fr'
                    ? 'Connectez-vous pour débloquer le chronomètre Pomodoro et enregistrer vos sessions de concentration !'
                    : 'Sign in to unlock the Pomodoro focus timer and track your study sessions!'
                );
              } else {
                openModal();
              }
            }}
            onLogStreak={handleHeroStreakCheckin}
            hasCheckedInToday={hasCheckedInToday}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {currentView === 'curriculum' && (
          <CurriculumBrowser
            selectedGrade={progress.selectedGrade}
            onSelectGrade={(g) => handleUpdateProgress({ selectedGrade: g })}
            progress={progress}
            onToggleComplete={handleToggleComplete}
            onToggleBookmark={handleToggleBookmark}
            onOpenResource={(r) => setActiveResource(r)}
            onOpenQuiz={() => setIsQuizOpen(true)}
            lang={lang}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            lang={lang}
            onOpenResource={(r) => setActiveResource(r)}
            onOpenTimer={() => {
              if (!currentUser) {
                handleOpenAuth(
                  'signin',
                  lang === 'fr'
                    ? 'Connectez-vous pour utiliser le chronomètre Pomodoro et enregistrer vos sessions.'
                    : 'Sign in to use the Pomodoro timer and log study sessions.'
                );
              } else {
                openModal();
              }
            }}
            onExploreCurriculum={() => {
              setCurrentView('curriculum');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {currentView === 'reviews' && (
          <ReviewsSection
            reviews={reviews}
            onAddReview={handleAddReview}
            lang={lang}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {currentView === 'about' && (
          <AboutTeamView
            lang={lang}
            onExploreCurriculum={() => {
              setCurrentView('curriculum');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* 3. Bottom Navigation (Active when header nav doesn't fit or on smaller viewports) */}
      <MobileNav
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'timer') {
            if (!currentUser) {
              handleOpenAuth(
                'signin',
                lang === 'fr'
                  ? 'Connectez-vous ou créez un compte gratuit pour utiliser le chronomètre Pomodoro et enregistrer vos sessions.'
                  : 'Please sign in or create a free account to use the Pomodoro timer and study focus tools.'
              );
            } else {
              openModal();
            }
          } else {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        lang={lang}
        streakCount={progress.currentStreak}
        isVisible={!isNavExpandedInHeader}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
      />

      {/* 4. Floating Mini-Timer Widget (Runs in background while browsing lessons, quizzes, dashboard) */}
      <FloatingTimerWidget
        lang={lang}
        hasBottomNav={!isNavExpandedInHeader}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
      />

      {/* 5. Footer */}
      <Footer
        lang={lang}
        onSelectGrade={handleExploreGrade}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenTeamPage={() => {
          setCurrentView('about');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasBottomNav={!isNavExpandedInHeader}
      />

      {/* 6. Modals */}
      {activeResource && (
        <ResourceViewerModal
          resource={activeResource}
          onClose={() => setActiveResource(null)}
          isCompleted={progress.completedResourceIds.includes(activeResource.id)}
          isBookmarked={progress.bookmarkedResourceIds.includes(activeResource.id)}
          onToggleComplete={() => handleToggleComplete(activeResource.id)}
          onToggleBookmark={() => handleToggleBookmark(activeResource.id)}
          onLaunchQuiz={() => setIsQuizOpen(true)}
          lang={lang}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuth}
        />
      )}

      {isQuizOpen && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onRewardXp={(earned) => handleUpdateProgress({ xp: progress.xp + earned })}
          lang={lang}
        />
      )}

      {/* Persistent Study Timer Modal with account synchronization */}
      <StudyTimerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        lang={lang}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
        progress={progress}
        onUpdateProgress={handleUpdateProgress}
      />

      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectResource={(r) => {
            setActiveResource(r);
          }}
          lang={lang}
        />
      )}

      {isAboutOpen && (
        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
          lang={lang}
        />
      )}

      {/* Auth Modal rendered at the top layer (z-[100]) */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            setIsAuthOpen(false);
            setAuthModalNotice(null);
          }}
          onAuthSuccess={handleAuthSuccess}
          lang={lang}
          initialTab={authModalTab}
          promptNotice={authModalNotice}
        />
      )}
    </div>
  );
};

export default App;
