const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, acceptedTerms } = req.body;

    // Basic validation rules that match the PDF:
    // - Username unique
    // - Password at least 8 chars and contains a number
    // - Passwords match
    // - Terms checked
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 8 || !/\d/.test(password)) {
      return res.status(400).json({
        field: 'password',
        message: 'Password must be at least 8 characters and contain a number',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        field: 'confirmPassword',
        message: 'Passwords do not match',
      });
    }

    if (!acceptedTerms) {
      return res.status(400).json({
        field: 'acceptedTerms',
        message: 'You must agree to the terms',
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({
        field: 'username',
        message: 'Username already exists / Invalid username',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    res.status(201).json({ message: 'User registered', username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
