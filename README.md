# EarProbe – Smart Otoscope & Medical Image Sharing Platform

EarProbe is a **hardware-software integrated healthcare solution** developed to assist ENT professionals in capturing, storing, and securely sharing ear examination images. The project combines a **custom-designed smartphone otoscope** with a modern web platform, enabling doctors to perform ear examinations, maintain patient records, and collaborate remotely for better diagnosis and treatment.

---

# Project Overview

The system consists of two major components:

- **Hardware:** A custom-built smartphone otoscope designed using CAD and 3D printing, integrated with optical lenses, LED illumination, and a smartphone camera.
- **Software:** EarProbe, a full-stack web application that securely stores patient information and ear images while allowing doctor-to-doctor collaboration.

Together, these components create a complete digital ear examination ecosystem suitable for hospitals, clinics, telemedicine, and educational purposes.

---

# Hardware Contribution

I was responsible for the **hardware development and integration** of the project, which involved designing and assembling the custom smartphone otoscope.

### Hardware Components

- Custom 3D Printed Otoscope Body
- Optical Lens System
- High Brightness White LED Illumination
- Smartphone Camera Alignment Mechanism
- Speculum Attachment
- Portable Power Supply
- Internal Wiring and Mechanical Assembly

### Hardware Features

- Compact and lightweight design
- Custom CAD-designed enclosure
- Dual optical lens arrangement for magnification
- Integrated LED illumination for clear visualization
- Smartphone compatible design
- Low-cost and portable
- Easy maintenance and assembly

### Hardware Development

The hardware was designed to provide:

- Proper optical alignment
- Uniform illumination
- Comfortable handling
- Accurate image capture
- Easy integration with smartphones

The otoscope body was designed in CAD and fabricated using **3D printing**, ensuring proper placement of the LED, lenses, and camera for high-quality ear imaging.

---

# Software Features

EarProbe provides a secure platform for ENT doctors to manage patient ear examination data.

### Doctor Authentication

- Secure Login
- Registration
- JWT Authentication
- Password Encryption

### Patient Management

- Add New Patients
- View Patient History
- Patient Search
- Patient Information Storage

### Ear Image Capture

- Camera Integration
- Image Upload
- Real-Time Capture
- Mobile Camera Support

### Cloud Storage

- Cloudinary Image Storage
- Secure Image Access
- Image History

### Doctor Collaboration

- Doctor-to-Doctor Image Sharing
- Remote Consultation
- Community Sharing
- Secure Communication

### Image Comparison

Doctors can compare previously captured images with newly captured images to monitor disease progression.

---

# Project Workflow

```
Patient
    │
    ▼
Smartphone Otoscope
    │
    ▼
Smartphone Camera
    │
    ▼
EarProbe Web Application
    │
    ▼
Cloud Storage (Cloudinary)
    │
    ▼
MongoDB Database
    │
    ▼
Doctor Dashboard
    │
    ▼
Image Sharing & Consultation
```

---

# Tech Stack

## Frontend

- React (Vite)
- React Router
- Tailwind CSS
- Framer Motion
- Axios
- React Webcam
- Shadcn UI Components

---

## Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Bcrypt
- Multer
- Cloudinary

---

## Hardware

- Smartphone Camera
- Optical Magnifying Lens
- White LED
- 3D Printed Otoscope
- Portable Power Supply
- Speculum
- CAD Design

---

# Features

✔ Secure Doctor Login

✔ Patient Record Management

✔ Capture Ear Images

✔ Upload Images

✔ Cloud Image Storage

✔ Doctor-to-Doctor Sharing

✔ Compare Old and New Images

✔ Responsive UI

✔ Modern Dashboard

✔ Mobile Camera Integration

✔ Hardware + Software Integration

---

# Screens Available

- Home Dashboard
- Doctor Login
- Patient List
- Capture Ear Image
- Image Sharing
- Patient History
- Image Comparison

---

# Project Structure

```
EarProbe/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/earprobe.git
cd earprobe
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file

```env
PORT=5000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

Start Backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Application runs at

```
http://localhost:5173
```

---

# Future Improvements

- AI-based Ear Infection Detection
- Automatic Image Classification
- Electronic Health Record (EHR) Integration
- Voice Assisted Examination
- Multi-device Synchronization
- Telemedicine Support
- AI-powered Disease Prediction
- Image Annotation Tools

---

# Applications

- ENT Clinics
- Hospitals
- Telemedicine
- Rural Healthcare
- Medical Education
- Research Laboratories
- Patient Monitoring

---

# Project Highlights

- Custom Smartphone Otoscope
- Full Stack Web Application
- Secure Cloud Storage
- Medical Image Sharing
- Doctor Collaboration
- Low-Cost Healthcare Solution
- Hardware and Software Integration
- Responsive Cross-Platform Design

---

# My Contribution

### Hardware

- Designed the custom smartphone otoscope.
- Selected and integrated the optical lens system.
- Designed the 3D printable otoscope enclosure using CAD.
- Integrated LED illumination and mechanical assembly.
- Aligned the smartphone camera with the optical system.
- Tested and optimized the hardware for clear ear imaging.

### Software

- Contributed to the development of the EarProbe web platform.
- Integrated image capture and upload functionality.
- Assisted in cloud image storage integration.
- Participated in testing the complete hardware-software workflow.

---
