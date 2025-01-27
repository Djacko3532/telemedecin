import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // Augmentation du timeout à 30 secondes
  withCredentials: true
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Erreur réseau ou serveur non disponible
    if (!error.response) {
      console.error('Erreur réseau:', error);
      toast.error('Erreur de connexion au serveur. Veuillez réessayer.');
      return Promise.reject(error);
    }

    // Log détaillé de l'erreur
    console.error('Erreur API:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    // Gestion des erreurs d'authentification
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expirée. Veuillez vous reconnecter.');
    }

    // Gestion des erreurs d'autorisation
    if (error.response.status === 403) {
      toast.error('Accès non autorisé');
    }

    // Gestion des erreurs de validation
    if (error.response.status === 400) {
      const message = error.response.data.message || 'Données invalides';
      toast.error(message);
    }

    // Gestion des erreurs 404
    if (error.response.status === 404) {
      toast.error('La ressource demandée n\'existe pas');
    }

    // Gestion des erreurs serveur
    if (error.response.status === 500) {
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    }

    return Promise.reject(error);
  }
);

export default api;