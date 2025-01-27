import { motion } from 'framer-motion';

const Logo = () => {
  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <img 
        src="/logo.png" 
        alt="MG Telemedicine Logo" 
        className="w-12 h-12"
      />
      <div>
        <h1 className="text-xl font-bold text-blue-600">MG Télémédecine</h1>
        <p className="text-xs text-gray-600">Votre santé, notre priorité</p>
      </div>
    </motion.div>
  );
};

export default Logo;