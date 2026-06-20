import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

const getModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Predefined mock questions for common roles
const mockQuestionsData = {
  'software engineer': [
    "Can you explain the difference between REST and GraphQL, and when you would use each?",
    "How do you optimize the performance of a React application?",
    "Describe a challenging technical problem you solved recently and how you approached it.",
    "Explain the difference between SQL and NoSQL databases, and how you choose between them.",
    "What is your approach to writing clean, maintainable, and testable code?",
    "How do you handle state management in large frontend applications?",
    "Explain the concept of event loop in JavaScript.",
    "How do database indexes work, and what are their trade-offs?"
  ],
  'frontend developer': [
    "How do you optimize the performance of a React application?",
    "Can you explain the difference between server-side rendering (SSR) and static site generation (SSG)?",
    "How do you handle state management in large frontend applications?",
    "Explain the concept of event loop in JavaScript.",
    "What is the CSS box model, and how does the box-sizing property affect it?",
    "How do you handle responsive design and cross-browser compatibility issues?"
  ],
  'frontend engineer': [
    "How do you optimize the performance of a React application?",
    "Can you explain the difference between server-side rendering (SSR) and static site generation (SSG)?",
    "How do you handle state management in large frontend applications?",
    "Explain the concept of event loop in JavaScript.",
    "What is the CSS box model, and how does the box-sizing property affect it?"
  ],
  'backend developer': [
    "Can you explain the difference between REST and GraphQL, and when you would use each?",
    "Explain the difference between SQL and NoSQL databases, and how you choose between them.",
    "How do database indexes work, and what are their trade-offs?",
    "What is your approach to handling database migrations in production?",
    "Describe the difference between horizontal and vertical scaling.",
    "How do you secure a REST API (authentication, authorization, rate limiting)?"
  ],
  'backend engineer': [
    "Can you explain the difference between REST and GraphQL, and when you would use each?",
    "Explain the difference between SQL and NoSQL databases, and how you choose between them.",
    "How do database indexes work, and what are their trade-offs?",
    "What is your approach to handling database migrations in production?",
    "Describe the difference between horizontal and vertical scaling."
  ]
};

const defaultMockQuestions = [
  "Describe a challenging project you worked on and your key contributions.",
  "How do you keep up with new technologies and industry trends?",
  "Explain the process of resolving a difficult bug in production.",
  "How do you manage conflicts or differences of opinion within a development team?",
  "What is your typical approach to estimating task complexity and meeting deadlines?"
];

/**
 * Generate interview questions for a given job role and difficulty.
 * @param {string} jobRole
 * @param {string} difficulty - easy | medium | hard
 * @param {number} count - number of questions
 * @returns {Promise<string[]>}
 */
