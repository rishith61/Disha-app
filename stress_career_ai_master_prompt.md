# MASTER PROMPT — Stress-Aware Career Guidance System (stress-career-ai)

---

## ROLE

You are a senior full-stack AI engineer. Your task is to scaffold and implement a
**production-ready MVP** of a stress-aware career guidance system called `stress-career-ai`.

You will output complete, runnable code — not pseudocode, not placeholders, not partial
files. Every file must be correct, complete, and importable.

---

## WHAT THE APP DOES

The app evaluates a user across three dimensions:
1. **Aptitude** — cognitive/skills self-assessment
2. **Emotional State** — baseline emotional check-in
3. **Stress Response** — behavior under timed, pressure-simulated scenarios

It then calls an LLM (Anthropic Claude or OpenAI) to generate personalized career
recommendations, including top career paths, explanations, risk factors, and confidence scores.

---

## TECH STACK — FOLLOW EXACTLY

### Frontend (`/client`)
- React 18 + Vite
- TailwindCSS (JIT, no arbitrary values unless necessary)
- Zustand (global state — assessment answers, stress scores, results)
- Recharts (results page only — for confidence score visualization)
- React Router v6 (client-side routing)

### Backend (`/server`)
- Node.js + Express.js
- REST API architecture
- `dotenv` for environment config
- `cors` middleware
- `axios` or native `fetch` for LLM API calls

### AI Layer
- LLM: Anthropic Claude API (`claude-sonnet-4-20250514`) or OpenAI `gpt-4o`
- API key loaded from `.env` as `LLM_API_KEY`
- System prompt and user prompt are modularized — not hardcoded inline

---

## DIRECTORY STRUCTURE — GENERATE THIS EXACTLY

```
stress-career-ai/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── ProgressBar.jsx
│       │   ├── QuestionCard.jsx
│       │   ├── StressTimer.jsx
│       │   ├── ResultCard.jsx
│       │   └── NavBar.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Assessment.jsx
│       │   ├── Simulation.jsx
│       │   └── Results.jsx
│       └── store/
│           └── useAssessmentStore.js
├── server/
│   ├── package.json
│   ├── index.js
│   ├── config/
│   │   └── env.js
│   ├── routes/
│   │   └── assessment.js
│   └── services/
│       ├── llmService.js
│       └── promptBuilder.js
├── .env.example
└── README.md
```

---

## DETAILED REQUIREMENTS BY FILE

### `/server/services/promptBuilder.js`
Export two functions:
- `buildSystemPrompt()` → returns the career psychologist system prompt string
- `buildUserPrompt({ aptitudeScore, emotionalScore, stressScore, responses })` → returns a
  structured user message string with all scores and a brief summary of stress scenario responses

System prompt content:
```
You are a career psychologist AI with expertise in psychometric assessment.
You analyze aptitude, emotional stability, and stress-response behavior to suggest
optimal career paths. Be direct, evidence-based, and empathetic. Output must be
valid JSON only — no markdown, no prose outside the JSON.
```

User prompt must instruct the LLM to return this exact JSON schema:
```json
{
  "careers": [
    {
      "title": "string",
      "match_score": 0-100,
      "explanation": "string (2-3 sentences)",
      "risk_factors": ["string"],
      "growth_outlook": "High | Medium | Low"
    }
  ],
  "overall_confidence": 0-100,
  "summary": "string (1 paragraph)",
  "stress_insight": "string (1-2 sentences about how their stress profile affects career fit)"
}
```
Return exactly 3 careers.

---

### `/server/services/llmService.js`
- Import `promptBuilder`
- Export `async function getCareerRecommendations(assessmentData)`
- Call the LLM API with the system + user prompt
- Parse and return the JSON response
- Include try/catch with proper error forwarding
- Support both Anthropic (`x-api-key` header, `anthropic-version: 2023-06-01`) and OpenAI
  (use `LLM_PROVIDER` env var: `anthropic` or `openai`, default `anthropic`)

---

