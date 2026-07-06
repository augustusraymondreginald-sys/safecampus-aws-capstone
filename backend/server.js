const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(cors());
app.use(express.json());

// Basic request log — CloudWatch will pick up stdout/stderr from EC2
// automatically if the CloudWatch agent is configured on the instance.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', reportRoutes); // includes /reports/* and /uploads/presign

// Catch-all error handler — keeps stack traces out of API responses.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SafeCampus API running on port ${PORT}`);
});
