
import React from 'react';
import { Sparkles } from 'lucide-react';

interface InsightCardProps {
  insight: string;
  actionText?: string;
  onAction?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  actionText = "Optimize Schedule", 
  onAction = () => {} 
}) => {
  return (
    <div className="glass-card p-4 animate-slide-up backdrop-blur-xl shadow-xl shadow-nexus-accent-purple/5 border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start">
        <div className="h-10 w-10 flex-shrink-0 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent-purple/20">
          <Sparkles size={18} className="text-white animate-pulse-soft" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-white text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insight }} />
          <div className="mt-3 flex">
            <button 
              onClick={onAction}
              className="text-xs glass-button hover:bg-white/15 transition-all duration-300 shadow-lg shadow-nexus-accent-purple/10 rounded-lg px-4 py-2 flex items-center"
            >
              <span>{actionText}</span>
              <span className="ml-2 h-4 w-4 primary-gradient rounded-full flex items-center justify-center">
                <Sparkles size={8} className="text-white" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
