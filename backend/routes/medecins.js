import express from 'express';
import { auth } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();

// Get all medecins
router.get('/', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        u.id,
        u.nom,
        u.email,
        m.specialite,
        m.experience_annees,
        m.numero_ordre,
        pm.photo_url,
        pm.horaires_consultation,
        pm.date_mise_a_jour
      FROM Utilisateur u
      JOIN Medecin m ON u.id = m.id
      LEFT JOIN ProfileMedecin pm ON m.id = pm.id
      WHERE u.role = 'Medecin' AND u.actif = true
      ORDER BY u.nom ASC`
    );

    // Transformation des données pour inclure une photo par défaut si nécessaire
    const medecins = result.rows.map(medecin => ({
      ...medecin,
      photo_url: medecin.photo_url || '/default-doctor.png'
    }));

    res.json(medecins);
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des médecins',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Get medecin by ID
router.get('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        u.id,
        u.nom,
        u.email,
        m.specialite,
        m.experience_annees,
        m.numero_ordre,
        pm.photo_url,
        pm.horaires_consultation,
        pm.date_mise_a_jour
      FROM Utilisateur u
      JOIN Medecin m ON u.id = m.id
      LEFT JOIN ProfileMedecin pm ON m.id = pm.id
      WHERE u.id = $1 AND u.role = 'Medecin' AND u.actif = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }

    const medecin = {
      ...result.rows[0],
      photo_url: result.rows[0].photo_url || '/default-doctor.png'
    };

    res.json(medecin);
  } catch (error) {
    console.error('Erreur lors de la récupération du médecin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du médecin',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

export default router;