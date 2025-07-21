const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply auth middleware to all routes
router.use(auth);

// Upload image (handles both file upload and base64 data)
router.post('/upload', (req, res, next) => {
  // Check if we're getting base64 data instead of a file upload
  if (req.body && req.body.imageData) {
    // Skip multer if we're using base64
    next();
  } else {
    // Use multer for regular file upload
    upload.single('image')(req, res, next);
  }
}, imageController.uploadImage);

// Get all images for a patient
router.get('/patient/:patientId', imageController.getPatientImages);

// Share image with another doctor
router.post('/share', imageController.shareImage);

// Get all images shared with the doctor
router.get('/shared', imageController.getSharedImages);

// Delete image
router.delete('/:id', imageController.deleteImage);

// Add comment to an image
router.post('/comment', imageController.addComment);

// Upload image in chat (to Cloudinary)
router.post('/chat/upload-image', upload.single('image'), imageController.uploadChatImage);

// Upload image in chat (to local storage as fallback)
router.post('/chat/upload-local', upload.single('image'), imageController.uploadChatImageLocal);

// Get chat history for an image
router.get('/:imageId/chat', imageController.getChatHistory);

module.exports = router;
