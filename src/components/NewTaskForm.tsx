
import React, { useState } from 'react';

interface NewTaskFormProps {
  onSubmit: (task: {
    title: string;
    description: string;
    deadline: string;
    priority: string;
    labels: string[];
  }) => void;
  onCancel: () => void;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, onCancel }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    labels: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask({
      ...task,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.title.trim() && task.deadline) {
      onSubmit(task);
    }
  };

  const setPriority = (priority: string) => {
    setTask({
      ...task,
      priority
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 animate-scale-in">
        <h3 className="text-xl font-light text-white mb-6">New Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="title"
              placeholder="Task title"
              className="w-full glass-morphism rounded-lg p-3 text-white placeholder-nexus-text-muted focus:outline-none focus:border-nexus-accent-purple"
              value={task.title}
              onChange={handleInputChange}
              autoFocus
            />
          </div>
          
          <div>
            <textarea
              name="description"
              placeholder="Description (optional)"
              rows={2}
              className="w-full glass-morphism rounded-lg p-3 text-white placeholder-nexus-text-muted focus:outline-none focus:border-nexus-accent-purple resize-none"
              value={task.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          
          <div>
            <select
              name="deadline"
              className="w-full glass-morphism rounded-lg p-3 text-white focus:outline-none focus:border-nexus-accent-purple bg-transparent"
              value={task.deadline}
              onChange={handleInputChange}
            >
              <option value="" className="bg-nexus-bg-primary">Select deadline</option>
              <option value="Today, 5:00 PM" className="bg-nexus-bg-primary">Today, 5:00 PM</option>
              <option value="Today, 11:59 PM" className="bg-nexus-bg-primary">Today, EOD</option>
              <option value="Tomorrow, 12:00 PM" className="bg-nexus-bg-primary">Tomorrow, Noon</option>
              <option value="Tomorrow, 5:00 PM" className="bg-nexus-bg-primary">Tomorrow, 5:00 PM</option>
            </select>
          </div>
          
          <div>
            <div className="text-sm text-nexus-text-secondary mb-2">Priority</div>
            <div className="flex space-x-2">
              <button 
                type="button"
                onClick={() => setPriority('low')}
                className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                  task.priority === 'low' 
                  ? 'bg-nexus-accent-blue bg-opacity-20 border-nexus-accent-blue' 
                  : 'glass-morphism'
                }`}
              >
                <span className={task.priority === 'low' ? 'text-blue-300' : 'text-white'}>Low</span>
              </button>
              <button 
                type="button"
                onClick={() => setPriority('medium')}
                className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                  task.priority === 'medium' 
                  ? 'bg-nexus-accent-purple bg-opacity-20 border-nexus-accent-purple' 
                  : 'glass-morphism'
                }`}
              >
                <span className={task.priority === 'medium' ? 'text-purple-300' : 'text-white'}>Medium</span>
              </button>
              <button 
                type="button"
                onClick={() => setPriority('high')}
                className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                  task.priority === 'high' 
                  ? 'bg-nexus-accent-pink bg-opacity-20 border-nexus-accent-pink' 
                  : 'glass-morphism'
                }`}
              >
                <span className={task.priority === 'high' ? 'text-pink-300' : 'text-white'}>High</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg glass-morphism text-white text-sm hover:bg-white/10 transition-all duration-300"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-lg primary-gradient text-white text-sm hover:opacity-90 transition-all duration-300"
              disabled={!task.title.trim() || !task.deadline}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskForm;
