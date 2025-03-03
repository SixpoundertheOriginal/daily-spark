
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
    <div className="bg-nexus-bg-secondary bg-opacity-70 rounded-full border border-gray-700 p-2 flex items-center animate-slide-up">
      <div className="h-7 w-7 primary-gradient rounded-full flex items-center justify-center mr-3 animate-pulse-soft">
        <Brain size={16} className="text-white" />
      </div>
      
      <input 
        type="text" 
        className="bg-transparent text-white flex-1 focus:outline-none text-sm"
        placeholder="Type a command or add a task..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default CommandBar;
