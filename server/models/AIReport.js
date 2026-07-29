import mongoose from 'mongoose';

const AIReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['resume', 'coding'],
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      required: true,
    },
    details: {
      // For resume type — legacy
      missingSkills: [String],
      strengths: [String],
      improvements: [String],
      // For resume type — ambiguity detection (new)
      analysisReasoning: String,
      ambiguitiesAndSuggestions: [
        {
          original_text: String,
          issue_type: String,
          reasoning: String,
          suggestion: String,
        }
      ],

      // For coding type
      timeComplexity: String,
      spaceComplexity: String,
      codeQuality: [String],
      refactoredCode: String,
      language: String,
      solution: String,
    },
  },
  {
    timestamps: true,
  }
);

const AIReport = mongoose.model('AIReport', AIReportSchema);
export default AIReport;
