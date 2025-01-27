import express from 'express';
import { auth } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Récupérer les notifications de l'utilisateur
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM Notification 
       WHERE utilisateur_id = $1 
       ORDER BY date_creation DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marquer une notification comme lue
 * @access  Private
 */
router.put('/:id/read', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE Notification 
       SET lu = true, date_lecture = CURRENT_TIMESTAMP 
       WHERE id = $1 AND utilisateur_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

/**
 * @route   DELETE /api/notifications/clear
 * @desc    Supprimer toutes les notifications de l'utilisateur
 * @access  Private
 */
router.delete('/clear', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query(
      'DELETE FROM Notification WHERE utilisateur_id = $1',
      [req.user.id]
    );
    res.json({ message: 'Toutes les notifications ont été supprimées' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

export default router;