import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Share, Maximize2 } from 'lucide-react';
import { webRTCConfig } from '../../config/webrtc';
import { toast } from 'react-toastify';
import ChatBox from './ChatBox';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';

interface VideoRoomProps {
  roomId: string;
  onEnd: () => void;
}

const VideoRoom = ({ roomId, onEnd }: VideoRoomProps) => {
  const { user } = useAuth();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const socket = useRef<Socket>(io('http://localhost:5000'));

  useEffect(() => {
    initializeWebRTC();
    setupSocketListeners();

    return () => {
      cleanupWebRTC();
      socket.current.disconnect();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection(webRTCConfig);
      
      stream.getTracks().forEach(track => {
        if (peerConnection.current && localStream.current) {
          peerConnection.current.addTrack(track, localStream.current);
        }
      });

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit('ice-candidate', {
            roomId,
            candidate: event.candidate
          });
        }
      };

      setIsConnecting(false);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation WebRTC:', error);
      toast.error('Erreur lors de l\'accès à la caméra ou au microphone');
    }
  };

  const setupSocketListeners = () => {
    socket.current.emit('join-room', roomId);

    socket.current.on('user-connected', async () => {
      if (peerConnection.current) {
        try {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.current.emit('offer', { roomId, offer });
        } catch (error) {
          console.error('Erreur lors de la création de l\'offre:', error);
        }
      }
    });

    socket.current.on('offer', async (data: { offer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.current.emit('answer', { roomId, answer });
        } catch (error) {
          console.error('Erreur lors de la réponse à l\'offre:', error);
        }
      }
    });

    socket.current.on('answer', async (data: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error) {
          console.error('Erreur lors de la réception de la réponse:', error);
        }
      }
    });

    socket.current.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Erreur lors de l\'ajout du candidat ICE:', error);
        }
      }
    });

    socket.current.on('user-disconnected', () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      toast.info('L\'autre participant a quitté la consultation');
    });
  };

  const cleanupWebRTC = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isSharingScreen) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        screenStream.current = stream;
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }

        const screenTrack = stream.getVideoTracks()[0];
        if (peerConnection.current) {
          const sender = peerConnection.current.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsSharingScreen(true);
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Erreur lors du partage d\'écran:', error);
      toast.error('Erreur lors du partage d\'écran');
    }
  };

  const stopScreenShare = async () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
      
      if (peerConnection.current && localStream.current) {
        const videoTrack = localStream.current.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
    }
    setIsSharingScreen(false);
  };

  const handleEndCall = () => {
    cleanupWebRTC();
    socket.current.emit('leave-room', roomId);
    onEnd();
  };

  return (
    <div ref={containerRef} className="relative h-screen bg-gray-900">
      {/* Vidéo principale (distante ou partage d'écran) */}
      <div className="relative w-full h-full">
        {isSharingScreen ? (
          <video
            ref={screenShareRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Vidéo locale (petite fenêtre) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute top-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden shadow-lg"
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Indicateur de connexion */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p className="text-lg">Connexion en cours...</p>
          </div>
        </div>
      )}

      {/* Contrôles */}
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6 text-white" />
            ) : (
              <MicOff className="h-6 w-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6 text-white" />
            ) : (
              <VideoOff className="h-6 w-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              isSharingScreen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Share className="h-6 w-6 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Phone className="h-6 w-6 text-white transform rotate-135" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullScreen}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Maximize2 className="h-6 w-6 text-white" />
          </motion.button>

          {/* Chat */}
          <ChatBox
            roomId={roomId}
            userId={user?.id || 0}
            userName={user?.nom || ''}
            socket={socket.current}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;