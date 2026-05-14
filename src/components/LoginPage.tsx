import { motion } from 'motion/react';
import { Briefcase, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function LoginPage() {
  const { login, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/10">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Beyond UI</h1>
          <p className="text-gray-500 mb-8 max-w-xs">
            Manage your tasks seamlessly with AI-powered features.
          </p>

          {error && (
            <div className="w-full mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-left">
              <p className="font-semibold mb-1">Sign in failed</p>
              <p className="text-xs">{error}</p>
              <button onClick={clearError} className="underline text-xs mt-2 hover:text-red-800">Clear error</button>
            </div>
          )}

          <button
            onClick={login}
            className="w-full bg-black text-white hover:bg-gray-900 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            Sign In with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
