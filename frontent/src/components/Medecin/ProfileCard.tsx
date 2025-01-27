import { motion } from 'framer-motion';
import { User, Star, Clock, Calendar, Languages, MapPin, Phone, Mail } from 'lucide-react';

interface ProfileMedecin {
  id: number;
  nom: string;
  specialite: string;
  photo_url?: string;
  biographie?: string;
  formation?: string[];
  langues?: string[];
  horaires_consultation?: Record<string, any>;
  date_mise_a_jour?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  experience_annees?: number;
}

interface ProfileCardProps {
  medecin: ProfileMedecin;
  onSelect?: () => void;
  showDetails?: boolean;
}

const ProfileCard = ({ medecin, onSelect, showDetails = false }: ProfileCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative">
        {medecin.photo_url ? (
          <img
            src={medecin.photo_url}
            alt={`Dr. ${medecin.nom}`}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <User className="w-20 h-20 text-gray-400" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-xl font-bold">Dr. {medecin.nom}</h3>
          <p className="text-white/90">{medecin.specialite}</p>
        </div>
      </div>

      <div className="p-4">
        {showDetails ? (
          <div className="space-y-4">
            {medecin.biographie && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">À propos</h4>
                <p className="text-gray-600">{medecin.biographie}</p>
              </div>
            )}

            <div className="space-y-2">
              {medecin.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{medecin.email}</span>
                </div>
              )}

              {medecin.telephone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{medecin.telephone}</span>
                </div>
              )}

              {medecin.adresse && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{medecin.adresse}</span>
                </div>
              )}

              {medecin.experience_annees && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    {medecin.experience_annees} ans d'expérience
                  </span>
                </div>
              )}
            </div>

            {medecin.formation && medecin.formation.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Formation</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {medecin.formation.map((form, index) => (
                    <li key={index}>{form}</li>
                  ))}
                </ul>
              </div>
            )}

            {medecin.langues && medecin.langues.length > 0 && (
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">
                  {medecin.langues.join(', ')}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-600">Disponible pour consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">
                {medecin.experience_annees} ans d'expérience
              </span>
            </div>
          </div>
        )}

        {onSelect && (
          <button
            onClick={onSelect}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Prendre rendez-vous
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileCard;