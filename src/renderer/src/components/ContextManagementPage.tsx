import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useThemeVariables } from '../hooks/useTheme';
import { ArrowLeft, Settings, Delete, Clock, Tag, CheckCircle, XCircle, Archive, ListChecks, Edit, Trash2 } from 'lucide-react';
import CreateContextPage from './CreateContextPage';
import { contextsWithChainsAtom } from '../features/ctdp/atoms';
import { useCTDPActions } from '../features/ctdp/hooks';
import { getIconComponent } from '../constants';
import { CTDPLog } from '../../../types/ctdp';
import { LogType } from '@prisma/client';

interface ContextManagementPageProps {
  contextId: string;
  contextName: string;
  onBack: () => void;
}

// 格式化持续时长
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '未知时长';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// 获取日志类型的中文显示
const getLogTypeDisplay = (type: LogType): { text: string; color: string } => {
  switch (type) {
    case LogType.SUCCESS:
      return { text: '成功完成', color: '#10B981' };
    case LogType.BROKEN:
      return { text: '链断裂', color: '#EF4444' };
    case LogType.CREATED:
      return { text: '链创建', color: '#3B82F6' };
    case LogType.PAUSED:
      return { text: '任务暂停', color: '#F59E0B' };
    case LogType.RESUMED:
      return { text: '任务恢复', color: '#8B5CF6' };
    case LogType.RULE_UPDATED:
      return { text: '规则更新', color: '#06B6D4' };
    default:
      return { text: '未知', color: '#6B7280' };
  }
};

