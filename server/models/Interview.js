import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  score: { type: Number, min: 0, max: 10, default: null },
  feedback: { type: String, default: '' },
  improvements: { type: [String], default: [] },
  timeSpent: { type: Number, default: 0 }, // seconds
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [questionSchema],
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    overallFeedback: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    areasToImprove: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    duration: {
      type: Number, // total seconds
      default: 0,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
