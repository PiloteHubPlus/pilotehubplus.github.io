import React, { useState, useEffect } from 'react';
import { AppLanguage, Review, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import confetti from 'canvas-confetti';
import {
  Star,
  MessageSquare,
  CheckCircle,
  CheckCircle2,
  Send,
  Sparkles,
  Mail,
  X,
  HeartHandshake,
  AlertCircle,
  ExternalLink,
  Lock,
  LogIn,
  UserCheck,
} from 'lucide-react';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  lang: AppLanguage;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'signup', notice?: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onAddReview,
  lang,
  currentUser,
  onOpenAuthModal,
}) => {
  const t = TRANSLATIONS[lang];

  const [author, setAuthor] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [school, setSchool] = useState(currentUser?.school || '');
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [popupData, setPopupData] = useState<{
    isOpen: boolean;
    stars: number;
    author: string;
    email: string;
    comment: string;
    mailtoUrl: string;
  } | null>(null);

  // Sync with currentUser if logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName && !author) setAuthor(currentUser.displayName);
      if (currentUser.email && !email) setEmail(currentUser.email);
      if (currentUser.school && !school) setSchool(currentUser.school);
    }
  }, [currentUser]);

  const avgScore =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length).toFixed(1)
      : '5.0';

  const handleRequireAuth = () => {
    onOpenAuthModal?.(
      'signin',
      lang === 'fr'
        ? 'Veuillez vous connecter à votre compte pour publier un avis ou envoyer vos commentaires à l’équipe !'
        : 'Please sign in to your account to post your review & feedback!'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      handleRequireAuth();
      return;
    }
    if (!comment.trim()) return;

    const authorName = (currentUser?.displayName?.trim()) || author.trim() || (lang === 'fr' ? 'Élève Pilote' : 'Student Learner');
    const userEmail = (currentUser?.email?.trim()) || email.trim() || '';
    const schoolName = (currentUser?.school?.trim()) || school.trim() || '';

    // Prepare email payload to contact@pilotehubplus.com
    const emailSubject = `[PiloteHub+ Review] ${stars} Stars - ${authorName}`;
    const emailBody = [
      `Reviewer: ${authorName}`,
      `Email: ${userEmail || 'Not provided'}`,
      `Rating: ${stars} / 5 Stars`,
      `School / Grade: ${schoolName || 'Not specified'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      `Feedback & Review:`,
      comment.trim(),
    ].join('\n');

    const mailtoUrl = `mailto:contact@pilotehubplus.com?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // Add review to state & application
    onAddReview({
      author: authorName,
      email: userEmail,
      school: schoolName || undefined,
      stars,
      comment: comment.trim(),
      verified: true,
    });

    // Launch confetti if high rating (> 3 stars)
    if (stars > 3) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C9A84C', '#F59E0B', '#10B981', '#0A1628'],
        });
      } catch {}
    }

    // Try to open email client in background without blocking popup
    try {
      const mailLink = document.createElement('a');
      mailLink.href = mailtoUrl;
      mailLink.target = '_blank';
      mailLink.rel = 'noopener noreferrer';
      mailLink.click();
    } catch {}

    // Open confirmation popup tab
    setPopupData({
      isOpen: true,
      stars,
      author: authorName,
      email: userEmail,
      comment: comment.trim(),
      mailtoUrl,
    });

    // Reset form fields
    setComment('');
  };

  return (
    <div className="w-full space-y-6 sm:space-y-12">
      {/* Header & Rating Summary */}
      <div className="text-center max-w-2xl mx-auto px-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0A1628] font-serif-display">
          {t.reviewsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#8A99B0] mt-2">{t.reviewsSubtitle}</p>

        {/* Avg Rating Banner */}
        <div className="mt-4 sm:mt-6 inline-flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-white border border-[#0A1628]/10 shadow-xs">
          <div className="flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          {reviews.length > 0 ? (
            <>
              <span className="text-sm sm:text-base font-extrabold text-[#0A1628]">{avgScore} / 5.0</span>
              <span className="text-[11px] sm:text-xs text-[#8A99B0]">({reviews.length} {t.reviewsWord || 'reviews'})</span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-bold text-[#0A1628]">
              {lang === 'fr' ? '0 avis pour le moment' : '0 reviews yet'}
            </span>
          )}
        </div>
      </div>

      {/* Grid: Feedback Form & Community Testimonial Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Form to Submit Feedback */}
        <div className="bg-white p-4 sm:p-7 rounded-3xl border border-[#0A1628]/10 shadow-xs h-fit space-y-4 sm:space-y-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif-display text-[#0A1628]">
              {t.leaveReviewTitle}
            </h3>
            <p className="text-xs text-[#8A99B0] mt-0.5">{t.leaveReviewDesc}</p>
          </div>

          {/* Account status badge */}
          {!currentUser ? (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  {lang === 'fr'
                    ? 'Connexion requise pour publier'
                    : 'Sign-in required to post'}
                </p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  {lang === 'fr'
                    ? 'Connectez-vous pour laisser votre avis vérifié et contacter l’équipe.'
                    : 'Log in to submit your verified review and contact our team.'}
                </p>
                <button
                  type="button"
                  onClick={handleRequireAuth}
                  className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A1628] text-[#C9A84C] font-extrabold text-[11px] hover:bg-[#122442] cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3 h-3" />
                  <span>{lang === 'fr' ? 'Se connecter maintenant' : 'Sign In Now'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-2.5 text-xs text-emerald-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {lang === 'fr' ? 'Publier en tant que :' : 'Posting as:'}
                  </div>
                  <div className="font-bold text-emerald-950 text-xs sm:text-sm truncate">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  {(currentUser.school || currentUser.grade) && (
                    <div className="text-[10.5px] text-emerald-700/90 truncate">
                      {[currentUser.school, currentUser.grade].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-200/70 text-emerald-800 font-bold text-[10px] flex-shrink-0">
                {lang === 'fr' ? 'Compte Vérifié' : 'Verified'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Picker */}
            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1.5">
                {lang === 'fr' ? 'Votre Note :' : 'Rating:'}
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStars(st)}
                    className="p-1.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        st <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback & Experience */}
            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1.5">
                {lang === 'fr'
                  ? 'Votre avis, suggestions d\'amélioration & souhaits :'
                  : 'Your Feedback, Improvements & Wishlist:'}
              </label>
              <textarea
                required
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.yourCommentPlaceholder}
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#F5F7FA] border border-[#0A1628]/10 text-xs sm:text-sm text-[#0A1628] placeholder:text-[#8A99B0]/90 placeholder:leading-relaxed outline-none focus:border-[#C9A84C] focus:bg-white transition-all resize-none shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8A99B0] pt-0.5">
              <Mail className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
              <span>
                {lang === 'fr'
                  ? 'Votre avis est envoyé à contact@pilotehubplus.com'
                  : 'Your review is sent to contact@pilotehubplus.com'}
              </span>
            </div>

            <button
              id="btn-submit-review"
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                !currentUser
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#0A1628] hover:bg-[#122442] text-[#C9A84C]'
              }`}
            >
              {!currentUser ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {lang === 'fr'
                      ? 'Se connecter pour publier l’avis'
                      : 'Sign in to Submit Review'}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.submitReview}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Testimonials List */}
        <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#0A1628]/10 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mx-auto">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-bold text-base sm:text-lg text-[#0A1628] font-serif-display">
                  {lang === 'fr' ? 'Aucun avis publié pour le moment' : 'No reviews published yet'}
                </h4>
                <p className="text-xs sm:text-sm text-[#8A99B0] leading-relaxed">
                  {lang === 'fr'
                    ? 'Connectez-vous et soyez le premier élève à partager votre retour d’expérience sur les cours, séries et devoirs Pilotehub+ !'
                    : 'Sign in and be the first student to share your feedback and experience on Pilotehub+ courses and national exams!'}
                </p>
              </div>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-6 rounded-3xl bg-white border border-[#0A1628]/10 shadow-xs space-y-2.5 sm:space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs sm:text-sm text-[#0A1628]">{rev.author}</h4>
                      {rev.verified && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold border border-emerald-200">
                          {t.verifiedStudent}
                        </span>
                      )}
                    </div>
                    {rev.school && (
                      <span className="text-[11px] sm:text-xs text-[#8A99B0] block">{rev.school}</span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400 flex-shrink-0">
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#0A1628]/85 leading-relaxed font-normal">
                  {rev.comment}
                </p>

                <div className="text-[10px] text-[#8A99B0] pt-2 border-t border-[#0A1628]/5">
                  Posted on {rev.date}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post-Review Confirmation Tab / Modal Popup */}
      {popupData && popupData.isOpen && (
        <div
          id="modal-review-feedback"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0A1628]/75 backdrop-blur-md animate-fadeUp overflow-y-auto"
          onClick={() => setPopupData(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#0A1628]/10 text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPopupData(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex justify-center">
              {popupData.stars <= 3 ? (
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                  <HeartHandshake className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Sparkles className="w-8 h-8 text-emerald-500 fill-emerald-100" />
                </div>
              )}
            </div>

            {/* Rating Stars Display */}
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((st) => (
                <Star
                  key={st}
                  className={`w-5 h-5 ${
                    st <= popupData.stars
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Main Required Text */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif-display text-[#0A1628]">
                {popupData.stars <= 3
                  ? lang === 'fr'
                    ? 'Avis Bien Reçu • Assistance PiloteHub+'
                    : 'Review Received • Support Team'
                  : lang === 'fr'
                  ? 'Merci pour votre contribution !'
                  : 'Thank You for Your Feedback!'}
              </h3>

              {popupData.stars <= 3 ? (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-sm sm:text-base leading-relaxed font-medium">
                  {lang === 'fr' ? (
                    <>
                      « Nous examinerons votre avis et vous contacterons dès que possible pour voir si nous pouvons résoudre le problème ou le désagrément que vous rencontrez. »
                    </>
                  ) : (
                    <>
                      « we will look at your review, and contact you as soon as possible to see if we can resolve the problem or the inconvience that the person is having »
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 text-sm sm:text-base leading-relaxed font-medium">
                  {lang === 'fr' ? (
                    <>
                      « Merci pour votre avis, nous allons le vérifier et le publier bientôt »
                    </>
                  ) : (
                    <>
                      « Thank you for your review, we will look it up and publish it soon »
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Email destination badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#8A99B0] bg-[#F5F7FA] py-2 px-4 rounded-xl">
              <Mail className="w-4 h-4 text-[#C9A84C]" />
              <span>
                {lang === 'fr'
                  ? 'Transmis à : contact@pilotehubplus.com'
                  : 'Forwarded to: contact@pilotehubplus.com'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => setPopupData(null)}
                className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-[#0A1628] text-[#C9A84C] font-bold text-sm hover:bg-[#122442] transition-colors cursor-pointer shadow-md"
              >
                {lang === 'fr' ? 'D’accord' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

