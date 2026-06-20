import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser, FiCalendar, FiBarChart2, FiLogOut,
  FiPlay, FiGrid, FiFileText, FiCode
} from 'react-icons/fi';
import { logoutUser } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { label: 'Dashboard', icon: <FiGrid size={18} />, path: '/dashboard' },
    { label: 'AI Mock', icon: <FiPlay size={18} />, path: '/interview' },
    { label: 'AI Resume', icon: <FiFileText size={18} />, path: '/resume-analysis' },
    { label: 'AI Coding', icon: <FiCode size={18} />, path: '/ai-coding' },
    { label: 'Schedule Peer', icon: <FiCalendar size={18} />, path: '/schedule' },
    { label: 'Analytics', icon: <FiBarChart2 size={18} />, path: '/analytics' },
    { label: 'Profile', icon: <FiUser size={18} />, path: '/profile' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Background Orbs */}
      <div className="dashboard-layout__bg">
        <div className="layout-orb layout-orb--1" />
        <div className="layout-orb layout-orb--2" />
      </div>

      {/* Sidebar */}
      <aside className="dashboard-layout__sidebar glass animate-fade-in">
        <div className="layout-sidebar__logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#dash-layout-grad)" />
            <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="dash-layout-grad" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="layout-sidebar__logo-text">Intern<span className="gradient-text">JetCo</span></span>
        </div>

        {/* Navigation */}
        <nav className="layout-sidebar__nav">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`layout-sidebar__link ${isActive ? 'layout-sidebar__link--active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    className="layout-sidebar__link-indicator"
                    layoutId="sidebar-active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="layout-sidebar__footer">
          <div className="layout-sidebar__user glass" onClick={() => navigate('/profile')}>
            <div className="layout-sidebar__avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="layout-sidebar__user-info">
              <span className="layout-sidebar__user-name">{user?.name?.split(' ')[0] || 'User'}</span>
              <span className="layout-sidebar__user-role">{user?.targetRole || 'Interviewee'}</span>
            </div>
          </div>

          <button className="layout-sidebar__logout" onClick={handleLogout}>
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Outlet Container */}
      <main className="dashboard-layout__main">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
