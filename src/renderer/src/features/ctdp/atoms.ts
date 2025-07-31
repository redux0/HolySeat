/**
 * CTDP状态管理 - Jotai Atoms
 * 管理CTDP链系统的全局状态
 */

import { atom } from 'jotai'
import type { 
  ContextWithActiveChain, 
  ActiveSession, 
  ChainStatistics,
  ContextStatistics,
  Tag,
  CTDPSettings 
} from '../../../../types/ctdp'

// ============= 核心状态 =============

/**
 * 所有情境及其活跃链状态
 * 用于启动中心展示
 */
export const contextsWithChainsAtom = atom<ContextWithActiveChain[] | null>(null)
export const contextsLoadingAtom = atom(false)
export const contextsErrorAtom = atom<string | null>(null)

/**
 * 当前活跃会话状态
 * 存储正在进行的专注会话信息
 */
export const activeSessionAtom = atom<ActiveSession | null>(null)

/**
 * 链统计信息
 */
export const chainStatisticsAtom = atom<ChainStatistics | null>(null)

/**
 * 情境统计信息
 */
export const contextStatisticsAtom = atom<ContextStatistics[]>([])

/**
 * 所有可用标签
 */
export const tagsAtom = atom<Tag[]>([])

/**
 * 系统设置
 */
export const settingsAtom = atom<CTDPSettings | null>(null)

// ============= 预约功能状态 =============

/**
 * 预约状态
 */
export interface ScheduleState {
  isActive: boolean
  contextId: string
  contextName: string
  taskTitle: string
  remainingTime: number // 剩余秒数
  totalTime: number // 总时间（秒）
  auxiliaryId?: string // 辅助链ID（用于取消）
}

export const scheduleStateAtom = atom<ScheduleState | null>(null)

/**
 * 预约模态框显示状态
 */
export const scheduleModalAtom = atom(false)

// ============= 派生状态 =============

/**
 * 活跃链总数（派生状态）
 */
export const activeChainsCountAtom = atom((get) => {
  const contexts = get(contextsWithChainsAtom)
  if (!contexts) return 0
  return contexts.filter(ctx => ctx.activeChain).length
})

/**
 * 当前最长链（派生状态）
 */
export const longestActiveChainAtom = atom((get) => {
  const contexts = get(contextsWithChainsAtom)
  if (!contexts) return 0
  
  const activeChains = contexts
    .filter(ctx => ctx.activeChain)
    .map(ctx => ctx.activeChain!.counter)
  
  return activeChains.length > 0 ? Math.max(...activeChains) : 0
})

/**
 * 今日总专注时长（派生状态）
 */
export const todayFocusTimeAtom = atom((get) => {
  const statistics = get(chainStatisticsAtom)
  return statistics?.totalFocusTime || 0
})

/**
 * 是否有活跃会话（派生状态）
 */
export const hasActiveSessionAtom = atom((get) => {
  const session = get(activeSessionAtom)
  return session !== null
})

/**
 * 是否有活跃预约（派生状态）
 */
export const hasActiveScheduleAtom = atom((get) => {
  const schedule = get(scheduleStateAtom)
  return schedule !== null && schedule.isActive
})

/**
 * 当前预约的contextId（派生状态）
 */
export const currentScheduleContextIdAtom = atom((get) => {
  const schedule = get(scheduleStateAtom)
  return schedule?.contextId || null
})

// ============= UI状态 =============

/**
 * 选中的情境ID（用于详情页面）
 */
export const selectedContextIdAtom = atom<string | null>(null)

/**
 * 是否显示创建情境对话框
 */
export const showCreateContextDialogAtom = atom(false)

/**
 * 是否显示链管理页面
 */
export const showChainManagementAtom = atom(false)

/**
 * 当前页面状态
 */
export type PageState = 'start' | 'chain-management' | 'statistics' | 'settings'
export const currentPageAtom = atom<PageState>('start')

/**
 * 加载状态集合
 */
export const loadingStatesAtom = atom({
  contexts: false,
  statistics: false,
  session: false,
  chains: false
})

// ============= 临时状态 =============

/**
 * 新建情境表单数据
 */
export interface CreateContextFormData {
  name: string
  description?: string
  icon?: string
  color?: string
  rules?: any
  environment?: any
}

export const createContextFormAtom = atom<CreateContextFormData>({
  name: '',
  description: '',
  icon: '🎯',
  color: '#3B82F6'
})

/**
 * 预约任务表单数据
 */
export interface ScheduleTaskFormData {
  contextId: string
  delayMinutes: number
  description?: string
  reminder: boolean
}

export const scheduleTaskFormAtom = atom<ScheduleTaskFormData>({
  contextId: '',
  delayMinutes: 15,
  description: '',
  reminder: true
})

// ============= 操作状态 =============

/**
 * 重置所有状态的操作
 */
export const resetAllStateAtom = atom(
  null,
  (get, set) => {
    set(contextsWithChainsAtom, null)
    set(activeSessionAtom, null)
    set(chainStatisticsAtom, null)
    set(contextStatisticsAtom, [])
    set(selectedContextIdAtom, null)
    set(showCreateContextDialogAtom, false)
    set(showChainManagementAtom, false)
    set(currentPageAtom, 'start')
    set(contextsLoadingAtom, false)
    set(contextsErrorAtom, null)
  }
)

/**
 * 清除错误状态
 */
export const clearErrorsAtom = atom(
  null,
  (get, set) => {
    set(contextsErrorAtom, null)
  }
)
