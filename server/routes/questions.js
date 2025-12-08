const express = require('express');
const Category = require('../models/Category');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/* =====================================================
   ✅ SEED CATEGORIES
   ===================================================== */
router.get('/seed-categories', async (req, res) => {
  try {
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
  } catch (err) {
    console.error('❌ CATEGORY SEED ERROR:', err);
    res.status(500).json({ message: 'Seeding categories failed' });
  }
});

/* =====================================================
   SEED DEMO USERS, QUESTIONS & ANSWERS
   ===================================================== */
router.get('/seed-demo-data', async (req, res) => {
  try {
    const existing = await Question.find();
    if (existing.length > 0) {
      return res.json({ message: 'Demo data already exists' });
    }

    const categories = await Category.find();
    if (categories.length === 0) {
      return res
        .status(400)
        .json({ message: 'Seed categories first' });
    }

    const dogs = categories.find((c) => c.name === 'Dogs');
    const cats = categories.find((c) => c.name === 'Cats');
    const rabbits = categories.find((c) => c.name === 'Rabbits');

    const user1 =
      (await User.findOne({ username: 'demoUser1' })) ||
      (await User.create({
        username: 'demoUser1',
        passwordHash: '$2a$10$demoHash',
      }));

    const user2 =
      (await User.findOne({ username: 'demoUser2' })) ||
      (await User.create({
        username: 'demoUser2',
        passwordHash: '$2a$10$demoHash',
      }));

    // ✅ CREATE 15 QUESTIONS (5 PER CATEGORY)
    const questions = await Question.insertMany([
      // DOGS
      { text: 'What is the best dog breed for apartments?', category: dogs._id, user: user1._id },
      { text: 'How often should I walk my dog?', category: dogs._id, user: user2._id },
      { text: 'Why does my dog chew everything?', category: dogs._id, user: user1._id },
      { text: 'How do I stop my dog from barking at night?', category: dogs._id, user: user2._id },
      { text: 'What human foods are toxic to dogs?', category: dogs._id, user: user1._id },

      // CATS
      { text: 'Why does my cat knock things off tables?', category: cats._id, user: user2._id },
      { text: 'How often should I clean my cat’s litter box?', category: cats._id, user: user1._id },
      { text: 'Why does my cat stare at walls?', category: cats._id, user: user2._id },
      { text: 'Is wet or dry food better for cats?', category: cats._id, user: user1._id },
      { text: 'Why does my cat knead blankets?', category: cats._id, user: user2._id },

      // RABBITS
      { text: 'Can rabbits be litter trained?', category: rabbits._id, user: user1._id },
      { text: 'What vegetables are safe for rabbits?', category: rabbits._id, user: user2._id },
      { text: 'Do rabbits need vaccinations?', category: rabbits._id, user: user1._id },
      { text: 'Why does my rabbit thump its feet?', category: rabbits._id, user: user2._id },
      { text: 'Can rabbits live with other pets?', category: rabbits._id, user: user1._id },
    ]);

    // ✅ CREATE 15 ANSWERS (1 FOR EACH QUESTION)
    const answers = questions.map((q, i) => ({
      text: `This is a helpful answer for: "${q.text}"`,
      question: q._id,
      user: i % 2 === 0 ? user2._id : user1._id,
    }));

    await Answer.insertMany(answers);

    res.json({
      message: '15 questions and 15 answers seeded successfully',
    });
  } catch (err) {
    console.error('❌ DEMO SEED ERROR:', err);
    res.status(500).json({ message: 'Seeding demo data failed' });
  }
});


/* =====================================================
   ✅ GET ALL CATEGORIES
   ===================================================== */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('❌ LOAD CATEGORIES ERROR:', err);
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

/* =====================================================
   ✅ GET QUESTIONS BY CATEGORY
   ===================================================== */
router.get('/questions', async (req, res) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({ message: 'categoryId is required' });
    }

    const questions = await Question.find({ category: categoryId })
      .populate('user', 'username')
      .sort({ createdAt: 1 });

    res.json(questions);
  } catch (err) {
    console.error('❌ LOAD QUESTIONS ERROR:', err);
    res.status(500).json({ message: 'Failed to load questions' });
  }
});

/* =====================================================
   ✅ GET ANSWERS FOR A QUESTION
   ===================================================== */
router.get('/answers', async (req, res) => {
  try {
    const { questionId } = req.query;

    if (!questionId) {
      return res
        .status(400)
        .json({ message: 'questionId is required' });
    }

    const answers = await Answer.find({ question: questionId })
      .populate('user', 'username')
      .sort({ createdAt: 1 });

    res.json(answers);
  } catch (err) {
    console.error('❌ LOAD ANSWERS ERROR:', err);
    res.status(500).json({ message: 'Failed to load answers' });
  }
});

/* =====================================================
   ✅ ADD NEW QUESTION (AUTH REQUIRED)
   ===================================================== */
router.post('/questions', auth, async (req, res) => {
  try {
    const { text, categoryId } = req.body;

    if (!text || !categoryId) {
      return res
        .status(400)
        .json({ message: 'Text and categoryId are required' });
    }

    const question = await Question.create({
      text,
      category: categoryId,
      user: req.user.id,
    });

    res.status(201).json(question);
  } catch (err) {
    console.error('❌ CREATE QUESTION ERROR:', err);
    res.status(500).json({ message: 'Failed to create question' });
  }
});

/* =====================================================
   ✅ ADD NEW ANSWER (AUTH REQUIRED)
   ===================================================== */
router.post('/answers', auth, async (req, res) => {
  try {
    const { text, questionId } = req.body;

    if (!text || !questionId) {
      return res
        .status(400)
        .json({ message: 'Text and questionId are required' });
    }

    const answer = await Answer.create({
      text,
      question: questionId,
      user: req.user.id,
    });

    res.status(201).json(answer);
  } catch (err) {
    console.error('❌ CREATE ANSWER ERROR:', err);
    res.status(500).json({ message: 'Failed to create answer' });
  }
});

// TEMP: WIPE ALL QUESTIONS & ANSWERS (DEV ONLY)
router.get('/wipe-demo-data', async (req, res) => {
  try {
    await Answer.deleteMany();
    await Question.deleteMany();
    res.json({ message: 'All questions and answers wiped' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Wipe failed' });
  }
});


module.exports = router;
