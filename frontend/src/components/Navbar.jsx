import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import { Camera, Users, Share2, LogOut, Menu, X, User, Home } from 'lucide-react';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Successfully logged out');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      public: true
    },
    {
      name: 'Patients',
      path: '/patients',
      icon: Users,
      public: false
    },
    {
      name: 'Capture Image',
      path: '/capture',
      icon: Camera,
      public: false
    },
    {
      name: 'Shared Images',
      path: '/shared',
      icon: Share2,
      public: false
    }
  ];

  return (
    <header className="bg-gray-900 shadow-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="https://www.svgrepo.com/show/452445/ear.svg" alt="Ear logo" className="w-6 h-6 bg-white rounded-b-lg" />
              <span className="text-xl font-bold text-white">EarProbe</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems
              .filter(item => item.public || isAuthenticated)
              .map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold'
                      : 'text-gray-300 hover:text-indigo-400'
                  }`}
                >
                  <item.icon 
                    className={`w-4 h-4 ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'text-indigo-400 stroke-2' : ''}`}
                  />
                  {item.name}
                </Link>
              ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-white">
                    {currentUser?.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {currentUser?.specialty}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-800 border-t border-gray-700"
          >
            <div className="container mx-auto px-4 py-4">
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg mb-4 border border-gray-700">
                  <div className="bg-gray-700 p-2 rounded-full">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{currentUser?.name}</div>
                    <div className="text-sm text-gray-400">
                      {currentUser?.specialty}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {navItems
                  .filter(item => item.public || isAuthenticated)
                  .map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium ${
                        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                          ? 'bg-gray-700 text-indigo-400 font-bold border-l-4 border-indigo-500'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={closeMenu}
                    >
                      <item.icon 
                        className={`w-5 h-5 ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'text-indigo-400 stroke-2' : ''}`}
                      />
                      {item.name}
                    </Link>
                  ))}

                {isAuthenticated ? (
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-400 hover:bg-gray-700"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <Link to="/login" onClick={closeMenu}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={closeMenu}>
                      <Button className="w-full">Register</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
