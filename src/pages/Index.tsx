
import React, { useState, useEffect } from 'react';
import TaskPanel from '../components/TaskPanel';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { checkAssistantStatus } from '../services/assistantService';

const Index = () => {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [assistantConfigured, setAssistantConfigured] = useState<boolean | null>(null);
  
  useEffect(() => {
    const verifyAssistantConfig = async () => {
      try {
        const status = await checkAssistantStatus();
        setAssistantConfigured(status.configured);
        
        if (!status.configured) {
          toast.error('OpenAI Assistant Not Configured', {
            description: status.details || 'Please check your API keys in Supabase',
          });
        } else {
          toast.success('OpenAI Assistant Connected', {
            description: `Connected to ${status.assistantName || 'your assistant'}`,
          });
        }
      } catch (error) {
        console.error('Error verifying assistant config:', error);
        setAssistantConfigured(false);
      }
    };
    
    verifyAssistantConfig();
  }, []);
  
  const handleSwitchView = () => {
    const newMode = viewMode === 'list' ? 'card' : 'list';
    setViewMode(newMode);
    toast.info(
      newMode === 'card' 
      ? 'Switched to topic card view' 
      : 'Switched to list view'
    );
  };
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[150%] bg-gradient-to-br from-nexus-accent-purple/10 via-transparent to-nexus-accent-blue/10 blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-20%] right-[-5%] w-[70%] h-[70%] bg-gradient-to-tl from-nexus-accent-pink/10 via-transparent to-nexus-accent-blue/10 blur-[100px] opacity-40"></div>
        
        {/* Futuristic grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#8b5cf620_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
      </div>
      
      {/* View toggle */}
      <div className="fixed top-4 right-4 z-50">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-1 rounded-full backdrop-blur-xl border border-white/10 flex items-center shadow-lg shadow-nexus-accent-purple/10"
        >
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${viewMode === 'list' ? 'bg-white/20' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={18} className="text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${viewMode === 'card' ? 'bg-white/20' : ''}`}
            onClick={() => setViewMode('card')}
            title="Card View"
          >
            <LayoutGrid size={18} className="text-white" />
          </Button>
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <TaskPanel 
          viewMode={viewMode} 
          onSwitchView={handleSwitchView} 
          assistantConfigured={assistantConfigured}
        />
      </div>
    </div>
  );
};

export default Index;
