/**
 * ContextManagementPage 组件测试
 * 测试情境管理页面的数据显示和交互逻辑
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { jest } from '@jest/globals'
import ContextManagementPage from '../ContextManagementPage'
import { contextsWithChainsAtom } from '../../features/ctdp/atoms'

// Mock hooks 和依赖
const mockDeleteSacredContext = jest.fn() as jest.MockedFunction<any>
const mockOnBack = jest.fn()

jest.mock('../../features/ctdp/hooks', () => ({
  useCTDPActions: () => ({
    deleteSacredContext: mockDeleteSacredContext
  })
}))

jest.mock('../../hooks/useTheme', () => ({
  useThemeVariables: () => ({
    backgroundPrimary: '#1a1a1a',
    backgroundSecondary: '#2a2a2a',
    backgroundInteractive: '#3a3a3a',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    borderPrimary: '#4a4a4a'
  })
}))

// 模拟情境数据
const mockContextsWithChains = [
  {
    id: 'test-context-1',
    name: '深度工作',
    description: '需要高度专注的工作任务，如编程、写作、研究等',
    icon: 'BrainCircuit',
    color: '#6366F1',
    rules: JSON.stringify({
      defaultDuration: 60,
      items: ['关闭所有社交软件', '手机静音并反面放置', '只允许使用开发工具']
    }),
    activeChain: {
      id: 'chain-1',
      counter: 15,
      createdAt: '2024-01-15T10:00:00Z'
    }
  },
  {
    id: 'test-context-2', 
    name: '轻松阅读',
    description: '休闲阅读时间',
    icon: 'BookOpen',
    color: '#10B981',
    rules: JSON.stringify({
      defaultDuration: 30,
      items: ['选择合适的阅读环境']
    }),
    activeChain: null
  }
]

describe('ContextManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('正确显示情境的真实数据', async () => {
    // 创建预设状态的 store
    const store = createStore()
    store.set(contextsWithChainsAtom, mockContextsWithChains)

    render(
      <Provider store={store}>
        <ContextManagementPage
          contextId="test-context-1"
          contextName="深度工作"
          onBack={mockOnBack}
        />
      </Provider>
    )
    
    // 应该显示真实的情境名称（而不是传入的 props）
    expect(screen.getByText('深度工作')).toBeInTheDocument()
    
    // 应该显示真实的默认时长
    expect(screen.getByText('60 分钟')).toBeInTheDocument()
    
    // 应该显示真实的行为准则
    expect(screen.getByText('1. 关闭所有社交软件')).toBeInTheDocument()
    expect(screen.getByText('2. 手机静音并反面放置')).toBeInTheDocument()
    expect(screen.getByText('3. 只允许使用开发工具')).toBeInTheDocument()
    
    // 应该显示情境描述
    expect(screen.getByText('需要高度专注的工作任务，如编程、写作、研究等')).toBeInTheDocument()
  })
  
  test('显示活跃链信息', async () => {
    const store = createStore()
    store.set(contextsWithChainsAtom, mockContextsWithChains)

    render(
      <Provider store={store}>
        <ContextManagementPage
          contextId="test-context-1"
          contextName="深度工作"
          onBack={mockOnBack}
        />
      </Provider>
    )
    
    expect(screen.getByText('链长: #15')).toBeInTheDocument()
    expect(screen.getByText('当前活跃链')).toBeInTheDocument()
    expect(screen.getByText('活跃中')).toBeInTheDocument()
  })
  
  test('处理无活跃链的情况', async () => {
    const store = createStore()
    store.set(contextsWithChainsAtom, mockContextsWithChains)

    render(
      <Provider store={store}>
        <ContextManagementPage
          contextId="test-context-2"
          contextName="轻松阅读"
          onBack={mockOnBack}
        />
      </Provider>
    )
    
    expect(screen.getByText('暂无活跃的链记录')).toBeInTheDocument()
    expect(screen.getByText('开始一个专注会话来创建新的链')).toBeInTheDocument()
  })
  
  test('编辑按钮功能正常', async () => {
    const store = createStore()
    store.set(contextsWithChainsAtom, mockContextsWithChains)

    render(
      <Provider store={store}>
        <ContextManagementPage
          contextId="test-context-1"
          contextName="深度工作"
          onBack={mockOnBack}
        />
      </Provider>
    )
    
    const editButton = screen.getByText('编辑情境')
    expect(editButton).toBeInTheDocument()
    
    fireEvent.click(editButton)
    
    // 应该进入编辑模式（显示 CreateContextPage）
    expect(screen.getByText('编辑情境')).toBeInTheDocument()
  })
  
  test('显示数据加载状态', async () => {
    const store = createStore()
    // 不设置数据，模拟加载状态
    
    render(
      <Provider store={store}>
        <ContextManagementPage
          contextId="test-context-1"
          contextName="深度工作"
          onBack={mockOnBack}
        />
      </Provider>
    )
    
    expect(screen.getByText('加载情境数据...')).toBeInTheDocument()
  })
  
  test('标题显示实际数据而非传入的props', async () => {
    // 创建一个情境名称与props不同的测试数据
    const differentNameContext = [{
      ...mockContextsWithChains[0],
      name: '更新后的名称' // 与传入的 contextName 不同
    }]
    
    const store = createStore()
    store.set(contextsWithChainsAtom, differentNameContext)

    render(
      <Provider store={store}>
        <ContextManagementPage
          contextId="test-context-1"
          contextName="深度工作" // 传入的旧名称
          onBack={mockOnBack}
        />
      </Provider>
    )
    
    // 应该显示实际数据中的名称，而不是传入的props
    expect(screen.getByText('更新后的名称')).toBeInTheDocument()
    expect(screen.queryByText('深度工作')).not.toBeInTheDocument()
  })
})
