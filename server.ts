import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { QUIZ_QUESTIONS } from './src/data/quizData.ts';
import type {
  AuthUser,
  GradedAnswer,
  OptionKey,
  QuestionAnalytics,
  QuizSubmission,
  TeacherOverview,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface StoredAccount {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  identifier: string;
  password: string;
  className?: string;
}

interface StoreSchema {
  accounts: StoredAccount[];
  submissions: QuizSubmission[];
  showExplanationsToStudents: boolean;
}

function buildSeededSubmission(
  id: string,
  studentId: string,
  studentName: string,
  studentIdentifier: string,
  className: string,
  answers: Record<number, OptionKey>,
  durationSeconds: number,
  submittedAt: string
): QuizSubmission {
  const gradedAnswers: GradedAnswer[] = QUIZ_QUESTIONS.map((q) => {
    const selectedOption = answers[q.id] ?? null;
    return {
      questionId: q.id,
      selectedOption,
      correctOption: q.correctAnswer,
      isCorrect: selectedOption === q.correctAnswer,
      explanation: q.explanation,
    };
  });
  const correctCount = gradedAnswers.filter((g) => g.isCorrect).length;
  const totalQuestions = QUIZ_QUESTIONS.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  return {
    id,
    studentId,
    studentName,
    studentIdentifier,
    className,
    answers,
    gradedAnswers,
    correctCount,
    totalQuestions,
    scorePercent,
    durationSeconds,
    submittedAt,
  };
}

function createInitialStore(): StoreSchema {
  const accounts: StoredAccount[] = [
    {
      id: 'stu-101',
      name: 'Maya Lin',
      role: 'student',
      identifier: 'STU-101',
      password: 'learn2026',
      className: 'Grade 8A',
    },
    {
      id: 'stu-102',
      name: 'Daniel Carter',
      role: 'student',
      identifier: 'STU-102',
      password: 'learn2026',
      className: 'Grade 8A',
    },
    {
      id: 'stu-103',
      name: 'Sofia Patel',
      role: 'student',
      identifier: 'STU-103',
      password: 'learn2026',
      className: 'Grade 8B',
    },
    {
      id: 'tch-01',
      name: 'Prof. Eleanor Vance',
      role: 'teacher',
      identifier: 'TCH-01',
      password: 'teach2026',
    },
  ];

  const submissions: QuizSubmission[] = [
    buildSeededSubmission(
      'sub-seed-1',
      'stu-102',
      'Daniel Carter',
      'STU-102',
      'Grade 8A',
      {
        1: 'A',
        2: 'B',
        3: 'B',
        4: 'B',
        5: 'B',
        6: 'C',
        7: 'C',
        8: 'C',
        9: 'D',
        10: 'B',
        11: 'A',
        12: 'B',
      },
      412,
      new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
    ),
    buildSeededSubmission(
      'sub-seed-2',
      'stu-103',
      'Sofia Patel',
      'STU-103',
      'Grade 8B',
      {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'B',
        5: 'A',
        6: 'C',
        7: 'B',
        8: 'C',
        9: 'D',
        10: 'C',
        11: 'A',
        12: 'B',
      },
      528,
      new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    ),
  ];

  return {
    accounts,
    submissions,
    showExplanationsToStudents: true,
  };
}

function readStore(): StoreSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial = createInitialStore();
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw) as StoreSchema;
  } catch {
    return createInitialStore();
  }
}

