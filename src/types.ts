export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category?: string;
  priority?: Priority;
  dueDate?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  timeSpent?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  lastMessage?: string;
  updatedAt: string;
}
