
import { supabase } from '../lib/supabase';
import { Task } from '../types/supabase';

interface AIInsight {
  id: string;
  user_id: string;
  content: string;
  action_text: string;
  confidence: number;
  source: string;
  created_at: string;
  is_read: boolean;
}

// Mock AI insights function (to be replaced with real AI later)
export const generateTaskInsights = async (userId: string, tasks: Task[]): Promise<AIInsight | null> => {
  // Skip if there are no tasks
  if (tasks.length === 0) return null;
  
  try {
    // Count high priority tasks due today
    const highPriorityToday = tasks.filter(
      task => task.priority === 'high' && 
      task.deadline.includes('Today') && 
      !task.completed
    ).length;
    
    // Calculate completion rate
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    
    // Generate mock insight based on task data
    let content = '';
    let actionText = '';
    
    if (highPriorityToday > 0) {
      content = `You have <span class='text-nexus-accent-pink font-medium'>${highPriorityToday} high-priority tasks</span> due today. Based on your productivity patterns, scheduling them between 9-11 AM would optimize your completion rate.`;
      actionText = 'Optimize Schedule';
    } else if (completionRate < 30) {
      content = `Your task completion rate is <span class='text-nexus-accent-pink font-medium'>${completionRate.toFixed(0)}%</span>, which is lower than your usual average. Breaking tasks into smaller steps might help improve productivity.`;
      actionText = 'Break Down Tasks';
    } else {
      content = `You're making good progress with a <span class='text-nexus-accent-green font-medium'>${completionRate.toFixed(0)}%</span> completion rate. Consider planning tomorrow's priorities to maintain momentum.`;
      actionText = 'Plan Tomorrow';
    }
    
    // Save the insight to the database
    const { data, error } = await supabase
      .from('ai_insights')
      .insert([{
        user_id: userId,
        content,
        action_text: actionText,
        confidence: 0.85,
        source: 'task_analysis',
        is_read: false
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return null;
  }
};

export const getLatestInsight = async (userId: string): Promise<AIInsight | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return null;
  }
};

export const markInsightAsRead = async (insightId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', insightId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking insight as read:', error);
    return false;
  }
};
