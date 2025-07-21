import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label, FormGroup, FormError } from '../../components/ui/Form';
import { Camera } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    hospital: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.specialty.trim()) {
      newErrors.specialty = 'Specialty is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialty: formData.specialty,
        hospital: formData.hospital
      });
      
      addToast('Account created successfully!');
      navigate('/patients');
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
      setErrors({ general: error.message || 'Failed to register' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="bg-gray-700 p-3 rounded-full mb-4"
          >
            <img src="https://www.svgrepo.com/show/452445/ear.svg" alt="Ear logo" width="40" height="40" />
          </motion.div>
          <h1 className="text-3xl font-bold text-center text-white">EarProbe</h1>
          <p className="text-gray-400 mt-1">Create Your Doctor Account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
            >
              {errors.general}
            </motion.div>
          )}
          
          <FormGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Dr. John Doe"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'border-red-500' : ''}
            />
            <FormError>{errors.name}</FormError>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="doctor@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            <FormError>{errors.email}</FormError>
          </FormGroup>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'border-red-500' : ''}
              />
              <FormError>{errors.password}</FormError>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              <FormError>{errors.confirmPassword}</FormError>
            </FormGroup>
          </div>
          
          <FormGroup>
            <Label htmlFor="specialty">Medical Specialty</Label>
            <Input
              id="specialty"
              name="specialty"
              type="text"
              placeholder="ENT Specialist"
              value={formData.specialty}
              onChange={handleChange}
              className={errors.specialty ? 'border-red-500' : ''}
            />
            <FormError>{errors.specialty}</FormError>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="hospital">Hospital/Clinic (Optional)</Label>
            <Input
              id="hospital"
              name="hospital"
              type="text"
              placeholder="City General Hospital"
              value={formData.hospital}
              onChange={handleChange}
            />
          </FormGroup>
          
          {/* Regular HTML button that's guaranteed to be visible */}
          <button 
            type="submit" 
            className="w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700"
            disabled={isLoading}
            style={{ 
              display: 'block',
              visibility: 'visible',
              height: '40px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              fontSize: '16px',
              fontWeight: '500',
              marginTop: '10px',
              backgroundColor: '#4f46e5', /* Using indigo-600 color */
              borderColor: '#4338ca' /* Using indigo-700 color for border */
            }}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
