import React, { useState } from 'react';
import { ArrowRight, Dices, RotateCcw, RotateCw } from 'lucide-react';
import { Fraction, TwelvePartSpinnerSvg } from './MathParts';

type ExperimentMode = 'coin' | 'spinner12' | 'die';

interface ConceptLabProps {
  studentName: string;
  onStartQuiz: () => void;
}

export function ConceptLab({ studentName, onStartQuiz }: ConceptLabProps) {
  const [mode, setMode] = useState<ExperimentMode>('coin');

  // 1. Coin Toss Experiment state
  const [headsCount, setHeadsCount] = useState(28);
  const [tailsCount, setTailsCount] = useState(32);
  const [lastFlip, setLastFlip] = useState<'Heads (H)' | 'Tails (T)'>('Tails (T)');

  const totalTosses = headsCount + tailsCount;
  const empiricalHeadsPct = totalTosses > 0 ? ((headsCount / totalTosses) * 100).toFixed(1) : '0.0';
  const empiricalTailsPct = totalTosses > 0 ? ((tailsCount / totalTosses) * 100).toFixed(1) : '0.0';

  const tossCoins = (times: number) => {
    let h = 0;
    let t = 0;
    let latest: 'Heads (H)' | 'Tails (T)' = lastFlip;
    for (let i = 0; i < times; i++) {
      if (Math.random() < 0.5) {
        h++;
        latest = 'Heads (H)';
      } else {
        t++;
        latest = 'Tails (T)';
      }
    }
    setHeadsCount((prev) => prev + h);
    setTailsCount((prev) => prev + t);
    setLastFlip(latest);
  };

  const resetCoins = () => {
    setHeadsCount(0);
    setTailsCount(0);
  };

  // 2. 12-Part Spinner state
  const [spinnerRule, setSpinnerRule] = useState<'none' | 'even' | 'prime'>('prime');
  const [spinnerAngle, setSpinnerAngle] = useState(15);
  const [spunNumber, setSpunNumber] = useState<number>(7);

  const spinTwelvePart = () => {
    const chosen = Math.floor(Math.random() * 12) + 1;
    const baseTarget = (chosen - 1) * 30 + 15;
    const currentCycles = Math.floor(spinnerAngle / 360) * 360;
    const nextAngle = currentCycles + 1080 + baseTarget;
    setSpinnerAngle(nextAngle);
    setSpunNumber(chosen);
  };

  // 3. Six-Sided Die state
  const [dieFace, setDieFace] = useState<number>(3);
  const [dieRule, setDieRule] = useState<'prime' | 'odd' | 'seven'>('prime');
  const [dieHistory, setDieHistory] = useState<number[]>([2, 5, 3]);

  const rollDie = () => {
    const rolled = Math.floor(Math.random() * 6) + 1;
    setDieFace(rolled);
    setDieHistory((prev) => [rolled, ...prev].slice(0, 8));
  };

  const dieFaces = [1, 2, 3, 4, 5, 6];
  const isDieOutcomeMatch = (n: number) => {
    if (dieRule === 'prime') return [2, 3, 5].includes(n);
    if (dieRule === 'odd') return [1, 3, 5].includes(n);
    return false; // 7 never appears on a standard 1-6 die
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E6D5DF] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#874e6d]">
            <span>Student Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Welcome, {studentName}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2B1A24]">
            Interactive Probability Concept Lab
          </h1>
          <p className="text-sm text-[#5E525A] max-w-2xl">
            Experiment with coin tosses, numbered spinners, and dice outcomes to master empirical
            and theoretical probability before taking the 12-question assessment.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartQuiz}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Start 12-Question Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Experiment Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#F3EAF0] rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode('coin')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            mode === 'coin'
              ? 'bg-white text-[#2B1A24] shadow-xs'
              : 'text-[#5E525A] hover:text-[#2B1A24]'
          }`}
        >
          01. Coin Toss Simulator
        </button>
        <button
          type="button"
          onClick={() => setMode('spinner12')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            mode === 'spinner12'
              ? 'bg-white text-[#2B1A24] shadow-xs'
              : 'text-[#5E525A] hover:text-[#2B1A24]'
          }`}
        >
          02. 12-Part Spinner
        </button>
        <button
          type="button"
          onClick={() => setMode('die')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            mode === 'die'
              ? 'bg-white text-[#2B1A24] shadow-xs'
              : 'text-[#5E525A] hover:text-[#2B1A24]'
          }`}
        >
          03. Six-Sided Die &amp; Bounds
        </button>
      </div>

      {/* Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Zone: Interactive Visual Stage */}
        <section className="lg:col-span-7 bg-white border border-[#E6D5DF] rounded-xl p-8 flex flex-col justify-between space-y-8">
          {mode === 'coin' && (
            <>
              <div className="flex items-center justify-between border-b border-[#F0E5EB] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#2B1A24]">
                    Empirical vs. Theoretical Coin Outcomes
                  </h2>
                  <p className="text-xs text-[#5E525A]">
                    Compare observed trial frequencies against the theoretical 1/2 benchmark.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#5E525A] block">Last Toss</span>
                  <span className="font-mono text-sm font-semibold text-[#874e6d]">
                    {lastFlip}
                  </span>
                </div>
              </div>

              <div className="space-y-6 py-4">
                {/* Heads Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#2B1A24]">Heads (H)</span>
                    <span className="font-mono tabular-nums text-[#5E525A]">
                      {headsCount} / {totalTosses} ({empiricalHeadsPct}%)
                    </span>
                  </div>
                  <div className="h-4 w-full bg-[#FAF6F8] border border-[#E6D5DF] rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-[#ddbfcf] transition-all duration-300"
                      style={{ width: `${totalTosses > 0 ? (headsCount / totalTosses) * 100 : 0}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#2B1A24]/40"
                      style={{ left: '50%' }}
                      title="Theoretical 50%"
                    />
                  </div>
                </div>

                {/* Tails Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#2B1A24]">Tails (T)</span>
                    <span className="font-mono tabular-nums text-[#5E525A]">
                      {tailsCount} / {totalTosses} ({empiricalTailsPct}%)
                    </span>
                  </div>
                  <div className="h-4 w-full bg-[#FAF6F8] border border-[#E6D5DF] rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-[#bc81a0] transition-all duration-300"
                      style={{ width: `${totalTosses > 0 ? (tailsCount / totalTosses) * 100 : 0}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#2B1A24]/40"
                      style={{ left: '50%' }}
                      title="Theoretical 50%"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#5E525A]">
                  Vertical dashed marker at 50% shows the theoretical probability{' '}
                  <span className="font-mono font-semibold text-[#2B1A24]">P = 1/2</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#F0E5EB]">
                <button
                  type="button"
                  onClick={() => tossCoins(1)}
                  className="py-2.5 px-3 text-xs font-semibold text-[#2B1A24] bg-[#F3EAF0] hover:bg-[#ddbfcf] rounded-lg transition-colors cursor-pointer"
                >
                  Toss 1×
                </button>
                <button
                  type="button"
                  onClick={() => tossCoins(10)}
                  className="py-2.5 px-3 text-xs font-semibold text-[#2B1A24] bg-[#F3EAF0] hover:bg-[#ddbfcf] rounded-lg transition-colors cursor-pointer"
                >
                  Toss 10×
                </button>
                <button
                  type="button"
                  onClick={() => tossCoins(60)}
                  className="py-2.5 px-3 text-xs font-semibold text-white bg-[#bc81a0] hover:bg-[#874e6d] rounded-lg transition-colors cursor-pointer"
                >
                  Toss 60×
                </button>
                <button
                  type="button"
                  onClick={resetCoins}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-[#5E525A] border border-[#E6D5DF] hover:bg-[#FAF6F8] rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </>
          )}

          {mode === 'spinner12' && (
            <>
              <div className="flex items-center justify-between border-b border-[#F0E5EB] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#2B1A24]">
                    12-Part Equal Numbered Spinner
                  </h2>
                  <p className="text-xs text-[#5E525A]">
                    Highlight favorable sectors for even numbers or prime numbers from 1 to 12.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#5E525A] block">Landed On</span>
                  <span className="font-mono text-lg font-bold text-[#874e6d] tabular-nums">
                    {spunNumber}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <TwelvePartSpinnerSvg
                  needleAngle={spinnerAngle}
                  highlightRule={spinnerRule}
                  size={250}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F0E5EB]">
                <div className="flex items-center gap-1 p-1 bg-[#F3EAF0] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSpinnerRule('even')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      spinnerRule === 'even'
                        ? 'bg-white text-[#2B1A24] shadow-xs'
                        : 'text-[#5E525A] hover:text-[#2B1A24]'
                    }`}
                  >
                    Even Numbers
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpinnerRule('prime')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      spinnerRule === 'prime'
                        ? 'bg-white text-[#2B1A24] shadow-xs'
                        : 'text-[#5E525A] hover:text-[#2B1A24]'
                    }`}
                  >
                    Prime Numbers
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpinnerRule('none')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      spinnerRule === 'none'
                        ? 'bg-white text-[#2B1A24] shadow-xs'
                        : 'text-[#5E525A] hover:text-[#2B1A24]'
                    }`}
                  >
                    Clear
                  </button>
                </div>

                <button
                  type="button"
                  onClick={spinTwelvePart}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Spin Wheel
                </button>
              </div>
            </>
          )}

          {mode === 'die' && (
            <>
              <div className="flex items-center justify-between border-b border-[#F0E5EB] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#2B1A24]">
                    Standard Six-Sided Die Sample Space
                  </h2>
                  <p className="text-xs text-[#5E525A]">
                    Inspect all six possible outcomes &#123;1, 2, 3, 4, 5, 6&#125; and probability bounds.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#5E525A] block">Current Roll</span>
                  <span className="font-mono text-lg font-bold text-[#874e6d] tabular-nums">
                    {dieFace}
                  </span>
                </div>
              </div>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-6 gap-3">
                  {dieFaces.map((face) => {
                    const matched = isDieOutcomeMatch(face);
                    const isCurrent = dieFace === face;
                    return (
                      <div
                        key={face}
                        className={`h-20 rounded-xl border flex flex-col items-center justify-center transition-colors ${
                          matched
                            ? 'bg-[#bc81a0] border-[#874e6d] text-white'
                            : 'bg-[#FAF6F8] border-[#E6D5DF] text-[#2B1A24]'
                        } ${isCurrent ? 'ring-2 ring-[#2B1A24] ring-offset-2' : ''}`}
                      >
                        <span className="font-mono text-2xl font-bold tabular-nums">{face}</span>
                        <span className="text-[11px] opacity-80">
                          {isCurrent ? 'Rolled' : matched ? 'Match' : 'Space'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Probability Bounds Bar 0 to 1 */}
                <div className="bg-[#FAF6F8] border border-[#E6D5DF] rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[#5E525A]">
                    <span>0 (Impossible: Rolling 7)</span>
                    <span>1/2 (3 out of 6)</span>
                    <span>1 (Certain: 1 to 6)</span>
                  </div>
                  <div className="h-2.5 bg-[#E6D5DF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#bc81a0] transition-all duration-300"
                      style={{ width: dieRule === 'seven' ? '0%' : '50%' }}
                    />
                  </div>
                </div>

                <div className="text-xs text-[#5E525A]">
                  Recent rolls:{' '}
                  <span className="font-mono text-[#2B1A24] tabular-nums">
                    {dieHistory.join(' · ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F0E5EB]">
                <div className="flex items-center gap-1 p-1 bg-[#F3EAF0] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDieRule('prime')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      dieRule === 'prime'
                        ? 'bg-white text-[#2B1A24] shadow-xs'
                        : 'text-[#5E525A] hover:text-[#2B1A24]'
                    }`}
                  >
                    Prime (2,3,5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDieRule('odd')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      dieRule === 'odd'
                        ? 'bg-white text-[#2B1A24] shadow-xs'
                        : 'text-[#5E525A] hover:text-[#2B1A24]'
                    }`}
                  >
                    Odd (1,3,5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDieRule('seven')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      dieRule === 'seven'
                        ? 'bg-white text-[#2B1A24] shadow-xs'
                        : 'text-[#5E525A] hover:text-[#2B1A24]'
                    }`}
                  >
                    Rolling 7
                  </button>
                </div>

                <button
                  type="button"
                  onClick={rollDie}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#874e6d] hover:bg-[#6e3d58] rounded-lg transition-colors cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  Roll Die
                </button>
              </div>
            </>
          )}
        </section>

        {/* Right Zone: Formula & Concept Deck */}
        <aside className="lg:col-span-5 bg-[#FAF6F8] border border-[#E6D5DF] rounded-xl p-8 flex flex-col justify-between space-y-6">
          {mode === 'coin' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-mono font-semibold text-[#874e6d]">
                  Key Formula · Empirical Probability
                </p>
                <h3 className="text-xl font-bold text-[#2B1A24]">
                  Experiment Results Determine Empirical Ratio
                </h3>
                <p className="text-sm text-[#5E525A] leading-relaxed">
                  Empirical probability is computed directly from observed outcomes in repeated
                  trials, whereas theoretical probability uses all equally likely outcomes.
                </p>
              </div>

              <div className="bg-white border border-[#E6D5DF] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5E525A]">Empirical P(T)</span>
                  <Fraction numerator={tailsCount} denominator={Math.max(1, totalTosses)} />
                </div>
                <div className="flex items-center justify-between text-sm border-t border-[#F0E5EB] pt-3">
                  <span className="text-[#5E525A]">Empirical P(H)</span>
                  <Fraction numerator={headsCount} denominator={Math.max(1, totalTosses)} />
                </div>
                <div className="flex items-center justify-between text-sm border-t border-[#F0E5EB] pt-3">
                  <span className="text-[#5E525A]">Theoretical P(H)</span>
                  <Fraction numerator={1} denominator={2} />
                </div>
              </div>

              <p className="text-xs text-[#5E525A] leading-relaxed">
                Notice how tossing 60 times gives an empirical value close to, but not always
                identical to, the theoretical 1/2. Try clicking &ldquo;Toss 60×&rdquo; repeatedly to
                observe convergence.
              </p>
            </div>
          )}

          {mode === 'spinner12' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-mono font-semibold text-[#874e6d]">
                  Key Formula · Uniform Spinner
                </p>
                <h3 className="text-xl font-bold text-[#2B1A24]">
                  Counting Favorable Outcomes Out of 12
                </h3>
                <p className="text-sm text-[#5E525A] leading-relaxed">
                  Because all 12 sectors have identical area, every number from 1 to 12 has equal
                  chance of landing under the pointer.
                </p>
              </div>

              <div className="bg-white border border-[#E6D5DF] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-[#2B1A24]">Even Numbers</p>
                    <p className="text-xs font-mono text-[#5E525A]">&#123;2, 4, 6, 8, 10, 12&#125;</p>
                  </div>
                  <Fraction numerator={6} denominator={12} />
                </div>
                <div className="flex items-center justify-between text-sm border-t border-[#F0E5EB] pt-3">
                  <div>
                    <p className="font-semibold text-[#2B1A24]">Prime Numbers</p>
                    <p className="text-xs font-mono text-[#5E525A]">&#123;2, 3, 5, 7, 11&#125;</p>
                  </div>
                  <Fraction numerator={5} denominator={12} />
                </div>
              </div>

              <p className="text-xs text-[#5E525A] leading-relaxed">
                Remember: 1 is neither prime nor composite. A prime number has exactly two positive
                divisors: 1 and itself.
              </p>
            </div>
          )}

          {mode === 'die' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-mono font-semibold text-[#874e6d]">
                  Key Principle · Probability Bounds
                </p>
                <h3 className="text-xl font-bold text-[#2B1A24]">
                  Every Probability Lies Between 0 and 1
                </h3>
                <p className="text-sm text-[#5E525A] leading-relaxed">
                  An impossible event (like rolling a 7 on a standard 1–6 die) has probability 0,
                  while a certain event has probability 1.
                </p>
              </div>

              <div className="bg-white border border-[#E6D5DF] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-[#2B1A24]">Prime Numbers</p>
                    <p className="text-xs font-mono text-[#5E525A]">&#123;2, 3, 5&#125;</p>
                  </div>
                  <Fraction numerator={3} denominator={6} />
                </div>
                <div className="flex items-center justify-between text-sm border-t border-[#F0E5EB] pt-3">
                  <div>
                    <p className="font-semibold text-[#2B1A24]">Odd Numbers</p>
                    <p className="text-xs font-mono text-[#5E525A]">&#123;1, 3, 5&#125;</p>
                  </div>
                  <Fraction numerator={3} denominator={6} />
                </div>
                <div className="flex items-center justify-between text-sm border-t border-[#F0E5EB] pt-3">
                  <div>
                    <p className="font-semibold text-[#2B1A24]">Rolling a 7</p>
                    <p className="text-xs font-mono text-[#5E525A]">Empty set &#8709;</p>
                  </div>
                  <span className="font-mono font-semibold text-[#2B1A24]">0</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E6D5DF] flex items-center justify-between">
            <span className="text-xs text-[#5E525A]">Ready for the graded assignment?</span>
            <button
              type="button"
              onClick={onStartQuiz}
              className="text-xs font-semibold text-[#874e6d] hover:text-[#6e3d58] underline underline-offset-2 cursor-pointer"
            >
              Open Quiz (12 Questions)
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
