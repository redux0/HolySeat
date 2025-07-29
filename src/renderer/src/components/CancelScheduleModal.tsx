import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useThemeVariables } from '../hooks/useTheme';

interface CancelScheduleModalProps {
  isOpen: boolean;
  contextName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CancelScheduleModal: React.FC<CancelScheduleModalProps> = ({
  isOpen,
  contextName,
  onConfirm,
  onCancel
}) => {
  const themeVars = useThemeVariables();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        style={{
          backgroundColor: themeVars.backgroundSecondary,
          color: themeVars.textPrimary
        }}
      >
        {/* 标题区域 */}
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#EF4444' }}
          >
            <AlertTriangle size={24} color="white" />
          </div>
          <h2 
            className="text-xl font-bold mb-2"
            style={{ color: themeVars.textPrimary }}
          >
            取消预约
          </h2>
          <p 
            className="text-sm leading-relaxed"
            style={{ color: themeVars.textSecondary }}
          >
            确定要取消对 <span className="font-semibold" style={{ color: themeVars.textPrimary }}>"{contextName}"</span> 的预约吗？
          </p>
          <div 
            className="mt-3 p-3 rounded-lg text-sm"
            style={{ 
              backgroundColor: `${themeVars.textSecondary}10`,
              color: themeVars.textSecondary 
            }}
          >
            ⚠️ <strong>注意：</strong>取消预约可能会中断您当前的专注链，影响连续性记录。
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: themeVars.backgroundPrimary,
              color: themeVars.textSecondary,
              border: `1px solid ${themeVars.borderPrimary}`
            }}
          >
            继续预约
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors hover:bg-red-600"
            style={{ backgroundColor: '#EF4444' }}
          >
            确认取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelScheduleModal;
