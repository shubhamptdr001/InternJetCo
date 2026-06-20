import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiActivity, FiTrendingUp, FiCheckCircle, FiUsers, FiAward } from 'react-icons/fi';
import { fetchFeedbackAnalytics } from '../redux/slices/feedbackSlice';
import { fetchInterviews } from '../redux/slices/interviewSlice';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { analytics: feedbacks, loading: feedbackLoading } = useSelector((state) => state.feedback);
  const { history: aiInterviews, loading: aiLoading } = useSelector((state) => state.interview);

  useEffect(() => {
    dispatch(fetchFeedbackAnalytics());
    dispatch(fetchInterviews());
  }, [dispatch]);

  // Process data for charts
  const peerCompleted = feedbacks.length;
  const aiCompleted = aiInterviews.filter((i) => i.status === 'completed').length;
  const totalCompleted = peerCompleted + aiCompleted;

  // Average Scores
  const avgTechnical = peerCompleted > 0
    ? (feedbacks.reduce((sum, f) => sum + f.technicalScore, 0) / peerCompleted).toFixed(1)
    : '0';
  const avgCommunication = peerCompleted > 0
    ? (feedbacks.reduce((sum, f) => sum + f.communicationScore, 0) / peerCompleted).toFixed(1)
    : '0';
  const avgConfidence = peerCompleted > 0
    ? (feedbacks.reduce((sum, f) => sum + f.confidenceScore, 0) / peerCompleted).toFixed(1)
    : '0';

  const peerAvg = peerCompleted > 0
    ? ((Number(avgTechnical) + Number(avgCommunication) + Number(avgConfidence)) / 3).toFixed(1)
    : null;

  const aiScores = aiInterviews
    .filter((i) => i.status === 'completed' && i.overallScore !== null)
    .map((i) => i.overallScore);
  const aiAvg = aiScores.length > 0
    ? (aiScores.reduce((sum, s) => sum + s, 0) / aiScores.length).toFixed(1)
    : null;

  // 1. Line Chart Data: Score Trend (Chronological Peer Feedback)
  const trendData = feedbacks.map((f, index) => ({
    name: `Int. ${index + 1}`,
    Technical: f.technicalScore,
    Communication: f.communicationScore,
    Confidence: f.confidenceScore,
    Average: ((f.technicalScore + f.communicationScore + f.confidenceScore) / 3).toFixed(1),
  }));

  // 2. Radar Chart Data: Current Skill Matrix
  const radarData = [
    { subject: 'Technical', A: Number(avgTechnical), fullMark: 10 },
    { subject: 'Communication', A: Number(avgCommunication), fullMark: 10 },
    { subject: 'Confidence', A: Number(avgConfidence), fullMark: 10 },
  ];

  // 3. Bar Chart Data: Performance by Type (DSA, Frontend, Backend, System Design, HR)
  const types = ['dsa', 'frontend', 'backend', 'system-design', 'hr'];
  const typeLabels = {
    dsa: 'DSA',
    frontend: 'Frontend',
    backend: 'Backend',
    'system-design': 'System Design',
    hr: 'Behavioral',
  };
  const categoryData = types.map((type) => {
    const matchingFeedbacks = feedbacks.filter(
      (f) => f.interviewId?.interviewType === type
    );
    const avg = matchingFeedbacks.length > 0
      ? (
          matchingFeedbacks.reduce(
            (sum, f) => sum + (f.technicalScore + f.communicationScore + f.confidenceScore) / 3,
            0
          ) / matchingFeedbacks.length
        ).toFixed(1)
      : '0.0';

    return {
      name: typeLabels[type],
      Score: Number(avg),
      count: matchingFeedbacks.length,
    };
  });

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  const loading = feedbackLoading || aiLoading;

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <button className="back-btn glass" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="analytics-title">Performance Analytics</h1>
          <p className="analytics-subtitle">
            Track your strengths, progress, and growth across technical and behavioral dimensions.
          </p>
        </div>

        {loading ? (
          <div className="analytics-loading">
            <div className="analytics-spinner" />
            <span>Crunching your performance stats...</span>
          </div>
        ) : totalCompleted === 0 ? (
          <div className="analytics-empty glass-card">
            <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <FiBarChart2 size={48} className="icon-grad" />
            </div>
            <h2>No performance data available</h2>
            <p>
              Complete your first AI Mock Interview or Peer Mock Session to populate charts with scores, skill levels, and trends.
            </p>
            <div className="empty-actions">
              <button className="btn-primary" onClick={() => navigate('/interview')}>
                Start AI Interview
              </button>
              <button className="btn-secondary" onClick={() => navigate('/schedule')}>
                Schedule Peer Interview
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Stats Dashboard Row */}
            <div className="analytics-stats-grid">
              <div className="glass-card stat-metric">
                <div className="metric-icon metric-icon--blue">
                  <FiCheckCircle size={20} />
                </div>
                <div>
                  <h3>Total Completed</h3>
                  <p className="metric-val">{totalCompleted}</p>
                  <span className="metric-sub">
                    {aiCompleted} AI · {peerCompleted} Peer
                  </span>
                </div>
              </div>

              <div className="glass-card stat-metric">
                <div className="metric-icon metric-icon--green">
                  <FiAward size={20} />
                </div>
                <div>
                  <h3>Avg. Peer Score</h3>
                  <p className="metric-val">{peerAvg ? `${peerAvg}/10` : '—'}</p>
                  <span className="metric-sub">Based on peer reviews</span>
                </div>
              </div>

              <div className="glass-card stat-metric">
                <div className="metric-icon metric-icon--purple">
                  <FiActivity size={20} />
                </div>
                <div>
                  <h3>Avg. AI Score</h3>
                  <p className="metric-val">{aiAvg ? `${aiAvg}/10` : '—'}</p>
                  <span className="metric-sub">Based on Gemini evaluation</span>
                </div>
              </div>

              <div className="glass-card stat-metric">
                <div className="metric-icon metric-icon--teal">
                  <FiUsers size={20} />
                </div>
                <div>
                  <h3>Skills Evaluated</h3>
                  <p className="metric-val">3</p>
                  <span className="metric-sub">Tech, Comm, Confidence</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="analytics-charts-layout">
              {/* Chart 1: Trend Line (Peer Feedback over time) */}
              <div className="glass-card chart-container chart-container--full">
                <h3 className="chart-title">
                  <FiTrendingUp size={16} /> Score progression over time (Peer Reviews)
                </h3>
                {peerCompleted > 0 ? (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={trendData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                        <XAxis stroke="#64748b" fontSize={12} dataKey="name" />
                        <YAxis stroke="#64748b" fontSize={12} domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{
                            background: '#1a1f35',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            borderRadius: '8px',
                            color: '#f1f5f9',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                        <Line type="monotone" dataKey="Technical" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Communication" stroke="#06b6d4" strokeWidth={2.5} />
                        <Line type="monotone" dataKey="Confidence" stroke="#10b981" strokeWidth={2.5} />
                        <Line type="monotone" dataKey="Average" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-empty-state">
                    <p>No peer scores logged. Complete a peer interview to see progress timeline.</p>
                  </div>
                )}
              </div>

              {/* Chart 2: Radar Skill Profile */}
              <div className="glass-card chart-container">
                <h3 className="chart-title">Skillset Breakdown</h3>
                {peerCompleted > 0 ? (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(148, 163, 184, 0.08)" />
                        <PolarAngleAxis stroke="#64748b" fontSize={12} dataKey="subject" />
                        <PolarRadiusAxis stroke="#64748b" fontSize={11} angle={30} domain={[0, 10]} />
                        <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-empty-state">
                    <p>Requires peer evaluations to display skill matrix.</p>
                  </div>
                )}
              </div>

              {/* Chart 3: Category Averages */}
              <div className="glass-card chart-container">
                <h3 className="chart-title">Scores by Interview Category</h3>
                {peerCompleted > 0 ? (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                        <XAxis stroke="#64748b" fontSize={11} dataKey="name" />
                        <YAxis stroke="#64748b" fontSize={12} domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{
                            background: '#1a1f35',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            borderRadius: '8px',
                            color: '#f1f5f9',
                          }}
                        />
                        <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-empty-state">
                    <p>Requires peer feedback sessions to list category scores.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
