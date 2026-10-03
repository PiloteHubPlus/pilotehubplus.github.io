import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppLanguage, UserProfile, GradeId } from '../types';
import { ALL_GRADES } from '../data/curriculumData';
import {
  GraduationCap,
  LogOut,
  Sparkles,
  ChevronDown,
  School,
  Flame,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface UserProfileMenuProps {
  user: UserProfile | null;
  currentStreak: number;
  onOpenAuthModal: (tab?: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onDeleteAccount?: () => void;
  onUpdateGrade: (grade: GradeId) => void;
  lang: AppLanguage;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  currentStreak,
  onOpenAuthModal,
  onSignOut,
  onDeleteAccount,
  onUpdateGrade,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center">
        <button
          id="btn-auth-signin-up"
          onClick={() => onOpenAuthModal('signin')}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-[#0A1628] text-[#C9A84C] hover:bg-[#122442] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{lang === 'fr' ? 'Connexion' : 'Sign In / Up'}</span>
        </button>
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PH';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-[#0A1628]/5 hover:bg-[#0A1628]/10 border border-[#0A1628]/10 transition-all cursor-pointer"
        aria-label="User Account Menu"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A1628] to-[#1F375F] text-[#C9A84C] flex items-center justify-center font-extrabold text-xs shadow-xs flex-shrink-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* User Info (Hidden on very small screens, visible on tablet/pc) */}
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-[#0A1628] max-w-[110px] truncate">
            {user.displayName}
          </span>
          <span className="text-[10px] font-semibold text-[#8A99B0]">
            {user.grade}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-[#8A99B0] transition-transform duration-200" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-80 bg-white rounded-3xl shadow-2xl border border-[#0A1628]/10 overflow-hidden z-50 animate-fadeUp">
          {/* Header summary */}
          <div className="p-4 bg-gradient-to-br from-[#0A1628] to-[#122442] text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center font-black text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{user.displayName}</h4>
                <p className="text-[11px] text-gray-300 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/15 px-2 py-0.5 rounded-md">
                    <GraduationCap className="w-3 h-3" />
                    {user.grade}
                  </span>
                  {currentStreak > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {currentStreak}d Streak
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user.school && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-gray-300">
                <School className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span className="truncate">{user.school}</span>
              </div>
            )}
          </div>

          {/* Quick Grade Switcher */}
          <div className="p-3 bg-[#F8FAFC] border-b border-[#0A1628]/10">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#8A99B0] mb-1.5">
              Switch Learning Grade:
            </label>
            <select
              value={user.grade}
              onChange={(e) => {
                onUpdateGrade(e.target.value as GradeId);
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-[#0A1628]/10 text-xs font-bold text-[#0A1628] outline-none focus:border-[#C9A84C] cursor-pointer"
            >
              {ALL_GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {lang === 'fr' ? g.frLabel : g.label} ({g.level})
                </option>
              ))}
            </select>
          </div>

          {/* Actions & Links */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuthModal('signup');
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-[#0A1628] hover:bg-[#F5F7FA] flex items-center gap-2.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'fr' ? 'Créer un Autre Compte' : 'Register New Student Profile'}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-[#0A1628]/80 hover:bg-[#F5F7FA] flex items-center gap-2.5 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4 text-[#8A99B0]" />
              <span>{lang === 'fr' ? 'Déconnexion' : 'Sign Out'}</span>
            </button>

            {onDeleteAccount && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-all border-t border-[#0A1628]/5 pt-2 mt-1"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>{lang === 'fr' ? 'Supprimer mon Compte' : 'Delete Account'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id="modal-delete-account"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0A1628]/70 backdrop-blur-md animate-fadeIn"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          >
            <div
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-100 overflow-hidden p-6 sm:p-7 animate-scaleUp relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-extrabold text-[#0A1628] text-center mb-2 font-serif-display">
                {lang === 'fr' ? 'Supprimer définitivement le compte ?' : 'Permanently Delete Account?'}
              </h3>

              <p className="text-xs sm:text-sm text-[#8A99B0] text-center mb-6 leading-relaxed">
                {lang === 'fr'
                  ? "Cette action est irréversible. Votre profil, vos Streaks d'étude et toutes vos données sauvegardées sur votre compte Pilotehub+ seront définitivement effacées."
                  : 'This action cannot be undone. Your profile, study streaks, and all your saved progress in your Pilotehub+ account will be permanently deleted.'}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#0A1628]/15 hover:bg-[#F5F7FA] font-bold text-xs sm:text-sm text-[#0A1628] transition-all cursor-pointer disabled:opacity-50"
                >
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (!onDeleteAccount) return;
                    try {
                      setIsDeleting(true);
                      await onDeleteAccount();
                      setShowDeleteConfirm(false);
                    } catch (e) {
                      console.error('Account delete error:', e);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs sm:text-sm text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isDeleting ? (
                    <span>{lang === 'fr' ? 'Suppression...' : 'Deleting...'}</span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{lang === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
