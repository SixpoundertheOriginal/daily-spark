
import React, { useState } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  message: string | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, message }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (message && isOpen) {
      fetchResponse(message);
    }
  }, [message, isOpen]);

  const fetchResponse = async (userMessage: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: { message: userMessage }
      });

      if (error) throw error;
      setResponse(data.response);
    } catch (err) {
      console.error('Error fetching AI response:', err);
      setError('Failed to get a response from the assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="glass-morphism rounded-xl w-full max-w-md p-4 backdrop-blur-lg shadow-xl border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="h-8 w-8 primary-gradient rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-nexus-accent-purple/20">
                  <Bot size={18} className="text-white" />
                </div>
                <h3 className="text-white text-lg font-light">AI Assistant</h3>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="my-4 min-h-[100px] max-h-[60vh] overflow-y-auto bg-black/20 rounded-lg p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[100px]">
                  <div className="h-10 w-10 rounded-full primary-gradient flex items-center justify-center mb-3 animate-pulse">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <p className="text-nexus-text-secondary text-sm">Generating response...</p>
                </div>
              ) : error ? (
                <div className="text-red-400">
                  <p>{error}</p>
                </div>
              ) : response ? (
                <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-nexus-text-secondary text-center">
                  <p>Ask anything about your tasks or productivity...</p>
                </div>
              )}
            </div>

            <div className="text-xs text-nexus-text-secondary mt-2">
              <p>Powered by OpenAI Assistant</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
