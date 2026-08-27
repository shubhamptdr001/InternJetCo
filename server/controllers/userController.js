import User from '../models/User.js';
import { uploadAvatar, deleteFile } from '../services/cloudinaryService.js';

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

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload or update the logged-in user's avatar
 * @route   POST /api/users/avatar
 * @access  Private
 */
export const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const { buffer, mimetype } = req.file;

    const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!ALLOWED_IMAGE_TYPES.has(mimetype)) {
      return res.status(400).json({ success: false, message: 'Only JPG, PNG, WebP, and GIF images are allowed.' });
    }

    // If user already has an avatar, the stable public_id overwrites it automatically
    const result = await uploadAvatar(buffer, req.user._id.toString());

    // Save the new URL to the user document
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar updated successfully.',
      avatarUrl: result.secure_url,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete the logged-in user's avatar
 * @route   DELETE /api/users/avatar
 * @access  Private
 */
export const deleteUserAvatar = async (req, res, next) => {
  try {
    const publicId = `internjetco/avatars/avatar_${req.user._id}`;
    await deleteFile(publicId);

    await User.findByIdAndUpdate(req.user._id, { avatar: '' });

    res.json({ success: true, message: 'Avatar removed.' });
  } catch (error) {
    next(error);
  }
};
