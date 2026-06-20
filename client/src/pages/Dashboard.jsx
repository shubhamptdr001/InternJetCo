import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiBarChart2, FiPlay, FiClock, FiTrendingUp, FiAward,
  FiChevronRight, FiGrid, FiUser, FiVideo, FiFileText, FiCode, FiCpu, FiUsers
} from 'react-icons/fi';
import { fetchInterviews } from '../redux/slices/interviewSlice';
import { fetchPeerInterviews } from '../redux/slices/peerInterviewSlice';
import toast from 'react-hot-toast';
import './Dashboard.css';

const scoreColor = (score) => {
  if (score >= 8) return '#10b981';
  if (score >= 6) return '#f59e0b';
  if (score >= 4) return '#f97316';
  return '#ef4444';
};

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { history: aiHistory, loading: aiLoading } = useSelector((state) => state.interview);
  const { interviews: peerHistory, loading: peerLoading } = useSelector((state) => state.peerInterview);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'peer'

  useEffect(() => {
    dispatch(fetchInterviews());
    dispatch(fetchPeerInterviews());
  }, [dispatch]);

  // Computed stats
  const aiCompleted = aiHistory.filter((i) => i.status === 'completed');
  const peerCompleted = peerHistory.filter((i) => i.status === 'completed');
  const totalCompleted = aiCompleted.length + peerCompleted.length;

  const stats = [
    {
      label: 'Completed Sessions',
      value: totalCompleted || '0',
      icon: <FiCalendar size={20} />,
      color: '#6366f1',
    },
    {
      label: 'Skills',
      value: user?.skills?.length || 0,
      icon: <FiTrendingUp size={20} />,
      color: '#06b6d4',
    },
    {
      label: 'Scheduled Peer Int.',
      value: peerHistory.filter((i) => i.status === 'scheduled').length || 0,
      icon: <FiVideo size={20} />,
      color: '#a855f7',
    },
    {
      label: 'Experience Level',
      value: user?.experience ? user.experience.charAt(0).toUpperCase() + user.experience.slice(1) : 'Beginner',
      icon: <FiAward size={20} />,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="dashboard-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="dashboard__subtitle">
              {user?.targetRole
                ? `Preparing for ${user.targetRole} · ${user.experience} level`
                : "Here's an overview of your interview journey."}
            </p>
          </div>
          <div className="dashboard__user-badge glass">
            <div className="dashboard__user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className="dashboard__user-name">{user?.name}</span>
              <span className="dashboard__user-role">{user?.targetRole || user?.experience || 'User'}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard__stats">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="stat-card__icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="stat-card__value">{stat.value}</p>
                <p className="stat-card__label">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action CTAs Row */}
        <div className="dashboard__ctas-grid">
          {/* AI Mock Interview CTA */}
          <motion.div
            className="glass-card dashboard__cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="cta-content">
              <div className="cta-icon"><FiCpu size={28} /></div>
              <div>
                <h3 className="cta-title">AI Mock Interview</h3>
                <p className="cta-desc">
                  Practice with our customizable Gemini AI recruiter and receive instant evaluations and feedback.
                </p>
              </div>
            </div>
            <button
              className="btn-primary cta-btn"
              onClick={() => navigate('/interview')}
            >
              <FiPlay size={16} />
              <span>Start AI Interview</span>
            </button>
          </motion.div>

          {/* AI Resume Analyzer CTA */}
          <motion.div
            className="glass-card dashboard__cta"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(168,85,247,0.05))', borderColor: 'rgba(6,182,212,0.2)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="cta-content">
              <div className="cta-icon"><FiFileText size={28} /></div>
              <div>
                <h3 className="cta-title">AI Resume Analyzer</h3>
                <p className="cta-desc">
                  Upload your resume to get an instant ATS score, identify missing skills, and receive layout improvement tips.
                </p>
              </div>
            </div>
            <button
              className="btn-primary cta-btn"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', border: 'none' }}
              onClick={() => navigate('/resume-analysis')}
            >
              <FiFileText size={16} />
              <span>Analyze Resume</span>
            </button>
          </motion.div>

          {/* AI Coding Sandbox CTA */}
          <motion.div
            className="glass-card dashboard__cta"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.05))', borderColor: 'rgba(99,102,241,0.2)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="cta-content">
              <div className="cta-icon"><FiCode size={28} /></div>
              <div>
                <h3 className="cta-title">AI Coding Sandbox</h3>
                <p className="cta-desc">
                  Practice coding challenges inside our Monaco sandbox environment and get real-time complex reviews from Gemini.
                </p>
              </div>
            </div>
            <button
              className="btn-primary cta-btn"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', border: 'none' }}
              onClick={() => navigate('/ai-coding')}
            >
              <FiCode size={16} />
              <span>Open Code Sandbox</span>
            </button>
          </motion.div>

          {/* Peer Mock Interview CTA */}
          <motion.div
            className="glass-card dashboard__cta dashboard__cta--peer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="cta-content">
              <div className="cta-icon"><FiUsers size={28} /></div>
              <div>
                <h3 className="cta-title">Schedule with Peer</h3>
                <p className="cta-desc">
                  Pair up with other platform users to swap roles, practice system design, and conduct mock peer rounds.
                </p>
              </div>
            </div>
            <button
              className="btn-secondary cta-btn"
              style={{ borderColor: 'rgba(168, 85, 247, 0.4)' }}
              onClick={() => navigate('/schedule')}
            >
              <FiCalendar size={16} style={{ color: '#a855f7' }} />
              <span>Schedule Session</span>
            </button>
          </motion.div>
        </div>

        {/* History & Sessions Area */}
        <div className="dashboard__sessions-section glass-card">
          <div className="sessions-header">
            <h2 className="sessions-section-title">Mock Interview History</h2>
            <div className="sessions-tabs">
              <button
                className={`session-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                AI Interviews
              </button>
              <button
                className={`session-tab-btn ${activeTab === 'peer' ? 'active' : ''}`}
                onClick={() => setActiveTab('peer')}
              >
                Peer Sessions
              </button>
            </div>
          </div>

          <div className="sessions-content-area">
            {activeTab === 'ai' ? (
              aiLoading ? (
                <div className="recent-loading">
                  <div className="recent-spinner" />
                  <span>Loading AI sessions...</span>
                </div>
              ) : aiHistory.length > 0 ? (
                <div className="recent-list">
                  {aiHistory.slice(0, 5).map((interview) => (
                    <button
                      key={interview._id}
                      className="recent-item"
                      onClick={() => navigate(`/interview/${interview._id}/result`)}
                    >
                      <div className="recent-item__info">
                        <p className="recent-item__role">{interview.jobRole}</p>
                        <div className="recent-item__meta">
                          <span className={`recent-diff recent-diff--${interview.difficulty}`}>
                            {interview.difficulty}
                          </span>
                          <span className="recent-item__date">
                            <FiCalendar size={11} />
                            {new Date(interview.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                            })}
                          </span>
                          {interview.duration > 0 && (
                            <span className="recent-item__time">
                              <FiClock size={11} />
                              {formatTime(interview.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="recent-item__right">
                        {interview.overallScore !== null ? (
                          <span
                            className="recent-score"
                            style={{ color: scoreColor(interview.overallScore) }}
                          >
                            {interview.overallScore?.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="recent-score recent-score--inprogress">In Progress</span>
                        )}
                        <FiChevronRight size={14} className="recent-chevron" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="recent-empty">
                  <p>No AI interviews yet. Click "Start AI Interview" above to practice!</p>
                </div>
              )
            ) : (
              peerLoading ? (
                <div className="recent-loading">
                  <div className="recent-spinner" />
                  <span>Loading peer sessions...</span>
                </div>
              ) : peerHistory.length > 0 ? (
                <div className="recent-list">
                  {peerHistory.slice(0, 5).map((session) => {
                    const isInterviewer = session.interviewer?._id === user?._id;
                    const partner = isInterviewer ? session.candidate : session.interviewer;
                    return (
                      <div key={session._id} className="recent-item recent-item--peer">
                        <div className="recent-item__info">
                          <p className="recent-item__role">
                            {session.interviewType.toUpperCase()} Round — with {partner?.name || 'Peer'}
                          </p>
                          <div className="recent-item__meta">
                            <span className="peer-role-badge">
                              {isInterviewer ? 'Interviewer' : 'Candidate'}
                            </span>
                            <span className="recent-item__date">
                              <FiCalendar size={11} />
                              {new Date(session.date).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="recent-item__right">
                          {session.status === 'scheduled' ? (
                            <button
                              onClick={() => navigate(`/room/${session.roomId}`)}
                              className="join-room-btn"
                            >
                              <FiVideo size={13} />
                              <span>Join Room</span>
                            </button>
                          ) : (
                            <span className={`peer-status-badge peer-status-badge--${session.status}`}>
                              {session.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="recent-empty">
                  <p>No peer sessions scheduled. Click "Schedule Session" above to invite a peer!</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Profile prompt if onboarding not complete */}
        {!user?.onboardingComplete && (
          <motion.div
            className="glass-card dashboard__onboard-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span>Complete your profile to get personalized interview questions!</span>
            <button className="btn-secondary onboard-btn" onClick={() => navigate('/onboarding')}>
              Complete Profile
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
