import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay, FiSend, FiArrowRight, FiArrowLeft, FiClock,
  FiBriefcase, FiBarChart2, FiCheckCircle, FiZap, FiAlertCircle,
  FiTarget, FiFileText, FiActivity, FiAward
} from 'react-icons/fi';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  clearCurrentSession,
} from '../redux/slices/interviewSlice';
import toast from 'react-hot-toast';
import './Interview.css';

const JOB_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer',
  'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
  'Mobile Developer', 'Cloud Engineer', 'Data Analyst',
  'QA Engineer', 'Security Engineer', 'Blockchain Developer',
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', desc: 'Fundamentals & concepts', color: '#10b981' },
  { value: 'medium', label: 'Medium', desc: 'Real-world scenarios', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', desc: 'Expert-level depth', color: '#ef4444' },
];

const QUESTION_COUNTS = [5, 8, 10];

// ─── Phases ───
const PHASE_SETUP = 'setup';
const PHASE_SESSION = 'session';
const PHASE_RESULTS = 'results';

// ─── Score color helper ───
const scoreColor = (score) => {
  if (score >= 8) return '#10b981';
  if (score >= 6) return '#f59e0b';
  if (score >= 4) return '#f97316';
  return '#ef4444';
};

const scoreLabel = (score) => {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Needs Work';
};

