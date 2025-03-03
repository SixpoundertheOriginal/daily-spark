
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Command, ArrowRight } from 'lucide-react';

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

  return (
    <div className="relative">
      <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-3 flex items-center animate-slide-up shadow-xl shadow-black/20">
        <div className="h-8 w-8 primary-gradient rounded-xl flex items-center justify-center mr-3 animate-pulse-soft shadow-lg shadow-nexus-accent-purple/20">
          {command.toLowerCase().startsWith('ask ai:') || command.toLowerCase().startsWith('ai ') ? (
            <Bot size={18} className="text-white" />
          ) : (
            <Command size={18} className="text-white" />
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
        
        {command && (
          <button 
            onClick={() => {
              if (command.trim()) {
                if (command.toLowerCase().startsWith('ask ai:') || command.toLowerCase().startsWith('ai ')) {
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
            className="h-8 w-8 primary-gradient rounded-full flex items-center justify-center ml-2 hover:opacity-90 transition-opacity"
          >
            <ArrowRight size={14} className="text-white" />
          </button>
        )}
      </div>
      
      {showHints && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl glass-morphism shadow-xl p-2 z-10 animate-fade-in">
          <div className="text-xs text-nexus-text-secondary px-2 py-1">Try these commands:</div>
          <div className="max-h-[200px] overflow-y-auto scrollbar-none">
            {COMMAND_EXAMPLES.map((hint, index) => (
              <div 
                key={index}
                className="px-2 py-1.5 text-sm text-white rounded-lg hover:bg-white/10 cursor-pointer transition-colors flex items-center"
                onClick={() => applyHint(hint)}
              >
                <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-nexus-text-secondary mr-2">
                  {hint.toLowerCase().startsWith('ask ai:') ? 'AI' : '/'}
                </span>
                {hint}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandBar;
