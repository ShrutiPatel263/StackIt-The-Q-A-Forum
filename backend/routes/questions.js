import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search, sort = 'newest' } = req.query;
    
    let query = { isActive: true };
    
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { 'votes.upvotes': -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar reputation')
      .populate('acceptedAnswer')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add vote scores
    const questionsWithScores = questions.map(q => ({
      ...q,
      voteScore: q.votes.upvotes.length - q.votes.downvotes.length,
      answerCount: q.answers.length
    }));

    const total = await Question.countDocuments(query);
    
    res.json({
      questions: questionsWithScores,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'username avatar reputation' }
      })
      .populate('acceptedAnswer');

    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment views
    await question.incrementViews();

    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Error fetching question' });
  }
});

// Create question
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const question = new Question({
      title,
      description,
      tags: tags || [],
      author: req.user._id
    });

    await question.save();
    await question.populate('author', 'username avatar reputation');

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Error creating question' });
  }
});

// Vote on question
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = question.votes.upvotes.includes(userId);
    const hasDownvoted = question.votes.downvotes.includes(userId);

    // Remove existing votes
    question.votes.upvotes = question.votes.upvotes.filter(id => !id.equals(userId));
    question.votes.downvotes = question.votes.downvotes.filter(id => !id.equals(userId));

    // Add new vote if different from existing
    if (type === 'up' && !hasUpvoted) {
      question.votes.upvotes.push(userId);
    } else if (type === 'down' && !hasDownvoted) {
      question.votes.downvotes.push(userId);
    }

    await question.save();

    res.json({
      message: 'Vote updated',
      voteScore: question.votes.upvotes.length - question.votes.downvotes.length
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ message: 'Error voting on question' });
  }
});

export default router;