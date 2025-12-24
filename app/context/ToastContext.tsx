// context/ToastContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type ToastType = {
  message: string
  type?: 'success' | 'error' | 'info'
}

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastType | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
            <p className="text-base">
              {toast.message}
            </p>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}