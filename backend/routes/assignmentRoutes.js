const express = require('express');
const router = express.Router();
const { 
  createAssignment, 
  getAssignments, 
  getAssignmentById,
  postToFeed, 
  toggleFeedDoubt 
} = require('../controllers/assignmentController');
const { protect, mentorAuth } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.route('/')
  .get(protect, getAssignments)
  .post(protect, mentorAuth, upload.single('file'), createAssignment);

router.get('/:id', protect, getAssignmentById);
router.post('/:id/feed', protect, upload.single('file'), postToFeed);
router.put('/:id/feed/:messageId/doubt', protect, toggleFeedDoubt);

module.exports = router;
