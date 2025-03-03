import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, 
  Clock, 
  Settings,
  Plus, 
  Filter, 
  Search,
  LogOut,
  Command,
  Sparkles,
  Bot
} from 'lucide-react';
import { formatDate, formatTime, groupOrder, getGroupKey } from '../utils/dateUtils';
import TaskItem from './TaskItem';
import InsightCard from './InsightCard';
import CommandBar from './CommandBar';
import NewTaskForm from './NewTaskForm';
import AIAssistant from './AIAssistant';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types/supabase';
import { fetchTasks, updateTask, createTask, deleteTask } from '../services/taskService';
import { generateTaskInsights, getLatestInsight } from '../services/aiService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskGroup {
  [key: string]: Task[];
}

const TaskPanel: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
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
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  
  const [insight, setInsight] = useState<{ content: string, actionText: string, id: string } | null>(null);
  
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuery, setAIQuery] = useState<string | null>(null);
  
  const [isAnalyzingTasks, setIsAnalyzingTasks] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);
  
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
      const latestInsight = await getLatestInsight(user.id);
      
      if (latestInsight) {
        setInsight({
          content: latestInsight.content,
          actionText: latestInsight.action_text,
          id: latestInsight.id
        });
      } else {
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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeFilter === 'completed' && !task.completed) return false;
      if (activeFilter === 'pending' && task.completed) return false;
      
      if (activeFilter === 'high-priority' && task.priority !== 'high') return false;
      
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
  }, [tasks, activeFilter, searchQuery]);
  
  const orderedGroups = useMemo(() => {
    const groupedTasks = filteredTasks.reduce((groups, task) => {
      const groupKey = getGroupKey(task.deadline);
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(task);
      return groups;
    }, {} as TaskGroup);
    
    const ordered: TaskGroup = {};
    groupOrder.forEach(key => {
      if (groupedTasks[key]) {
        ordered[key] = groupedTasks[key];
      }
    });
    
    return ordered;
  }, [filteredTasks]);
  
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
  
  const handleCommand = (command: string) => {
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
    } else if (command.toLowerCase().startsWith('ask ai:') || command.toLowerCase().startsWith('ai ')) {
      const query = command.toLowerCase().startsWith('ask ai:') 
        ? command.substring(7).trim() 
        : command.substring(3).trim();
      
      if (query) {
        setAIQuery(query);
        setShowAIAssistant(true);
      }
    }
  };
  
  const handleAIQuery = (query: string) => {
    setAIQuery(query);
    setShowAIAssistant(true);
    toast.success('Processing your question...', {
      description: query,
      duration: 3000,
    });
  };
  
  const handleAnalyzeTasks = async () => {
    if (!user || tasks.length === 0) {
      toast.error('No tasks to analyze', {
        description: 'Add some tasks first before requesting an analysis'
      });
      return;
    }
    
    setIsAnalyzingTasks(true);
    
    try {
      const result = await analyzeTasksWithAI(user.id, tasks);
      
      if (result.success) {
        toast.success('Task analysis complete', {
          description: 'New insights have been generated based on your tasks'
        });
        
        if (result.insight) {
          setInsight({
            content: result.insight.content,
            actionText: result.insight.action_text,
            id: result.insight.id
          });
        }
        
        setAnalysisResult(result.fullAnalysis || null);
        
        loadInsights();
      } else {
        toast.error('Task analysis failed', {
          description: result.error || 'Please try again later'
        });
      }
    } catch (error) {
      console.error('Error analyzing tasks:', error);
      toast.error('Task analysis failed', {
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsAnalyzingTasks(false);
    }
  };
  
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    highPriority: tasks.filter(task => task.priority === 'high' && !task.completed).length
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-nexus-bg-primary via-nexus-bg-secondary to-[#1a1335] text-white overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 border-b border-white/5 flex justify-between items-center backdrop-blur-sm glass-morphism bg-black/20"
      >
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
            title="Sign Out"
          >
            <LogOut size={18} className="text-nexus-text-secondary" />
          </Button>
          <div className="h-9 w-9 rounded-full glass-morphism overflow-hidden p-0.5 ring-2 ring-white/10 shadow-lg shadow-nexus-accent-purple/10">
            <img 
              src={profile?.avatar_url || `https://avatar.vercel.sh/${user?.id}`} 
              alt={profile?.full_name || 'User'} 
              className="rounded-full h-full w-full object-cover"
            />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 py-4 flex justify-between items-center border-b border-white/5 backdrop-blur-sm bg-black/10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full">
          <div className="text-center glass-card py-2 hover:bg-white/10 transition-all duration-300 cursor-default">
            <p className="text-xl md:text-2xl font-light text-white">{taskStats.total}</p>
            <p className="text-xs text-nexus-text-secondary">Total</p>
          </div>
          <div className="text-center glass-card py-2 hover:bg-white/10 transition-all duration-300 cursor-default">
            <p className="text-xl md:text-2xl font-light text-green-400">{taskStats.completed}</p>
            <p className="text-xs text-nexus-text-secondary">Completed</p>
          </div>
          <div className="text-center glass-card py-2 hover:bg-white/10 transition-all duration-300 cursor-default">
            <p className="text-xl md:text-2xl font-light text-nexus-accent-purple">{taskStats.pending}</p>
            <p className="text-xs text-nexus-text-secondary">Pending</p>
          </div>
          <div className="text-center glass-card py-2 hover:bg-white/10 transition-all duration-300 cursor-default">
            <p className="text-xl md:text-2xl font-light text-nexus-accent-pink">{taskStats.highPriority}</p>
            <p className="text-xs text-nexus-text-secondary">High Priority</p>
          </div>
        </div>
        <div className="hidden md:flex space-x-2 ml-4">
          <Button 
            className="h-9 w-9 flex items-center justify-center rounded-full glass-morphism hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20"
            onClick={() => setShowNewTaskForm(true)}
            variant="ghost"
            title="Add New Task"
          >
            <Plus size={18} className="text-nexus-text-secondary" />
          </Button>
          <Button 
            className="h-9 w-9 flex items-center justify-center rounded-full glass-morphism hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20"
            variant="ghost"
            title="Filter Tasks"
          >
            <Filter size={18} className="text-nexus-text-secondary" />
          </Button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-3 flex flex-wrap gap-2 border-b border-white/5 backdrop-blur-sm bg-black/5"
      >
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
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              className="glass-morphism rounded-full text-sm text-white px-3 py-1.5 pl-9 focus:outline-none focus:bg-white/10 transition-all duration-300 w-full"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nexus-text-secondary" />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6 py-4"
      >
        {insight ? (
          <InsightCard 
            insight={insight.content}
            actionText={insight.actionText}
            onAction={() => console.log('Action clicked:', insight.actionText)}
            onAskAI={() => setShowAIAssistant(true)}
            onAnalyzeTasks={handleAnalyzeTasks}
            isAnalyzing={isAnalyzingTasks}
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
            <div className="flex items-start">
              <div className="h-10 w-10 flex-shrink-0 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent-purple/20">
                <Sparkles size={18} className="text-white animate-pulse-soft" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-white text-sm leading-relaxed">Complete tasks to get personalized recommendations and insights based on your productivity patterns.</p>
                <div className="mt-3 flex">
                  <button 
                    onClick={() => setShowNewTaskForm(true)}
                    className="text-xs glass-button hover:bg-white/15 transition-all duration-300 shadow-lg shadow-nexus-accent-purple/10 rounded-lg px-4 py-2 flex items-center"
                  >
                    <span>Create Your First Task</span>
                    <Plus size={14} className="ml-2 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 backdrop-blur-sm scrollbar-none">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <motion.div 
                key={n} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: n * 0.1 }}
                className="glass-card p-3 animate-pulse-soft"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 rounded-full bg-white/10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : Object.keys(orderedGroups).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center pt-10"
          >
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
          </motion.div>
        ) : (
          <AnimatePresence>
            {Object.entries(orderedGroups).map(([dateGroup, tasksInGroup], groupIndex) => (
              <motion.div 
                key={dateGroup}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
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
                  <AnimatePresence>
                    {tasksInGroup.map((task, taskIndex) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: taskIndex * 0.05 }}
                        layout
                      >
                        <TaskItem 
                          task={task} 
                          dateGroup={dateGroup}
                          onToggleCompletion={toggleTaskCompletion} 
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 border-t border-white/5 glass-morphism bg-black/30 backdrop-blur-md"
      >
        <div className="flex items-center space-x-3 mb-3 md:hidden">
          <Button 
            onClick={() => setShowNewTaskForm(true)}
            variant="ghost"
            className="flex-1 py-2 glass-morphism hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20"
          >
            <Plus size={16} className="mr-2" />
            New Task
          </Button>
          <Button 
            variant="ghost"
            className="flex-1 py-2 glass-morphism hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20"
            onClick={() => setShowAIAssistant(true)}
          >
            <Bot size={16} className="mr-2" />
            Ask AI
          </Button>
        </div>
        <CommandBar onCommand={handleCommand} onAIQuery={handleAIQuery} />
      </motion.div>

      <AnimatePresence>
        {showNewTaskForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <NewTaskForm 
                onSubmit={handleNewTaskSubmit}
                onCancel={() => setShowNewTaskForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIAssistant 
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        message={aiQuery || analysisResult}
      />
    </div>
  );
};

export default TaskPanel;
