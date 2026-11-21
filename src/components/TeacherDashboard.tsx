import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import type { AuthUser, QuizQuestion, QuizSubmission, TeacherOverview } from '../types';
import { CurvedSpinnerSvg, OptionContent } from './MathParts';
import type { TeacherTab } from './TopBar';

interface TeacherDashboardProps {
  user: AuthUser;
  activeTab: TeacherTab;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function TeacherDashboard({ user, activeTab }: TeacherDashboardProps) {
  const [overview, setOverview] = useState<TeacherOverview | null>(null);
  const [answerBank, setAnswerBank] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [inspectedSubmission, setInspectedSubmission] = useState<QuizSubmission | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [savingSetting, setSavingSetting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, bankRes] = await Promise.all([
        fetch('/api/teacher/overview'),
        fetch('/api/teacher/questions'),
      ]);
      const overviewData = (await overviewRes.json()) as TeacherOverview;
      const bankData = await bankRes.json();
      setOverview(overviewData);
      if (bankData.questions) {
        setAnswerBank(bankData.questions as QuizQuestion[]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uniqueClasses = useMemo(() => {
    if (!overview) return [];
    const set = new Set(overview.submissions.map((s) => s.className));
    return ['ALL', ...Array.from(set)];
  }, [overview]);

  const filteredSubmissions = useMemo(() => {
    if (!overview) return [];
    return overview.submissions.filter((sub) => {
      const matchesClass = classFilter === 'ALL' || sub.className === classFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        sub.studentName.toLowerCase().includes(q) ||
        sub.studentIdentifier.toLowerCase().includes(q);
      return matchesClass && matchesSearch;
    });
  }, [overview, classFilter, searchQuery]);

  const handleToggleExplanations = async () => {
    if (!overview) return;
    setSavingSetting(true);
    const nextValue = !overview.showExplanationsToStudents;
    try {
      const res = await fetch('/api/teacher/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showExplanationsToStudents: nextValue }),
      });
      const data = await res.json();
      setOverview((prev) =>
        prev
          ? { ...prev, showExplanationsToStudents: Boolean(data.showExplanationsToStudents) }
          : prev
      );
    } finally {
      setSavingSetting(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    const res = await fetch(`/api/teacher/submissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPendingDeleteId(null);
      if (inspectedSubmission?.id === id) {
        setInspectedSubmission(null);
      }
      await loadData();
    }
  };

  const handleExportCsv = () => {
    if (!overview) return;
    const headers = [
      'Student Name',
      'Student ID',
      'Class',
      'Score (%)',
      'Correct Count',
      'Total Questions',
      'Duration (s)',
      'Submitted At',
    ];
    const rows = filteredSubmissions.map((s) => [
      `"${s.studentName.replace(/"/g, '""')}"`,
      s.studentIdentifier,
      `"${s.className.replace(/"/g, '""')}"`,
      s.scorePercent,
      s.correctCount,
      s.totalQuestions,
      s.durationSeconds,
      s.submittedAt,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'probability_quiz_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading || !overview) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[#5E525A]">Loading teacher analytics...</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6D5DF] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#874e6d]">
            <span>Teacher Portal</span>
            <span aria-hidden="true">·</span>
            <span>{user.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{user.identifier}</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2B1A24]">
            {activeTab === 'overview'
              ? 'Class Probability Assessment Overview'
              : 'Official Answer Key & Quiz Settings'}
          </h1>
        </div>

        {activeTab === 'overview' && (
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredSubmissions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#2B1A24] bg-[#F3EAF0] hover:bg-[#ddbfcf] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        )}
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* 4-Column KPI Strip */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-1">
              <p className="text-xs font-medium text-[#5E525A]">Class Average</p>
              <p className="text-3xl font-bold font-mono tabular-nums text-[#874e6d]">
                {overview.averageScore}%
              </p>
              <p className="text-xs text-[#5E525A]">Across all submitted attempts</p>
            </div>

            <div className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-1">
              <p className="text-xs font-medium text-[#5E525A]">Total Submissions</p>
              <p className="text-3xl font-bold font-mono tabular-nums text-[#2B1A24]">
                {overview.totalSubmissions}
              </p>
              <p className="text-xs text-[#5E525A]">Completed 12-item quizzes</p>
            </div>

            <div className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-1">
              <p className="text-xs font-medium text-[#5E525A]">Highest Score</p>
              <p className="text-3xl font-bold font-mono tabular-nums text-[#2B1A24]">
                {overview.highestScore}%
              </p>
              <p className="text-xs text-[#5E525A]">Top recorded student score</p>
            </div>

            <div className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-1">
              <p className="text-xs font-medium text-[#5E525A]">Pass Rate (≥ 75%)</p>
              <p className="text-3xl font-bold font-mono tabular-nums text-[#2B1A24]">
                {overview.passRatePercent}%
              </p>
              <p className="text-xs text-[#5E525A]">Students meeting mastery threshold</p>
            </div>
          </section>

          {/* Student Submissions Table */}
          <section className="bg-white border border-[#E6D5DF] rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#F0E5EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#2B1A24]">Student Submissions</h2>
                <p className="text-xs text-[#5E525A]">
                  Inspect individual answer sheets or filter by class section.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#5E525A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student name or ID..."
                    className="pl-8 pr-3 py-2 text-xs bg-[#FAF8F9] border border-[#E6D5DF] rounded-lg focus:outline-none focus:border-[#bc81a0]"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#F3EAF0] rounded-lg">
                  {uniqueClasses.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassFilter(cls)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        classFilter === cls
                          ? 'bg-white text-[#2B1A24] shadow-xs'
                          : 'text-[#5E525A] hover:text-[#2B1A24]'
                      }`}
                    >
                      {cls === 'ALL' ? 'All Classes' : cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#5E525A]">
                No student quiz submissions match your current filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6D5DF] bg-[#FAF6F8] text-xs font-semibold text-[#5E525A]">
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Class</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4">Correct</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Submitted</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E5EB] text-sm">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#FAF6F8]/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-[#2B1A24]">
                          {sub.studentName}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-[#5E525A]">
                          {sub.studentIdentifier}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#5E525A]">{sub.className}</td>
                        <td className="py-4 px-4 font-mono font-bold tabular-nums text-[#874e6d]">
                          {sub.scorePercent}%
                        </td>
                        <td className="py-4 px-4 font-mono text-xs tabular-nums text-[#2B1A24]">
                          {sub.correctCount} / {sub.totalQuestions}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs tabular-nums text-[#5E525A]">
                          {formatDuration(sub.durationSeconds)}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#5E525A]">
                          {formatDate(sub.submittedAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {pendingDeleteId === sub.id ? (
                            <div className="inline-flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleDeleteSubmission(sub.id)}
                                className="font-semibold text-[#991B1B] hover:underline cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDeleteId(null)}
                                className="text-[#5E525A] hover:text-[#2B1A24] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setInspectedSubmission(sub)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#874e6d] hover:text-[#6e3d58] cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDeleteId(sub.id)}
                                aria-label={`Delete submission for ${sub.studentName}`}
                                className="text-[#5E525A] hover:text-[#991B1B] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Question-by-Question Item Analysis */}
          <section className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#F0E5EB] pb-4">
              <h2 className="text-lg font-bold text-[#2B1A24]">Question-by-Question Accuracy</h2>
              <p className="text-xs text-[#5E525A]">
                Identify specific probability concepts where students need extra review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {overview.questionAnalytics.map((item) => (
                <div key={item.questionId} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-4 text-xs">
                    <span className="font-semibold text-[#2B1A24] truncate">
                      <span className="font-mono text-[#874e6d] mr-1.5">
                        Q{item.questionId}.
                      </span>
                      {item.prompt}
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-[#2B1A24] shrink-0">
                      {item.accuracyPercent}% ({item.correctCount}/{item.totalAttempts})
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#ddbfcf]/35 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#bc81a0] transition-all duration-300"
                      style={{ width: `${item.accuracyPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Answer Key & Settings Tab */
        <div className="space-y-6">
          <section className="bg-white border border-[#E6D5DF] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#2B1A24]">
                Student Post-Quiz Explanation Visibility
              </h2>
              <p className="text-xs text-[#5E525A]">
                Control whether students immediately see the answer key and step-by-step
                explanations after submitting their quiz.
              </p>
            </div>

            <button
              type="button"
              disabled={savingSetting}
              onClick={handleToggleExplanations}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                overview.showExplanationsToStudents
                  ? 'bg-[#874e6d] text-white hover:bg-[#6e3d58]'
                  : 'bg-[#F3EAF0] text-[#2B1A24] hover:bg-[#ddbfcf]'
              }`}
            >
              {overview.showExplanationsToStudents
                ? 'Explanations: Visible to Students'
                : 'Explanations: Hidden from Students'}
            </button>
          </section>

          <section className="space-y-4">
            {answerBank.map((q) => (
              <article
                key={q.id}
                className="bg-white border border-[#E6D5DF] rounded-xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#874e6d] font-medium">
                      <span className="font-mono font-semibold">Question {q.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.topic}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#2B1A24]">{q.prompt}</h3>
                  </div>

                  <span className="font-mono text-xs font-bold text-[#065F46] shrink-0">
                    Answer Key: {q.correctAnswer}
                  </span>
                </div>

                {q.hasSpinnerDiagram && (
                  <div className="py-2">
                    <CurvedSpinnerSvg size={136} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {q.options.map((opt) => {
                    const isKey = opt.key === q.correctAnswer;
                    return (
                      <div
                        key={opt.key}
                        className={`px-3.5 py-2.5 rounded-lg border flex items-center gap-2.5 text-sm ${
                          isKey
                            ? 'bg-[#ddbfcf]/35 border-[#874e6d] font-semibold text-[#2B1A24]'
                            : 'bg-[#FAF8F9] border-[#E6D5DF] text-[#5E525A]'
                        }`}
                      >
                        <span className="font-mono font-bold text-xs">{opt.key}.</span>
                        <OptionContent option={opt} />
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-[#5E525A] bg-[#FAF6F8] border border-[#EFE3EA] rounded-lg px-4 py-3 leading-relaxed">
                  <span className="font-semibold text-[#2B1A24]">Solution: </span>
                  {q.explanation}
                </p>
              </article>
            ))}
          </section>
        </div>
      )}

      {/* Submission Inspector Modal */}
      {inspectedSubmission && (
        <div
          className="fixed inset-0 z-50 bg-[#2B1A24]/45 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Submission details for ${inspectedSubmission.studentName}`}
        >
          <div className="bg-white border border-[#E6D5DF] rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E6D5DF] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2B1A24]">
                  {inspectedSubmission.studentName} · {inspectedSubmission.scorePercent}%
                </h3>
                <p className="text-xs text-[#5E525A]">
                  <span className="font-mono">{inspectedSubmission.studentIdentifier}</span> ·{' '}
                  {inspectedSubmission.className} ·{' '}
                  {inspectedSubmission.correctCount}/{inspectedSubmission.totalQuestions} correct
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedSubmission(null)}
                aria-label="Close submission details"
                className="p-2 text-[#5E525A] hover:text-[#2B1A24] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto divide-y divide-[#F0E5EB]">
              {inspectedSubmission.gradedAnswers.map((g) => {
                const q = answerBank.find((item) => item.id === g.questionId);
                if (!q) return null;
                const chosen = q.options.find((o) => o.key === g.selectedOption);
                const correct = q.options.find((o) => o.key === g.correctOption);

                return (
                  <div key={g.questionId} className="py-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-[#2B1A24]">
                        <span className="font-mono text-[#874e6d] mr-1.5">Q{q.id}.</span>
                        {q.prompt}
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
                        Student Answer:{' '}
                        <strong className="inline-flex items-center gap-1 text-[#2B1A24]">
                          {chosen ? (
                            <>
                              <span className="font-mono">{chosen.key}.</span>
                              <OptionContent option={chosen} />
                            </>
                          ) : (
                            'Unanswered'
                          )}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        Correct Key:{' '}
                        <strong className="inline-flex items-center gap-1 text-[#065F46]">
                          {correct && (
                            <>
                              <span className="font-mono">{correct.key}.</span>
                              <OptionContent option={correct} />
                            </>
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
