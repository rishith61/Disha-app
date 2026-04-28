function QuestionCard({ question, options, onAnswer, selectedValue }) {
  return (
    <div className="card">
      <h2 className="mb-4 text-xl font-semibold text-primary">{question}</h2>
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 text-left transition hover:border-indigo-300 ${
              selectedValue === option.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-sm text-slate-900">{option.label}</span>
            <input
              type="radio"
              name="question-option"
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onAnswer(option.value)}
              className="h-4 w-4 accent-indigo-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default QuestionCard;
