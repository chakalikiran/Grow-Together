const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, submitAssignment } = require('../controllers/assignmentController');
const { protect, mentorAuth } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.route('/')
  .post(protect, mentorAuth, upload.single('file'), createAssignment)
  .get(protect, getAssignments);

router.post('/:id/submit', protect, upload.single('file'), submitAssignment);

module.exports = router;
