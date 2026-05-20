const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB().then(async () => {
  const User = require('./models/User');
  const Assignment = require('./models/Assignment');
  try {
    // 1. Seed Users
    let mentor = await User.findOne({ email: 'mentor@example.com' });
    if (!mentor) {
      mentor = await User.create({
        _id: '65f8a2e4b8a1c92d5e3f4a02',
        name: 'Senior Mentor',
        email: 'mentor@example.com',
        password: 'password123',
        role: 'mentor'
      });
      console.log('Test Mentor user seeded: mentor@example.com / password123');
    }

    let student = await User.findOne({ email: 'student@example.com' });
    if (!student) {
      student = await User.create({
        _id: '65f8a2e4b8a1c92d5e3f4a01',
        name: 'Demo Student',
        email: 'student@example.com',
        password: 'password123',
        role: 'student'
      });
      console.log('Test Student user seeded: student@example.com / password123');
    }

    // 2. Seed Dummy Sprint
    if (!(await Assignment.findOne({ title: 'Advanced Nordic Aesthetics' }))) {
      const sprint = await Assignment.create({
        title: 'Advanced Nordic Aesthetics',
        description: 'A deep dive into zero-blue color theory, tactile bento layouts, and spacious UI engineering. This sprint focuses on creating high-depth interfaces using the Nordic Autumn palette.',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        mentor: mentor._id,
        feed: [
          {
            user: mentor._id,
            text: 'Welcome to the new Sprint! Please review the brief and post any questions or insights here.',
            createdAt: new Date()
          },
          {
            user: student._id,
            text: 'This layout feels incredibly spacious. I have some doubts about the shadow depth on mobile.',
            isDoubt: true,
            createdAt: new Date(Date.now() + 1000)
          },
          {
            user: mentor._id,
            text: 'Great start! For the shadows, try using a hint of warm tint in the rgba value to match the bone background.',
            createdAt: new Date(Date.now() + 2000)
          }
        ]
      });
      console.log('Dummy Sprint and Conversation seeded for layout testing.');
    }
  } catch (e) {
    console.log('Seed skip:', e.message);
  }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional: Make uploads folder static for general file access
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running smoothly.' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
