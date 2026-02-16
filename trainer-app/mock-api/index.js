const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({ message: 'INÖ Fitness Mock API', version: '1.0.0' });
});

// Simple mock endpoints
app.get('/api/v1/workouts', (req, res) => {
  res.json([
    { id: 1, name: 'Full Body Strength', duration: 45 },
    { id: 2, name: 'Upper Body Push', duration: 40 }
  ]);
});

app.get('/api/v1/diet', (req, res) => {
  res.json({
    calories: 2400,
    macros: { protein: 180, carbs: 250, fat: 70 },
    meals: [
      { id: 1, name: 'Breakfast', calories: 600 },
      { id: 2, name: 'Lunch', calories: 700 }
    ]
  });
});

app.get('/api/v1/progress', (req, res) => {
  res.json({
    weekly: [80, 65, 90, 75, 85, 70, 95],
    weight: [{ date: '2025-11-01', kg: 76 }, { date: '2025-11-15', kg: 75 }]
  });
});

app.get('/api/v1/users/me', (req, res) => {
  res.json({ id: 1, name: 'John Doe', email: 'john.doe@email.com' });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({ token: 'mock-token', user: { id: 1, email: email || 'john.doe@email.com' } });
});

app.get('/api/v1/reminders', (req, res) => {
  res.json([{ id: 1, message: 'Drink water', remind_at: new Date().toISOString(), sent: false }]);
});

app.post('/api/v1/ai/message', (req, res) => {
  const { message } = req.body || {};
  res.json({ reply: `Mock reply to: ${message || 'hello'}` });
});

app.listen(PORT, () => console.log(`Mock API listening on http://localhost:${PORT}`));
