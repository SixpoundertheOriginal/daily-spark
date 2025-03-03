
import React, { useState, useEffect, useCallback } from 'react';
import { Bot, X, Sparkles, AlertCircle, RefreshCcw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  message: string | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, message }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'config' | 'network' | 'other' | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const fetchResponse = useCallback(async (userMessage: string) => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    setResponse(null);
    
    try {
      console.log("Calling chat-with-assistant function with message:", userMessage);
      
      const { data, error: invokeError } = await supabase.functions.invoke('chat-with-assistant', {
        body: { message: userMessage }
      });

      if (invokeError) {
        console.error('Error invoking function:', invokeError);
        throw invokeError;
      }
      
      if (data?.error) {
        console.error('API returned an error:', data.error, data.details);
        throw new Error(data.details || data.error);
      }

      console.log("Response received from chat-with-assistant:", data);
      
      if (!data?.response) {
        throw new Error("No response received from the assistant");
      }
      
      setResponse(data.response);
    } catch (err: any) {
      console.error('Error fetching AI response:', err);
      
      // Determine the error message and type to show to the user
      let errorMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
      let errorType: 'config' | 'network' | 'other' = 'other';
      
      if (err.message?.includes('OPENAI_API_KEY') || err.message?.includes('ASSISTANT_ID')) {
        errorMessage = 'AI service is not properly configured. Please contact support.';
        errorType = 'config';
      } else if (err.name === 'FunctionsFetchError' || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
        errorType = 'network';
      }
      
      setError(errorMessage);
      setErrorType(errorType);
      
      toast.error('AI Assistant Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (message && isOpen) {
      fetchResponse(message);
    }
  }, [message, isOpen, retryCount, fetchResponse]);

  const handleRetry = () => {
    if (!message) {
      toast.error('No message to retry');
      return;
    }
    setRetryCount(prev => prev + 1);
    toast.info('Retrying connection to AI service...');
  };

  const openSupabaseSettings = () => {
    window.open('https://supabase.com/dashboard/project/kknjntjniumgajltgrfs/settings/functions', '_blank');
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
                <div className="flex flex-col items-center justify-center text-red-400 p-4">
                  <AlertCircle size={24} className="mb-3" />
                  <p className="text-center mb-4">{error}</p>
                  
                  {errorType === 'config' ? (
                    <Button 
                      onClick={openSupabaseSettings}
                      className="flex items-center justify-center bg-purple-500/30 hover:bg-purple-500/50 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Configure OpenAI Keys
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleRetry}
                      className="flex items-center justify-center bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      <RefreshCcw size={16} className="mr-2" />
                      Retry
                    </Button>
                  )}
                </div>
              ) : response ? (
                <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-nexus-text-secondary text-center">
                  <p>Ask anything about your tasks or productivity...</p>
                </div>
              )}
            </div>

            <div className="text-xs text-nexus-text-secondary mt-2 flex justify-between items-center">
              <p>Powered by OpenAI Assistant</p>
              {error && errorType === 'config' && (
                <p className="text-red-300 text-xs">
                  Note: This feature requires setting up OpenAI API keys in Supabase
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
