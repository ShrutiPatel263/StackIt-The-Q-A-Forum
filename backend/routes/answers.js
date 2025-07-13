import express from 'express';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create answer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, questionId } = req.body;

    if (!content || !questionId) {
      return res.status(400).json({ message: 'Content and question ID are required' });
    }

    const question = await Question.findById(questionId).populate('author');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      author: req.user._id,
      question: questionId
    });

    await answer.save();
    await answer.populate('author', 'username avatar reputation');

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Create notification for question author
    if (!question.author._id.equals(req.user._id)) {
      const notification = new Notification({
        recipient: question.author._id,
        sender: req.user._id,
        type: 'answer',
        message: `${req.user.username} answered your question: ${question.title}`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    res.status(201).json({
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ message: 'Error creating answer' });
  }
});

// Vote on answer
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = answer.votes.upvotes.includes(userId);
    const hasDownvoted = answer.votes.downvotes.includes(userId);

    // Remove existing votes
    answer.votes.upvotes = answer.votes.upvotes.filter(id => !id.equals(userId));
    answer.votes.downvotes = answer.votes.downvotes.filter(id => !id.equals(userId));

    // Add new vote if different from existing
    if (type === 'up' && !hasUpvoted) {
      answer.votes.upvotes.push(userId);
    } else if (type === 'down' && !hasDownvoted) {
      answer.votes.downvotes.push(userId);
    }

    await answer.save();

    res.json({
      message: 'Vote updated',
      voteScore: answer.votes.upvotes.length - answer.votes.downvotes.length
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ message: 'Error voting on answer' });
  }
});

// Accept answer
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question');
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = answer.question;
    
    // Check if user is the question author
    if (!question.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Unaccept previous answer if exists
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
    }

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    // Create notification for answer author
    if (!answer.author.equals(req.user._id)) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user._id,
        type: 'accept',
        message: `Your answer was accepted for: ${question.title}`,
        relatedQuestion: question._id,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    res.json({
      message: 'Answer accepted successfully',
      answer
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Error accepting answer' });
  }
});

export default router;