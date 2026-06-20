import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import './Onboarding.css';

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
  { value: 'beginner', label: 'Beginner', desc: '0–1 years' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–4 years' },
  { value: 'advanced', label: 'Advanced', desc: '4+ years' },
];

const STEPS = ['Skills', 'Experience', 'Target Role'];

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [step, setStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experience, setExperience] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (step === 0 && selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    if (step === 1 && !experience) {
      toast.error('Please select your experience level');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    if (!targetRole) {
      toast.error('Please select your target role');
      return;
    }

    const result = await dispatch(
      updateProfile({
        skills: selectedSkills,
        experience,
        targetRole,
        onboardingComplete: true,
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile set up! Welcome to InternJetCo');
      navigate('/dashboard');
    } else {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding__bg">
        <div className="onboarding__orb onboarding__orb--1" />
        <div className="onboarding__orb onboarding__orb--2" />
      </div>

      <motion.div
        className="onboarding__card glass"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="onboarding__header">
          <div className="onboarding__logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#ob-grad)" />
              <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="ob-grad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="onboarding__logo-text">Intern<span className="gradient-text">JetCo</span></span>
          </div>
          <h1 className="onboarding__title">Let&apos;s set up your profile</h1>
          <p className="onboarding__subtitle">Tell us about yourself so we can tailor your interview experience</p>
        </div>

        {/* Progress Steps */}
        <div className="onboarding__steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`onboarding__step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="onboarding__step-dot">
                {i < step ? '✓' : i + 1}
              </div>
              <span className="onboarding__step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="onboarding__step-line" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="skills"
              className="onboarding__content"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="onboarding__section-title">
                What are your skills?
                {selectedSkills.length > 0 && (
                  <span className="onboarding__badge">{selectedSkills.length} selected</span>
                )}
              </h2>
              <p className="onboarding__section-sub">Select all that apply</p>
              <div className="onboarding__skills-grid">
                {SKILLS_LIST.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`onboarding__skill-chip ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="experience"
              className="onboarding__content"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="onboarding__section-title">Your experience level?</h2>
              <p className="onboarding__section-sub">This helps us set the right interview difficulty</p>
              <div className="onboarding__exp-grid">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setExperience(level.value)}
                    className={`onboarding__exp-card glass-card ${experience === level.value ? 'selected' : ''}`}
                  >
                    <span className="onboarding__exp-label">{level.label}</span>
                    <span className="onboarding__exp-desc">{level.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="role"
              className="onboarding__content"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="onboarding__section-title">Target role?</h2>
              <p className="onboarding__section-sub">What position are you interviewing for?</p>
              <div className="onboarding__roles-grid">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`onboarding__role-chip ${targetRole === role ? 'selected' : ''}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="onboarding__footer">
          {step > 0 && (
            <button className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn-primary onboarding__next" onClick={handleNext}>
              <span>Continue</span>
            </button>
          ) : (
            <button
              className="btn-primary onboarding__next"
              onClick={handleFinish}
              disabled={loading}
            >
              <span>{loading ? 'Saving...' : "Let's go!"}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
