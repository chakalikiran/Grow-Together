const Note = require('../models/Note');

// @desc    Upload a new note
// @route   POST /api/notes
// @access  Private/Mentor
exports.createNote = async (req, res) => {
  try {
    const { title, description, subject } = req.body;
    let fileUrl = req.body.fileUrl; // fallback
    if (req.file) {
      fileUrl = req.file.path;
    }

    const note = await Note.create({
      title,
      description,
      subject,
      fileUrl,
      mentor: req.user._id,
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate('mentor', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
