import React from 'react';
import { useThemeVariables, useThemeTransition } from '../hooks/useTheme';

const Dashboard: React.FC = () => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();

  return (
    <div 
      className="h-full overflow-y-auto"
      style={{
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textPrimary,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* 顶部标题区域 */}
      <div className="mb-8">
        <div className="mb-4">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ 
              color: themeVars.textPrimary,
              fontSize: '32px',
              fontWeight: '700',
              lineHeight: '1.2'
            }}
          >
            仪表盘
          </h1>
          <p 
            className="text-lg"
            style={{ 
              color: themeVars.textSecondary,
              fontSize: '16px',
              fontWeight: '400'
            }}
          >
            欢迎回来，这是你今天的专注力概览。
          </p>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 当前任务卡片 */}
        <div 
          className="lg:col-span-2 p-6 rounded-lg border transition-all duration-200"
          style={{
            backgroundColor: themeVars.backgroundSecondary,
            borderColor: themeVars.borderPrimary,
            borderRadius: themeVars.borderRadiusLg
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-xl font-bold"
              style={{ 
                color: themeVars.textPrimary,
                fontSize: '20px',
                fontWeight: '600'
              }}
            >
              当前任务
            </h2>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: themeVars.colorSuccess,
                color: '#ffffff',
                borderRadius: '9999px'
              }}
            >
              进行中
            </span>
          </div>
          
          <div className="mb-6">
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ 
                color: themeVars.textPrimary,
                fontSize: '24px',
                fontWeight: '700'
              }}
            >
              深度工作: 论文Ch.3
            </h3>
            <div 
              className="text-4xl font-mono"
              style={{
                color: themeVars.accentPrimary,
                fontSize: '48px',
                fontWeight: '700',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              01:23:45
            </div>
          </div>
        </div>

        {/* CTDP 任务链 */}
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: themeVars.backgroundSecondary,
            borderColor: themeVars.borderPrimary,
            borderRadius: themeVars.borderRadiusLg
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ 
              color: themeVars.textPrimary,
              fontSize: '20px',
              fontWeight: '600'
            }}
          >
            CTDP 任务链
          </h2>
          
          <div className="text-center">
            <div 
              className="text-sm mb-2"
              style={{ 
                color: themeVars.textSecondary,
                fontSize: '14px'
              }}
            >
              论文写作链
            </div>
            <div className="flex items-center justify-center">
              <span 
                className="text-5xl font-bold mr-2"
                style={{ 
                  color: themeVars.textPrimary,
                  fontSize: '48px',
                  fontWeight: '700'
                }}
              >
                #27
              </span>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: themeVars.colorSuccess }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 专注时长图表区域 */}
      <div 
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: themeVars.backgroundSecondary,
          borderColor: themeVars.borderPrimary,
          borderRadius: themeVars.borderRadiusLg
        }}
      >
        <h2 
          className="text-xl font-bold mb-6"
          style={{ 
            color: themeVars.textPrimary,
            fontSize: '20px',
            fontWeight: '600'
          }}
        >
          本周专注时长 (小时)
        </h2>
        
        {/* 简单的图表占位 */}
        <div className="grid grid-cols-7 gap-4 h-64">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
            <div key={day} className="flex flex-col items-center justify-end">
              <div 
                className="w-full rounded-t-lg mb-2 transition-all duration-300"
                style={{
                  backgroundColor: index === 3 ? themeVars.accentPrimary : themeVars.backgroundInteractive,
                  height: `${Math.random() * 80 + 20}%`,
                  minHeight: '20px'
                }}
              ></div>
              <span 
                className="text-xs text-center"
                style={{ 
                  color: themeVars.textSecondary,
                  fontSize: '12px'
                }}
              >
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
