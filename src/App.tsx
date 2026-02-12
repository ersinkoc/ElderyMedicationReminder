import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './components/landing/LandingPage';
import ElderSetup from './components/elder/ElderSetup';
import ElderHome from './components/elder/ElderHome';
import CaretakerLogin from './components/caretaker/CaretakerLogin';
import PairElder from './components/caretaker/PairElder';
import Dashboard from './components/caretaker/Dashboard';
import ElderDetail from './components/caretaker/ElderDetail';
import MedicationForm from './components/caretaker/MedicationForm';

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Landing - redirect if already logged in */}
      <Route
        path="/"
        element={
          user && role === 'elder' ? (
            <Navigate to="/elder/home" replace />
          ) : user && role === 'caretaker' ? (
            <Navigate to="/caretaker/dashboard" replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Elder routes */}
      <Route path="/elder" element={<ElderSetup />} />
      <Route
        path="/elder/home"
        element={
          <ProtectedRoute requiredRole="elder">
            <ElderHome />
          </ProtectedRoute>
        }
      />

      {/* Caretaker routes */}
      <Route
        path="/caretaker/login"
        element={
          user && role === 'caretaker' ? (
            <Navigate to="/caretaker/dashboard" replace />
          ) : (
            <CaretakerLogin />
          )
        }
      />
      <Route
        path="/caretaker/pair"
        element={
          <ProtectedRoute requiredRole="caretaker">
            <PairElder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/caretaker/dashboard"
        element={
          <ProtectedRoute requiredRole="caretaker">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/caretaker/elder/:id"
        element={
          <ProtectedRoute requiredRole="caretaker">
            <ElderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/caretaker/elder/:id/add-med"
        element={
          <ProtectedRoute requiredRole="caretaker">
            <MedicationForm />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
