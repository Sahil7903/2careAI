
import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../App';

export const Sharing: React.FC = () => {
  const { auth } = useAuth();
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState('all');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user || !email) return;
    setIsSharing(true);

    try {
      await api.shareReport(auth.user.id, email, scope);
      alert(`Access granted to ${email} successfully!`);
      setEmail('');
    } catch (err) {
      alert('Error sharing access');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Health Records</h2>
          <p className="text-gray-500 mt-2">Grant doctors or family members temporary view access to your wallet.</p>
        </div>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <input 
              type="email"
              required
              placeholder="doctor@clinic.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={scope}
              onChange={e => setScope(e.target.value)}
            >
              <option value="all">Full Wallet Access (Recommended for primary doctors)</option>
              <option value="recent">Last 3 Months Only</option>
              <option value="vitals">Vitals Summary Only</option>
            </select>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
            <p className="font-semibold mb-1">🔐 Privacy Note</p>
            Sharing allows the recipient to view your data but never edit it. You can revoke access at any time from your settings.
          </div>

          <button 
            type="submit"
            disabled={isSharing}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg disabled:bg-gray-400"
          >
            {isSharing ? 'Sending invite...' : 'Share Access Now'}
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">People with Access</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mr-3">D</div>
              <div>
                <p className="text-sm font-bold">dr.smith@example.com</p>
                <p className="text-xs text-gray-500">Shared on Oct 24, 2023 • All Reports</p>
              </div>
            </div>
            <button className="text-xs font-bold text-red-600 hover:underline">Revoke</button>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 italic">No other active shares found.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
