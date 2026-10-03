import React, { useState } from 'react';
import { AppLanguage, QuizQuestion } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { QUIZ_QUESTIONS } from '../data/quizData';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, XCircle, Sparkles, Award, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXp: (amount: number) => void;
  lang: AppLanguage;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onRewardXp, lang }) => {
  const t = TRANSLATIONS[lang];
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentIndex] || QUIZ_QUESTIONS[0];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const earnedXp = (score + (selectedOption === currentQ.correctIndex ? 1 : 0)) * 20;
      onRewardXp(earnedXp);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C9A84C', '#0A1628', '#10B981'],
        });
      } catch {
        // safe fallback
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div
      id="modal-quiz-session"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1628]/60 backdrop-blur-sm animate-fadeUp"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#0A1628]/10 overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#0A1628] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" />
            <h2 className="text-sm sm:text-lg font-bold font-serif-display text-white">
              {lang === 'fr' ? 'Quiz de Révision & Connaissances' : 'Interactive Knowledge Quiz'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {!isFinished ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Progress & Subject */}
              <div className="flex items-center justify-between text-xs font-semibold text-[#8A99B0]">
                <span>
                  Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#0A1628]/5 text-[#0A1628] font-bold text-[11px]">
                  {currentQ.subject} • {currentQ.grade}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#0A1628]/5 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#C9A84C] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Text */}
              <h3 className="text-sm sm:text-lg font-bold text-[#0A1628] leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 sm:space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let btnStyle =
                    'bg-[#F5F7FA] border-[#0A1628]/10 text-[#0A1628] hover:border-[#C9A84C]';

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer min-h-[44px] ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0A1628]/5 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0 ml-2" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card when answered */}
              {isAnswered && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed animate-fadeUp">
                  <strong>
                    {selectedOption === currentQ.correctIndex
                      ? '✨ Correct!'
                      : '💡 Key Concept Explanation:'}
                  </strong>{' '}
                  {currentQ.explanation}
                </div>
              )}

              {/* Action Button */}
              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="w-full py-3 sm:py-3.5 rounded-2xl bg-[#0A1628] text-[#C9A84C] font-bold text-xs sm:text-sm hover:bg-[#122442] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
                >
                  <span>
                    {currentIndex + 1 === QUIZ_QUESTIONS.length ? 'View Results' : 'Next Question'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-4 sm:py-6 space-y-5 sm:space-y-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-serif-display text-[#0A1628]">
                  {lang === 'fr' ? 'Quiz Terminé !' : 'Quiz Completed!'}
                </h3>
                <p className="text-xs sm:text-sm text-[#8A99B0] mt-1">
                  You scored <strong className="text-[#0A1628]">{score}</strong> out of{' '}
                  <strong className="text-[#0A1628]">{QUIZ_QUESTIONS.length}</strong> questions!
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <span>+{score * 20} Study XP Awarded to your Profile</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 sm:pt-4 w-full">
                <button
                  onClick={handleRestart}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#0A1628]/15 text-xs font-bold text-[#0A1628] hover:bg-[#F5F7FA] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0A1628] text-[#C9A84C] text-xs font-bold hover:bg-[#122442] transition-all cursor-pointer shadow-xs min-h-[42px]"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
