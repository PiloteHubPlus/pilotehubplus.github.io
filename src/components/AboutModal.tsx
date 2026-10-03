import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import {
  X,
  ShieldCheck,
  Heart,
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Mail,
  Copy,
  Check,
  Crown,
  Code2,
  Users2,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('contact@pilotehubplus.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const team = [
    {
      name: 'Mariem Abdennadher',
      role: lang === 'fr' ? 'Fondatrice / Présidente' : 'Founder / President',
      initials: 'MA',
      icon: <Crown className="w-4 h-4 text-[#C9A84C]" />,
      desc:
        lang === 'fr'
          ? 'Direction académique, sélection des programmes et gouvernance.'
          : 'Leading academic vision, curriculum governance, and strategic growth.',
    },
    {
      name: 'Raed Brini',
      role: lang === 'fr' ? 'Directeur Technique - CTO' : 'Chief Technology Officer - CTO',
      initials: 'RB',
      icon: <Code2 className="w-4 h-4 text-[#C9A84C]" />,
      desc:
        lang === 'fr'
          ? 'Architecture de la plateforme web, développement UI/UX et outils de focus.'
          : 'Web platform architecture, UI/UX systems, and interactive learning tools.',
    },
    {
      name: 'Farah Derouich',
      role: lang === 'fr' ? 'Vice-Présidente' : 'Vice-President',
      initials: 'FD',
      icon: <Users2 className="w-4 h-4 text-[#C9A84C]" />,
      desc:
        lang === 'fr'
          ? 'Relations communautaires, engagement des élèves et revue éditoriale.'
          : 'Community outreach, student relations, and editorial quality assurance.',
    },
  ];

  return (
    <div
      id="modal-about-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1628]/60 backdrop-blur-sm animate-fadeUp"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#0A1628]/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 bg-[#0A1628] text-white flex items-center justify-between">
          <BrandLogo size="sm" variant="dark" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-7 overflow-y-auto space-y-6 text-sm text-[#0A1628]/85 leading-relaxed">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif-display text-[#0A1628]">
              {t.aboutModalTitle}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#8A99B0]">{t.brandMotto}</p>
          </div>

          <div className="space-y-2.5 bg-[#F5F7FA] p-4 rounded-2xl border border-[#0A1628]/5 text-xs sm:text-sm">
            <p>{t.aboutP1}</p>
            <p>{t.aboutP2}</p>
          </div>

          {/* Leadership Team Cards in Modal */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A1628] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C9A84C]" />
              <span>{t.teamTitle}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {team.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 flex flex-col justify-between space-y-2 hover:border-[#C9A84C] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-7 h-7 rounded-xl bg-[#0A1628] text-[#C9A84C] font-bold text-xs flex items-center justify-center font-serif-display">
                        {member.initials}
                      </span>
                      {member.icon}
                    </div>
                    <div className="font-bold text-xs text-[#0A1628]">{member.name}</div>
                    <div className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">
                      {member.role}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#8A99B0] leading-snug">
                    {member.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Operational Teams in Modal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A1628] flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-[#C9A84C]" />
                <span>{t.specializedTeamsTitle}</span>
              </h4>
              <span className="text-[10px] font-bold text-[#8A99B0] bg-[#F5F7FA] px-2 py-0.5 rounded-full border border-[#0A1628]/5">
                4 teams
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Content Writing */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-300/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#0A1628] flex items-center gap-1.5">
                    <span className="text-sm">✍️</span>
                    <span>{t.teamContentWriting}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                    6 members
                  </span>
                </div>
                <div className="text-[11px] text-[#0A1628]/85 flex flex-wrap gap-1">
                  {['Elaa Rahmani', 'Salma Hajaiej', 'Ahmed Balha', 'Youssef Barbouchi', 'Farah', 'Mariem Marzougui'].map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white rounded-md border border-amber-200 text-[#0A1628] font-semibold text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Academic Team */}
              <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-300/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#0A1628] flex items-center gap-1.5">
                    <span className="text-sm">🎓</span>
                    <span>{t.teamAcademic}</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded-md">
                    4 members
                  </span>
                </div>
                <div className="text-[11px] text-[#0A1628]/85 flex flex-wrap gap-1">
                  {['Elaa Rahmani', 'Hiba Houcine', 'Tasnime Ben Ayed', 'Fatma Hsouna'].map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white rounded-md border border-blue-200 text-[#0A1628] font-semibold text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Media & Outreach */}
              <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-300/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#0A1628] flex items-center gap-1.5">
                    <span className="text-sm">📢</span>
                    <span>{t.teamSocialMedia}</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded-md">
                    2 members
                  </span>
                </div>
                <div className="text-[11px] text-[#0A1628]/85 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white rounded-md border border-purple-200 text-[#0A1628] font-semibold text-[10px]">
                    Selima
                  </span>
                  <span className="px-2 py-0.5 bg-white rounded-md border border-purple-200 text-[#0A1628] font-semibold text-[10px]">
                    Raed Brini
                  </span>
                </div>
              </div>

              {/* Design & Visual Content */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-300/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#0A1628] flex items-center gap-1.5">
                    <span className="text-sm">🎨</span>
                    <span>{t.teamDesignVisual}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                    2 members
                  </span>
                </div>
                <div className="text-[11px] text-[#0A1628]/85 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 text-[#0A1628] font-semibold text-[10px]">
                    Ahmed Balha
                  </span>
                  <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 text-[#0A1628] font-semibold text-[10px]">
                    Meriem Chaabani
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section in Modal */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#0A1628] flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#C9A84C]" />
                <span>{t.contactUsAt}</span>
              </div>
              <p className="text-[11px] text-[#8A99B0]">
                {lang === 'fr'
                  ? 'Écrivez-nous pour vos suggestions, fiches de cours ou questions.'
                  : 'Reach out for academic questions, notes contributions, or feedback.'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="mailto:contact@pilotehubplus.com"
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#0A1628] text-[#C9A84C] text-xs font-bold hover:bg-[#122442] transition-all flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t.sendEmail}</span>
              </a>
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl bg-white border border-[#0A1628]/15 text-[#0A1628] text-xs font-bold hover:bg-[#F5F7FA] transition-all flex items-center justify-center gap-1 min-h-[38px]"
                title="Copy email"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8A99B0]" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#0A1628] text-[#C9A84C] text-xs font-bold hover:bg-[#122442] transition-all cursor-pointer min-h-[40px]"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
