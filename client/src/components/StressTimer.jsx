import { useEffect, useMemo, useState } from 'react';

function getColor(fraction) {
  if (fraction > 0.6) return '#4F46E5';
  if (fraction > 0.25) return '#F59E0B';
  return '#DC2626';
}

function StressTimer({ duration, onExpire, onTick }) {
  const [remaining, setRemaining] = useState(duration);
  const fraction = Math.max(0, remaining / duration);
  const strokeColor = useMemo(() => getColor(fraction), [fraction]);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [remaining, onExpire]);

  useEffect(() => {
    if (typeof onTick === 'function') {
      onTick(remaining);
    }
  }, [remaining, onTick]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-flex h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none stroke-slate-200"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <span className="text-sm font-semibold text-primary" aria-label={`Time remaining ${remaining} seconds`}>
            {remaining}s
          </span>
        </div>
      </div>
    </div>
  );
}

export default StressTimer;
