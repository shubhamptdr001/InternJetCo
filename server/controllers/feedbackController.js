import Feedback from '../models/Feedback.js';
import PeerInterview from '../models/PeerInterview.js';

/**
 * @desc    Submit feedback for a peer interview session
 * @route   POST /api/feedback
 * @access  Private
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const {
      interviewId,
      receiverId,
      technicalScore,
      communicationScore,
      confidenceScore,
      comments,
      strengths = [],
      improvements = [],
    } = req.body;

    if (!interviewId || !receiverId || !technicalScore || !communicationScore || !confidenceScore || !comments) {
      return res.status(400).json({
        success: false,
        message: 'Please provide interviewId, receiverId, scores, and comments',
      });
    }

    // Check if interview exists and user is a participant
    const interview = await PeerInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (
      interview.interviewer.toString() !== req.user._id.toString() &&
      interview.candidate.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit feedback for this session' });
    }

    // Create feedback
    const feedback = await Feedback.create({
      interviewId,
      giverId: req.user._id,
      receiverId,
      technicalScore: Number(technicalScore),
      communicationScore: Number(communicationScore),
      confidenceScore: Number(confidenceScore),
      comments,
      strengths,
      improvements,
    });

    // Mark the peer interview session as completed
    interview.status = 'completed';
    await interview.save();

    res.status(201).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get feedback for a specific interview session
 * @route   GET /api/feedback/interview/:id
 * @access  Private
 */
export const getFeedbackForInterview = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ interviewId: req.params.id })
      .populate('giverId', 'name email avatar targetRole')
      .populate('receiverId', 'name email avatar targetRole');

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback received by the logged-in user
 * @route   GET /api/feedback/my
 * @access  Private
 */
export const getMyFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ receiverId: req.user._id })
      .populate('giverId', 'name email avatar targetRole')
      .populate('interviewId', 'interviewType date')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate analytics of feedback scores
 * @route   GET /api/feedback/analytics
 * @access  Private
 */
export const getFeedbackAnalytics = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ receiverId: req.user._id })
      .populate('interviewId', 'interviewType date')
      .sort({ createdAt: 1 }); // chronological order for timeline charts

    res.json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
