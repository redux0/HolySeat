/**
 * CTDP Actions Hook - 渲染进程业务逻辑钩子
 * 封装对主进程IPC调用的操作
 */

import { useAtom, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { 
  contextsWithChainsAtom,
  contextsLoadingAtom,
  contextsErrorAtom,
  activeSessionAtom,
  chainStatisticsAtom,
  contextStatisticsAtom,
  tagsAtom,
  settingsAtom,
  scheduleStateAtom,
  scheduleModalAtom
} from './atoms'

// IPC调用封装
const ipcRenderer = window.electron?.ipcRenderer

export function useCTDPActions() {
  const [contexts, setContexts] = useAtom(contextsWithChainsAtom)
  const [loading, setLoading] = useAtom(contextsLoadingAtom)
  const [error, setError] = useAtom(contextsErrorAtom)
  const setActiveSession = useSetAtom(activeSessionAtom)
  const setChainStatistics = useSetAtom(chainStatisticsAtom)
  const setContextStatistics = useSetAtom(contextStatisticsAtom)
  const setTags = useSetAtom(tagsAtom)
  const setSettings = useSetAtom(settingsAtom)
  const [scheduleState, setScheduleState] = useAtom(scheduleStateAtom)
  const setScheduleModal = useSetAtom(scheduleModalAtom)

  // ============= 情境管理 =============

  /**
   * 加载所有情境及其活跃链
   */
  const loadContextsWithChains = async () => {
    if (!ipcRenderer) {
      console.error('IPC Renderer not available')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const result = await ipcRenderer.invoke('ctdp:getContextsWithActiveChains')
      console.log('📊 加载情境数据:', result)
      
      setContexts(result)
    } catch (err) {
      console.error('加载情境失败:', err)
      setError(err instanceof Error ? err.message : '加载情境失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取单个情境及其所有链信息
   */
  const getContextWithAllChains = useCallback(async (contextId: string) => {
    if (!ipcRenderer) {
      console.error('IPC Renderer not available')
      return null
    }

    try {
      const result = await ipcRenderer.invoke('ctdp:getContextWithAllChains', contextId)
      console.log('📊 加载情境所有链数据:', result)
      return result
    } catch (err) {
      console.error('获取情境所有链信息失败:', err)
      throw err
    }
  }, [ipcRenderer])

  /**
   * 创建新的神圣情境
   */
  const createSacredContext = async (contextData: {
    name: string
    description?: string
    icon?: string
    color?: string
    rules?: any
    environment?: any
  }) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:createSacredContext', contextData)
      console.log('✅ 创建情境成功:', result)
      
      // 重新加载情境列表
      await loadContextsWithChains()
      
      return result
    } catch (err) {
      console.error('创建情境失败:', err)
      throw err
    }
  }

  /**
   * 更新神圣情境
   */
  const updateSacredContext = async (contextId: string, contextData: any) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:updateSacredContext', contextId, contextData)
      console.log('✅ 更新情境成功:', result)
      
      // 重新加载情境列表
      await loadContextsWithChains()
      
      return result
    } catch (err) {
      console.error('更新情境失败:', err)
      throw err
    }
  }

  /**
   * 删除神圣情境
   */
  const deleteSacredContext = async (contextId: string) => {
    if (!ipcRenderer) return false

    try {
      await ipcRenderer.invoke('ctdp:deleteSacredContext', contextId)
      console.log('✅ 删除情境成功')
      
      // 重新加载情境列表
      await loadContextsWithChains()
      
      return true
    } catch (err) {
      console.error('删除情境失败:', err)
      throw err
    }
  }

  // ============= 会话管理 =============

  /**
   * 启动专注会话
   */
  const startSession = async (
    contextId: string, 
    taskInfo?: { title?: string, tags?: string[], expectedDuration?: number }
  ) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:startOrContinueChain', contextId, taskInfo)
      console.log('🎯 启动会话:', result)
      
      // 创建活跃会话状态
      const context = contexts?.find(c => c.id === contextId)
      if (context && result.chain) {
        const session = {
          contextId,
          contextName: context.name,
          chainId: result.chain.id,
          chainCounter: result.chain.counter,
          startTime: new Date(),
          expectedEndTime: taskInfo?.expectedDuration 
            ? new Date(Date.now() + taskInfo.expectedDuration * 1000)
            : undefined,
          taskTitle: taskInfo?.title,
          tags: [] // 从taskInfo.tags获取完整Tag对象
        }
        setActiveSession(session)
      }
      
      // 重新加载情境列表以更新链状态
      await loadContextsWithChains()
      
      return result
    } catch (err) {
      console.error('启动会话失败:', err)
      throw err
    }
  }

  /**
   * 完成专注会话
   */
  const completeSession = async (sessionData: {
    chainId: string
    duration: number
    title?: string
    tags?: string[]
  }) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:incrementChain', sessionData.chainId, {
        duration: sessionData.duration,
        title: sessionData.title,
        tags: sessionData.tags
      })
      console.log('✅ 完成会话:', result)
      
      // 清除活跃会话
      setActiveSession(null)
      
      // 重新加载数据
      await loadContextsWithChains()
      await loadStatistics()
      
      return result
    } catch (err) {
      console.error('完成会话失败:', err)
      throw err
    }
  }

  /**
   * 断裂链（任务失败）
   */
  const breakSession = async (params: {
    chainId: string
    reason: string
    metadata?: any
  }) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:breakChain', params.chainId, {
        reason: params.reason,
        metadata: params.metadata
      })
      console.log('💔 断裂链:', result)
      
      // 清除活跃会话
      setActiveSession(null)
      
      // 重新加载数据
      await loadContextsWithChains()
      await loadStatistics()
      
      return result
    } catch (err) {
      console.error('断裂链失败:', err)
      throw err
    }
  }

  /**
   * 更新任务标题
   */
  const updateTaskTitle = async (chainId: string, title: string) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:updateTaskTitle', chainId, title)
      console.log('✏️ 更新任务标题:', { chainId, title })
      
      return result
    } catch (err) {
      console.error('更新任务标题失败:', err)
      throw err
    }
  }

  /**
   * 更新例外规则
   */
  const updateExceptionRules = async (contextId: string, exceptionRules: string[]) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:updateExceptionRules', contextId, exceptionRules)
      console.log('📝 更新例外规则:', { contextId, exceptionRules })
      
      // 重新加载情境数据以更新本地状态
      await loadContextsWithChains()
      
      return result
    } catch (err) {
      console.error('更新例外规则失败:', err)
      throw err
    }
  }

  // ============= 辅助链管理 =============

  /**
   * 创建预约任务（辅助链）
   */
  const scheduleTask = async (request: {
    targetContextId: string
    delayMinutes?: number
    description?: string
    reminder?: boolean
  }) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:scheduleAuxiliaryTask', request)
      console.log('⏰ 创建预约:', result)
      return result
    } catch (err) {
      console.error('创建预约失败:', err)
      throw err
    }
  }

  /**
   * 获取待处理的预约任务
   */
  const getUpcomingTasks = async () => {
    if (!ipcRenderer) return []

    try {
      const result = await ipcRenderer.invoke('ctdp:getUpcomingAuxiliaryTasks')
      console.log('📅 待处理预约:', result)
      return result
    } catch (err) {
      console.error('获取预约失败:', err)
      return []
    }
  }

  /**
   * 履行预约任务
   */
  const fulfillTask = async (auxiliaryId: string) => {
    if (!ipcRenderer) return false

    try {
      const result = await ipcRenderer.invoke('ctdp:fulfillAuxiliaryTask', auxiliaryId)
      console.log('✅ 履行预约:', result)
      return result
    } catch (err) {
      console.error('履行预约失败:', err)
      return false
    }
  }

  /**
   * 预约任务失败
   */
  const failTask = async (auxiliaryId: string) => {
    if (!ipcRenderer) return false

    try {
      const result = await ipcRenderer.invoke('ctdp:failAuxiliaryTask', auxiliaryId)
      console.log('❌ 预约失败:', result)
      return result
    } catch (err) {
      console.error('预约失败更新失败:', err)
      return false
    }
  }

  // ============= 统计信息 =============

  /**
   * 加载统计信息
   */
  const loadStatistics = async () => {
    if (!ipcRenderer) return

    try {
      const [chainStats, contextStats] = await Promise.all([
        ipcRenderer.invoke('ctdp:getChainStatistics'),
        ipcRenderer.invoke('ctdp:getContextStatistics')
      ])
      
      console.log('📈 链统计:', chainStats)
      console.log('📊 情境统计:', contextStats)
      
      setChainStatistics(chainStats)
      setContextStatistics(contextStats)
    } catch (err) {
      console.error('加载统计信息失败:', err)
    }
  }

  // ============= 标签管理 =============

  /**
   * 加载所有标签
   */
  const loadTags = async () => {
    if (!ipcRenderer) return

    try {
      const result = await ipcRenderer.invoke('ctdp:getAllTags')
      console.log('🏷️ 加载标签:', result)
      setTags(result)
    } catch (err) {
      console.error('加载标签失败:', err)
    }
  }

  /**
   * 创建新标签
   */
  const createTag = async (tagData: { name: string, color?: string }) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:createTag', tagData)
      console.log('✅ 创建标签:', result)
      
      // 重新加载标签列表
      await loadTags()
      
      return result
    } catch (err) {
      console.error('创建标签失败:', err)
      throw err
    }
  }

  // ============= 系统设置 =============

  /**
   * 加载系统设置
   */
  const loadSettings = async () => {
    if (!ipcRenderer) return

    try {
      const result = await ipcRenderer.invoke('ctdp:getSettings')
      console.log('⚙️ 系统设置:', result)
      setSettings(result)
    } catch (err) {
      console.error('加载设置失败:', err)
    }
  }

  /**
   * 更新系统设置
   */
  const updateSettings = async (settings: any) => {
    if (!ipcRenderer) return null

    try {
      const result = await ipcRenderer.invoke('ctdp:updateSettings', settings)
      console.log('✅ 更新设置:', result)
      setSettings(result)
      return result
    } catch (err) {
      console.error('更新设置失败:', err)
      throw err
    }
  }

  // ============= 预约功能 =============

  /**
   * 开始预约倒计时
   */
  const startScheduleCountdown = (contextId: string, contextName: string, taskTitle: string, delayMinutes: number) => {
    const totalTime = delayMinutes * 60; // 转换为秒
    setScheduleState({
      isActive: true,
      contextId,
      contextName,
      taskTitle,
      remainingTime: totalTime,
      totalTime
    });
  };

  /**
   * 取消预约
   */
  const cancelSchedule = () => {
    setScheduleState(null);
  };

  /**
   * 打开预约模态框
   */
  const openScheduleModal = () => {
    setScheduleModal(true);
  };

  /**
   * 关闭预约模态框
   */
  const closeScheduleModal = () => {
    setScheduleModal(false);
  };

  // ============= 初始化 =============

  /**
   * 初始化所有数据
   */
  const initializeData = async () => {
    await Promise.all([
      loadContextsWithChains(),
      loadStatistics(),
      loadTags(),
      loadSettings()
    ])
  }

  // 返回所有操作方法和状态
  return {
    // 状态
    contexts,
    loading,
    error,
    
    // 情境管理
    loadContextsWithChains,
    getContextWithAllChains,
    createSacredContext,
    updateSacredContext,
    deleteSacredContext,
    
    // 会话管理
    startSession,
    completeSession,
    breakSession,
    updateTaskTitle,
    updateExceptionRules,
    
    // 辅助链管理
    scheduleTask,
    getUpcomingTasks,
    fulfillTask,
    failTask,
    
    // 统计信息
    loadStatistics,
    
    // 标签管理
    loadTags,
    createTag,
    
    // 系统设置
    loadSettings,
    updateSettings,
    
    // 预约功能
    scheduleState,
    startScheduleCountdown,
    cancelSchedule,
    openScheduleModal,
    closeScheduleModal,
    
    // 初始化
    initializeData
  }
}
