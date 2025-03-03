
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
import { useAuth } from '../context/AuthContext';
import { Task } from '../types/supabase';
import { fetchTasks, updateTask, createTask, deleteTask } from '../services/taskService';
import { generateTaskInsights, getLatestInsight } from '../services/aiService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface TaskGroup {
  [key: string]: Task[];
}

const TaskPanel: React.FC = () => {
  // Use authentication context
  const { user, profile, signOut } = useAuth();
  
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for active filter
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for new task form visibility
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  
  // State for AI insight
  const [insight, setInsight] = useState<{ content: string, actionText: string, id: string } | null>(null);
  
  // Load tasks from Supabase
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);
  
  // Load AI insights
  useEffect(() => {
    if (user && tasks.length > 0) {
      loadInsights();
    }
  }, [user, tasks]);
  
  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await fetchTasks(user.id);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
  
  const loadInsights = async () => {
    if (!user) return;
    
    try {
      // First try to get an existing recent insight
      const latestInsight = await getLatestInsight(user.id);
      
      if (latestInsight) {
        setInsight({
          content: latestInsight.content,
          actionText: latestInsight.action_text,
          id: latestInsight.id
        });
      } else {
        // If no recent insight exists, generate a new one
        const newInsight = await generateTaskInsights(user.id, tasks);
        if (newInsight) {
          setInsight({
            content: newInsight.content,
            actionText: newInsight.action_text,
            id: newInsight.id
          });
        }
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };
  
  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      const updatedTask = await updateTask(taskId, { completed: !task.completed });
      if (updatedTask) {
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
        toast.success(task.completed ? 'Task marked as pending' : 'Task completed');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
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
  const handleNewTaskSubmit = async (newTask: {
    title: string;
    description: string;
    deadline: string;
    priority: string;
    labels: string[];
  }) => {
    if (!user) return;
    
    try {
      const task = {
        user_id: user.id,
        title: newTask.title,
        description: newTask.description,
        deadline: newTask.deadline,
        priority: newTask.priority as 'low' | 'medium' | 'high',
        completed: false,
        labels: newTask.labels,
      };
      
      const createdTask = await createTask(task);
      if (createdTask) {
        setTasks([...tasks, createdTask]);
        setShowNewTaskForm(false);
        toast.success('Task created successfully');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
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
    } else if (command.toLowerCase() === 'sign out' || command.toLowerCase() === 'logout') {
      signOut();
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
          <h1 className="text-2xl font-light mt-1 tracking-tight text-gradient animate-fade-in">
            Hello, {profile?.full_name || user?.email}
          </h1>
          <div className="flex items-center text-sm text-nexus-text-secondary">
            <span>{currentDate}</span>
            <span className="mx-1">•</span>
            <span>{currentTime}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            className="h-9 w-9 p-0 rounded-full glass-morphism hover:bg-white/10"
            onClick={() => signOut()}
          >
            <Settings size={18} className="text-nexus-text-secondary" />
          </Button>
          <div className="h-9 w-9 rounded-full glass-morphism overflow-hidden p-0.5 ring-2 ring-white/10 shadow-lg shadow-nexus-accent-purple/10">
            <img 
              src={profile?.avatar_url || `https://avatar.vercel.sh/${user?.id}`} 
              alt={profile?.full_name || 'User'} 
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
        {insight ? (
          <InsightCard 
            insight={insight.content}
            actionText={insight.actionText}
            onAction={() => console.log('Action clicked:', insight.actionText)}
          />
        ) : loading ? (
          <div className="glass-card p-4 animate-pulse-soft backdrop-blur-xl shadow-xl shadow-nexus-accent-purple/5 border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-white/10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-4 backdrop-blur-xl shadow-xl shadow-nexus-accent-purple/5 border border-white/10">
            <p className="text-sm text-nexus-text-secondary">No insights available yet. Complete some tasks to get personalized recommendations.</p>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 backdrop-blur-sm">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card p-3 animate-pulse-soft">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 rounded-full bg-white/10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(orderedGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 h-16 w-16 rounded-full glass-morphism flex items-center justify-center">
              <Plus size={24} className="text-nexus-text-secondary" />
            </div>
            <h3 className="text-lg font-light text-white mb-2">No tasks found</h3>
            <p className="text-sm text-nexus-text-secondary mb-4">Create your first task or adjust your filters</p>
            <Button 
              onClick={() => setShowNewTaskForm(true)}
              className="primary-gradient"
            >
              Create Task
            </Button>
          </div>
        ) : (
          Object.entries(orderedGroups).map(([dateGroup, tasksInGroup], groupIndex) => (
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
          ))
        )}
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
