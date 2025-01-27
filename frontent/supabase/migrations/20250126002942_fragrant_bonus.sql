/*
  # Add additional profile fields for doctors

  1. Changes
    - Add biographie (TEXT) to ProfileMedecin
    - Add formation (TEXT[]) to ProfileMedecin 
    - Add langues (TEXT[]) to ProfileMedecin

  2. Security
    - No security changes needed
*/

-- Add new columns to ProfileMedecin table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profilemedecin' AND column_name = 'biographie'
  ) THEN
    ALTER TABLE ProfileMedecin ADD COLUMN biographie TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profilemedecin' AND column_name = 'formation'
  ) THEN
    ALTER TABLE ProfileMedecin ADD COLUMN formation TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profilemedecin' AND column_name = 'langues'
  ) THEN
    ALTER TABLE ProfileMedecin ADD COLUMN langues TEXT[];
  END IF;
END $$;