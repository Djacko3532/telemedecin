import express from 'express';
import { auth, checkRole } from '../middleware/auth.js';
import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Créer un nouveau rendez-vous
router.post('/', auth, checkRole(['Patient']), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { 
      medecin_id, 
      motif_consultation, 
      symptomes, 
      urgence, 
      notes_supplementaires 
    } = req.body;

    // Validation des champs requis
    if (!motif_consultation || !symptomes) {
      return res.status(400).json({ 
        message: 'Le motif de consultation et les symptômes sont requis' 
      });
    }

    // Créer le rendez-vous
    const rdvResult = await client.query(
      `INSERT INTO RendezVous (
        patient_id,
        medecin_id,
        motif_consultation,
        symptomes,
        urgence,
        notes_supplementaires,
        statut
      ) VALUES ($1, $2, $3, $4, $5, $6, 'En attente')
      RETURNING *`,
      [
        req.user.id,
        medecin_id,
        motif_consultation,
        Array.isArray(symptomes) ? symptomes : [symptomes],
        urgence === 'true',
        notes_supplementaires
      ]
    );

    // Récupérer les informations du patient pour la notification
    const patientInfo = await client.query(
      `SELECT nom FROM Utilisateur WHERE id = $1`,
      [req.user.id]
    );

    // Créer une notification pour le médecin
    await client.query(
      `INSERT INTO Notification (
        utilisateur_id,
        titre,
        message,
        type
      ) VALUES ($1, $2, $3, 'NOUVEAU_RENDEZVOUS')`,
      [
        medecin_id,
        'Nouvelle demande de rendez-vous',
        `${patientInfo.rows[0].nom} a fait une demande de rendez-vous pour: ${motif_consultation}`
      ]
    );

    await client.query('COMMIT');
    res.status(201).json(rdvResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création du rendez-vous:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du rendez-vous',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Répondre à une demande de rendez-vous (médecin)
router.put('/:id/reponse', auth, checkRole(['Medecin']), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { statut, commentaire_medecin, date_consultation } = req.body;

    // Vérifier si le rendez-vous existe et appartient au médecin
    const checkRdv = await client.query(
      `SELECT rv.*, u.nom as patient_nom 
       FROM RendezVous rv
       JOIN Utilisateur u ON rv.patient_id = u.id
       WHERE rv.id = $1 AND rv.medecin_id = $2`,
      [id, req.user.id]
    );

    if (checkRdv.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Mettre à jour le rendez-vous
    const updateResult = await client.query(
      `UPDATE RendezVous 
       SET statut = $1, 
           commentaire_medecin = $2,
           date_consultation = $3
       WHERE id = $4 AND medecin_id = $5
       RETURNING *`,
      [statut, commentaire_medecin, date_consultation, id, req.user.id]
    );

    // Créer une notification pour le patient
    const notificationMessage = statut === 'Confirme'
      ? `Votre rendez-vous a été confirmé pour le ${new Date(date_consultation).toLocaleString()}. ` +
        `Vous recevrez un lien pour rejoindre la consultation à l'heure prévue.`
      : `Votre rendez-vous a été refusé. Motif: ${commentaire_medecin || 'Non spécifié'}`;

    await client.query(
      `INSERT INTO Notification (
        utilisateur_id,
        titre,
        message,
        type
      ) VALUES ($1, $2, $3, $4)`,
      [
        checkRdv.rows[0].patient_id,
        `Réponse à votre demande de rendez-vous`,
        notificationMessage,
        statut === 'Confirme' ? 'RDV_CONFIRME' : 'RDV_REFUSE'
      ]
    );

    await client.query('COMMIT');
    res.json({
      message: `Rendez-vous ${statut.toLowerCase()} avec succès`,
      rendezVous: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la réponse au rendez-vous:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la réponse au rendez-vous',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Obtenir tous les rendez-vous
router.get('/', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    let query;
    let params;

    if (req.user.role === 'Medecin') {
      query = `
        SELECT rv.*, 
          u.nom as patient_nom,
          u.email as patient_email,
          p.date_naissance,
          p.adresse,
          p.sexe,
          cv.room_id
        FROM RendezVous rv
        JOIN Utilisateur u ON rv.patient_id = u.id
        JOIN Patient p ON u.id = p.id
        LEFT JOIN ConsultationVideo cv ON rv.id = cv.rendez_vous_id
        WHERE rv.medecin_id = $1
        ORDER BY rv.date_demande DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT rv.*, 
          u.nom as medecin_nom,
          m.specialite,
          cv.room_id
        FROM RendezVous rv
        JOIN Utilisateur u ON rv.medecin_id = u.id
        JOIN Medecin m ON u.id = m.id
        LEFT JOIN ConsultationVideo cv ON rv.id = cv.rendez_vous_id
        WHERE rv.patient_id = $1
        ORDER BY rv.date_demande DESC
      `;
      params = [req.user.id];
    }

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des rendez-vous',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

export default router;