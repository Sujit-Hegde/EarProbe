import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ProtectedRoute } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PatientList } from './pages/PatientList';
import { PatientDetail } from './pages/PatientDetail';
import { CameraPage } from './pages/CameraPage';
import { SharedImages } from './pages/SharedImages';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="capture" element={<CameraPage />} />
          <Route path="shared" element={<SharedImages />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;