function writeStore(store: StoreSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function sanitizeUser(account: StoredAccount): AuthUser {
  return {
    id: account.id,
    name: account.name,
    role: account.role,
    identifier: account.identifier,
    className: account.className,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Student Login
  app.post('/api/auth/student-login', (req, res) => {
    const { identifier, password } = req.body as { identifier?: string; password?: string };
    if (!identifier || !password) {
      res.status(400).json({ error: 'Student ID and password are required.' });
      return;
    }
    const normalizedId = identifier.trim().toUpperCase();
    const store = readStore();
    const account = store.accounts.find(
      (a) =>
        a.role === 'student' &&
        (a.identifier.toUpperCase() === normalizedId || a.name.toLowerCase() === identifier.trim().toLowerCase()) &&
        a.password === password
    );

    if (!account) {
      res.status(401).json({ error: 'Invalid Student ID or password. Try STU-101 / learn2026.' });
      return;
    }

    res.json({ user: sanitizeUser(account) });
  });

  // Student Registration
  app.post('/api/auth/student-register', (req, res) => {
    const { name, identifier, password, className } = req.body as {
      name?: string;
      identifier?: string;
      password?: string;
      className?: string;
    };

    if (!name?.trim() || !identifier?.trim() || !password?.trim()) {
      res.status(400).json({ error: 'Full name, Student ID, and password are required.' });
      return;
    }

    const normalizedId = identifier.trim().toUpperCase();
    const store = readStore();
    const exists = store.accounts.some(
      (a) => a.identifier.toUpperCase() === normalizedId
    );
    if (exists) {
      res.status(409).json({ error: 'This Student ID is already registered. Please sign in.' });
      return;
    }

    const newAccount: StoredAccount = {
      id: `stu-${Date.now()}`,
      name: name.trim(),
      role: 'student',
      identifier: normalizedId,
      password: password.trim(),
      className: className?.trim() || 'Grade 8A',
    };

    store.accounts.push(newAccount);
    writeStore(store);

    res.status(201).json({ user: sanitizeUser(newAccount) });
  });

  // Teacher Login
  app.post('/api/auth/teacher-login', (req, res) => {
    const { identifier, password } = req.body as { identifier?: string; password?: string };
    if (!identifier || !password) {
      res.status(400).json({ error: 'Teacher ID and passcode are required.' });
      return;
    }

    const normalizedId = identifier.trim().toUpperCase();
    const store = readStore();
    const account = store.accounts.find(
      (a) =>
        a.role === 'teacher' &&
        (a.identifier.toUpperCase() === normalizedId || a.name.toLowerCase() === identifier.trim().toLowerCase()) &&
        a.password === password
    );

    if (!account) {
      res.status(401).json({ error: 'Invalid Teacher ID or passcode. Try TCH-01 / teach2026.' });
      return;
    }

    res.json({ user: sanitizeUser(account) });
  });

  // Public Quiz Questions (no answer key exposed during active student quiz)
  app.get('/api/quiz/questions', (_req, res) => {
    const store = readStore();
    const publicQuestions = QUIZ_QUESTIONS.map(({ correctAnswer: _c, explanation: _e, ...rest }) => rest);
    res.json({
      questions: publicQuestions,
      showExplanationsToStudents: store.showExplanationsToStudents,
    });
  });

  // Full Answer Key (for teacher portal)
  app.get('/api/teacher/questions', (_req, res) => {
    const store = readStore();
    res.json({
      questions: QUIZ_QUESTIONS,
      showExplanationsToStudents: store.showExplanationsToStudents,
    });
  });

  // Toggle explanation visibility setting for students
  app.post('/api/teacher/settings', (req, res) => {
    const { showExplanationsToStudents } = req.body as { showExplanationsToStudents?: boolean };
    const store = readStore();
    if (typeof showExplanationsToStudents === 'boolean') {
      store.showExplanationsToStudents = showExplanationsToStudents;
      writeStore(store);
    }
    res.json({ showExplanationsToStudents: store.showExplanationsToStudents });
  });

  // Submit Student Quiz
  app.post('/api/quiz/submit', (req, res) => {
    const { studentId, answers, durationSeconds } = req.body as {
      studentId?: string;
      answers?: Record<number, OptionKey>;
      durationSeconds?: number;
    };

    if (!studentId || !answers) {
      res.status(400).json({ error: 'Student ID and answers are required.' });
      return;
    }

    const store = readStore();
    const student = store.accounts.find((a) => a.id === studentId && a.role === 'student');
    if (!student) {
      res.status(404).json({ error: 'Student account not found.' });
      return;
    }

    const submission = buildSeededSubmission(
      `sub-${Date.now()}`,
      student.id,
      student.name,
      student.identifier,
      student.className || 'Grade 8A',
      answers,
      Math.max(1, Math.round(durationSeconds || 0)),
      new Date().toISOString()
    );

    store.submissions.unshift(submission);
    writeStore(store);

    res.status(201).json({
      submission,
      showExplanationsToStudents: store.showExplanationsToStudents,
    });
  });

  // Student Submission History
  app.get('/api/student/submissions/:studentId', (req, res) => {
    const store = readStore();
    const studentSubs = store.submissions.filter((s) => s.studentId === req.params.studentId);
    res.json({
      submissions: studentSubs,
      showExplanationsToStudents: store.showExplanationsToStudents,
    });
  });

  // Teacher Dashboard Overview & Analytics
  app.get('/api/teacher/overview', (_req, res) => {
    const store = readStore();
    const subs = store.submissions;
    const totalSubmissions = subs.length;
    const averageScore =
      totalSubmissions > 0
        ? Math.round(subs.reduce((acc, s) => acc + s.scorePercent, 0) / totalSubmissions)
        : 0;
    const highestScore =
      totalSubmissions > 0 ? Math.max(...subs.map((s) => s.scorePercent)) : 0;
    const passingCount = subs.filter((s) => s.scorePercent >= 75).length;
    const passRatePercent =
      totalSubmissions > 0 ? Math.round((passingCount / totalSubmissions) * 100) : 0;

    const questionAnalytics: QuestionAnalytics[] = QUIZ_QUESTIONS.map((q) => {
      const relevant = subs
        .map((s) => s.gradedAnswers.find((g) => g.questionId === q.id))
        .filter((g): g is GradedAnswer => Boolean(g));
      const correctCount = relevant.filter((g) => g.isCorrect).length;
      const totalAttempts = relevant.length;
      const accuracyPercent =
        totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
      return {
        questionId: q.id,
        prompt: q.prompt,
        topic: q.topic,
        correctCount,
        totalAttempts,
        accuracyPercent,
      };
    });

    const overview: TeacherOverview = {
      totalSubmissions,
      averageScore,
      highestScore,
      passRatePercent,
      submissions: subs,
      questionAnalytics,
      showExplanationsToStudents: store.showExplanationsToStudents,
    };

    res.json(overview);
  });

  // Delete a submission (Teacher)
  app.delete('/api/teacher/submissions/:id', (req, res) => {
    const store = readStore();
    const before = store.submissions.length;
    store.submissions = store.submissions.filter((s) => s.id !== req.params.id);
    if (store.submissions.length === before) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }
    writeStore(store);
    res.json({ deleted: true });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Probatica server running at http://localhost:${PORT}`);
  });
}

startServer();
