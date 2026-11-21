export type UserRole = 'student' | 'teacher';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  identifier: string; // Student ID (e.g., STU-101) or Teacher ID/Email
  className?: string; // e.g., "Grade 8A"
}

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface FractionValue {
  numerator: number;
  denominator: number;
}

export interface QuizOption {
  key: OptionKey;
  label?: string;
  fraction?: FractionValue;
}

export type QuestionTopic = 'Empirical Probability' | 'Theoretical Probability' | 'Sample Space & Fairness';

export interface QuizQuestion {
  id: number;
  topic: QuestionTopic;
  prompt: string;
  hasSpinnerDiagram?: boolean;
  options: QuizOption[];
  correctAnswer: OptionKey;
  explanation: string;
}

export type PublicQuizQuestion = Omit<QuizQuestion, 'correctAnswer' | 'explanation'>;

export interface GradedAnswer {
  questionId: number;
  selectedOption: OptionKey | null;
  correctOption: OptionKey;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentIdentifier: string;
  className: string;
  answers: Record<number, OptionKey>;
  gradedAnswers: GradedAnswer[];
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  durationSeconds: number;
  submittedAt: string;
}

export interface QuestionAnalytics {
  questionId: number;
  prompt: string;
  topic: QuestionTopic;
  correctCount: number;
  totalAttempts: number;
  accuracyPercent: number;
}

export interface TeacherOverview {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  passRatePercent: number;
  submissions: QuizSubmission[];
  questionAnalytics: QuestionAnalytics[];
  showExplanationsToStudents: boolean;
}
