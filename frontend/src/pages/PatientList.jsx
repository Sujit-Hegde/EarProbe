import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Search, Camera, User, Calendar, Phone, Plus, Trash } from 'lucide-react';
import axios from 'axios';

export const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const { addToast } = useToast();
  
  useEffect(() => {
    fetchPatients();
  }, []);
  
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/patients');
      setPatients(response.data);
    } catch (error) {
      addToast('Failed to load patients', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };
  
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await axios.delete(`/patients/${deleteId}`);
      setPatients(patients.filter(p => p._id !== deleteId));
      addToast('Patient deleted successfully');
    } catch (error) {
      addToast('Failed to delete patient', 'error');
    } finally {
      setShowConfirmDelete(false);
      setDeleteId(null);
    }
  };
  
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteId(null);
  };
  
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber.includes(searchTerm)
  );
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Your Patients</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-grow md:max-w-xs">
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          <Link to="/capture">
            <Button className="flex items-center gap-2">
              <Plus size={18} /> New Patient
            </Button>
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8 text-center">
          {searchTerm ? (
            <div>
              <p className="text-lg font-medium text-gray-200 mb-2">No matching patients found</p>
              <p className="text-gray-400">Try a different search term</p>
            </div>
          ) : (
            <div className="py-12">
              <div className="bg-gray-700 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <User size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-200 mb-2">No patients yet</h3>
              <p className="text-gray-400 mb-6">Start by adding your first patient</p>
              <Link to="/capture">
                <Button>
                  <Plus size={18} className="mr-2" />
                  Add Patient
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredPatients.map(patient => (
            <motion.div key={patient._id} variants={item}>
              <Card className="h-full hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl group-hover:text-white">{patient.name}</CardTitle>
                    <div className="flex gap-2">
                      <Link to={`/capture?patientId=${patient._id}`}>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Camera size={16} />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-gray-700"
                        onClick={() => handleDeleteClick(patient._id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 group-hover:text-gray-400">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span>Age: {patient.age}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={16} />
                      <span>{patient.phoneNumber}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link to={`/patients/${patient._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold mb-2 text-white">Delete Patient</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this patient? This will also delete all associated images and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
