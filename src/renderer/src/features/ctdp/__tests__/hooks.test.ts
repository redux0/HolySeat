/**
 * CTDP Actions Hook 测试
 * 主要测试创建和修改情境链的核心功能
 */

import { renderHook, act } from '@testing-library/react'
import { useCTDPActions } from '../hooks'

// Mock IPC renderer
const mockInvoke = jest.fn()
const mockIpcRenderer = {
  invoke: mockInvoke,
  on: jest.fn(),
  once: jest.fn(),
  send: jest.fn()
}

// 设置全局 window.electron mock
beforeEach(() => {
  global.window.electron = {
    ipcRenderer: mockIpcRenderer
  }
  mockInvoke.mockClear()
})

describe('useCTDPActions - 情境链管理', () => {
  
  describe('createSacredContext', () => {
    test('成功创建新的神圣情境', async () => {
      // 准备测试数据 - 模拟用户创建深度工作情境
      const mockContextData = {
        name: '深度工作',
        description: '需要高度专注的工作任务',
        icon: 'BrainCircuit',
        color: '#6366F1',
        rules: {
          items: ['关闭所有社交软件', '手机静音并反面放置'],
          defaultDuration: 45,
          triggerAction: '打响指',
          presetTime: 15
        },
        environment: {
          strictMode: true
        }
      }
      
      const mockResponse = {
        id: 'context-123',
        ...mockContextData,
        createdAt: new Date().toISOString()
      }
      
      // Mock IPC 调用返回成功响应
      mockInvoke
        .mockResolvedValueOnce(mockResponse) // createSacredContext 调用
        .mockResolvedValueOnce([mockResponse]) // loadContextsWithChains 调用
      
      const { result } = renderHook(() => useCTDPActions())
      
      let createdContext
      await act(async () => {
        // 执行创建情境操作
        createdContext = await result.current.createSacredContext(mockContextData)
      })
      
      // 验证 IPC 调用 - 确保正确调用了创建情境的 IPC 方法
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:createSacredContext', mockContextData)
      // 验证创建后自动重新加载情境列表
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:getContextsWithActiveChains')
      // 验证返回结果包含预期的情境数据
      expect(createdContext).toEqual(mockResponse)
    })
    
    test('创建情境时处理错误情况', async () => {
      const mockContextData = {
        name: '',  // 无效数据 - 空名称
        description: '',
        icon: 'BrainCircuit',
        color: '#6366F1'
      }
      
      const mockError = new Error('情境名称不能为空')
      mockInvoke.mockRejectedValueOnce(mockError)
      
      const { result } = renderHook(() => useCTDPActions())
      
      // 验证错误处理 - 确保抛出的错误能被正确捕获
      await act(async () => {
        await expect(result.current.createSacredContext(mockContextData))
          .rejects.toThrow('情境名称不能为空')
      })
      
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:createSacredContext', mockContextData)
    })
    
    test('验证创建情境的数据结构完整性', async () => {
      const mockContextData = {
        name: '学习情境',
        description: '专用于学习和研究的情境',
        icon: 'BookOpen', 
        color: '#10B981',
        rules: {
          items: ['关闭娱乐应用', '准备学习材料'],
          defaultDuration: 60,
          triggerAction: '深呼吸三次',
          presetTime: 30
        },
        environment: {
          strictMode: false
        }
      }
      
      mockInvoke
        .mockResolvedValueOnce({ id: 'test-id', ...mockContextData })
        .mockResolvedValueOnce([])
      
      const { result } = renderHook(() => useCTDPActions())
      
      await act(async () => {
        await result.current.createSacredContext(mockContextData)
      })
      
      // 验证调用参数的数据结构 - 确保所有必需字段都正确传递
      const calledArgs = mockInvoke.mock.calls[0][1]
      expect(calledArgs).toHaveProperty('name', '学习情境')
      expect(calledArgs).toHaveProperty('description', '专用于学习和研究的情境')
      expect(calledArgs).toHaveProperty('icon', 'BookOpen')
      expect(calledArgs).toHaveProperty('color', '#10B981')
      expect(calledArgs.rules).toHaveProperty('items')
      expect(calledArgs.rules).toHaveProperty('defaultDuration', 60)
      expect(calledArgs.environment).toHaveProperty('strictMode', false)
    })
  })
  
  describe('updateSacredContext', () => {
    test('成功更新现有情境', async () => {
      const contextId = 'context-456'
      const updateData = {
        name: '深度工作 v2',
        description: '优化后的深度工作情境',
        icon: 'Zap',
        color: '#F59E0B',
        rules: {
          items: ['关闭所有通知', '使用番茄工作法', '保持桌面整洁'],
          defaultDuration: 50,
          triggerAction: '整理桌面',
          presetTime: 10
        }
      }
      
      const mockUpdatedContext = {
        id: contextId,
        ...updateData,
        updatedAt: new Date().toISOString()
      }
      
      // Mock 更新操作和重新加载
      mockInvoke
        .mockResolvedValueOnce(mockUpdatedContext)
        .mockResolvedValueOnce([mockUpdatedContext])
      
      const { result } = renderHook(() => useCTDPActions())
      
      let updatedContext
      await act(async () => {
        // 执行更新情境操作
        updatedContext = await result.current.updateSacredContext(contextId, updateData)
      })
      
      // 验证更新调用 - 确保传递了正确的ID和更新数据
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:updateSacredContext', contextId, updateData)
      // 验证更新后重新加载
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:getContextsWithActiveChains')
      // 验证更新结果
      expect(updatedContext).toEqual(mockUpdatedContext)
    })
    
    test('更新不存在的情境时处理错误', async () => {
      const nonExistentId = 'non-existent-id'
      const updateData = { name: '测试情境' }
      
      const mockError = new Error('情境不存在')
      mockInvoke.mockRejectedValueOnce(mockError)
      
      const { result } = renderHook(() => useCTDPActions())
      
      // 验证错误处理 - 确保不存在的情境ID会抛出相应错误
      await act(async () => {
        await expect(result.current.updateSacredContext(nonExistentId, updateData))
          .rejects.toThrow('情境不存在')
      })
    })
    
    test('部分更新情境数据', async () => {
      const contextId = 'context-789'
      // 只更新名称和颜色，其他字段保持不变
      const partialUpdateData = {
        name: '新的情境名称',
        color: '#EF4444'
      }
      
      mockInvoke
        .mockResolvedValueOnce({ id: contextId, ...partialUpdateData })
        .mockResolvedValueOnce([])
      
      const { result } = renderHook(() => useCTDPActions())
      
      await act(async () => {
        await result.current.updateSacredContext(contextId, partialUpdateData)
      })
      
      // 验证部分更新 - 确保只传递了需要更新的字段
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:updateSacredContext', contextId, partialUpdateData)
      
      const calledArgs = mockInvoke.mock.calls[0][2]
      expect(calledArgs).toHaveProperty('name', '新的情境名称')
      expect(calledArgs).toHaveProperty('color', '#EF4444')
      // 验证没有传递不需要更新的字段
      expect(calledArgs).not.toHaveProperty('description')
      expect(calledArgs).not.toHaveProperty('rules')
    })
  })
  
  describe('deleteSacredContext', () => {
    test('成功删除情境', async () => {
      const contextId = 'context-to-delete'
      
      // Mock 删除操作成功
      mockInvoke
        .mockResolvedValueOnce(true)  // deleteSacredContext 返回 true
        .mockResolvedValueOnce([])    // 重新加载后的空列表
      
      const { result } = renderHook(() => useCTDPActions())
      
      let deleteResult
      await act(async () => {
        // 执行删除操作
        deleteResult = await result.current.deleteSacredContext(contextId)
      })
      
      // 验证删除调用
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:deleteSacredContext', contextId)
      // 验证删除后重新加载
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:getContextsWithActiveChains')
      // 验证删除成功
      expect(deleteResult).toBe(true)
    })
    
    test('删除操作失败时的错误处理', async () => {
      const contextId = 'protected-context'
      const mockError = new Error('无法删除正在使用的情境')
      
      mockInvoke.mockRejectedValueOnce(mockError)
      
      const { result } = renderHook(() => useCTDPActions())
      
      // 验证删除失败的错误处理
      await act(async () => {
        await expect(result.current.deleteSacredContext(contextId))
          .rejects.toThrow('无法删除正在使用的情境')
      })
    })
  })
  
  describe('边界情况和集成测试', () => {
    test('IPC渲染器不可用时的降级处理', async () => {
      // 模拟 IPC 不可用的情况
      global.window.electron = undefined as any
      
      const { result } = renderHook(() => useCTDPActions())
      
      // 验证在没有 IPC 的情况下方法返回 null 而不是抛出错误
      const createResult = await result.current.createSacredContext({ name: 'test' })
      expect(createResult).toBe(null)
      
      const updateResult = await result.current.updateSacredContext('id', { name: 'test' })  
      expect(updateResult).toBe(null)
      
      const deleteResult = await result.current.deleteSacredContext('id')
      expect(deleteResult).toBe(false)
    })
    
    test('连续操作的状态一致性', async () => {
      // 测试创建后立即更新的场景
      const mockContext = {
        id: 'test-context',
        name: '测试情境',
        description: '测试描述'
      }
      
      // Mock 创建、更新、重新加载的一系列调用
      mockInvoke
        .mockResolvedValueOnce(mockContext)                    // create
        .mockResolvedValueOnce([mockContext])                  // reload after create
        .mockResolvedValueOnce({ ...mockContext, name: '更新后的名称' }) // update
        .mockResolvedValueOnce([{ ...mockContext, name: '更新后的名称' }]) // reload after update
      
      const { result } = renderHook(() => useCTDPActions())
      
      await act(async () => {
        // 连续执行创建和更新操作
        await result.current.createSacredContext(mockContext)
        await result.current.updateSacredContext(mockContext.id, { name: '更新后的名称' })
      })
      
      // 验证所有调用都按预期执行
      expect(mockInvoke).toHaveBeenCalledTimes(4)
      expect(mockInvoke).toHaveBeenNthCalledWith(1, 'ctdp:createSacredContext', mockContext)
      expect(mockInvoke).toHaveBeenNthCalledWith(2, 'ctdp:getContextsWithActiveChains')
      expect(mockInvoke).toHaveBeenNthCalledWith(3, 'ctdp:updateSacredContext', mockContext.id, { name: '更新后的名称' })
      expect(mockInvoke).toHaveBeenNthCalledWith(4, 'ctdp:getContextsWithActiveChains')
    })
  })
})
