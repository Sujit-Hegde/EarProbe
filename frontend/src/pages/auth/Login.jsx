import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label, FormGroup, FormError } from '../../components/ui/Form';
import { Camera } from 'lucide-react';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      addToast('Successfully logged in!');
      navigate('/patients');
    } catch (error) {
      addToast(error.message || 'Failed to login', 'error');
      setErrors({ general: error.message || 'Invalid credentials' });
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
          <p className="text-gray-400 mt-1">Doctor's Image Sharing Platform</p>
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
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:underline font-medium">
                Register
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
