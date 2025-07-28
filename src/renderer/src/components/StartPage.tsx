import React, { useEffect, useState } from 'react';
import { useThemeVariables, useThemeTransition } from '../hooks/useTheme';
import { Card } from './ui/card';
import { Play, BookOpen, Zap, List, Plus, Calendar, TrendingUp, Timer, Bell } from 'lucide-react';
import { useCTDPActions } from '../features/ctdp/hooks';
import { useAtomValue } from 'jotai';
import { contextsWithChainsAtom, contextsLoadingAtom, contextsErrorAtom } from '../features/ctdp/atoms';
import CreateContextPage from './CreateContextPage';
import ContextManagementPage from './ContextManagementPage';

const StartPage: React.FC = () => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();
  
  // 页面状态管理
  const [currentView, setCurrentView] = useState<'main' | 'create' | 'manage'>('main');
  const [selectedContext, setSelectedContext] = useState<{id: string, name: string} | null>(null);
  
  // CTDP hooks and state
  const { loadContextsWithChains, startSession, initializeData } = useCTDPActions();
  const contexts = useAtomValue(contextsWithChainsAtom);
  const loading = useAtomValue(contextsLoadingAtom);
  const error = useAtomValue(contextsErrorAtom);

  // 初始化数据加载
  useEffect(() => {
    console.log('🎯 初始化StartPage数据加载');
    initializeData();
  }, []);

  // 图标映射
  const getContextIcon = (iconName?: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      '🧠': Play,
      '📚': BookOpen, 
      '💪': Zap,
      '🧘': List,
      'play': Play,
      'book': BookOpen,
      'zap': Zap,
      'list': List
    };
    return iconMap[iconName || 'play'] || Play;
  };

  // 处理启动会话
  const handleStartSession = async (contextId: string, contextName: string) => {
    try {
      console.log(`🎯 启动情境: ${contextName} (${contextId})`);
      await startSession(contextId, {
        title: `${contextName}专注会话`,
        expectedDuration: 3600 // 默认1小时
      });
    } catch (err) {
      console.error('启动会话失败:', err);
      // TODO: 显示错误提示
    }
  };

  // 计算成功率
  const calculateSuccessRate = (context: any) => {
    if (!context.activeChain) return 0;
    
    const successLogs = context.activeChain.logs?.filter((log: any) => log.type === 'SUCCESS') || [];
    const totalLogs = context.activeChain.logs?.length || 0;
    
    if (totalLogs === 0) return 0;
    return Math.round((successLogs.length / totalLogs) * 100);
  };

  // 格式化时间
  const formatLastActivity = (context: any) => {
    if (!context.activeChain?.logs?.length) return '从未';
    
    const lastLog = context.activeChain.logs[0]; // 已按时间倒序
    const date = new Date(lastLog.createdAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 如果是创建页面，显示创建组件
  if (currentView === 'create') {
    return <CreateContextPage onBack={() => setCurrentView('main')} />;
  }

  // 如果是管理页面，显示管理组件
  if (currentView === 'manage' && selectedContext) {
    return (
      <ContextManagementPage 
        contextId={selectedContext.id}
        contextName={selectedContext.name}
        onBack={() => {
          setCurrentView('main');
          setSelectedContext(null);
        }}
      />
    );
  }

  // 加载状态
  if (loading) {
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

  // 错误状态
  if (error) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{
          backgroundColor: themeVars.backgroundPrimary,
          color: themeVars.textPrimary
        }}
      >
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">加载失败</h3>
          <p className="text-sm mb-4" style={{ color: themeVars.textSecondary }}>
            {error}
          </p>
          <button 
            onClick={() => initializeData()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col p-8"
      style={{
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textPrimary,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* 头部区域 */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ 
              color: themeVars.textPrimary,
              fontSize: '32px',
              fontWeight: '700',
              lineHeight: '1.2'
            }}
          >
            情境启动中心
          </h1>
          <p 
            className="text-lg"
            style={{ 
              color: themeVars.textSecondary,
              fontSize: '16px',
              fontWeight: '400'
            }}
          >
            选择一个神圣情境，开始你的专注任务。
          </p>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: themeVars.borderPrimary,
              backgroundColor: themeVars.backgroundSecondary,
              color: themeVars.textSecondary
            }}
          >
            <TrendingUp size={16} />
            统计
          </button>
          <button
            onClick={() => setCurrentView('create')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#3B82F6',
              color: 'white'
            }}
          >
            <Plus size={16} />
            新增情境
          </button>
        </div>
      </div>

      {/* 情境卡片网格 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-wrap gap-6 pb-8 justify-start">
          {contexts?.map((context) => {
            const IconComponent = getContextIcon(context.icon);
            const activeChain = context.activeChain;
            const chainLength = activeChain?.counter || 0;
            const successRate = calculateSuccessRate(context);
            const lastActivity = formatLastActivity(context);
            
            return (
              <Card
                key={context.id}
                className="gap-0 py-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10 relative flex flex-col overflow-hidden"
                style={{
                  backgroundColor: themeVars.backgroundSecondary,
                  borderColor: themeVars.borderPrimary,
                  borderRadius: themeVars.borderRadiusLg,
                  width: '280px',
                  height: '320px'
                }}
                onClick={() => {
                  setSelectedContext({ id: context.id, name: context.name });
                  setCurrentView('manage');
                }}
              >
                {/* 顶部区域 - 紧凑布局 */}
                <div className="flex-shrink-0 p-4 pb-3">
                  {/* 图标和链长 */}
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: context.color || '#3B82F6' }}
                    >
                      <IconComponent size={20} color="white" />
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-2xl font-bold leading-none pt-1"
                        style={{ color: themeVars.textPrimary }}
                      >
                        #{chainLength}
                      </div>
                      <div 
                        className="text-xs mt-1"
                        style={{ color: themeVars.textSecondary }}
                      >
                        当前链长
                      </div>
                    </div>
                  </div>

                  {/* 标题 */}
                  <h3 
                    className="text-lg font-bold mb-2 leading-tight"
                    style={{ 
                      color: themeVars.textPrimary,
                      fontSize: '18px',
                      fontWeight: '700'
                    }}
                  >
                    {context.name}
                  </h3>
                </div>

                {/* 中间区域 - 固定高度的描述块 */}
                <div className="flex-shrink-0 px-4 mb-3">
                  <div 
                    className="text-sm overflow-hidden"
                    style={{ 
                      color: themeVars.textSecondary,
                      fontSize: '13px',
                      lineHeight: '1.4',
                      height: '36px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      textAlign: 'start'
                    }}
                  >
                    {context.description || '暂无描述'}
                  </div>
                </div>

                {/* 统计信息区域 */}
                <div className="flex-1 px-4 flex flex-col justify-center min-h-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm flex items-center gap-1"
                        style={{ color: themeVars.textSecondary }}
                      >
                        <Calendar size={12} />
                        上次活动
                      </span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: themeVars.textPrimary }}
                      >
                        {lastActivity}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm flex items-center gap-1"
                        style={{ color: themeVars.textSecondary }}
                      >
                        <TrendingUp size={12} />
                        成功率
                      </span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: successRate >= 80 ? '#10B981' : successRate >= 60 ? '#F59E0B' : '#EF4444' }}
                      >
                        {successRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 底部按钮区域 - 固定位置 */}
                <div className="flex-shrink-0 p-4 pt-2">
                  <div className="flex items-center gap-2">
                    {/* 预约启动小铃铛 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('预约启动:', context.name);
                      }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center border transition-colors"
                      style={{
                        borderColor: themeVars.borderPrimary,
                        backgroundColor: 'transparent',
                        color: themeVars.textSecondary
                      }}
                    >
                      <Bell size={16} />
                    </button>
                    
                    {/* 立即开始按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSession(context.id, context.name);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: context.color || '#3B82F6',
                        color: 'white'
                      }}
                    >
                      <Play size={16} />
                      立即开始
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StartPage;
