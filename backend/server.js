const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB().then(async () => {
  const User = require('./models/User');
  try {
    if (!(await User.findOne({ email: 'mentor@example.com' }))) {
      await User.create({
        name: 'Senior Mentor',
        email: 'mentor@example.com',
        password: 'password123',
        role: 'mentor'
      });
      console.log('Test Mentor user seeded: mentor@example.com / password123');
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

// Routes (to be added)
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running smoothly.' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
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
