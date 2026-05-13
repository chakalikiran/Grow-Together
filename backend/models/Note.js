const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true }, // PDF or Document Link
}, {
  timestamps: true,
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
