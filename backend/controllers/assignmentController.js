const Assignment = require('../models/Assignment');

// @desc    Create a new assignment
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
    });
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('mentor', 'name')
      .populate('submissions.student', 'name email');
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
  try {
    let submissionUrl = req.body.submissionUrl;
    if (req.file) { submissionUrl = req.file.path; }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Check if student already submitted (simplified: update instead of add duplicate)
    const existingSubmission = assignment.submissions.find(
      (sub) => sub.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      existingSubmission.submissionUrl = submissionUrl;
      existingSubmission.status = 'submitted';
      existingSubmission.submittedAt = Date.now();
    } else {
      assignment.submissions.push({
        student: req.user._id,
        submissionUrl,
        status: 'submitted',
      });
    }

    await assignment.save();
    res.status(200).json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
