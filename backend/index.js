const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Sample data
const projects = [
  {
    id: 1,
    title: 'Hostel Compass',
    description: 'A comprehensive web application for finding and booking hostels worldwide.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    imageUrl: 'https://via.placeholder.com/600x400?text=Hostel+Compass',
    githubUrl: 'https://github.com/yourusername/hostel-compass',
    liveUrl: 'https://hostel-compass.herokuapp.com'
  },
  {
    id: 2,
    title: 'Portfolio Website',
    description: 'Personal portfolio website showcasing projects and skills.',
    technologies: ['React', 'Tailwind CSS', 'Vite', 'TypeScript'],
    imageUrl: 'https://via.placeholder.com/600x400?text=Portfolio+Website',
    githubUrl: 'https://github.com/yourusername/portfolio',
    liveUrl: 'https://yourportfolio.com'
  },
  {
    id: 3,
    title: 'E-Commerce Platform',
    description: 'Full-featured e-commerce platform with product catalog and shopping cart.',
    technologies: ['React', 'Redux', 'Node.js', 'Express', 'MongoDB'],
    imageUrl: 'https://via.placeholder.com/600x400?text=E-Commerce+Platform',
    githubUrl: 'https://github.com/yourusername/ecommerce',
    liveUrl: 'https://your-ecommerce.herokuapp.com'
  }
];

const skills = [
  { id: 1, name: 'JavaScript', category: 'Frontend', level: 90 },
  { id: 2, name: 'React', category: 'Frontend', level: 85 },
  { id: 3, name: 'Node.js', category: 'Backend', level: 80 },
  { id: 4, name: 'Express', category: 'Backend', level: 85 },
  { id: 5, name: 'MongoDB', category: 'Database', level: 75 },
  { id: 6, name: 'TypeScript', category: 'Frontend', level: 70 },
  { id: 7, name: 'Tailwind CSS', category: 'Frontend', level: 90 }
];

// API Routes
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

app.get('/api/skills', (req, res) => {
  res.json(skills);
});

app.get('/api/skills/:category', (req, res) => {
  const categorySkills = skills.filter(
    s => s.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(categorySkills);
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Contact form submission:', { name, email, message });
  res.status(200).json({ 
    success: true, 
    message: 'Message received! Thank you for contacting us.' 
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});