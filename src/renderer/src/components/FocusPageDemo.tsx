import React, { useState } from 'react';
import { useSetAtom } from 'jotai';
import { activeSessionAtom } from '../features/ctdp/atoms';
import FocusPage from '../components/FocusPage';
import { ActiveSession } from '../../../types/ctdp';

// 测试用的FocusPage演示组件
const FocusPageDemo: React.FC = () => {
  const [showFocusPage, setShowFocusPage] = useState(false);
  const setActiveSession = useSetAtom(activeSessionAtom);

  // 模拟启动专注会话
  const startDemoSession = () => {
    const mockSession: ActiveSession = {
      chainId: 'demo-chain-123',
      contextId: 'demo-context-456',
      contextName: '深度学习研究',
      chainCounter: 7,
      taskTitle: '完成神经网络论文阅读',
      startTime: new Date(),
      expectedEndTime: new Date(Date.now() + 45 * 60 * 1000), // 45分钟后
      tags: [
        { id: '1', name: '研究', color: '#3B82F6', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: '论文', color: '#10B981', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: '深度学习', color: '#8B5CF6', createdAt: new Date(), updatedAt: new Date() }
      ]
    };

    setActiveSession(mockSession);
    setShowFocusPage(true);
  };

  // 退出专注页面
  const exitFocusPage = () => {
    setShowFocusPage(false);
    setActiveSession(null);
  };

  if (showFocusPage) {
    return <FocusPage onExit={exitFocusPage} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">FocusPage 演示</h1>
        <p className="text-gray-400 mb-8 max-w-lg">
          点击下方按钮启动一个模拟的专注会话，体验完整的专注页面功能。
          页面包含倒计时、进度条、链长度显示、中断确认等功能。
        </p>
        <button 
          onClick={startDemoSession}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          启动专注会话 (45分钟)
        </button>
        <div className="mt-8 text-sm text-gray-500">
          <p>专注中页面支持的功能：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>实时倒计时和进度条</li>
            <li>键盘快捷键 Ctrl+P 打开命令面板</li>
            <li>右下角中断按钮，支持"下必为例"原则</li>
            <li>自动完成或手动中断任务链</li>
            <li>主题适配和视觉效果</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FocusPageDemo;
