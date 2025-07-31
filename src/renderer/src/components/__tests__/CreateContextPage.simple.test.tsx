/**
 * CreateContextPage 组件简化测试
 * 测试组件基本渲染和表单交互
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'jotai'
import CreateContextPage from '../CreateContextPage'

// Mock useCTDPActions hook
const mockCreateSacredContext = jest.fn()
const mockUpdateSacredContext = jest.fn()

jest.mock('../../features/ctdp/hooks', () => ({
  useCTDPActions: () => ({
    createSacredContext: mockCreateSacredContext,
    updateSacredContext: mockUpdateSacredContext
  })
}))

// Mock useThemeVariables hook
jest.mock('../../hooks/useTheme', () => ({
  useThemeVariables: () => ({
    primary: '#6366F1',
    primaryForeground: '#FFFFFF',
    background: '#FFFFFF',
    foreground: '#000000',
    card: '#F8FAFC',
    border: '#E2E8F0'
  })
}))

// Mock toast
jest.mock('../ui/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}))

// Jotai Provider wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(Provider, {}, children)
)

describe('CreateContextPage - 基本功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('组件正常渲染', () => {
    render(
      React.createElement(wrapper, { children: 
        React.createElement(CreateContextPage, { 
          onBack: jest.fn() 
        })
      })
    )

    // 验证主要元素存在
    expect(screen.getByText('创建新情境')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('例如：深度工作, 论文写作')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/描述这个情境的用途和特点/)).toBeInTheDocument()
  })

  test('表单输入功能正常', () => {
    render(
      React.createElement(wrapper, { children: 
        React.createElement(CreateContextPage, { 
          onBack: jest.fn() 
        })
      })
    )

    const nameInput = screen.getByPlaceholderText('例如：深度工作, 论文写作')
    const descInput = screen.getByPlaceholderText(/描述这个情境的用途和特点/)

    // 测试输入
    fireEvent.change(nameInput, { target: { value: '测试情境' } })
    fireEvent.change(descInput, { target: { value: '测试描述' } })

    expect(nameInput).toHaveValue('测试情境')
    expect(descInput).toHaveValue('测试描述')
  })

  test('返回按钮功能正常', () => {
    const mockOnBack = jest.fn()
    
    render(
      React.createElement(wrapper, { children: 
        React.createElement(CreateContextPage, { 
          onBack: mockOnBack 
        })
      })
    )

    const backButton = screen.getAllByRole('button')[0] // 第一个按钮是返回按钮
    fireEvent.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })
})
