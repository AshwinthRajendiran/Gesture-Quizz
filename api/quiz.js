// Quiz data
const quizData = [
  {
    id: 1,
    question: "Which of the following best describes a Demand-Side Platform (DSP)?",
    options: ["A platform that hosts display ads", "A tool for publishers to serve ads directly", "A platform for media buyers to purchase inventory in real time", "A CRM system used by advertisers"],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "Which of the following platforms aggregates inventory and sells it in bulk to advertisers?",
    options: ["Ad Server", "Data Management Platform", "Ad Network", "DSP"],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "What is the main advantage of using a DSP over an Ad Network?",
    options: ["DSPs are free while Ad Networks are not", "DSPs allow impression-by-impression bidding", "DSPs only work with direct publishers", "DSPs use only third-party data"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which entity enables the real-time buying and selling of ad inventory?",
    options: ["DMP", "Ad Server", "Ad Exchange", "CRM"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "In a second-price auction used in RTB, the winner pays:",
    options: ["Their full bid price", "The average of all bids", "The price of the second-highest bid plus $0.01", "The lowest bid submitted"],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "Why are first-price auctions becoming more popular in AdTech?",
    options: ["They reduce latency in header bidding", "They guarantee higher user engagement", "They increase transparency for advertisers", "They eliminate the need for ad exchanges"],
    correctAnswer: 2
  },
  {
    id: 7,
    question: "A key disadvantage of RTB is:",
    options: ["It only supports desktop ads", "It bypasses all privacy laws", "It may not guarantee premium inventory", "It eliminates user segmentation"],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "What distinguishes PMP (Private Marketplace) from open RTB?",
    options: ["PMP is only for mobile in-app ads", "PMP is open to all advertisers", "PMP allows selective inventory access by invite", "PMP does not use DSPs"],
    correctAnswer: 2
  },
  {
    id: 9,
    question: "Programmatic Direct deals:",
    options: ["Involve no automation", "Are executed entirely by humans", "Combine manual negotiations with automated ad serving", "Are illegal in the EU due to GDPR"],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "Which media buying method gives guaranteed inventory?",
    options: ["Open RTB", "Header Bidding", "Programmatic Direct", "Waterfall Auctions"],
    correctAnswer: 2
  },
  {
    id: 11,
    question: "Which of the following is a form of ad fraud?",
    options: ["Deal ID verification", "Ad stacking in a single ad slot", "CPM optimization", "Frequency capping"],
    correctAnswer: 1
  },
  {
    id: 12,
    question: "Which metric ensures an ad was actually seen by a user?",
    options: ["Click-Through Rate", "Bounce Rate", "Viewable Impression", "Conversion Rate"],
    correctAnswer: 2
  },
  {
    id: 13,
    question: "Ad viewability for a display ad requires:",
    options: ["100% pixels in viewport for 1 second", "50% pixels in viewport for at least 1 second", "All pixels in viewport for 2 seconds", "Full-screen visibility with interaction"],
    correctAnswer: 1
  },
  {
    id: 14,
    question: "Which cookie type is used to track users across multiple domains?",
    options: ["First-party cookie", "Flash cookie", "Third-party cookie", "Session cookie"],
    correctAnswer: 2
  },
  {
    id: 15,
    question: "What is a core goal of Safari's Intelligent Tracking Prevention (ITP)?",
    options: ["Increase ad revenue", "Block malware", "Restrict cross-site user tracking", "Improve site SEO"],
    correctAnswer: 2
  }
];

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
    // Return quiz questions
    res.status(200).json(quizData);
  } else if (req.method === 'POST') {
    // Handle quiz submission
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
    res.status(200).json({ success: true, result });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 