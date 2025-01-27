/*
  # Suppression du trigger de vérification d'âge

  Cette migration supprime le trigger de vérification d'âge pour permettre
  une gestion plus flexible de la validation côté application.
*/

-- Suppression du trigger existant
DROP TRIGGER IF EXISTS check_patient_age_trigger ON Patient;

-- Suppression de la fonction associée
DROP FUNCTION IF EXISTS check_patient_age();