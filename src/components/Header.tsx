import { 
  Columns, 
  MoreHorizontal,
  Plus,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTasks } from '../lib/TaskContext';

const tabs = [
  { icon: Columns, label: 'Board', active: true },
];

export function Header() {
  const { searchTerm, setSearchTerm, addTask } = useTasks();

  return (
    <div className="px-8 pt-8 pb-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Workspace</h1>
        </div>
        
        <div className="relative group flex-1 max-w-md mx-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks, categories..."
            className="w-full bg-[#f1f3f5] border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex bg-[#f1f3f5] p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                tab.active 
                  ? "bg-white text-black shadow-sm" 
                  : "text-gray-500 hover:text-black"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => addTask({ status: 'todo' })}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 active:scale-95"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
