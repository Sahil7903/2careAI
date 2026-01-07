
import { User, Report, Vitals, AccessShare } from '../types';

/**
 * Since this environment runs in a browser and cannot spin up a Node/SQLite server,
 * this service layer simulates all requested backend logic using LocalStorage.
 */

const STORAGE_KEY = '2care_db';

// Extended User for mock storage to track passwords
interface MockUser extends User {
  password?: string;
}

interface DB {
  users: MockUser[];
  reports: Report[];
  shares: AccessShare[];
}

const getDB = (): DB => {
  const data = localStorage.getItem(STORAGE_KEY);
  let db: DB = data ? JSON.parse(data) : { users: [], reports: [], shares: [] };
  
  // Seed default admin account if no users exist
  if (db.users.length === 0) {
    db.users.push({
      id: 1,
      username: 'admin',
      email: 'admin',
      password: 'admin',
      role: 'owner'
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  
  return db;
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const api = {
  // Auth
  register: async (username: string, email: string, pass: string): Promise<any> => {
    const db = getDB();
    if (db.users.find(u => u.email === email)) throw new Error("User exists");
    const newUser: MockUser = { 
      id: Date.now(), 
      username, 
      email, 
      password: pass, 
      role: 'owner' 
    };
    db.users.push(newUser);
    saveDB(db);
    return { success: true, user: { id: newUser.id, username, email, role: 'owner' }, token: 'mock-jwt-token-' + newUser.id };
  },

  login: async (email: string, pass: string): Promise<any> => {
    const db = getDB();
    const user = db.users.find(u => u.email === email);
    
    // Check if user exists and password matches
    if (!user || user.password !== pass) {
      throw new Error("Invalid credentials");
    }
    
    const { password, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword, token: 'mock-jwt-token-' + user.id };
  },

  // Reports
  uploadReport: async (userId: number, formData: any): Promise<Report> => {
    const db = getDB();
    const newReport: Report = {
      id: Date.now(),
      user_id: userId,
      filename: formData.file?.name || 'report.pdf',
      type: formData.type,
      category: formData.category,
      date: formData.date || new Date().toISOString().split('T')[0],
      vitals: {
        bloodPressure: formData.bloodPressure,
        sugarLevel: Number(formData.sugarLevel),
        heartRate: Number(formData.heartRate)
      }
    };
    db.reports.push(newReport);
    saveDB(db);
    return newReport;
  },

  getReports: async (userId: number): Promise<Report[]> => {
    const db = getDB();
    const currentUser = db.users.find(u => u.id === userId);
    const sharedWithMe = db.shares
      .filter(s => s.viewer_email === currentUser?.email)
      .map(s => s.report_id_or_all);

    return db.reports.filter(r => 
      r.user_id === userId || 
      sharedWithMe.includes('all') || 
      sharedWithMe.includes(String(r.id))
    );
  },

  shareReport: async (ownerId: number, viewerEmail: string, reportId: string): Promise<void> => {
    const db = getDB();
    db.shares.push({
      id: Date.now(),
      owner_id: ownerId,
      viewer_email: viewerEmail,
      report_id_or_all: reportId
    });
    saveDB(db);
  },

  getVitals: async (userId: number): Promise<any[]> => {
    const reports = await api.getReports(userId);
    return reports
      .filter(r => r.vitals.heartRate || r.vitals.sugarLevel)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({
        date: r.date,
        heartRate: r.vitals.heartRate,
        sugar: r.vitals.sugarLevel,
        bp: r.vitals.bloodPressure
      }));
  }
};
