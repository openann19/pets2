import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import React, { createContext, useCallback, useContext, useState } from 'react';
const ToastContext = createContext(null);
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
export const ToastProvider = React.forwardRef(({ children }, _ref) => {
    const [toasts, setToasts] = useState([]);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    const showToast = useCallback((toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
        // Auto-remove after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);
    const success = useCallback((title, message) => {
        showToast({ type: 'success', title, ...(message && { message }) });
    }, [showToast]);
    const error = useCallback((title, message) => {
        showToast({ type: 'error', title, duration: 7000, ...(message && { message }) });
    }, [showToast]);
    const warning = useCallback((title, message) => {
        showToast({ type: 'warning', title, ...(message && { message }) });
    }, [showToast]);
    const info = useCallback((title, message) => {
        showToast({ type: 'info', title, ...(message && { message }) });
    }, [showToast]);
    return (<ToastContext.Provider value={{ showToast, success, error, warning, info }}>
        {children}
        <ToastContainer toasts={toasts} onRemove={removeToast}/>
      </ToastContext.Provider>);
});
const ToastContainer = ({ toasts, onRemove }) => {
    return (<div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (<ToastItem key={toast.id} toast={toast} onRemove={onRemove}/>))}
      </AnimatePresence>
    </div>);
};
const ToastItem = ({ toast, onRemove }) => {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-green-500"/>,
        error: <XCircle className="h-5 w-5 text-red-500"/>,
        warning: <AlertCircle className="h-5 w-5 text-yellow-500"/>,
        info: <Info className="h-5 w-5 text-blue-500"/>,
    };
    const colors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    };
    return (<motion.div initial={{ opacity: 0, x: 100, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.8 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`${colors[toast.type]} border-2 rounded-xl shadow-lg p-4 min-w-[320px] max-w-md pointer-events-auto`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
          {toast.message && (<p className="text-sm text-gray-600 mt-1">{toast.message}</p>)}
        </div>
        <motion.button aria-label="Close toast" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onRemove(toast.id)} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-4 w-4"/>
        </motion.button>
      </div>
    </motion.div>);
};
//# sourceMappingURL=toast.jsx.map
//# sourceMappingURL=toast.jsx.map