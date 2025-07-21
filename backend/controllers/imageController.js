const cloudinary = require('cloudinary').v2;
const Image = require('../models/Image');
const Patient = require('../models/Patient');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image for a patient
exports.uploadImage = async (req, res) => {
  try {
    console.log('Image upload request received');
    
    const { patientId, notes, imageData } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    // Check if patient exists and belongs to the doctor
    const patient = await Patient.findOne({ _id: patientId, doctor: req.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Verify Cloudinary configuration
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;
    
    console.log('Cloudinary Config Check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
      properly_configured: cloudinaryConfigured ? 'Yes' : 'No'
    });
    
    if (!cloudinaryConfigured) {
      console.error('Cloudinary not properly configured. Missing credentials.');
      return res.status(500).json({ 
        message: 'Cloud storage is not properly configured on the server',
        details: 'Missing Cloudinary credentials' 
      });
    }
    
    // Determine upload method and upload to Cloudinary
    let result;
    let uploadAttempted = false;
    
    // Retry logic
    const maxRetries = 2;
    let retryCount = 0;
    let uploadError = null;
    
    while (retryCount <= maxRetries) {
      try {
        if (imageData) {
          // Using base64 image data directly
          console.log(`Uploading from base64 image data (attempt ${retryCount + 1})`);
          uploadAttempted = true;
          
          // Validate the base64 string
          if (!imageData.startsWith('data:image')) {
            return res.status(400).json({ 
              message: 'Invalid image format. Base64 data must start with data:image',
            });
          }
          
          // Upload to Cloudinary with specific options for better reliability
          result = await cloudinary.uploader.upload(imageData, {
            folder: 'earprobe',
            resource_type: 'image',
            timeout: 60000, // Longer timeout (60 seconds)
            max_bytes: 10485760, // 10 MB limit
            quality: 'auto', // Auto-optimize quality
            fetch_format: 'auto' // Auto-format
          });
          
          console.log('Cloudinary upload from base64 successful:', result.secure_url);
          break; // Exit the retry loop on success
          
        } else if (req.file) {
          // Using file upload via multer
          console.log(`Uploading from file (attempt ${retryCount + 1}):`, {
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size
          });
          uploadAttempted = true;
          
          // Upload to Cloudinary with specific options for better reliability
          result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'earprobe',
            resource_type: 'image',
            timeout: 60000, // Longer timeout (60 seconds)
            quality: 'auto', // Auto-optimize quality
            fetch_format: 'auto' // Auto-format
          });
          
          console.log('Cloudinary file upload successful:', result.secure_url);
          break; // Exit the retry loop on success
        } else {
          return res.status(400).json({ 
            message: 'No image provided. Please provide either a file or base64 image data.' 
          });
        }
        
      } catch (cloudinaryError) {
        uploadError = cloudinaryError;
        retryCount++;
        console.error(`Cloudinary upload error (attempt ${retryCount}/${maxRetries}):`, cloudinaryError);
        
        if (retryCount <= maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = 1000 * Math.pow(2, retryCount - 1); // 1s, 2s, 4s, etc.
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // We've exhausted all retries
          console.error('All Cloudinary upload attempts failed');
          return res.status(500).json({ 
            message: 'Failed to upload to cloud storage after multiple attempts',
            details: uploadError.message 
          });
        }
      }
    }

    // If Cloudinary upload was attempted but no result, try local storage fallback
    if (uploadAttempted && !result) {
      console.log('Cloudinary upload failed, trying local storage fallback');
      
      try {
        // Local storage fallback
        let localImageUrl;
        
        if (req.file) {
          // File is already on disk, just use the path
          const filename = req.file.filename;
          localImageUrl = `/uploads/${filename}`; // This should match your static file serving setup
        } else if (imageData) {
          // Save the base64 data to a file
          const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          
          if (matches && matches.length === 3) {
            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const extension = type.split('/')[1] || 'jpg';
            const filename = `local-${Date.now()}.${extension}`;
            const filePath = `./uploads/${filename}`;
            
            require('fs').writeFileSync(filePath, buffer);
            localImageUrl = `/uploads/${filename}`;
          } else {
            throw new Error('Invalid base64 image data format');
          }
        }
        
        if (!localImageUrl) {
          throw new Error('Failed to save image locally');
        }
        
        // Create image record with local storage URL
        const image = new Image({
          imageUrl: localImageUrl, // Local URL
          publicId: null, // No Cloudinary public ID
          patient: patientId,
          uploadedBy: req.userId,
          notes: notes || '',
          captureDate: new Date(),
          storageType: 'local' // Mark as locally stored
        });
        
        await image.save();
        console.log('Image saved locally:', localImageUrl);
        
        return res.status(201).json({
          ...image.toJSON(),
          localStorageFallback: true
        });
      } catch (localStorageError) {
        console.error('Local storage fallback failed:', localStorageError);
        return res.status(500).json({ 
          message: 'Failed to save image to both cloud and local storage',
          details: localStorageError.message 
        });
      }
    }
    
    // Create image record in database with Cloudinary URL
    const image = new Image({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      patient: patientId,
      uploadedBy: req.userId,
      notes: notes || '',
      captureDate: new Date(),
      storageType: 'cloudinary' // Mark as cloud stored
    });

    await image.save();
    console.log('Image saved to database with Cloudinary URL');
    res.status(201).json(image);
  } catch (error) {
    console.error('Upload image error:', error);
    // Provide more detailed error message
    res.status(500).json({ 
      message: 'Server error during image upload', 
      details: error.message 
    });
  }
};

