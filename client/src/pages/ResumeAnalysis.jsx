import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload, FiFileText, FiAlertCircle, FiCheckCircle, FiCpu,
  FiArrowLeft, FiList, FiActivity, FiArrowRight, FiTarget,
  FiAlertTriangle, FiEdit3, FiTrendingUp, FiZap
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './ResumeAnalysis.css';

const TARGET_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer',
  'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
  'Mobile Developer', 'Cloud Engineer', 'Data Analyst'
];

const ISSUE_TYPE_CONFIG = {
  'Lack of Metrics':      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: FiTrendingUp },
  'Vague Responsibility': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: FiAlertCircle },
  'Missing Timeline':     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: FiAlertTriangle },
  'Buzzword Overuse':     { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   icon: FiZap },
  'Unclear Job Title':    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: FiEdit3 },
  'Missing Context':      { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: FiAlertCircle },
};

const getIssueConfig = (issueType) =>
  ISSUE_TYPE_CONFIG[issueType] || { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: FiAlertCircle };

const ResumeAnalysis = () => {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/api/ai/reports?type=resume');
      setHistory(data.reports);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      toast.error('Only PDF and plain text (.txt) files are allowed.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB.'); return;
    }
    setSelectedFile(file);
    setResumeText('');
    toast.success(`Selected file: ${file.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetRole) { toast.error('Please select a target role.'); return; }
    if (!selectedFile && !resumeText.trim()) {
      toast.error('Please upload a file or paste your resume text.'); return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('targetRole', targetRole);
    if (selectedFile) { formData.append('resume', selectedFile); }
    else              { formData.append('resumeText', resumeText.trim()); }
    try {
      const { data } = await api.post('/api/ai/resume-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReport(data.report);
      toast.success('Resume analyzed successfully!');
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze resume.');
    } finally { setLoading(false); }
  };

  const loadReportFromHistory = (h) => { setReport(h); setTargetRole(h.targetRole); setShowHistory(false); };

  const getScoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="resume-page">
      <div className="resume-bg">
        <div className="resume-orb resume-orb--1" />
        <div className="resume-orb resume-orb--2" />
      </div>

      <div className="resume-container">
        {/* Header */}
        <div className="resume-header">
          <button className="resume-back-btn" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft size={16} /> Dashboard
          </button>
          <div className="header-actions">
            <button
              className={`history-toggle-btn glass ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
            >
              <FiList size={16} />
              <span>Past Analyses ({history.length})</span>
            </button>
          </div>
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div className="history-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
            >
              <motion.div className="history-panel glass-card"
                initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="history-panel-header">
                  <h3>Resume History</h3>
                  <button className="close-btn" onClick={() => setShowHistory(false)}>&times;</button>
                </div>
                <div className="history-list">
                  {history.length > 0 ? history.map((h) => (
                    <button key={h._id} className="history-item glass" onClick={() => loadReportFromHistory(h)}>
                      <div className="history-item-top">
                        <span className="history-item-role">{h.targetRole}</span>
                        <span className="history-item-score" style={{ color: getScoreColor(h.score) }}>{h.score}%</span>
                      </div>
                      <span className="history-item-date">
                        {new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </button>
                  )) : <p className="history-empty">No past analyses found.</p>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="resume-grid">
          <div className="resume-workspace-col">
            {!report ? (
              /* ─── UPLOAD FORM ─── */
              <motion.div className="glass-card analysis-form-card"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              >
                <div className="form-title-group">
                  <FiCpu className="icon-grad" size={24} />
                  <h2>AI Resume Ambiguity Analyzer</h2>
                  <p>Upload your resume and get a deep ambiguity report — pinpointing every vague phrase, missing metric, and weak claim with concrete rewrite suggestions tailored to your target role.</p>
                </div>

                <form onSubmit={handleSubmit} className="analysis-form">
                  <div className="form-group">
                    <label className="form-label">Target Role</label>
                    <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="form-select glass" required>
                      <option value="">-- Select Target Job Role --</option>
                      {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Resume (.pdf, .txt)</label>
                    <div className="upload-box glass">
                      <input type="file" id="resume-file" accept=".pdf,.txt" onChange={handleFileChange} className="file-input" />
                      <label htmlFor="resume-file" className="upload-label">
                        <FiUpload size={32} className="upload-icon" />
                        {selectedFile
                          ? <span className="file-name">{selectedFile.name}</span>
                          : <><span className="upload-title">Click to upload file</span><span className="upload-subtitle">PDF or Text (max. 5MB)</span></>
                        }
                      </label>
                    </div>
                  </div>

                  <div className="form-divider"><span>OR paste resume text</span></div>

                  <div className="form-group">
                    <label className="form-label">Resume Text</label>
                    <textarea
                      placeholder="Paste the raw text of your resume here..."
                      value={resumeText}
                      onChange={(e) => { setResumeText(e.target.value); setSelectedFile(null); }}
                      className="form-textarea glass"
                      rows={8}
                      disabled={!!selectedFile}
                    />
                  </div>

                  <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                    {loading
                      ? <><div className="spinner" /><span>Analyzing with Gemini AI...</span></>
                      : <><FiActivity size={18} /><span>Analyze Resume</span></>
                    }
                  </button>
                </form>
              </motion.div>
            ) : (
              /* ─── RESULTS PANEL ─── */
              <motion.div className="results-container"
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              >
                {/* ATS Score */}
                <div className="glass-card score-card">
                  <div className="score-details-row">
                    <div className="score-gauge-wrapper">
                      <svg className="score-gauge" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="44" fill="none"
                          stroke={getScoreColor(report.score)} strokeWidth="8"
                          strokeDasharray={276}
                          initial={{ strokeDashoffset: 276 }}
                          animate={{ strokeDashoffset: 276 - (report.score / 100) * 276 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          transform="rotate(-90 50 50)" strokeLinecap="round"
                        />
                      </svg>
                      <div className="score-val" style={{ color: getScoreColor(report.score) }}>
                        <span className="number">{report.score}</span>
                        <span className="percent">%</span>
                      </div>
                    </div>
                    <div className="score-info">
                      <span className="role-pill">{report.targetRole} match</span>
                      <h3>ATS Compatibility Score</h3>
                      <p>Your resume matches approximately <strong>{report.score}%</strong> of typical keyword, format, and skill parameters required for a {report.targetRole} role.</p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Reasoning */}
                <div className="glass-card info-card">
                  <h3><FiFileText size={18} className="icon-grad" /> AI Analysis Summary</h3>
                  <p className="detailed-feedback-text">{report.feedback || report.details?.analysisReasoning}</p>
                </div>

                {/* Strengths + Missing Skills */}
                <div className="results-two-col">
                  <div className="glass-card strengths-card">
                    <h4 className="col-title strengths-title"><FiCheckCircle size={16} /> Key Strengths</h4>
                    <ul className="bullet-list">
                      {report.details?.strengths?.map((s, i) => (
                        <li key={i} className="bullet-item strength-item">{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card keywords-card">
                    <h4 className="col-title" style={{ color: '#f59e0b' }}>
                      <FiTarget size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Missing Skills
                    </h4>
                    <div className="keywords-grid">
                      {report.details?.missingSkills?.length > 0
                        ? report.details.missingSkills.map((kw, i) => <span key={i} className="keyword-badge">{kw}</span>)
                        : <p className="no-missing">✅ No major missing skills identified.</p>
                      }
                    </div>
                  </div>
                </div>

                {/* Ambiguity Cards */}
                {report.details?.ambiguitiesAndSuggestions?.length > 0 && (
                  <div className="ambiguities-section">
                    <div className="ambiguities-header">
                      <FiAlertTriangle size={20} className="icon-grad" />
                      <h3>Ambiguity Report</h3>
                      <span className="ambiguity-count-badge">
                        {report.details.ambiguitiesAndSuggestions.length} issues found
                      </span>
                    </div>
                    <p className="ambiguities-subtitle">
                      Each item below identifies a specific phrase in your resume that may confuse a recruiter or ATS — along with a concrete rewrite suggestion.
                    </p>
                    <div className="ambiguity-cards">
                      {report.details.ambiguitiesAndSuggestions.map((item, i) => {
                        const cfg = getIssueConfig(item.issue_type);
                        const IssueIcon = cfg.icon;
                        return (
                          <motion.div key={i} className="ambiguity-card glass-card"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                          >
                            <div className="ambiguity-card-header">
                              <span className="issue-type-badge"
                                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40` }}
                              >
                                <IssueIcon size={12} /> {item.issue_type}
                              </span>
                              <span className="ambiguity-index">#{i + 1}</span>
                            </div>
                            <div className="ambiguity-original">
                              <span className="ambiguity-label">📌 Original Text</span>
                              <blockquote className="original-quote">"{item.original_text}"</blockquote>
                            </div>
                            <div className="ambiguity-reasoning">
                              <span className="ambiguity-label">🔍 Why It's Ambiguous</span>
                              <p>{item.reasoning}</p>
                            </div>
                            <div className="ambiguity-suggestion">
                              <span className="ambiguity-label suggest-label">✏️ Suggested Fix</span>
                              <p className="suggestion-text">{item.suggestion}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="results-actions">
                  <button className="btn-secondary"
                    onClick={() => { setReport(null); setSelectedFile(null); setResumeText(''); }}
                  >
                    Analyze Another Resume
                  </button>
                  <button className="btn-primary" onClick={() => navigate('/interview')}>
                    <span>Start Mock Interview</span>
                    <FiArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
