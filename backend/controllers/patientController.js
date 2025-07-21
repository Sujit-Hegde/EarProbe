const Patient = require('../models/Patient');
const Image = require('../models/Image');

// Create new patient
exports.createPatient = async (req, res) => {
  try {
    const { name, age, phoneNumber } = req.body;
    
    const patient = new Patient({
      name,
      age,
      phoneNumber,
      doctor: req.userId
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all patients for a doctor
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ doctor: req.userId }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.id,
      doctor: req.userId 
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const { name, age, phoneNumber } = req.body;
    
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, doctor: req.userId },
      { name, age, phoneNumber },
      { new: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ 
      _id: req.params.id,
      doctor: req.userId 
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Also delete associated images
    await Image.deleteMany({ patient: req.params.id });
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
