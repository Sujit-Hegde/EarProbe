import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, LogOut, Menu, X, User, Users, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const NavItem = ({ to, icon: Icon, label, onClick, isMobile = false }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (to) {
      navigate(to);
    }
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        'flex items-center p-2 rounded-lg transition-colors',
        isMobile ? 'text-lg w-full' : 'text-base',
        to ? 'hover:bg-primary-100 text-gray-700' : 'hover:bg-red-100 text-red-600'
      )}
    >
      <Icon className="mr-2" size={isMobile ? 24 : 20} />
      <span>{label}</span>
    </motion.button>
  );
};

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { currentUser, logout } = useAuth();
  
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  
  const navItems = [
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/camera', icon: Camera, label: 'Take Photo' },
    { to: '/shared', icon: ImageIcon, label: 'Shared Images' },
    { to: '/profile', icon: User, label: 'Profile' }
  ];
  
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <img src="https://www.svgrepo.com/show/452445/ear.svg" alt="Ear logo" width="28" height="28" />
            </motion.div>
            <motion.h1 
              className="text-xl font-bold text-primary-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              EarProbe
            </motion.h1>
          </Link>
          
          {/* Desktop Navigation */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item, index) => (
                <NavItem key={index} {...item} />
              ))}
              <NavItem label="Logout" icon={LogOut} onClick={handleLogout} />
            </nav>
          )}
          
          {/* Mobile menu button */}
          {currentUser && (
            <button 
              className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {currentUser && mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="container mx-auto px-4 py-3 space-y-2">
            {navItems.map((item, index) => (
              <NavItem key={index} {...item} isMobile />
            ))}
            <NavItem label="Logout" icon={LogOut} onClick={handleLogout} isMobile />
          </div>
        </motion.div>
      )}
    </header>
  );
};
