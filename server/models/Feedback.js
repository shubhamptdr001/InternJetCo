import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PeerInterview',
      required: true,
    },
    giverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicalScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    communicationScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    comments: {
      type: String,
      required: [true, 'Please provide constructive feedback comments'],
      minlength: [10, 'Comments must be at least 10 characters'],
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
