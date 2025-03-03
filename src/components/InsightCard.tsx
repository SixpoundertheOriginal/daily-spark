
import React from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface InsightCardProps {
  insight: string;
  actionText?: string;
  onAction?: () => void;
  onAskAI?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  actionText = "Optimize Schedule", 
  onAction = () => {},
  onAskAI
}) => {
  const handleAskAIClick = () => {
    if (onAskAI) {
      onAskAI();
      toast.info('AI Assistant', {
        description: 'Opening AI assistant to help you...'
      });
    }
  };

  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      className="glass-card p-4 backdrop-blur-xl shadow-xl shadow-nexus-accent-purple/5 border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start">
        <div className="h-10 w-10 flex-shrink-0 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent-purple/20">
          <Sparkles size={18} className="text-white animate-pulse-soft" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-white text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insight }} />
          <motion.div 
            className="mt-3 flex flex-wrap gap-2"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 1.5 
            }}
          >
            <button 
              onClick={onAction}
              className="text-xs glass-button hover:bg-white/15 transition-all duration-300 shadow-lg shadow-nexus-accent-purple/10 rounded-lg px-4 py-2 flex items-center"
            >
              <span>{actionText}</span>
              <ArrowRight size={12} className="ml-2 text-white" />
            </button>
            
            {onAskAI && (
              <button 
                onClick={handleAskAIClick}
                className="text-xs glass-button hover:bg-white/15 transition-all duration-300 shadow-lg shadow-nexus-accent-purple/10 rounded-lg px-4 py-2 flex items-center"
              >
                <Bot size={12} className="mr-2 text-white" />
                <span>Ask AI Assistant</span>
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;
