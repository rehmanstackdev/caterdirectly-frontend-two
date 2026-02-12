
import { ReactNode, useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// Updated types to match radix-ui toast expected values
type ToastVariant = "default" | "destructive";
// Changed ToastType to match expected "foreground" | "background"
type ToastType = "foreground" | "background"; 

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: ReactNode;
  variant?: ToastVariant;
}

interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: ReactNode;
  variant?: ToastVariant;
}

// Create a singleton toast manager to maintain state across hooks
class ToastManager {
  private static instance: ToastManager;
  private listeners: Array<(toasts: Toast[]) => void> = [];
  private toasts: Toast[] = [];
  
  private constructor() {}
  
  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }
  
  getToasts(): Toast[] {
    return [...this.toasts];
  }
  
  addToast(toast: Toast): void {
    this.toasts = [...this.toasts, toast];
    this.notifyListeners();
    
    setTimeout(() => {
      this.removeToast(toast.id);
    }, toast.duration || 5000);
  }
  
  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }
  
  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getToasts()));
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Set up subscription to toast manager on mount
  useEffect(() => {
    const toastManager = ToastManager.getInstance();
    const unsubscribe = toastManager.subscribe(setToasts);
    setToasts(toastManager.getToasts());
    
    return unsubscribe;
  }, []);

  const toast = useCallback(
    ({ title, description, type = "foreground", duration = 5000, action, variant = "default" }: ToastOptions) => {
      const toastId = uuidv4();

      const newToast = {
        id: toastId,
        title,
        description,
        type,
        duration,
        action,
        variant,
      };

      const toastManager = ToastManager.getInstance();
      toastManager.addToast(newToast);
      
      return toastId;
    },
    []
  );

  const dismiss = useCallback((toastId: string) => {
    const toastManager = ToastManager.getInstance();
    toastManager.removeToast(toastId);
  }, []);

  return { toasts, toast, dismiss };
}

// Create a singleton-backed toast function that works outside of React components
export const toast = (options: ToastOptions) => {
  const toastManager = ToastManager.getInstance();
  const toastId = uuidv4();
  
  const newToast = {
    id: toastId,
    title: options.title,
    description: options.description,
    type: options.type || "foreground",
    duration: options.duration || 5000,
    action: options.action,
    variant: options.variant || "default",
  };
  
  toastManager.addToast(newToast);
  return toastId;
};
