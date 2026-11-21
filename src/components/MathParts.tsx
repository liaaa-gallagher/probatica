import React from 'react';
import type { QuizOption } from '../types';

export function Fraction({
  numerator,
  denominator,
  size = 'md',
}: {
  numerator: number;
  denominator: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses =
    size === 'sm'
      ? 'text-xs leading-none'
      : size === 'lg'
        ? 'text-lg leading-none'
        : 'text-sm leading-none';

  return (
    <span
      className={`inline-flex flex-col items-center justify-center font-mono tabular-nums align-middle ${sizeClasses}`}
      aria-label={`${numerator} over ${denominator}`}
    >
      <span className="px-1 pb-0.5 border-b border-current">{numerator}</span>
      <span className="px-1 pt-0.5">{denominator}</span>
    </span>
  );
}

export function OptionContent({ option }: { option: QuizOption }) {
  if (option.fraction) {
    return (
      <Fraction
        numerator={option.fraction.numerator}
        denominator={option.fraction.denominator}
        size="md"
      />
    );
  }
  return <span className="text-[15px] leading-relaxed">{option.label}</span>;
}

/**
 * Faithful vector rendering of the Question 3 two-sector curved spinner
 * (yellow and green congruent curved halves inside a circle with a red needle).
 */
export function CurvedSpinnerSvg({
  needleAngle = -45,
  size = 180,
}: {
  needleAngle?: number;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="select-none"
      role="img"
      aria-label="Circular spinner divided into two curved equal yellow and green sectors with a red pointer"
    >
      <defs>
        <clipPath id="spinnerCircleClip">
          <circle cx="100" cy="100" r="84" />
        </clipPath>
      </defs>

      {/* Outer subtle framing ring */}
      <circle cx="100" cy="100" r="88" fill="#FFFFFF" stroke="#E6D5DF" strokeWidth="2" />

      {/* Two equal yin-yang-curved sectors inside the circle */}
      <g clipPath="url(#spinnerCircleClip)">
        {/* Green lower-right curved half */}
        <circle cx="100" cy="100" r="84" fill="#23A455" />
        {/* Yellow upper-left curved half: two semicircles forming an S-curve */}
        <path
          d="M 100 16 A 84 84 0 0 1 184 100 A 42 42 0 0 1 100 100 A 42 42 0 0 0 16 100 A 84 84 0 0 1 100 16 Z"
          fill="#F5C400"
        />
        {/* Crisp seam along the S-curve */}
        <path
          d="M 16 100 A 42 42 0 0 1 100 100 A 42 42 0 0 0 184 100"
          fill="none"
          stroke="#1F191E"
          strokeWidth="1.25"
          strokeOpacity="0.2"
        />
      </g>

      {/* Red spinner pointer matching PDF diagram */}
      <g
        transform={`rotate(${needleAngle} 100 100)`}
        style={{ transition: 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Rectangular counterweight tail */}
        <rect
          x="93"
          y="46"
          width="14"
          height="54"
          rx="2"
          fill="none"
          stroke="#D92B2B"
          strokeWidth="3"
        />
        {/* Pointer tip extending past center */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="152"
          stroke="#D92B2B"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="4.5" fill="#D92B2B" />
      </g>
    </svg>
  );
}

export function TwelvePartSpinnerSvg({
  needleAngle = 0,
  highlightRule = 'none',
  size = 240,
}: {
  needleAngle?: number;
  highlightRule?: 'none' | 'even' | 'prime';
  size?: number;
}) {
  const primes = new Set([2, 3, 5, 7, 11]);
  const segments = Array.from({ length: 12 }, (_, idx) => idx + 1);

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className="select-none"
      role="img"
      aria-label="Twelve-part numbered probability spinner from 1 to 12"
    >
      <circle cx="120" cy="120" r="108" fill="#FFFFFF" stroke="#E6D5DF" strokeWidth="2" />
      {segments.map((num, idx) => {
        const startAngle = idx * 30;
        const endAngle = (idx + 1) * 30;
        const start = polarToCartesian(120, 120, 102, startAngle);
        const end = polarToCartesian(120, 120, 102, endAngle);
        const labelPos = polarToCartesian(120, 120, 74, startAngle + 15);

        const isHighlighted =
          (highlightRule === 'even' && num % 2 === 0) ||
          (highlightRule === 'prime' && primes.has(num));

        const fill = isHighlighted
          ? '#bc81a0'
          : idx % 2 === 0
            ? '#FAF6F8'
            : '#F3EAF0';

        return (
          <g key={num}>
            <path
              d={`M 120 120 L ${start.x} ${start.y} A 102 102 0 0 1 ${end.x} ${end.y} Z`}
              fill={fill}
              stroke="#D5BCC9"
              strokeWidth="1.2"
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-mono text-xs font-semibold"
              fill={isHighlighted ? '#FFFFFF' : '#2B1A24'}
            >
              {num}
            </text>
          </g>
        );
      })}
      <circle cx="120" cy="120" r="16" fill="#FFFFFF" stroke="#bc81a0" strokeWidth="2" />
      <g
        transform={`rotate(${needleAngle} 120 120)`}
        style={{ transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <line
          x1="120"
          y1="120"
          x2="120"
          y2="40"
          stroke="#2B1A24"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon points="120,28 114,44 126,44" fill="#874e6d" />
        <circle cx="120" cy="120" r="5" fill="#874e6d" />
      </g>
    </svg>
  );
}
