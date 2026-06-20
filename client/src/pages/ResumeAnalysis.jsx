import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload, FiFileText, FiAlertCircle, FiCheckCircle, FiCpu,
  FiArrowLeft, FiList, FiTrash2, FiActivity, FiArrowRight, FiTarget
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

const ResumeAnalysis = () => {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

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
      toast.error('Only PDF and plain text (.txt) files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    setSelectedFile(file);
    setResumeText(''); // clear text area if file selected
    toast.success(`Selected file: ${file.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetRole) {
      toast.error('Please select a target role.');
      return;
    }

    if (!selectedFile && !resumeText.trim()) {
      toast.error('Please upload a file or paste your resume text.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('targetRole', targetRole);
    
    if (selectedFile) {
      formData.append('resume', selectedFile);
    } else {
      formData.append('resumeText', resumeText.trim());
    }

    try {
      const { data } = await api.post('/api/ai/resume-analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setReport(data.report);
      toast.success('Resume analyzed successfully!');
      fetchHistory(); // refresh history
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const loadReportFromHistory = (histReport) => {
    setReport(histReport);
    setTargetRole(histReport.targetRole);
    setShowHistory(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

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

        {/* History Modal / Side Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              className="history-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
            >
              <motion.div 
                className="history-panel glass-card"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="history-panel-header">
                  <h3>Resume History</h3>
                  <button className="close-btn" onClick={() => setShowHistory(false)}>&times;</button>
                </div>
                <div className="history-list">
                  {history.length > 0 ? (
                    history.map((h) => (
                      <button 
                        key={h._id} 
                        className="history-item glass"
                        onClick={() => loadReportFromHistory(h)}
                      >
                        <div className="history-item-top">
                          <span className="history-item-role">{h.targetRole}</span>
                          <span className="history-item-score" style={{ color: getScoreColor(h.score) }}>
                            {h.score}%
                          </span>
                        </div>
                        <span className="history-item-date">
                          {new Date(h.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="history-empty">No past analyses found.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="resume-grid">
          {/* Main workspace */}
          <div className="resume-workspace-col">
            {!report ? (
              <motion.div 
                className="glass-card analysis-form-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="form-title-group">
                  <FiCpu className="icon-grad" size={24} />
                  <h2>AI Resume Analyzer (ATS)</h2>
                  <p>Optimize your resume against your target job role. Receive match percentages, missing keywords, and layout suggestions instantly.</p>
                </div>

                <form onSubmit={handleSubmit} className="analysis-form">
                  <div className="form-group">
                    <label className="form-label">Target Role</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="form-select glass"
                      required
                    >
                      <option value="">-- Select Target Job Role --</option>
                      {TARGET_ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Resume (.pdf, .txt)</label>
                    <div className="upload-box glass">
                      <input 
                        type="file" 
                        id="resume-file" 
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <label htmlFor="resume-file" className="upload-label">
                        <FiUpload size={32} className="upload-icon" />
                        {selectedFile ? (
                          <span className="file-name">{selectedFile.name}</span>
                        ) : (
                          <>
                            <span className="upload-title">Click to upload file</span>
                            <span className="upload-subtitle">PDF or Text (max. 5MB)</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="form-divider">
                    <span>OR paste resume text</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resume Text</label>
                    <textarea
                      placeholder="Paste the raw text of your resume here if you prefer not to upload a file..."
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setSelectedFile(null); // clear file if text pasted
                      }}
                      className="form-textarea glass"
                      rows={8}
                      disabled={!!selectedFile}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary submit-btn" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" />
                        <span>Analyzing resume with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <FiActivity size={18} />
                        <span>Analyze Resume</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* RESULTS PANEL */
              <motion.div 
                className="results-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="glass-card score-card">
                  <div className="score-details-row">
                    <div className="score-gauge-wrapper">
                      <svg className="score-gauge" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="44" fill="none"
                          stroke={getScoreColor(report.score)}
                          strokeWidth="8"
                          strokeDasharray={276}
                          initial={{ strokeDashoffset: 276 }}
                          animate={{ strokeDashoffset: 276 - (report.score / 100) * 276 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          transform="rotate(-90 50 50)"
                          strokeLinecap="round"
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
                      <p>Your resume matches approximately <strong>{report.score}%</strong> of typical keyword, format, and skill parameters required for a junior/mid level {report.targetRole} role.</p>
                    </div>
                  </div>
                </div>

                {/* Overall Feedback */}
                <div className="glass-card info-card">
                  <h3><FiFileText size={18} className="icon-grad" /> Analysis Summary</h3>
                  <p className="detailed-feedback-text">{report.feedback}</p>
                </div>

                <div className="results-two-col">
                  {/* Strengths */}
                  <div className="glass-card strengths-card">
                    <h4 className="col-title strengths-title"><FiCheckCircle size={16} /> Key Strengths</h4>
                    <ul className="bullet-list">
                      {report.details?.strengths?.map((str, index) => (
                        <li key={index} className="bullet-item strength-item">{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas of Improvement */}
                  <div className="glass-card improvements-card">
                    <h4 className="col-title improvements-title"><FiAlertCircle size={16} /> Areas to Improve</h4>
                    <ul className="bullet-list">
                      {report.details?.improvements?.map((imp, index) => (
                        <li key={index} className="bullet-item improvement-item">{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="glass-card keywords-card">
                  <h3><FiTarget size={18} className="icon-grad" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Missing Skills & Keywords</h3>
                  <p>Incorporate these keywords and skills into your descriptions to increase your search visibility and match percentage:</p>
                  <div className="keywords-grid">
                    {report.details?.missingSkills?.length > 0 ? (
                      report.details.missingSkills.map((keyword, index) => (
                        <span key={index} className="keyword-badge">{keyword}</span>
                      ))
                    ) : (
                      <p className="no-missing">Excellent! No major missing skills identified.</p>
                    )}
                  </div>
                </div>

                <div className="results-actions">
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      setReport(null);
                      setSelectedFile(null);
                      setResumeText('');
                    }}
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
