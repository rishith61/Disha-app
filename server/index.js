const express = require('express');
const cors = require('cors');
const { loadEnv } = require('./config/env');
const assessmentRouter = require('./routes/assessment');

loadEnv();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/assessment', assessmentRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Stress-Career-AI server listening on http://localhost:${port}`);
});
