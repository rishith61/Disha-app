function buildSystemPrompt() {
  return `You are a career psychologist AI. Analyze aptitude, emotional stability, and stress-response behavior.
Output exactly one valid JSON object and nothing else. Do not include markdown, backticks, or any text outside the JSON.`;
}

function buildUserPrompt({ aptitudeScore, emotionalScore, stressScore, responses }) {
  const responseSummary = responses
    .map((response) => {
      const answerText = response.answer === null ? 'No answer' : response.answer;
      return `Scenario ${response.scenarioId}: answer=${answerText}, timeRemaining=${response.timeRemaining}`;
    })
    .join('\n');

  return `Assess this user using the following data:
aptitudeScore: ${aptitudeScore}
emotionalScore: ${emotionalScore}
stressScore: ${stressScore}
scenarioResponses:
${responseSummary}

Return only valid JSON structured exactly like this:
{
  "careers": [
    {
      "title": "string",
      "match_score": 0,
      "explanation": "string",
      "risk_factors": ["string"],
      "growth_outlook": "High"
    }
  ],
  "overall_confidence": 0,
  "summary": "string",
  "stress_insight": "string"
}

Rules:
- Provide exactly 3 careers.
- match_score and overall_confidence must be numbers between 0 and 100.
- growth_outlook must be one of "High", "Medium", or "Low".
- risk_factors must be an array of strings.
- Do not include any text outside the JSON.
`;
}

module.exports = {
  buildSystemPrompt,
  buildUserPrompt,
};
