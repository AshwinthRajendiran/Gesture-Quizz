// In-memory storage for quiz results (in production, use a database)
let quizResults = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return all quiz results
    res.status(200).json(quizResults);
  } else if (req.method === 'POST') {
    // Handle quiz submission
    const { answers, score } = req.body;
    
    const result = {
      id: Date.now(),
      answers,
      score,
      totalQuestions: 15, // Hardcoded for now
      percentage: Math.round((score / 15) * 100),
      timestamp: new Date().toISOString()
    };
    
    quizResults.push(result);
    res.status(200).json({ success: true, result });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 