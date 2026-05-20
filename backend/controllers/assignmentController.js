const Assignment = require('../models/Assignment');

// @desc    Create a new assignment (Sprint)
// @route   POST /api/assignments
// @access  Private/Mentor
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    let fileUrl = req.body.fileUrl;
    if (req.file) { fileUrl = req.file.path; }

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      fileUrl,
      mentor: req.user._id,
      feed: []
    });
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all assignments (Sprint Gallery)
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('mentor', 'name role')
      .populate({
        path: 'feed.user',
        select: 'name email role'
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('mentor', 'name role')
      .populate({
        path: 'feed.user',
        select: 'name email role'
      });
    if (!assignment) return res.status(404).json({ success: false, message: 'Sprint not found' });
    res.status(200).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post to Feed
// @route   POST /api/assignments/:id/feed
// @access  Private
exports.postToFeed = async (req, res) => {
  try {
    const { text, linkUrl, isDoubt } = req.body;
    let fileUrl = req.body.fileUrl;
    if (req.file) { fileUrl = req.file.path; }

    if (!text && !fileUrl && !linkUrl) {
      return res.status(400).json({ success: false, message: 'Message must contain text, file, or link' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    assignment.feed.push({
      user: req.user._id,
      text,
      fileUrl,
      linkUrl,
      isDoubt: isDoubt === 'true' || isDoubt === true
    });

    await assignment.save();
    res.status(200).json({ success: true, message: 'Added to feed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle doubt flag on a feed item
// @route   PUT /api/assignments/:id/feed/:messageId/doubt
// @access  Private
exports.toggleFeedDoubt = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Sprint not found' });

    const message = assignment.feed.id(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (message.user.toString() !== req.user._id.toString() && req.user.role !== 'mentor') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    message.isDoubt = !message.isDoubt;
    await assignment.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
