
import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  Settings,
  Plus, 
  Filter, 
  Search
} from 'lucide-react';
import { formatDate, formatTime, groupOrder, getGroupKey } from '../utils/dateUtils';
import TaskItem from './TaskItem';
import InsightCard from './InsightCard';
import CommandBar from './CommandBar';
import NewTaskForm from './NewTaskForm';

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  priority: string;
  completed: boolean;
  labels: string[];
  commentCount: number;
}

interface TaskGroup {
  [key: string]: Task[];
}

const TaskPanel: React.FC = () => {
  // State for user data
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    avatar: 'https://via.placeholder.com/32/32'
  });
  
  // State for date and time
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  // Update time every minute
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(formatDate(now));
      setCurrentTime(formatTime(now));
    };
    
    updateDateTime();
    const timeInterval = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);
  
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Finalize project proposal',
      description: 'Complete the final draft with budget estimates and timeline',
      deadline: 'Today, 5:00 PM',
      priority: 'high',
      completed: false,
      labels: ['Work', 'Q2 Planning'],
      commentCount: 2
    },
    {
      id: 2,
      title: 'Review candidate applications',
      description: 'Screen resumes for the marketing position',
      deadline: 'Today, 3:00 PM',
      priority: 'medium',
      completed: true,
      labels: ['HR', 'Recruiting'],
      commentCount: 0
    },
    {
      id: 3,
      title: 'Schedule team meeting',
      description: 'Coordinate with team members for weekly sync',
      deadline: 'Tomorrow, 12:00 PM',
      priority: 'medium',
      completed: false,
      labels: ['Team', 'Coordination'],
      commentCount: 1
    },
    {
      id: 4,
      title: 'Update client presentation',
      description: 'Incorporate feedback from initial review',
      deadline: 'Tomorrow, 2:00 PM',
      priority: 'high',
      completed: false,
      labels: ['Client', 'Presentation'],
      commentCount: 3
    },
    {
      id: 5,
      title: 'Gym workout session',
      description: 'Focus on cardio and core exercises',
      deadline: 'Today, 6:30 PM',
      priority: 'low',
      completed: false,
      labels: ['Personal', 'Health'],
      commentCount: 0
    }
  ]);
  
  // State for active filter
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for new task form visibility
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  
  // Toggle task completion
  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Filter tasks based on active filter and search query
  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (activeFilter === 'completed' && !task.completed) return false;
    if (activeFilter === 'pending' && task.completed) return false;
    
    // Apply priority filter
    if (activeFilter === 'high-priority' && task.priority !== 'high') return false;
    
    // Apply search filter if search query exists
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.labels.some(label => label.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const groupKey = getGroupKey(task.deadline);
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(task);
    return groups;
  }, {} as TaskGroup);
  
  // Ensure proper order of groups
  const orderedGroups: TaskGroup = {};
  groupOrder.forEach(key => {
    if (groupedTasks[key]) {
      orderedGroups[key] = groupedTasks[key];
    }
  });
  
  // Handle new task form submission
  const handleNewTaskSubmit = (newTask: {
    title: string;
    description: string;
    deadline: string;
    priority: string;
    labels: string[];
  }) => {
    const task = {
      id: tasks.length + 1,
      ...newTask,
      completed: false,
      commentCount: 0,
    };
    
    setTasks([...tasks, task]);
    setShowNewTaskForm(false);
  };
  
  // Handle command input
  const handleCommand = (command: string) => {
    // Simple command handling - add more sophisticated parsing later
    if (command.toLowerCase().startsWith('add ') || command.toLowerCase().startsWith('new task')) {
      setShowNewTaskForm(true);
    } else if (command.toLowerCase().includes('filter ')) {
      const filterMatch = command.match(/filter (completed|pending|high|all)/i);
      if (filterMatch) {
        const filter = filterMatch[1].toLowerCase();
        if (filter === 'high') {
          setActiveFilter('high-priority');
        } else if (filter === 'all') {
          setActiveFilter('all');
        } else {
          setActiveFilter(filter);
        }
      }
    } else if (command.toLowerCase().startsWith('search ')) {
      const searchTerm = command.substring(7).trim();
      setSearchQuery(searchTerm);
    }
  };
  
  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    highPriority: tasks.filter(task => task.priority === 'high' && !task.completed).length
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-nexus-bg-primary via-nexus-bg-secondary to-[#1a1335] text-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center animate-slide-down backdrop-blur-sm glass-morphism bg-black/20">
        <div>
          <div className="flex items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 mr-2 shadow-lg shadow-nexus-accent-purple/20">
              <Brain size={14} className="text-nexus-accent-purple animate-pulse-soft" />
            </div>
            <span className="text-xs uppercase text-nexus-accent-purple tracking-wider font-light">Nexus</span>
            <span className="ml-1 text-xs text-green-300">• active</span>
          </div>
          <h1 className="text-2xl font-light mt-1 tracking-tight text-gradient animate-fade-in">Hello, {user.name}</h1>
          <div className="flex items-center text-sm text-nexus-text-secondary">
            <span>{currentDate}</span>
            <span className="mx-1">•</span>
            <span>{currentTime}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="h-9 w-9 flex items-center justify-center rounded-full glass-morphism hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20">
            <Settings size={18} className="text-nexus-text-secondary" />
          </button>
          <div className="h-9 w-9 rounded-full glass-morphism overflow-hidden p-0.5 ring-2 ring-white/10 shadow-lg shadow-nexus-accent-purple/10">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="rounded-full h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Task Stats and Actions Bar */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 animate-slide-down backdrop-blur-sm bg-black/10" style={{ animationDelay: '50ms' }}>
        <div className="flex space-x-6">
          <div className="text-center">
            <p className="text-2xl font-light text-white">{taskStats.total}</p>
            <p className="text-xs text-nexus-text-secondary">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light text-green-400">{taskStats.completed}</p>
            <p className="text-xs text-nexus-text-secondary">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light text-nexus-accent-purple">{taskStats.pending}</p>
            <p className="text-xs text-nexus-text-secondary">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light text-nexus-accent-pink">{taskStats.highPriority}</p>
            <p className="text-xs text-nexus-text-secondary">High Priority</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="h-9 w-9 flex items-center justify-center rounded-full glass-morphism hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20"
            onClick={() => setShowNewTaskForm(true)}
          >
            <Plus size={18} className="text-nexus-text-secondary" />
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-full glass-morphism hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20">
            <Filter size={18} className="text-nexus-text-secondary" />
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-6 py-3 flex flex-wrap gap-2 border-b border-white/5 animate-slide-down backdrop-blur-sm bg-black/5" style={{ animationDelay: '100ms' }}>
        <button 
          className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${activeFilter === 'all' ? 'glass-morphism bg-white/10 text-white shadow-lg shadow-nexus-accent-purple/10' : 'text-nexus-text-secondary hover:bg-white/5'}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${activeFilter === 'pending' ? 'glass-morphism bg-white/10 text-white shadow-lg shadow-nexus-accent-purple/10' : 'text-nexus-text-secondary hover:bg-white/5'}`}
          onClick={() => setActiveFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${activeFilter === 'completed' ? 'glass-morphism bg-white/10 text-white shadow-lg shadow-nexus-accent-purple/10' : 'text-nexus-text-secondary hover:bg-white/5'}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </button>
        <button 
          className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${activeFilter === 'high-priority' ? 'glass-morphism bg-white/10 text-white shadow-lg shadow-nexus-accent-purple/10' : 'text-nexus-text-secondary hover:bg-white/5'}`}
          onClick={() => setActiveFilter('high-priority')}
        >
          High Priority
        </button>
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <input
              type="text"
              className="glass-morphism rounded-full text-sm text-white px-3 py-1.5 pl-9 focus:outline-none focus:bg-white/10 transition-all duration-300 w-full md:w-auto shadow-lg shadow-black/10"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nexus-text-secondary" />
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="px-6 py-4 animate-slide-down" style={{ animationDelay: '150ms' }}>
        <InsightCard 
          insight="You have <span class='text-nexus-accent-pink font-medium'>2 high-priority tasks</span> due today. Based on your productivity patterns, scheduling them between 9-11 AM would optimize your completion rate."
          actionText="Optimize Schedule"
          onAction={() => console.log('Optimizing schedule...')}
        />
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 backdrop-blur-sm">
        {Object.entries(orderedGroups).map(([dateGroup, tasksInGroup], groupIndex) => (
          <div key={dateGroup} className="animate-slide-up" style={{ animationDelay: `${200 + groupIndex * 50}ms` }}>
            <div className="flex items-center mb-3">
              <h3 className="text-sm font-medium text-white">
                {dateGroup}
              </h3>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs glass-morphism text-nexus-text-secondary">
                {tasksInGroup.length}
              </span>
              {dateGroup === 'Overdue' && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-300">
                  Attention needed
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              {tasksInGroup.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  dateGroup={dateGroup}
                  onToggleCompletion={toggleTaskCompletion} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Command Bar */}
      <div className="px-6 py-4 border-t border-white/5 animate-slide-up glass-morphism bg-black/30 backdrop-blur-md">
        <CommandBar onCommand={handleCommand} />
      </div>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <NewTaskForm 
          onSubmit={handleNewTaskSubmit}
          onCancel={() => setShowNewTaskForm(false)}
        />
      )}
    </div>
  );
};

export default TaskPanel;
