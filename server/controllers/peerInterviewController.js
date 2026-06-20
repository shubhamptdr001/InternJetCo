import PeerInterview from '../models/PeerInterview.js';
import User from '../models/User.js';
import crypto from 'crypto';

/**
 * @desc    Schedule a peer interview session
 * @route   POST /api/peer-interviews
 * @access  Private
 */
export const scheduleInterview = async (req, res, next) => {
  try {
    const { partnerId, role, interviewType, difficulty = 'medium', date, duration = 30 } = req.body;

    if (!partnerId || !role || !interviewType || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide partnerId, role, interviewType, and date' 
      });
    }

    if (partnerId === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot schedule an interview with yourself' 
      });
    }

    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Interview partner not found' });
    }

    const interviewer = role === 'interviewer' ? req.user._id : partnerId;
    const candidate = role === 'candidate' ? req.user._id : partnerId;

    // Generate unique room ID for the video call room
    const roomId = crypto.randomBytes(8).toString('hex');

    const peerInterview = await PeerInterview.create({
      interviewer,
      candidate,
      interviewType,
      difficulty,
      date,
      duration,
      roomId,
    });

    res.status(201).json({
      success: true,
      interview: peerInterview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all peer interviews for the logged-in user (as candidate or interviewer)
 * @route   GET /api/peer-interviews
 * @access  Private
 */
export const getPeerInterviews = async (req, res, next) => {
  try {
    const interviews = await PeerInterview.find({
      $or: [{ interviewer: req.user._id }, { candidate: req.user._id }],
    })
      .populate('interviewer', 'name email avatar targetRole experience')
      .populate('candidate', 'name email avatar targetRole experience')
      .sort({ date: 1 });

    res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get details of a single peer interview
 * @route   GET /api/peer-interviews/:id
 * @access  Private
 */
export const getPeerInterview = async (req, res, next) => {
  try {
    const interview = await PeerInterview.findById(req.params.id)
      .populate('interviewer', 'name email avatar targetRole experience')
      .populate('candidate', 'name email avatar targetRole experience');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Verify user is a participant
    if (
      interview.interviewer._id.toString() !== req.user._id.toString() &&
      interview.candidate._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this interview' });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a peer interview (e.g. update status or notes)
 * @route   PUT /api/peer-interviews/:id
 * @access  Private
 */
export const updatePeerInterview = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const interview = await PeerInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Verify authorization
    if (
      interview.interviewer.toString() !== req.user._id.toString() &&
      interview.candidate.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this interview' });
    }

    if (status) interview.status = status;
    if (notes !== undefined) interview.notes = notes;

    await interview.save();

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel/Delete a peer interview
 * @route   DELETE /api/peer-interviews/:id
 * @access  Private
 */
export const cancelPeerInterview = async (req, res, next) => {
  try {
    const interview = await PeerInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (
      interview.interviewer.toString() !== req.user._id.toString() &&
      interview.candidate.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this interview' });
    }

    interview.status = 'cancelled';
    await interview.save();

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ZEGOCLOUD credentials for authenticated users
 * @route   GET /api/peer-interviews/credentials
 * @access  Private
 */
export const getZegoCredentials = async (req, res, next) => {
  try {
    res.json({
      success: true,
      appId: Number(process.env.ZEGOCLOUD_APP_ID),
      serverSecret: process.env.ZEGOCLOUD_SERVER_SECRET,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get details of a single peer interview by Room ID
 * @route   GET /api/peer-interviews/room/:roomId
 * @access  Private
 */
export const getPeerInterviewByRoomId = async (req, res, next) => {
  try {
    const interview = await PeerInterview.findOne({ roomId: req.params.roomId })
      .populate('interviewer', 'name email avatar targetRole experience')
      .populate('candidate', 'name email avatar targetRole experience');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Verify user is a participant
    if (
      interview.interviewer._id.toString() !== req.user._id.toString() &&
      interview.candidate._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this room' });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};


