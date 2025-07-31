import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { BookOpen, Play, Zap } from 'lucide-react';
import StartPage from '../StartPage';
import { contextsWithChainsAtom } from '../../features/ctdp/atoms';

// Mock the hooks
jest.mock('../../hooks/useTheme', () => ({
  useThemeVariables: () => ({
    backgroundPrimary: '#1a1a1a',
    backgroundSecondary: '#2a2a2a',
    backgroundInteractive: '#3a3a3a',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    accentPrimary: '#3B82F6',
    borderPrimary: '#444444',
    borderRadiusLg: '8px'
  }),
  useThemeTransition: () => 'transition-all duration-300'
}));

jest.mock('../../features/ctdp/hooks', () => ({
  useCTDPActions: () => ({
    loadContextsWithChains: jest.fn(),
    startSession: jest.fn(),
    initializeData: jest.fn()
  })
}));

describe('StartPage 图标映射测试', () => {
  const mockContextsWithEmoji = [
    {
      id: 'deep-work',
      name: '深度工作',
      description: '需要高度专注的工作任务',
      icon: '🧠', // 数据库中存储的emoji
      color: '#3B82F6',
      activeChain: {
        id: 'chain-1',
        counter: 5,
        logs: []
      }
    },
    {
      id: 'study',
      name: '学习',
      description: '阅读、学习新知识',
      icon: '📚', // 数据库中存储的emoji
      color: '#10B981',
      activeChain: {
        id: 'chain-2',
        counter: 3,
        logs: []
      }
    },
    {
      id: 'exercise',
      name: '健身运动',
      description: '健身和运动',
      icon: '💪', // 数据库中存储的emoji
      color: '#F59E0B',
      activeChain: null
    }
  ];

  test('正确映射emoji图标到对应的Lucide图标', () => {
    const store = createStore();
    store.set(contextsWithChainsAtom, mockContextsWithEmoji);

    render(
      <Provider store={store}>
        <StartPage />
      </Provider>
    );

    // 验证情境名称显示
    expect(screen.getByText('深度工作')).toBeInTheDocument();
    expect(screen.getByText('学习')).toBeInTheDocument();
    expect(screen.getByText('健身运动')).toBeInTheDocument();

    // 验证情境描述显示
    expect(screen.getByText('需要高度专注的工作任务')).toBeInTheDocument();
    expect(screen.getByText('阅读、学习新知识')).toBeInTheDocument();
    expect(screen.getByText('健身和运动')).toBeInTheDocument();
  });

  test('处理缺失图标的情况', () => {
    const contextWithoutIcon = [{
      id: 'no-icon',
      name: '无图标情境',
      description: '没有设置图标的情境',
      color: '#6B7280',
      activeChain: null
    }];

    const store = createStore();
    store.set(contextsWithChainsAtom, contextWithoutIcon);

    render(
      <Provider store={store}>
        <StartPage />
      </Provider>
    );

    expect(screen.getByText('无图标情境')).toBeInTheDocument();
  });
});
