import React, { useState } from 'react';
import { useThemeVariables } from '../hooks/useTheme';
import { ArrowLeft, Settings, Delete } from 'lucide-react';
import ChainHistoryList from './ChainHistoryList';
import CreateContextPage from './CreateContextPage';

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
            style={{ backgroundColor: '#6366F1' }}
          >
            <span className="text-white text-lg font-bold">🧠</span>
          </div>
          <div>
            <h1 
              className="text-xl font-bold"
              style={{ color: themeVars.textPrimary }}
            >
              {contextName}
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
                  45 分钟
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
                  <div style={{ color: themeVars.textPrimary }}>1. 关闭所有社交软件。</div>
                  <div style={{ color: themeVars.textPrimary }}>2. 手机静音并反面放置。</div>
                  <div style={{ color: themeVars.textPrimary }}>3. 只允许使用VS Code和相关开发工具。</div>
                </div>
              </div>
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
        <div className="flex-1 flex flex-col">
          <ChainHistoryList chains={mockChainHistory} />
        </div>
      </div>
    </div>
  );
};

export default ContextManagementPage;
