/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './lib/AuthContext';
import { TaskProvider, useTasks } from './lib/TaskContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { AIChatbot } from './components/AIChatbot';
import { TaskModal } from './components/TaskModal';
import { LoginPage } from './components/LoginPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const { selectedTask, setSelectedTask, updateTask, deleteTask } = useTasks();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-white font-sans text-black overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <KanbanBoard />
      </div>
      <AIChatbot />
      
      <TaskModal 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}
