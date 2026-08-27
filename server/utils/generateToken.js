import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's MongoDB _id
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_test_jwt_secret_key_12345';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Send token as JSON response (stores in httpOnly cookie too)
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  };

  // Remove password from user object before sending
  const userObj = user.toObject();
  delete userObj.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: userObj,
    });
};
