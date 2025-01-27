import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Logo from '../Logo/Logo';
import NotificationCenter from '../Notification/NotificationCenter';
import { Menu, X, LogOut, User, Bell } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return user.role === 'Medecin' ? '/medecin/dashboard' : '/patient/dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      className="bg-[#A4D7E1] shadow-md relative z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div onClick={() => handleNavigation('/')} className="cursor-pointer">
            <Logo />
          </div>
          
          {/* Navigation Desktop */}
          <nav className="hidden md:flex gap-6">
            <button onClick={() => handleNavigation('/')} className="text-gray-800 hover:text-blue-800 font-medium transition-colors">
              Accueil
            </button>
            <button onClick={() => handleNavigation('/services')} className="text-gray-800 hover:text-blue-800 font-medium transition-colors">
              Services
            </button>
            <button onClick={() => handleNavigation('/contact')} className="text-gray-800 hover:text-blue-800 font-medium transition-colors">
              Contact
            </button>
          </nav>

          {/* Buttons Desktop */}
          <div className="hidden md:flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="text-gray-600 hover:text-gray-800 relative"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationCenter
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                </div>
                <button 
                  onClick={() => handleNavigation(getDashboardPath())}
                  className="flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium transition-colors"
                >
                  <User className="w-5 h-5" />
                  {user?.nom}
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-blue-800 text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="text-blue-800 hover:text-blue-900 font-medium transition-colors"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="bg-blue-800 text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors"
                >
                  Inscrivez-vous
                </button>
              </>
            )}
          </div>

          {/* Menu Mobile Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-800" />
            ) : (
              <Menu className="w-6 h-6 text-gray-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#A4D7E1] border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-4">
                <button onClick={() => handleNavigation('/')} className="text-gray-800 hover:text-blue-800 font-medium transition-colors py-2">
                  Accueil
                </button>
                <button onClick={() => handleNavigation('/services')} className="text-gray-800 hover:text-blue-800 font-medium transition-colors py-2">
                  Services
                </button>
                <button onClick={() => handleNavigation('/contact')} className="text-gray-800 hover:text-blue-800 font-medium transition-colors py-2">
                  Contact
                </button>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {isAuthenticated ? (
                    <>
                      <button 
                        onClick={() => handleNavigation(getDashboardPath())}
                        className="flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium transition-colors py-2"
                      >
                        <User className="w-5 h-5" />
                        {user?.nom}
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 justify-center bg-blue-800 text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleNavigation('/login')}
                        className="text-blue-800 hover:text-blue-900 font-medium transition-colors py-2"
                      >
                        Connexion
                      </button>
                      <button 
                        onClick={() => handleNavigation('/register')}
                        className="bg-blue-800 text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors"
                      >
                        Inscrivez-vous
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;