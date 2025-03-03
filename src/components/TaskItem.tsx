
import React from 'react';
import { MoreVertical, Clock, Tag, MessageSquare, ChevronRight } from 'lucide-react';
import { isOverdue } from '../utils/dateUtils';
import { Task } from '../types/supabase';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  dateGroup: string;
  onToggleCompletion: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, dateGroup, onToggleCompletion }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ec4899';
      case 'medium': return '#8b5cf6';
      case 'low': return '#60a5fa';
      default: return '#8b5cf6';
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const priorityOpacity = task.priority === 'high' ? 1 : task.priority === 'medium' ? 0.7 : 0.4;

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="relative glass-card p-3 hover:bg-white/5 backdrop-blur-xl card-hover shadow-lg shadow-black/10 group"
    >
      {/* Priority indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg shadow-lg transition-all duration-300 group-hover:w-1.5"
        style={{
          background: `linear-gradient(to bottom, ${priorityColor}, ${priorityColor}80)`,
          opacity: priorityOpacity,
          boxShadow: `0 0 10px ${priorityColor}40`
        }}
      ></div>
      
      <div className="flex items-start">
        {/* Completion toggle */}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleCompletion(task.id)}
          className={`mt-0.5 h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${
            task.completed 
              ? 'primary-gradient shadow-lg shadow-nexus-accent-purple/20' 
              : 'border border-white border-opacity-30 hover:border-opacity-50 hover:shadow-lg hover:shadow-nexus-accent-purple/10'
          }`}
        >
          {task.completed && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-2 w-2 rounded-full bg-white"
            ></motion.div>
          )}
        </motion.div>
        
        {/* Task details */}
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div className="max-w-[80%]">
              <p className={`text-sm font-medium break-words ${task.completed ? 'text-nexus-text-secondary line-through' : 'text-white'}`}>
                {task.title}
              </p>
              <p className="text-xs text-nexus-text-muted mt-0.5 break-words">{task.description}</p>
            </div>
            <button className="h-6 w-6 rounded-full bg-white/0 group-hover:bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
              <MoreVertical size={14} className="text-nexus-text-secondary" />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center">
              <Clock size={12} className="text-nexus-text-muted mr-1" />
              <span className={`text-xs ${dateGroup === 'Overdue' || isOverdue(task.deadline) ? 'text-red-300' : 'text-nexus-text-secondary'}`}>
                {task.deadline}
              </span>
            </div>
            
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 max-w-full">
                {task.labels.map((label, index) => (
                  <div key={index} className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-nexus-text-secondary flex items-center backdrop-blur-sm hover:bg-white/15 transition-all truncate max-w-[120px]">
                    <Tag size={10} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>
            )}
            
            {task.commentCount && task.commentCount > 0 && (
              <div className="flex items-center">
                <MessageSquare size={12} className="text-nexus-text-muted mr-1" />
                <span className="text-xs text-nexus-text-secondary">{task.commentCount}</span>
              </div>
            )}
          </div>
        </div>
        
        <ChevronRight size={16} className="text-nexus-text-muted ml-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
};

export default TaskItem;
