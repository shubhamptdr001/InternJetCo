import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  FiArrowLeft, FiCode, FiCpu, FiPlay, FiCheckCircle,
  FiAlertCircle, FiClock, FiFileText, FiList, FiChevronRight, FiYoutube,
  FiActivity, FiTarget, FiTrendingUp
} from 'react-icons/fi';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AICoding.css';

// Predefined coding problems - shuffled with codechef/leetcode progression
const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    source: 'LeetCode 1',
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    gfgUrl: 'https://www.geeksforgeeks.org/problems/two-sum-closest/',
    embedId: 'KLlXCFG5Tk0',
    desc: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    constraints: '• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists.',
    templates: {
      javascript: 'function twoSum(nums, target) {\n    // Write your code here\n    \n}',
      python: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    source: 'LeetCode 20',
    leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
    gfgUrl: 'https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1',
    embedId: 'WTzjTmaDLd8',
    desc: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.',
    examples: 'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
    constraints: '• 1 <= s.length <= 10^4\n• s consists of parentheses only \'()[]{}\'.',
    templates: {
      javascript: 'function isValid(s) {\n    // Write your code here\n    \n}',
      python: 'def is_valid(s: str) -> bool:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'chef-card-game',
    title: 'Chef and Card Game',
    difficulty: 'Easy',
    source: 'CodeChef CRDGAME',
    leetcodeUrl: 'https://www.codechef.com/problems/CRDGAME',
    gfgUrl: 'https://www.geeksforgeeks.org/problems/sum-of-digits1723/1',
    embedId: 'W32N9rCskg4',
    desc: 'Chef and Morty are playing a game with cards. Each card has a power value (integer). In each round, they compare the sum of digits of their card power. The player with the larger sum of digits gets 1 point; if there is a tie, both get 1 point. Given N rounds, determine who wins or if there is a draw.',
    examples: 'Input: Chef cards = [34, 12], Morty cards = [55, 22]\nRound 1: Chef = 3+4=7, Morty = 5+5=10 -> Morty wins (Morty: 1 pt)\nRound 2: Chef = 1+2=3, Morty = 2+2=4 -> Morty wins (Morty: 2 pts)\nOutput: Morty wins with 2 points.',
    constraints: '• 1 <= N <= 100\n• 1 <= card_power <= 10^9',
    templates: {
      javascript: 'function getWinner(chefCards, mortyCards) {\n    // Write your code here\n    // Return "Chef", "Morty", or "Draw"\n}',
      python: 'def get_winner(chef_cards: list[int], morty_cards: list[int]) -> str:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    string getWinner(vector<int>& chefCards, vector<int>& mortyCards) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'chef-subarray',
    title: 'Chef and Subarrays',
    difficulty: 'Medium',
    source: 'CodeChef SUBINC',
    leetcodeUrl: 'https://leetcode.com/problems/subarray-product-less-than-k/',
    gfgUrl: 'https://www.geeksforgeeks.org/problems/count-subarrays-with-product-less-than-k/1',
    embedId: '8q-pT2pB_8k',
    desc: 'Chef likes non-decreasing subarrays. Given an array `A` of `N` integers, count the number of subarrays of `A` which are non-decreasing. A subarray A[i..j] is non-decreasing if A[k] <= A[k+1] for all i <= k < j.',
    examples: 'Input: A = [1, 4, 2, 3]\nOutput: 6\nExplanation: The non-decreasing subarrays are [1], [4], [2], [3], [1, 4] and [2, 3].',
    constraints: '• 1 <= N <= 10^5\n• 1 <= A[i] <= 10^9',
    templates: {
      javascript: 'function countSubarrays(A) {\n    // Write your code here\n    \n}',
      python: 'def count_subarrays(A: list[int]) -> int:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    long long countSubarrays(vector<int>& A) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'subarray-sum-equals-k',
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    source: 'LeetCode 560',
    leetcodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    gfgUrl: 'https://www.geeksforgeeks.org/problems/subarrays-with-sum-k/1',
    embedId: 'fFVZt-6sHCY',
    desc: 'Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals to `k`. A subarray is a contiguous non-empty sequence of elements within an array.',
    examples: 'Input: nums = [1,1,1], k = 2\nOutput: 2\nExplanation: Subarrays [1,1] at index (0,1) and (1,2) sum to 2.',
    constraints: '• 1 <= nums.length <= 2 * 10^4\n• -1000 <= nums[i] <= 1000\n• -10^7 <= k <= 10^7',
    templates: {
      javascript: 'function subarraySum(nums, k) {\n    // Write your code here\n    \n}',
      python: 'def subarray_sum(nums: list[int], k: int) -> int:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    source: 'LeetCode 42',
    leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    gfgUrl: 'https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1',
    embedId: 'ZI2z5pq0TqA',
    desc: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: 'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.',
    constraints: '• n == height.length\n• 1 <= n <= 2 * 10^4\n• 0 <= height[i] <= 10^5',
    templates: {
      javascript: 'function trap(height) {\n    // Write your code here\n    \n}',
      python: 'def trap(height: list[int]) -> int:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'edit-distance',
    title: 'Edit Distance',
    difficulty: 'Hard',
    source: 'LeetCode 72',
    leetcodeUrl: 'https://leetcode.com/problems/edit-distance/',
    gfgUrl: 'https://www.geeksforgeeks.org/problems/edit-distance3702/1',
    embedId: 'XYi2-LPrWM4',
    desc: 'Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`. You have the following three operations permitted on a word: 1. Insert a character, 2. Delete a character, 3. Replace a character.',
    examples: 'Input: word1 = "horse", word2 = "ros"\nOutput: 3\nExplanation: \nhorse -> rorse (replace \'h\' with \'r\')\nrorse -> rose (remove \'r\')\nrose -> ros (remove \'e\')',
    constraints: '• 0 <= word1.length, word2.length <= 500\n• word1 and word2 consist of lowercase English letters.',
    templates: {
      javascript: 'function minDistance(word1, word2) {\n    // Write your code here\n    \n}',
      python: 'def min_distance(word1: str, word2: str) -> int:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        // Write your code here\n        \n    }\n};'
    }
  }
];

const AICoding = () => {
  const navigate = useNavigate();

  const [selectedProb, setSelectedProb] = useState(PROBLEMS[0]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(PROBLEMS[0].templates.javascript);
  
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Resizable split state
  const [leftWidth, setLeftWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 320 && newWidth <= 800) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Sync template when problem or language changes
  useEffect(() => {
    setCode(selectedProb.templates[language] || '');
  }, [selectedProb, language]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/api/ai/reports?type=coding');
      setHistory(data.reports);
    } catch (err) {
      console.error('Error fetching coding history:', err);
    }
  };

  const handleSelectProblem = (prob) => {
    setSelectedProb(prob);
    setCode(prob.templates[language]);
    setReview(null);
  };

  const handleSubmit = async () => {
    if (code.trim().length < 10) {
      toast.error('Please write some code before submitting.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/ai/code-review', {
        problemTitle: selectedProb.title,
        problemDescription: selectedProb.desc,
        code,
        language
      });
      setReview(data.report);
      toast.success('Code evaluated successfully!');
      fetchHistory(); // refresh history
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit code for review.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryReport = (histReport) => {
    const localProb = PROBLEMS.find(p => p.title === histReport.targetRole);
    if (localProb) {
      setSelectedProb(localProb);
    } else {
      setSelectedProb({
        title: histReport.targetRole,
        difficulty: 'AI Review',
        desc: 'Historical submission details.',
        templates: {}
      });
    }
    
    setLanguage(histReport.details?.language || 'javascript');
    setCode(histReport.details?.solution || '');
    setReview(histReport);
    setShowHistory(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Construct chart data dynamically based on overall score
  const getChartData = (score) => [
    { subject: 'Correctness', score: score, fullMark: 100 },
    { subject: 'Time Efficiency', score: Math.max(30, score - 5), fullMark: 100 },
    { subject: 'Space Efficiency', score: Math.min(100, score + 4), fullMark: 100 },
    { subject: 'Readability', score: Math.max(30, score - 2), fullMark: 100 },
    { subject: 'Robustness', score: Math.max(30, score - 8), fullMark: 100 },
  ];

  return (
    <div className="coding-page">
      <div className="coding-bg">
        <div className="coding-orb coding-orb--1" />
      </div>

      <div className="coding-container">
        {/* Top Header */}
        <header className="coding-header">
          <button className="coding-back" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft size={16} /> Dashboard
          </button>
          
          <div className="header-actions">
            <button 
              className={`history-toggle glass ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
            >
              <FiList size={16} />
              <span>Past Submissions ({history.length})</span>
            </button>
          </div>
        </header>

        {/* History overlay panel */}
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
                  <h3>Coding Reviews</h3>
                  <button className="close-btn" onClick={() => setShowHistory(false)}>&times;</button>
                </div>
                <div className="history-list">
                  {history.length > 0 ? (
                    history.map((h) => (
                      <button 
                        key={h._id} 
                        className="history-item glass"
                        onClick={() => loadHistoryReport(h)}
                      >
                        <div className="history-item-top">
                          <span className="history-item-role">{h.targetRole}</span>
                          <span className="history-item-score" style={{ color: getScoreColor(h.score) }}>
                            {h.score}/100
                          </span>
                        </div>
                        <span className="history-item-date">
                          {h.details?.language?.toUpperCase()} · {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="history-empty">No past coding reviews.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          className="coding-layout"
          style={{ 
            gridTemplateColumns: window.innerWidth > 1024 ? `${leftWidth}px 8px 1fr` : '1fr' 
          }}
        >
          {/* LEFT SIDEBAR: Problem Selection & Details */}
          <div className="coding-panel-left glass-card">
            <div className="problem-selector-group">
              <label className="panel-label">Select Problem</label>
              <div className="problems-dropdown-list">
                {PROBLEMS.map((prob) => (
                  <button
                    key={prob.id}
                    className={`problem-select-chip glass ${selectedProb.id === prob.id ? 'selected' : ''}`}
                    onClick={() => handleSelectProblem(prob)}
                  >
                    <div>
                      <span className="prob-chip-title">{prob.title}</span>
                      <span className="prob-chip-source">{prob.source}</span>
                    </div>
                    <span className={`diff-tag diff--${prob.difficulty.toLowerCase()}`}>
                      {prob.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Details */}
            <div className="problem-details">
              <h2 className="problem-title">{selectedProb.title}</h2>
              <div className="problem-desc-block">
                <p className="section-subtitle">Problem Description</p>
                <p className="desc-text">{selectedProb.desc}</p>
              </div>

              {selectedProb.examples && (
                <div className="problem-example-block">
                  <p className="section-subtitle">Examples</p>
                  <pre className="example-pre glass">{selectedProb.examples}</pre>
                </div>
              )}

              {selectedProb.constraints && (
                <div className="problem-constraints-block">
                  <p className="section-subtitle">Constraints</p>
                  <pre className="constraints-pre">{selectedProb.constraints}</pre>
                </div>
              )}
            </div>
          </div>

          {/* RESIZER BAR */}
          {window.innerWidth > 1024 && (
            <div 
              className={`layout-resizer ${isResizing ? 'resizing' : ''}`}
              onMouseDown={startResizing}
            />
          )}

          {/* RIGHT SIDE: Editor & Evaluation Output */}
          <div className="coding-panel-right">
            {!review ? (
              <div className="editor-workspace glass-card">
                {/* Editor Header */}
                <div className="editor-header">
                  <div className="editor-header-left">
                    <FiCode className="icon-grad" size={18} />
                    <span className="editor-title">Editor Sandbox</span>
                  </div>

                  <div className="editor-controls">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="lang-select glass"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                </div>

                {/* Monaco Editor Component */}
                <div className="editor-container">
                  <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      cursorBlinking: 'smooth',
                      fontFamily: 'Fira Code, Source Code Pro, Consolas, Monaco, monospace',
                      padding: { top: 16 },
                      scrollbar: {
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                      }
                    }}
                  />
                </div>

                {/* Submit Panel */}
                <div className="editor-footer">
                  <button 
                    onClick={handleSubmit} 
                    className="btn-primary evaluate-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" />
                        <span>Analyzing your code...</span>
                      </>
                    ) : (
                      <>
                        <FiPlay size={16} />
                        <span>Analyze your code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* CODE REVIEW RESULTS PANEL */
              <motion.div 
                className="review-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Score & overview */}
                <div className="glass-card review-overview">
                  <div className="score-details-row">
                    <div className="score-gauge-wrapper">
                      <svg className="score-gauge" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="44" fill="none"
                          stroke={getScoreColor(review.score)}
                          strokeWidth="8"
                          strokeDasharray={276}
                          initial={{ strokeDashoffset: 276 }}
                          animate={{ strokeDashoffset: 276 - (review.score / 100) * 276 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          transform="rotate(-90 50 50)"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="score-val" style={{ color: getScoreColor(review.score) }}>
                        <span className="number">{review.score}</span>
                        <span className="percent">/100</span>
                      </div>
                    </div>

                    <div className="review-overview-meta">
                      <span className="overview-pill">Assessment Report</span>
                      <h3>AI Code Evaluation</h3>
                      <p className="overall-feedback">{review.feedback}</p>
                    </div>
                  </div>
                </div>

                {/* Complexities */}
                <div className="complexity-row">
                  <div className="glass-card complexity-card">
                    <FiClock className="complexity-icon" size={18} />
                    <div className="complexity-card-text">
                      <span className="complexity-label">Time Complexity</span>
                      <span className="complexity-value">{review.details?.timeComplexity}</span>
                    </div>
                  </div>
                  <div className="glass-card complexity-card">
                    <FiFileText className="complexity-icon" size={18} />
                    <div className="complexity-card-text">
                      <span className="complexity-label">Space Complexity</span>
                      <span className="complexity-value">{review.details?.spaceComplexity}</span>
                    </div>
                  </div>
                </div>

                {/* Radar chart analysis */}
                <div className="glass-card chart-card-wrapper">
                  <h4 className="card-section-title"><FiTrendingUp size={16} className="icon-grad" /> Skill Analysis Matrix</h4>
                  <div className="radar-chart-container">
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getChartData(review.score)}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
                        <Radar
                          name="Metrics"
                          dataKey="score"
                          stroke={getScoreColor(review.score)}
                          fill={getScoreColor(review.score)}
                          fillOpacity={0.25}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resources: Youtube walkthrough & links */}
                <div className="glass-card resources-card">
                  <h4 className="card-section-title"><FiYoutube size={16} className="youtube-icon" /> Learning Resources</h4>
                  <div className="resources-grid">
                    <div className="practice-links-col">
                      <p className="resources-subtitle">Practice Platform Links</p>
                      <div className="practice-buttons-row">
                        {selectedProb.leetcodeUrl && (
                          <a href={selectedProb.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="practice-link leetcode-btn">
                            LeetCode
                          </a>
                        )}
                        {selectedProb.gfgUrl && (
                          <a href={selectedProb.gfgUrl} target="_blank" rel="noopener noreferrer" className="practice-link gfg-btn">
                            GeeksforGeeks
                          </a>
                        )}
                      </div>
                    </div>

                    {selectedProb.embedId && (
                      <div className="video-tutorial-col">
                        <p className="resources-subtitle">Video Tutorial Walkthrough</p>
                        <div className="video-player-wrapper">
                          <iframe
                            className="video-iframe"
                            src={`https://www.youtube.com/embed/${selectedProb.embedId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Code Quality Checklist */}
                <div className="glass-card quality-card">
                  <h4 className="card-section-title"><FiCheckCircle size={16} /> Code Quality Analysis</h4>
                  <ul className="quality-list">
                    {review.details?.codeQuality?.map((item, i) => (
                      <li key={i} className="quality-item">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Refactored optimal solution */}
                {review.details?.refactoredCode && (
                  <div className="glass-card optimal-code-card">
                    <h4 className="card-section-title"><FiCode size={16} /> AI Refactored Optimal Code</h4>
                    <pre className="refactored-pre glass">
                      <code>{review.details.refactoredCode}</code>
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="review-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setReview(null);
                      setCode(selectedProb.templates[language]);
                    }}
                  >
                    Edit & Retry
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setReview(null);
                      const currentIndex = PROBLEMS.findIndex(p => p.id === selectedProb.id);
                      const nextIndex = (currentIndex + 1) % PROBLEMS.length;
                      handleSelectProblem(PROBLEMS[nextIndex]);
                    }}
                  >
                    Next Problem
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

export default AICoding;
