import React, { useState } from 'react';
import { AppLanguage, GradeId, UserProfile } from '../types';
import { ALL_GRADES } from '../data/curriculumData';
import { TRANSLATIONS } from '../data/translations';
import {
  signUpWithEmail,
  signInWithEmail,
  sendPasswordResetLink,
} from '../services/authService';
import { BrandLogo } from './BrandLogo';
import confetti from 'canvas-confetti';
import {
  X,
  Mail,
  Lock,
  User,
  School,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Check,
  Circle,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Send,
  Timer,
  Download,
  Bookmark,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  lang: AppLanguage;
  initialTab?: 'signin' | 'signup';
  promptNotice?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  lang,
  initialTab = 'signin',
  promptNotice,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [school, setSchool] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeId>('9th Grade');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  // Strong password checks
  const passHasMinLength = password.length >= 8;
  const passHasUpper = /[A-Z]/.test(password);
  const passHasLower = /[a-z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passHasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong = passHasMinLength && passHasUpper && passHasLower && passHasNumber && passHasSpecial;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const user = await signInWithEmail(email.trim(), password);
      setSuccessMessage(lang === 'fr' ? `Bon retour, ${user.displayName} !` : `Welcome back, ${user.displayName}!`);
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch {}
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 600);
    } catch (err: any) {
      console.warn('Firebase sign-in status:', err);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMessage(lang === 'fr' ? 'Email ou mot de passe incorrect.' : 'Invalid email or password.');
      } else if (code === 'auth/user-disabled') {
        setErrorMessage(lang === 'fr' ? 'Ce compte a été désactivé.' : 'This account has been disabled.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage(lang === 'fr' ? 'Adresse email invalide.' : 'Invalid email address format.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMessage(
          lang === 'fr'
            ? 'Connexion au serveur impossible. Vérifiez votre connexion internet.'
            : 'Network connection failed. Please check your internet connection and try again.'
        );
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage(
          lang === 'fr'
            ? 'Trop de tentatives infructueuses. Veuillez patienter quelques instants.'
            : 'Too many attempts. Please try again in a few moments.'
        );
      } else {
        setErrorMessage(
          err?.message?.includes('network') || err?.message?.includes('Network')
            ? lang === 'fr'
              ? 'Problème de réseau détecté. Vérifiez votre connexion internet.'
              : 'Network issue detected. Please check your internet connection.'
            : err?.message ||
                (lang === 'fr'
                  ? 'Erreur de connexion. Vérifiez vos identifiants.'
                  : 'Failed to sign in. Please check your credentials.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage(lang === 'fr' ? 'Veuillez saisir votre adresse e-mail.' : 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetLink(email.trim());
      setSuccessMessage(
        lang === 'fr'
          ? 'Un e-mail de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception et vos spams.'
          : 'A password reset link has been sent to your email. Please check your inbox and spam folder.'
      );
    } catch (err: any) {
      console.warn('Firebase password reset status:', err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setErrorMessage(
          lang === 'fr'
            ? 'Aucun compte associé à cette adresse e-mail.'
            : 'No account found with this email address.'
        );
      } else if (code === 'auth/invalid-email') {
        setErrorMessage(lang === 'fr' ? 'Adresse email invalide.' : 'Invalid email address format.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage(
          lang === 'fr'
            ? 'Trop de tentatives. Veuillez réessayer plus tard.'
            : 'Too many requests. Please try again in a few minutes.'
        );
      } else {
        setErrorMessage(
          err?.message ||
            (lang === 'fr'
              ? "Impossible d'envoyer l'e-mail de réinitialisation."
              : 'Failed to send password reset email.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!displayName.trim()) {
      setErrorMessage(lang === 'fr' ? 'Veuillez saisir votre nom complet.' : 'Please enter your full name.');
      return;
    }
    if (!passHasMinLength) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le mot de passe doit comporter au moins 8 caractères.'
          : 'Password must be at least 8 characters long.'
      );
      return;
    }
    if (!passHasUpper) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le mot de passe doit contenir au moins une lettre majuscule (A-Z).'
          : 'Password must contain at least one uppercase letter (A-Z).'
      );
      return;
    }
    if (!passHasLower) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le mot de passe doit contenir au moins une lettre minuscule (a-z).'
          : 'Password must contain at least one lowercase letter (a-z).'
      );
      return;
    }
    if (!passHasNumber) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le mot de passe doit contenir au moins un chiffre (0-9).'
          : 'Password must contain at least one number (0-9).'
      );
      return;
    }
    if (!passHasSpecial) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le mot de passe doit contenir au moins un caractère spécial ou symbole (ex: !@#$%^&*).'
          : 'Password must contain at least one special character or symbol (e.g. !@#$%^&*).'
      );
      return;
    }

    setLoading(true);
    try {
      const user = await signUpWithEmail(
        email.trim(),
        password,
        displayName.trim(),
        selectedGrade,
        school.trim()
      );
      setSuccessMessage(lang === 'fr' ? `Compte créé avec succès pour ${user.displayName} !` : `Account created for ${user.displayName}!`);
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      } catch {}
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 700);
    } catch (err: any) {
      console.warn('Firebase sign-up status:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErrorMessage(lang === 'fr' ? 'Cette adresse e-mail est déjà utilisée.' : 'This email address is already in use.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage(
          lang === 'fr'
            ? 'Mot de passe trop faible selon les règles de sécurité.'
            : 'Password is too weak according to security requirements.'
        );
      } else if (code === 'auth/invalid-email') {
        setErrorMessage(lang === 'fr' ? 'Adresse email invalide.' : 'Invalid email address format.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMessage(
          lang === 'fr'
            ? 'Connexion au serveur impossible. Vérifiez votre connexion internet.'
            : 'Network connection failed. Please check your internet connection and try again.'
        );
      } else {
        setErrorMessage(err?.message || (lang === 'fr' ? 'Impossible de créer le compte.' : 'Failed to create account.'));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      id="modal-auth-dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0A1628]/75 backdrop-blur-md animate-fadeUp overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#0A1628]/10 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0A1628] via-[#0F1F38] to-[#122442] text-white flex items-center justify-between border-b border-[#C9A84C]/20">
          <BrandLogo size="sm" variant="dark" />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Prompt Notice (e.g. for streak check-in, completion, bookmark, download, or timer session) */}
        {promptNotice && (() => {
          const isTimerNotice = /timer|chronom|chrono|preset|préréglage|focus|study\s*time|temps d[’']étude/i.test(promptNotice);
          const isDownloadNotice = /download|télécharg|telecharg|pdf/i.test(promptNotice);
          const isBookmarkNotice = /bookmark|favoris|enregistrer|save/i.test(promptNotice);
          const isCompleteNotice = /cocher|termin|complet|progress|progression/i.test(promptNotice);

          return (
            <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-950 text-xs sm:text-sm font-semibold shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
                {isDownloadNotice ? (
                  <Download className="w-4 h-4 text-white" />
                ) : isBookmarkNotice ? (
                  <Bookmark className="w-4 h-4 text-white fill-white" />
                ) : isCompleteNotice ? (
                  <CheckCircle2 className="w-4 h-4 text-white fill-white" />
                ) : isTimerNotice ? (
                  <Timer className="w-4 h-4 text-white" />
                ) : (
                  <Flame className="w-4 h-4 fill-white" />
                )}
              </div>
              <span className="leading-snug flex-1">{promptNotice}</span>
            </div>
          );
        })()}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#0A1628]/10 bg-white p-1.5 sm:p-2 gap-1.5">
          <button
            onClick={() => {
              setTab('signin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center min-h-[40px] flex items-center justify-center ${
              tab === 'signin' || tab === 'forgot'
                ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm'
                : 'text-[#0A1628]/70 hover:bg-[#F5F7FA] hover:text-[#0A1628]'
            }`}
          >
            {tab === 'forgot'
              ? (lang === 'fr' ? 'Mot de passe oublié' : 'Reset Password')
              : (lang === 'fr' ? 'Se Connecter' : 'Sign In')}
          </button>

          <button
            onClick={() => {
              setTab('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center min-h-[40px] flex items-center justify-center ${
              tab === 'signup'
                ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm'
                : 'text-[#0A1628]/70 hover:bg-[#F5F7FA] hover:text-[#0A1628]'
            }`}
          >
            {lang === 'fr' ? 'Créer un Compte' : 'Create Account'}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          {/* Notification / Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-fadeUp">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeUp">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}


          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1628] mb-1">
                  {lang === 'fr' ? 'Adresse E-mail :' : 'Email Address:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#0A1628]">{lang === 'fr' ? 'Mot de passe :' : 'Password:'}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] font-semibold text-[#0A1628]/70 hover:text-[#0A1628] hover:underline transition-colors cursor-pointer"
                  >
                    {lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A99B0] hover:text-[#0A1628] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-[#0A1628] text-[#C9A84C] font-extrabold text-xs sm:text-sm hover:bg-[#122442] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
              >
                {loading ? (
                  <span>{lang === 'fr' ? 'Connexion en cours...' : 'Authenticating...'}</span>
                ) : (
                  <>
                    <span>{lang === 'fr' ? 'Se Connecter' : 'Sign In to Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Create Account */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-[#0A1628]/70 hover:text-[#0A1628] transition-colors cursor-pointer inline-flex items-center justify-center gap-1 group py-1"
                >
                  <span>
                    {lang === 'fr' ? 'Nouveau sur PiloteHub+ ?' : 'New to PiloteHub+?'}
                  </span>
                  <span className="font-bold text-[#0A1628] underline decoration-[#C9A84C] underline-offset-4 group-hover:text-[#0A1628]">
                    {lang === 'fr' ? 'Créer un compte' : 'Make an account'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5 sm:space-y-4 animate-fadeUp">
              <div className="text-center pb-1">
                <div className="w-10 h-10 rounded-2xl bg-[#0A1628]/5 border border-[#0A1628]/10 text-[#0A1628] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#0A1628]">
                  {lang === 'fr' ? 'Réinitialisation du mot de passe' : 'Reset Your Password'}
                </h3>
                <p className="text-xs text-[#8A99B0] mt-1">
                  {lang === 'fr'
                    ? 'Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé via Firebase.'
                    : "Enter your email address and we'll send you a secure password reset link via Firebase."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1628] mb-1">
                  {lang === 'fr' ? 'Adresse E-mail :' : 'Email Address:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-[#0A1628] text-[#C9A84C] font-extrabold text-xs sm:text-sm hover:bg-[#122442] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
              >
                {loading ? (
                  <span>{lang === 'fr' ? 'Envoi en cours...' : 'Sending link...'}</span>
                ) : (
                  <>
                    <span>{lang === 'fr' ? 'Envoyer le lien de réinitialisation' : 'Send Reset Link'}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-[#0A1628]/70 hover:text-[#0A1628] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 py-1 font-semibold group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>{lang === 'fr' ? 'Retour à la connexion' : 'Back to Sign In'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0A1628] mb-1">
                  {lang === 'fr' ? 'Nom complet :' : 'Full Name / Display Name:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Yassine Ben Mahmoud"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1628] mb-1">
                  {lang === 'fr' ? 'Niveau / Classe :' : 'Grade / Level:'}
                </label>
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as GradeId)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm font-bold text-[#0A1628] outline-none focus:border-[#C9A84C] cursor-pointer"
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {lang === 'fr' ? g.frLabel : g.label} ({g.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1628] mb-1">
                  {lang === 'fr' ? 'Établissement (Optionnel) :' : 'School (Optional):'}
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder={lang === 'fr' ? 'ex: Collège Pilote Sousse' : 'e.g. Pilot School Sousse'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1628] mb-1">
                  {lang === 'fr' ? 'Adresse E-mail :' : 'Email Address:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1628] mb-1">{lang === 'fr' ? 'Mot de passe :' : 'Password:'}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === 'fr' ? 'Min. 8 car. (Maj, min, 123, @#$)' : 'Min. 8 chars (Upper, lower, 123, @#$)'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] outline-none focus:border-[#C9A84C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A99B0] hover:text-[#0A1628] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength real-time criteria checklist */}
              <div className="p-2.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-[#0A1628] font-bold text-[11px]">
                  <span>{lang === 'fr' ? 'Critères de sécurité :' : 'Password criteria:'}</span>
                  {isPasswordStrong && (
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {lang === 'fr' ? 'Mot de passe robuste' : 'Strong password'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <div className={`flex items-center gap-1.5 transition-colors ${passHasMinLength ? 'text-emerald-700 font-semibold' : 'text-[#8A99B0]'}`}>
                    {passHasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <Circle className="w-3 h-3 text-[#8A99B0]/60 flex-shrink-0" />}
                    <span>{lang === 'fr' ? 'Min. 8 caractères' : 'Min. 8 characters'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${passHasUpper ? 'text-emerald-700 font-semibold' : 'text-[#8A99B0]'}`}>
                    {passHasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <Circle className="w-3 h-3 text-[#8A99B0]/60 flex-shrink-0" />}
                    <span>{lang === 'fr' ? '1 Majuscule (A-Z)' : '1 Uppercase (A-Z)'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${passHasLower ? 'text-emerald-700 font-semibold' : 'text-[#8A99B0]'}`}>
                    {passHasLower ? <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <Circle className="w-3 h-3 text-[#8A99B0]/60 flex-shrink-0" />}
                    <span>{lang === 'fr' ? '1 Minuscule (a-z)' : '1 Lowercase (a-z)'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${passHasNumber ? 'text-emerald-700 font-semibold' : 'text-[#8A99B0]'}`}>
                    {passHasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <Circle className="w-3 h-3 text-[#8A99B0]/60 flex-shrink-0" />}
                    <span>{lang === 'fr' ? '1 Chiffre (0-9)' : '1 Number (0-9)'}</span>
                  </div>
                  <div className={`sm:col-span-2 flex items-center gap-1.5 transition-colors ${passHasSpecial ? 'text-emerald-700 font-semibold' : 'text-[#8A99B0]'}`}>
                    {passHasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <Circle className="w-3 h-3 text-[#8A99B0]/60 flex-shrink-0" />}
                    <span>{lang === 'fr' ? '1 Caractère spécial / symbole (!@#$...)' : '1 Special character / symbol (!@#$...)'}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-[#0A1628] text-[#C9A84C] font-extrabold text-xs sm:text-sm hover:bg-[#122442] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
              >
                {loading ? (
                  <span>{lang === 'fr' ? 'Création du compte...' : 'Creating account...'}</span>
                ) : (
                  <>
                    <span>{lang === 'fr' ? 'Créer mon Compte' : 'Create Free Account'}</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Sign In */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMessage('');
                  }}
                  className="text-xs text-[#0A1628]/70 hover:text-[#0A1628] transition-colors cursor-pointer inline-flex items-center justify-center gap-1 group py-1"
                >
                  <span>
                    {lang === 'fr' ? 'Vous avez déjà un compte ?' : 'Already have an account?'}
                  </span>
                  <span className="font-bold text-[#0A1628] underline decoration-[#C9A84C] underline-offset-4 group-hover:text-[#0A1628]">
                    {lang === 'fr' ? 'Se connecter' : 'Sign in'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5F7FA] border-t border-[#0A1628]/10 text-center text-xs text-[#8A99B0] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'fr' ? '100% Gratuit • Sécurisé' : '100% Free • Secured'}</span>
        </div>
      </div>
    </div>
  );
};
