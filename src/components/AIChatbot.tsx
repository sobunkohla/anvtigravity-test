import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useTasks } from '../lib/TaskContext';

const AI_TOOLS = [{
  functionDeclarations: [
    {
      name: 'createTask',
      description: 'Create a new task on the Kanban board',
      parameters: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          status: { type: 'STRING', description: 'One of: todo, in_progress, review, completed' },
          priority: { type: 'STRING', description: 'One of: low, medium, high' },
          category: { type: 'STRING' }
        },
        required: ['title']
      }
    },
    {
      name: 'updateTask',
      description: 'Update an existing Kanban task by its ID',
      parameters: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING', description: 'The ID of the task to update' },
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          status: { type: 'STRING', description: 'One of: todo, in_progress, review, completed' },
          priority: { type: 'STRING', description: 'One of: low, medium, high' },
          category: { type: 'STRING' }
        },
        required: ['id']
      }
    },
    {
      name: 'deleteTask',
      description: 'Delete a task from the board by its ID',
      parameters: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING', description: 'The ID of the task to delete' }
        },
        required: ['id']
      }
    }
  ]
}];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  // Load chat history from Firebase
  useEffect(() => {
    if (!user || !isOpen) return;

    const path = `chats/${user.uid}/messages`;
    const q = query(
      collection(db, 'chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
        };
      }) as ChatMessage[];
      setMessages(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    const path = `chats/${user.uid}/messages`;
    try {
      // Save user message to Firebase
      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        role: 'user',
        content: userText,
        timestamp: serverTimestamp(),
      });

      // Prepare GenAI context
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are an AI project management assistant for Beyond UI Kanban Board. Help the user manage tasks, provide productivity tips, and answer questions.
      You have tools to create, update, and delete tasks. ALWAYS refer to the current tasks below to find IDs when modifying or deleting them.
      
      Current tasks:
      ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, status: t.status, category: t.category })))}
      
      User is ${user.displayName}.`;

      let contents: any[] = [];
      // Only bringing recent texts to save context space, standard array
      messages.slice(-6).forEach(m => {
        contents.push({ role: m.role, parts: [{ text: m.content }] });
      });
      contents.push({ role: 'user', parts: [{ text: userText }] });

      let currentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          tools: AI_TOOLS,
          temperature: 0.2
        }
      });

      // Function Calling Loop
      while (currentResponse.functionCalls && currentResponse.functionCalls.length > 0) {
        const functionResponses = [];
        
        // Append model's function calls to locally tracked contents
        contents.push({
          role: 'model',
          parts: currentResponse.functionCalls.map(fc => ({ functionCall: fc }))
        });

        for (const call of currentResponse.functionCalls) {
          try {
            let result = {};
            if (call.name === 'createTask') {
              await addTask(call.args as any);
              result = { success: true };
            } else if (call.name === 'updateTask') {
              const { id, ...updates } = call.args as any;
              await updateTask(id, updates);
              result = { success: true };
            } else if (call.name === 'deleteTask') {
              await deleteTask((call.args as any).id);
              result = { success: true };
            }
            
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: result
              }
            });
          } catch (e: any) {
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { error: e.message || String(e) }
              }
            });
          }
        }

        // Append the tool results to contents
        contents.push({
          role: 'user',
          parts: functionResponses
        });

        // Query the model again to get the final text payload
        currentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
            tools: AI_TOOLS,
            temperature: 0.2
          }
        });
      }

      const aiContent = currentResponse.text || "I have completed the tasks.";

      // Save AI response to Firebase
      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        role: 'model',
        content: aiContent,
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">AI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <Bot size={24} className="text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Welcome!</h4>
                  <p className="text-xs text-gray-500">Ask me anything about your project or how to use the board.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div 
                    className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-black text-white rounded-br-none" 
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                    )}
                  >
                    <div className={cn("prose prose-sm max-w-none", msg.role === 'user' && "prose-invert")}>
                      <Markdown>
                        {msg.content}
                      </Markdown>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-400 ml-1">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[10px] font-medium italic">Thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-black transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1.5 p-1.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="relative z-10" />
      </motion.button>
    </div>
  );
}
