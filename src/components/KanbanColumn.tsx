import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { KanbanCard } from './KanbanCard';
import { motion } from 'motion/react';

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({ id, label, tasks, onMoveTask, onAddTask, onDeleteTask }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onMoveTask(taskId, id);
  };

  return (
    <div 
      className="flex flex-col w-80 h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700">{label}</h3>
          <span className="text-xs font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onAddTask}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-black"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-8">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onDelete={() => onDeleteTask(task.id)} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3">
              <Plus size={20} />
            </div>
            <p className="text-sm font-medium">No tasks currently</p>
            <button 
              onClick={onAddTask}
              className="mt-2 text-xs font-bold text-blue-500 hover:underline"
            >
              Create Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
