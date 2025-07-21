const User = require('../models/User');

// Controller for direct messaging between doctors
const DoctorChat = require('../models/DoctorChat'); // We'll create this model

// Get chat history with another doctor
exports.getChatHistory = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userId = req.userId; // from auth middleware
    
    console.log(`Loading chat history between users ${userId} and ${doctorId}`);
    
    // Check if the doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      console.log(`Doctor with ID ${doctorId} not found`);
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Ensure we're getting chats where either user is sender or receiver
    const messages = await DoctorChat.find({
      $or: [
        { senderId: userId, receiverId: doctorId },
        { senderId: doctorId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }); // oldest first
    
    console.log(`Found ${messages.length} messages in the conversation`);
    
    // Populate sender and receiver information
    const populatedMessages = await DoctorChat.find({
      $or: [
        { senderId: userId, receiverId: doctorId },
        { senderId: doctorId, receiverId: userId }
      ]
    })
    .populate('senderId', 'name email role specialty')
    .populate('receiverId', 'name email role specialty')
    .sort({ createdAt: 1 });
    
    res.json(populatedMessages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Send a message to another doctor
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId; // from auth middleware
    
    console.log(`Sending message from ${senderId} to ${receiverId}: "${message}"`);
    
    if (!message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    
    // Check if receiver exists and is a doctor
    const receiver = await User.findOne({ _id: receiverId});
    if (!receiver) {
      console.log(`Receiver ${receiverId} not found or is not a doctor`);
      return res.status(404).json({ message: 'Receiver not found or is not a doctor',id:receiverId });
    }
    
    // Create and save the message
    const newMessage = new DoctorChat({
      senderId,
      receiverId,
      message,
      createdAt: new Date()
    });
    
    await newMessage.save();
    console.log(`Message saved with ID: ${newMessage._id}`);
    
    // Return populated message
    const populatedMessage = await DoctorChat.findById(newMessage._id)
      .populate('senderId', 'name email role specialty')
      .populate('receiverId', 'name email role specialty');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};
