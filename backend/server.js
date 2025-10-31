// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

// Import route files
const userRoutes = require('./routes/userRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Error handler middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS origins from env: FRONTEND_URLS (comma-separated) or FRONTEND_URL
const rawFrontendUrls = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
const allowedOrigins = rawFrontendUrls
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn('⚠️  No FRONTEND_URL(S) configured in environment. CORS will allow all origins.');
}

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like curl/Postman) or when no allowedOrigins provided
    if (!origin || allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB (MongoDB Atlas via MONGO_URI)
if (!process.env.MONGO_URI) {
  console.error('❌ Missing MONGO_URI in environment. Set it in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB (Atlas) Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message || err);
    process.exit(1);
  });

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Static portfolio data used by frontend demo pages
const portfolioProjects = [
  {
    id: 1,
    title: 'Hostel Compass',
    description:
      'A comprehensive web application for finding and booking hostels worldwide.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    imageUrl: 'https://via.placeholder.com/600x400?text=Hostel+Compass',
    githubUrl: 'https://github.com/yourusername/hostel-compass',
    liveUrl: 'https://hostel-compass.herokuapp.com'
  },
  {
    id: 2,
    title: 'Portfolio Website',
    description:
      'Personal portfolio website showcasing projects and skills.',
    technologies: ['React', 'Tailwind CSS', 'Vite', 'TypeScript'],
    imageUrl: 'https://via.placeholder.com/600x400?text=Portfolio+Website',
    githubUrl: 'https://github.com/yourusername/portfolio',
    liveUrl: 'https://yourportfolio.com'
  },
  {
    id: 3,
    title: 'E-Commerce Platform',
    description:
      'Full-featured e-commerce platform with product catalog and shopping cart.',
    technologies: ['React', 'Redux', 'Node.js', 'Express', 'MongoDB'],
    imageUrl: 'https://via.placeholder.com/600x400?text=E-Commerce+Platform',
    githubUrl: 'https://github.com/yourusername/ecommerce',
    liveUrl: 'https://your-ecommerce.herokuapp.com'
  },
  {
    id: 4,
    title: 'Weather Dashboard',
    description:
      'Interactive weather application that provides current conditions and forecasts for any location.',
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'OpenWeather API', 'Chart.js'],
    imageUrl: 'https://via.placeholder.com/600x400?text=Weather+Dashboard',
    githubUrl: 'https://github.com/yourusername/weather-app',
    liveUrl: 'https://your-weather-app.netlify.app'
  }
];

const portfolioSkills = [
  { id: 1, name: 'JavaScript', category: 'Frontend', level: 90 },
  { id: 2, name: 'React', category: 'Frontend', level: 85 },
  { id: 3, name: 'Node.js', category: 'Backend', level: 80 },
  { id: 4, name: 'Express', category: 'Backend', level: 85 },
  { id: 5, name: 'MongoDB', category: 'Database', level: 75 },
  { id: 6, name: 'TypeScript', category: 'Frontend', level: 70 },
  { id: 7, name: 'Tailwind CSS', category: 'Frontend', level: 90 }
];

app.get('/api/projects', (_req, res) => {
  res.json({ success: true, data: portfolioProjects });
});

app.get('/api/projects/:id', (req, res) => {
  const projectId = Number.parseInt(req.params.id, 10);
  const project = portfolioProjects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  res.json({ success: true, data: project });
});

app.get('/api/skills', (_req, res) => {
  res.json({ success: true, data: portfolioSkills });
});

app.get('/api/skills/:category', (req, res) => {
  const category = req.params.category.toLowerCase();
  const filtered = portfolioSkills.filter(
    skill => skill.category.toLowerCase() === category
  );
  res.json({ success: true, data: filtered });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and message'
    });
  }

  console.log('Contact form submission:', { name, email, message });
  res.status(200).json({
    success: true,
    message: 'Message received! Thank you for contacting us.'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Catch-all 404 handler for undefined endpoints (Express v5 compatible)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