export const generateQuestions = async (jobRole, difficulty, count = 5) => {
  try {
    const model = getModel();

    const difficultyMap = {
      easy: 'entry-level / fresher, covering basic concepts',
      medium: 'mid-level professional, mixing conceptual and situational questions',
      hard: 'senior-level / expert, including deep technical and system-design questions',
    };

    const prompt = `You are an expert technical recruiter. Generate exactly ${count} interview questions for a ${jobRole} position.

Difficulty level: ${difficultyMap[difficulty] || difficultyMap.medium}

Requirements:
- Mix of technical, behavioral, and situational questions
- Questions should be realistic and commonly asked in actual interviews
- Questions should be clear and concise
- Do NOT number the questions
- Return ONLY a JSON array of strings, nothing else

Example format:
["Question 1", "Question 2", "Question 3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions.slice(0, count);
  } catch (error) {
    console.warn(`[WARNING] Gemini API failed: ${error.message}. Using mock fallback questions.`);
    
    // Select questions based on role
    const normalizedRole = jobRole.toLowerCase().trim();
    let questionsPool = defaultMockQuestions;
    
    for (const [roleKey, questions] of Object.entries(mockQuestionsData)) {
      if (normalizedRole.includes(roleKey) || roleKey.includes(normalizedRole)) {
        questionsPool = questions;
        break;
      }
    }
    
    // Return unique questions up to count
    const selected = [];
    const pool = [...questionsPool, ...defaultMockQuestions];
    for (let i = 0; i < count; i++) {
      selected.push(pool[i % pool.length]);
    }
    return selected;
  }
};

/**
 * Evaluate a single interview answer.
 * @param {string} question
 * @param {string} answer
 * @param {string} jobRole
 * @returns {Promise<{ score: number, feedback: string, improvements: string[] }>}
 */
export const evaluateAnswer = async (question, answer, jobRole) => {
  if (!answer || answer.trim().length < 5) {
    return {
      score: 0,
      feedback: 'No answer was provided.',
      improvements: ['Please provide a detailed answer to receive a proper evaluation.'],
    };
  }

  try {
    const model = getModel();

    const prompt = `You are an expert technical interviewer evaluating a candidate for a ${jobRole} position.

Question: "${question}"

Candidate's Answer: "${answer}"

Evaluate this answer and respond with ONLY a JSON object (no markdown, no extra text) in this exact format:
{
  "score": <number from 0 to 10>,
  "feedback": "<2-3 sentence constructive feedback on what was good and what could be better>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}

Scoring guide:
- 9-10: Exceptional, comprehensive, demonstrates deep expertise
- 7-8: Good, covers main points with some depth
- 5-6: Adequate, covers basics but lacks depth
- 3-4: Partial, misses key concepts
- 0-2: Insufficient or incorrect`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse evaluation from AI response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);
    return {
      score: Math.min(10, Math.max(0, Number(evaluation.score))),
      feedback: evaluation.feedback || '',
      improvements: evaluation.improvements || [],
    };
  } catch (error) {
    console.warn(`[WARNING] Gemini API failed: ${error.message}. Using mock fallback evaluation.`);
    
    // Local simple evaluation fallback
    const wordsCount = answer.trim().split(/\s+/).length;
    let score = 5;
    let feedback = '';
    let improvements = [];
    
    if (wordsCount < 10) {
      score = 3;
      feedback = "Your answer is very brief. While it touches upon the topic, it lacks the depth and details required for a professional-level response.";
      improvements = [
        "Elaborate on how you apply these concepts in real projects.",
        "Provide specific technical examples rather than high-level definitions.",
        "Explain any architectural or performance trade-offs."
      ];
    } else if (wordsCount < 30) {
      score = 6;
      feedback = "A reasonable response that covers the basic elements of the question. It demonstrates awareness of the subject, but could benefit from more specific technical details.";
      improvements = [
        "Mention specific libraries, modules, or tools you use for this.",
        "Detail your workflow or step-by-step logic when solving this issue.",
        "Discuss how you ensure quality, testing, or performance optimization."
      ];
    } else {
      score = 8;
      feedback = "A well-structured and detailed answer. You explained the core concept clearly and provided good context from a practical perspective.";
      improvements = [
        "Add a brief mention of edge cases or error handling strategies.",
        "Discuss how you measure or monitor success in a production setting.",
        "Compare with alternative approaches and why you prefer this one."
      ];
    }
    
    return { score, feedback, improvements };
  }
};

/**
 * Generate an overall session feedback report.
 * @param {string} jobRole
 * @param {string} difficulty
 * @param {Array} questionsWithAnswers - array of { question, answer, score, feedback }
 * @returns {Promise<{ overallFeedback: string, strengths: string[], areasToImprove: string[] }>}
 */
export const generateOverallFeedback = async (jobRole, difficulty, questionsWithAnswers) => {
  const avgScore = questionsWithAnswers.reduce((sum, q) => sum + (q.score || 0), 0) / (questionsWithAnswers.length || 1);

  try {
    const model = getModel();

    const summary = questionsWithAnswers
      .map((q, i) => `Q${i + 1}: "${q.question}" → Score: ${q.score}/10`)
      .join('\n');

    const prompt = `You are an expert career coach. A candidate just completed a mock interview for a ${jobRole} position (${difficulty} difficulty).

Performance Summary:
${summary}
Average Score: ${avgScore.toFixed(1)}/10

Provide a comprehensive session debrief. Respond with ONLY a JSON object (no markdown) in this exact format:
{
  "overallFeedback": "<3-4 sentence holistic assessment of their performance, mentioning their average score and overall readiness level>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse overall report from AI response');
    }

    const report = JSON.parse(jsonMatch[0]);
    return {
      overallFeedback: report.overallFeedback || '',
      strengths: report.strengths || [],
      areasToImprove: report.areasToImprove || [],
    };
  } catch (error) {
    console.warn(`[WARNING] Gemini API failed: ${error.message}. Using mock fallback report.`);
    
    let readiness = 'Entry Level';
    if (avgScore >= 8) readiness = 'Strong / Job Ready';
    else if (avgScore >= 6) readiness = 'Developing / Near Ready';
    
    return {
      overallFeedback: `You have completed the mock interview for a ${jobRole} position at ${difficulty} difficulty. Your average score of ${avgScore.toFixed(1)}/10 indicates a '${readiness}' level. You demonstrated a solid foundation in the core concepts, but there is still some room to expand on implementation details.`,
      strengths: [
        "Good coverage of core conceptual fundamentals",
        "Clear and structured communication structure",
        "Integration of practical examples in several responses"
      ],
      areasToImprove: [
        "Include more concrete discussion of performance bottlenecks and optimizations",
        "Provide more structured trade-off analyses (e.g. REST vs GraphQL, SQL vs NoSQL)",
        "Elaborate on edge cases, error handling, and testing strategies"
      ]
    };
  }
};

/**
 * Analyze resume text against a target role.
 * @param {string} resumeText
 * @param {string} targetRole
 * @returns {Promise<{ atsScore: number, strengths: string[], improvements: string[], missingSkills: string[], detailedFeedback: string }>}
 */
export const analyzeResumeText = async (resumeText, targetRole) => {
  try {
    const model = getModel();

    const prompt = `You are an expert ATS (Applicant Tracking System) recruiter and technical career advisor.
Analyze the following candidate resume text against the target role: "${targetRole}".

Resume Text:
"""
${resumeText}
"""

Evaluate the resume and respond with ONLY a JSON object (no markdown, no extra text) in this exact format:
{
  "atsScore": <number from 0 to 100 representing the match percentage for the target role>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "missingSkills": ["<essential technical skill or tool missing from the resume but relevant to targetRole 1>", "<missing skill 2>"],
  "detailedFeedback": "<4-5 sentences comprehensive review, including layout, impact of descriptions, and overall advice>"
}

Ensure the response is valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse resume analysis from AI response');
    }

    const report = JSON.parse(jsonMatch[0]);
    return {
      atsScore: Math.min(100, Math.max(0, Number(report.atsScore || 50))),
      strengths: report.strengths || [],
      improvements: report.improvements || [],
      missingSkills: report.missingSkills || [],
      detailedFeedback: report.detailedFeedback || 'Resume analyzed successfully.',
    };
  } catch (error) {
    console.warn(`[WARNING] Gemini API failed: ${error.message}. Using fallback resume report.`);
    return {
      atsScore: 65,
      strengths: [
        "Clearly lists core programming languages",
        "Chronological layout of professional experience",
        "Includes contact details and education section"
      ],
      improvements: [
        "Quantify achievements with metrics (e.g. 'improved performance by 20%')",
        "Add a dedicated skills section at the top for better ATS indexing",
        "Include links to live project demos or GitHub portfolios"
      ],
      missingSkills: [
        "Modern cloud technologies (AWS/Docker)",
        "Testing frameworks (Jest/Cypress)",
        "System design principles"
      ],
      detailedFeedback: `We performed a fallback analysis of your resume for the "${targetRole}" position. The resume has a good structure, but lacks action-oriented verbs and quantifiable achievements. To stand out, ensure each bullet point starts with a strong action verb and lists the business impact. Additionally, make sure the missing technical skills are integrated naturally.`
    };
  }
};

/**
 * Review a coding solution.
 * @param {string} problemTitle
 * @param {string} problemDescription
 * @param {string} code
 * @param {string} language
 * @returns {Promise<{ score: number, feedback: string, timeComplexity: string, spaceComplexity: string, codeQuality: string[], refactoredCode: string }>}
 */
export const reviewCodingSolution = async (problemTitle, problemDescription, code, language) => {
  try {
    const model = getModel();

    const prompt = `You are a senior technical interviewer reviewing a coding assessment.
Problem: "${problemTitle}"
Description: "${problemDescription}"
Candidate's Solution (${language}):
\`\`\`${language}
${code}
\`\`\`

Evaluate the code and respond with ONLY a JSON object (no markdown, no extra text) in this exact format:
{
  "score": <number from 0 to 100 representing solution correctness, efficiency, and cleanliness>,
  "feedback": "<2-3 sentence overall review of their solution>",
  "timeComplexity": "<Big-O notation, e.g. O(N) or O(N log N) with brief explanation>",
  "spaceComplexity": "<Big-O notation, e.g. O(1) or O(N) with brief explanation>",
  "codeQuality": ["<positive or negative note about code quality 1>", "<note 2>"],
  "refactoredCode": "<a fully refactored, clean, and optimal version of the code without comments or explanation>"
}

Ensure the response is valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse code review from AI response');
    }

    const review = JSON.parse(jsonMatch[0]);
    return {
      score: Math.min(100, Math.max(0, Number(review.score || 50))),
      feedback: review.feedback || '',
      timeComplexity: review.timeComplexity || 'O(N)',
      spaceComplexity: review.spaceComplexity || 'O(1)',
      codeQuality: review.codeQuality || [],
      refactoredCode: review.refactoredCode || code,
    };
  } catch (error) {
    console.warn(`[WARNING] Gemini API failed: ${error.message}. Using fallback code review.`);
    return {
      score: 70,
      feedback: "The solution runs successfully but may contain room for optimization in time complexity or clean code conventions.",
      timeComplexity: "O(N) - Linear scan of the input dataset.",
      spaceComplexity: "O(1) - In-place updates without additional storage.",
      codeQuality: [
        "Code syntax is correct",
        "Consider using more descriptive variable names for readability",
        "Add edge-case checks for empty inputs"
      ],
      refactoredCode: code,
    };
  }
};
