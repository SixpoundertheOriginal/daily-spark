
import React from 'react';
import { Sparkles, ArrowRight, Bot, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface InsightCardProps {
  insight: string;
  actionText?: string;
  onAction?: () => void;
  onAskAI?: () => void;
  onAnalyzeTasks?: () => void;
  isAnalyzing?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  actionText = "Optimize Schedule", 
  onAction = () => {},
  onAskAI,
  onAnalyzeTasks,
  isAnalyzing = false
}) => {
  const handleAskAIClick = () => {
    if (onAskAI) {
      onAskAI();
      toast.info('AI Assistant', {
        description: 'Opening AI assistant to help you...'
      });
    } else {
      toast.error('AI Assistant Unavailable', {
        description: 'The AI assistant is not available at the moment. Please try again later.'
      });
    }
  };

  const handleAnalyzeTasksClick = () => {
    if (onAnalyzeTasks) {
      onAnalyzeTasks();
      toast.info('Task Analysis', {
        description: 'Analyzing your tasks with AI...'
      });
    }
  };

  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -3 }}
      className="glass-card p-5 backdrop-blur-xl shadow-xl shadow-nexus-accent-purple/10 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden relative"
    >
      {/* Animated glow effect */}
      <div className="absolute -inset-[20px] bg-gradient-to-r from-nexus-accent-purple/20 via-nexus-accent-pink/10 to-nexus-accent-blue/20 blur-[50px] opacity-50 group-hover:opacity-70 transition-opacity duration-1000 -z-10"></div>
      
      {/* Animated hover line */}
      <div className="absolute top-0 left-0 w-0 group-hover:w-full h-[2px] bg-gradient-to-r from-nexus-accent-purple via-nexus-accent-pink to-nexus-accent-blue transition-all duration-700"></div>
      
      <div className="flex items-start">
        <div className="h-10 w-10 flex-shrink-0 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent-purple/20 relative overflow-hidden group">
          <Sparkles size={18} className="text-white animate-pulse-soft relative z-10" />
          {/* Inner glow animation */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 group-hover:animate-pulse-soft"></div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-white text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insight }} />
          <motion.div 
            className="mt-4 flex flex-wrap gap-2"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 1.5 
            }}
          >
            <button 
              onClick={onAction}
              className="text-xs px-4 py-2 rounded-lg flex items-center shadow-lg shadow-nexus-accent-purple/10 bg-gradient-to-r from-nexus-accent-purple to-nexus-accent-pink text-white transition-all hover:shadow-nexus-accent-purple/20 hover:brightness-110"
            >
              <span>{actionText}</span>
              <ArrowRight size={12} className="ml-2 text-white" />
            </button>
            
            {onAskAI && (
              <button 
                onClick={handleAskAIClick}
                className="text-xs glass-button hover:bg-white/15 transition-all duration-300 shadow-lg shadow-nexus-accent-purple/10 rounded-lg px-4 py-2 flex items-center backdrop-blur-sm border border-white/10 hover:border-white/20"
              >
                <Bot size={12} className="mr-2 text-white" />
                <span>Ask AI Assistant</span>
              </button>
            )}

            {onAnalyzeTasks && (
              <button 
                onClick={handleAnalyzeTasksClick}
                className="text-xs glass-button hover:bg-white/15 transition-all duration-300 shadow-lg shadow-nexus-accent-purple/10 rounded-lg px-4 py-2 flex items-center backdrop-blur-sm border border-white/10 hover:border-white/20"
                disabled={isAnalyzing}
              >
                <BarChart size={12} className="mr-2 text-white" />
                <span>{isAnalyzing ? "Analyzing..." : "Analyze Tasks"}</span>
                {isAnalyzing && (
                  <div className="ml-2 h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                )}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;
