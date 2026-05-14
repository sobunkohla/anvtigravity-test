import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Flag, User, Trash2, Save } from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskModal({ task, isOpen, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setCategory(task.category || '');
      setDueDate(task.dueDate || '');
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    await onUpdate(task.id, {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
    });
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Tag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
                  <p className="text-xs text-gray-400">Created on {task.createdAt && format(new Date(task.createdAt), 'PPPP')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex-1 overflow-y-auto space-y-8 no-scrollbar">
              {/* Title & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Task Title</label>
                  <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-lg font-semibold border-none bg-gray-50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-black transition-all"
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full font-medium border-none bg-gray-50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-black transition-all capitalize"
                  >
                    <option value="todo">To-do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[120px] text-sm border-none bg-gray-50 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-black transition-all resize-none"
                  placeholder="What needs to be done?"
                />
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Flag size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Priority</label>
                  </div>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className={cn(
                      "w-full text-xs font-bold border-none rounded-xl py-2.5 px-3 uppercase tracking-tighter focus:ring-2 focus:ring-black transition-all",
                      priority === 'high' ? "bg-red-50 text-red-600" :
                      priority === 'medium' ? "bg-amber-50 text-amber-600" :
                      "bg-green-50 text-green-600"
                    )}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Tag size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Category</label>
                  </div>
                  <input 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-bold border-none bg-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-black transition-all"
                    placeholder="e.g. Design"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Due Date</label>
                  </div>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs font-bold border-none bg-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              {/* Assignee Footer */}
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-full">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned to</p>
                    <p className="text-sm font-semibold">{task.assigneeName || 'Unassigned'}</p>
                  </div>
                </div>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-800 active:scale-95 transition-all"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
