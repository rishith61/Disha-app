function ResultCard({ career }) {
  return (
    <div className="card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-primary">{career.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{career.explanation}</p>
        </div>
        <span className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
          {career.match_score}
        </span>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Risk Factors</p>
        <ul className="ml-4 list-disc text-sm text-slate-600">
          {career.risk_factors.map((factor, index) => (
            <li key={index}>{factor}</li>
          ))}
        </ul>
      </div>
      <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
        Growth outlook: {career.growth_outlook}
      </div>
    </div>
  );
}

export default ResultCard;
