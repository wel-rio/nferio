import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pdv" element={<Pdv />} />
        <Route path="/master" element={<AdminMaster />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/finance" element={<Finance />} />
      </Routes>
    </Router>
  );
}

export default App;
