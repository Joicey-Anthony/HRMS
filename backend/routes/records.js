const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const HealthRecord = require('../models/HealthRecord');
const { protect, authorize, auditLog } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @GET /api/records - Get records (role-based)
router.get('/', protect, auditLog('VIEW_RECORDS', 'HealthRecord'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const patientIds = req.user.assignedPatients;
      query.patient = { $in: patientIds };
    }
    // admin sees all
    const records = await HealthRecord.find(query)
      .populate('patient', 'name email bloodGroup')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/records/patient/:patientId - Get records for specific patient
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    if (req.user.role === 'doctor') {
      const isAssigned = req.user.assignedPatients.some(p => p.toString() === req.params.patientId);
      if (!isAssigned) return res.status(403).json({ success: false, message: 'Not your patient' });
    }
    const records = await HealthRecord.find({ patient: req.params.patientId })
      .populate('doctor', 'name specialization').sort({ date: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/records - Doctor creates record
router.post('/', protect, authorize('doctor', 'admin'), auditLog('CREATE_RECORD', 'HealthRecord'), async (req, res) => {
  try {
    const { patientId, ...rest } = req.body;
    if (req.user.role === 'doctor') {
      const isAssigned = req.user.assignedPatients.some(p => p.toString() === patientId);
      if (!isAssigned) return res.status(403).json({ success: false, message: 'Not your patient' });
    }
    const record = await HealthRecord.create({ patient: patientId, doctor: req.user._id, ...rest });
    await record.populate('patient', 'name email');
    await record.populate('doctor', 'name specialization');
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/records/:id - Update record
router.put('/:id', protect, authorize('doctor'), auditLog('UPDATE_RECORD', 'HealthRecord'), async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your record' });
    }
    const updated = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, record: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/records/:id - Delete record
router.delete('/:id', protect, authorize('doctor', 'admin'), auditLog('DELETE_RECORD', 'HealthRecord'), async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (req.user.role === 'doctor' && record.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your record' });
    }
    await record.deleteOne();
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/records/:id/upload - Upload attachment
router.post('/:id/upload', protect, authorize('doctor'), upload.single('file'), async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    record.attachments.push({ filename: req.file.originalname, path: req.file.path });
    await record.save();
    res.json({ success: true, message: 'File uploaded', attachment: record.attachments.slice(-1)[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
