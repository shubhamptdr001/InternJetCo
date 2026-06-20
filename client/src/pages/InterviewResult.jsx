import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiClock, FiCalendar, FiFileText, FiTarget, FiActivity } from 'react-icons/fi';
import { fetchInterview } from '../redux/slices/interviewSlice';
import './InterviewResult.css';

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

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const InterviewResult = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedInterview, loading } = useSelector((state) => state.interview);

  useEffect(() => {
    if (id) dispatch(fetchInterview(id));
  }, [id, dispatch]);

  if (loading || !selectedInterview) {
    return (
      <div className="ir-loading">
        <div className="ir-spinner" />
        <p>Loading interview results...</p>
      </div>
    );
  }

  const { jobRole, difficulty, overallScore, overallFeedback, strengths, areasToImprove, questions, duration, createdAt } = selectedInterview;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - ((overallScore / 10) * circumference);

  return (
    <div className="ir-page">
      <div className="ir-bg">
        <div className="ir-orb ir-orb--1" />
        <div className="ir-orb ir-orb--2" />
      </div>

      <motion.div
        className="ir-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button className="ir-back" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Title */}
        <div className="ir-title-section">
          <h1 className="ir-title">Interview Results</h1>
          <div className="ir-meta-pills">
            <span className="ir-pill">{jobRole}</span>
            <span className={`ir-pill ir-pill--diff ir-pill--${difficulty}`}>{difficulty}</span>
            <span className="ir-pill ir-pill--date">
              <FiCalendar size={12} />
              {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Score Card */}
        <div className="glass-card ir-score-card">
          <div className="ir-ring-wrapper">
            <svg viewBox="0 0 120 120" width="150" height="150">
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
            <div className="ir-ring-center">
              <span className="ir-ring-score" style={{ color: scoreColor(overallScore) }}>
                {overallScore?.toFixed(1)}
              </span>
              <span className="ir-ring-max">/10</span>
            </div>
          </div>

          <div className="ir-stats">
            <div className="ir-stat">
              <span className="ir-stat-value">{questions?.length}</span>
              <span className="ir-stat-label">Questions</span>
            </div>
            <div className="ir-stat-divider" />
            <div className="ir-stat">
              <span className="ir-stat-value">{formatTime(duration)}</span>
              <span className="ir-stat-label">Duration</span>
            </div>
            <div className="ir-stat-divider" />
            <div className="ir-stat">
              <span className="ir-stat-value" style={{ color: scoreColor(overallScore) }}>
                {scoreLabel(overallScore)}
              </span>
              <span className="ir-stat-label">Rating</span>
            </div>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="glass-card ir-section">
          <h3 className="ir-section-title"><FiFileText size={16} className="icon-grad" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Overall Feedback</h3>
          <p className="ir-text">{overallFeedback}</p>
        </div>

        {/* Strengths + Improve */}
        <div className="ir-two-col">
          <div className="glass-card ir-section">
            <h3 className="ir-section-title ir-section-title--green"><FiCheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Key Strengths</h3>
            <ul className="ir-list">
              {strengths?.map((s, i) => (
                <li key={i} className="ir-list-item ir-list-item--green">
                  <FiCheckCircle size={13} /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card ir-section">
            <h3 className="ir-section-title ir-section-title--amber"><FiTarget size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Areas to Improve</h3>
            <ul className="ir-list">
              {areasToImprove?.map((a, i) => (
                <li key={i} className="ir-list-item ir-list-item--amber">
                  <FiAlertCircle size={13} /> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="glass-card ir-section">
          <h3 className="ir-section-title"><FiActivity size={16} className="icon-grad" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Performance Breakdown</h3>
          <div className="ir-breakdown">
            {questions?.map((q, i) => (
              <div key={i} className="ir-breakdown-item">
                <div className="ir-breakdown-header">
                  <span className="ir-qnum">Q{i + 1}</span>
                  <p className="ir-question">{q.question}</p>
                  <div
                    className="ir-score-badge"
                    style={{ color: scoreColor(q.score), background: `${scoreColor(q.score)}18` }}
                  >
                    {q.score ?? '—'}/10
                  </div>
                </div>
                {q.answer && (
                  <div className="ir-breakdown-body">
                    <p className="ir-answer">
                      <strong>Answer:</strong> {q.answer}
                    </p>
                    {q.feedback && <p className="ir-feedback">{q.feedback}</p>}
                    {q.improvements?.length > 0 && (
                      <ul className="ir-improvements">
                        {q.improvements.map((imp, j) => (
                          <li key={j}>→ {imp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="ir-cta">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="btn-primary" onClick={() => navigate('/interview')}>
            New Interview
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewResult;
