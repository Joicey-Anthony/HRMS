const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/messages/:userId - Get conversation between current user and another user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).populate('sender', 'name role').populate('receiver', 'name role').sort({ createdAt: 1 });
    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/messages - Send message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await Message.create({
      sender: req.user._id, receiver: receiverId, content
    });
    await message.populate('sender', 'name role');
    await message.populate('receiver', 'name role');
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/messages - Get all conversations (list of people you chatted with)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'name role').populate('receiver', 'name role').sort({ createdAt: -1 });
    // Get unique conversations
    const seen = new Set();
    const conversations = [];
    messages.forEach(msg => {
      const otherId = msg.sender._id.toString() === req.user._id.toString()
        ? msg.receiver._id.toString() : msg.sender._id.toString();
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({ user: msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender, lastMessage: msg });
      }
    });
    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
