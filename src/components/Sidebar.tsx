import { 
  Briefcase, 
  ChevronDown,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';

const navItems = [
  { icon: Briefcase, label: 'Workspace', active: true },
];

export function Sidebar() {
  const { user, logout, error, clearError } = useAuth();

  return (
    <div className="w-64 h-full bg-[#f8f9fa] border-r border-gray-200 flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="bg-black text-white p-1 rounded">
          <Briefcase size={20} />
        </div>
        <span className="font-semibold text-lg">Beyond UI</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              item.active 
                ? "bg-white text-black shadow-sm" 
                : "text-gray-500 hover:bg-gray-100 hover:text-black"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 p-3 rounded-xl text-[10px] text-red-600 relative"
          >
            <button 
              onClick={clearError}
              className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded"
            >
              <X size={10} />
            </button>
            <p className="font-semibold mb-1 uppercase tracking-wider">Auth Error</p>
            <p>{error}</p>
          </motion.div>
        )}

        <div className="flex items-center gap-3 px-2 pt-4 border-t border-gray-200">
          {user && (
            <>
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                className="w-8 h-8 rounded-full bg-gray-200"
                alt="Avatar"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-black">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
