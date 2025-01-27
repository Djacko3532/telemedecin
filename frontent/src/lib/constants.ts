// Configuration de l'API
export const API_URL = 'http://localhost:5000/api';

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PATIENT_DASHBOARD: '/patient/dashboard',
  MEDECIN_DASHBOARD: '/medecin/dashboard',
  CONSULTATION: '/consultation',
  PROFILE: '/profile'
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_EMAIL: 'Email invalide',
  INVALID_PASSWORD: 'Mot de passe invalide',
  PASSWORDS_NOT_MATCH: 'Les mots de passe ne correspondent pas',
  SERVER_ERROR: 'Une erreur est survenue',
  SESSION_EXPIRED: 'Votre session a expiré'
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie',
  REGISTER_SUCCESS: 'Inscription réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  PROFILE_UPDATE_SUCCESS: 'Profil mis à jour avec succès'
} as const;

// Configuration des spécialités médicales
export const SPECIALITES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Gynécologie',
  'Pédiatrie',
  'Psychiatrie',
  'Ophtalmologie',
  'ORL',
  'Rhumatologie'
] as const;

// Configuration des statuts de rendez-vous
export const STATUT_RENDEZVOUS = {
  EN_ATTENTE: 'En attente',
  CONFIRME: 'Confirmé',
  ANNULE: 'Annulé'
} as const;

// Configuration des types de documents médicaux
export const TYPES_DOCUMENTS = {
  ORDONNANCE: 'Ordonnance',
  ANALYSE: 'Analyse',
  RADIO: 'Radiographie',
  COMPTE_RENDU: 'Compte rendu'
} as const;