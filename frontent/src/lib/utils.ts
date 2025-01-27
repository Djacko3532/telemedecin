import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Fonction pour fusionner les classes Tailwind de manière optimisée
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction pour formater les dates
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Fonction pour valider un email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

// Fonction pour gérer les erreurs API
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur est survenue';
}

// Types pour les rôles utilisateur
export type UserRole = 'Patient' | 'Medecin';

// Interface pour les erreurs de formulaire
export interface FormError {
  field: string;
  message: string;
}

// Fonction pour valider les mots de passe
export function validatePassword(password: string): FormError[] {
  const errors: FormError[] = [];
  
  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe doit contenir au moins 8 caractères'
    });
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe doit contenir au moins une majuscule'
    });
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe doit contenir au moins un chiffre'
    });
  }
  
  return errors;
}