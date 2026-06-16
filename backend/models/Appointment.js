const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['in_person', 'video', 'phone'],
    default: 'in_person'
  },
  reason: { type: String },
  notes: { type: String },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthRecord' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
