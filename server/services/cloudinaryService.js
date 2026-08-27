import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer    - The file buffer (from multer memory storage)
 * @param {object} options   - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result (includes .secure_url, .public_id)
 */
export const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId
 */
export const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Upload a user avatar image to Cloudinary.
 * Resizes to 400x400, crops to face, converts to WebP.
 * @param {Buffer} buffer
 * @param {string} userId   - Used to create a stable public_id
 */
export const uploadAvatar = (buffer, userId) => {
  return uploadBuffer(buffer, {
    folder: 'internjetco/avatars',
    public_id: `avatar_${userId}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { format: 'webp', quality: 'auto' },
    ],
  });
};

/**
 * Upload a resume file (PDF or image) to Cloudinary for storage.
 * @param {Buffer} buffer
 * @param {string} userId
 * @param {string} mimeType
 */
export const uploadResume = (buffer, userId, mimeType) => {
  const isImage = mimeType.startsWith('image/');
  return uploadBuffer(buffer, {
    folder: 'internjetco/resumes',
    public_id: `resume_${userId}_${Date.now()}`,
    resource_type: isImage ? 'image' : 'raw',
  });
};

export default cloudinary;
