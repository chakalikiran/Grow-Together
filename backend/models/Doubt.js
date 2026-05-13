const mongoose = require('mongoose');

const replySchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const doubtSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  replies: [replySchema]
}, {
  timestamps: true,
});

const Doubt = mongoose.model('Doubt', doubtSchema);
module.exports = Doubt;
