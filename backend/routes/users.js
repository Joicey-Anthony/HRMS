const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize, auditLog } = require('../middleware/auth');

// @GET /api/users - Admin: get all users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(query).select('-password').populate('assignedDoctor', 'name specialization');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/doctors - Get all doctors
router.get('/doctors', protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('-password')
      .populate('assignedPatients', 'name email');
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/patients - Doctor: get assigned patients; Admin: get all patients
router.get('/patients', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    let patients;
    if (req.user.role === 'doctor') {
      patients = await User.find({ _id: { $in: req.user.assignedPatients } }).select('-password');
    } else {
      patients = await User.find({ role: 'patient' }).select('-password').populate('assignedDoctor', 'name specialization');
    }
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/users/assign-doctor - Admin: assign doctor to patient
router.put('/assign-doctor', protect, authorize('admin'), auditLog('ASSIGN_DOCTOR', 'User'), async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);
    if (!patient || patient.role !== 'patient') return res.status(404).json({ success: false, message: 'Patient not found' });
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Remove from old doctor
    if (patient.assignedDoctor) {
      await User.findByIdAndUpdate(patient.assignedDoctor, { $pull: { assignedPatients: patientId } });
    }
    patient.assignedDoctor = doctorId;
    await patient.save();
    await User.findByIdAndUpdate(doctorId, { $addToSet: { assignedPatients: patientId } });

    res.json({ success: true, message: 'Doctor assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/users/:id/rate - Patient: rate a doctor
router.post('/:id/rate', protect, authorize('patient'), async (req, res) => {
  try {
    const { score, review } = req.body;
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Check if already rated
    const existingRating = doctor.ratings.find(r => r.patientId.toString() === req.user._id.toString());
    if (existingRating) {
      existingRating.score = score;
      existingRating.review = review;
    } else {
      doctor.ratings.push({ patientId: req.user._id, score, review });
    }
    doctor.averageRating = doctor.ratings.reduce((acc, r) => acc + r.score, 0) / doctor.ratings.length;
    await doctor.save();
    res.json({ success: true, message: 'Rating submitted', averageRating: doctor.averageRating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/users/:id/toggle-active - Admin: activate/deactivate user
router.put('/:id/toggle-active', protect, authorize('admin'), auditLog('TOGGLE_USER_STATUS', 'User'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/:id - Get single user
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
      .populate('assignedDoctor', 'name email specialization averageRating phone');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Patients can only see their own profile or their doctor
    if (req.user.role === 'patient' && req.user._id.toString() !== req.params.id && user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
