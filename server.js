const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Quiz data
const quizData = [
  {
    id: 1,
    question: "Which of the following best describes a Demand-Side Platform (DSP)?",
    options: ["A platform for media buyers to purchase inventory in real time", "A tool for publishers to serve ads directly", "A platform that hosts display ads", "A CRM system used by advertisers"],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Which of the following platforms aggregates inventory and sells it in bulk to advertisers?",
    options: ["Ad Network", "Ad Server", "Data Management Platform", "DSP"],
    correctAnswer: 0
  },
  {
    id: 3,
    question: "What is the main advantage of using a DSP over an Ad Network?",
    options: ["DSPs use only third-party data", "DSPs allow impression-by-impression bidding", "DSPs are free while Ad Networks are not", "DSPs only work with direct publishers"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which entity enables the real-time buying and selling of ad inventory?",
    options: ["Ad Exchange", "DMP", "CRM", "Ad Server"],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "In a second-price auction used in RTB, the winner pays:",
    options: ["Their full bid price", "The average of all bids", "The lowest bid submitted", "The price of the second-highest bid plus $0.01"],
    correctAnswer: 3
  },
  {
    id: 6,
    question: "Why are first-price auctions becoming more popular in AdTech?",
    options: ["They eliminate the need for ad exchanges", "They guarantee higher user engagement", "They reduce latency in header bidding", "They increase transparency for advertisers"],
    correctAnswer: 3
  },
  {
    id: 7,
    question: "A key disadvantage of RTB is:",
    options: ["It eliminates user segmentation", "It may not guarantee premium inventory", "It bypasses all privacy laws", "It only supports desktop ads"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "What distinguishes PMP (Private Marketplace) from open RTB?",
    options: ["PMP is open to all advertisers", "PMP allows selective inventory access by invite", "PMP does not use DSPs", "PMP is only for mobile in-app ads"],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "Programmatic Direct deals:",
    options: ["Combine manual negotiations with automated ad serving", "Are executed entirely by humans", "Are illegal in the EU due to GDPR", "Involve no automation"],
    correctAnswer: 0
  },
  {
    id: 10,
    question: "Which media buying method gives guaranteed inventory?",
    options: ["Programmatic Direct", "Header Bidding", "Open RTB", "Waterfall Auctions"],
    correctAnswer: 0
  },
  {
    id: 11,
    question: "Which of the following is a form of ad fraud?",
    options: ["CPM optimization", "Deal ID verification", "Frequency capping", "Ad stacking in a single ad slot"],
    correctAnswer: 3
  },
  {
    id: 12,
    question: "Which metric ensures an ad was actually seen by a user?",
    options: ["Conversion Rate", "Click-Through Rate", "Bounce Rate", "Viewable Impression"],
    correctAnswer: 3
  },
  {
    id: 13,
    question: "Ad viewability for a display ad requires:",
    options: ["50% pixels in viewport for at least 1 second", "100% pixels in viewport for 1 second", "Full-screen visibility with interaction", "All pixels in viewport for 2 seconds"],
    correctAnswer: 0
  },
  {
    id: 14,
    question: "Which cookie type is used to track users across multiple domains?",
    options: ["Flash cookie", "Third-party cookie", "First-party cookie", "Session cookie"],
    correctAnswer: 1
  },
  {
    id: 15,
    question: "What is a core goal of Safari's Intelligent Tracking Prevention (ITP)?",
    options: ["Block malware", "Improve site SEO", "Increase ad revenue", "Restrict cross-site user tracking"],
    correctAnswer: 3
  }
];


// In-memory storage for quiz results
let quizResults = [];

// API Routes
app.get('/api/quiz', (req, res) => {
  res.json(quizData);
});

app.post('/api/submit', (req, res) => {
  const { answers, score } = req.body;
  const result = {
    id: Date.now(),
    answers,
    score,
    totalQuestions: quizData.length,
    percentage: Math.round((score / quizData.length) * 100),
    timestamp: new Date().toISOString()
  };
  
  quizResults.push(result);
  res.json({ success: true, result });
});

app.get('/api/results', (req, res) => {
  res.json(quizResults);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Hand Gesture Quiz Application is ready!');
}); 