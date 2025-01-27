import { Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#A4D7E1] text-gray-800 py-1">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center gap-1">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>contact@mgtelemedicine.cm</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>Bp 5408</span>
            </div>
          </div>
          <p className="text-xs">
            &copy; 2025 MG Télémédecine
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;