import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiVideo, FiCpu, FiFileText, FiCode,
  FiBarChart2, FiUsers, FiArrowRight,
  FiStar, FiCheckCircle, FiZap, FiShield,
  FiSliders, FiLayout, FiServer, FiLayers
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './Landing.css';

/* ---- Animation variants ---- */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ============================================
   LANDING PAGE
   ============================================ */
const Landing = () => {
  return (
    <div className="landing">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="hero bg-glow-top bg-grid">
        <div className="container hero__inner">
          <motion.div
            className="hero__badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FiZap size={14} />
            <span>AI-Powered Mock Interviews</span>
          </motion.div>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Ace Your Next Interview
            <br />
            <span className="gradient-text">With Confidence</span>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Practice technical and HR interviews with peers, mentors, and
            AI-powered interviewers. Get real-time feedback, track your progress,
            and land your dream job.
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link to="/signup" className="btn-primary btn-lg">
              <span>Start Practicing Free</span>
              <FiArrowRight size={18} style={{ position: 'relative', zIndex: 1 }} />
            </Link>
            <a href="#features" className="btn-secondary btn-lg">
              See How It Works
            </a>
          </motion.div>

          <motion.div
            className="hero__stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {[
              { value: '10K+', label: 'Mock Interviews' },
              { value: '95%', label: 'Success Rate' },
              { value: '500+', label: 'Active Users' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label} className="hero__stat">
                <span className="hero__stat-value">{stat.value}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="section-padding">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.h2 className="section-title" variants={fadeUp}>
              Everything You Need to <span className="gradient-text">Crack Interviews</span>
            </motion.h2>
            <motion.p className="section-subtitle" variants={fadeUp}>
              From AI-powered practice to peer mock interviews, we&apos;ve built every tool
              you need to prepare, practice, and perform.
            </motion.p>

            <div className="features__grid">
              {[
                {
                  icon: <FiVideo size={24} />,
                  title: 'Live Video Interviews',
                  desc: 'Practice with peers in real-time video rooms with screen sharing, chat, and collaborative notes.',
                  color: '#6366f1',
                },
                {
                  icon: <FiCpu size={24} />,
                  title: 'AI Interviewer',
                  desc: 'Get interviewed by AI that generates smart follow-up questions and evaluates your answers instantly.',
                  color: '#8b5cf6',
                },
                {
                  icon: <FiFileText size={24} />,
                  title: 'Resume Analysis',
                  desc: 'Upload your resume and get an ATS score, missing skills analysis, and actionable improvement tips.',
                  color: '#06b6d4',
                },
                {
                  icon: <FiCode size={24} />,
                  title: 'Mock Coding Rounds',
                  desc: 'Solve coding challenges with a built-in editor, timer, and AI-powered code review feedback.',
                  color: '#10b981',
                },
                {
                  icon: <FiBarChart2 size={24} />,
                  title: 'Performance Analytics',
                  desc: 'Track your interview scores, identify weak areas, and see your progress over time with detailed charts.',
                  color: '#f59e0b',
                },
                {
                  icon: <FiUsers size={24} />,
                  title: 'Peer Matching',
                  desc: 'Find interview partners matched by skill level. Schedule sessions and exchange feedback after each round.',
                  color: '#ef4444',
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="glass-card feature-card"
                  variants={fadeUp}
                  custom={i}
                >
                  <div
                    className="feature-card__icon"
                    style={{ background: `${feature.color}15`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="feature-card__title">{feature.title}</h3>
                  <p className="feature-card__desc">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="section-padding" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.h2 className="section-title" variants={fadeUp}>
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </motion.h2>
            <motion.p className="section-subtitle" variants={fadeUp}>
              From signup to your first interview — it takes less than 2 minutes.
            </motion.p>

            <div className="steps__grid">
              {[
                {
                  step: '01',
                  title: 'Create Your Profile',
                  desc: 'Sign up, add your skills, experience level, and upload your resume. Our AI will personalize your experience.',
                  icon: <FiShield size={28} />,
                },
                {
                  step: '02',
                  title: 'Schedule or Start',
                  desc: 'Book a peer interview, start an AI mock session, or jump into a coding round — your call.',
                  icon: <FiZap size={28} />,
                },
                {
                  step: '03',
                  title: 'Get Feedback & Improve',
                  desc: 'Receive detailed scores, written feedback, and AI suggestions. Track your growth on the dashboard.',
                  icon: <FiBarChart2 size={28} />,
                },
              ].map((step, i) => (
                <motion.div key={step.step} className="step-card" variants={fadeUp} custom={i}>
                  <div className="step-card__number">{step.step}</div>
                  <div className="step-card__icon">{step.icon}</div>
                  <h3 className="step-card__title">{step.title}</h3>
                  <p className="step-card__desc">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── INTERVIEW TYPES ─── */}
      <section className="section-padding">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.h2 className="section-title" variants={fadeUp}>
              Practice <span className="gradient-text">Every Interview Type</span>
            </motion.h2>
            <motion.p className="section-subtitle" variants={fadeUp}>
              Prepare for any round — from data structures to HR behavioral questions.
            </motion.p>

            <div className="types__grid">
              {[
                { name: 'DSA', icon: <FiSliders size={20} className="icon-grad" />, desc: 'Data Structures & Algorithms' },
                { name: 'Frontend', icon: <FiLayout size={20} className="icon-grad" />, desc: 'React, CSS, JavaScript' },
                { name: 'Backend', icon: <FiServer size={20} className="icon-grad" />, desc: 'Node.js, APIs, Databases' },
                { name: 'System Design', icon: <FiLayers size={20} className="icon-grad" />, desc: 'Architecture & Scalability' },
                { name: 'HR', icon: <FiUsers size={20} className="icon-grad" />, desc: 'Behavioral & Situational' },
              ].map((type, i) => (
                <motion.div key={type.name} className="type-chip" variants={fadeUp} custom={i}>
                  <span className="type-chip__icon-wrapper">{type.icon}</span>
                  <div>
                    <span className="type-chip__name">{type.name}</span>
                    <span className="type-chip__desc">{type.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="section-padding" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.h2 className="section-title" variants={fadeUp}>
              Loved by <span className="gradient-text">Future Engineers</span>
            </motion.h2>
            <motion.p className="section-subtitle" variants={fadeUp}>
              See what our users are saying about their interview prep journey.
            </motion.p>

            <div className="testimonials__grid">
              {[
                {
                  name: 'Priya Sharma',
                  role: 'SDE @ Amazon',
                  text: 'InternJetCo helped me crack 3 interviews in 2 weeks. The AI follow-up questions are surprisingly close to real interviews!',
                  rating: 5,
                },
                {
                  name: 'Rahul Patel',
                  role: 'Frontend Dev @ Flipkart',
                  text: 'The peer mock interview feature is a game-changer. Getting real feedback from other engineers boosted my confidence dramatically.',
                  rating: 5,
                },
                {
                  name: 'Sneha Gupta',
                  role: 'Intern @ Google',
                  text: 'The resume analysis caught 12 issues my mentors missed. After fixing them, my callback rate doubled. Absolutely worth it.',
                  rating: 5,
                },
              ].map((t, i) => (
                <motion.div key={t.name} className="glass-card testimonial-card" variants={fadeUp} custom={i}>
                  <div className="testimonial-card__stars">
                    {[...Array(t.rating)].map((_, j) => (
                      <FiStar key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p className="testimonial-card__text">&ldquo;{t.text}&rdquo;</p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar-fallback">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <span className="testimonial-card__name">{t.name}</span>
                      <span className="testimonial-card__role">{t.role}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section bg-glow-top">
        <div className="container">
          <motion.div
            className="cta__inner"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="cta__title">
              Ready to <span className="gradient-text">Ace Your Interview?</span>
            </h2>
            <p className="cta__subtitle">
              Join thousands of engineers who are practicing smarter, not harder.
              Start your first mock interview in under 2 minutes — completely free.
            </p>
            <div className="cta__buttons">
              <Link to="/signup" className="btn-primary btn-lg">
                <span>Get Started — It&apos;s Free</span>
                <FiArrowRight size={18} style={{ position: 'relative', zIndex: 1 }} />
              </Link>
            </div>
            <div className="cta__trust">
              <FiCheckCircle size={16} color="#10b981" />
              <span>No credit card required</span>
              <span className="cta__trust-dot">•</span>
              <FiCheckCircle size={16} color="#10b981" />
              <span>Free forever plan</span>
              <span className="cta__trust-dot">•</span>
              <FiCheckCircle size={16} color="#10b981" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
