const express = require('express');
const router = express.Router();
const { createNote, getNotes } = require('../controllers/noteController');
const { protect, mentorAuth } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.route('/')
  .post(protect, mentorAuth, upload.single('file'), createNote)
  .get(protect, getNotes);

module.exports = router;