### `/server/routes/assessment.js`
- `POST /api/assessment/submit`
- Accepts body: `{ aptitudeScore, emotionalScore, stressScore, responses }`
- Validates all fields present and numeric
- Calls `llmService.getCareerRecommendations`
- Returns the parsed JSON result
- Returns `400` for missing fields, `500` for LLM errors

---

### `/server/index.js`
- Express app on port `3001` (or `process.env.PORT`)
- `cors({ origin: 'http://localhost:5173' })`
- `express.json()`
- Mount assessment router at `/api/assessment`
- Health check: `GET /api/health` returns `{ status: 'ok' }`

---

### `/client/src/store/useAssessmentStore.js`
Zustand store with:
```js
{
  // State
  step: 'home' | 'assessment' | 'simulation' | 'results',
  aptitudeAnswers: [],       // array of { questionId, answer, score }
  emotionalAnswers: [],      // array of { questionId, answer, score }
  stressResponses: [],       // array of { scenarioId, answer, timeRemaining }
  aptitudeScore: null,       // computed 0-100
  emotionalScore: null,      // computed 0-100
  stressScore: null,         // computed 0-100
  results: null,             // LLM response object
  loading: false,
  error: null,

  // Actions
  setStep(step),
  addAptitudeAnswer(answer),
  addEmotionalAnswer(answer),
  addStressResponse(response),
  computeScores(),           // derives all three scores from answers
  setResults(data),
  setLoading(bool),
  setError(msg),
  reset()
}
```

---

### `/client/src/pages/Home.jsx`
- Hero section: app name, one-line description, "Start Assessment" CTA button
- Brief 3-step explainer (icons + labels: Assess → Simulate → Discover)
- Clean white card layout, centered, max-w-2xl

---

### `/client/src/pages/Assessment.jsx`
Two sections rendered sequentially (not as separate routes):

**Section 1 — Aptitude (5 questions)**
Sample questions:
1. "How quickly can you identify patterns in data?" (1–5 scale)
2. "Rate your comfort with ambiguous, open-ended problems." (1–5)
3. "How often do you break complex problems into smaller parts?" (1–5)
4. "How strong is your verbal communication under pressure?" (1–5)
5. "How well do you retain and apply new concepts quickly?" (1–5)

**Section 2 — Emotional State (4 questions)**
1. "How stable is your mood across a typical workday?" (1–5)
2. "How well do you manage interpersonal conflict?" (1–5)
3. "Rate your general energy and motivation level today." (1–5)
4. "How easily do you recover after a setback?" (1–5)

- Render one question at a time using `QuestionCard`
- Show `ProgressBar` (current q / total q)
- Store each answer in Zustand on "Next"
- On completion, navigate to `/simulation`

---

### `/client/src/pages/Simulation.jsx`
3 timed stress scenarios. Each scenario:
- Shows a career-related dilemma (text)
- Has a 45-second countdown timer (`StressTimer` component)
- Shows 3 multiple-choice answers (A, B, C)
- If timer runs out with no answer, auto-records `timeRemaining: 0, answer: null`
- Records `timeRemaining` (seconds left when answered) as part of stress scoring

Scenarios:
1. **Deadline Crisis** — "You have 2 hours left before a major deliverable is due and you
   discover a critical bug. Your manager is unavailable. What do you do?"
   - A: Fix it yourself and submit late if needed
   - B: Submit what you have and flag the bug post-submission
   - C: Escalate to a peer and decide together

2. **Team Conflict** — "A colleague publicly contradicts your analysis in a meeting in front
   of senior leadership. You believe you are correct. How do you respond?"
   - A: Calmly present your evidence in the moment
   - B: Defer to the colleague and revisit privately after
   - C: Ask the team to table the discussion for later review

3. **Ambiguity Under Pressure** — "You're asked to present a strategy for a problem you've
   only just heard about, with 10 minutes to prepare. What's your approach?"
   - A: Structure a framework immediately and present confidently with caveats
   - B: Ask for a brief delay to prepare properly
   - C: Present what you know and invite collaborative input

