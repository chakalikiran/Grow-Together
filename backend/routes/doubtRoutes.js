const express = require('express');
const router = express.Router();
const { createDoubt, getDoubts, addReply } = require('../controllers/doubtController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createDoubt)
  .get(protect, getDoubts);

router.post('/:id/reply', protect, addReply);

module.exports = router;
