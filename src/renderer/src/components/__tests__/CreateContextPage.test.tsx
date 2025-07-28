/**
 * CreateContextPage 组件测试
 * 测试情境创建/编辑页面的UI交互和表单验证逻辑
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import CreateContextPage from '../CreateContextPage'

// Mock hooks 和依赖
const mockCreateSacredContext = jest.fn() as jest.MockedFunction<any>
const mockUpdateSacredContext = jest.fn() as jest.MockedFunction<any>
const mockOnBack = jest.fn()

// Mock toast 通知
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
}

jest.mock('../../features/ctdp/hooks', () => ({
  useCTDPActions: () => ({
    createSacredContext: mockCreateSacredContext,
    updateSacredContext: mockUpdateSacredContext
  })
}))

jest.mock('../hooks/useTheme', () => ({
  useThemeVariables: () => ({
    backgroundPrimary: '#1a1a1a',
    backgroundSecondary: '#2a2a2a',
    backgroundInteractive: '#3a3a3a',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    borderPrimary: '#4a4a4a'
  })
}))

jest.mock('./ui/toast', () => ({
  toast: mockToast
}))

describe('CreateContextPage', () => {
  beforeEach(() => {
    // 清除所有 mock 调用记录
    jest.clearAllMocks()
  })

  describe('创建模式', () => {
    test('正确渲染创建页面的基本元素', () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      // 验证页面标题和描述
      expect(screen.getByText('创建新情境')).toBeInTheDocument()
      expect(screen.getByText('配置你的神圣情境，定义专注的规则。')).toBeInTheDocument()
      
      // 验证表单字段
      expect(screen.getByLabelText('情境名称')).toBeInTheDocument()
      expect(screen.getByLabelText('情境描述 (可选)')).toBeInTheDocument()
      expect(screen.getByText('选择图标')).toBeInTheDocument()
      expect(screen.getByText('选择颜色')).toBeInTheDocument()
      
      // 验证操作按钮
      expect(screen.getByText('取消')).toBeInTheDocument()
      expect(screen.getByText('创建情境')).toBeInTheDocument()
    })
    
    test('表单输入功能正常工作', async () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      const nameInput = screen.getByLabelText('情境名称')
      const descriptionInput = screen.getByLabelText('情境描述 (可选)')
      
      // 测试情境名称输入
      fireEvent.change(nameInput, { target: { value: '深度工作情境' } })
      expect((nameInput as HTMLInputElement).value).toBe('深度工作情境')
      
      // 测试描述输入
      fireEvent.change(descriptionInput, { target: { value: '专注编程和开发工作' } })
      expect((descriptionInput as HTMLTextAreaElement).value).toBe('专注编程和开发工作')
      
      // 验证字符计数显示
      expect(screen.getByText('专注编程和开发工作'.length + '/200')).toBeInTheDocument()
    })
    
    test('成功创建情境的完整流程', async () => {
      // Mock 创建成功
      mockCreateSacredContext.mockResolvedValueOnce({
        id: 'new-context-id',
        name: '测试情境',
        description: '测试描述'
      })
      
      render(<CreateContextPage onBack={mockOnBack} />)
      
      // 填写表单
      const nameInput = screen.getByLabelText('情境名称')
      fireEvent.change(nameInput, { target: { value: '测试情境' } })
      
      const descriptionInput = screen.getByLabelText('情境描述 (可选)')
      fireEvent.change(descriptionInput, { target: { value: '测试描述' } })
      
      // 点击创建按钮
      const createButton = screen.getByText('创建情境')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        // 验证调用了创建方法，并传递了正确的数据结构
        expect(mockCreateSacredContext).toHaveBeenCalledWith({
          name: '测试情境',
          description: '测试描述',
          icon: 'BrainCircuit', // 默认图标
          color: '#6366F1',    // 默认颜色
          rules: {
            items: [],
            defaultDuration: 45,
            triggerAction: undefined,
            presetTime: '15分钟'
          },
          environment: {
            strictMode: true
          }
        })
      })
      
      await waitFor(() => {
        // 验证显示成功提示
        expect(mockToast.success).toHaveBeenCalledWith('情境创建成功')
      })
      
      // 验证延迟后调用返回函数
      await waitFor(() => {
        expect(mockOnBack).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
    
    test('表单验证 - 空名称时显示错误', async () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      // 不填写名称，直接点击创建
      const createButton = screen.getByText('创建情境')
      fireEvent.click(createButton)
      
      // 验证显示错误提示
      expect(mockToast.error).toHaveBeenCalledWith('情境名称不能为空')
      expect(mockCreateSacredContext).not.toHaveBeenCalled()
    })
    
    test('表单验证 - 名称长度限制', async () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      const nameInput = screen.getByLabelText('情境名称')
      // 输入超过50字符的名称
      const longName = 'a'.repeat(51)
      fireEvent.change(nameInput, { target: { value: longName } })
      
      const createButton = screen.getByText('创建情境')
      fireEvent.click(createButton)
      
      // 验证长度限制错误
      expect(mockToast.error).toHaveBeenCalledWith('情境名称不能超过50个字符')
    })
    
    test('表单验证 - 描述长度限制', async () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      const nameInput = screen.getByLabelText('情境名称')
      fireEvent.change(nameInput, { target: { value: '有效名称' } })
      
      const descriptionInput = screen.getByLabelText('情境描述 (可选)')
      // 输入超过200字符的描述
      const longDescription = 'a'.repeat(201)
      fireEvent.change(descriptionInput, { target: { value: longDescription } })
      
      const createButton = screen.getByText('创建情境')
      fireEvent.click(createButton)
      
      // 验证描述长度限制错误
      expect(mockToast.error).toHaveBeenCalledWith('情境描述不能超过200个字符')
    })
    
    test('创建失败时的错误处理', async () => {
      // Mock 创建失败
      const error = new Error('数据库连接失败')
      mockCreateSacredContext.mockRejectedValueOnce(error)
      
      render(<CreateContextPage onBack={mockOnBack} />)
      
      // 填写有效表单
      const nameInput = screen.getByLabelText('情境名称')
      fireEvent.change(nameInput, { target: { value: '测试情境' } })
      
      const createButton = screen.getByText('创建情境')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        // 验证显示错误提示
        expect(mockToast.error).toHaveBeenCalledWith('情境创建失败: 数据库连接失败')
      })
      
      // 验证不会调用返回函数
      expect(mockOnBack).not.toHaveBeenCalled()
    })
  })
  
  describe('编辑模式', () => {
    test('编辑模式正确渲染页面元素', () => {
      render(
        <CreateContextPage 
          onBack={mockOnBack} 
          isEditing={true} 
          contextId="test-context-id" 
        />
      )
      
      // 验证编辑模式的标题
      expect(screen.getByText('编辑情境')).toBeInTheDocument()
      expect(screen.getByText('修改你的神圣情境配置和规则。')).toBeInTheDocument()
      expect(screen.getByText('保存修改')).toBeInTheDocument()
    })
    
    test('编辑模式加载现有数据', async () => {
      render(
        <CreateContextPage 
          onBack={mockOnBack} 
          isEditing={true} 
          contextId="existing-context" 
        />
      )
      
      // 验证表单预填充了现有数据（这里使用 Mock 数据）
      await waitFor(() => {
        const nameInput = screen.getByLabelText('情境名称')
        expect((nameInput as HTMLInputElement).value).toBe('深度工作')
      })
      
      const descriptionInput = screen.getByLabelText('情境描述 (可选)')
      expect((descriptionInput as HTMLTextAreaElement).value).toBe('需要高度专注的工作任务，如编程、写作、研究等')
    })
    
    test('成功更新情境的完整流程', async () => {
      // Mock 更新成功
      mockUpdateSacredContext.mockResolvedValueOnce({
        id: 'existing-context',
        name: '更新后的情境',
        description: '更新后的描述'
      })
      
      render(
        <CreateContextPage 
          onBack={mockOnBack} 
          isEditing={true} 
          contextId="existing-context" 
        />
      )
      
      // 等待数据加载
      await waitFor(() => {
        expect(screen.getByDisplayValue('深度工作')).toBeInTheDocument()
      })
      
      // 修改名称
      const nameInput = screen.getByLabelText('情境名称')
      fireEvent.change(nameInput, { target: { value: '更新后的情境' } })
      
      // 点击保存
      const saveButton = screen.getByText('保存修改')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        // 验证调用了更新方法
        expect(mockUpdateSacredContext).toHaveBeenCalledWith('existing-context', expect.objectContaining({
          name: '更新后的情境'
        }))
      })
      
      await waitFor(() => {
        // 验证显示成功提示
        expect(mockToast.success).toHaveBeenCalledWith('情境修改成功')
      })
    })
  })
  
  describe('用户交互', () => {
    test('图标选择功能', () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      // 查找所有图标按钮（应该有6个预定义图标）
      const iconButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && !button.textContent?.includes('取消') && !button.textContent?.includes('创建')
      )
      
      expect(iconButtons).toHaveLength(6) // 6个图标选项
      
      // 点击第二个图标
      fireEvent.click(iconButtons[1])
      
      // 验证图标选择状态变化（通过样式或其他可观察的变化）
      // 这里需要根据实际实现调整验证方式
    })
    
    test('颜色选择功能', () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      // 查找颜色选择按钮
      const colorButtons = screen.getAllByRole('button').filter(button =>
        button.style.backgroundColor && !button.textContent
      )
      
      expect(colorButtons.length).toBeGreaterThan(0)
      
      // 测试颜色选择
      if (colorButtons.length > 1) {
        fireEvent.click(colorButtons[1])
        // 验证颜色选择效果
      }
    })
    
    test('取消按钮功能', () => {
      render(<CreateContextPage onBack={mockOnBack} />)
      
      const cancelButton = screen.getByText('取消')
      fireEvent.click(cancelButton)
      
      // 验证调用了返回函数
      expect(mockOnBack).toHaveBeenCalled()
    })
    
    test('提交过程中的按钮状态', async () => {
      // Mock 一个缓慢的创建过程
      mockCreateSacredContext.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 'test' }), 100))
      )
      
      render(<CreateContextPage onBack={mockOnBack} />)
      
      // 填写表单
      const nameInput = screen.getByLabelText('情境名称')
      fireEvent.change(nameInput, { target: { value: '测试情境' } })
      
      const createButton = screen.getByText('创建情境')
      fireEvent.click(createButton)
      
      // 验证按钮在提交过程中的状态变化
      await waitFor(() => {
        expect(screen.getByText('创建中...')).toBeInTheDocument()
      })
      
      // 验证按钮被禁用
      expect(screen.getByText('创建中...')).toBeDisabled()
      expect(screen.getByText('取消')).toBeDisabled()
    })
  })
})
