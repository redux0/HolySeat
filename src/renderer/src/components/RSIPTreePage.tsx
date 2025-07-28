import React from 'react';
import { useThemeVariables, useThemeTransition } from '../hooks/useTheme';
import { Card } from './ui/card';
import { Key, Wrench } from 'lucide-react';

const RSIPTreePage: React.FC = () => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();

  const rsipItems = [
    {
      id: 1,
      title: '根节点: 生活基石',
      isActive: true
    },
    {
      id: 2,
      title: '吃完饭立即洗碗',
      isActive: true
    },
    {
      id: 3,
      title: '保持厨房台面清洁',
      isActive: true
    },
    {
      id: 4,
      title: '晚上10点后不看手机',
      isActive: true
    },
    {
      id: 5,
      title: '手机不带入卧室',
      isActive: true
    },
    {
      id: 6,
      title: '用Kindle代替睡前阅读',
      isActive: false
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
          RSIP 定式树
        </h1>
        <p 
          className="text-lg"
          style={{ 
            color: themeVars.textSecondary,
            fontSize: '16px',
            fontWeight: '400'
          }}
        >
          管理你的习惯，构建稳固的生活基石。
        </p>
      </div>

      {/* RSIP 项目列表 */}
      <div className="space-y-4">
        {rsipItems.map((item) => (
          <Card
            key={item.id}
            className="p-4 cursor-pointer transition-all duration-200 hover:bg-opacity-80"
            style={{
              backgroundColor: themeVars.backgroundSecondary,
              borderColor: themeVars.borderPrimary,
              borderRadius: themeVars.borderRadiusLg,
              opacity: item.isActive ? 1 : 0.5
            }}
          >
            <div className="flex items-center space-x-4">
              {/* 图标 */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: item.isActive ? themeVars.accentPrimary : themeVars.backgroundInteractive
                }}
              >
                {item.id === 1 ? (
                  <Wrench size={20} color={item.isActive ? 'white' : themeVars.textSecondary} />
                ) : (
                  <Key size={20} color={item.isActive ? 'white' : themeVars.textSecondary} />
                )}
              </div>

              {/* 标题 */}
              <div className="flex-1">
                <h3 
                  className="text-lg font-medium"
                  style={{ 
                    color: item.isActive ? themeVars.textPrimary : themeVars.textSecondary,
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RSIPTreePage;