// Get all images for a patient
exports.getPatientImages = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if patient exists and belongs to the doctor
    const patient = await Patient.findOne({ _id: patientId, doctor: req.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const images = await Image.find({ patient: patientId })
      .sort({ captureDate: -1 });
    
    res.json(images);
  } catch (error) {
    console.error('Get patient images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload image for chat (to Cloudinary)
exports.uploadChatImage = async (req, res) => {
  try {
    console.log('Chat image upload request received');
    
    const { imageId, message } = req.body;
    
    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }
    
    // Check if the image exists and user has access
    const image = await Image.findOne({
      $or: [
        { _id: imageId, uploadedBy: req.userId },
        { _id: imageId, sharedWith: req.userId }
      ]
    });
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }
    
    // Process image upload to Cloudinary
    let chatImageUrl = null;
    let chatImagePublicId = null;
    let uploadSuccess = false;
    
    try {
      if (req.file) {
        // Upload to Cloudinary with retry mechanism
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries && !uploadSuccess) {
          try {
            console.log(`Uploading chat image to Cloudinary (attempt ${retryCount + 1})`);
            
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'earprobe_chat',
              resource_type: 'image',
              timeout: 60000
            });
            
            chatImageUrl = result.secure_url;
            chatImagePublicId = result.public_id;
            uploadSuccess = true;
            console.log('Chat image uploaded to Cloudinary:', chatImageUrl);
            
          } catch (cloudinaryError) {
            retryCount++;
            console.error(`Chat image Cloudinary upload error (attempt ${retryCount}/${maxRetries}):`, cloudinaryError);
            
            if (retryCount <= maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            } else {
              throw cloudinaryError;
            }
          }
        }
      } else {
        return res.status(400).json({ message: 'No image file provided' });
      }
    } catch (uploadError) {
      console.error('All Cloudinary upload attempts failed for chat image:', uploadError);
      return res.status(500).json({ 
        message: 'Failed to upload chat image to cloud storage',
        details: uploadError.message
      });
    }
    
    // Create comment with image
    const comment = {
      message: message || '',
      imageUrl: chatImageUrl,
      imagePublicId: chatImagePublicId,
      postedBy: req.userId,
      createdAt: new Date()
    };
    
    image.comments.push(comment);
    await image.save();
    
    // Populate user info for the comment
    const populatedImage = await Image.findById(image._id)
      .populate('comments.postedBy', 'name email role specialty');
    
    const newComment = populatedImage.comments[populatedImage.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Chat image upload error:', error);
    res.status(500).json({ 
      message: 'Server error during chat image upload',
      details: error.message
    });
  }
};

