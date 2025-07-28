/**
 * CTDP Actions Hook 简化测试
 * 测试创建/修改链的基本逻辑功能
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'jotai'
import { useCTDPActions } from '../hooks'

// 使用全局setup.ts中定义的electron mock
const mockInvoke = (global.window.electron.ipcRenderer.invoke as jest.MockedFunction<any>)

// Jotai Provider wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(Provider, {}, children)
)

describe('useCTDPActions - 基本功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSacredContext', () => {
    test('成功创建情境', async () => {
      const contextData = {
        name: '测试情境',
        description: '测试描述',
        icon: 'TestIcon',
        color: '#FF0000'
      }

      // Mock IPC 成功响应
      mockInvoke
        .mockResolvedValueOnce({ id: '123', ...contextData }) // createSacredContext
        .mockResolvedValueOnce([]) // loadContextsWithChains

      const { result } = renderHook(() => useCTDPActions(), { wrapper })

      let createResult
      await act(async () => {
        createResult = await result.current.createSacredContext(contextData)
      })

      // 验证返回结果
      expect(createResult).toEqual({ id: '123', ...contextData })
      
      // 验证 IPC 调用
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:createSacredContext', contextData)
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:getContextsWithActiveChains')
    })

    test('IPC不可用时返回null', async () => {
      // 临时移除 electron 对象
      const originalElectron = global.window.electron
      delete (global.window as any).electron

      const { result } = renderHook(() => useCTDPActions(), { wrapper })

      const createResult = await result.current.createSacredContext({
        name: '测试'
      })

      expect(createResult).toBeUndefined()
      
      // 恢复 electron 对象
      global.window.electron = originalElectron
    })
  })

  describe('updateSacredContext', () => {
    test('成功更新情境', async () => {
      const contextId = 'context-123'
      const updateData = {
        name: '更新后的名称',
        color: '#00FF00'
      }

      // Mock IPC 成功响应
      mockInvoke
        .mockResolvedValueOnce({ id: contextId, ...updateData }) // updateSacredContext
        .mockResolvedValueOnce([]) // loadContextsWithChains

      const { result } = renderHook(() => useCTDPActions(), { wrapper })

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateSacredContext(contextId, updateData)
      })

      // 验证返回结果
      expect(updateResult).toEqual({ id: contextId, ...updateData })
      
      // 验证 IPC 调用
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:updateSacredContext', contextId, updateData)
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:getContextsWithActiveChains')
    })
  })

  describe('deleteSacredContext', () => {
    test('成功删除情境', async () => {
      const contextId = 'context-to-delete'

      // Mock IPC 成功响应
      mockInvoke
        .mockResolvedValueOnce(undefined) // deleteSacredContext
        .mockResolvedValueOnce([]) // loadContextsWithChains

      const { result } = renderHook(() => useCTDPActions(), { wrapper })

      let deleteResult
      await act(async () => {
        deleteResult = await result.current.deleteSacredContext(contextId)
      })

      // 验证返回结果
      expect(deleteResult).toBe(true)
      
      // 验证 IPC 调用
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:deleteSacredContext', contextId)
      expect(mockInvoke).toHaveBeenCalledWith('ctdp:getContextsWithActiveChains')
    })
  })
})
