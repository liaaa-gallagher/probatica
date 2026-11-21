import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import type { AuthUser, QuizSubmission } from '../types';
import { OptionContent } from './MathParts';

interface StudentResultsProps {
  user: AuthUser;
  refreshTrigger: number;
  onTakeQuiz: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function StudentResults({
  user,
  refreshTrigger,
  onTakeQuiz,
}: StudentResultsProps) {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [showExplanations, setShowExplanations] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/student/submissions/${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const list = (data.submissions || []) as QuizSubmission[];
        setSubmissions(list);
        setShowExplanations(Boolean(data.showExplanationsToStudents));
        if (list.length > 0 && !expandedId) {
          setExpandedId(list[0].id);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.id, refreshTrigger]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6D5DF] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#874e6d]">
            <span>Student Record</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{user.identifier}</span>
            <span aria-hidden="true">·</span>
            <span>{user.className || 'Grade 8'}</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2B1A24]">My Quiz Attempts</h1>
        </div>

        <button
          type="button"
          onClick={onTakeQuiz}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          New Quiz Attempt
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#5E525A]">Loading submission history...</p>
      ) : submissions.length === 0 ? (
        <section className="bg-white border border-[#E6D5DF] rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-bold text-[#2B1A24]">No Quiz Attempts Recorded Yet</h2>
          <p className="text-sm text-[#5E525A] max-w-md mx-auto">
            Complete the 12-question Empirical &amp; Theoretical Probability Quiz to view your
            score and answer breakdown here.
          </p>
          <button
            type="button"
            onClick={onTakeQuiz}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors cursor-pointer"
          >
            Start Quiz Now
          </button>
        </section>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub, idx) => {
            const isExpanded = expandedId === sub.id;
            return (
              <article
                key={sub.id}
                className="bg-white border border-[#E6D5DF] rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="w-full px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-left hover:bg-[#FAF6F8] transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#5E525A]">
                      <span className="font-mono font-semibold text-[#874e6d]">
                        Attempt #{submissions.length - idx}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(sub.submittedAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatDuration(sub.durationSeconds)}
                      </span>
                    </div>
                    <p className="text-base font-bold text-[#2B1A24] tabular-nums">
                      Score: {sub.scorePercent}% ({sub.correctCount} / {sub.totalQuestions} correct)
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-semibold ${
                        sub.scorePercent >= 75 ? 'text-[#065F46]' : 'text-[#991B1B]'
                      }`}
                    >
                      {sub.scorePercent >= 75 ? 'Passed' : 'Needs Review'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#5E525A]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#5E525A]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#F0E5EB] divide-y divide-[#F0E5EB]">
                    {sub.gradedAnswers.map((g) => {
                      const question = QUIZ_QUESTIONS.find((q) => q.id === g.questionId);
                      if (!question) return null;
                      const chosen = question.options.find((o) => o.key === g.selectedOption);
                      const right = question.options.find((o) => o.key === g.correctOption);

                      return (
                        <div key={g.questionId} className="py-4 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm font-medium text-[#2B1A24]">
                              <span className="font-mono font-semibold text-[#874e6d] mr-2">
                                Q{question.id}.
                              </span>
                              {question.prompt}
                            </p>
                            {g.isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#065F46] shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#991B1B] shrink-0">
                                <XCircle className="w-3.5 h-3.5" />
                                Incorrect
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-6 text-xs text-[#5E525A]">
                            <span className="inline-flex items-center gap-1.5">
                              Your choice:{' '}
                              {chosen ? (
                                <strong className="inline-flex items-center gap-1 text-[#2B1A24]">
                                  <span className="font-mono">{chosen.key}.</span>
                                  <OptionContent option={chosen} />
                                </strong>
                              ) : (
                                <strong className="text-[#991B1B]">None</strong>
                              )}
                            </span>
                            {showExplanations && right && (
                              <span className="inline-flex items-center gap-1.5">
                                Answer key:{' '}
                                <strong className="inline-flex items-center gap-1 text-[#065F46]">
                                  <span className="font-mono">{right.key}.</span>
                                  <OptionContent option={right} />
                                </strong>
                              </span>
                            )}
                          </div>

                          {showExplanations && g.explanation && (
                            <p className="text-xs text-[#5E525A] leading-relaxed">
                              {g.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
