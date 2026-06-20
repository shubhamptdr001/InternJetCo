import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiSliders, FiActivity, FiArrowLeft, FiSearch, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import { schedulePeerInterview } from '../redux/slices/peerInterviewSlice';
import toast from 'react-hot-toast';
import './ScheduleInterview.css';

const ScheduleInterview = () => {
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [interviewType, setInterviewType] = useState('dsa');
  const [difficulty, setDifficulty] = useState('medium');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [role, setRole] = useState('interviewer'); // interviewer or candidate

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: scheduling } = useSelector((state) => state.peerInterview);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data } = await api.get('/api/users');
        setPartners(data.users);
      } catch (err) {
        toast.error('Failed to load potential interview partners');
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartner) {
      toast.error('Please select an interview partner');
      return;
    }
    if (!date) {
      toast.error('Please select a date and time');
      return;
    }

    const result = await dispatch(
      schedulePeerInterview({
        partnerId: selectedPartner._id,
        role,
        interviewType,
        difficulty,
        date,
        duration,
      })
    );

    if (schedulePeerInterview.fulfilled.match(result)) {
      toast.success('Peer interview scheduled successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Failed to schedule interview');
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.targetRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        {/* Header */}
        <div className="schedule-header">
          <button className="back-btn glass" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="schedule-title">Schedule a Peer Interview</h1>
          <p className="schedule-subtitle">
            Match with peers, practice system design, DSA, frontend or backend rounds, and swap roles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form-layout">
          {/* Left Column: Config */}
          <div className="schedule-config glass-card">
            <h2 className="section-title">
              <FiSliders size={18} className="icon-grad" />
              <span>Session Details</span>
            </h2>

            <div className="form-group">
              <label>Choose Round Type</label>
              <div className="radio-grid">
                {[
                  { id: 'dsa', label: 'Data Structures & Alg' },
                  { id: 'frontend', label: 'Frontend Dev' },
                  { id: 'backend', label: 'Backend Dev' },
                  { id: 'system-design', label: 'System Design' },
                  { id: 'hr', label: 'Behavioral / HR' },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`radio-card glass ${interviewType === type.id ? 'radio-card--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="interviewType"
                      value={type.id}
                      checked={interviewType === type.id}
                      onChange={() => setInterviewType(type.id)}
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="glass-input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="glass-input"
                >
                  <option value="interviewer">Interviewer</option>
                  <option value="candidate">Candidate</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="glass-input"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Partner Selector */}
          <div className="schedule-partner glass-card">
            <h2 className="section-title">
              <FiUser size={18} className="icon-grad" />
              <span>Select Interview Partner</span>
            </h2>

            <div className="search-bar glass">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, role, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="partner-list">
              {loadingPartners ? (
                <div className="partner-loading">
                  <div className="partner-spinner" />
                  <span>Loading peers...</span>
                </div>
              ) : filteredPartners.length > 0 ? (
                filteredPartners.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => setSelectedPartner(p)}
                    className={`partner-card glass ${
                      selectedPartner?._id === p._id ? 'partner-card--selected' : ''
                    }`}
                  >
                    <div className="partner-avatar">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="partner-info">
                      <div className="partner-name-row">
                        <span className="partner-name">{p.name}</span>
                        {selectedPartner?._id === p._id && (
                          <span className="selected-badge">
                            <FiCheck size={12} /> Selected
                          </span>
                        )}
                      </div>
                      <p className="partner-role">{p.targetRole || 'Software Engineer'}</p>
                      <div className="partner-skills">
                        {p.skills?.slice(0, 3).map((s) => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                        {p.skills?.length > 3 && (
                          <span className="skill-tag">+{p.skills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="partner-empty">
                  <p><FiSearch className="inline-block mr-1" size={14} style={{ verticalAlign: 'middle' }} /> No eligible partners found.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={scheduling || !selectedPartner}
              className="btn-primary schedule-submit-btn"
            >
              {scheduling ? (
                <>
                  <div className="partner-spinner button-spinner" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <FiCalendar size={18} />
                  <span>Schedule Interview</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterview;
