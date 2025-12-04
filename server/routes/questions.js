const express = require('express');
const Category = require('../models/Category');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

const router = express.Router();

// Seed categories once if DB is empty
router.get('/seed-categories', async (req, res) => {
  const existing = await Category.find();
  if (existing.length > 0) {
    return res.json({ message: 'Categories already exist' });
  }

  const categories = await Category.insertMany([
    { name: 'Dogs' },
    { name: 'Cats' },
    { name: 'Rabbits' },
  ]);

  res.json({ message: 'Categories seeded', categories });
});

// Get all categories
router.get('/categories', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// Get questions for a category in chronological order (oldest first)
router.get('/questions', async (req, res) => {
  const { categoryId } = req.query;
  if (!categoryId) return res.status(400).json({ message: 'categoryId is required' });

  const questions = await Question.find({ category: categoryId })
    .populate('user', 'username')
    .sort({ createdAt: 1 });

  res.json(questions);
});

// Add a new question (protected)
router.post('/questions', auth, async (req, res) => {
  const { text, categoryId } = req.body;
  if (!text || !categoryId) {
    return res.status(400).json({ message: 'Text and categoryId are required' });
  }

  const question = await Question.create({
    text,
    category: categoryId,
    user: req.user.id,
  });

  res.status(201).json(question);
});

module.exports = router;
