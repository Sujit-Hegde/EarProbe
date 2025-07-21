import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Eye, Download, User, Calendar, Share2, X, UserPlus, Image, Send, Paperclip, MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';

export const SharedImages = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [chatImagePreview, setChatImagePreview] = useState(null);
  const [isChatLoadingHistory, setIsChatLoadingHistory] = useState(false);
  
  // New chat panel states
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [directChatMessages, setDirectChatMessages] = useState([]);
  const [directMessageText, setDirectMessageText] = useState('');
  const [isLoadingDirectChat, setIsLoadingDirectChat] = useState(false);
  
  // File upload reference
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const directChatEndRef = useRef(null);
  const directChatFileInputRef = useRef(null);
  
  // Auth context for getting current user
  const { currentUser } = useAuth();
  const userId = currentUser?._id;
  
  const { addToast } = useToast();
  
  useEffect(() => {
    if (userId) {
      fetchSharedImages();
      fetchDoctors();
      
      // Scroll to bottom of chat whenever new messages arrive
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [userId, chatMessages.length]);
  
  // Scroll to bottom of direct chat messages
  useEffect(() => {
    if (directChatEndRef.current) {
      directChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directChatMessages.length]);
  
  // Auto-scroll chat messages when they change
  useEffect(() => {
    if (chatEndRef.current && chatMessages.length > 0) {
      // More reliable scrolling method - schedule it after render
      setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    }
  }, [chatMessages.length]);
  
  // Set up polling to refresh direct chat messages every 10 seconds
  useEffect(() => {
    let pollingInterval;
    
    if (selectedDoctor && userId) {
      // Initial load
      loadDirectChatHistory(selectedDoctor._id);
      
      // Set up polling
      pollingInterval = setInterval(() => {
        loadDirectChatHistory(selectedDoctor._id);
      }, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [selectedDoctor?._id, userId]);
  
  // Fetch all doctors for collaboration, excluding current user
  const fetchDoctors = async () => {
    if (!userId) return;
    
    setIsLoadingDoctors(true);
    try {
      const response = await axios.get('/auth/doctors');
      // Filter out the current user
      const filteredDoctors = response.data.filter(doctor => doctor._id !== userId);
      setDoctors(filteredDoctors);
    } catch (error) {
      addToast('Failed to load doctors', 'error');
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoadingDoctors(false);
    }
  };
  
  // Handle selecting a doctor for direct chat
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    loadDirectChatHistory(doctor._id);
  };
  
  // Load direct chat history with a specific doctor
  const loadDirectChatHistory = async (doctorId) => {
    setIsLoadingDirectChat(true);
    setDirectChatMessages([]);
    
    try {
      console.log('Fetching chat history with doctor:', doctorId);
      const response = await axios.get(`/chat/${doctorId}`);
      console.log('Chat history response:', response.data);
      setDirectChatMessages(response.data || []);
    } catch (error) {
      console.error('Error loading direct chat:', error);
      addToast('Failed to load chat history', 'error');
      // Initialize with empty array instead of mock data for real interactions
      setDirectChatMessages([]);
    } finally {
      setIsLoadingDirectChat(false);
    }
  };
  
  const fetchSharedImages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/images/shared');
      setImages(response.data);
    } catch (error) {
      addToast('Failed to load shared images', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageView = (image) => {
    setSelectedImage(image);
    setIsImageViewOpen(true);
    // Load chat history when opening the image
    loadChatHistory(image._id);
    
    // After the modal is opened and chat is loaded, scroll to bottom
    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
      }
    }, 500);
  };
  
  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `ear-image-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Toggle doctor selection for sharing
  const toggleDoctorSelection = (doctorId) => {
    setSelectedDoctors(prev => {
      if (prev.includes(doctorId)) {
        return prev.filter(id => id !== doctorId);
      } else {
        return [...prev, doctorId];
      }
    });
  };
  
  // Open share modal for an image
  const handleShareImage = (image) => {
    setSelectedImage(image);
    setIsShareModalOpen(true);
    setSelectedDoctors([]);  // Reset selections
  };
  
  // Share image with selected doctors
  const shareWithDoctors = async () => {
    if (selectedDoctors.length === 0) {
      addToast('Please select at least one doctor to share with', 'warning');
      return;
    }
    
    try {
      await axios.post('/images/share', {
        imageId: selectedImage._id,
        doctorIds: selectedDoctors
      });
      
      addToast(`Image shared successfully with ${selectedDoctors.length} doctor${selectedDoctors.length > 1 ? 's' : ''}`, 'success');
      setIsShareModalOpen(false);
    } catch (error) {
      addToast('Failed to share image', 'error');
      console.error('Error sharing image:', error);
    }
  };
  
  // Handle chat image upload
  const handleChatImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearChatImagePreview = () => {
    setChatImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Upload and send image in chat
  const uploadChatImage = async () => {
    if (!chatImagePreview || !selectedImage) return;
    
    setIsImageUploading(true);
    
    try {
      // Validate image size before uploading
      const base64SizeInBytes = Math.round((chatImagePreview.length * 3) / 4);
      const sizeInMB = base64SizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 5) {
        addToast('Image is too large (over 5MB). Please select a smaller image.', 'error');
        setIsImageUploading(false);
        return;
      }
      
      const formData = new FormData();
      
      try {
        // Convert base64 to blob
        const response = await fetch(chatImagePreview);
        const blob = await response.blob();
        formData.append('image', blob, `chat-image-${Date.now()}.jpg`);
      } catch (conversionError) {
        console.error('Error converting image:', conversionError);
        addToast('Error processing the image. Please try a different image.', 'error');
        setIsImageUploading(false);
        return;
      }
      
      formData.append('imageId', selectedImage._id);
      formData.append('message', commentText.trim());
      
      let retryCount = 0;
      const maxRetries = 2;
      let uploadResponse;
      
      while (retryCount <= maxRetries) {
        try {
          uploadResponse = await axios.post('/images/chat/upload-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // 30 second timeout
          });
          
          // If we get here, upload succeeded
          break;
        } catch (uploadError) {
          retryCount++;
          console.log(`Upload attempt ${retryCount} failed, ${retryCount <= maxRetries ? 'retrying...' : 'giving up.'}`);
          
          if (retryCount <= maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(r => setTimeout(r, 1000 * retryCount));
          } else {
            // We've exhausted retries, throw the error to be caught by outer catch
            throw uploadError;
          }
        }
      }
      
      if (uploadResponse && uploadResponse.data) {
        // Add the new message to chat
        const newMessage = uploadResponse.data;
        setChatMessages(prev => [...prev, newMessage]);
        
        // Clear the form
        setCommentText('');
        clearChatImagePreview();
        
        addToast('Image uploaded successfully', 'success');
      }
      
    } catch (error) {
      console.error('Chat image upload error:', error);
      
      // Check for specific error messages
      let errorMessage = 'Failed to upload image to chat';
      
      if (error.response) {
        // Server responded with an error
        console.log('Error response:', error.response.data);
        
        if (error.response.status === 413) {
          errorMessage = 'Image is too large. Please use a smaller image.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
          
          // Special handling for cloud storage errors
          if (errorMessage.includes('cloud storage') || errorMessage.includes('storage quota') || error.response.status === 507) {
            addToast('Cloud storage error. Attempting to save locally...', 'info');
            
            try {
              // Implement fallback to local storage
              const blob = await fetch(chatImagePreview).then(r => r.blob());
              const localMessage = await uploadToLocalStorage(blob, commentText.trim());
              
              if (localMessage) {
                // Success! Add the local message to chat
                setChatMessages(prev => [...prev, localMessage]);
                setCommentText('');
                clearChatImagePreview();
                addToast('Image saved locally successfully', 'success');
                return; // Exit early since we succeeded with the fallback
              } else {
                throw new Error('Failed to save locally');
              }
            } catch (fallbackError) {
              console.error('Fallback storage error:', fallbackError);
              errorMessage = 'Failed to store image both in cloud and locally. Please try again later.';
            }
          }
        }
      } else if (error.request) {
        // No response received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast(errorMessage, 'error');
    } finally {
      setIsImageUploading(false);
    }
  };
  
  // Load chat history for the selected image
  const loadChatHistory = async (imageId) => {
    setIsChatLoadingHistory(true);
    try {
      const response = await axios.get(`/images/${imageId}/chat`);
      setChatMessages(response.data);
    } catch (error) {
      addToast('Failed to load chat history', 'error');
      console.error('Error loading chat history:', error);
    } finally {
      setIsChatLoadingHistory(false);
    }
  };
  
  // Handle sending direct message to a doctor
  const handleSendDirectMessage = async () => {
    if (!directMessageText.trim() || !selectedDoctor) return;
    
    const messageText = directMessageText;
    // Optimistically update UI
    setDirectMessageText('');
    
    // Add message to UI immediately 
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      message: messageText,
      senderId: userId,
      createdAt: new Date().toISOString()
    };
    
    setDirectChatMessages(prev => [...prev, tempMessage]);
    
    try {
      console.log('Sending message to doctor:', selectedDoctor._id);
      const response = await axios.post('/chat/send', {
        receiverId: selectedDoctor._id,
        message: messageText
      });
      
      console.log('Message sent successfully:', response.data);
      
      // Replace the temporary message with the real one from the server
      setDirectChatMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id ? response.data : msg
        )
      );
      
      // Scroll to bottom after sending
      if (directChatEndRef.current) {
        directChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error sending direct message:', error);
      addToast('Failed to send message', 'error');
      
      // Remove the temporary message if sending failed
      setDirectChatMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      // Put the text back in the input
      setDirectMessageText(messageText);
    }
  };
  
  // Alternative upload method that uses a different endpoint for local storage
  const uploadToLocalStorage = async (imageBlob, message) => {
    if (!selectedImage) return null;
    
    try {
      const localFormData = new FormData();
      localFormData.append('image', imageBlob, `local-image-${Date.now()}.jpg`);
      localFormData.append('imageId', selectedImage._id);
      localFormData.append('message', message || '');
      localFormData.append('useLocalStorage', 'true'); // Signal to use local storage
      
      const response = await axios.post('/images/chat/upload-local', localFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (localError) {
      console.error('Local storage fallback error:', localError);
      throw localError;
    }
  };
  
  const handleAddComment = async () => {
    if ((!commentText.trim() && !chatImagePreview) || !selectedImage) return;
    
    // If there's an image to upload, use the uploadChatImage function instead
    if (chatImagePreview) {
      await uploadChatImage();
      return;
    }
    
    // If we're just sending a text comment
    const originalText = commentText;
    let isSubmitting = true;
    let retryCount = 0;
    const maxRetries = 1;
    
    try {
      setCommentText('');  // Optimistically clear the input
      console.log('Sending comment to image:', selectedImage._id);
      
      while (retryCount <= maxRetries && isSubmitting) {
        try {
          const response = await axios.post('/images/comment', {
            imageId: selectedImage._id,
            message: originalText
          });
          
          console.log('Comment added successfully:', response.data);
          
          // Update local state with the new comment
          const updatedImage = {
            ...selectedImage,
            comments: selectedImage.comments ? 
              [...selectedImage.comments, response.data] : 
              [response.data]
          };
          
          setSelectedImage(updatedImage);
          
          // Also update the images array
          const updatedImages = images.map(img => 
            img._id === selectedImage._id ? updatedImage : img
          );
          
          setImages(updatedImages);
          
          // Add to chat messages
          setChatMessages(prev => [...prev, response.data]);
          
          // Scroll to bottom after adding a comment
          setTimeout(() => {
            if (chatEndRef.current) {
              chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
          }, 100);
          
          addToast('Comment added successfully');
          isSubmitting = false;  // Success, stop retrying
          
        } catch (err) {
          retryCount++;
          console.log(`Comment send attempt ${retryCount} failed, ${retryCount <= maxRetries ? 'retrying...' : 'giving up.'}`);
          
          if (retryCount <= maxRetries) {
            // Wait before retry
            await new Promise(r => setTimeout(r, 800));
          } else {
            // We've exhausted retries, throw the error to be caught by outer catch
            throw err;
          }
        }
      }
      
    } catch (error) {
      console.error('Add comment error:', error);
      
      // Put the text back in the input field so the user doesn't lose their message
      setCommentText(originalText);
      
      let errorMessage = 'Failed to add comment';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.status === 413) {
          errorMessage = 'Message is too long.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast(errorMessage, 'error');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 relative">
      {/* Chat toggle button - hidden when chat panel is open */}
      {!isChatPanelOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
            className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-lg"
          >
            <MessageCircle size={24} />
          </Button>
        </div>
      )}
      
      {/* Chat panel - slides in from right */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full md:w-80 lg:w-96 bg-gray-800 shadow-xl border-l border-gray-700 z-30 transform transition-transform duration-300 ${
          isChatPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Chat panel header */}
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => setIsChatPanelOpen(false)}
              >
                <ChevronRight size={20} />
              </Button>
              <h2 className="text-lg font-semibold text-white">Doctor Chat</h2>
            </div>
          </div>
          
          {/* Doctor selection area */}
          <div className="p-2 border-b border-gray-700 bg-gray-900">
            <h3 className="text-sm font-medium text-gray-300 mb-2 px-2">Available Doctors</h3>
            <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
              {isLoadingDoctors ? (
                <div className="px-3 py-1 flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent mr-2"></div>
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : doctors.length > 0 ? (
                doctors.map(doctor => (
                  <div 
                    key={doctor._id} 
                    className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer whitespace-nowrap ${
                      selectedDoctor?._id === doctor._id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => handleSelectDoctor(doctor)}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">{doctor.name}</span>
                    {/* Notification dot - you can conditionally render this based on unread messages */}
                    <div className="w-2 h-2 rounded-full bg-red-500 ml-1"></div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-1 text-sm text-gray-400">No doctors available</div>
              )}
            </div>
          </div>
          
          {/* Chat messages area */}
          <div className="flex-grow overflow-y-auto p-3">
            {selectedDoctor ? (
              isLoadingDirectChat ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                  <span className="ml-2 text-sm text-gray-400">Loading conversation...</span>
                </div>
              ) : directChatMessages.length > 0 ? (
                <div className="space-y-3">
                  {directChatMessages.map((message) => {
                    // Handle both populated and unpopulated messages
                    const isCurrentUser = typeof message.senderId === 'object' 
                      ? message.senderId._id === userId 
                      : message.senderId === userId;
                    
                    const senderName = typeof message.senderId === 'object' 
                      ? message.senderId.name
                      : isCurrentUser ? 'You' : 'Doctor';
                    
                    return (
                      <div key={message._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                          }`}
                        >
                          {!isCurrentUser && (
                            <p className="text-xs font-medium mb-1 text-gray-300">{senderName}</p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={directChatEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle size={32} className="text-gray-500 mb-3" />
                  <p className="text-gray-300 mb-1">Start a conversation</p>
                  <p className="text-sm text-gray-400">Send a message to {selectedDoctor.name}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <User size={32} className="text-gray-500 mb-3" />
                <p className="text-gray-300">Select a doctor</p>
                <p className="text-sm text-gray-400">Choose a doctor to start chatting</p>
              </div>
            )}
          </div>
          
          {/* Message input area */}
          {selectedDoctor && (
            <div className="p-3 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Message to ${selectedDoctor.name}...`}
                  value={directMessageText}
                  onChange={(e) => setDirectMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendDirectMessage()}
                />
                <Button
                  onClick={handleSendDirectMessage}
                  disabled={!directMessageText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-white">Shared Images</h1>
      
      {images.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8 text-center">
          <div className="py-12">
            <div className="bg-gray-700 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <Share2 size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-200 mb-2">No shared images</h3>
            <p className="text-gray-400">
              When other doctors share ear images with you, they'll appear here.
            </p>
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
              <div className="relative aspect-square">
                <img 
                  src={image.imageUrl} 
                  alt="Shared ear examination"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handleImageView(image)}
                />
                <div className="absolute top-2 right-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full bg-gray-800/70 hover:bg-gray-700/90 text-white"
                    onClick={() => handleImageView(image)}
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-gray-700 p-2 rounded-full">
                    <User size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Patient: {image.patient.name}</div>
                    <div className="text-xs text-gray-400">Age: {image.patient.age}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Captured on {new Date(image.captureDate).toLocaleDateString()}</span>
                </div>
                
                <div className="text-xs text-gray-300 mb-3">
                  Shared by: <span className="font-medium text-white">{image.uploadedBy.name}</span>
                  <div className="text-gray-400">{image.uploadedBy.specialty}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-200"
                    onClick={() => handleDownload(image)}
                  >
                    <Download size={14} className="mr-1" /> Download
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-200"
                    onClick={() => handleShareImage(image)}
                  >
                    <UserPlus size={14} className="mr-1" /> Share
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Image View Modal */}
      {isImageViewOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl w-full h-full max-h-[95vh] flex flex-col"
          >
            {/* Fullscreen image container */}
            <div className="flex-1 flex items-center justify-center">
              <img 
                src={selectedImage.imageUrl} 
                alt="Shared ear examination"
                className="max-w-full max-h-[85vh] mx-auto object-contain rounded-md"
              />
            </div>
            
            {/* Control bar at bottom */}
            <div className="shrink-0 mt-2">
              <div className="flex justify-between items-center bg-gray-800/70 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white">
                  <div className="font-medium">{selectedImage.patient.name} ({selectedImage.patient.age} years)</div>
                  <div className="text-xs text-gray-300">Shared by: {selectedImage.uploadedBy.name}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload(selectedImage)}
                    className="bg-transparent border-gray-500 hover:bg-gray-700"
                  >
                    <Download size={16} className="mr-1" /> Download
                  </Button>
                  
                  <Button 
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setIsImageViewOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Share Modal */}
      {isShareModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col max-h-[95vh]"
          >
            <div className="p-3 sm:p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="text-base sm:text-lg font-medium text-white">Share with Other Doctors</h3>
              <Button 
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-white shrink-0"
                onClick={() => setIsShareModalOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="p-3 sm:p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 flex-1">
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="bg-gray-700 p-2 rounded-full shrink-0">
                    <User size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Patient: {selectedImage.patient.name}</div>
                    <div className="text-xs text-gray-400">Age: {selectedImage.patient.age}</div>
                  </div>
                </div>
                
                <div className="aspect-[4/3] bg-gray-900 rounded overflow-hidden mb-3 border border-gray-700">
                  <img 
                    src={selectedImage.imageUrl} 
                    alt="Ear examination to share" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-2 text-white">Select doctors to share with:</h4>
              
              <div className="max-h-52 overflow-y-auto mb-3 sm:mb-4 border border-gray-700 rounded-md scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
                {isLoadingDoctors ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-400">Loading doctors...</span>
                  </div>
                ) : doctors.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {doctors.map(doctor => (
                      <div 
                        key={doctor._id} 
                        className={`p-3 hover:bg-gray-700 cursor-pointer flex items-center justify-between transition-all ${
                          selectedDoctors.includes(doctor._id) ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => toggleDoctorSelection(doctor._id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                            <User size={14} className="text-gray-300" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{doctor.name}</div>
                            <div className="text-xs text-gray-400">{doctor.specialty}</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border ${
                          selectedDoctors.includes(doctor._id) 
                            ? 'bg-indigo-600 border-indigo-600' 
                            : 'border-gray-500'
                        } flex items-center justify-center`}>
                          {selectedDoctors.includes(doctor._id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-400">
                    No other doctors available
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
                <Button 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 order-2 sm:order-1"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={shareWithDoctors}
                  disabled={selectedDoctors.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white order-1 sm:order-2"
                >
                  <UserPlus size={16} className="mr-1" /> 
                  Share with {selectedDoctors.length} {selectedDoctors.length === 1 ? 'Doctor' : 'Doctors'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
