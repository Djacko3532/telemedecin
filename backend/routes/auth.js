import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const router = express.Router();

// Route de connexion
router.post('/login', async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;
    console.log('Tentative de connexion:', { email });

    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email et mot de passe requis' 
      });
    }

    // Recherche de l'utilisateur avec les informations du rôle
    const result = await client.query(
      `SELECT u.*, 
        CASE 
          WHEN u.role = 'Patient' THEN (
            SELECT json_build_object(
              'sexe', p.sexe,
              'date_naissance', p.date_naissance,
              'adresse', p.adresse,
              'telephone', p.telephone,
              'groupe_sanguin', p.groupe_sanguin
            )
            FROM Patient p 
            WHERE p.id = u.id
          )
          WHEN u.role = 'Medecin' THEN (
            SELECT json_build_object(
              'specialite', m.specialite,
              'numero_ordre', m.numero_ordre,
              'experience_annees', m.experience_annees
            )
            FROM Medecin m 
            WHERE m.id = u.id
          )
        END as role_info
      FROM Utilisateur u 
      WHERE u.email = $1 AND u.actif = true`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const user = result.rows[0];

    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.mot_de_passe);
    if (!validPassword) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Création du token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        nom: user.nom,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Log de la connexion réussie
    console.log('Connexion réussie:', {
      userId: user.id,
      role: user.role,
      email: user.email
    });

    // Envoi de la réponse
    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        role_info: user.role_info
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la connexion',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Route d'inscription
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { 
      nom, 
      email, 
      password, 
      role,
      // Champs spécifiques au médecin
      specialite,
      numero_ordre,
      experience_annees,
      // Champs spécifiques au patient
      date_naissance,
      adresse,
      telephone,
      sexe,
      groupe_sanguin
    } = req.body;

    // Vérification si l'email existe déjà
    const emailCheck = await client.query(
      'SELECT * FROM Utilisateur WHERE email = $1',
      [email.toLowerCase()]
    );

    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérification du numéro d'ordre pour les médecins
    if (role === 'Medecin' && numero_ordre) {
      const numeroOrdreCheck = await client.query(
        'SELECT * FROM Medecin WHERE numero_ordre = $1',
        [numero_ordre]
      );

      if (numeroOrdreCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Ce numéro d\'ordre est déjà utilisé' });
      }
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion de l'utilisateur
    const userResult = await client.query(
      `INSERT INTO Utilisateur (nom, email, mot_de_passe, role, actif)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, nom, email, role`,
      [nom, email.toLowerCase(), hashedPassword, role]
    );

    const user = userResult.rows[0];

    // Insertion des données spécifiques selon le rôle
    if (role === 'Medecin') {
      await client.query(
        `INSERT INTO Medecin (id, specialite, numero_ordre, experience_annees)
         VALUES ($1, $2, $3, $4)`,
        [user.id, specialite, numero_ordre, experience_annees]
      );
    } else if (role === 'Patient') {
      await client.query(
        `INSERT INTO Patient (id, sexe, date_naissance, adresse, telephone, groupe_sanguin)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, sexe, date_naissance, adresse, telephone, groupe_sanguin]
      );
    }

    await client.query('COMMIT');

    // Création du token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        nom: user.nom,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

export default router;