
import { supabase, handleError } from '../lib/supabase';
import { Task } from '../types/supabase';

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_comments(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(task => ({
      ...task,
      commentCount: task.task_comments?.[0]?.count || 0,
      labels: task.labels || []
    }));
  } catch (error) {
    handleError(error as Error);
    return [];
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error as Error);
    return false;
  }
};

export const getTaskComments = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error as Error);
    return [];
  }
};

export const addTaskComment = async (taskId: string, userId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('task_comments')
      .insert([{ task_id: taskId, user_id: userId, content }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};
