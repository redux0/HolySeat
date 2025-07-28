import React from 'react';
import { useThemeVariables, useThemeTransition } from '../hooks/useTheme';
import { Card } from './ui/card';
import { Play, BookOpen, Zap, List, Plus } from 'lucide-react';

const StartPage: React.FC = () => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();

  const contextChains = [
    {
      id: 1,
      icon: Play,
      color: '#6366F1',
      title: '深度工作',
      chain: '#27',
      label: '当前链长',
      progress: 85
    },
    {
      id: 2,
      icon: BookOpen,
      color: '#06B6D4',
      title: '论文写作',
      chain: '#14',
      label: '当前链长',
      progress: 65
    },
    {
      id: 3,
      icon: Zap,
      color: '#F59E0B',
      title: '健身训练',
      chain: '#88',
      label: '当前链长',
      progress: 95
    },
    {
      id: 4,
      icon: List,
      color: '#10B981',
      title: '冥想放松',
      chain: '#42',
      label: '当前链长',
      progress: 70
    },
    {
      id: 5,
      icon: Plus,
      color: '#6B7280',
      title: '新情境',
      chain: '#0',
      label: '当前链长',
      progress: 0
    }
  ];

  return (
    <div 
      className="h-full overflow-y-auto p-8"
      style={{
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textPrimary,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* 标题区域 */}
      <div className="mb-8">
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

      {/* 情境卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contextChains.map((context) => {
          const IconComponent = context.icon;
          return (
            <Card
              key={context.id}
              className="p-6 cursor-pointer transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: themeVars.backgroundSecondary,
                borderColor: themeVars.borderPrimary,
                borderRadius: themeVars.borderRadiusLg
              }}
            >
              {/* 卡片头部 */}
              <div className="flex items-center justify-between mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: context.color }}
                >
                  <IconComponent size={24} color="white" />
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-bold"
                    style={{ 
                      color: themeVars.textPrimary,
                      fontSize: '24px',
                      fontWeight: '700'
                    }}
                  >
                    {context.chain}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ 
                      color: themeVars.textSecondary,
                      fontSize: '12px'
                    }}
                  >
                    {context.label}
                  </div>
                </div>
              </div>

              {/* 卡片标题 */}
              <div className="mb-4">
                <h3 
                  className="text-xl font-semibold"
                  style={{ 
                    color: themeVars.textPrimary,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}
                >
                  {context.title}
                </h3>
              </div>

              {/* 进度条 */}
              <div className="w-full">
                <div 
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: `${context.color}20` }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: context.color,
                      width: `${context.progress}%`
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StartPage;
