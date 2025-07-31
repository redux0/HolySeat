import React, { useState, useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Bell, X, Clock } from 'lucide-react';
import { useThemeVariables } from '../hooks/useTheme';
import { scheduleModalAtom, scheduleStateAtom, contextsWithChainsAtom } from '../features/ctdp/atoms';
import { useCTDPActions } from '../features/ctdp/hooks';
import type { SacredContextRules, ContextAuxiliaryInfo } from '../../../types/ctdp';

interface ScheduleModalProps {
  contextId: string;
  contextName: string;
  onConfirm: (delayMinutes: number, taskTitle: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  contextId, 
  contextName, 
  onConfirm 
}) => {
  const themeVars = useThemeVariables();
  const [isOpen, setIsOpen] = useAtom(scheduleModalAtom);
  const contexts = useAtomValue(contextsWithChainsAtom);
  const { getContextAuxiliaryInfo } = useCTDPActions();
  
  // 从context规则中读取默认值作为后备
  const currentContext = contexts?.find(ctx => ctx.id === contextId);
  const rules = currentContext?.rules as SacredContextRules;
  
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [taskTitle, setTaskTitle] = useState('');
  const [triggerAction, setTriggerAction] = useState('打响指');
  const [loading, setLoading] = useState(false);

  // 当modal打开时加载辅助链信息
  useEffect(() => {
    if (isOpen && contextId) {
      setLoading(true);
      getContextAuxiliaryInfo(contextId)
        .then((info: ContextAuxiliaryInfo | null) => {
          if (info) {
            setDelayMinutes(info.delayMinutes);
            setTaskTitle(info.description);
            setTriggerAction(info.triggerAction);
          } else {
            // 使用context规则作为后备
            setDelayMinutes(rules?.presetTime || 15);
            setTaskTitle('');
            setTriggerAction(rules?.triggerAction || '打响指');
          }
        })
        .catch((error) => {
          console.error('加载辅助链信息失败:', error);
          // 使用context规则作为后备
          setDelayMinutes(rules?.presetTime || 15);
          setTaskTitle('');
          setTriggerAction(rules?.triggerAction || '打响指');
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // 移除 rules 依赖，避免无限循环
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contextId]);

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onConfirm(delayMinutes, taskTitle);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        style={{
          backgroundColor: themeVars.backgroundSecondary,
          color: themeVars.textPrimary
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题区域 */}
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <Bell size={24} color="white" />
          </div>
          <h2 
            className="text-xl font-bold mb-2"
            style={{ color: themeVars.textPrimary }}
          >
            预约启动: {contextName}
          </h2>
          <p 
            className="text-sm"
            style={{ color: themeVars.textSecondary }}
          >
            请做出预约动作 "{triggerAction}"，系统确认后将在{delayMinutes}分钟后自动启动。
          </p>
        </div>

        {/* 任务标题输入 */}
        <div className="mb-4">
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: themeVars.textPrimary }}
          >
            任务标题
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: themeVars.backgroundPrimary,
              borderColor: themeVars.borderPrimary,
              color: themeVars.textPrimary,
              opacity: loading ? 0.6 : 1
            }}
            placeholder="输入任务标题（可选）"
          />
        </div>

        {/* 延迟时间选择 */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: themeVars.textPrimary }}
          >
            延迟时间
          </label>
          <div className="flex gap-2 flex-wrap">
            {[1, 3, 5, 10, 15, 30, 45, 60, 90].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setDelayMinutes(minutes)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  delayMinutes === minutes ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  backgroundColor: delayMinutes === minutes 
                    ? '#3B82F6' 
                    : themeVars.backgroundPrimary,
                  color: delayMinutes === minutes 
                    ? 'white' 
                    : themeVars.textPrimary,
                  borderColor: themeVars.borderPrimary,
                  border: '1px solid',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {minutes}分钟
              </button>
            ))}
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: themeVars.backgroundPrimary,
              color: themeVars.textSecondary,
              borderColor: themeVars.borderPrimary,
              opacity: loading ? 0.6 : 1
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors"
            style={{ 
              backgroundColor: '#3B82F6',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '加载中...' : '确认预约'}
          </button>
        </div>

        {/* 提示信息 */}
        <p 
          className="text-xs text-center mt-4"
          style={{ color: themeVars.textSecondary }}
        >
          预约启动后将进入倒计时，不可取消。
        </p>
      </div>
    </div>
  );
};

export default ScheduleModal;
