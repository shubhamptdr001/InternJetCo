import User from '../models/User.js';

/**
 * @desc    Get all users who completed onboarding (except current user) for peer matching
 * @route   GET /api/users
 * @access  Private
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      onboardingComplete: true,
    }).select('name email avatar targetRole skills experience');

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};
