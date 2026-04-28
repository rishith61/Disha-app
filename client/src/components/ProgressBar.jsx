function ProgressBar({ current, total }) {
  const progress = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>Question {current} of {total}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
