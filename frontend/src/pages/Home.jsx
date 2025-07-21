import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Camera, Share2, Users, ShieldCheck } from 'lucide-react';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  
  const features = [
    {
      iconType: 'ear',
      title: 'Capture & Store',
      description: 'Take high-quality ear photos directly from your device and store them securely in the cloud.'
    },
    {
      icon: Share2,
      title: 'Share Securely',
      description: 'Easily share ear examination images with colleagues for consultation and second opinions.'
    },
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Maintain comprehensive patient records including ear examination history and images.'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Focused',
      description: 'All patient data and images are encrypted and securely stored following medical privacy standards.'
    }
  ];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mb-8 md:mb-0"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Advanced Ear Examination for Medical Professionals
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-md">
            EarProbe helps doctors capture, store, and share ear examination images securely for better diagnosis and collaboration.
          </p>
          <div className="mt-8 space-x-4">
            {isAuthenticated ? (
              <Link to="/patients">
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button size="lg">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:w-1/2 flex justify-center"
        >
          <div className="relative">
            <div className="bg-gray-700 rounded-full w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              <img src="https://www.svgrepo.com/show/452445/ear.svg" alt="Ear logo" className="w-32 h-32" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-gray-600 p-4 rounded-full">
              <Share2 className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Why Choose EarProbe?
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="h-1 w-24 bg-primary-500 mx-auto mt-4"
          ></motion.div>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-700 p-3 rounded-full inline-block mb-4">
                {feature.iconType === 'ear' ? (
                  <img src="https://www.svgrepo.com/show/452445/ear.svg" alt="Ear icon" className="w-8 h-8" />
                ) : (
                  <feature.icon className="w-8 h-8 text-indigo-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Ready to improve your ear examination workflow?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg mb-8 max-w-2xl mx-auto"
          >
            Join thousands of medical professionals who trust EarProbe for secure image capture and sharing.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {isAuthenticated ? (
              <Link to="/patients">
                <Button size="lg" variant="secondary">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" variant="secondary">
                  Create Free Account
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <img src="https://www.svgrepo.com/show/452445/ear.svg" alt="Ear logo" className="w-6 h-6" />
                <h3 className="text-xl font-bold">EarProbe</h3>
              </div>
              <p className="mt-2 text-gray-400 max-w-xs">
                Secure ear examination image capture and sharing platform for medical professionals.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white">Register</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} EarProbe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
