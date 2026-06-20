import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiBriefcase, FiStar, FiSave, FiArrowLeft, FiEdit2, FiTarget } from 'react-icons/fi';
import { updateProfile } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import './Profile.css';

const SKILLS_LIST = [
  'JavaScript', 'Python', 'Java', 'C++', 'TypeScript',
  'React', 'Node.js', 'SQL', 'MongoDB', 'AWS',
  'Docker', 'Git', 'Machine Learning', 'Data Structures', 'System Design',
  'REST APIs', 'GraphQL', 'CSS', 'Go', 'Rust',
];

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer',
  'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
  'Mobile Developer', 'Cloud Engineer', 'Security Engineer',
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    experience: 'beginner',
    targetRole: '',
    skills: [],
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        experience: user.experience || 'beginner',
        targetRole: user.targetRole || '',
        skills: user.skills || [],
      });
    }
  }, [user]);

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated!');
      setEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="profile-page">
      <div className="profile-page__bg">
        <div className="profile-orb profile-orb--1" />
        <div className="profile-orb profile-orb--2" />
      </div>

      <motion.div
        className="profile-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back Button */}
        <button className="profile-back" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>

        {/* Profile Card */}
        <div className="glass-card profile-card">
          {/* Avatar & Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{avatarLetter}</span>
              <div className="profile-avatar__glow" />
            </div>
            <div className="profile-header__info">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">
                <FiMail size={14} />
                {user?.email}
              </p>
              <div className="profile-badges">
                <span className="profile-badge profile-badge--role">
                  {user?.role || 'User'}
                </span>
                {user?.targetRole && (
                  <span className="profile-badge profile-badge--target">
                    <FiTarget size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {user.targetRole}
                  </span>
                )}
              </div>
            </div>
            <button
              className={`profile-edit-btn ${editing ? 'active' : ''}`}
              onClick={() => setEditing(!editing)}
            >
              <FiEdit2 size={16} />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="profile-body">
            {/* Name */}
            <div className="profile-field">
              <label className="profile-label">
                <FiUser size={14} /> Full Name
              </label>
              {editing ? (
                <input
                  className="profile-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                />
              ) : (
                <p className="profile-value">{user?.name || '—'}</p>
              )}
            </div>

            {/* Bio */}
            <div className="profile-field">
              <label className="profile-label">
                <FiEdit2 size={14} /> Bio
              </label>
              {editing ? (
                <textarea
                  className="profile-input profile-textarea"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell us about yourself (max 300 chars)"
                  maxLength={300}
                  rows={3}
                />
              ) : (
                <p className="profile-value">{user?.bio || 'No bio yet'}</p>
              )}
            </div>

            {/* Experience Level */}
            <div className="profile-field">
              <label className="profile-label">
                <FiStar size={14} /> Experience Level
              </label>
              {editing ? (
                <div className="profile-exp-row">
                  {EXPERIENCE_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setForm((f) => ({ ...f, experience: l.value }))}
                      className={`profile-exp-btn ${form.experience === l.value ? 'selected' : ''}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="profile-value">
                  {EXPERIENCE_LEVELS.find((l) => l.value === user?.experience)?.label || '—'}
                </p>
              )}
            </div>

            {/* Target Role */}
            <div className="profile-field">
              <label className="profile-label">
                <FiBriefcase size={14} /> Target Role
              </label>
              {editing ? (
                <div className="profile-roles-grid">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setForm((f) => ({ ...f, targetRole: role }))}
                      className={`profile-role-chip ${form.targetRole === role ? 'selected' : ''}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="profile-value">{user?.targetRole || '—'}</p>
              )}
            </div>

            {/* Skills */}
            <div className="profile-field">
              <label className="profile-label">
                <FiStar size={14} /> Skills
                {editing && (
                  <span className="profile-skill-count">{form.skills.length} selected</span>
                )}
              </label>
              {editing ? (
                <div className="profile-skills-grid">
                  {SKILLS_LIST.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`profile-skill-chip ${form.skills.includes(skill) ? 'selected' : ''}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="profile-skills-display">
                  {user?.skills?.length > 0
                    ? user.skills.map((s) => (
                        <span key={s} className="profile-skill-tag">{s}</span>
                      ))
                    : <p className="profile-value">No skills added</p>
                  }
                </div>
              )}
            </div>

            {/* Save Button */}
            {editing && (
              <motion.button
                className="btn-primary profile-save-btn"
                onClick={handleSave}
                disabled={loading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FiSave size={16} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
