import { useTasks } from '../lib/TaskContext';
import { TaskStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To-do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review Ready' },
  { id: 'completed', label: 'Completed' },
];

export function KanbanBoard() {
  const { filteredTasks, updateTask, addTask, deleteTask } = useTasks();

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="flex-1 overflow-x-auto p-8 pt-4">
      <div className="flex gap-6 min-w-max h-full">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={filteredTasks.filter(t => t.status === col.id)}
            onMoveTask={moveTask}
            onAddTask={() => addTask({ status: col.id })}
            onDeleteTask={deleteTask}
          />
        ))}
      </div>
    </div>
  );
}
