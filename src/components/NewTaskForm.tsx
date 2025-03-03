
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 animate-scale-in shadow-2xl shadow-black/40 border border-white/10 rounded-2xl">
        <h3 className="text-xl font-light text-gradient mb-6">New Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="title"
              placeholder="Task title"
              className="w-full glass-morphism rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-nexus-accent-purple/50 transition-all duration-300"
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
              className="w-full glass-morphism rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-nexus-accent-purple/50 transition-all duration-300 resize-none"
              value={task.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          
          <div>
            <select
              name="deadline"
              className="w-full glass-morphism rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-nexus-accent-purple/50 transition-all duration-300 bg-transparent appearance-none"
              value={task.deadline}
              onChange={handleInputChange}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1rem" }}
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
                className={`flex-1 py-2 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                  task.priority === 'low' 
                  ? 'bg-nexus-accent-blue bg-opacity-20 border-nexus-accent-blue shadow-lg shadow-nexus-accent-blue/20' 
                  : 'glass-morphism hover:bg-white/10'
                }`}
              >
                <span className={task.priority === 'low' ? 'text-blue-300' : 'text-white'}>Low</span>
              </button>
              <button 
                type="button"
                onClick={() => setPriority('medium')}
                className={`flex-1 py-2 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                  task.priority === 'medium' 
                  ? 'bg-nexus-accent-purple bg-opacity-20 border-nexus-accent-purple shadow-lg shadow-nexus-accent-purple/20' 
                  : 'glass-morphism hover:bg-white/10'
                }`}
              >
                <span className={task.priority === 'medium' ? 'text-purple-300' : 'text-white'}>Medium</span>
              </button>
              <button 
                type="button"
                onClick={() => setPriority('high')}
                className={`flex-1 py-2 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                  task.priority === 'high' 
                  ? 'bg-nexus-accent-pink bg-opacity-20 border-nexus-accent-pink shadow-lg shadow-nexus-accent-pink/20' 
                  : 'glass-morphism hover:bg-white/10'
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
              className="px-4 py-2 rounded-xl glass-morphism text-white text-sm hover:bg-white/10 transition-all duration-300"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-xl primary-gradient text-white text-sm hover:opacity-90 transition-all duration-300 shadow-lg shadow-nexus-accent-purple/20"
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
