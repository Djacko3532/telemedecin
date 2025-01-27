import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Video, Clock, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import ProfileCard from '../../components/Medecin/ProfileCard';
import DemandeForm from '../../components/RendezVous/DemandeForm';
import api from '../../lib/api';

// Interface pour les médecins
interface Medecin {
  id: number;
  nom: string;
  specialite: string;
  photo_url?: string;
  biographie?: string;
  formation?: string[];
  langues?: string[];
  horaires_consultation?: Record<string, any>;
  date_mise_a_jour?: string;
}

// Interface pour les rendez-vous
interface RendezVous {
  id: number;
  medecin_id: number;
  date_demande: string;
  date_consultation?: string;
  statut: 'En attente' | 'Confirme' | 'Annule';
  motif_consultation: string;
  medecin_nom: string;
  specialite: string;
  room_id?: string;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null);
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [specialites, setSpecialites] = useState<string[]>([]);

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, []);

  // Fonction pour charger les données
  const loadData = async () => {
    try {
      setIsLoading(true);
      // Chargement parallèle des rendez-vous et des médecins
      const [rdvResponse, medecinsResponse] = await Promise.all([
        api.get('/rendezvous'),
        api.get('/medecins')
      ]);

      setRendezVous(rdvResponse.data);
      setMedecins(medecinsResponse.data);
      
      // Extraction des spécialités uniques
      const uniqueSpecialites = Array.from(new Set(
        medecinsResponse.data.map((m: Medecin) => m.specialite)
      )) as string[];
      
      setSpecialites(uniqueSpecialites);
    } catch (error: any) {
      console.error('Erreur de chargement:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage des médecins selon la recherche et la spécialité
  const filteredMedecins = medecins.filter(medecin => {
    const matchesSearch = medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialite = !selectedSpecialite || medecin.specialite === selectedSpecialite;
    return matchesSearch && matchesSpecialite;
  });

  // Gestion de la sélection d'un médecin
  const handleMedecinSelect = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setShowDemandeForm(true);
  };

  // Fonction pour rejoindre une consultation
  const handleJoinConsultation = (rdv: RendezVous) => {
    if (!rdv.room_id) {
      toast.error('La salle de consultation n\'est pas encore disponible');
      return;
    }
    navigate(`/consultation/${rdv.room_id}`);
  };

  // Vérifier si un rendez-vous peut être rejoint
  const canJoinConsultation = (rdv: RendezVous) => {
    if (!rdv.date_consultation || !rdv.room_id) return false;
    
    const consultationTime = new Date(rdv.date_consultation);
    const now = new Date();
    const diffMinutes = (consultationTime.getTime() - now.getTime()) / (1000 * 60);
    
    // Permettre de rejoindre 5 minutes avant l'heure prévue
    return diffMinutes <= 5 && rdv.statut === 'Confirme';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Rendez-vous</p>
                <h3 className="text-2xl font-bold">{rendezVous.length}</h3>
              </div>
              <Calendar className="h-10 w-10 text-blue-500" />
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
                <p className="text-gray-500">Consultations</p>
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
            transition={{ delay: 0.2 }}
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
        </div>

        {/* Liste des rendez-vous confirmés */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Vos consultations à venir</h2>
          <div className="space-y-4">
            {rendezVous
              .filter(rdv => rdv.statut === 'Confirme')
              .map(rdv => (
                <motion.div
                  key={rdv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Dr. {rdv.medecin_nom}</h3>
                      <p className="text-sm text-gray-600">{rdv.specialite}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(rdv.date_consultation!).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Motif:</span> {rdv.motif_consultation}
                      </p>
                    </div>
                    {canJoinConsultation(rdv) && (
                      <button
                        onClick={() => handleJoinConsultation(rdv)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Video className="w-5 h-5" />
                        Rejoindre la consultation
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            {rendezVous.filter(rdv => rdv.statut === 'Confirme').length === 0 && (
              <p className="text-center text-gray-500">
                Aucune consultation confirmée
              </p>
            )}
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Trouver un médecin</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médecin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedSpecialite}
                onChange={(e) => setSelectedSpecialite(e.target.value)}
                className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Toutes les spécialités</option>
                {specialites.map((specialite, index) => (
                  <option key={index} value={specialite}>
                    {specialite}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des médecins */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedecins.map((medecin) => (
              <ProfileCard
                key={medecin.id}
                medecin={medecin}
                onSelect={() => handleMedecinSelect(medecin)}
              />
            ))}
          </div>
        )}

        {/* Modal de demande de rendez-vous */}
        {showDemandeForm && selectedMedecin && (
          <DemandeForm
            medecinId={selectedMedecin.id}
            onClose={() => {
              setShowDemandeForm(false);
              setSelectedMedecin(null);
            }}
            onSuccess={() => {
              loadData();
              toast.success('Demande envoyée avec succès');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;