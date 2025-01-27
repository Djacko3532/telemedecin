import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import Contact from './pages/Contact/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MedecinDashboard from './pages/Medecin/Dashboard';
import PatientDashboard from './pages/Patient/Dashboard';
import VideoCall from './pages/Consultation/VideoCall';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route
                  path="/medecin/dashboard"
                  element={
                    <PrivateRoute roles={['Medecin']}>
                      <MedecinDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/patient/dashboard"
                  element={
                    <PrivateRoute roles={['Patient']}>
                      <PatientDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/consultation/:roomId"
                  element={
                    <PrivateRoute roles={['Medecin', 'Patient']}>
                      <VideoCall />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <ToastContainer position="top-right" />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;