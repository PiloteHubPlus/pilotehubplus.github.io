import React, { useState } from 'react';
import { AppLanguage, GradeId } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { ALL_GRADES } from '../data/curriculumData';
import {
  Sparkles,
  Heart,
  ExternalLink,
  Mail,
  Copy,
  Check,
  Users2,
} from 'lucide-react';

interface FooterProps {
  lang: AppLanguage;
  onSelectGrade: (grade: GradeId) => void;
  onOpenAbout: () => void;
  onOpenTeamPage?: () => void;
  hasBottomNav?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onSelectGrade,
  onOpenAbout,
  onOpenTeamPage,
  hasBottomNav = false,
}) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@pilotehubplus.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTeamClick = () => {
    if (onOpenTeamPage) {
      onOpenTeamPage();
    } else {
      onOpenAbout();
    }
  };

  return (
    <footer
      id="main-footer"
      className={`bg-[#0A1628] text-white border-t border-[#C9A84C]/25 pt-12 sm:pt-16 mt-16 sm:mt-20 transition-all ${
        hasBottomNav
          ? 'pb-[max(7.5rem,calc(6rem+env(safe-area-inset-bottom)))]'
          : 'pb-14 sm:pb-16'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Contact Us & Inquiries Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-white/5 via-white/[0.08] to-white/5 border border-white/10 p-5 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#C9A84C]">
              <Mail className="w-4 h-4" />
              <span>{t.contactUs}</span>
            </div>
            <h3 className="text-base sm:text-xl font-bold font-serif-display text-white">
              {t.contactUsAt}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              {lang === 'fr'
                ? 'Une question, un partage de devoirs ou une suggestion ? Contactez directement notre équipe par email.'
                : 'Have questions, syllabus suggestions, or want to contribute test materials? Send our leadership team a direct note.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
            <a
              id="footer-email-link"
              href="mailto:contact@pilotehubplus.com"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#C9A84C] text-[#0A1628] text-xs sm:text-sm font-extrabold hover:bg-amber-400 transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Mail className="w-4 h-4" />
              <span>contact@pilotehubplus.com</span>
            </a>

            <button
              id="footer-btn-copy-email"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer min-h-[44px]"
              title="Copy email address"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">{t.emailCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-300" />
                  <span>{t.copyEmail}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-white/10">
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" variant="dark" />
            <p className="text-sm text-gray-300 max-w-sm leading-relaxed font-normal">
              {t.brandTagline}. {t.heroBadge}. Built to support students from 7th grade to Junior
              year in their academic journeys.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#C9A84C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free, Open & Community-Driven</span>
            </div>
          </div>

          {/* Middle School Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#C9A84C]">
              {t.middleSchool}
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {ALL_GRADES.filter((g) => g.level === 'Middle School').map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => onSelectGrade(g.id)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {lang === 'fr' ? g.frLabel : g.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* High School Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#C9A84C]">
              {t.highSchool}
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {ALL_GRADES.filter((g) => g.level === 'High School').map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => onSelectGrade(g.id)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {lang === 'fr' ? g.frLabel : g.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform & Team Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#C9A84C]">
              Platform & Team
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button
                  onClick={handleTeamClick}
                  className="hover:text-[#C9A84C] text-left transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Users2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>{t.teamTitle}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-[#C9A84C] text-left transition-colors cursor-pointer"
                >
                  {t.aboutModalTitle}
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@pilotehubplus.com"
                  className="hover:text-[#C9A84C] text-left transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>contact@pilotehubplus.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://forms.gle/pilotehub-contributor-application"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>{t.joinTitle}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & contact note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A99B0]">
          <div>
            © {new Date().getFullYear()} Pilotehub+. Reach Higher. Achieve More. •{' '}
            <a
              href="mailto:contact@pilotehubplus.com"
              className="text-[#C9A84C] hover:underline"
            >
              contact@pilotehubplus.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {lang === 'fr'
                ? 'Conçu pour les élèves en Tunisie avec'
                : 'Made for students in Tunisia with'}
            </span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

