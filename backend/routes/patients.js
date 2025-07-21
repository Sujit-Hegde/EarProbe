const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new patient
router.post('/', patientController.createPatient);

// Get all patients
router.get('/', patientController.getPatients);

// Get patient by ID
router.get('/:id', patientController.getPatientById);

// Update patient
router.put('/:id', patientController.updatePatient);

// Delete patient
router.delete('/:id', patientController.deletePatient);

module.exports = router;
