import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useThemeVariables, useThemeTransition } from '../hooks/useTheme';
import { useCTDPActions } from '../features/ctdp/hooks';
import { activeSessionAtom, contextsWithChainsAtom } from '../features/ctdp/atoms';
import { 
  Link2, 
  Search, 
  Code, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { toast } from './ui/toast';

interface FocusPageProps {
  onExit: () => void;
}

// 退出确认模态框组件
const ExitConfirmationModal: React.FC<{
  onStay: () => void;
  onBreakChain: () => void;
  onAddRule: () => void;
  chainCount: number;
  existingRules: string[];
  isEditingRules: boolean;
  onToggleEditRules: () => void;
  editableRules: string[];
  onRuleChange: (index: number, value: string) => void;
  onAddNewRule: () => void;
  onRemoveRule: (index: number) => void;
  onSaveRules: () => void;
}> = ({ 
  onStay, 
  onBreakChain, 
  onAddRule, 
  chainCount, 
  existingRules, 
  isEditingRules,
  onToggleEditRules,
  editableRules,
  onRuleChange,
  onAddNewRule,
  onRemoveRule,
  onSaveRules
}) => {
  const themeVars = useThemeVariables();

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      onSaveRules();
    } else if (e.key === 'Escape') {
      onToggleEditRules();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg border rounded-lg shadow-2xl text-white relative"
        style={{
          backgroundColor: `${themeVars.backgroundSecondary}CC`, // 80% opacity
          borderColor: themeVars.borderPrimary
        }}
      >
        <button 
          onClick={onStay} 
          className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={24} className="text-amber-400" />
            <h2 className="text-xl font-bold" style={{ color: themeVars.textPrimary }}>
              中断任务链？
            </h2>
          </div>
          <p 
            className="mt-2 text-sm"
            style={{ color: themeVars.textSecondary }}
          >
            这将中断你当前 <span className="text-amber-400 font-semibold">#{chainCount}</span> 的任务链。根据"下必为例"原则，请选择如何处理本次中断：
          </p>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {/* 选项1: 断裂链 */}
          <button 
            onClick={onBreakChain}
            className="w-full text-left p-4 rounded-md border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <p className="font-semibold text-red-400">判定违规，中断任务链</p>
            <p className="text-xs text-gray-400 mt-1">
              所有记录将被清空，下次将从 #1 重新开始。
            </p>
          </button>

          {/* 选项2: 添加新规则 */}
          <button 
            onClick={onAddRule}
            className="w-full text-left p-4 rounded-md border border-sky-500/50 bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
          >
            <p className="font-semibold text-sky-400">修订规则，下必为例</p>
            <p className="text-xs text-gray-400 mt-1">
              将本次中断行为添加为新的例外规则，未来遇到同类情况必须允许。
            </p>
          </button>
        </div>
        
        <div 
          className="px-6 pb-6 border-t pt-4"
          style={{ borderColor: `${themeVars.borderPrimary}80` }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 
              className="text-sm font-semibold flex items-center space-x-2"
              style={{ color: themeVars.textSecondary }}
            >
              <ShieldCheck size={16} />
              <span>已有的例外规则</span>
            </h3>
            <button
              onClick={onToggleEditRules}
              className="text-xs px-2 py-1 rounded border hover:opacity-75 transition-opacity"
              style={{
                color: themeVars.textSecondary,
                borderColor: themeVars.borderPrimary,
                backgroundColor: `${themeVars.backgroundSecondary}40`
              }}
            >
              {isEditingRules ? '取消编辑' : '编辑规则'}
            </button>
          </div>
          
          {isEditingRules ? (
            <div className="space-y-2">
              {editableRules.map((rule, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => onRuleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="flex-1 text-xs px-2 py-1 border rounded bg-transparent outline-none"
                    style={{
                      color: themeVars.textPrimary,
                      borderColor: themeVars.borderPrimary,
                      backgroundColor: `${themeVars.backgroundSecondary}40`
                    }}
                  />
                  <button
                    onClick={() => onRemoveRule(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <button
                  onClick={onAddNewRule}
                  className="text-xs px-2 py-1 border rounded hover:opacity-75 transition-opacity"
                  style={{
                    color: themeVars.accentPrimary,
                    borderColor: themeVars.accentPrimary,
                    backgroundColor: `${themeVars.accentPrimary}10`
                  }}
                >
                  + 添加新规则
                </button>
                <button
                  onClick={onSaveRules}
                  className="text-xs px-2 py-1 border rounded hover:opacity-75 transition-opacity"
                  style={{
                    color: '#10B981',
                    borderColor: '#10B981',
                    backgroundColor: '#10B98110'
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <ul className="list-disc list-inside text-xs mt-2 space-y-1" style={{ color: themeVars.textSecondary }}>
              {existingRules.length > 0 ? (
                existingRules.map((rule, index) => <li key={index}>{rule}</li>)
              ) : (
                <li>暂无例外规则</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// 命令面板组件
const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const themeVars = useThemeVariables();

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-center pt-24" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg h-fit border rounded-lg shadow-2xl" 
        style={{
          backgroundColor: `${themeVars.backgroundSecondary}CC`,
          borderColor: themeVars.borderPrimary
        }}
        onClick={e => e.stopPropagation()}
      >
        <div 
          className="flex items-center p-3 border-b"
          style={{ borderColor: themeVars.borderPrimary }}
        >
          <Search size={18} className="text-gray-500 mr-3" />
          <input 
            type="text" 
            placeholder="启动应用或执行命令..." 
            autoFocus 
            className="w-full bg-transparent outline-none placeholder-gray-500"
            style={{ 
              color: themeVars.textPrimary
            }}
          />
        </div>
        <ul className="p-2">
          <li className="flex items-center space-x-3 p-3 rounded-md hover:bg-indigo-600/50 cursor-pointer">
            <Code size={18} />
            <span>启动 Visual Studio Code</span>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-md hover:bg-indigo-600/50 cursor-pointer">
            <FileText size={18} />
            <span>打开 "Research Paper.pdf"</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// 主专注页面组件
const FocusPage: React.FC<FocusPageProps> = ({ onExit }) => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();
  const { completeSession, breakSession, updateTaskTitle, updateExceptionRules } = useCTDPActions();
  const activeSession = useAtomValue(activeSessionAtom);
  const contexts = useAtomValue(contextsWithChainsAtom);
  
  // 如果没有活跃会话，不渲染专注页面
  if (!activeSession) {
    onExit();
    return null;
  }

  // 计算倒计时 - 基于真实的预期结束时间
  const calculateTimeLeft = () => {
    if (!activeSession.expectedEndTime) {
      // 如果没有预期结束时间，默认60分钟
      return 60 * 60;
    }
    
    const now = new Date();
    const endTime = new Date(activeSession.expectedEndTime);
    const diffSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    return diffSeconds;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [taskTitle, setTaskTitle] = useState(activeSession.taskTitle || '请输入本次任务项');
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editableRules, setEditableRules] = useState<string[]>([]);
  
  // 计算总时长和进度 - 基于真实的会话时间
  const totalDuration = activeSession.expectedEndTime 
    ? Math.floor((new Date(activeSession.expectedEndTime).getTime() - new Date(activeSession.startTime).getTime()) / 1000)
    : 60 * 60; // 默认60分钟
  const progressPercentage = Math.max(0, (timeLeft / totalDuration) * 100);

  // 倒计时逻辑
  useEffect(() => {
    if (timeLeft <= 0) {
      // 时间到了，自动完成任务
      handleCompleteTask();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // 处理完成任务
  const handleCompleteTask = async () => {
    try {
      const duration = totalDuration - timeLeft;
      await completeSession({
        chainId: activeSession.chainId,
        duration,
        title: taskTitle !== '请输入本次任务项' ? taskTitle : undefined,
        tags: activeSession.tags || []
      });
      
      toast.success(`专注完成！链长度增加至 #${(activeSession.chainCounter || 0) + 1}`);
      onExit();
    } catch (error) {
      console.error('完成任务失败:', error);
      toast.error('完成任务失败，请重试');
    }
  };

  // 处理断裂任务链
  const handleBreakChain = async () => {
    try {
      await breakSession({
        chainId: activeSession.chainId,
        reason: '用户主动中断任务'
      });
      
      toast.error('任务链已中断，所有记录已清空');
      setIsExitModalOpen(false);
      onExit();
    } catch (error) {
      console.error('断裂链失败:', error);
      toast.error('操作失败，请重试');
    }
  };

  // 处理添加新规则（暂时用toast提示）
  const handleAddRule = () => {
    toast.info('添加新规则功能正在开发中');
    setIsExitModalOpen(false);
  };

  // 处理任务标题编辑
  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (taskTitle !== (activeSession.taskTitle || '请输入本次任务项')) {
      try {
        await updateTaskTitle(activeSession.chainId, taskTitle);
        toast.success('任务标题已更新');
      } catch (error) {
        console.error('更新任务标题失败:', error);
        toast.error('更新任务标题失败');
        // 恢复原标题
        setTaskTitle(activeSession.taskTitle || '请输入本次任务项');
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setTaskTitle(activeSession.taskTitle || '请输入本次任务项');
      setIsEditingTitle(false);
    }
  };

  // 获取已有的例外规则
  const getExistingRules = (): string[] => {
    const currentContext = contexts?.find(c => c.id === activeSession.contextId);
    if (currentContext?.rules) {
      const rules = currentContext.rules as any;
      return rules.items || [];
    }
    return [];
  };

  // 处理规则编辑
  const handleToggleEditRules = () => {
    if (!isEditingRules) {
      // 开始编辑，初始化可编辑规则
      setEditableRules([...getExistingRules()]);
    }
    setIsEditingRules(!isEditingRules);
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...editableRules];
    newRules[index] = value;
    setEditableRules(newRules);
  };

  const handleAddNewRule = () => {
    setEditableRules([...editableRules, '']);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = editableRules.filter((_, i) => i !== index);
    setEditableRules(newRules);
  };

  const handleSaveRules = async () => {
    try {
      const filteredRules = editableRules.filter(rule => rule.trim() !== '');
      await updateExceptionRules(activeSession.contextId, filteredRules);
      setIsEditingRules(false);
      toast.success('例外规则已更新');
    } catch (error) {
      console.error('更新例外规则失败:', error);
      toast.error('更新例外规则失败');
    }
  };

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsExitModalOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="h-screen w-full font-sans flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{ 
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textPrimary,
        transition: transition.colorTransition
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-gray-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,#3b82f618,transparent)]"></div>

      {/* 顶部提示 */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center z-20">
        <button 
          onClick={() => setIsCommandPaletteOpen(true)} 
          className="text-sm transition-colors hover:opacity-75"
          style={{ 
            color: themeVars.textSecondary
          }}
        >
          按 <kbd className="px-2 py-1.5 text-xs font-semibold border rounded-md" style={{
            color: themeVars.textSecondary,
            backgroundColor: `${themeVars.backgroundSecondary}CC`,
            borderColor: themeVars.borderPrimary
          }}>Ctrl</kbd> + <kbd className="px-2 py-1.5 text-xs font-semibold border rounded-md" style={{
            color: themeVars.textSecondary,
            backgroundColor: `${themeVars.backgroundSecondary}CC`,
            borderColor: themeVars.borderPrimary
          }}>P</kbd> 打开控制面板
        </button>
      </div>

      {/* 主信息区域 */}
      <div className="flex flex-col items-center text-center z-10 w-full max-w-2xl">
        {/* 头部信息 */}
        <div className="flex items-center space-x-3" style={{ color: themeVars.accentPrimary }}>
          <Link2 size={20} />
          <span className="text-xl font-semibold">{activeSession.contextName}</span>
        </div>
        
        {/* 可编辑的任务标题 */}
        {isEditingTitle ? (
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className="text-lg mt-1 bg-transparent border-none outline-none text-center w-full max-w-md"
            style={{ 
              color: themeVars.textSecondary,
              borderBottom: `1px solid ${themeVars.borderPrimary}`
            }}
          />
        ) : (
          <p 
            className="text-lg mt-1 cursor-pointer hover:opacity-75 transition-opacity"
            style={{ color: themeVars.textSecondary }}
            onClick={() => setIsEditingTitle(true)}
          >
            {taskTitle}
          </p>
        )}
        
        {/* 计时器和进度条 */}
        <div className="w-full my-8">
          <div className="font-mono text-8xl md:text-9xl leading-none" style={{ color: themeVars.textPrimary }}>
            {formatTime(timeLeft)}
          </div>
          <div 
            className="w-full h-2 rounded-full overflow-hidden mt-4"
            style={{ backgroundColor: `${themeVars.borderPrimary}80` }}
          >
            <div 
              className="h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: themeVars.accentPrimary
              }}
            />
          </div>
        </div>
      </div>
      
      {/* 链长度显示（左下角） */}
      <div className="absolute bottom-8 left-8 z-10">
        <div className="flex items-baseline space-x-3" style={{ color: themeVars.textPrimary }}>
          <span className="text-5xl font-bold">#{activeSession.chainCounter || 0}</span>
          <span className="font-medium" style={{ color: themeVars.textSecondary }}>
            当前链长
          </span>
        </div>
      </div>
      
      {/* 中断按钮（右下角） */}
      <div className="absolute bottom-8 right-8 z-10">
        <button 
          onClick={() => setIsExitModalOpen(true)}
          className="px-4 py-2 rounded-md font-semibold transition-colors border hover:opacity-75"
          style={{
            backgroundColor: `${themeVars.backgroundSecondary}80`,
            borderColor: `${themeVars.borderPrimary}CC`,
            color: themeVars.textSecondary
          }}
        >
          中断任务
        </button>
      </div>

      {/* 模态框 */}
      {isExitModalOpen && (
        <ExitConfirmationModal 
          onStay={() => setIsExitModalOpen(false)}
          onBreakChain={handleBreakChain}
          onAddRule={handleAddRule}
          chainCount={activeSession.chainCounter || 0}
          existingRules={getExistingRules()}
          isEditingRules={isEditingRules}
          onToggleEditRules={handleToggleEditRules}
          editableRules={editableRules}
          onRuleChange={handleRuleChange}
          onAddNewRule={handleAddNewRule}
          onRemoveRule={handleRemoveRule}
          onSaveRules={handleSaveRules}
        />
      )}
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* 背景网格样式通过CSS类实现 */}
      <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    </div>
  );
};

export default FocusPage;