// ─── Timer hook ───
const useTimer = (active) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const reset = () => setSeconds(0);
  return { seconds, reset };
};

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─── Main Component ───
const Interview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSession, currentEvaluation, loading, evaluating, completing } = useSelector(
    (state) => state.interview
  );

  const [phase, setPhase] = useState(PHASE_SETUP);
  const [config, setConfig] = useState({ jobRole: '', difficulty: 'medium', questionCount: 5 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [showEval, setShowEval] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const textareaRef = useRef(null);

  const { seconds: questionTime, reset: resetQuestionTimer } = useTimer(
    phase === PHASE_SESSION && !showEval
  );
  const { seconds: sessionTime } = useTimer(phase === PHASE_SESSION);

  // Clean up on unmount
  useEffect(() => {
    return () => { dispatch(clearCurrentSession()); };
  }, [dispatch]);

  // Focus textarea when question changes
  useEffect(() => {
    if (phase === PHASE_SESSION && !showEval && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase, showEval, currentIndex]);

  const handleStart = async () => {
    if (!config.jobRole) {
      toast.error('Please select a job role');
      return;
    }
    const result = await dispatch(startInterview(config));
    if (startInterview.fulfilled.match(result)) {
      setPhase(PHASE_SESSION);
      setCurrentIndex(0);
      setSessionAnswers([]);
      toast.success('Interview started! Good luck');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please write an answer before submitting');
      return;
    }

    const result = await dispatch(
      submitAnswer({
        interviewId: currentSession._id,
        questionIndex: currentIndex,
        answer: answer.trim(),
        timeSpent: questionTime,
      })
    );

    if (submitAnswer.fulfilled.match(result)) {
      setSessionAnswers((prev) => [
        ...prev,
        { questionIndex: currentIndex, answer: answer.trim(), timeSpent: questionTime },
      ]);
      setShowEval(true);
    } else {
      toast.error('Failed to submit answer. Please try again.');
    }
  };

  const handleNext = useCallback(async () => {
    const isLast = currentIndex === currentSession.questions.length - 1;

    if (isLast) {
      // Complete the interview
      setTotalTime(sessionTime);
      const result = await dispatch(
        completeInterview({ interviewId: currentSession._id, duration: sessionTime })
      );
      if (completeInterview.fulfilled.match(result)) {
        setPhase(PHASE_RESULTS);
        toast.success('Interview complete! Generating your report...');
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setShowEval(false);
      resetQuestionTimer();
    }
  }, [currentIndex, currentSession, dispatch, sessionTime, resetQuestionTimer]);

  // ─── SETUP PHASE ───
  if (phase === PHASE_SETUP) {
    return (
      <div className="interview-page">
        <div className="interview-bg">
          <div className="interview-orb interview-orb--1" />
          <div className="interview-orb interview-orb--2" />
        </div>

        <motion.div
          className="interview-setup"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button className="interview-back" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="setup-header">
            <div className="setup-icon"><FiTarget size={28} className="icon-grad" style={{ display: 'inline-block' }} /></div>
            <h1 className="setup-title">Start Mock Interview</h1>
            <p className="setup-subtitle">Configure your session and let AI generate tailored questions</p>
          </div>

          <div className="glass-card setup-card">
            {/* Job Role */}
            <div className="setup-section">
              <label className="setup-label">
                <FiBriefcase size={15} /> Job Role
              </label>
              <div className="setup-roles-grid">
                {JOB_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setConfig((c) => ({ ...c, jobRole: role }))}
                    className={`setup-role-chip ${config.jobRole === role ? 'selected' : ''}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="setup-section">
              <label className="setup-label">
                <FiBarChart2 size={15} /> Difficulty
              </label>
              <div className="setup-diff-grid">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setConfig((c) => ({ ...c, difficulty: d.value }))}
                    className={`setup-diff-card ${config.difficulty === d.value ? 'selected' : ''}`}
                    style={{ '--diff-color': d.color }}
                  >
                    <span className="setup-diff-dot" style={{ backgroundColor: d.color, width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginBottom: '8px' }} />
                    <span className="setup-diff-label">{d.label}</span>
                    <span className="setup-diff-desc">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="setup-section">
              <label className="setup-label">
                <FiZap size={15} /> Number of Questions
              </label>
              <div className="setup-count-row">
                {QUESTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setConfig((c) => ({ ...c, questionCount: n }))}
                    className={`setup-count-btn ${config.questionCount === n ? 'selected' : ''}`}
                  >
                    {n} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary setup-start-btn"
              onClick={handleStart}
              disabled={loading || !config.jobRole}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Generating questions...</span>
                </>
              ) : (
                <>
                  <FiPlay size={18} />
                  <span>Start Interview</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── SESSION PHASE ───
  if (phase === PHASE_SESSION && currentSession) {
    const question = currentSession.questions[currentIndex];
    const total = currentSession.questions.length;
    const progress = ((currentIndex + (showEval ? 1 : 0)) / total) * 100;
    const isLast = currentIndex === total - 1;

    return (
      <div className="interview-page">
        <div className="interview-bg">
          <div className="interview-orb interview-orb--1" />
        </div>

        <div className="session-wrapper">
          {/* Top Bar */}
          <div className="session-topbar glass">
            <div className="session-meta">
              <span className="session-role">{currentSession.jobRole}</span>
              <span className={`session-diff diff--${currentSession.difficulty}`}>
                {currentSession.difficulty}
              </span>
            </div>
            <div className="session-progress-text">
              Question {currentIndex + 1} of {total}
            </div>
            <div className="session-timer">
              <FiClock size={14} />
              {formatTime(sessionTime)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="session-progressbar">
            <motion.div
              className="session-progressbar__fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Question + Answer Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="session-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="glass-card session-question-card">
                <div className="session-qnum">Q{currentIndex + 1}</div>
                <p className="session-question-text">{question.question}</p>
                <div className="session-question-timer">
                  <FiClock size={12} />
                  Time on this question: {formatTime(questionTime)}
                </div>
              </div>

              {!showEval ? (
                <div className="glass-card session-answer-card">
                  <label className="session-answer-label">Your Answer</label>
                  <textarea
                    ref={textareaRef}
                    className="session-textarea"
                    placeholder="Type your answer here. Be thorough — the AI evaluates the depth and accuracy of your response..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={8}
                  />
                  <div className="session-answer-footer">
                    <span className="session-char-count">{answer.length} characters</span>
                    <button
                      className="btn-primary"
                      onClick={handleSubmitAnswer}
                      disabled={evaluating || !answer.trim()}
                    >
                      {evaluating ? (
                        <>
                          <div className="spinner" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <FiSend size={16} />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Evaluation Card */
                <motion.div
                  className="glass-card session-eval-card"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="eval-header">
                    <FiCheckCircle size={20} color={scoreColor(currentEvaluation?.score)} />
                    <span className="eval-title">AI Feedback</span>
                    <div
                      className="eval-score"
                      style={{ color: scoreColor(currentEvaluation?.score) }}
                    >
                      <span className="eval-score-num">{currentEvaluation?.score}</span>
                      <span className="eval-score-max">/10</span>
                      <span className="eval-score-label" style={{ color: scoreColor(currentEvaluation?.score) }}>
                        {scoreLabel(currentEvaluation?.score)}
                      </span>
                    </div>
                  </div>

                  <p className="eval-feedback">{currentEvaluation?.feedback}</p>

                  {currentEvaluation?.improvements?.length > 0 && (
                    <div className="eval-improvements">
                      <p className="eval-improvements-title">
                        <FiAlertCircle size={14} /> Areas to improve:
                      </p>
                      <ul className="eval-improvements-list">
                        {currentEvaluation.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    className="btn-primary eval-next-btn"
                    onClick={handleNext}
                    disabled={completing}
                  >
                    {completing ? (
                      <>
                        <div className="spinner" />
                        <span>Generating report...</span>
                      </>
                    ) : isLast ? (
                      <>
                        <FiCheckCircle size={16} />
                        <span>Finish & See Results</span>
                      </>
                    ) : (
                      <>
                        <span>Next Question</span>
                        <FiArrowRight size={16} />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── RESULTS PHASE ───
  if (phase === PHASE_RESULTS) {
    // selectedInterview is set by the completeInterview thunk fulfilled
    return <InterviewResults navigate={navigate} totalTime={totalTime} />;
  }

  return null;
};

// ─── Results Sub-component ───
const InterviewResults = ({ navigate, totalTime }) => {
  const { selectedInterview } = useSelector((state) => state.interview);

  if (!selectedInterview) {
    return (
      <div className="interview-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const { jobRole, difficulty, overallScore, overallFeedback, strengths, areasToImprove, questions } = selectedInterview;
  const scorePercent = (overallScore / 10) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="interview-page">
      <div className="interview-bg">
        <div className="interview-orb interview-orb--1" />
        <div className="interview-orb interview-orb--2" />
      </div>

      <motion.div
        className="results-wrapper"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="award-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <FiAward size={48} className="icon-grad" />
        </div>
        <h1 className="results-title">Interview Complete!</h1>
        <p className="results-subtitle">{jobRole} · {difficulty} difficulty</p>

        {/* Score Ring */}
        <div className="glass-card results-score-card">
          <div className="results-ring-wrapper">
            <svg className="results-ring" viewBox="0 0 120 120" width="160" height="160">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none"
                stroke={scoreColor(overallScore)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="results-ring-label">
              <motion.span
                className="results-ring-score"
                style={{ color: scoreColor(overallScore) }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {overallScore?.toFixed(1)}
              </motion.span>
              <span className="results-ring-max">/10</span>
            </div>
          </div>
          <div className="results-meta">
            <div className="results-meta-item">
              <span className="results-meta-value">{questions?.length}</span>
              <span className="results-meta-label">Questions</span>
            </div>
            <div className="results-meta-divider" />
            <div className="results-meta-item">
              <span className="results-meta-value">{formatTime(totalTime || selectedInterview.duration)}</span>
              <span className="results-meta-label">Duration</span>
            </div>
            <div className="results-meta-divider" />
            <div className="results-meta-item">
              <span className="results-meta-value" style={{ color: scoreColor(overallScore) }}>
                {scoreLabel(overallScore)}
              </span>
              <span className="results-meta-label">Rating</span>
            </div>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="glass-card results-feedback-card">
          <h3 className="results-section-title"><FiFileText size={16} className="icon-grad" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Overall Feedback</h3>
          <p className="results-feedback-text">{overallFeedback}</p>
        </div>

        {/* Strengths & Areas */}
        <div className="results-two-col">
          <div className="glass-card results-col-card">
            <h3 className="results-section-title results-section-title--green"><FiCheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Key Strengths</h3>
            <ul className="results-list">
              {strengths?.map((s, i) => (
                <li key={i} className="results-list-item results-list-item--green">
                  <FiCheckCircle size={14} /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card results-col-card">
            <h3 className="results-section-title results-section-title--amber"><FiTarget size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Areas to Improve</h3>
            <ul className="results-list">
              {areasToImprove?.map((a, i) => (
                <li key={i} className="results-list-item results-list-item--amber">
                  <FiAlertCircle size={14} /> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-Question Breakdown */}
        <div className="glass-card results-breakdown">
          <h3 className="results-section-title"><FiActivity size={16} className="icon-grad" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Performance Breakdown</h3>
          <div className="breakdown-list">
            {questions?.map((q, i) => (
              <div key={i} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-qnum">Q{i + 1}</span>
                  <span className="breakdown-q">{q.question}</span>
                  <div
                    className="breakdown-score"
                    style={{ color: scoreColor(q.score), background: `${scoreColor(q.score)}15` }}
                  >
                    {q.score ?? '—'}/10
                  </div>
                </div>
                {q.answer && (
                  <div className="breakdown-body">
                    <p className="breakdown-answer">
                      <span className="breakdown-answer-label">Your answer:</span> {q.answer}
                    </p>
                    {q.feedback && (
                      <p className="breakdown-feedback">{q.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="results-cta">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button
            className="btn-primary"
            onClick={() => { window.location.reload(); }}
          >
            <FiPlay size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Interview;
