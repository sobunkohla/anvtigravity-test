import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { Task, TaskStatus } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  addTask: (payload?: Partial<Task> & { status?: TaskStatus }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const path = 'tasks';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      }) as Task[];
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async (payload: Partial<Task> & { status?: TaskStatus } = { status: 'todo' }) => {
    if (!user) return;
    const path = 'tasks';
    try {
      const docRef = await addDoc(collection(db, path), {
        title: payload.title || 'New Task',
        description: payload.description || '',
        status: payload.status || 'todo',
        createdAt: serverTimestamp(),
        priority: payload.priority || 'medium',
        category: payload.category || 'General',
        assigneeName: user.displayName,
        assigneeAvatar: user.photoURL,
        updatedAt: serverTimestamp(),
        dueDate: payload.dueDate || '',
      });
      // Optionally select the new task immediately
      const newTask = {
        id: docRef.id,
        title: payload.title || 'New Task',
        description: payload.description || '',
        status: payload.status || 'todo',
        createdAt: new Date().toISOString(),
        priority: payload.priority || 'medium',
        category: payload.category || 'General',
        assigneeName: user.displayName || undefined,
        assigneeAvatar: user.photoURL || undefined,
        dueDate: payload.dueDate || '',
      };
      setSelectedTask(newTask as Task);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const path = `tasks/${taskId}`;
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteTask = async (taskId: string) => {
    const path = `tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      filteredTasks, 
      searchTerm, 
      setSearchTerm, 
      selectedTask, 
      setSelectedTask,
      addTask,
      updateTask,
      deleteTask,
      loading
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
