import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page bg-grid">
      <div className="auth-page__glow" />

      <motion.div
        className="auth-card glass"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {sent ? (
          /* Success State */
          <div className="auth-card__header" style={{ marginBottom: 0 }}>
            <div className="auth-card__success-icon">
              <FiCheckCircle size={48} color="#10b981" />
            </div>
            <h1 className="auth-card__title">Check your email</h1>
            <p className="auth-card__subtitle">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              It will expire in 30 minutes.
            </p>
            <Link to="/login" className="btn-primary auth-form__submit" style={{ marginTop: '1.5rem' }}>
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="auth-card__header">
              <Link to="/login" className="auth-card__back-link">
                <FiArrowLeft size={16} />
                <span>Back to login</span>
              </Link>
              <h1 className="auth-card__title">Forgot password?</h1>
              <p className="auth-card__subtitle">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="forgot-email">Email</label>
                <div className="auth-form__input-wrapper">
                  <FiMail className="auth-form__icon" size={18} />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-form__input"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary auth-form__submit"
                disabled={loading}
              >
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
