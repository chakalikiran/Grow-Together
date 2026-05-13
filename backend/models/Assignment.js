const mongoose = require('mongoose');

const assignmentSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String }, // Provided by mentor (Optional)
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      submissionUrl: { type: String, required: true },
      submittedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'submitted' }
    }
  ]
}, {
  timestamps: true,
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
