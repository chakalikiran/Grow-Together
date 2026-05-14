const Meeting = require('../models/Meeting');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private/Mentor
exports.createMeeting = async (req, res) => {
  try {
    const { title, date, description, roomId, link } = req.body;
    const meeting = await Meeting.create({
      title,
      date,
      description,
      roomId,
      link,
      mentor: req.user._id,
    });
    res.status(201).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private
exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().populate('mentor', 'name').sort('date');
    res.status(200).json({ success: true, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance when joining a meeting
// @route   POST /api/meetings/:id/join
// @access  Private
exports.joinMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    const isAttended = meeting.attendees.some(s => s.toString() === req.user._id.toString());
    if (!isAttended) {
      meeting.attendees.push(req.user._id);
      await meeting.save();
    }
    res.status(200).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate Agora token
// @route   GET /api/meetings/:roomId/token
// @access  Private
exports.agoraToken = async (req, res) => {
  try {
    const appID = process.env.AGORA_APP_ID || '9cf768199e38436495196c52c403d889';
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || '79411d8d98de4d89b2343175e0118e42';
    const channelName = req.params.roomId;
    
    const role = RtcRole.PUBLISHER;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 7200; // 2 hour valid

    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, 0, role, privilegeExpiredTs);
    res.status(200).json({ success: true, token, appID, channelName });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload recording for a meeting
// @route   POST /api/meetings/:id/recording
// @access  Private/Mentor
exports.uploadRecording = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    if (req.file) {
      meeting.recordingUrl = req.file.path;
      await meeting.save();
    }
    res.status(200).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