// 链日志项组件
const ChainLogItem: React.FC<{ log: any; themeVars: any }> = ({ log, themeVars }) => {
  const getLogIcon = (type: LogType) => {
    switch (type) {
      case LogType.SUCCESS:
        return <CheckCircle className="text-green-500" size={20} />;
      case LogType.BROKEN:
        return <XCircle className="text-red-500" size={20} />;
      case LogType.CREATED:
        return <CheckCircle className="text-blue-500" size={20} />;
      case LogType.PAUSED:
        return <Clock className="text-yellow-500" size={20} />;
      case LogType.RESUMED:
        return <CheckCircle className="text-purple-500" size={20} />;
      case LogType.RULE_UPDATED:
        return <Settings className="text-cyan-500" size={20} />;
      default:
        return <CheckCircle className="text-gray-500" size={20} />;
    }
  };

  const logDisplay = getLogTypeDisplay(log.type);

  return (
    <div 
      className="flex items-start space-x-4 py-3 border-t"
      style={{ borderColor: `${themeVars.borderPrimary}` }}
    >
      {getLogIcon(log.type)}
      <div className="flex-1">
        <p 
          className="font-medium"
          style={{ color: themeVars.textPrimary }}
        >
          {log.title || log.message || logDisplay.text}
        </p>
        <div className="flex items-center space-x-4 text-xs mt-1" style={{ color: themeVars.textSecondary }}>
          <span>
            {new Date(log.createdAt).toLocaleString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {log.duration && (
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{formatDuration(log.duration)}</span>
            </div>
          )}
          {log.tags && log.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag size={12} />
              <span>{log.tags.map((tag: any) => tag.name).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 链手风琴项组件
const ChainAccordionItem: React.FC<{ chain: any; themeVars: any }> = ({ chain, themeVars }) => {
  const [isOpen, setIsOpen] = useState(chain.status === 'ACTIVE');
  const isBroken = chain.status === 'BROKEN';
  const isActive = chain.status === 'ACTIVE';

  return (
    <div 
      className="rounded-lg border"
      style={{
        backgroundColor: `${themeVars.backgroundSecondary}`,
        borderColor: isActive ? '#6366F1' : `${themeVars.borderPrimary}`
      }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 transition-colors hover:bg-opacity-80"
      >
        <div className="flex items-center space-x-4">
          {isBroken ? (
            <Archive size={20} style={{ color: themeVars.textSecondary }} />
          ) : (
            <ListChecks size={20} className="text-indigo-400" />
          )}
          <span 
            className="font-semibold"
            style={{ 
              color: isBroken ? themeVars.textSecondary : themeVars.textPrimary 
            }}
          >
            链 #{chain.id.slice(-4)} ({isBroken ? `已断裂于 #${chain.counter}` : `活跃中 #${chain.counter}`})
          </span>
        </div>
        <span className="text-xs" style={{ color: themeVars.textSecondary }}>
          {new Date(chain.createdAt).toLocaleDateString('zh-CN')}
          {chain.endedAt && ` - ${new Date(chain.endedAt).toLocaleDateString('zh-CN')}`}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-2">
          {chain.logs && chain.logs.length > 0 ? (
            chain.logs.map((log: any) => (
              <ChainLogItem key={log.id} log={log} themeVars={themeVars} />
            ))
          ) : (
            <div 
              className="text-center py-4 text-sm"
              style={{ color: themeVars.textSecondary }}
            >
              暂无日志记录
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ContextManagementPage: React.FC<ContextManagementPageProps> = ({ 
  contextId, 
  contextName, 
  onBack 
}) => {
  const themeVars = useThemeVariables();
  const [isEditing, setIsEditing] = useState(false);
  const { deleteSacredContext } = useCTDPActions();
  const contextsWithChains = useAtomValue(contextsWithChainsAtom);
  
  // 根据 contextId 查找对应的情境数据
  const currentContext = contextsWithChains?.find(ctx => ctx.id === contextId);

  // 模拟链数据（按照设计图样式）
  const mockChains = [
    {
      id: 'chain-1',
      status: 'ACTIVE',
      counter: 27,
      createdAt: '2025-07-16',
      logs: [
        { 
          id: '1',
          type: LogType.SUCCESS, 
          title: '完成CTDP模块设计文档', 
          duration: 3600, 
          tags: [{ name: '文档' }, { name: '核心功能' }], 
          createdAt: '2025-07-28T10:00:00Z' 
        },
        { 
          id: '2',
          type: LogType.SUCCESS, 
          title: '修复UI Bug', 
          duration: 1800, 
          tags: [{ name: '前端' }, { name: 'Bugfix' }], 
          createdAt: '2025-07-27T15:30:00Z' 
        },
      ]
    },
    {
      id: 'chain-2',
      status: 'BROKEN',
      counter: 15,
      createdAt: '2025-07-01',
      endedAt: '2025-07-15',
      logs: [
        { 
          id: '3',
          type: LogType.BROKEN, 
          title: '在专注期间使用了非白名单应用', 
          createdAt: '2025-07-15T21:45:00Z' 
        },
        { 
          id: '4',
          type: LogType.SUCCESS, 
          title: '研究Monorepo架构', 
          duration: 4500, 
          tags: [{ name: '架构' }, { name: '技术预研' }], 
          createdAt: '2025-07-15T20:00:00Z' 
        },
      ]
    },
    {
      id: 'chain-3',
      status: 'BROKEN',
      counter: 8,
      createdAt: '2025-06-20',
      endedAt: '2025-06-28',
      logs: [
        { 
          id: '5',
          type: LogType.BROKEN, 
          title: '手动中断任务', 
          createdAt: '2025-06-28T11:00:00Z' 
        },
      ]
    }
  ];
  
  // 如果数据未加载或找不到对应情境，显示加载状态
  if (!contextsWithChains || !currentContext) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{
          backgroundColor: themeVars.backgroundPrimary,
          color: themeVars.textSecondary
        }}
      >
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>加载情境数据...</p>
        </div>
      </div>
    );
  }
  
  // 解析规则数据
  const getRulesData = () => {
    if (!currentContext?.rules) return { defaultDuration: 45, items: [] };
    
    try {
      const rulesData = typeof currentContext.rules === 'string' 
        ? JSON.parse(currentContext.rules) 
        : currentContext.rules;
      return {
        defaultDuration: rulesData.defaultDuration || 45,
        items: rulesData.items || []
      };
    } catch (error) {
      console.error('解析规则数据失败:', error);
      return { defaultDuration: 45, items: [] };
    }
  };
  
  const rulesData = getRulesData();
  
  // 获取情境图标组件
  const IconComponent = getIconComponent(currentContext?.icon);
  
  // 处理删除情境
  const handleDeleteContext = async () => {
    if (window.confirm(`确定要删除情境"${contextName}"吗？此操作不可撤销。`)) {
      try {
        await deleteSacredContext(contextId);
        onBack(); // 删除成功后返回上级页面
      } catch (error) {
        console.error('删除情境失败:', error);
        alert('删除情境失败，请重试。');
      }
    }
  };

  // 如果是编辑模式，显示创建页面组件
  if (isEditing) {
    return (
      <CreateContextPage 
        isEditing={true}
        contextId={contextId}
        onBack={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textPrimary,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* 页面头部 */}
      <div className="flex items-center p-6">
        <button 
          onClick={onBack}
          className="p-2 mr-3 rounded-md transition-colors hover:bg-opacity-80"
          style={{ backgroundColor: `${themeVars.backgroundSecondary}80` }}
        >
          <ArrowLeft size={20} style={{ color: themeVars.textSecondary }} />
        </button>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: currentContext?.color || '#6366F1' }}
          >
            <IconComponent size={20} color="white" />
          </div>
          <div>
            <h1 
              className="text-xl font-bold"
              style={{ color: themeVars.textPrimary }}
            >
              {currentContext?.name || contextName}
            </h1>
            <p 
              className="text-sm"
              style={{ color: themeVars.textSecondary }}
            >
              情境配置与历史记录
            </p>
          </div>
        </div>
      </div>

      {/* 主体内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧配置区域 */}
        <div className="w-80 flex-shrink-0 p-6">
          <div 
            className="rounded-lg p-6 mb-4"
            style={{
              backgroundColor: themeVars.backgroundSecondary,
              border: `1px solid ${themeVars.borderPrimary}`
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: themeVars.textPrimary }}
            >
              情境配置
            </h3>
            
            <div className="space-y-4">
              <div>
                <label 
                  className="text-sm font-medium"
                  style={{ color: themeVars.textSecondary }}
                >
                  默认时长
                </label>
                <div 
                  className="mt-1 text-lg font-semibold"
                  style={{ color: themeVars.textPrimary }}
                >
                  {rulesData.defaultDuration} 分钟
                </div>
              </div>
              
              <div>
                <label 
                  className="text-sm font-medium"
                  style={{ color: themeVars.textSecondary }}
                >
                  行为准则
                </label>
                <div className="mt-2 space-y-1 text-sm">
                  {rulesData.items.length > 0 ? (
                    rulesData.items.map((rule: string, index: number) => (
                      <div key={index} style={{ color: themeVars.textPrimary }}>
                        {index + 1}. {rule}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: themeVars.textSecondary }}>
                      暂无行为准则
                    </div>
                  )}
                </div>
              </div>
              
              {currentContext?.description && (
                <div>
                  <label 
                    className="text-sm font-medium"
                    style={{ color: themeVars.textSecondary }}
                  >
                    情境描述
                  </label>
                  <div 
                    className="mt-1 text-sm"
                    style={{ color: themeVars.textPrimary }}
                  >
                    {currentContext.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: `${themeVars.backgroundSecondary}`,
                color: themeVars.textPrimary,
                border: `1px solid ${themeVars.borderPrimary}`
              }}
            >
              <Edit size={16} />
              编辑情境
            </button>
            <button
              onClick={handleDeleteContext}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#DC2626',
                color: 'white'
              }}
            >
              <Trash2 size={16} />
              删除情境  
            </button>
          </div>
        </div>

        {/* 右侧链历史区域 */}
        <div className="flex-1 flex flex-col p-6">
            
            {/* 显示所有链信息（手风琴样式） */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {mockChains.map((chain: any) => (
                <ChainAccordionItem key={chain.id} chain={chain} themeVars={themeVars} />
              ))}
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default ContextManagementPage;
