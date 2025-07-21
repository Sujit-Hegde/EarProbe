import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Camera, RefreshCw, X, Check, User, Phone } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Label, FormGroup, FormError } from '../components/ui/Form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import axios from 'axios';

export const CameraPage = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [patientData, setPatientData] = useState({ name: '', age: '', phoneNumber: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Fetch patients list and setup camera state
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        // Fix the URL to prevent duplication of /api/ prefix
        const response = await axios.get('/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        addToast('Failed to load patients', 'error');
      } finally {
        setIsLoadingPatients(false);
      }
    };
    
    // Check if the browser supports getUserMedia
    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Camera API not supported in this browser');
        addToast('Your browser does not support camera access. Please use a modern browser.', 'error');
        return false;
      }
      return true;
    };
    
    fetchPatients();
    checkCameraSupport();
    
    // Cleanup function to ensure camera is released
    return () => {
      if (webcamRef.current && webcamRef.current.stream) {
        const tracks = webcamRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [addToast]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate phone number on the fly
    if (name === 'phoneNumber') {
      // Only allow digits
      const sanitizedValue = value.replace(/\D/g, '');
      
      // Strict enforcement of 10 digits maximum
      const truncatedValue = sanitizedValue.substring(0, 10);
      
      setPatientData(prev => ({ ...prev, [name]: truncatedValue }));
      
      // Show immediate feedback based on length
      if (truncatedValue.length > 0 && truncatedValue.length !== 10) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: `Phone number must be exactly 10 digits (${truncatedValue.length}/10)` 
        }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      
      // Alert if user tries to enter more than 10 digits
      if (sanitizedValue.length > 10) {
        console.warn('Phone number limited to 10 digits');
      }
    } else {
      setPatientData(prev => ({ ...prev, [name]: value }));
      
      // Clear error
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedPatient) {
      if (!patientData.name.trim()) {
        newErrors.name = 'Patient name is required';
      }
      
      if (!patientData.age) {
        newErrors.age = 'Age is required';
      } else if (isNaN(patientData.age) || patientData.age <= 0) {
        newErrors.age = 'Age must be a positive number';
      }
      
      if (!patientData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\d{10}$/.test(patientData.phoneNumber.trim())) {
        newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
      }
    }
    
    if (!capturedImage) {
      newErrors.image = 'Please capture an image first';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const capture = useCallback(() => {
    try {
      if (!webcamRef.current) {
        console.warn('Camera reference not available');
        addToast('Camera is not ready yet. Please wait a moment.', 'error');
        return;
      }
      
      // Check if webcam stream is active
      if (!webcamRef.current.video || !webcamRef.current.video.readyState || webcamRef.current.video.readyState !== 4) {
        console.warn('Video stream is not ready yet');
        addToast('Camera is initializing. Please try again in a moment.', 'error');
        return;
      }
      
      // Take the screenshot with error handling
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          console.log('Image captured successfully');
          setCapturedImage(imageSrc);
          setIsCameraOpen(false);
        } else {
          console.error('Failed to capture image - null screenshot returned');
          addToast('Failed to capture image. Please try again.', 'error');
        }
      } catch (screenshotError) {
        console.error('Screenshot error:', screenshotError);
        addToast('Could not take photo. Try refreshing the page.', 'error');
      }
    } catch (error) {
      console.error('Error during image capture:', error);
      addToast('Error capturing image: ' + (error.message || 'Unknown error'), 'error');
      
      // Fallback: Allow users to upload an image instead
      addToast('You can also upload an existing image instead of using the camera.', 'info');
    }
  }, [webcamRef, addToast]);
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientData({ name: '', age: '', phoneNumber: '' });
  };
  
  const resetCamera = () => {
    setCapturedImage(null);
    setIsCameraOpen(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Extra validation for phone number before submission
    if (!selectedPatient && patientData.phoneNumber) {
      if (patientData.phoneNumber.length !== 10) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: 'Phone number must be exactly 10 digits'
        }));
        addToast('Please enter a valid 10-digit phone number', 'error');
        return;
      }
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let patientId;
      
      // If no patient is selected, create a new one
      if (!selectedPatient) {
        const patientResponse = await axios.post('/patients', {
          name: patientData.name,
          age: Number(patientData.age),
          phoneNumber: patientData.phoneNumber
        });
        patientId = patientResponse.data._id;
      } else {
        patientId = selectedPatient._id;
      }
      
      // Upload the image
      const formData = new FormData();
      formData.append('patientId', patientId);
      
      // Simplified and more robust approach for image upload
      try {
        // Basic validation of the image data
        if (!capturedImage) {
          throw new Error('No image selected or captured');
        }
        
        // Determine if it's a Data URL or File
        if (typeof capturedImage === 'string' && capturedImage.startsWith('data:image')) {
          // It's a Data URL from camera or file upload
          formData.append('imageData', capturedImage);
          formData.append('imageType', capturedImage.includes('image/png') ? 'png' : 'jpeg');
          formData.append('imageName', 'ear-image.' + (capturedImage.includes('image/png') ? 'png' : 'jpg'));
          
          console.log('FormData prepared with image data URL');
        } else {
          throw new Error('Unrecognized image format');
        }
        
        console.log('Image data prepared successfully');
      } catch (conversionError) {
        console.error('Error processing image:', conversionError);
        addToast('Error processing the image: ' + conversionError.message, 'error');
        setIsLoading(false);
        return;
      }
      
      console.log('Sending image upload request to server...');
      
      // Retry logic for more reliable uploads
      let uploadResponse;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          uploadResponse = await axios.post('/images/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // 30 second timeout
          });
          
          // If we get here, the upload succeeded
          break;
        } catch (uploadError) {
          retryCount++;
          if (retryCount <= maxRetries) {
            console.log(`Upload attempt ${retryCount} failed, retrying...`);
            // Wait briefly before retry
            await new Promise(r => setTimeout(r, 1000));
          } else {
            // We've exhausted retries, rethrow the error
            throw uploadError;
          }
        }
      }
      
      console.log('Upload successful:', uploadResponse.data);
      addToast('Image uploaded successfully!');
      navigate('/patients');
    } catch (error) {
      console.error('Upload error:', error);
      
      // Get more detailed error information
      let errorMessage = 'Failed to upload image';
      
      try {
        if (error && error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          errorMessage = error.response.data?.message || error.response.data?.details || errorMessage;
        } else if (error && error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          errorMessage = 'No response received from server. Please check your internet connection.';
        } else if (error && error.message) {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          errorMessage = error.message || errorMessage;
          
          // Specific guidance for common errors
          if (error.message.includes('Network Error')) {
            errorMessage = 'Network connection issue. Please check your internet and try again.';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'The upload timed out. Please try again with a smaller image.';
          }
        }
      } catch (errorHandlingError) {
        console.error('Error while processing error details:', errorHandlingError);
      }
      
      addToast(errorMessage, 'error');
      
      // Offer guidance
      addToast('Try refreshing the page or using a different browser', 'info');
    } finally {
      setIsLoading(false);
    }
  };
  
  const cameraAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25 } }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Capture Ear Image</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {isCameraOpen ? (
            <motion.div 
              variants={cameraAnimation}
              initial="hidden"
              animate="show"
              className="bg-gray-800 p-2 rounded-lg shadow-md border border-gray-700"
            >
              <div className="relative">
                {/* Error handling wrapper around Webcam */}
                <React.Suspense fallback={
                  <div className="w-full aspect-square bg-gray-900 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-gray-400">Initializing camera...</p>
                  </div>
                }>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "user", // Use front camera which is more likely to work
                      width: 640,
                      height: 480
                    }}
                    mirrored={true} // Mirror for front camera
                    onUserMediaError={(err) => {
                      console.error('Webcam error:', err);
                      addToast('Camera access failed. Please check your browser permissions.', 'error');
                      setIsCameraOpen(false);
                    }}
                    className="w-full rounded"
                  />
                </React.Suspense>
              </div>
              <div className="flex justify-center gap-4 p-4">
                <Button 
                  onClick={() => setIsCameraOpen(false)} 
                  variant="outline"
                  className="flex items-center gap-2 !visible"
                  style={{ 
                    display: 'inline-flex !important',
                    visibility: 'visible !important' 
                  }}
                >
                  <X size={18} /> Cancel
                </Button>
                <Button 
                  onClick={capture}
                  variant="default"
                  className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 !visible font-semibold"
                  style={{ 
                    display: 'inline-flex !important',
                    visibility: 'visible !important',
                    zIndex: 10
                  }}
                >
                  <Camera size={18} /> Capture Photo
                </Button>
              </div>
            </motion.div>
          ) : capturedImage ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-2 rounded-lg shadow-md border border-gray-700"
            >
              <img 
                src={capturedImage} 
                alt="Captured ear" 
                className="w-full h-auto rounded"
              />
              <div className="flex justify-center gap-4 p-4">
                <Button 
                  onClick={resetCamera} 
                  variant="outline"
                  className="flex items-center gap-2 !visible"
                  style={{ 
                    display: 'inline-flex !important',
                    visibility: 'visible !important' 
                  }}
                >
                  <RefreshCw size={18} /> Retake
                </Button>
                {errors.image && (
                  <p className="text-red-400 text-sm mt-2">{errors.image}</p>
                )}
              </div>
            </motion.div>
          ) : capturedImage ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 flex flex-col">
              <img 
                src={capturedImage} 
                alt="Captured ear" 
                className="rounded-lg mb-3 max-h-[300px] object-contain mx-auto"
              />
              <Button 
                onClick={resetCamera}
                variant="outline"
                className="flex items-center justify-center gap-2 !visible"
              >
                <RefreshCw size={18} /> Retake Photo
              </Button>
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center h-full">
              <div className="mb-6 space-y-4 w-full">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCameraOpen(true)}
                  className="bg-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer"
                >
                  <Camera size={48} className="text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-200">Open Camera</p>
                  <p className="text-sm text-gray-400 mt-2">Take a photo of patient's ear</p>
                </motion.div>
                
                {/* File upload fallback option */}
                <div className="p-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Or upload an image:</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setCapturedImage(event.target?.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-medium
                      file:bg-gray-700 file:text-gray-300
                      hover:file:bg-gray-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPatients ? (
                <p className="text-center py-4">Loading patients...</p>
              ) : (
                <>
                  <div className="mb-4">
                    <Label>Select Existing Patient</Label>
                    <div className="max-h-40 overflow-y-auto mt-2 border rounded-md">
                      {patients.length === 0 ? (
                        <p className="p-3 text-gray-500">No existing patients found</p>
                      ) : (
                        patients.map((patient) => (
                          <motion.div
                            key={patient._id}
                            whileHover={{ backgroundColor: '#2d3748' }} // Changed to a dark gray color
                            onClick={() => handlePatientSelect(patient)}
                            className={`p-3 border-b cursor-pointer ${
                              selectedPatient?._id === patient._id ? 'bg-gray-700 border-l-4 border-l-indigo-500' : ''
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-200">{patient.name}</div>
                                <div className="text-sm text-gray-400">Age: {patient.age}</div>
                              </div>
                              {selectedPatient?._id === patient._id && (
                                <Check className="text-indigo-400" size={20} />
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center my-4">
                    <p className="text-sm">- OR -</p>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <FormGroup>
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User size={16} /> Patient Name
                        </Label>
                        <Input 
                          id="name"
                          name="name"
                          value={patientData.name}
                          onChange={handleInputChange}
                          disabled={!!selectedPatient}
                        />
                        <FormError>{errors.name}</FormError>
                      </FormGroup>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormGroup>
                          <Label htmlFor="age">Age</Label>
                          <Input 
                            id="age"
                            name="age"
                            type="number"
                            value={patientData.age}
                            onChange={handleInputChange}
                            disabled={!!selectedPatient}
                          />
                          <FormError>{errors.age}</FormError>
                        </FormGroup>
                        
                        <FormGroup>
                          <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                            <Phone size={16} /> Phone Number
                          </Label>
                          <Input 
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            pattern="[0-9]{10}"
                            maxLength="10"
                            placeholder="10-digit phone number"
                            value={patientData.phoneNumber}
                            onChange={handleInputChange}
                            disabled={!!selectedPatient}
                            style={{ 
                              border: patientData.phoneNumber && patientData.phoneNumber.length !== 10 ? 
                              '1px solid red' : undefined
                            }}
                          />
                          <FormError>{errors.phoneNumber}</FormError>
                        </FormGroup>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || isLoadingPatients}
                className="w-full"
                style={{ display: 'inline-flex', justifyContent: 'center' }}
              >
                {isLoading ? 'Saving...' : 'Save Image & Patient Data'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
