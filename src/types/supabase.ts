
export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  labels: string[];
  created_at: string;
  updated_at: string;
  commentCount?: number;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  productivity_score: number;
  created_at: string;
  updated_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};
