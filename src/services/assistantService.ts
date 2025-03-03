
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

/**
 * Asks a question to the OpenAI Assistant
 * @param message The user's question or prompt
 * @returns A promise that resolves to the assistant's response
 */
export const askAssistant = async (message: string): Promise<string | null> => {
  try {
    console.log('Asking assistant:', message);
    
    const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
      body: { message }
    });
    
    if (error) {
      console.error('Error invoking assistant function:', error);
      throw new Error(error.message || 'Failed to connect to AI service');
    }
    
    if (data?.error) {
      console.error('Assistant API returned an error:', data.error);
      throw new Error(data.details || data.error);
    }
    
    return data?.response || null;
  } catch (err: any) {
    console.error('Error in askAssistant:', err);
    toast.error('AI Assistant Error', {
      description: err.message || 'Failed to connect to AI service'
    });
    return null;
  }
};

/**
 * Checks if the OpenAI Assistant is properly configured
 * @returns A promise that resolves to a status object
 */
export const checkAssistantStatus = async (): Promise<{ 
  configured: boolean; 
  error?: string;
  details?: string;
  assistantName?: string;
  assistantModel?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-assistant-status', {
      body: {}
    });
    
    if (error) {
      console.error('Error checking assistant status:', error);
      return { 
        configured: false, 
        error: 'Connection error', 
        details: error.message 
      };
    }
    
    if (!data) {
      return { 
        configured: false, 
        error: 'No response data', 
        details: 'Empty response from status check endpoint'
      };
    }
    
    return data;
  } catch (err: any) {
    console.error('Error in checkAssistantStatus:', err);
    return { 
      configured: false, 
      error: 'Exception occurred', 
      details: err.message 
    };
  }
};

/**
 * Analyze tasks with the OpenAI Assistant
 * @param userId The user ID
 * @param tasks Array of tasks to analyze
 * @returns A promise that resolves to the analysis results
 */
export const analyzeTasksWithAssistant = async (userId: string, tasks: any[]): Promise<any> => {
  try {
    console.log('Analyzing tasks with assistant for user:', userId);
    
    const { data, error } = await supabase.functions.invoke('analyze-tasks', {
      body: { userId, tasks }
    });
    
    if (error) {
      console.error('Error invoking analyze-tasks function:', error);
      throw new Error(error.message || 'Failed to analyze tasks');
    }
    
    if (!data?.success) {
      throw new Error(data?.error || 'Analysis failed');
    }
    
    return data;
  } catch (err: any) {
    console.error('Error analyzing tasks with assistant:', err);
    toast.error('Task Analysis Failed', {
      description: err.message || 'Unable to analyze tasks at this time'
    });
    return { success: false, error: err.message };
  }
};
