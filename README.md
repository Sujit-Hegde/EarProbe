# EarProbe - Medical Image Sharing Platform

EarProbe is a specialized platform designed for medical professionals to capture, store, and securely share ear examination images. The application helps doctors maintain patient records and collaborate with colleagues for better diagnosis and treatment planning.

## Features

- **Doctor Authentication**: Secure login and registration system for medical professionals
- **Patient Management**: Add and manage patient records with basic information
- **Image Capture**: Take ear images directly through the platform using device cameras
- **Image Storage**: Securely store ear examination images in the cloud
- **Image Sharing**: Share images with other doctors for consultation and second opinions
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern, intuitive interface with animations using Framer Motion

## Tech Stack

### Frontend
- React with Vite
- React Router for navigation
- Framer Motion for animations
- Shadcn-style UI components
- Tailwind CSS for styling
- Axios for API communication
- React Webcam for camera integration

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Cloudinary for image storage
- Bcrypt for password hashing
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/earprobe.git
cd earprobe
```

2. Set up the backend:
```
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. Set up the frontend:
```
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```
cd backend
npm run dev
```

2. Start the frontend development server:
```
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Project Structure

```
earprobe/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth and upload middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # Temporary upload storage
│   ├── .env             # Environment variables
│   ├── server.js        # Express app
│   └── package.json
│
└── frontend/
    ├── public/          # Public assets
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── contexts/    # React contexts
    │   ├── pages/       # Application pages
    │   ├── utils/       # Utility functions
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspired by modern medical applications and dashboards
- Built as a mini project for healthcare image sharing solutions
