require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', questionRoutes);

// Simple health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// DB + server
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project04';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
