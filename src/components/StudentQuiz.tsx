import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import type {
  AuthUser,
  OptionKey,
  PublicQuizQuestion,
  QuizSubmission,
} from '../types';
import { CurvedSpinnerSvg, OptionContent } from './MathParts';

interface StudentQuizProps {
  user: AuthUser;
  onSubmissionComplete: () => void;
  onBackToLab: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function StudentQuiz({
  user,
  onSubmissionComplete,
  onBackToLab,
}: StudentQuizProps) {
  const [questions, setQuestions] = useState<PublicQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmUnanswered, setConfirmUnanswered] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [result, setResult] = useState<QuizSubmission | null>(null);
  const [showExplanations, setShowExplanations] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/quiz/questions')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load quiz questions.');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setQuestions(data.questions || []);
        setShowExplanations(Boolean(data.showExplanationsToStudents));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load quiz.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading || result || questions.length === 0) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading, result, questions.length]);

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (questionId: number, key: OptionKey) => {
    setConfirmUnanswered(false);
    setSubmitError(null);
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const handleSubmit = async (forceSubmit = false) => {
    if (!forceSubmit && answeredCount < totalCount) {
      setConfirmUnanswered(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          answers,
          durationSeconds: elapsedSeconds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Could not submit your quiz.');
        setSubmitting(false);
        return;
      }
      setResult(data.submission as QuizSubmission);
      setShowExplanations(Boolean(data.showExplanationsToStudents));
      onSubmissionComplete();
    } catch {
      setSubmitError('Network error while submitting quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setConfirmUnanswered(false);
    setSubmitError(null);
    setResult(null);
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[#5E525A]">Loading probability assessment...</p>
      </main>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-sm font-medium text-[#991B1B]">
          {loadError || 'No questions available.'}
        </p>
        <button
          type="button"
          onClick={onBackToLab}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#874e6d] rounded-lg cursor-pointer"
        >
          Return to Concept Lab
        </button>
      </main>
    );
  }

  // Graded Result View
  if (result) {
    const passed = result.scorePercent >= 75;
    return (
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Summary Header Card */}
        <section className="bg-white border border-[#E6D5DF] rounded-xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#874e6d]">
              <span>Assessment Complete</span>
              <span aria-hidden="true">·</span>
              <span>{user.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{user.identifier}</span>
            </div>
            <h1 className="text-3xl font-bold text-[#2B1A24]">
              Your Quiz Score:{' '}
              <span className="font-mono tabular-nums text-[#874e6d]">{result.scorePercent}%</span>
            </h1>
            <p className="text-sm text-[#5E525A]">
              You answered{' '}
              <span className="font-mono font-semibold text-[#2B1A24] tabular-nums">
                {result.correctCount} of {result.totalQuestions}
              </span>{' '}
              questions correctly in{' '}
              <span className="font-mono tabular-nums">{formatDuration(result.durationSeconds)}</span>
              . Status:{' '}
              <span className="font-semibold text-[#2B1A24]">
                {passed ? 'Proficient (Passed)' : 'Needs Practice'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToLab}
              className="px-4 py-2.5 text-xs font-semibold text-[#2B1A24] bg-[#F3EAF0] hover:bg-[#ddbfcf] rounded-lg transition-colors cursor-pointer"
            >
              Practice in Lab
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Quiz
            </button>
          </div>
        </section>

        {/* Question-by-Question Review */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#2B1A24]">Detailed Question Review</h2>
            <span className="text-xs text-[#5E525A]">
              {showExplanations
                ? 'Step-by-step explanations enabled by instructor'
                : 'Detailed explanations hidden by instructor'}
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q) => {
              const graded = result.gradedAnswers.find((g) => g.questionId === q.id);
              const selectedOpt = q.options.find((o) => o.key === graded?.selectedOption);
              const correctOpt = q.options.find((o) => o.key === graded?.correctOption);

              return (
                <article
                  key={q.id}
                  className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#5E525A]">
                        <span className="font-mono font-semibold text-[#874e6d]">
                          Question {q.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{q.topic}</span>
                      </div>
                      <p className="text-base font-medium text-[#2B1A24] leading-relaxed">
                        {q.prompt}
                      </p>
                    </div>

                    {graded?.isCorrect ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#065F46] shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#991B1B] shrink-0">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect</span>
                      </div>
                    )}
                  </div>

                  {q.hasSpinnerDiagram && (
                    <div className="py-2">
                      <CurvedSpinnerSvg size={130} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0E5EB] text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#5E525A]">Your Answer:</span>
                      {selectedOpt ? (
                        <span className="inline-flex items-center gap-2 font-semibold text-[#2B1A24]">
                          <span className="font-mono">{selectedOpt.key}.</span>
                          <OptionContent option={selectedOpt} />
                        </span>
                      ) : (
                        <span className="text-xs text-[#991B1B] font-medium">Not answered</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#5E525A]">Correct Answer:</span>
                      {correctOpt && (
                        <span className="inline-flex items-center gap-2 font-semibold text-[#065F46]">
                          <span className="font-mono">{correctOpt.key}.</span>
                          <OptionContent option={correctOpt} />
                        </span>
                      )}
                    </div>
                  </div>

                  {showExplanations && graded?.explanation && (
                    <p className="text-xs text-[#5E525A] bg-[#FAF6F8] border border-[#EFE3EA] rounded-lg px-4 py-3 leading-relaxed">
                      <span className="font-semibold text-[#2B1A24]">Explanation: </span>
                      {graded.explanation}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  // Active Quiz Taking View
  const selectedForCurrent = answers[currentQuestion.id];
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Top Quiz Status & Progress Bar */}
      <div className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-[#874e6d]">
              <span>Probability Assessment</span>
              <span aria-hidden="true">·</span>
              <span>{user.name}</span>
              <span aria-hidden="true">·</span>
              <span>{user.className || 'Grade 8'}</span>
            </div>
            <h1 className="text-xl font-bold text-[#2B1A24]">
              Empirical &amp; Theoretical Probability Quiz
            </h1>
          </div>

          <div className="flex items-center gap-6 text-sm shrink-0">
            <div className="text-right">
              <span className="text-xs text-[#5E525A] block">Completed</span>
              <span className="font-mono font-semibold text-[#2B1A24] tabular-nums">
                {answeredCount} / {totalCount}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#5E525A] block">Elapsed Time</span>
              <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#2B1A24] tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#874e6d]" />
                {formatDuration(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-[#ddbfcf]/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#bc81a0] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Split: Question Navigator & Active Question Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Question Navigator */}
        <aside className="lg:col-span-4 bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#2B1A24]">Question Navigator</h2>
            <p className="text-xs text-[#5E525A]">Select any question number to jump directly.</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = Boolean(answers[q.id]);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-11 rounded-lg font-mono text-sm font-semibold tabular-nums border transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#874e6d] border-[#874e6d] text-white'
                      : isAnswered
                        ? 'bg-[#ddbfcf]/55 border-[#bc81a0] text-[#2B1A24]'
                        : 'bg-[#FAF6F8] border-[#E6D5DF] text-[#5E525A] hover:border-[#bc81a0]'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#F0E5EB] space-y-2 text-xs text-[#5E525A]">
            <div className="flex items-center justify-between">
              <span>Current Question</span>
              <span className="font-mono font-semibold text-[#2B1A24]">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Answered</span>
              <span className="font-mono font-semibold text-[#874e6d] tabular-nums">
                {answeredCount} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Remaining</span>
              <span className="font-mono font-semibold text-[#2B1A24] tabular-nums">
                {totalCount - answeredCount} items
              </span>
            </div>
          </div>
        </aside>

        {/* Active Question Card */}
        <section className="lg:col-span-8 bg-white border border-[#E6D5DF] rounded-xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0E5EB] pb-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#874e6d]">
              <span className="font-mono font-semibold">
                Question {currentQuestion.id} of {totalCount}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentQuestion.topic}</span>
            </div>
            {selectedForCurrent && (
              <span className="text-xs font-medium text-[#5E525A]">
                Selected: <strong className="font-mono text-[#2B1A24]">{selectedForCurrent}</strong>
              </span>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#2B1A24] leading-relaxed">
              {currentQuestion.prompt}
            </h2>

            {currentQuestion.hasSpinnerDiagram && (
              <div className="flex justify-center py-4 bg-[#FAF6F8] border border-[#EFE3EA] rounded-xl">
                <CurvedSpinnerSvg needleAngle={-45} size={184} />
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3" role="radiogroup" aria-label={`Question ${currentQuestion.id} options`}>
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedForCurrent === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                    className={`w-full text-left px-5 py-4 rounded-xl border flex items-center gap-4 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#ddbfcf]/35 border-[#874e6d] text-[#2B1A24]'
                        : 'bg-[#FAF8F9] border-[#E6D5DF] text-[#2B1A24] hover:border-[#bc81a0] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg font-mono text-sm font-bold flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-[#874e6d] border-[#874e6d] text-white'
                          : 'bg-white border-[#D8C2CF] text-[#2B1A24]'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <div className="flex-1 min-h-7 flex items-center">
                      <OptionContent option={opt} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {confirmUnanswered && (
            <div
              role="alert"
              className="bg-[#FAF6F8] border border-[#bc81a0] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <p className="text-xs text-[#2B1A24]">
                You have{' '}
                <strong className="font-mono tabular-nums">
                  {totalCount - answeredCount}
                </strong>{' '}
                unanswered question(s). Would you like to submit anyway?
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmUnanswered(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#5E525A] hover:text-[#2B1A24] cursor-pointer"
                >
                  Review
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-md cursor-pointer"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="px-4 py-3 text-xs font-medium text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
            >
              {submitError}
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-[#F0E5EB]">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#2B1A24] bg-[#F3EAF0] hover:bg-[#ddbfcf] disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < totalCount - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.min(totalCount - 1, i + 1))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors cursor-pointer"
                >
                  Next Question
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
