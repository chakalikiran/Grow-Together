const express = require('express');
const router = express.Router();
const { createMeeting, getMeetings, joinMeeting, agoraToken, uploadRecording } = require('../controllers/meetingController');
const { protect, mentorAuth } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.route('/')
  .post(protect, mentorAuth, createMeeting)
  .get(protect, getMeetings);

router.post('/:id/join', protect, joinMeeting);
router.get('/:roomId/token', protect, agoraToken);
router.post('/:id/recording', protect, mentorAuth, upload.single('file'), uploadRecording);

module.exports = router;
