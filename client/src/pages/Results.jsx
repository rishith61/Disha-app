import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import useAssessmentStore from '../store/useAssessmentStore';
import ResultCard from '../components/ResultCard';

function Results() {
  const results = useAssessmentStore((state) => state.results);
  const loading = useAssessmentStore((state) => state.loading);
  const error = useAssessmentStore((state) => state.error);
  const aptitudeScore = useAssessmentStore((state) => state.aptitudeScore);
  const emotionalScore = useAssessmentStore((state) => state.emotionalScore);
  const stressScore = useAssessmentStore((state) => state.stressScore);
  const stressResponses = useAssessmentStore((state) => state.stressResponses);
  const setLoading = useAssessmentStore((state) => state.setLoading);
  const setError = useAssessmentStore((state) => state.setError);
  const setResults = useAssessmentStore((state) => state.setResults);
  const navigate = useNavigate();

  const retrySubmission = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aptitudeScore, emotionalScore, stressScore, responses: stressResponses }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to submit results');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!results?.careers) return [];
    return results.careers.map((career) => ({ title: career.title, score: career.match_score }));
  }, [results]);

  const handleRetake = () => {
    setResults(null);
    setError(null);
    navigate('/');
  };

  return (
    <section className="mx-auto max-w-5xl space-y-8 py-10">
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary">Results</h1>
            <p className="mt-2 text-slate-600">Your career recommendations are based on aptitude, emotional state, and stress response.</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-6 py-5 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Overall confidence</p>
            <p className="mt-2 text-5xl font-semibold text-primary">{results?.overall_confidence ?? '--'}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="card text-center">
          <p className="text-lg font-medium text-primary">Loading career recommendations...</p>
        </div>
      )}

      {error && !loading && (
        <div className="card border-red-200 bg-red-50 text-red-700">
          <p className="mb-4 text-lg font-semibold">We could not load your recommendations.</p>
          <p className="mb-4">{error}</p>
          <button
            type="button"
            onClick={retrySubmission}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {results.careers.map((career) => (
              <ResultCard key={career.title} career={career} />
            ))}
          </div>

          <div className="card">
            <h2 className="mb-4 text-2xl font-semibold text-primary">Summary</h2>
            <p className="text-slate-700">{results.summary}</p>
          </div>

          <div className="card">
            <h2 className="mb-4 text-2xl font-semibold text-primary">Stress Insight</h2>
            <p className="text-slate-700">{results.stress_insight}</p>
          </div>

          {results._debug?.prompt && (
            <div className="card bg-slate-50">
              <h2 className="mb-4 text-2xl font-semibold text-primary">LLM Prompt</h2>
              <p className="text-sm text-slate-600">This is the exact prompt sent to Gemini.</p>
              <pre className="mt-4 max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">
{results._debug.prompt}
              </pre>
            </div>
          )}

          <div className="card">
            <h2 className="mb-4 text-2xl font-semibold text-primary">Match Score Comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="title" tick={{ fill: '#334155', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#334155', fontSize: 12 }} />
                  <Tooltip wrapperStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRetake}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Results;
