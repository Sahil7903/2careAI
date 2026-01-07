
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Login } from './pages/Auth';
import { Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { UploadReport } from './pages/Reports';
import { Sharing } from './pages/Sharing';
import { AuthState, User } from './types';
import { Layout } from './components/Layout';

interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Fixed: Replaced JSX.Element with React.ReactNode to resolve namespace issues
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('2care_auth');
    return saved ? JSON.parse(saved) : { user: null, token: null };
  });

  useEffect(() => {
    localStorage.setItem('2care_auth', JSON.stringify(auth));
  }, [auth]);

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem('2care_auth');
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadReport />} />
            <Route path="sharing" element={<Sharing />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
