import { toast as sonnerToast, Toaster } from 'sonner'
import { useThemeVariables } from '../../hooks/useTheme'
import React from 'react'

// 主题化的Toast提供者组件
export const ThemedToaster: React.FC = () => {
  const themeVars = useThemeVariables()
  
  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      theme="system"
      toastOptions={{
        style: {
          backgroundColor: themeVars.backgroundSecondary,
          borderColor: themeVars.borderPrimary,
          color: themeVars.textPrimary,
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        classNames: {
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info'
        }
      }}
    />
  )
}

// 主题化的toast方法
export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    return sonnerToast.success(message, {
      ...options,
      style: {
        backgroundColor: '#10B981',
        color: 'white',
        borderColor: '#059669',
        ...options?.style
      }
    })
  },
  
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    return sonnerToast.error(message, {
      ...options,
      style: {
        backgroundColor: '#EF4444',
        color: 'white',
        borderColor: '#DC2626',
        ...options?.style
      }
    })
  },
  
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    return sonnerToast.warning(message, {
      ...options,
      style: {
        backgroundColor: '#F59E0B',
        color: 'white',
        borderColor: '#D97706',
        ...options?.style
      }
    })
  },
  
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    return sonnerToast.info(message, {
      ...options,
      style: {
        backgroundColor: '#3B82F6',
        color: 'white',
        borderColor: '#2563EB',
        ...options?.style
      }
    })
  },
  
  // 默认toast
  message: (message: string, options?: Parameters<typeof sonnerToast>[1]) => {
    return sonnerToast(message, options)
  }
}
