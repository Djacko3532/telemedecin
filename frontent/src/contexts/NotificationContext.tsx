import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from './AuthContext';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  date_creation: string;
  lu: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const { user } = useAuth();

  // Charger les notifications existantes
  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  // Connexion WebSocket et chargement initial
  useEffect(() => {
    if (user) {
      // Charger les notifications existantes
      loadNotifications();

      // Connexion WebSocket
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connecté au serveur de notifications');
      });

      // Écoute des nouvelles notifications
      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Afficher une notification toast
        toast.info(notification.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

      setSocketInstance(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, lu: true } : notif
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}