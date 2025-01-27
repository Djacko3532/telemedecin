import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import rendezVousRoutes from './routes/rendezvous.js';
import consultationRoutes from './routes/consultation.js';
import notificationsRoutes from './routes/notifications.js';
import medecinsRoutes from './routes/medecins.js';
import { pool } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuration Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware pour parser le JSON
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/rendezvous', rendezVousRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/medecins', medecinsRoutes);

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket:', socket.id);

  // Rejoindre une salle
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected');
    console.log(`Utilisateur ${socket.id} a rejoint la salle ${roomId}`);
  });

  // Gérer les offres WebRTC
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer });
  });

  // Gérer les réponses WebRTC
  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer });
  });

  // Gérer les candidats ICE
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  // Gérer les messages du chat
  socket.on('chat-message', ({ roomId, message }) => {
    io.to(roomId).emit('chat-message', message);
  });

  // Quitter une salle
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected');
    console.log(`Utilisateur ${socket.id} a quitté la salle ${roomId}`);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({ 
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});