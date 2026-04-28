const express = require('express');
const { getCareerRecommendations } = require('../services/llmService');

const router = express.Router();

router.post('/submit', async (req, res) => {
  const { aptitudeScore, emotionalScore, stressScore, responses } = req.body;

  if (
    aptitudeScore === undefined ||
    emotionalScore === undefined ||
    stressScore === undefined ||
    !Array.isArray(responses)
  ) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const numericFields = [aptitudeScore, emotionalScore, stressScore].every(
    (value) => typeof value === 'number' && !Number.isNaN(value)
  );

  if (!numericFields) {
    return res.status(400).json({ error: 'Scores must be valid numbers' });
  }

  try {
    const recommendation = await getCareerRecommendations({
      aptitudeScore,
      emotionalScore,
      stressScore,
      responses,
    });
    return res.json(recommendation);
  } catch (error) {
    console.error('LLM error:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
  }
});

module.exports = router;
