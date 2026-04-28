import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessmentStore from '../store/useAssessmentStore';
import QuestionCard from '../components/QuestionCard';
import StressTimer from '../components/StressTimer';

const scenarios = [
  {
    scenarioId: 1,
    title: 'Deadline Crisis',
    prompt: 'You have 2 hours left before a major deliverable is due and you discover a critical bug. Your manager is unavailable. What do you do?',
    options: [
      { value: 'A', label: 'Fix it yourself and submit late if needed' },
      { value: 'B', label: 'Submit what you have and flag the bug post-submission' },
      { value: 'C', label: 'Escalate to a peer and decide together' },
    ],
  },
  {
    scenarioId: 2,
    title: 'Team Conflict',
    prompt: 'A colleague publicly contradicts your analysis in a meeting in front of senior leadership. You believe you are correct. How do you respond?',
    options: [
      { value: 'A', label: 'Calmly present your evidence in the moment' },
      { value: 'B', label: 'Defer to the colleague and revisit privately after' },
      { value: 'C', label: 'Ask the team to table the discussion for later review' },
    ],
  },
  {
    scenarioId: 3,
    title: 'Ambiguity Under Pressure',
    prompt: 'You\'re asked to present a strategy for a problem you\'ve only just heard about, with 10 minutes to prepare. What\'s your approach?',
    options: [
      { value: 'A', label: 'Structure a framework immediately and present confidently with caveats' },
      { value: 'B', label: 'Ask for a brief delay to prepare properly' },
      { value: 'C', label: 'Present what you know and invite collaborative input' },
    ],
  },
];

function Simulation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [timerKey, setTimerKey] = useState(0);
  const addStressResponse = useAssessmentStore((state) => state.addStressResponse);
  const computeScores = useAssessmentStore((state) => state.computeScores);
  const setLoading = useAssessmentStore((state) => state.setLoading);
  const setError = useAssessmentStore((state) => state.setError);
  const setResults = useAssessmentStore((state) => state.setResults);
  const aptitudeScore = useAssessmentStore((state) => state.aptitudeScore);
  const emotionalScore = useAssessmentStore((state) => state.emotionalScore);
  const stressResponses = useAssessmentStore((state) => state.stressResponses);
  const stressScore = useAssessmentStore((state) => state.stressScore);
  const navigate = useNavigate();

  const currentScenario = scenarios[currentIndex];

  const summary = useMemo(() => ({
    aptitudeScore,
    emotionalScore,
    stressScore,
    responses: stressResponses,
  }), [aptitudeScore, emotionalScore, stressScore, stressResponses]);

  useEffect(() => {
    if (currentIndex === scenarios.length) {
      computeScores();
      submitAssessment();
    }
  }, [currentIndex]);

  const recordResponse = (answer, remaining) => {
    addStressResponse({
      scenarioId: currentScenario.scenarioId,
      answer,
      timeRemaining: remaining,
    });
  };

  const moveNext = () => {
    setSelectedAnswer(null);
    setTimeRemaining(45);
    setTimerKey((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleExpire = () => {
    recordResponse(null, 0);
    moveNext();
  };

  const handleAnswer = (value) => {
    setSelectedAnswer(value);
  };

  const handleSubmit = () => {
    recordResponse(selectedAnswer, timeRemaining);
    moveNext();
  };

  const submitAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const data = await response.json();
      setResults(data);
      navigate('/results');
    } catch (error) {
      setError(error.message || 'Failed to submit assessment');
      navigate('/results');
    } finally {
      setLoading(false);
    }
  };

  if (currentIndex >= scenarios.length) {
    return (
      <section className="mx-auto max-w-3xl py-10 text-center">
        <div className="card">
          <h2 className="text-2xl font-semibold text-primary">Processing your results...</h2>
          <p className="mt-3 text-slate-600">We are finalizing your personalized recommendations.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Simulation</p>
            <h1 className="mt-2 text-3xl font-semibold text-primary">{currentScenario.title}</h1>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>Scenario {currentIndex + 1} of {scenarios.length}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg text-slate-700">{currentScenario.prompt}</p>
          <StressTimer
            key={timerKey}
            duration={45}
            onExpire={handleExpire}
            onTick={setTimeRemaining}
          />
        </div>

        <QuestionCard
          question="Choose the option that best represents your response." 
          options={currentScenario.options}
          selectedValue={selectedAnswer}
          onAnswer={handleAnswer}
        />

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!selectedAnswer}
            onClick={handleSubmit}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </section>
  );
}

export default Simulation;
