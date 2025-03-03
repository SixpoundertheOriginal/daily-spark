
import React from 'react';
import { Brain } from 'lucide-react';

interface CommandBarProps {
  onCommand: (command: string) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ onCommand }) => {
  const [command, setCommand] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      onCommand(command);
      setCommand('');
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-3 flex items-center animate-slide-up shadow-xl shadow-black/20">
      <div className="h-8 w-8 primary-gradient rounded-xl flex items-center justify-center mr-3 animate-pulse-soft shadow-lg shadow-nexus-accent-purple/20">
        <Brain size={18} className="text-white" />
      </div>
      
      <input 
        type="text" 
        className="bg-transparent text-white flex-1 focus:outline-none text-sm placeholder-white/40"
        placeholder="Type a command or add a task..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default CommandBar;
