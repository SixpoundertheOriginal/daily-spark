
import React from 'react';
import { motion } from 'framer-motion';
import { Folder, ChevronRight, Tag, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Task } from '../types/supabase';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  name: string;
  taskCount: number;
  color: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface TopicCardViewProps {
  tasks: Task[];
  onSelectTopic: (topic: string) => void;
}

const topicColors = {
  work: "from-blue-500 to-blue-600",
  personal: "from-purple-500 to-purple-600",
  health: "from-green-500 to-green-600",
  finance: "from-amber-500 to-amber-600",
  education: "from-pink-500 to-pink-600",
  entertainment: "from-indigo-500 to-indigo-600",
  other: "from-gray-500 to-gray-600",
};

const topicIcons = {
  work: <Folder className="text-blue-200" />,
  personal: <Tag className="text-purple-200" />,
  health: <Clock className="text-green-200" />,
  finance: <Clock className="text-amber-200" />,
  education: <Clock className="text-pink-200" />,
  entertainment: <Clock className="text-indigo-200" />,
  other: <Tag className="text-gray-200" />,
};

const TopicCard: React.FC<TopicCardProps> = ({ name, taskCount, color, icon, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className={cn(
        "glass-card p-5 border border-white/10 backdrop-blur-xl shadow-xl rounded-xl hover:border-white/20 transition-all duration-300 h-full",
        "bg-gradient-to-br bg-opacity-20 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
      )}>
        {/* Animated glow effect */}
        <div className={`absolute -inset-[20px] bg-gradient-to-r ${color} blur-[50px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 -z-10`}></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 flex-shrink-0 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent-purple/20`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-light text-white capitalize">{name}</h3>
              <p className="text-xs text-nexus-text-secondary">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full glass-morphism hover:bg-white/10"
          >
            <ChevronRight size={18} className="text-nexus-text-secondary" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const TopicCardView: React.FC<TopicCardViewProps> = ({ tasks, onSelectTopic }) => {
  // Group tasks by topic (using the first label as topic)
  const topicGroups = React.useMemo(() => {
    const groups: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      let topic = 'other';
      
      if (task.labels && task.labels.length > 0) {
        topic = task.labels[0].toLowerCase();
      }
      
      if (!groups[topic]) {
        groups[topic] = [];
      }
      
      groups[topic].push(task);
    });
    
    return groups;
  }, [tasks]);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-light text-white">Topics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(topicGroups).map(([topic, tasksInTopic]) => (
          <TopicCard
            key={topic}
            name={topic}
            taskCount={tasksInTopic.length}
            color={topicColors[topic as keyof typeof topicColors] || topicColors.other}
            icon={topicIcons[topic as keyof typeof topicIcons] || topicIcons.other}
            onClick={() => onSelectTopic(topic)}
          />
        ))}
      </div>
    </div>
  );
};

export default TopicCardView;
