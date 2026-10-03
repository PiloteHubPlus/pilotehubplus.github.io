import React, { useState, useMemo } from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Heart,
  Code2,
  Crown,
  Users2,
  BookOpen,
  Award,
  GraduationCap,
  PenTool,
  BookOpenCheck,
  Share2,
  Palette,
  Search,
  Filter,
} from 'lucide-react';

interface AboutTeamViewProps {
  lang: AppLanguage;
  onExploreCurriculum?: () => void;
}

type TeamId = 'all' | 'content-writing' | 'academic' | 'social-media' | 'design-visual';

export const AboutTeamView: React.FC<AboutTeamViewProps> = ({ lang, onExploreCurriculum }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<TeamId>('all');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@pilotehubplus.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Executive Leadership
  const executiveLeaders = [
    {
      name: 'Mariem Abdennadher',
      role: lang === 'fr' ? 'Fondatrice / Présidente' : 'Founder / President',
      initials: 'MA',
      icon: <Crown className="w-5 h-5 text-[#C9A84C]" />,
      avatarBg: 'bg-gradient-to-br from-[#0A1628] to-[#1E3A8A]',
      avatarText: 'text-[#C9A84C]',
      description:
        lang === 'fr'
          ? "Porteuse de la vision pédagogique de Pilotehub+. Elle supervise la sélection des programmes officiels, la conformité académique et le développement stratégique de la plateforme pour tous les collégiens et lycéens."
          : "Driving the academic vision, educational quality, and strategic direction of Pilotehub+. Spearheading curriculum standards and free learning access for pilot and general school students.",
      tags:
        lang === 'fr'
          ? ['Vision Pédagogique', 'Gouvernance', 'Stratégie']
          : ['Academic Vision', 'Governance', 'Curriculum Strategy'],
      email: 'contact@pilotehubplus.com',
    },
    {
      name: 'Raed Brini',
      role: lang === 'fr' ? 'Directeur Technique - CTO' : 'Chief Technology Officer - CTO',
      badgeRole: 'CTO',
      initials: 'RB',
      icon: <Code2 className="w-5 h-5 text-[#C9A84C]" />,
      avatarBg: 'bg-gradient-to-br from-[#0A1628] to-[#0F766E]',
      avatarText: 'text-[#C9A84C]',
      description:
        lang === 'fr'
          ? "Concepteur et architecte technique de la plateforme web Pilotehub+. Il a développé l'interface responsive, le moteur de Streaks d'étude, le minuteur Pomodoro et le moteur interactif de quiz."
          : "Architected and engineered the entire Pilotehub+ web platform, responsive UI/UX system, personalized study streak engine, Pomodoro focus tools, and interactive quiz ecosystem.",
      tags:
        lang === 'fr'
          ? ['Architecture Web', 'Frontend & Backend', 'UI/UX']
          : ['Full-Stack Engineering', 'UX/UI Architecture', 'Interactive Systems'],
      email: 'contact@pilotehubplus.com',
    },
    {
      name: 'Farah Derouich',
      role: lang === 'fr' ? 'Vice-Présidente' : 'Vice-President',
      initials: 'FD',
      icon: <Users2 className="w-5 h-5 text-[#C9A84C]" />,
      avatarBg: 'bg-gradient-to-br from-[#0A1628] to-[#4338CA]',
      avatarText: 'text-[#C9A84C]',
      description:
        lang === 'fr'
          ? "Coordonnatrice des relations communautaires et de la relecture éditoriale des fiches de révision et examens. Elle veille à ce que Pilotehub+ réponde aux besoins réels des élèves au quotidien."
          : "Leading community outreach, student engagement, and content review for course summaries and exams, ensuring Pilotehub+ remains accessible, student-first, and impactful.",
      tags:
        lang === 'fr'
          ? ['Engagement Communautaire', 'Revue Éditoriale', 'Opérations']
          : ['Community Outreach', 'Content Quality', 'Student Operations'],
      email: 'contact@pilotehubplus.com',
    },
  ];

  // 4 Operational Teams & Member Data
  const operationalTeams = [
    {
      id: 'content-writing' as const,
      title: lang === 'fr' ? 'Équipe Rédaction & Contenu' : 'Content Writing Team',
      shortTitle: lang === 'fr' ? 'Rédaction' : 'Content Writing',
      icon: <PenTool className="w-5 h-5 text-[#C9A84C]" />,
      themeColor: 'from-amber-500/20 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-400/30',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-300',
      accentColor: '#C9A84C',
      description:
        lang === 'fr'
          ? 'Rédige les fiches synthétiques de cours, les devoirs types résolus et les fiches méthodes pour les collèges et lycées.'
          : 'Crafts comprehensive course summaries, structured revision notes, step-by-step solutions, and exam study guides.',
      members: [
        {
          name: 'Elaa Rahmani',
          initials: 'ER',
          roles: [
            lang === 'fr' ? 'Rédactrice de Contenu' : 'Content Writer',
            lang === 'fr' ? 'Équipe Académique' : 'Academic Team',
          ],
          dualTeam: lang === 'fr' ? 'Aussi dans l\'Équipe Académique' : 'Also in Academic Team',
          focus: lang === 'fr' ? 'Fiches de synthèse & Exercices' : 'Summary Sheets & Problem Sets',
        },
        {
          name: 'Salma Hajaiej',
          initials: 'SH',
          roles: [lang === 'fr' ? 'Rédactrice de Contenu' : 'Content Writer'],
          focus: lang === 'fr' ? 'Résumés de cours & Méthodologie' : 'Course Notes & Methodology',
        },
        {
          name: 'Ahmed Balha',
          initials: 'AB',
          roles: [
            lang === 'fr' ? 'Rédacteur de Contenu' : 'Content Writer',
            lang === 'fr' ? 'Design & Visuel' : 'Design & Visual Team',
          ],
          dualTeam: lang === 'fr' ? 'Aussi dans Design & Visuel' : 'Also in Design & Visual Team',
          focus: lang === 'fr' ? 'Contenu Pédagogique & Schémas' : 'Educational Content & Diagrams',
        },
        {
          name: 'Youssef Barbouchi',
          initials: 'YB',
          roles: [lang === 'fr' ? 'Rédacteur de Contenu' : 'Content Writer'],
          focus: lang === 'fr' ? 'Devoirs de contrôle & Synthèses' : 'Periodic Tests & Summary Guides',
        },
        {
          name: 'Farah',
          initials: 'F',
          roles: [lang === 'fr' ? 'Rédactrice de Contenu' : 'Content Writer'],
          focus: lang === 'fr' ? 'Fiches de révision & Sujets d\'examens' : 'Revision Sheets & Exam Archives',
        },
        {
          name: 'Mariem Marzougui',
          initials: 'MM',
          roles: [lang === 'fr' ? 'Rédactrice de Contenu' : 'Content Writer'],
          focus: lang === 'fr' ? 'Exercices d\'entraînement & Corrigés' : 'Practice Exercises & Answer Keys',
        },
      ],
    },
    {
      id: 'academic' as const,
      title: lang === 'fr' ? 'Équipe Pédagogique & Académique' : 'Academic Team',
      shortTitle: lang === 'fr' ? 'Académique' : 'Academic Team',
      icon: <BookOpenCheck className="w-5 h-5 text-blue-600" />,
      themeColor: 'from-blue-500/20 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-400/30',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-300',
      accentColor: '#2563EB',
      description:
        lang === 'fr'
          ? 'Vérifie la conformité avec les programmes officiels, valide la rigueur scientifique et supervise la qualité des corrigés.'
          : 'Reviews curriculum alignment, ensures syllabus accuracy, verifies official examination formats, and quality-checks solutions.',
      members: [
        {
          name: 'Elaa Rahmani',
          initials: 'ER',
          roles: [
            lang === 'fr' ? 'Superviseuse Pédagogique' : 'Academic Reviewer',
            lang === 'fr' ? 'Équipe Rédaction' : 'Content Writing Team',
          ],
          dualTeam: lang === 'fr' ? 'Aussi dans Rédaction' : 'Also in Content Writing Team',
          focus: lang === 'fr' ? 'Vérification des programmes & Rigueur' : 'Curriculum Audit & Academic Rigor',
        },
        {
          name: 'Hiba Houcine',
          initials: 'HH',
          roles: [lang === 'fr' ? 'Relectrice Académique' : 'Academic Reviewer'],
          focus: lang === 'fr' ? 'Validation des séries & Corrigés' : 'Problem Sets & Answer Verification',
        },
        {
          name: 'Tasnime Ben Ayed',
          initials: 'TB',
          roles: [lang === 'fr' ? 'Relectrice Académique' : 'Academic Reviewer'],
          focus: lang === 'fr' ? 'Conformité des examens officiels' : 'Standardized Exam Alignment',
        },
        {
          name: 'Fatma Hsouna',
          initials: 'FH',
          roles: [lang === 'fr' ? 'Relectrice Académique' : 'Academic Reviewer'],
          focus: lang === 'fr' ? 'Contrôle qualité des épreuves' : 'Subject Quality Control & Grading',
        },
      ],
    },
    {
      id: 'social-media' as const,
      title: lang === 'fr' ? 'Équipe Réseaux Sociaux & Communication' : 'Social Media & Outreach Team',
      shortTitle: lang === 'fr' ? 'Réseaux & Outreach' : 'Social Media & Outreach',
      icon: <Share2 className="w-5 h-5 text-purple-600" />,
      themeColor: 'from-purple-500/20 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-400/30',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-300',
      accentColor: '#9333EA',
      description:
        lang === 'fr'
          ? 'Anime la communauté d’élèves, partage les conseils méthodologiques et gère la communication sur les réseaux sociaux.'
          : 'Engages student communities, broadcasts study techniques, manages digital outreach, and gathers student feedback.',
      members: [
        {
          name: 'Selima',
          initials: 'S',
          roles: [lang === 'fr' ? 'Responsable Communication & Réseaux' : 'Outreach & Social Media Lead'],
          focus: lang === 'fr' ? 'Animation communauté, astuces d\'étude & diffusion' : 'Community Growth, Study Tips & Outreach',
        },
        {
          name: 'Raed Brini',
          initials: 'RB',
          roles: [
            'CTO',
            lang === 'fr' ? 'Réseaux & Outreach' : 'Social Media & Outreach',
          ],
          dualTeam: 'CTO',
          focus:
            lang === 'fr'
              ? 'Communication numérique, diffusion web & engagement communautaire'
              : 'Digital Outreach, Platform Growth & Community Engagement',
        },
      ],
    },
    {
      id: 'design-visual' as const,
      title: lang === 'fr' ? 'Équipe Design & Contenu Visuel' : 'Design & Visual Content Team',
      shortTitle: lang === 'fr' ? 'Design & Visuel' : 'Design & Visual Content',
      icon: <Palette className="w-5 h-5 text-emerald-600" />,
      themeColor: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-400/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-300',
      accentColor: '#059669',
      description:
        lang === 'fr'
          ? 'Crée les infographies, les illustrations de cours, les schémas explicatifs et l’identité visuelle de Pilotehub+.'
          : 'Creates visual infographics, educational diagrams, branded study assets, and clear scientific illustrations.',
      members: [
        {
          name: 'Ahmed Balha',
          initials: 'AB',
          roles: [
            lang === 'fr' ? 'Designer Visuel & Graphique' : 'Visual & Graphic Designer',
            lang === 'fr' ? 'Équipe Rédaction' : 'Content Writing Team',
          ],
          dualTeam: lang === 'fr' ? 'Aussi dans Rédaction' : 'Also in Content Writing Team',
          focus: lang === 'fr' ? 'Schémas pédagogiques, infographies & assets' : 'Infographics, Visual Schematics & Assets',
        },
        {
          name: 'Meriem Chaabani',
          initials: 'MC',
          roles: [
            lang === 'fr' ? 'Designer Visuel & Graphique' : 'Visual & Graphic Designer',
          ],
          focus:
            lang === 'fr'
              ? 'Identité visuelle, illustrations de cours & infographies'
              : 'Visual Identity, Course Illustrations & Infographics',
        },
      ],
    },
  ];

  // Filtering teams & search logic
  const filteredTeams = useMemo(() => {
    return operationalTeams
      .filter((team) => {
        if (selectedTeamFilter === 'all') return true;
        return team.id === selectedTeamFilter;
      })
      .map((team) => {
        if (!memberSearchQuery.trim()) return team;
        const query = memberSearchQuery.toLowerCase().trim();
        const matchingMembers = team.members.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.focus.toLowerCase().includes(query) ||
            m.roles.some((r) => r.toLowerCase().includes(query))
        );
        return {
          ...team,
          members: matchingMembers,
        };
      })
      .filter((team) => team.members.length > 0 || !memberSearchQuery.trim());
  }, [selectedTeamFilter, memberSearchQuery, lang]);

  const totalContributorsCount = useMemo(() => {
    // Unique names count across all teams
    const unique = new Set<string>();
    operationalTeams.forEach((t) => t.members.forEach((m) => unique.add(m.name)));
    return unique.size;
  }, []);

  return (
    <div id="page-about-team" className="space-y-10 sm:space-y-14 animate-fadeUp">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#0F1F38] to-[#122442] text-white p-6 sm:p-10 lg:p-14 border border-[#C9A84C]/25 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#C9A84C] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Notre Histoire & Nos Équipes' : 'Our Mission & Leadership Teams'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-serif-display text-white tracking-tight leading-tight">
            {lang === 'fr' ? 'La Plateforme Créée par des Élèves,' : 'Built by Dedicated Scholars,'}{' '}
            <span className="text-[#C9A84C]">
              {lang === 'fr' ? 'pour les Élèves' : 'for Every Learner'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            {lang === 'fr'
              ? 'Pilotehub+ est né d’une vision commune : rendre l’excellence scolaire accessible à tous, sans barrière financière, sans publicité et sans abonnement. Découvrez la direction et les 4 pôles opérationnels qui animent cette mission au quotidien.'
              : 'Pilotehub+ was founded on a singular principle: empowering middle and high school students with world-class, organized revision notes, exercises, and exams with zero paywalls and zero ads.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="mailto:contact@pilotehubplus.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0A1628] text-xs sm:text-sm font-extrabold hover:bg-amber-400 transition-all shadow-md active:scale-95 cursor-pointer min-h-[42px]"
            >
              <Mail className="w-4 h-4" />
              <span>{t.contactUsAt}</span>
            </a>

            {onExploreCurriculum && (
              <button
                onClick={onExploreCurriculum}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer min-h-[42px]"
              >
                <BookOpen className="w-4 h-4 text-[#C9A84C]" />
                <span>{t.btnExploreCurriculum}</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background crest watermark */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <BrandLogo size="lg" variant="dark" />
        </div>
      </section>

      {/* 2. Executive Leadership Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#0A1628]/10 pb-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#C9A84C] mb-1 flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Direction & Gouvernance' : 'Executive Leadership'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif-display text-[#0A1628]">
              {t.teamTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8A99B0] max-w-md">
            {t.teamSubtitle}
          </p>
        </div>

        {/* Responsive Grid of Executive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {executiveLeaders.map((member, idx) => (
            <div
              key={idx}
              id={`card-exec-member-${idx}`}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0A1628]/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0A1628] via-[#C9A84C] to-[#0A1628] opacity-80" />

              <div className="space-y-4">
                {/* Avatar & Role Header */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl ${member.avatarBg} ${member.avatarText} font-extrabold font-serif-display text-lg flex items-center justify-center shadow-md ring-2 ring-[#C9A84C]/30 flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {member.initials}
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider bg-[#0A1628]/5 border-[#0A1628]/10 text-[#0A1628]">
                    {member.icon}
                    <span>{member.badgeRole || member.role}</span>
                  </div>
                </div>

                {/* Name & Title */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif-display text-[#0A1628] group-hover:text-[#C9A84C] transition-colors">
                    {member.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#8A99B0] mt-0.5">
                    {member.role}
                  </div>
                </div>

                {/* Bio Description */}
                <p className="text-xs sm:text-sm text-[#0A1628]/80 leading-relaxed font-normal">
                  {member.description}
                </p>

                {/* Responsibility Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {member.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#0A1628]/5 text-[10px] sm:text-[11px] font-semibold text-[#0A1628]/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Quick Contact */}
              <div className="pt-5 mt-5 border-t border-[#0A1628]/10 flex items-center justify-between gap-2">
                <a
                  href={`mailto:${member.email}?subject=Message for ${encodeURIComponent(member.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1628] hover:text-[#C9A84C] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>{lang === 'fr' ? 'Écrire à l\'équipe' : 'Direct Message'}</span>
                </a>

                <span className="text-[10px] font-mono text-[#8A99B0] bg-[#F5F7FA] px-2 py-1 rounded-md border border-[#0A1628]/5 truncate max-w-[150px]">
                  {member.email}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Specialized Operational Teams (4 Teams & Member Cards with Filters) */}
      <section id="section-specialized-teams" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0A1628]/10 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#C9A84C] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C9A84C]" />
              <span>{lang === 'fr' ? 'Pôles Opérationnels (4 Équipes)' : 'Operational Divisions (4 Teams)'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif-display text-[#0A1628]">
              {t.specializedTeamsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#8A99B0] max-w-xl">
              {t.specializedTeamsSubtitle}
            </p>
          </div>

          {/* Quick Search in Contributors */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8A99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher un membre...' : 'Search team members...'}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-[#0A1628]/15 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 text-[#0A1628]"
            />
            {memberSearchQuery && (
              <button
                onClick={() => setMemberSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A99B0] hover:text-[#0A1628]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Interactive Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-[#8A99B0] font-bold mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Filter:</span>
          </div>

          <button
            onClick={() => setSelectedTeamFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 min-h-[36px] ${
              selectedTeamFilter === 'all'
                ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm'
                : 'bg-white border border-[#0A1628]/10 text-[#0A1628] hover:bg-[#F5F7FA]'
            }`}
          >
            <span>{t.filterAllTeams}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedTeamFilter === 'all' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#0A1628]/5 text-[#8A99B0]'
              }`}
            >
              4 teams • {totalContributorsCount} members
            </span>
          </button>

          {operationalTeams.map((team) => {
            const isSelected = selectedTeamFilter === team.id;
            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamFilter(team.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 min-h-[36px] ${
                  isSelected
                    ? 'bg-[#0A1628] text-[#C9A84C] shadow-sm'
                    : 'bg-white border border-[#0A1628]/10 text-[#0A1628] hover:bg-[#F5F7FA]'
                }`}
              >
                {React.cloneElement(team.icon, { className: 'w-3.5 h-3.5' })}
                <span>{team.shortTitle}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#0A1628]/5 text-[#8A99B0]'
                  }`}
                >
                  {team.members.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4 Team Cards Grid with Members Embedded Under Each Team Card */}
        {filteredTeams.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#0A1628]/10 text-sm text-[#8A99B0]">
            {lang === 'fr'
              ? `Aucun membre ne correspond à la recherche "${memberSearchQuery}".`
              : `No team members matched "${memberSearchQuery}".`}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                id={`card-team-section-${team.id}`}
                className="bg-white rounded-3xl border border-[#0A1628]/10 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Team Card Header Strip */}
                <div className={`p-5 sm:p-6 bg-gradient-to-r ${team.themeColor} border-b border-[#0A1628]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-[#0A1628]/10 flex items-center justify-center flex-shrink-0">
                      {team.icon}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-serif-display text-[#0A1628]">
                        {team.title}
                      </h3>
                      <div className="text-[11px] font-semibold text-[#8A99B0]">
                        {team.members.length}{' '}
                        {team.members.length > 1 ? t.membersCount : t.memberCountSingular}
                      </div>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/80 border border-[#0A1628]/10 text-[#0A1628] shadow-xs">
                    {team.shortTitle}
                  </span>
                </div>

                {/* Team Mission Description */}
                <div className="px-5 sm:px-6 pt-4 pb-2 text-xs sm:text-sm text-[#0A1628]/80 leading-relaxed">
                  {team.description}
                </div>

                {/* Members List under each Team Card */}
                <div className="p-5 sm:p-6 pt-3 flex-1 flex flex-col justify-between space-y-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A99B0] flex items-center justify-between border-b border-[#0A1628]/5 pb-2">
                    <span>
                      {lang === 'fr' ? 'Membres & Rôles' : 'Team Members & Assignments'}
                    </span>
                    <span>
                      {team.members.length} {lang === 'fr' ? 'assignés' : 'assigned'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {team.members.map((member, mIdx) => (
                      <div
                        key={mIdx}
                        id={`member-badge-${team.id}-${mIdx}`}
                        className="p-3.5 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/5 hover:border-[#C9A84C]/60 hover:bg-white transition-all shadow-xs flex flex-col justify-between space-y-2 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-[#0A1628] text-[#C9A84C] text-xs font-extrabold flex items-center justify-center font-serif-display group-hover:scale-105 transition-transform flex-shrink-0">
                                {member.initials}
                              </span>
                              <div className="font-bold text-xs sm:text-sm text-[#0A1628] group-hover:text-[#C9A84C] transition-colors line-clamp-1">
                                {member.name}
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] font-medium text-[#8A99B0] leading-snug">
                            {member.focus}
                          </div>
                        </div>

                        {/* Badges / Dual assignment chip */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {member.roles.map((role, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-2 py-0.5 rounded-md bg-white border border-[#0A1628]/10 text-[10px] font-bold text-[#0A1628]/90"
                            >
                              {role}
                            </span>
                          ))}
                          {member.dualTeam && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-[9px] font-extrabold text-amber-800">
                              ★ {member.dualTeam}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Sub-Footer */}
                <div className="px-5 sm:px-6 py-3 bg-[#F5F7FA]/60 border-t border-[#0A1628]/5 flex items-center justify-between text-[11px] text-[#8A99B0]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'fr' ? 'Contributeurs vérifiés' : 'Verified Scholars'}</span>
                  </span>
                  <a
                    href="mailto:contact@pilotehubplus.com?subject=Join the team"
                    className="font-bold text-[#0A1628] hover:text-[#C9A84C] transition-colors cursor-pointer"
                  >
                    {lang === 'fr' ? 'Rejoindre ce pôle →' : 'Join this team →'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Official Contact Section (Prominent) */}
      <section
        id="section-contact-us"
        className="rounded-3xl bg-white border border-[#0A1628]/10 shadow-lg p-6 sm:p-8 lg:p-10 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#0A1628]/10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#C9A84C]">
              <Mail className="w-4 h-4" />
              <span>{t.contactUs}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-[#0A1628]">
              {lang === 'fr' ? 'Nous Contacter' : 'Get in Touch with the Pilotehub+ Team'}
            </h2>
            <p className="text-xs sm:text-sm text-[#8A99B0] leading-relaxed">
              {t.contactSubtitle}
            </p>
          </div>

          {/* Direct Email Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              id="btn-mailto-link"
              href="mailto:contact@pilotehubplus.com"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0A1628] text-[#C9A84C] text-xs sm:text-sm font-extrabold hover:bg-[#122442] shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Mail className="w-4 h-4" />
              <span>contact@pilotehubplus.com</span>
            </a>

            <button
              id="btn-copy-email"
              onClick={handleCopyEmail}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-[#0A1628]/15 bg-[#F5F7FA] hover:bg-white text-xs sm:text-sm font-bold text-[#0A1628] transition-all active:scale-95 cursor-pointer min-h-[44px]"
              title="Copy email to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{t.emailCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8A99B0]" />
                  <span>{t.copyEmail}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Inquiry Pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#0A1628]">
          <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/5 space-y-1.5">
            <div className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A84C]" />
              <span>{lang === 'fr' ? 'Partage de Ressources' : 'Share Revision Notes'}</span>
            </div>
            <p className="text-[#8A99B0]">
              {lang === 'fr'
                ? 'Envoyez vos cours, exercices résolus et devoirs récents pour enrichir la plateforme.'
                : 'Send your synthesized summaries, solved tests, and exams to help fellow students.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/5 space-y-1.5">
            <div className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'fr' ? 'Retours & Suggestions' : 'Feedback & Ideas'}</span>
            </div>
            <p className="text-[#8A99B0]">
              {lang === 'fr'
                ? 'Une suggestion d’amélioration ou un problème technique ? Écrivez-nous directement.'
                : 'Suggestions for new interactive features, subject notes, or UI enhancements.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/5 space-y-1.5">
            <div className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{lang === 'fr' ? 'Partenariats Écoles' : 'School Partnerships'}</span>
            </div>
            <p className="text-[#8A99B0]">
              {lang === 'fr'
                ? 'Enseignants et délégués : collaborez avec nous pour diffuser nos ressources.'
                : 'Teachers, clubs, and student councils: collaborate to expand open education.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Values & Contributor Callout */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0A1628] text-white space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              {lang === 'fr' ? 'Notre Engagement' : 'Our Promise'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-serif-display mt-0.5">
              {lang === 'fr'
                ? 'Un Accès Libre, Équitable & Transparent'
                : 'Open, Equitable & Student-Centric Learning'}
            </h3>
          </div>

          <a
            href="https://forms.gle/pilotehub-contributor-application"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer min-h-[38px]"
          >
            <span>{t.joinTitle}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C9A84C]" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-[#C9A84C] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Free Always</span>
            </div>
            <p className="text-gray-300">
              No hidden subscriptions, fees, or paywalled lessons.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-[#C9A84C] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Zero Intrusive Ads</span>
            </div>
            <p className="text-gray-300">
              A distraction-free, quiet learning environment designed for focus.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-[#C9A84C] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Official Curricula</span>
            </div>
            <p className="text-gray-300">
              Middle & High school courses aligned with official guidelines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-[#C9A84C] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Community Powered</span>
            </div>
            <p className="text-gray-300">
              Built and maintained with love by students and educators.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
