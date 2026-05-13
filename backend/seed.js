const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grow_together');
    
    // Check if user already exists
    const userExists = await User.findOne({ email: 'mentor@example.com' });
    if (userExists) {
      console.log('Mentor already exists! You can log in.');
      process.exit();
    }

    await User.create({
      name: 'Senior Mentor',
      email: 'mentor@example.com',
      password: 'password123', // password will be hashed by the mongoose pre-save hook
      role: 'mentor'
    });

    console.log('Database seeded successfully! You can now log in with:');
    console.log('Email: mentor@example.com');
    console.log('Password: password123');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
