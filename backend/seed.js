require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Clear existing data
  const User = require('./models/User');
  const HealthRecord = require('./models/HealthRecord');
  const Appointment = require('./models/Appointment');

  await User.deleteMany({});
  await HealthRecord.deleteMany({});
  await Appointment.deleteMany({});
  console.log('🗑  Cleared existing data');

  // Create Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@hrms.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 9000000001',
    isActive: true,
  });

  // Create Doctors
  const doctor1 = await User.create({
    name: 'Priya Sharma',
    email: 'doctor@hrms.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 9000000002',
    specialization: 'Cardiologist',
    isActive: true,
    averageRating: 4.5,
  });

  const doctor2 = await User.create({
    name: 'Rahul Mehta',
    email: 'doctor2@hrms.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 9000000003',
    specialization: 'General Physician',
    isActive: true,
    averageRating: 4.2,
  });

  // Create Patients
  const patient1 = await User.create({
    name: 'Arjun Verma',
    email: 'patient@hrms.com',
    password: 'patient123',
    role: 'patient',
    phone: '+91 9000000004',
    bloodGroup: 'O+',
    dateOfBirth: new Date('1990-05-15'),
    address: 'Sector 21, Noida, UP',
    assignedDoctor: doctor1._id,
    isActive: true,
    emergencyContacts: [
      { name: 'Sunita Verma', phone: '+91 9111111111', relation: 'Spouse' },
      { name: 'Ramesh Verma', phone: '+91 9222222222', relation: 'Father' }
    ]
  });

  const patient2 = await User.create({
    name: 'Meena Pillai',
    email: 'patient2@hrms.com',
    password: 'patient123',
    role: 'patient',
    phone: '+91 9000000005',
    bloodGroup: 'A+',
    dateOfBirth: new Date('1985-11-22'),
    address: 'Koramangala, Bengaluru, KA',
    assignedDoctor: doctor2._id,
    isActive: true,
    emergencyContacts: [
      { name: 'Suresh Pillai', phone: '+91 9333333333', relation: 'Husband' }
    ]
  });

  // Update doctors with assigned patients
  await User.findByIdAndUpdate(doctor1._id, { assignedPatients: [patient1._id] });
  await User.findByIdAndUpdate(doctor2._id, { assignedPatients: [patient2._id] });

  // Create Health Records
  const record1 = await HealthRecord.create({
    patient: patient1._id,
    doctor: doctor1._id,
    recordType: 'consultation',
    title: 'Initial Cardiac Consultation',
    description: 'Patient presented with mild chest discomfort. ECG normal. Advised lifestyle changes.',
    diagnosis: 'Mild hypertension',
    symptoms: ['chest discomfort', 'shortness of breath', 'fatigue'],
    vitalSigns: { bloodPressure: '130/85', heartRate: 82, temperature: 98.6, oxygenSaturation: 97, weight: 75, height: 175 },
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  const record2 = await HealthRecord.create({
    patient: patient1._id,
    doctor: doctor1._id,
    recordType: 'prescription',
    title: 'Hypertension Prescription',
    description: 'Prescribed medications for blood pressure management.',
    diagnosis: 'Stage 1 Hypertension',
    symptoms: ['high blood pressure'],
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
      { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', duration: '30 days' }
    ],
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  const record3 = await HealthRecord.create({
    patient: patient2._id,
    doctor: doctor2._id,
    recordType: 'lab_result',
    title: 'Blood Panel Results',
    description: 'Routine blood work — all values within normal range.',
    diagnosis: 'Healthy',
    symptoms: [],
    vitalSigns: { bloodPressure: '118/78', heartRate: 70, temperature: 98.4, oxygenSaturation: 99, weight: 62, height: 162 },
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  // Create Appointments
  await Appointment.create({
    patient: patient1._id,
    doctor: doctor1._id,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '10:30',
    type: 'in_person',
    status: 'confirmed',
    reason: 'Follow-up for hypertension',
  });

  await Appointment.create({
    patient: patient1._id,
    doctor: doctor1._id,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '14:00',
    type: 'video',
    status: 'scheduled',
    reason: 'Routine cardiac checkup',
  });

  await Appointment.create({
    patient: patient2._id,
    doctor: doctor2._id,
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    time: '09:00',
    type: 'in_person',
    status: 'scheduled',
    reason: 'Annual physical examination',
  });

  await Appointment.create({
    patient: patient1._id,
    doctor: doctor1._id,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    time: '11:00',
    type: 'in_person',
    status: 'completed',
    reason: 'Initial consultation',
  });

  console.log('\n✅ Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Demo Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin    → admin@hrms.com    / admin123');
  console.log('👨‍⚕️ Doctor 1 → doctor@hrms.com  / doctor123  (Cardiologist)');
  console.log('👨‍⚕️ Doctor 2 → doctor2@hrms.com / doctor123  (General Physician)');
  console.log('🧑 Patient  → patient@hrms.com  / patient123');
  console.log('🧑 Patient2 → patient2@hrms.com / patient123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  mongoose.disconnect();
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
