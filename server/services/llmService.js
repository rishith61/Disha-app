const { buildSystemPrompt, buildUserPrompt } = require('./promptBuilder');

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/complete';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function parseJsonResponse(text) {
  if (typeof text !== 'string') {
    return text;
  }

  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    let cleaned = trimmed;

    if (cleaned.startsWith('```')) {
      const fenceEnd = cleaned.indexOf('```', 3);
      if (fenceEnd !== -1) {
        cleaned = cleaned.slice(3, fenceEnd).trim();
      } else {
        cleaned = cleaned.slice(3).trim();
      }
    }

    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
    }

    throw error;
  }
}

async function callAnthropic(systemPrompt, userPrompt) {
  const body = {
    model: 'claude-sonnet-4-20250514',
    prompt: `${systemPrompt}\n\nHuman: ${userPrompt}\n\nAssistant:`,
    max_tokens_to_sample: 800,
    temperature: 0.2,
  };

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.LLM_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic error: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  return parseJsonResponse(json.completion || json.text || '');
}

async function callOpenAI(systemPrompt, userPrompt) {
  const body = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 800,
  };

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || '';
  return parseJsonResponse(text);
}

async function callGemini(systemPrompt, userPrompt) {
  const promptText = `${systemPrompt}\n\nHuman: ${userPrompt}\n\nAssistant:`;
  const url = process.env.LLM_API_KEY?.startsWith('AIza')
    ? `${GEMINI_URL}?key=${process.env.LLM_API_KEY}`
    : GEMINI_URL;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (process.env.LLM_API_KEY?.startsWith('AIza')) {
    headers['x-goog-api-key'] = process.env.LLM_API_KEY;
  } else {
    headers.Authorization = `Bearer ${process.env.LLM_API_KEY}`;
  }

  const body = {
    contents: [
      {
        parts: [{ text: promptText }],
        role: 'user',
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200,
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: 'object',
        properties: {
          careers: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                match_score: { type: 'number' },
                explanation: { type: 'string' },
                risk_factors: { type: 'array', items: { type: 'string' } },
                growth_outlook: { type: 'string' },
              },
              required: ['title', 'match_score', 'explanation', 'risk_factors', 'growth_outlook'],
            },
          },
          overall_confidence: { type: 'number' },
          summary: { type: 'string' },
          stress_insight: { type: 'string' },
        },
        required: ['careers', 'overall_confidence', 'summary', 'stress_insight'],
      },
      candidateCount: 1,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini error: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  const candidate = json?.candidates?.[0];
  const text =
    candidate?.content?.parts?.[0]?.text ||
    candidate?.content?.text ||
    candidate?.content?.parts?.map((part) => part.text).join(' ') ||
    '';
  const parsed = parseJsonResponse(text);

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return {
      ...parsed,
      _debug: {
        provider: 'gemini',
        prompt: promptText,
      },
    };
  }

  return {
    result: parsed,
    _debug: {
      provider: 'gemini',
      prompt: promptText,
    },
  };
}

async function getCareerRecommendations(assessmentData) {
  if (!process.env.LLM_API_KEY) {
    throw new Error('LLM_API_KEY is required');
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(assessmentData);
  const provider = (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();

  if (provider === 'openai') {
    return callOpenAI(systemPrompt, userPrompt);
  }

  if (provider === 'anthropic') {
    return callAnthropic(systemPrompt, userPrompt);
  }

  if (provider === 'gemini') {
    return callGemini(systemPrompt, userPrompt);
  }

  throw new Error(`Unsupported LLM_PROVIDER value: ${process.env.LLM_PROVIDER}. Use 'anthropic', 'openai', or 'gemini'.`);
}

module.exports = {
  getCareerRecommendations,
};
