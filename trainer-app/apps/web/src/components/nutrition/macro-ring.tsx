'use client';

interface MacroRingProps {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MacroRing({
  protein,
  carbs,
  fat,
  size = 64,
  strokeWidth = 6,
  className,
}: MacroRingProps) {
  const total = protein + carbs + fat;
  if (total === 0) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const pFrac = protein / total;
  const cFrac = carbs / total;
  const fFrac = fat / total;

  const pLen = pFrac * circumference;
  const cLen = cFrac * circumference;
  const fLen = fFrac * circumference;

  // Each segment: dasharray = "segmentLength remainder", offset shifts start position
  const pOffset = 0;
  const cOffset = -(pLen);
  const fOffset = -(pLen + cLen);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
        opacity={0.4}
      />
      {/* Fat — amber */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={strokeWidth}
        strokeDasharray={`${fLen} ${circumference - fLen}`}
        strokeDashoffset={fOffset}
        strokeLinecap="round"
      />
      {/* Carbs — blue */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={strokeWidth}
        strokeDasharray={`${cLen} ${circumference - cLen}`}
        strokeDashoffset={cOffset}
        strokeLinecap="round"
      />
      {/* Protein — emerald */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#10b981"
        strokeWidth={strokeWidth}
        strokeDasharray={`${pLen} ${circumference - pLen}`}
        strokeDashoffset={pOffset}
        strokeLinecap="round"
      />
    </svg>
  );
}
