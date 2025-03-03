
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Command, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandBarProps {
  onCommand: (command: string) => void;
  onAIQuery: (query: string) => void;
}

const COMMAND_EXAMPLES = [
  "Add a new task",
  "Filter completed",
  "Filter pending",
  "Filter high-priority",
  "Search meeting",
  "Ask AI: How to prioritize my tasks?",
  "Ask AI: Summarize my day",
  "Sign out"
];

const CommandBar: React.FC<CommandBarProps> = ({ onCommand, onAIQuery }) => {
  const [command, setCommand] = useState('');
  const [placeholder, setPlaceholder] = useState('Type a command or add a task...');
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate through command examples in placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prevIndex) => (prevIndex + 1) % COMMAND_EXAMPLES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPlaceholder(`Try: "${COMMAND_EXAMPLES[hintIndex]}"...`);
  }, [hintIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      // Check if it's an AI query
      if (command.toLowerCase().startsWith('ask ai:') || command.toLowerCase().startsWith('ai ')) {
        const query = command.toLowerCase().startsWith('ask ai:') 
          ? command.substring(7).trim() 
          : command.substring(3).trim();
        
        if (query) {
          onAIQuery(query);
          setCommand('');
          setShowHints(false);
        }
      } else {
        onCommand(command);
        setCommand('');
        setShowHints(false);
      }
    } else if (e.key === '/' && command === '') {
      e.preventDefault();
      setShowHints(true);
    } else if (e.key === 'Escape') {
      setShowHints(false);
    }
  };

  const applyHint = (hint: string) => {
    setCommand(hint.toLowerCase());
    setShowHints(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isAIQuery = command.toLowerCase().startsWith('ask ai:') || command.toLowerCase().startsWith('ai ');

  return (
    <div className="relative">
      <motion.div 
        className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-3 flex items-center shadow-xl shadow-black/20 overflow-hidden"
        whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
        animate={{ boxShadow: isAIQuery ? "0 0 20px rgba(139,92,246,0.2)" : "0 0 10px rgba(0,0,0,0.2)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center mr-3 animate-pulse-soft shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-nexus-accent-purple to-nexus-accent-pink opacity-70"></div>
            <div className="relative z-10">
              {isAIQuery ? (
                <Bot size={18} className="text-white" />
              ) : (
                <Command size={18} className="text-white" />
              )}
            </div>
          </div>
          
          {/* Animated ring for AI queries */}
          {isAIQuery && (
            <motion.div 
              className="absolute inset-0 rounded-xl border-2 border-nexus-accent-purple"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.5, scale: 1.2 }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                repeatType: "loop",
              }}
            />
          )}
        </div>
        
        <input 
          ref={inputRef}
          type="text" 
          className="bg-transparent text-white flex-1 focus:outline-none text-sm placeholder-white/40"
          placeholder={placeholder}
          value={command}
          onChange={(e) => {
            setCommand(e.target.value);
            setShowHints(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => command === '' && setShowHints(true)}
          onBlur={() => setTimeout(() => setShowHints(false), 200)}
        />
        
        <AnimatePresence>
          {command && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (command.trim()) {
                  if (isAIQuery) {
                    const query = command.toLowerCase().startsWith('ask ai:') 
                      ? command.substring(7).trim() 
                      : command.substring(3).trim();
                    
                    if (query) {
                      onAIQuery(query);
                    }
                  } else {
                    onCommand(command);
                  }
                  setCommand('');
                  setShowHints(false);
                }
              }}
              className={`h-8 w-8 rounded-full flex items-center justify-center ml-2 hover:opacity-90 transition-all shadow-lg ${
                isAIQuery ? 'bg-gradient-to-r from-nexus-accent-purple to-nexus-accent-pink shadow-nexus-accent-purple/20' : 'primary-gradient'
              }`}
            >
              {isAIQuery ? (
                <Sparkles size={14} className="text-white" />
              ) : (
                <ArrowRight size={14} className="text-white" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {showHints && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl glass-morphism shadow-xl p-2 z-10 border border-white/10"
          >
            <div className="text-xs text-nexus-text-secondary px-2 py-1 flex items-center">
              <Command size={12} className="mr-1" />
              <span>Available commands:</span>
            </div>
            <div className="max-h-[200px] overflow-y-auto scrollbar-none">
              {COMMAND_EXAMPLES.map((hint, index) => (
                <motion.div 
                  key={index}
                  className="px-2 py-1.5 text-sm text-white rounded-lg hover:bg-white/10 cursor-pointer transition-colors flex items-center"
                  onClick={() => applyHint(hint)}
                  whileHover={{ x: 2 }}
                >
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-nexus-text-secondary mr-2 border border-white/5">
                    {hint.toLowerCase().startsWith('ask ai:') ? 'AI' : '/'}
                  </span>
                  {hint}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandBar;
