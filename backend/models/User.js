const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  phone: { type: String },
  specialization: { type: String }, // for doctors
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for patients
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // for doctors
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String
  }],
  isActive: { type: Boolean, default: true },
  profilePic: { type: String },
  bloodGroup: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  ratings: [{
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, min: 1, max: 5 },
    review: String,
    date: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
