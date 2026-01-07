
import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

export const UploadReport: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'General',
    type: 'PDF',
    date: new Date().toISOString().split('T')[0],
    heartRate: '',
    sugarLevel: '',
    bloodPressure: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;
    setIsUploading(true);

    try {
      await api.uploadReport(auth.user.id, { ...formData, file });
      alert('Report uploaded successfully!');
      navigate('/');
    } catch (err) {
      alert('Error uploading report');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 bg-blue-600 text-white">
          <h2 className="text-2xl font-bold">Upload New Report</h2>
          <p className="text-blue-100 mt-2">Add your medical data to track your health progress.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">1. Report Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>General</option>
                  <option>Cardiology</option>
                  <option>Diabetology</option>
                  <option>Pathology</option>
                  <option>Radiology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Test</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (PDF/Image)</label>
              <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-2xl appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <span className="text-2xl">📁</span>
                  <span className="font-medium text-gray-600">
                    {file ? file.name : "Click to select or drag and drop"}
                  </span>
                </span>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">2. Extract Vitals (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="72"
                    className="w-full pl-4 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.heartRate}
                    onChange={e => setFormData({...formData, heartRate: e.target.value})}
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">BPM</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sugar Level</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="110"
                    className="w-full pl-4 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.sugarLevel}
                    onChange={e => setFormData({...formData, sugarLevel: e.target.value})}
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">mg/dL</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                <input 
                  type="text" 
                  placeholder="120/80"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.bloodPressure}
                  onChange={e => setFormData({...formData, bloodPressure: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isUploading}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-1'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Save Report to Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
};
