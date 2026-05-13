const Doubt = require('../models/Doubt');

// @desc    Create a doubt
// @route   POST /api/doubts
// @access  Private
exports.createDoubt = async (req, res) => {
  try {
    const { title, description } = req.body;
    const doubt = await Doubt.create({
      title,
      description,
      student: req.user._id,
    });
    res.status(201).json({ success: true, doubt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doubts
// @route   GET /api/doubts
// @access  Private
exports.getDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate('student', 'name')
      .populate('replies.user', 'name role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, doubts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to doubt
// @route   POST /api/doubts/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }
    
    const reply = {
      user: req.user._id,
      text: req.body.text,
    };

    doubt.replies.push(reply);
    
    // Auto-resolve if mentor answers
    if (req.user.role === 'mentor') {
      doubt.status = 'resolved';
    }

    await doubt.save();
    res.status(201).json({ success: true, doubt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
