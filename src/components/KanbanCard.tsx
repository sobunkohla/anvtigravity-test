import { Calendar, Clock, MessageSquare, History, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useTasks } from '../lib/TaskContext';

interface KanbanCardProps {
  task: Task;
  onDelete?: () => void;
}

export function KanbanCard({ task, onDelete }: KanbanCardProps) {
  const { setSelectedTask } = useTasks();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-green-500 bg-green-50 border-green-100';
      default: return 'text-gray-400 bg-gray-50 border-gray-100';
    }
  };

  return (
    <motion.div
      layoutId={task.id}
      draggable
      onDragStart={handleDragStart}
      onClick={() => setSelectedTask(task)}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer active:cursor-grabbing hover:shadow-md transition-shadow group relative overflow-hidden"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
          getPriorityColor(task.priority)
        )}>
          {task.category || 'General'}
        </span>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
          {task.assigneeAvatar && (
            <img 
              src={task.assigneeAvatar} 
              alt={task.assigneeName} 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            />
          )}
        </div>
      </div>

      <h4 className="font-semibold text-gray-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
        {task.title}
      </h4>

      <div className="flex flex-wrap items-center gap-4">
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={14} />
            <span className="text-[11px] font-medium">
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          </div>
        )}
        {task.timeSpent && (
          <div className="flex items-center gap-1.5 text-blue-400">
            <Clock size={14} />
            <span className="text-[11px] font-semibold">{task.timeSpent}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
