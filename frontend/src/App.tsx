import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pdv from './pages/Pdv';
import AdminMaster from './pages/AdminMaster';
import Customers from './pages/Customers';
import Finance from './pages/Finance';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/pdv" element={
            <ProtectedRoute requiredPermission="sales">
              <Pdv />
            </ProtectedRoute>
          } />
          
          <Route path="/finance" element={
            <ProtectedRoute requiredPermission="finance">
              <Finance />
            </ProtectedRoute>
          } />
          
          <Route path="/customers" element={
            <ProtectedRoute requiredPermission="customers">
              <Customers />
            </ProtectedRoute>
          } />

          <Route path="/master" element={
            <AdminMaster />
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
