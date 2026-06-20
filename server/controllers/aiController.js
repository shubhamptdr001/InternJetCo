import AIReport from '../models/AIReport.js';
import * as gemini from '../services/geminiService.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * @desc    Analyze resume text or uploaded file against a target role
 * @route   POST /api/ai/resume-analyze
 * @access  Private
 */
export const analyzeResume = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    let resumeText = req.body.resumeText || '';

    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'Target role is required.' });
    }

    // If file is uploaded, extract text
    if (req.file) {
      const { buffer, mimetype } = req.file;

      if (mimetype === 'application/pdf') {
        try {
          const parsedPdf = await pdfParse(buffer);
          resumeText = parsedPdf.text;
        } catch (pdfError) {
          return res.status(400).json({
            success: false,
            message: 'Failed to extract text from PDF. Please copy and paste the text instead.',
          });
        }
      } else if (mimetype === 'text/plain') {
        resumeText = buffer.toString('utf-8');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload a PDF or TXT file.',
        });
      }
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is too short or empty. Please provide more content.',
      });
    }

    // Call Gemini to analyze resume
    const analysis = await gemini.analyzeResumeText(resumeText, targetRole);

    // Save report to DB
    const report = await AIReport.create({
      user: req.user._id,
      type: 'resume',
      targetRole,
      score: analysis.atsScore,
      feedback: analysis.detailedFeedback,
      details: {
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        missingSkills: analysis.missingSkills,
      },
    });

    res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a coding solution for AI review
 * @route   POST /api/ai/code-review
 * @access  Private
 */
export const reviewCode = async (req, res, next) => {
  try {
    const { problemTitle, problemDescription, code, language } = req.body;

    if (!problemTitle || !problemDescription || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide problemTitle, problemDescription, code, and language.',
      });
    }

    if (code.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Solution code is too short to evaluate.',
      });
    }

    // Call Gemini to evaluate solution
    const evaluation = await gemini.reviewCodingSolution(
      problemTitle,
      problemDescription,
      code,
      language
    );

    // Save report to DB
    const report = await AIReport.create({
      user: req.user._id,
      type: 'coding',
      targetRole: problemTitle, // using targetRole field for problem title
      score: evaluation.score,
      feedback: evaluation.feedback,
      details: {
        timeComplexity: evaluation.timeComplexity,
        spaceComplexity: evaluation.spaceComplexity,
        codeQuality: evaluation.codeQuality,
        refactoredCode: evaluation.refactoredCode,
        language,
        solution: code,
      },
    });

    res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all AI reports (resume or coding) for logged-in user
 * @route   GET /api/ai/reports
 * @access  Private
 */
export const getAIReports = async (req, res, next) => {
  try {
    const { type } = req.query; // 'resume' or 'coding' or undefined for all
    const query = { user: req.user._id };
    if (type) query.type = type;

    const reports = await AIReport.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single AI report details by ID
 * @route   GET /api/ai/reports/:id
 * @access  Private
 */
export const getAIReport = async (req, res, next) => {
  try {
    const report = await AIReport.findOne({ _id: req.params.id, user: req.user._id });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};
