import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Camera, User, Calendar, Phone, ChevronLeft, Trash, Share2, Download, Eye } from 'lucide-react';
import axios from 'axios';

export const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { addToast } = useToast();
  
  // Helper function to ensure image URLs are absolute
  const ensureAbsoluteUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300x300?text=Image+Not+Available';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch patient details
        const patientRes = await axios.get(`/patients/${id}`);
        setPatient(patientRes.data);
        
        // Fetch patient images
        const imagesRes = await axios.get(`/images/patient/${id}`);
        // Sort images by date with newest first
        const sortedImages = imagesRes.data
          .sort((a, b) => new Date(b.captureDate) - new Date(a.captureDate))
          .map(img => ({
            ...img,
            imageUrl: ensureAbsoluteUrl(img.imageUrl)
          }));
        
        console.log('Processed image URLs:', sortedImages.map(img => img.imageUrl));
        setImages(sortedImages);
      } catch (error) {
        addToast('Failed to load patient data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, addToast]);
  
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/auth/doctors');
      setDoctors(res.data);
    } catch (error) {
      addToast('Failed to load doctors', 'error');
    }
  };
  
  const handleShareClick = async (image) => {
    setSelectedImage(image);
    await fetchDoctors();
    setIsShareModalOpen(true);
  };
  
  const handleShare = async () => {
    if (!selectedDoctor || !selectedImage) return;
    
    try {
      await axios.post('/images/share', {
        imageId: selectedImage._id,
        doctorId: selectedDoctor
      });
      
      addToast('Image shared successfully');
      setIsShareModalOpen(false);
      setSelectedDoctor('');
    } catch (error) {
      addToast('Failed to share image', 'error');
    }
  };
  
  const handleImageView = (image) => {
    setSelectedImage(image);
    setIsImageViewOpen(true);
  };
  
  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/images/${imageId}`);
      setImages(images.filter(img => img._id !== imageId));
      addToast('Image deleted successfully');
    } catch (error) {
      addToast('Failed to delete image', 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDownload = (image) => {
    if (!image || !image.imageUrl) {
      addToast('Image URL is missing or invalid', 'error');
      return;
    }
    
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `ear-image-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    
    try {
      link.click();
      addToast('Download started');
    } catch (error) {
      console.error('Download error:', error);
      addToast('Failed to download image', 'error');
    } finally {
      document.body.removeChild(link);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-700">
          <p className="text-lg font-medium text-gray-200">Patient not found</p>
          <Link to="/patients">
            <Button className="mt-4">Back to Patients</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to="/patients" className="inline-flex items-center text-indigo-400 hover:text-indigo-300">
          <ChevronLeft size={20} className="mr-1" />
          Back to Patients
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="group">
              <h1 className="text-3xl font-bold text-white group-hover:text-white">{patient.name}</h1>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-300">
                  <Calendar className="w-5 h-5" />
                  <span>Age: {patient.age}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-300">
                  <Phone className="w-5 h-5" />
                  <span>{patient.phoneNumber}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Link to={`/capture?patientId=${patient._id}`}>
                <Button className="flex items-center gap-2">
                  <Camera size={18} />
                  Capture New Image
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Ear Images</h2>
        <div className="text-sm text-gray-400">
          Sorted by date (newest first)
        </div>
      </div>
      
      {images.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8 text-center">
          <div className="py-12">
            <div className="bg-gray-700 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <Camera size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-200 mb-2">No images yet</h3>
            <p className="text-gray-400 mb-6">Capture your first ear image for this patient</p>
            <Link to={`/capture?patientId=${patient._id}`}>
              <Button>
                <Camera size={18} className="mr-2" />
                Capture Image
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700"
            >
              <div className="relative aspect-square bg-black">
                <img 
                  src={image.imageUrl || 'https://via.placeholder.com/300x300?text=Image+Not+Available'} 
                  alt={`Ear examination for ${patient.name}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handleImageView(image)}
                  onLoad={() => console.log("Image loaded successfully:", image.imageUrl)}
                  onError={(e) => {
                    console.error("Thumbnail failed to load:", image.imageUrl);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-8 w-8 p-0 rounded-full bg-gray-800/70 hover:bg-gray-700/90 text-white"
                    onClick={() => handleImageView(image)}
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="text-sm text-gray-300 mb-3">
                  Captured on {new Date(image.captureDate).toLocaleDateString()}
                </div>
                
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 px-2 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-200"
                      onClick={() => handleShareClick(image)}
                    >
                      <Share2 size={16} className="mr-1" /> Share
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 w-8 p-0 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-200"
                      onClick={() => handleDownload(image)}
                    >
                      <Download size={16} />
                    </Button>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-gray-700"
                    onClick={() => handleDelete(image._id)}
                    disabled={isDeleting}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Image View Modal */}
      {isImageViewOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-transparent"
          >
            <div className="bg-black rounded-lg overflow-hidden">
              <img 
                src={selectedImage.imageUrl || 'https://via.placeholder.com/400x300?text=Image+Not+Available'} 
                alt={`Ear examination for ${patient.name}`}
                className="max-w-[95vw] max-h-[85vh] mx-auto object-contain"
                onLoad={() => console.log("Modal image loaded successfully:", selectedImage.imageUrl)}
                onError={(e) => {
                  console.error("Modal image failed to load:", selectedImage.imageUrl);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="text-white border-gray-600 bg-gray-800/70 hover:bg-gray-700/90"
                onClick={() => {
                  handleShareClick(selectedImage);
                  setIsImageViewOpen(false);
                }}
              >
                <Share2 size={16} className="mr-1" /> Share
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-white border-gray-600 bg-gray-800/70 hover:bg-gray-700/90"
                onClick={() => handleDownload(selectedImage)}
              >
                <Download size={16} className="mr-1" /> Download
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="text-red-400 hover:text-red-300 bg-gray-800/70 hover:bg-gray-700/90"
                onClick={() => {
                  handleDelete(selectedImage._id);
                  setIsImageViewOpen(false);
                }}
                disabled={isDeleting}
              >
                <Trash size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-white border-gray-600 bg-gray-800/70 hover:bg-gray-700/90 ml-2"
                onClick={() => setIsImageViewOpen(false)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold mb-4 text-white">Share Image</h3>
            
            <div className="mb-4">
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-300 mb-2">
                Select Doctor
              </label>
              <select 
                id="doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                disabled={doctors.length === 0}
              >
                <option value="">Select a doctor...</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
              
              {doctors.length === 0 && (
                <p className="text-sm text-red-400 mt-1">No other doctors available to share with</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setIsShareModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleShare}
                disabled={!selectedDoctor}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Share Image
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
