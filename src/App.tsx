import React, { useEffect, useState } from 'react';
import { AuthPortal } from './components/AuthPortal';
import { ConceptLab } from './components/ConceptLab';
import { StudentQuiz } from './components/StudentQuiz';
import { StudentResults } from './components/StudentResults';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TopBar, type StudentTab, type TeacherTab } from './components/TopBar';
import type { AuthUser, UserRole } from './types';

const SESSION_STORAGE_KEY = 'probatica_auth_user';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [authRole, setAuthRole] = useState<UserRole>('student');
  const [studentTab, setStudentTab] = useState<StudentTab>('lab');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('overview');
  const [resultsRefreshTrigger, setResultsRefreshTrigger] = useState(0);

  useEffect(() => {
    try {
      if (user) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access restrictions
    }
  }, [user]);

  const handleAuthenticated = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    setStudentTab('lab');
    setTeacherTab('overview');
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F9] text-[#1F191E]">
      <TopBar
        user={user}
        studentTab={studentTab}
        teacherTab={teacherTab}
        onSelectStudentTab={setStudentTab}
        onSelectTeacherTab={setTeacherTab}
        onAuthPortalSelect={(role) => setAuthRole(role)}
        onLogout={handleLogout}
      />

      <div className="flex-1">
        {!user && (
          <AuthPortal
            selectedRole={authRole}
            onRoleChange={setAuthRole}
            onAuthenticated={handleAuthenticated}
          />
        )}

        {user?.role === 'student' && studentTab === 'lab' && (
          <ConceptLab
            studentName={user.name}
            onStartQuiz={() => setStudentTab('quiz')}
          />
        )}

        {user?.role === 'student' && studentTab === 'quiz' && (
          <StudentQuiz
            user={user}
            onSubmissionComplete={() => setResultsRefreshTrigger((n) => n + 1)}
            onBackToLab={() => setStudentTab('lab')}
          />
        )}

        {user?.role === 'student' && studentTab === 'results' && (
          <StudentResults
            user={user}
            refreshTrigger={resultsRefreshTrigger}
            onTakeQuiz={() => setStudentTab('quiz')}
          />
        )}

        {user?.role === 'teacher' && (
          <TeacherDashboard user={user} activeTab={teacherTab} />
        )}
      </div>

      <footer className="border-t border-[#E6D5DF] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5E525A]">
          <span>Probatica · Empirical &amp; Theoretical Probability Learning Module</span>
          <span>12-Item Assessment Portal</span>
        </div>
      </footer>
    </div>
  );
}
