# Stress-Career-AI

Stress-Career-AI is a stress-aware career guidance MVP that evaluates aptitude, emotional state, and stress response to generate personalized career recommendations with an LLM-backed analysis.

## Prerequisites

- Node.js 18+ installed
- npm available from the command line

## Installation

1. Open a terminal in the project root.
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

## Environment Setup

1. Copy `.env.example` to `.env` in the `/server` directory.
2. Add your LLM API key and provider:
   ```env
   LLM_API_KEY=your_api_key_here
   LLM_PROVIDER=gemini
   PORT=3001
   ```

   Supported providers: `anthropic`, `openai`, `gemini`.

## Run Locally

Open two terminals.

Terminal 1:
```bash
cd server
npm start
```

Terminal 2:
```bash
cd client
npm run dev
```

Then open the frontend at `http://localhost:5173`.

## API Reference

### POST `/api/assessment/submit`

Request body:
```json
{
  "aptitudeScore": 0,
  "emotionalScore": 0,
  "stressScore": 0,
  "responses": [
    {
      "scenarioId": 1,
      "answer": "A",
      "timeRemaining": 35
    }
  ]
}
```

Response body:
```json
{
  "careers": [
    {
      "title": "string",
      "match_score": 0,
      "explanation": "string",
      "risk_factors": ["string"],
      "growth_outlook": "High | Medium | Low"
    }
  ],
  "overall_confidence": 0,
  "summary": "string",
  "stress_insight": "string"
}
```
