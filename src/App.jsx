import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './components/dashboards/DonorDashboard';
import RecipientDashboard from './components/dashboards/RecipientDashboard';
import DeliveryDashboard from './components/dashboards/DeliveryDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import PublicCard from './pages/PublicCard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/card/:userId" element={<PublicCard />} />
              
              <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
                <Route path="/donor-dashboard" element={<DonorDashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['recipient']} />}>
                <Route path="/recipient-dashboard" element={<RecipientDashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['delivery']} />}>
                <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
