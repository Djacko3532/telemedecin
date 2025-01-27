import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Video, Clock, Search, Filter } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';

// Interface pour les rendez-vous
interface RendezVous {
  id: number;
  patient_id: number;
  date_demande: string;
  date_consultation?: string;
  statut: 'En attente' | 'Confirme' | 'Annule';
  motif_consultation: string;
  symptomes: string[];
  urgence: boolean;
  notes_supplementaires?: string;
  patient_nom: string;
  patient_email: string;
  date_naissance: string;
  adresse: string;
  sexe: string;
  room_id?: string;
}

const MedecinDashboard = () => {
  const navigate = useNavigate();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [selectedTab, setSelectedTab] = useState<'attente' | 'confirmes' | 'annules'>('attente');
  const [isLoading, setIsLoading] = useState(true);
  const [showReponseModal, setShowReponseModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [dateConsultation, setDateConsultation] = useState('');

  // Chargement initial des rendez-vous
  useEffect(() => {
    loadRendezVous();
  }, []);

  // Fonction pour charger les rendez-vous
  const loadRendezVous = async () => {
    try {
      const response = await api.get('/rendezvous');
      setRendezVous(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour démarrer une consultation
  const handleStartConsultation = async (rdv: RendezVous) => {
    try {
      // Vérifier si la consultation peut commencer (date prévue)
      const consultationDate = new Date(rdv.date_consultation!);
      const now = new Date();
      const diffMinutes = (consultationDate.getTime() - now.getTime()) / (1000 * 60);

      // Permettre de démarrer 5 minutes avant l'heure prévue
      if (diffMinutes > 5) {
        toast.warning(`La consultation ne peut pas encore commencer. Elle est prévue pour ${consultationDate.toLocaleString()}`);
        return;
      }

      // Créer/démarrer la consultation
      const response = await api.post('/consultation/start', {
        rendezVousId: rdv.id
      });

      const { consultation } = response.data;
      
      // Rediriger vers la salle de consultation
      navigate(`/consultation/${consultation.room_id}`);
    } catch (error) {
      console.error('Erreur lors du démarrage de la consultation:', error);
      toast.error('Erreur lors du démarrage de la consultation');
    }
  };

  // Fonction pour répondre à une demande de rendez-vous
  const handleReponse = async (rdvId: number, statut: 'Confirme' | 'Annule') => {
    try {
      if (!dateConsultation && statut === 'Confirme') {
        toast.error('Veuillez sélectionner une date de consultation');
        return;
      }

      // Mettre à jour le rendez-vous
      await api.put(`/rendezvous/${rdvId}/reponse`, {
        statut,
        commentaire_medecin: commentaire,
        date_consultation: dateConsultation
      });

      toast.success(`Rendez-vous ${statut === 'Confirme' ? 'confirmé' : 'annulé'} avec succès`);
      loadRendezVous();
      setShowReponseModal(false);
      setSelectedRdv(null);
      setCommentaire('');
      setDateConsultation('');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la réponse au rendez-vous');
    }
  };

  // Filtrer les rendez-vous selon l'onglet sélectionné
  const filteredRendezVous = rendezVous.filter(rdv => {
    switch (selectedTab) {
      case 'attente':
        return rdv.statut === 'En attente';
      case 'confirmes':
        return rdv.statut === 'Confirme';
      case 'annules':
        return rdv.statut === 'Annule';
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Gérez vos rendez-vous et consultations</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Patients</p>
                <h3 className="text-2xl font-bold">
                  {new Set(rendezVous.map(rdv => rdv.patient_id)).size}
                </h3>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">En attente</p>
                <h3 className="text-2xl font-bold">
                  {rendezVous.filter(rdv => rdv.statut === 'En attente').length}
                </h3>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Confirmés</p>
                <h3 className="text-2xl font-bold">
                  {rendezVous.filter(rdv => rdv.statut === 'Confirme').length}
                </h3>
              </div>
              <Video className="h-10 w-10 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Annulés</p>
                <h3 className="text-2xl font-bold">
                  {rendezVous.filter(rdv => rdv.statut === 'Annule').length}
                </h3>
              </div>
              <Clock className="h-10 w-10 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSelectedTab('attente')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  selectedTab === 'attente'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setSelectedTab('confirmes')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  selectedTab === 'confirmes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Confirmés
              </button>
              <button
                onClick={() => setSelectedTab('annules')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  selectedTab === 'annules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Annulés
              </button>
            </nav>
          </div>

          {/* Liste des rendez-vous */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : filteredRendezVous.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun rendez-vous {selectedTab}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRendezVous.map((rdv) => (
                  <motion.div
                    key={rdv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rdv.patient_nom}
                        </h3>
                        <p className="text-sm text-gray-600">{rdv.patient_email}</p>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Motif:</span> {rdv.motif_consultation}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Symptômes:</span>{' '}
                            {Array.isArray(rdv.symptomes) ? rdv.symptomes.join(', ') : rdv.symptomes}
                          </p>
                          {rdv.notes_supplementaires && (
                            <p className="text-sm">
                              <span className="font-medium">Notes:</span> {rdv.notes_supplementaires}
                            </p>
                          )}
                          <p className="text-sm">
                            <span className="font-medium">Date de demande:</span>{' '}
                            {new Date(rdv.date_demande).toLocaleString()}
                          </p>
                          {rdv.date_consultation && (
                            <p className="text-sm">
                              <span className="font-medium">Date de consultation:</span>{' '}
                              {new Date(rdv.date_consultation).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {rdv.statut === 'En attente' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRdv(rdv);
                              setShowReponseModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Répondre
                          </button>
                        </div>
                      )}
                      {rdv.statut === 'Confirme' && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">Confirmé</span>
                          <button
                            onClick={() => handleStartConsultation(rdv)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <Video className="w-5 h-5" />
                            Démarrer la consultation
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de réponse */}
      {showReponseModal && selectedRdv && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Répondre à la demande de {selectedRdv.patient_nom}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure de consultation
                  </label>
                  <input
                    type="datetime-local"
                    value={dateConsultation}
                    onChange={(e) => setDateConsultation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ajoutez un commentaire..."
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowReponseModal(false);
                      setSelectedRdv(null);
                      setCommentaire('');
                      setDateConsultation('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleReponse(selectedRdv.id, 'Annule')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleReponse(selectedRdv.id, 'Confirme')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={!dateConsultation}
                  >
                    Accepter
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MedecinDashboard;