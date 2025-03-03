
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
    <div className="glass-card p-3 animate-slide-up">
      <div className="flex items-start">
        <div className="h-8 w-8 flex-shrink-0 primary-gradient rounded-lg flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-white text-sm" dangerouslySetInnerHTML={{ __html: insight }} />
          <div className="mt-2 flex">
            <button 
              onClick={onAction}
              className="text-xs glass-button hover:bg-white/15 transition-all duration-300"
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
