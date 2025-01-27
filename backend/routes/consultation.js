import express from 'express';
import { auth, checkRole } from '../middleware/auth.js';
import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Démarrer une consultation vidéo
router.post('/start', auth, checkRole(['Medecin']), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rendezVousId } = req.body;

    // Vérifier si le rendez-vous existe et est confirmé
    const rdvCheck = await client.query(
      `SELECT rv.*, u.nom as patient_nom, cv.id as consultation_id, cv.room_id
       FROM RendezVous rv
       JOIN Utilisateur u ON rv.patient_id = u.id
       LEFT JOIN ConsultationVideo cv ON rv.id = cv.rendez_vous_id
       WHERE rv.id = $1 AND rv.medecin_id = $2 AND rv.statut = 'Confirme'`,
      [rendezVousId, req.user.id]
    );

    if (rdvCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rendez-vous non trouvé ou non confirmé' });
    }

    let consultation = rdvCheck.rows[0];

    // Si la consultation n'existe pas encore, la créer
    if (!consultation.consultation_id) {
      const roomId = uuidv4();
      const result = await client.query(
        `INSERT INTO ConsultationVideo (
          rendez_vous_id,
          room_id,
          etat
        ) VALUES ($1, $2, 'En attente')
        RETURNING *`,
        [rendezVousId, roomId]
      );
      consultation = { ...consultation, ...result.rows[0] };
    }

    // Notifier le patient
    await client.query(
      `INSERT INTO Notification (
        utilisateur_id,
        titre,
        message,
        type
      ) VALUES ($1, $2, $3, $4)`,
      [
        rdvCheck.rows[0].patient_id,
        'Consultation vidéo disponible',
        'Votre médecin a démarré la consultation vidéo. Rendez-vous dans votre espace patient pour rejoindre la consultation.',
        'CONSULTATION_PRETE'
      ]
    );

    await client.query('COMMIT');
    res.json({
      message: 'Consultation vidéo créée',
      consultation
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création de la consultation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// Rejoindre une consultation
router.get('/:roomId', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { roomId } = req.params;

    const result = await client.query(
      `SELECT cv.*, rv.patient_id, rv.medecin_id,
              u_patient.nom as patient_nom,
              u_medecin.nom as medecin_nom
       FROM ConsultationVideo cv
       JOIN RendezVous rv ON cv.rendez_vous_id = rv.id
       JOIN Utilisateur u_patient ON rv.patient_id = u_patient.id
       JOIN Utilisateur u_medecin ON rv.medecin_id = u_medecin.id
       WHERE cv.room_id = $1 AND (rv.patient_id = $2 OR rv.medecin_id = $2)`,
      [roomId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// Terminer une consultation
router.put('/:id/end', auth, checkRole(['Medecin']), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { notes_consultation, prescription } = req.body;

    await client.query('BEGIN');

    // Mettre à jour la consultation
    const result = await client.query(
      `UPDATE ConsultationVideo 
       SET etat = 'Terminee',
           date_fin = CURRENT_TIMESTAMP,
           notes_consultation = $1,
           prescription = $2
       WHERE id = $3
       RETURNING *`,
      [notes_consultation, prescription, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }

    // Récupérer les informations du rendez-vous
    const rdvInfo = await client.query(
      `SELECT rv.patient_id, u.nom as patient_nom
       FROM RendezVous rv
       JOIN Utilisateur u ON rv.patient_id = u.id
       WHERE rv.id = $1`,
      [result.rows[0].rendez_vous_id]
    );

    // Créer une notification pour le patient
    await client.query(
      `INSERT INTO Notification (
        utilisateur_id,
        titre,
        message,
        type
      ) VALUES ($1, $2, $3, 'CONSULTATION_TERMINEE')`,
      [
        rdvInfo.rows[0].patient_id,
        'Consultation terminée',
        'Votre consultation est terminée. Vous pouvez consulter les notes et la prescription dans votre espace.'
      ]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la fin de consultation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

export default router;