// Upload image for chat (to local storage as fallback)
exports.uploadChatImageLocal = async (req, res) => {
  try {
    console.log('Chat image local upload request received');
    
    const { imageId, message } = req.body;
    
    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }
    
    // Check if the image exists and user has access
    const image = await Image.findOne({
      $or: [
        { _id: imageId, uploadedBy: req.userId },
        { _id: imageId, sharedWith: req.userId }
      ]
    });
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }
    
    // Process local image storage
    let localImageUrl = null;
    
    if (req.file) {
      // File is already saved by multer, just get the path
      const filename = req.file.filename;
      localImageUrl = `/uploads/${filename}`;
      console.log('Chat image saved locally:', localImageUrl);
    } else {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Create comment with local image
    const comment = {
      message: message || '',
      imageUrl: localImageUrl,
      storageType: 'local',
      postedBy: req.userId,
      createdAt: new Date()
    };
    
    image.comments.push(comment);
    await image.save();
    
    // Populate user info for the comment
    const populatedImage = await Image.findById(image._id)
      .populate('comments.postedBy', 'name email role specialty');
    
    const newComment = populatedImage.comments[populatedImage.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Local chat image upload error:', error);
    res.status(500).json({ 
      message: 'Server error during local chat image upload',
      details: error.message
    });
  }
};

// Get chat history for an image
exports.getChatHistory = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Check if the image exists and user has access
    const image = await Image.findOne({
      $or: [
        { _id: imageId, uploadedBy: req.userId },
        { _id: imageId, sharedWith: req.userId }
      ]
    }).populate('comments.postedBy', 'name email role specialty');
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }
    
    res.json(image.comments || []);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Share image with another doctor
exports.shareImage = async (req, res) => {
  try {
    const { imageId, doctorId } = req.body;

    const image = await Image.findOne({ 
      _id: imageId,
      uploadedBy: req.userId
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Add doctor to sharedWith array if not already present
    if (!image.sharedWith.includes(doctorId)) {
      image.sharedWith.push(doctorId);
      await image.save();
    }

    res.json({ message: 'Image shared successfully' });
  } catch (error) {
    console.error('Share image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all images shared with the doctor
exports.getSharedImages = async (req, res) => {
  try {
    const images = await Image.find({ sharedWith: req.userId })
      .populate('patient', 'name age phoneNumber')
      .populate('uploadedBy', 'name email specialty hospital')
      .sort({ updatedAt: -1 });
    
    res.json(images);
  } catch (error) {
    console.error('Get shared images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findOne({ 
      _id: req.params.id,
      uploadedBy: req.userId
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
    // Delete from database
    await image.remove();
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to an image
exports.addComment = async (req, res) => {
  try {
    const { imageId, message } = req.body;
    
    if (!message.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
    
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Check if user has access to the image (either owner or shared with)
    // Fix: Use req.userId instead of req.user.id
    const userId = req.userId;
    const isOwner = image.uploadedBy.toString() === userId;
    const isSharedWith = image.sharedWith.some(id => id.toString() === userId);
    
    if (!isOwner && !isSharedWith) {
      return res.status(403).json({ message: 'Not authorized to comment on this image' });
    }
    
    // Add comment with timestamp
    image.comments.push({
      message,
      postedBy: userId,
      createdAt: new Date()
    });
    
    await image.save();
    
    // Return the newly added comment with user details
    const updatedImage = await Image.findById(imageId)
      .populate('comments.postedBy', 'name email role specialty');
      
    const newComment = updatedImage.comments[updatedImage.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
