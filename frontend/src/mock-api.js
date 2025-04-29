// This file creates a simple mock API server for testing
// Run with: node mock-api.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Sample data
const articles = [
  {
    id: 1,
    title: "India's Green Hydrogen Mission makes significant progress",
    summary: "The National Green Hydrogen Mission has achieved several milestones in implementation with states announcing policies and major industrial players committing to production facilities.",
    date: "2023-04-29",
    category: "Economy",
    key_concepts: [
      "Green Hydrogen Economy", 
      "Renewable Energy Transition", 
      "Industrial Decarbonization"
    ],
    syllabus_connection: "GS-III: Infrastructure, Energy Sector; Conservation, Environmental Pollution and Degradation",
    potential_questions: [
      "Discuss the significance of Green Hydrogen in India's pursuit of clean energy goals and analyze the challenges in its implementation.",
      "How can the National Green Hydrogen Mission contribute to India's commitment to achieve net-zero emissions?"
    ]
  },
  {
    id: 2,
    title: "Supreme Court ruling on electoral bonds: Transparency in political funding",
    summary: "The Supreme Court has struck down the electoral bond scheme, calling for greater transparency in political funding and directing the disclosure of donor details.",
    date: "2023-04-29",
    category: "Polity",
    key_concepts: [
      "Electoral Transparency", 
      "Campaign Finance", 
      "Constitutional Validity"
    ],
    syllabus_connection: "GS-II: Indian Constitution, Political Funding, Electoral Reforms",
    potential_questions: [
      "Examine the implications of the Supreme Court judgment on electoral bonds for transparency in political funding in India.",
      "Critically analyze the balance between donor privacy and public interest in knowing sources of political funding."
    ]
  },
  {
    id: 3,
    title: "India-Middle East-Europe Economic Corridor (IMEEC) gains momentum",
    summary: "The ambitious IMEEC project involving India, UAE, Saudi Arabia, Jordan, Israel, and European countries is moving forward with feasibility studies and bilateral agreements.",
    date: "2023-04-29",
    category: "International Relations",
    key_concepts: [
      "Economic Corridors", 
      "Strategic Partnerships", 
      "Multimodal Connectivity"
    ],
    syllabus_connection: "GS-II: International Relations; GS-III: Infrastructure, Economic Development",
    potential_questions: [
      "Evaluate the geopolitical and economic significance of the India-Middle East-Europe Economic Corridor (IMEEC).",
      "How does IMEEC fit into India's broader vision of connectivity with West Asia and Europe?"
    ]
  },
  {
    id: 4,
    title: "New Biodiversity Conservation Bill: Implications for Climate Action",
    summary: "The government has introduced a comprehensive Biodiversity Conservation Bill that aims to strengthen protection measures while balancing development needs.",
    date: "2023-04-30",
    category: "Environment",
    key_concepts: [
      "Biodiversity Protection", 
      "Sustainable Development", 
      "Conservation Framework"
    ],
    syllabus_connection: "GS-III: Conservation, Environmental Pollution and Degradation, Environmental Impact Assessment",
    potential_questions: [
      "Critically evaluate the features of the new Biodiversity Conservation Bill and its potential impact on India's environmental governance.",
      "How does the new legislation align with India's international commitments on biodiversity conservation?"
    ]
  },
  {
    id: 5,
    title: "ISRO's Gaganyaan mission advances with successful test flight",
    summary: "ISRO has completed another crucial test for its human spaceflight program, bringing India closer to joining the elite group of nations with human spaceflight capabilities.",
    date: "2023-04-30",
    category: "Science",
    key_concepts: [
      "Space Technology", 
      "Human Spaceflight", 
      "Indigenous Capability Development"
    ],
    syllabus_connection: "GS-III: Science and Technology, Achievements of Indians in Science & Technology",
    potential_questions: [
      "Assess the significance of the Gaganyaan mission in the context of India's space policy and global space diplomacy.",
      "Examine the technological challenges and strategic implications of India's human spaceflight program."
    ]
  }
];

// GET current affairs endpoint
app.get('/api/current-affairs', (req, res) => {
  // Get date from query parameter
  const date = req.query.date;
  
  if (!date) {
    return res.status(400).json({ error: 'Date parameter is required' });
  }
  
  // Filter articles by date
  const filteredArticles = articles.filter(article => article.date === date);
  
  // Add artificial delay to simulate network latency
  setTimeout(() => {
    res.json(filteredArticles);
  }, 800);
});

// GET bookmarks endpoint
app.get('/api/bookmarks', (req, res) => {
  res.json([1, 3]); // Example: articles with ID 1 and 3 are bookmarked
});

// POST to add bookmark
app.post('/api/bookmarks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({ success: true, message: `Article ${id} bookmarked` });
});

// DELETE to remove bookmark
app.delete('/api/bookmarks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({ success: true, message: `Article ${id} bookmark removed` });
});

// Start server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log(`Access the current affairs API at http://localhost:${port}/api/current-affairs?date=2023-04-29`);
}); 