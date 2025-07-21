const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: fileFilter
});

// Create a wrapped version of the middleware that handles errors
const uploadWithErrorHandler = {
  single: (fieldName) => {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          console.error('Multer error:', err);
          return res.status(400).json({ 
            message: 'File upload error',
            details: err.message
          });
        } else if (err) {
          // An unknown error occurred
          console.error('Unknown upload error:', err);
          return res.status(500).json({ 
            message: 'Unknown file upload error',
            details: err.message
          });
        }
        
        // Everything went fine
        next();
      });
    };
  }
};

module.exports = uploadWithErrorHandler;
