
import React from 'react';
import { MoreVertical, Clock, Tag, MessageSquare, ChevronRight } from 'lucide-react';
import { isOverdue } from '../utils/dateUtils';

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    description: string;
    deadline: string;
    priority: string;
    completed: boolean;
    labels: string[];
    commentCount: number;
  };
  dateGroup: string;
  onToggleCompletion: (taskId: number) => void;
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
    <div 
      className="relative bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-10 hover:border-opacity-20 transition-all duration-300 animate-slide-up card-hover"
      style={{ animationDelay: `${task.id * 50}ms` }}
    >
      {/* Priority indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" 
        style={{
          background: priorityColor,
          opacity: priorityOpacity
        }}
      ></div>
      
      <div className="flex items-start">
        {/* Completion toggle */}
        <div 
          onClick={() => onToggleCompletion(task.id)}
          className={`mt-0.5 h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${
            task.completed 
              ? 'primary-gradient' 
              : 'border border-white border-opacity-30 hover:border-opacity-50'
          }`}
        >
          {task.completed && (
            <div className="h-2 w-2 rounded-full bg-white animate-scale-in"></div>
          )}
        </div>
        
        {/* Task details */}
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${task.completed ? 'text-nexus-text-secondary line-through' : 'text-white'}`}>
                {task.title}
              </p>
              <p className="text-xs text-nexus-text-muted mt-0.5">{task.description}</p>
            </div>
            <button className="h-6 w-6 rounded-full bg-white bg-opacity-5 flex items-center justify-center hover:bg-opacity-10 transition-all">
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
            
            {task.labels.map((label, index) => (
              <div key={index} className="px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-10 text-nexus-text-secondary flex items-center hover:bg-opacity-15 transition-all">
                <Tag size={10} className="mr-1" />
                {label}
              </div>
            ))}
            
            {task.commentCount > 0 && (
              <div className="flex items-center">
                <MessageSquare size={12} className="text-nexus-text-muted mr-1" />
                <span className="text-xs text-nexus-text-secondary">{task.commentCount}</span>
              </div>
            )}
          </div>
        </div>
        
        <ChevronRight size={16} className="text-nexus-text-muted ml-2 mt-1" />
      </div>
    </div>
  );
};

export default TaskItem;
