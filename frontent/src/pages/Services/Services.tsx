import { motion } from 'framer-motion';
import { Calendar, Video, FileText, Users } from 'lucide-react';

const features = [
  {
    icon: <Video className="w-8 h-8 text-blue-600" />,
    title: "Téléconsultation",
    description: "Consultez des médecins spécialistes à distance via notre plateforme sécurisée de vidéoconférence."
  },
  {
    icon: <Calendar className="w-8 h-8 text-blue-600" />,
    title: "Rendez-vous en ligne",
    description: "Prenez rendez-vous facilement avec votre médecin et recevez des rappels automatiques."
  },
  {
    icon: <FileText className="w-8 h-8 text-blue-600" />,
    title: "Dossier médical",
    description: "Accédez à votre dossier médical électronique et partagez-le en toute sécurité avec vos médecins."
  },
  {
    icon: <Users className="w-8 h-8 text-blue-600" />,
    title: "Suivi médical",
    description: "Bénéficiez d'un suivi personnalisé et restez en contact avec votre équipe médicale."
  }
];

const Services = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nos Services
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez comment notre plateforme de télémédecine transforme l'accès aux soins de santé au Cameroun
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;