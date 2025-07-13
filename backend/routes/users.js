import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user stats
    const questionCount = await Question.countDocuments({ author: user._id, isActive: true });
    const answerCount = await Answer.countDocuments({ author: user._id, isActive: true });

    res.json({
      user,
      stats: {
        questions: questionCount,
        answers: answerCount,
        reputation: user.reputation
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Get popular tags
router.get('/tags/popular', async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json(tags.map(tag => ({ name: tag._id, count: tag.count })));
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({ message: 'Error fetching tags' });
  }
});

export default router;