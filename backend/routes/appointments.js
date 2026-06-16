const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize, auditLog } = require('../middleware/auth');

// @GET /api/appointments
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    // admin sees all
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone bloodGroup')
      .populate('doctor', 'name specialization email')
      .sort({ date: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/appointments - Patient or Admin books appointment
router.post('/', protect, authorize('patient', 'admin'), auditLog('BOOK_APPOINTMENT', 'Appointment'), async (req, res) => {
  try {
    const { doctorId, date, time, type, reason, patientId } = req.body;
    const patId = req.user.role === 'patient' ? req.user._id : patientId;
    const appointment = await Appointment.create({
      patient: patId, doctor: doctorId, date, time, type, reason
    });
    await appointment.populate('patient', 'name email');
    await appointment.populate('doctor', 'name specialization');
    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/appointments/:id - Update status
router.put('/:id', protect, authorize('doctor', 'admin'), auditLog('UPDATE_APPOINTMENT', 'Appointment'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your appointment' });
    }
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name email').populate('doctor', 'name specialization');
    res.json({ success: true, appointment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/appointments/:id - Cancel
router.delete('/:id', protect, auditLog('CANCEL_APPOINTMENT', 'Appointment'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });
    const isOwner = appointment.patient.toString() === req.user._id.toString() ||
                    appointment.doctor.toString() === req.user._id.toString() ||
                    req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ success: false, message: 'Access denied' });
    await appointment.deleteOne();
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
