require('dotenv').config();
const express = require('express');
const { initDatabase } = require('./database/database');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Initialize Express application
const app = express();

// Set port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Handle malformed JSON body errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Malformed JSON payload. Please provide valid JSON in the request body.',
    });
  }
  next(err);
});

// Automatically initialize SQLite database tables
initDatabase();

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Task Manager API is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    error: 'Internal server error. Please try again later.',
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Task Manager API server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

module.exports = app;
