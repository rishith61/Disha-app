import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessmentStore from '../store/useAssessmentStore';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';

const aptitudeQuestions = [
  { id: 1, question: 'How quickly can you identify patterns in data?' },
  { id: 2, question: 'Rate your comfort with ambiguous, open-ended problems.' },
  { id: 3, question: 'How often do you break complex problems into smaller parts?' },
  { id: 4, question: 'How strong is your verbal communication under pressure?' },
  { id: 5, question: 'How well do you retain and apply new concepts quickly?' },
];

const emotionalQuestions = [
  { id: 6, question: 'How stable is your mood across a typical workday?' },
  { id: 7, question: 'How well do you manage interpersonal conflict?' },
  { id: 8, question: 'Rate your general energy and motivation level today.' },
  { id: 9, question: 'How easily do you recover after a setback?' },
];

const options = [
  { value: 1, label: '1 — Strongly disagree' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 — Strongly agree' },
];

function Assessment() {
  const [section, setSection] = useState('aptitude');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const addAptitudeAnswer = useAssessmentStore((state) => state.addAptitudeAnswer);
  const addEmotionalAnswer = useAssessmentStore((state) => state.addEmotionalAnswer);
  const computeScores = useAssessmentStore((state) => state.computeScores);
  const navigate = useNavigate();

  const questions = section === 'aptitude' ? aptitudeQuestions : emotionalQuestions;
  const question = questions[index];

  const handleNext = () => {
    if (selected === null) return;

    const answerPayload = {
      questionId: question.id,
      answer: selected,
      score: Number(selected),
    };

    if (section === 'aptitude') {
      addAptitudeAnswer(answerPayload);
    } else {
      addEmotionalAnswer(answerPayload);
    }

    setSelected(null);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }

    if (section === 'aptitude') {
      setSection('emotional');
      setIndex(0);
      return;
    }

    computeScores();
    navigate('/simulation');
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 py-10">
      <div className="card">
        <h1 className="text-3xl font-semibold text-primary">Assessment</h1>
        <p className="mt-3 text-slate-600">
          {section === 'aptitude'
            ? 'Answer these aptitude questions to help us understand your skills profile.'
            : 'Answer these emotional state questions to capture your baseline wellbeing.'}
        </p>
      </div>

      <div className="card">
        <ProgressBar current={index + 1} total={questions.length} />
        <QuestionCard
          question={question.question}
          options={options}
          selectedValue={selected}
          onAnswer={setSelected}
        />
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={selected === null}
          >
            {index + 1 === questions.length && section === 'emotional' ? 'Continue to Simulation' : 'Next Question'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Assessment;
