import React, { useState } from 'react';
import { ArrowRight, BookOpen, Eye, EyeOff, GraduationCap, Lock, RotateCw, User } from 'lucide-react';
import type { AuthUser, UserRole } from '../types';
import { CurvedSpinnerSvg } from './MathParts';

interface AuthPortalProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onAuthenticated: (user: AuthUser) => void;
}

export function AuthPortal({
  selectedRole,
  onRoleChange,
  onAuthenticated,
}: AuthPortalProps) {
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('Grade 8A');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive spinner preview state on left educational column
  const [previewAngle, setPreviewAngle] = useState(-45);
  const [previewOutcome, setPreviewOutcome] = useState<'Yellow' | 'Green'>('Yellow');

  const handleSpinPreview = () => {
    const extraTurns = 720 + Math.floor(Math.random() * 360);
    const nextAngle = previewAngle + extraTurns;
    setPreviewAngle(nextAngle);
    const normalized = ((nextAngle % 360) + 360) % 360;
    setPreviewOutcome(normalized >= 90 && normalized < 270 ? 'Green' : 'Yellow');
  };

  const handleRoleSwitch = (role: UserRole) => {
    onRoleChange(role);
    setError(null);
    setIdentifier('');
    setPassword('');
    setFullName('');
    setStudentMode('login');
  };

  const fillDemoCredentials = () => {
    setError(null);
    if (selectedRole === 'student') {
      setStudentMode('login');
      setIdentifier('STU-101');
      setPassword('learn2026');
    } else {
      setIdentifier('TCH-01');
      setPassword('teach2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint =
        selectedRole === 'teacher'
          ? '/api/auth/teacher-login'
          : studentMode === 'register'
            ? '/api/auth/student-register'
            : '/api/auth/student-login';

      const payload =
        selectedRole === 'student' && studentMode === 'register'
          ? { name: fullName, identifier, password, className }
          : { identifier, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      onAuthenticated(data.user as AuthUser);
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* Left Column: Editorial Introduction & Interactive Module Preview */}
        <section className="lg:col-span-7 flex flex-col justify-between space-y-10">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#874e6d]">
              <span>Mathematics Module</span>
              <span aria-hidden="true">·</span>
              <span>Grade 8 Probability</span>
              <span aria-hidden="true">·</span>
              <span>12 Quiz Items</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#2B1A24] leading-[1.15]">
              Empirical &amp; Theoretical Probability Learning Portal
            </h1>

            <p className="text-base text-[#5E525A] leading-relaxed max-w-xl">
              Explore interactive coin toss, spinner, and dice experiments before completing the
              12-question probability assessment. Students receive immediate feedback; teachers track
              class mastery and item-level accuracy.
            </p>
          </div>

          {/* Interactive Concept Preview Panel */}
          <div
            id="preview"
            className="bg-white border border-[#E6D5DF] rounded-xl p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center"
          >
            <div className="sm:col-span-5 flex flex-col items-center justify-center bg-[#FAF6F8] border border-[#EFE3EA] rounded-lg py-5 px-4">
              <CurvedSpinnerSvg needleAngle={previewAngle} size={156} />
            </div>

            <div className="sm:col-span-7 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#874e6d]">
                  Interactive Concept Preview · Fair Partition
                </p>
                <h2 className="text-lg font-semibold text-[#2B1A24]">
                  Equal Area Equals Fair Probability
                </h2>
                <p className="text-sm text-[#5E525A] leading-relaxed">
                  Even with a curved boundary, both sectors divide the same circle into two
                  congruent halves—giving each outcome an equal theoretical probability of 1/2.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0E5EB]">
                <div className="text-xs text-[#5E525A]">
                  Last pointer sector:{' '}
                  <span className="font-mono font-semibold text-[#2B1A24]">{previewOutcome}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSpinPreview}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#2B1A24] bg-[#ddbfcf]/55 hover:bg-[#ddbfcf] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Spin Preview
                </button>
              </div>
            </div>
          </div>

          {/* Curriculum Summary Strip */}
          <div id="curriculum" className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5 border-t border-[#E6D5DF] pt-4">
              <p className="text-xs font-mono font-semibold text-[#874e6d]">01. Empirical Trials</p>
              <p className="text-sm font-semibold text-[#2B1A24]">Coin Toss Frequencies</p>
              <p className="text-xs text-[#5E525A] leading-relaxed">
                Compute experimental ratios from 20 and 60 trial outcomes.
              </p>
            </div>
            <div className="space-y-1.5 border-t border-[#E6D5DF] pt-4">
              <p className="text-xs font-mono font-semibold text-[#874e6d]">02. Fairness &amp; Sets</p>
              <p className="text-sm font-semibold text-[#2B1A24]">Spinners &amp; Sample Spaces</p>
              <p className="text-xs text-[#5E525A] leading-relaxed">
                Identify prime and even outcomes across 12-part equal wheels.
              </p>
            </div>
            <div className="space-y-1.5 border-t border-[#E6D5DF] pt-4">
              <p className="text-xs font-mono font-semibold text-[#874e6d]">03. Probability Bounds</p>
              <p className="text-sm font-semibold text-[#2B1A24]">Impossible to Certain</p>
              <p className="text-xs text-[#5E525A] leading-relaxed">
                Verify why every event probability lies between 0 and 1 inclusive.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Student & Teacher Login Card */}
        <section className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-white border border-[#E6D5DF] rounded-xl p-8 space-y-6">
            {/* Role Switcher */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#5E525A]">Select Portal</p>
              <div
                className="grid grid-cols-2 gap-1 p-1 bg-[#F3EAF0] rounded-lg"
                role="tablist"
                aria-label="Login portal selector"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedRole === 'student'}
                  onClick={() => handleRoleSwitch('student')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedRole === 'student'
                      ? 'bg-white text-[#2B1A24] shadow-xs'
                      : 'text-[#5E525A] hover:text-[#2B1A24]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-[#874e6d]" />
                  Student Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedRole === 'teacher'}
                  onClick={() => handleRoleSwitch('teacher')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedRole === 'teacher'
                      ? 'bg-white text-[#2B1A24] shadow-xs'
                      : 'text-[#5E525A] hover:text-[#2B1A24]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#874e6d]" />
                  Teacher Login
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#2B1A24]">
                {selectedRole === 'teacher'
                  ? 'Sign in to Teacher Portal'
                  : studentMode === 'register'
                    ? 'Register Student Account'
                    : 'Sign in to Student Portal'}
              </h2>
              <p className="text-sm text-[#5E525A]">
                {selectedRole === 'teacher'
                  ? 'Access class analytics, student submissions, and official answer keys.'
                  : studentMode === 'register'
                    ? 'Create your student profile to start the probability quiz.'
                    : 'Enter your Student ID to access the Concept Lab and 12-question quiz.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedRole === 'student' && studentMode === 'register' && (
                <>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-semibold text-[#2B1A24]"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F9] border border-[#E6D5DF] rounded-lg focus:outline-none focus:border-[#bc81a0] focus:ring-2 focus:ring-[#ddbfcf]/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="className"
                      className="block text-xs font-semibold text-[#2B1A24]"
                    >
                      Class / Section
                    </label>
                    <input
                      id="className"
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g. Grade 8A"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F9] border border-[#E6D5DF] rounded-lg focus:outline-none focus:border-[#bc81a0] focus:ring-2 focus:ring-[#ddbfcf]/60"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="identifier"
                  className="block text-xs font-semibold text-[#2B1A24]"
                >
                  {selectedRole === 'teacher' ? 'Teacher ID' : 'Student ID'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#874e6d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={selectedRole === 'teacher' ? 'e.g. TCH-01' : 'e.g. STU-101'}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAF8F9] border border-[#E6D5DF] rounded-lg focus:outline-none focus:border-[#bc81a0] focus:ring-2 focus:ring-[#ddbfcf]/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#2B1A24]"
                >
                  {selectedRole === 'teacher' ? 'Teacher Passcode' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#874e6d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FAF8F9] border border-[#E6D5DF] rounded-lg focus:outline-none focus:border-[#bc81a0] focus:ring-2 focus:ring-[#ddbfcf]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E525A] hover:text-[#2B1A24] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="px-3.5 py-2.5 text-xs font-medium text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                <span>
                  {loading
                    ? 'Signing in...'
                    : selectedRole === 'teacher'
                      ? 'Sign In as Teacher'
                      : studentMode === 'register'
                        ? 'Create Account & Continue'
                        : 'Sign In as Student'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo Credentials Helper & Registration Toggle */}
            <div className="pt-4 border-t border-[#F0E5EB] space-y-3">
              <div className="flex items-center justify-between gap-3 bg-[#FAF6F8] border border-[#EFE3EA] rounded-lg px-3.5 py-2.5">
                <div className="text-xs text-[#5E525A]">
                  <span className="font-semibold text-[#2B1A24]">Demo Account: </span>
                  <span className="font-mono">
                    {selectedRole === 'teacher' ? 'TCH-01 / teach2026' : 'STU-101 / learn2026'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-xs font-semibold text-[#874e6d] hover:text-[#6e3d58] underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Fill Demo
                </button>
              </div>

              {selectedRole === 'student' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStudentMode((m) => (m === 'login' ? 'register' : 'login'));
                    }}
                    className="text-xs font-medium text-[#5E525A] hover:text-[#874e6d] underline underline-offset-2 cursor-pointer"
                  >
                    {studentMode === 'login'
                      ? 'New student? Register your Student ID'
                      : 'Already registered? Sign in here'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
