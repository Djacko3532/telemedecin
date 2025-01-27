import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VideoRoom from '../../components/Consultation/VideoRoom';
import ConsultationNotes from '../../components/Consultation/ConsultationNotes';
import api from '../../lib/api';
import { toast } from 'react-toastify';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showNotes, setShowNotes] = useState(false);
  const [consultation, setConsultation] = useState(null);

  useEffect(() => {
    loadConsultationDetails();
  }, [roomId]);

  const loadConsultationDetails = async () => {
    try {
      const response = await api.get(`/consultation/${roomId}`);
      setConsultation(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails de la consultation');
      navigate(-1);
    }
  };

  const handleEndCall = async () => {
    if (user?.role === 'Medecin') {
      setShowNotes(true);
    } else {
      navigate('/patient/dashboard');
    }
  };

  const handleNotesSubmitted = () => {
    navigate('/medecin/dashboard');
  };

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-lg">Chargement de la consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <VideoRoom
        roomId={roomId!}
        onEnd={handleEndCall}
      />

      {showNotes && (
        <ConsultationNotes
          consultationId={consultation.id}
          onClose={() => setShowNotes(false)}
          onSave={handleNotesSubmitted}
        />
      )}
    </>
  );
};

export default VideoCall;