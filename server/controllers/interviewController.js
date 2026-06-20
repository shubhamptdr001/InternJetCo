import Interview from '../models/Interview.js';
import * as gemini from '../services/geminiService.js';

/**
 * @desc    Start a new interview session
 * @route   POST /api/interviews/start
 * @access  Private
 */
export const startInterview = async (req, res, next) => {
  try {
    const { jobRole, difficulty = 'medium', questionCount = 5 } = req.body;

    if (!jobRole) {
      return res.status(400).json({ success: false, message: 'Job role is required' });
    }

    const count = Math.min(Math.max(Number(questionCount), 3), 15);

    // Generate questions via Gemini
    let questionTexts;
    try {
      questionTexts = await gemini.generateQuestions(jobRole, difficulty, count);
    } catch (aiError) {
      console.error('Gemini error:', aiError.message);
      questionTexts = [
        `Explain the core concepts and common design patterns in ${jobRole}.`,
        `Describe a challenging problem you solved recently and your technical solution.`,
        `How do you handle performance optimization, scaling, and testing in your workflow?`,
        `What is your approach to collaboration, code reviews, and communication in a team?`,
        `What tools, frameworks, or libraries do you find most essential for ${jobRole} development?`
      ].slice(0, count);
    }

    const questions = questionTexts.map((q) => ({ question: q }));

    const interview = await Interview.create({
      user: req.user._id,
      jobRole,
      difficulty,
      questions,
    });

    res.status(201).json({
      success: true,
      interview: {
        _id: interview._id,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        status: interview.status,
        questions: interview.questions.map((q) => ({
          _id: q._id,
          question: q.question,
        })),
        currentQuestionIndex: 0,
        createdAt: interview.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit an answer for a question
 * @route   POST /api/interviews/:id/answer
 * @access  Private
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const { questionIndex, answer, timeSpent = 0 } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    if (interview.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Interview already completed' });
    }
    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    // Evaluate with Gemini
    let evaluation;
    try {
      evaluation = await gemini.evaluateAnswer(
        interview.questions[questionIndex].question,
        answer,
        interview.jobRole
      );
    } catch (aiError) {
      console.error('Gemini evaluation error:', aiError.message);
      evaluation = {
        score: 5,
        feedback: 'Answer recorded. AI evaluation is currently unavailable.',
        improvements: ['Add GEMINI_API_KEY for real-time AI feedback.'],
      };
    }

    // Update the question
    interview.questions[questionIndex].answer = answer;
    interview.questions[questionIndex].score = evaluation.score;
    interview.questions[questionIndex].feedback = evaluation.feedback;
    interview.questions[questionIndex].improvements = evaluation.improvements;
    interview.questions[questionIndex].timeSpent = timeSpent;
    interview.currentQuestionIndex = Math.min(questionIndex + 1, interview.questions.length - 1);

    await interview.save();

    res.json({
      success: true,
      evaluation,
      currentQuestionIndex: interview.currentQuestionIndex,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete the interview and generate overall feedback
 * @route   POST /api/interviews/:id/complete
 * @access  Private
 */
export const completeInterview = async (req, res, next) => {
  try {
    const { duration = 0 } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    if (interview.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Interview already completed' });
    }

    // Calculate overall score
    const answeredQuestions = interview.questions.filter((q) => q.score !== null);
    const overallScore =
      answeredQuestions.length > 0
        ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length
        : 0;

    // Generate overall feedback
    let report;
    try {
      report = await gemini.generateOverallFeedback(
        interview.jobRole,
        interview.difficulty,
        answeredQuestions
      );
    } catch (aiError) {
      console.error('Gemini report error:', aiError.message);
      report = {
        overallFeedback: `You completed the ${interview.jobRole} interview with an average score of ${overallScore.toFixed(1)}/10.`,
        strengths: ['Completed the interview session'],
        areasToImprove: ['Review individual question feedback for improvement areas'],
      };
    }

    interview.status = 'completed';
    interview.duration = duration;
    interview.overallScore = Math.round(overallScore * 10) / 10;
    interview.overallFeedback = report.overallFeedback;
    interview.strengths = report.strengths;
    interview.areasToImprove = report.areasToImprove;

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
 * @desc    Get all interviews for the logged-in user
 * @route   GET /api/interviews
 * @access  Private
 */
export const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .select('jobRole difficulty overallScore status duration createdAt questions')
      .sort({ createdAt: -1 });

    // Add question count to each
    const formatted = interviews.map((i) => ({
      _id: i._id,
      jobRole: i.jobRole,
      difficulty: i.difficulty,
      overallScore: i.overallScore,
      status: i.status,
      duration: i.duration,
      questionCount: i.questions.length,
      answeredCount: i.questions.filter((q) => q.answer).length,
      createdAt: i.createdAt,
    }));

    res.json({ success: true, interviews: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single interview by ID
 * @route   GET /api/interviews/:id
 * @access  Private
 */
export const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};
