const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordType: {
    type: String,
    enum: ['consultation', 'lab_result', 'prescription', 'surgery', 'vaccination', 'general'],
    default: 'general'
  },
  title: { type: String, required: true },
  description: { type: String },
  diagnosis: { type: String },
  symptoms: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isConfidential: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
