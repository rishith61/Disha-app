import create from 'zustand';

const initialState = {
  step: 'home',
  aptitudeAnswers: [],
  emotionalAnswers: [],
  stressResponses: [],
  aptitudeScore: null,
  emotionalScore: null,
  stressScore: null,
  results: null,
  loading: false,
  error: null,
};

const useAssessmentStore = create((set, get) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  addAptitudeAnswer: (answer) =>
    set((state) => ({
      aptitudeAnswers: [...state.aptitudeAnswers, answer],
    })),
  addEmotionalAnswer: (answer) =>
    set((state) => ({
      emotionalAnswers: [...state.emotionalAnswers, answer],
    })),
  addStressResponse: (response) =>
    set((state) => ({
      stressResponses: [...state.stressResponses, response],
    })),
  computeScores: () => {
    const state = get();
    const normalize = (answers) => {
      if (!answers.length) return 0;
      const sum = answers.reduce((acc, item) => acc + Number(item.score || 0), 0);
      return Number(((sum / (5 * answers.length)) * 100).toFixed(1));
    };

    const aptitudeScore = normalize(state.aptitudeAnswers);
    const emotionalScore = normalize(state.emotionalAnswers);

    const stressSum = state.stressResponses.reduce((acc, response) => {
      if (!response.answer) return acc;
      const base = response.answer === 'A' ? 10 : response.answer === 'B' ? 6 : 8;
      const bonus = (response.timeRemaining / 45) * 10;
      return acc + base + bonus;
    }, 0);
    const stressScore = Number(((stressSum / (3 * 20)) * 100).toFixed(1));

    set({ aptitudeScore, emotionalScore, stressScore });
  },
  setResults: (data) => set({ results: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));

export default useAssessmentStore;
