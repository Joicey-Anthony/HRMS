const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/audit - Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { limit = 100, page = 1, action, user } = req.query;
    let query = {};
    if (action) query.action = { $regex: action, $options: 'i' };
    if (user) query.user = user;
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await AuditLog.countDocuments(query);
    res.json({ success: true, total, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
