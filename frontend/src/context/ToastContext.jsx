import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-terracotta" size={20} />,
    info: <Info className="text-slate" size={20} />,
  };

  const borders = {
    success: 'border-emerald-500/20',
    error: 'border-terracotta/20',
    info: 'border-slate/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      layout
      className={`pointer-events-auto flex items-start gap-3 p-4 bg-white/90 backdrop-blur-xl shadow-warm-deep rounded-2xl border ${borders[toast.type]} min-w-[300px] max-w-sm`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium text-deep-charcoal leading-relaxed">{toast.message}</p>
      <button 
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 rounded-lg text-slate/40 hover:text-terracotta hover:bg-bone transition active:scale-95"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};
