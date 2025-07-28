import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useThemeVariables } from '../hooks/useTheme';
import { ArrowLeft, Settings, Delete } from 'lucide-react';
import CreateContextPage from './CreateContextPage';
import { contextsWithChainsAtom } from '../features/ctdp/atoms';
import { useCTDPActions } from '../features/ctdp/hooks';
import { getIconComponent } from '../constants';

interface ContextManagementPageProps {
  contextId: string;
  contextName: string;
  onBack: () => void;
}

// Mock链历史数据
const mockChainHistory = [
  {
    id: '#1',
    status: 'active',
    title: '链 #in-1 (活跃中 #27)',
    date: '2020-07-16',
    logs: [
      {
        id: '1',
        type: 'success',
        title: '完成CTDP契约设计文档',
        time: '2020-07-28 10:04',
        duration: '2小时5分钟',
        tags: ['文档设计']
      },
      {
        id: '2', 
        type: 'success',
        title: '修复UI Bug',
        time: '2020-07-27 15:30',
        duration: '1小时30分钟',
        tags: ['Bug修复']
      }
    ]
  },
  {
    id: '#2',
    status: 'broken',
    title: '链 #in-2 (已断裂 #15)',
    date: '2022-07-01 - 2022-07-15',
    logs: [
      {
        id: '3',
        type: 'failure',
        title: '在专门时间中使用了非工作应用',
        time: '2020-07-15 21:45'
      },
      {
        id: '4',
        type: 'success', 
        title: '研究Monorepo架构',
        time: '2020-07-15 20:00',
        duration: '1小时25分钟',
        tags: ['架构研究']
      }
    ]
  },
  {
    id: '#3',
    status: 'broken',
    title: '链 #in-3 (已断裂 #8)',
    date: '2020-05-20 - 2020-06-28',
    logs: [
      {
        id: '5',
        type: 'failure',
        title: '手动中断任务',
        time: '2020-06-28 11:00'
      }
    ]
  }
];

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
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border"
              style={{
                borderColor: themeVars.borderPrimary,
                backgroundColor: themeVars.backgroundInteractive,
                color: themeVars.textPrimary
              }}
            >
              <Settings size={16} />
              编辑情境
            </button>
            <button
              onClick={handleDeleteContext}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#EF4444',
                color: 'white'
              }}
            >
              <Delete size={16} />
              删除情境  
            </button>
          </div>
        </div>

        {/* 右侧链历史区域 */}
        <div className="flex-1 flex flex-col p-6">
          <div 
            className="rounded-lg p-6 flex-1"
            style={{
              backgroundColor: themeVars.backgroundSecondary,
              border: `1px solid ${themeVars.borderPrimary}`
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: themeVars.textPrimary }}
            >
              链历史记录
            </h3>
            
            {/* 显示活跃链信息 */}
            {currentContext?.activeChain ? (
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: themeVars.backgroundInteractive,
                    border: `1px solid ${themeVars.borderPrimary}`
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: themeVars.textPrimary }}
                    >
                      当前活跃链
                    </span>
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: '#10B981',
                        color: 'white'
                      }}
                    >
                      活跃中
                    </span>
                  </div>
                  <div 
                    className="text-xl font-bold"
                    style={{ color: themeVars.textPrimary }}
                  >
                    链长: #{currentContext.activeChain.counter}
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: themeVars.textSecondary }}
                  >
                    创建于: {new Date(currentContext.activeChain.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="text-center py-8"
                style={{ color: themeVars.textSecondary }}
              >
                <p>暂无活跃的链记录</p>
                <p className="text-sm mt-2">开始一个专注会话来创建新的链</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextManagementPage;
