/**
 * CTDP IPC Handlers - 主进程IPC通信处理
 * 处理渲染进程发来的CTDP相关请求
 */

import { ipcMain } from 'electron'
import { ChainService } from '../services/ChainService'
import { prisma } from '../database'

// 创建ChainService实例
const chainService = new ChainService(prisma)

/**
 * 注册所有CTDP相关的IPC处理器
 */
export function registerCTDPHandlers() {
  console.log('🔗 注册CTDP IPC处理器...')

  // 获取所有情境及其活跃链
  ipcMain.handle('ctdp:getContextsWithActiveChains', async () => {
    try {
      return await chainService.getContextsWithActiveChains()
    } catch (error) {
      console.error('IPC Error - getContextsWithActiveChains:', error)
      throw error
    }
  })

  // 启动或继续链
  ipcMain.handle('ctdp:startOrContinueChain', async (_, contextId: string, taskInfo?: any) => {
    try {
      return await chainService.startOrContinueChain(contextId, taskInfo)
    } catch (error) {
      console.error('IPC Error - startOrContinueChain:', error)
      throw error
    }
  })

  // 完成任务（增加链长度）
  ipcMain.handle('ctdp:incrementChain', async (_, chainId: string, logData: any) => {
    try {
      return await chainService.incrementChain(chainId, logData)
    } catch (error) {
      console.error('IPC Error - incrementChain:', error)
      throw error
    }
  })

  // 断裂链
  ipcMain.handle('ctdp:breakChain', async (_, chainId: string, logData: any) => {
    try {
      return await chainService.breakChain(chainId, logData)
    } catch (error) {
      console.error('IPC Error - breakChain:', error)
      throw error
    }
  })

  // 归档链
  ipcMain.handle('ctdp:archiveChain', async (_, chainId: string) => {
    try {
      return await chainService.archiveChain(chainId)
    } catch (error) {
      console.error('IPC Error - archiveChain:', error)
      throw error
    }
  })

  // 创建辅助链（预约任务）
  ipcMain.handle('ctdp:scheduleAuxiliaryTask', async (_, request: any) => {
    try {
      return await chainService.scheduleAuxiliaryTask(request)
    } catch (error) {
      console.error('IPC Error - scheduleAuxiliaryTask:', error)
      throw error
    }
  })

  // 获取待处理的辅助链
  ipcMain.handle('ctdp:getUpcomingAuxiliaryTasks', async () => {
    try {
      return await chainService.getUpcomingAuxiliaryTasks()
    } catch (error) {
      console.error('IPC Error - getUpcomingAuxiliaryTasks:', error)
      throw error
    }
  })

  // 履行辅助链任务
  ipcMain.handle('ctdp:fulfillAuxiliaryTask', async (_, auxiliaryId: string) => {
    try {
      return await chainService.fulfillAuxiliaryTask(auxiliaryId)
    } catch (error) {
      console.error('IPC Error - fulfillAuxiliaryTask:', error)
      throw error
    }
  })

  // 辅助链任务失败
  ipcMain.handle('ctdp:failAuxiliaryTask', async (_, auxiliaryId: string) => {
    try {
      return await chainService.failAuxiliaryTask(auxiliaryId)
    } catch (error) {
      console.error('IPC Error - failAuxiliaryTask:', error)
      throw error
    }
  })

  // 获取链统计信息
  ipcMain.handle('ctdp:getChainStatistics', async () => {
    try {
      return await chainService.getChainStatistics()
    } catch (error) {
      console.error('IPC Error - getChainStatistics:', error)
      throw error
    }
  })

  // 获取情境统计信息
  ipcMain.handle('ctdp:getContextStatistics', async () => {
    try {
      return await chainService.getContextStatistics()
    } catch (error) {
      console.error('IPC Error - getContextStatistics:', error)
      throw error
    }
  })

  // 创建新的神圣情境
  ipcMain.handle('ctdp:createSacredContext', async (_, contextData: any) => {
    try {
      return await prisma.sacredContext.create({
        data: {
          name: contextData.name,
          description: contextData.description,
          icon: contextData.icon,
          color: contextData.color,
          rules: contextData.rules || {},
          environment: contextData.environment || {}
        }
      })
    } catch (error) {
      console.error('IPC Error - createSacredContext:', error)
      throw error
    }
  })

  // 更新神圣情境
  ipcMain.handle('ctdp:updateSacredContext', async (_, contextId: string, contextData: any) => {
    try {
      return await prisma.sacredContext.update({
        where: { id: contextId },
        data: {
          name: contextData.name,
          description: contextData.description,
          icon: contextData.icon,
          color: contextData.color,
          rules: contextData.rules,
          environment: contextData.environment,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('IPC Error - updateSacredContext:', error)
      throw error
    }
  })

  // 删除神圣情境
  ipcMain.handle('ctdp:deleteSacredContext', async (_, contextId: string) => {
    try {
      // 软删除：先检查是否有活跃链
      const activeChains = await prisma.cTDPChain.findMany({
        where: {
          contextId,
          status: 'ACTIVE'
        }
      })

      if (activeChains.length > 0) {
        throw new Error('无法删除有活跃链的情境，请先完成或断裂所有活跃链')
      }

      // 删除情境（级联删除相关链和日志）
      return await prisma.sacredContext.delete({
        where: { id: contextId }
      })
    } catch (error) {
      console.error('IPC Error - deleteSacredContext:', error)
      throw error
    }
  })

  // 获取所有标签
  ipcMain.handle('ctdp:getAllTags', async () => {
    try {
      return await prisma.tag.findMany({
        orderBy: { name: 'asc' }
      })
    } catch (error) {
      console.error('IPC Error - getAllTags:', error)
      throw error
    }
  })

  // 创建新标签
  ipcMain.handle('ctdp:createTag', async (_, tagData: any) => {
    try {
      return await prisma.tag.create({
        data: {
          name: tagData.name,
          color: tagData.color
        }
      })
    } catch (error) {
      console.error('IPC Error - createTag:', error)
      throw error
    }
  })

  // 获取系统设置
  ipcMain.handle('ctdp:getSettings', async () => {
    try {
      return await prisma.cTDPSettings.findUnique({
        where: { id: 'default' }
      })
    } catch (error) {
      console.error('IPC Error - getSettings:', error)
      throw error
    }
  })

  // 更新系统设置
  ipcMain.handle('ctdp:updateSettings', async (_, settings: any) => {
    try {
      return await prisma.cTDPSettings.update({
        where: { id: 'default' },
        data: {
          ...settings,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('IPC Error - updateSettings:', error)
      throw error
    }
  })

  console.log('✅ CTDP IPC处理器注册完成')
}

/**
 * 清理IPC处理器
 */
export function unregisterCTDPHandlers() {
  const handlers = [
    'ctdp:getContextsWithActiveChains',
    'ctdp:startOrContinueChain',
    'ctdp:incrementChain',
    'ctdp:breakChain',
    'ctdp:archiveChain',
    'ctdp:scheduleAuxiliaryTask',
    'ctdp:getUpcomingAuxiliaryTasks',
    'ctdp:fulfillAuxiliaryTask',
    'ctdp:failAuxiliaryTask',
    'ctdp:getChainStatistics',
    'ctdp:getContextStatistics',
    'ctdp:createSacredContext',
    'ctdp:updateSacredContext',
    'ctdp:deleteSacredContext',
    'ctdp:getAllTags',
    'ctdp:createTag',
    'ctdp:getSettings',
    'ctdp:updateSettings'
  ]

  handlers.forEach(handler => {
    ipcMain.removeAllListeners(handler)
  })

  console.log('🔌 CTDP IPC处理器已清理')
}
