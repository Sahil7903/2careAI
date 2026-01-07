
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../App';
import { Report } from '../types';
import { VitalsLineChart } from '../components/VitalsLineChart';
import { getHealthInsights } from '../services/gemini';

export const Dashboard: React.FC = () => {
  const { auth } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>('Loading AI health insights...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (auth.user) {
          const fetchedReports = await api.getReports(auth.user.id);
          const fetchedVitals = await api.getVitals(auth.user.id);
          setReports(fetchedReports);
          setVitalsData(fetchedVitals);

          if (fetchedReports.length > 0) {
            const latestVitals = fetchedReports[fetchedReports.length - 1].vitals;
            const aiInsight = await getHealthInsights(latestVitals);
            setInsight(aiInsight);
          } else {
            setInsight("No reports yet. Upload your first medical report to get personalized insights!");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auth.user]);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {auth.user?.username}!</h2>
          <p className="text-gray-500">Here's your health summary for today.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">❤️</span>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Latest HR</p>
              <p className="text-lg font-bold">{vitalsData.length > 0 ? vitalsData[vitalsData.length-1].heartRate : '--'} BPM</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">💧</span>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Sugar</p>
              <p className="text-lg font-bold">{vitalsData.length > 0 ? vitalsData[vitalsData.length-1].sugar : '--'} mg/dL</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <span className="mr-2">📈</span> Vitals Trend
          </h3>
          <VitalsLineChart data={vitalsData} />
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">✨</span> AI Health Insight
          </h3>
          <p className="text-blue-50 text-sm leading-relaxed italic">
            "{insight}"
          </p>
          <div className="mt-6 pt-6 border-t border-white/20 text-xs text-blue-100">
            Powered by Gemini 2care Engine
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📄</span> Recent Reports
          </h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-semibold text-gray-600 text-sm">Report Name</th>
                <th className="pb-4 font-semibold text-gray-600 text-sm">Category</th>
                <th className="pb-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="pb-4 font-semibold text-gray-600 text-sm">Vitals</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">No reports found.</td>
                </tr>
              ) : (
                reports.slice(0, 5).reverse().map((report) => (
                  <tr key={report.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">📄</span>
                        <div>
                          <p className="font-medium text-gray-900">{report.filename}</p>
                          <p className="text-xs text-gray-400">{report.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {report.category}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{report.date}</td>
                    <td className="py-4 text-sm">
                      {report.vitals.heartRate && <span className="mr-3 text-red-500">❤️ {report.vitals.heartRate}</span>}
                      {report.vitals.sugarLevel && <span className="text-blue-500">💧 {report.vitals.sugarLevel}</span>}
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-gray-400 hover:text-blue-600">Download</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
