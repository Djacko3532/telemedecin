

-- Création des types ENUM
CREATE TYPE role_utilisateur AS ENUM ('Administrateur', 'Medecin', 'Patient');
CREATE TYPE etat_consultation AS ENUM ('En attente', 'En cours', 'Terminee', 'Annulee');
CREATE TYPE statut_rendezvous AS ENUM ('Confirme', 'Annule', 'En attente');
CREATE TYPE sexe_type AS ENUM ('Homme', 'Femme');

-- Table Utilisateur
CREATE TABLE Utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role role_utilisateur NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT FALSE,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table Patient
CREATE TABLE Patient (
    id INTEGER PRIMARY KEY REFERENCES Utilisateur(id) ON DELETE CASCADE,
    sexe sexe_type NOT NULL,
    date_naissance DATE NOT NULL,
    adresse TEXT NOT NULL,
    telephone VARCHAR(20),
    groupe_sanguin VARCHAR(5),
    allergies TEXT[],
    maladies_chroniques TEXT[]
);

-- Table Medecin
CREATE TABLE Medecin (
    id INTEGER PRIMARY KEY REFERENCES Utilisateur(id) ON DELETE CASCADE,
    specialite VARCHAR(255) NOT NULL,
    numero_ordre VARCHAR(50) UNIQUE,
    experience_annees INTEGER,
    disponibilite JSONB DEFAULT '{}',
    tarif_consultation DECIMAL(10,2)
);

-- Table Profil Médecin
CREATE TABLE ProfileMedecin (
    id INTEGER PRIMARY KEY REFERENCES Medecin(id) ON DELETE CASCADE,
    photo_url TEXT,
    horaires_consultation JSONB,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Rendez-vous
CREATE TABLE RendezVous (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES Patient(id),
    medecin_id INTEGER REFERENCES Medecin(id),
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_consultation TIMESTAMP,
    statut statut_rendezvous DEFAULT 'En attente',
    motif_consultation TEXT NOT NULL,
    symptomes TEXT[],
    urgence BOOLEAN DEFAULT FALSE,
    notes_supplementaires TEXT,
    commentaire_medecin TEXT
);

-- Table Documents Médicaux
CREATE TABLE DocumentMedical (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES Patient(id),
    rendez_vous_id INTEGER REFERENCES RendezVous(id),
    type_document VARCHAR(50) NOT NULL,
    nom_fichier TEXT NOT NULL,
    url_fichier TEXT NOT NULL,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    taille_fichier INTEGER,
    type_mime VARCHAR(100)
);

-- Table Consultation Vidéo
CREATE TABLE ConsultationVideo (
    id SERIAL PRIMARY KEY,
    rendez_vous_id INTEGER REFERENCES RendezVous(id),
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP,
    duree INTEGER,
    etat etat_consultation DEFAULT 'En attente',
    room_id VARCHAR(255) UNIQUE NOT NULL,
    notes_consultation TEXT,
    prescription TEXT
);

-- Table Notifications
CREATE TABLE Notification (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES Utilisateur(id),
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_lecture TIMESTAMP
);

-- Création des index
CREATE INDEX idx_utilisateur_email ON Utilisateur(email);
CREATE INDEX idx_utilisateur_role ON Utilisateur(role);
CREATE INDEX idx_medecin_specialite ON Medecin(specialite);
CREATE INDEX idx_rdv_patient ON RendezVous(patient_id);
CREATE INDEX idx_rdv_medecin ON RendezVous(medecin_id);
CREATE INDEX idx_rdv_statut ON RendezVous(statut);
CREATE INDEX idx_rdv_date_consultation ON RendezVous(date_consultation);
CREATE INDEX idx_document_medical_patient ON DocumentMedical(patient_id);
CREATE INDEX idx_document_medical_rdv ON DocumentMedical(rendez_vous_id);
CREATE INDEX idx_consultation_etat ON ConsultationVideo(etat);
CREATE INDEX idx_notification_user ON Notification(utilisateur_id, lu);


-- Commentaires sur les tables
COMMENT ON TABLE Utilisateur IS 'Table principale des utilisateurs du système';
COMMENT ON TABLE Patient IS 'Informations détaillées sur les patients';
COMMENT ON TABLE Medecin IS 'Informations détaillées sur les médecins';
COMMENT ON TABLE ProfileMedecin IS 'Profil professionnel détaillé des médecins';
COMMENT ON TABLE RendezVous IS 'Gestion des rendez-vous entre patients et médecins';
COMMENT ON TABLE DocumentMedical IS 'Documents médicaux des patients';
COMMENT ON TABLE ConsultationVideo IS 'Sessions de consultation vidéo';
COMMENT ON TABLE Notification IS 'Notifications système pour les utilisateurs';