- After all 3 scenarios: compute `stressScore` (based on decisiveness + time remaining),
  then POST to `/api/assessment/submit`, navigate to `/results`

---

### `/client/src/pages/Results.jsx`
- Show loading spinner while awaiting API response
- On success, render 3 `ResultCard` components (one per career)
- Each `ResultCard` shows: career title, match score (as a pill badge), explanation,
  risk factors as a bullet list, growth outlook badge
- Below cards: `summary` paragraph + `stress_insight` in an aside box
- A `RadarChart` or `BarChart` (Recharts) showing all 3 match scores side by side
- `overall_confidence` shown as a large number with a label
- "Retake Assessment" button at the bottom (calls `reset()` and navigates to `/`)

---

### UI DESIGN RULES (enforce in every component)
- Background: `#FFFFFF` (white)
- Primary color: `#1A1A2E` (near-black navy)
- Accent color: `#4F46E5` (indigo-600)
- Font: Use `font-mono` for scores/numbers, `font-sans` (system) for body text
- Cards: `rounded-2xl shadow-sm border border-gray-100 p-6`
- Buttons: `bg-indigo-600 text-white rounded-xl px-6 py-3 hover:bg-indigo-700 transition`
- Inputs/Radios: styled cleanly with focus rings in indigo
- No gradients, no decorative blobs, no emojis in UI
- Mobile responsive: all layouts must work at 375px width

---

### `/client/src/components/StressTimer.jsx`
- Props: `duration` (seconds), `onExpire` (callback), `onTick` (optional)
- Circular SVG countdown ring
- Color shifts from indigo → amber → red as time decreases
- Accessible: `aria-label` with remaining time

---

### `/client/src/components/QuestionCard.jsx`
- Props: `question` (string), `options` (array of `{ value, label }`), `onAnswer` (callback)
- For Likert scale: render 5 radio buttons styled as toggle pills
- For MC: render 3 labeled option buttons

---

### `/client/src/components/ProgressBar.jsx`
- Props: `current`, `total`
- Thin indigo bar with smooth CSS transition
- Shows `"Question {current} of {total}"` label

---

## SCORING LOGIC

### `aptitudeScore`
Average of all aptitude answers (1–5 scale), normalized to 0–100.
`aptitudeScore = (sum of answers / (5 * numQuestions)) * 100`

### `emotionalScore`
Same formula applied to emotional answers.

### `stressScore`
For each scenario response:
- Base score per answer: A = 10, B = 6, C = 8 (reflects decisiveness hierarchy)
- Time bonus: `(timeRemaining / 45) * 10` added to base
- Null answer (timed out): score = 0
`stressScore = (sum of scenario scores / (3 * 20)) * 100` (max per scenario = 20)

All scores are clamped to `[0, 100]` and rounded to 1 decimal place.

---

## ENVIRONMENT FILES

### `.env.example`
```
LLM_API_KEY=your_api_key_here
LLM_PROVIDER=anthropic
PORT=3001
```

### `client/vite.config.js` must proxy `/api` to `http://localhost:3001`
```js
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

---

## ERROR HANDLING

- If the LLM API call fails, the Results page must show a styled error state with a
  "Try Again" button that re-triggers the submission
- All API errors must be logged on the server with `console.error` and a descriptive message
- Frontend: store errors in Zustand `error` field, show inline error banners (not alerts)

---

## README.md

Include:
1. Project overview (2 sentences)
2. Prerequisites (Node 18+, npm)
3. Installation steps for both `/client` and `/server`
4. `.env` setup instructions
5. How to run locally (two terminal commands)
6. API endpoint reference (POST `/api/assessment/submit` — request/response schema)

---

## OUTPUT INSTRUCTIONS

Generate all files in order:
1. `README.md`
2. `.env.example`
3. All `/server` files
4. All `/client` files

For each file, output:
```
=== FILE: path/to/file.ext ===
[complete file content]
```

Do not summarize or explain between files. Output code only.
Do not skip any file listed in the directory structure.
Do not use placeholder comments like `// TODO` or `// add logic here`.
Every function must be fully implemented.
