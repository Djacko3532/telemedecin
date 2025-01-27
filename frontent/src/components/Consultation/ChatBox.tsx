import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Paperclip } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface ChatBoxProps {
  roomId: string;
  userId: number;
  userName: string;
  socket: any;
}

const ChatBox = ({ roomId, userId, userName, socket }: ChatBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    socket.emit('chat-message', { roomId, message });
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      const response = await fetch('/api/consultation/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      const message: Message = {
        id: Date.now().toString(),
        senderId: userId,
        senderName: userName,
        content: `A partagé un fichier: ${file.name}`,
        timestamp: new Date(),
        type: 'file',
        fileUrl: data.fileUrl,
        fileName: file.name
      };

      socket.emit('chat-message', { roomId, message });
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Bouton d'ouverture du chat */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </motion.button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50"
          >
            {/* En-tête */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold">Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto h-[calc(100vh-180px)]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === userId ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg p-3 ${
                      message.senderId === userId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm font-medium">{message.senderName}</p>
                    {message.type === 'file' ? (
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        {message.fileName}
                      </a>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <p className="text-xs mt-1 opacity-75">
                      {formatDate(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulaire d'envoi */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t bg-gray-50"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <Paperclip className="w-6 h-6" />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;