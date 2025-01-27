import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Calendar, X, Upload } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';

interface DemandeFormProps {
  medecinId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  motif_consultation: string;
  symptomes: string;
  urgence: boolean;
  notes_supplementaires?: string;
  carnet_sante?: FileList;
}

const DemandeForm = ({ medecinId, onClose, onSuccess }: DemandeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Créer un FormData pour l'envoi
      const formData = new FormData();
      formData.append('medecin_id', medecinId.toString());
      formData.append('motif_consultation', data.motif_consultation);
      formData.append('symptomes', data.symptomes);
      formData.append('urgence', data.urgence ? 'true' : 'false');
      
      if (data.notes_supplementaires) {
        formData.append('notes_supplementaires', data.notes_supplementaires);
      }

      // Ajouter le carnet de santé s'il existe
      if (data.carnet_sante?.[0]) {
        formData.append('carnet_sante', data.carnet_sante[0]);
      }

      // Envoyer la demande
      await api.post('/rendezvous', formData);

      toast.success('Demande de rendez-vous envoyée avec succès');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nouvelle demande de rendez-vous
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif de consultation *
              </label>
              <input
                {...register("motif_consultation", {
                  required: "Le motif est requis"
                })}
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Consultation de routine, Suivi, Urgence..."
              />
              {errors.motif_consultation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.motif_consultation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptômes *
              </label>
              <textarea
                {...register("symptomes", {
                  required: "Veuillez décrire vos symptômes"
                })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez vos symptômes..."
              />
              {errors.symptomes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.symptomes.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documents médicaux (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Télécharger un fichier</span>
                      <input
                        {...register("carnet_sante")}
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  {...register("urgence")}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  C'est urgent
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes supplémentaires
              </label>
              <textarea
                {...register("notes_supplementaires")}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Informations complémentaires..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DemandeForm;