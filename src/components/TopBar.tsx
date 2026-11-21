import React from 'react';
import type { AuthUser } from '../types';

export type StudentTab = 'lab' | 'quiz' | 'results';
export type TeacherTab = 'overview' | 'bank';

interface TopBarProps {
  user: AuthUser | null;
  studentTab?: StudentTab;
  teacherTab?: TeacherTab;
  onSelectStudentTab?: (tab: StudentTab) => void;
  onSelectTeacherTab?: (tab: TeacherTab) => void;
  onAuthPortalSelect?: (role: 'student' | 'teacher') => void;
  onLogout?: () => void;
}

export function TopBar({
  user,
  studentTab,
  teacherTab,
  onSelectStudentTab,
  onSelectTeacherTab,
  onAuthPortalSelect,
  onLogout,
}: TopBarProps) {
  return (
    <header className="w-full bg-white border-b border-[#E6D5DF]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <span className="text-lg font-bold tracking-tight text-[#2B1A24] whitespace-nowrap shrink-0">
          Probatica
        </span>

        {/* Zone 2: Clean single-line text navigation links */}
        {!user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5E525A]">
            <a
              href="#curriculum"
              className="hover:text-[#874e6d] transition-colors whitespace-nowrap shrink-0"
            >
              Curriculum
            </a>
            <a
              href="#preview"
              className="hover:text-[#874e6d] transition-colors whitespace-nowrap shrink-0"
            >
              Interactive Preview
            </a>
            <button
              type="button"
              onClick={() => onAuthPortalSelect?.('student')}
              className="hover:text-[#874e6d] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => onAuthPortalSelect?.('teacher')}
              className="hover:text-[#874e6d] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Teacher Login
            </button>
          </nav>
        )}

        {user?.role === 'student' && (
          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => onSelectStudentTab?.('lab')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                studentTab === 'lab'
                  ? 'border-[#bc81a0] text-[#2B1A24] font-semibold'
                  : 'border-transparent text-[#5E525A] hover:text-[#2B1A24]'
              }`}
            >
              Concept Lab
            </button>
            <button
              type="button"
              onClick={() => onSelectStudentTab?.('quiz')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                studentTab === 'quiz'
                  ? 'border-[#bc81a0] text-[#2B1A24] font-semibold'
                  : 'border-transparent text-[#5E525A] hover:text-[#2B1A24]'
              }`}
            >
              Probability Quiz
            </button>
            <button
              type="button"
              onClick={() => onSelectStudentTab?.('results')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                studentTab === 'results'
                  ? 'border-[#bc81a0] text-[#2B1A24] font-semibold'
                  : 'border-transparent text-[#5E525A] hover:text-[#2B1A24]'
              }`}
            >
              My Results
            </button>
          </nav>
        )}

        {user?.role === 'teacher' && (
          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => onSelectTeacherTab?.('overview')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                teacherTab === 'overview'
                  ? 'border-[#bc81a0] text-[#2B1A24] font-semibold'
                  : 'border-transparent text-[#5E525A] hover:text-[#2B1A24]'
              }`}
            >
              Class Overview
            </button>
            <button
              type="button"
              onClick={() => onSelectTeacherTab?.('bank')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                teacherTab === 'bank'
                  ? 'border-[#bc81a0] text-[#2B1A24] font-semibold'
                  : 'border-transparent text-[#5E525A] hover:text-[#2B1A24]'
              }`}
            >
              Answer Key
            </button>
          </nav>
        )}

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAuthPortalSelect?.('student')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start Learning
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
