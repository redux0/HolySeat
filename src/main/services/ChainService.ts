/**
 * ChainService - CTDP链管理核心业务逻辑
 * 基于设计文档v2.0，实现主链和辅助链的完整生命周期管理
 */

import { PrismaClient, ChainStatus, LogType, AuxChainStatus } from '@prisma/client'
import type {
  ContextWithActiveChain,
  ChainWithLogs,
  ActiveSession,
  StartSessionRequest,
  CompleteSessionRequest,
  BreakChainRequest,
  CreateAuxiliaryChainRequest,
  ChainStatistics,
  ContextStatistics
} from '../../types/ctdp'

export class ChainService {
  constructor(private prisma: PrismaClient) {}

  /**
   * 获取所有情境及其当前活跃链信息
   * 用于启动中心UI展示
   */
  async getContextsWithActiveChains(): Promise<ContextWithActiveChain[]> {
    try {
      const contexts = await this.prisma.sacredContext.findMany({
        include: {
          chains: {
            where: { status: ChainStatus.ACTIVE },
            include: {
              logs: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { tags: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      return contexts.map(context => ({
        ...context,
        activeChain: context.chains[0] || undefined
      }))
    } catch (error) {
      console.error('获取情境列表失败:', error)
      throw new Error('Failed to fetch contexts with active chains')
    }
  }

  /**
   * 启动或继续链 - 核心入口函数
   * 当用户启动一个情境时调用
   */
  async startOrContinueChain(
    contextId: string, 
    taskInfo?: { title?: string, tags?: string[] }
  ): Promise<{ chain: ChainWithLogs, isNewChain: boolean }> {
    try {
      // 1. 查找该contextId下是否有ACTIVE的链
      let activeChain = await this.prisma.cTDPChain.findFirst({
        where: {
          contextId,
          status: ChainStatus.ACTIVE
        },
        include: {
          context: true,
          logs: {
            include: { tags: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      let isNewChain = false

      // 2. 如果没有活跃链，创建新链
      if (!activeChain) {
        isNewChain = true
        activeChain = await this.prisma.cTDPChain.create({
          data: {
            contextId,
            counter: 0,
            status: ChainStatus.ACTIVE,
            logs: {
              create: {
                type: LogType.CREATED,
                message: '新链创建',
                metadata: {
                  taskInfo,
                  timestamp: new Date().toISOString()
                }
              }
            }
          },
          include: {
            context: true,
            logs: {
              include: { tags: true },
              orderBy: { createdAt: 'desc' }
            }
          }
        })
      }

      // 3. 如果提供了任务信息，创建任务开始日志
      if (taskInfo?.title) {
        await this.prisma.cTDPLog.create({
          data: {
            chainId: activeChain.id,
            type: LogType.SUCCESS, // 暂时标记为成功，完成时更新
            title: taskInfo.title,
            metadata: {
              status: 'started',
              startTime: new Date().toISOString()
            },
            tags: taskInfo.tags ? {
              connect: taskInfo.tags.map(tagName => ({ name: tagName }))
            } : undefined
          }
        })
      }

      return { chain: activeChain, isNewChain }
    } catch (error) {
      console.error('启动链失败:', error)
      throw new Error('Failed to start or continue chain')
    }
  }

  /**
   * 增加链长度 - 成功完成任务
   */
  async incrementChain(
    chainId: string, 
    logData: { duration: number, title?: string, tags?: string[] }
  ): Promise<ChainWithLogs> {
    try {
      // 更新链计数器和统计信息
      const updatedChain = await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: {
          counter: { increment: 1 },
          totalDuration: { increment: logData.duration },
          longestSession: {
            set: Math.max(
              await this.prisma.cTDPChain
                .findUnique({ where: { id: chainId } })
                .then(chain => chain?.longestSession || 0),
              logData.duration
            )
          },
          updatedAt: new Date()
        },
        include: {
          context: true,
          logs: {
            include: { tags: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      // 创建成功日志
      await this.prisma.cTDPLog.create({
        data: {
          chainId,
          type: LogType.SUCCESS,
          title: logData.title,
          duration: logData.duration,
          message: `任务完成，链长度增加至 #${updatedChain.counter}`,
          metadata: {
            previousCounter: updatedChain.counter - 1,
            newCounter: updatedChain.counter,
            completedAt: new Date().toISOString()
          },
          tags: logData.tags ? {
            connectOrCreate: logData.tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          } : undefined
        }
      })

      // 更新平均时长
      await this.updateChainAverageDuration(chainId)

      return updatedChain
    } catch (error) {
      console.error('增加链长度失败:', error)
      throw new Error('Failed to increment chain')
    }
  }

  /**
   * 断裂链 - 任务失败或放弃
   */
  async breakChain(
    chainId: string, 
    logData: { reason: string, metadata?: any }
  ): Promise<ChainWithLogs> {
    try {
      // 更新链状态为BROKEN
      const brokenChain = await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: {
          status: ChainStatus.BROKEN,
          brokenAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          context: true,
          logs: {
            include: { tags: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      // 创建断裂日志
      await this.prisma.cTDPLog.create({
        data: {
          chainId,
          type: LogType.BROKEN,
          message: logData.reason,
          metadata: {
            finalCounter: brokenChain.counter,
            brokenAt: new Date().toISOString(),
            ...logData.metadata
          }
        }
      })

      return brokenChain
    } catch (error) {
      console.error('断裂链失败:', error)
      throw new Error('Failed to break chain')
    }
  }

  /**
   * 归档链 - 软删除历史链
   */
  async archiveChain(chainId: string): Promise<boolean> {
    try {
      await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: {
          status: ChainStatus.ARCHIVED,
          updatedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('归档链失败:', error)
      return false
    }
  }

  /**
   * 创建辅助链（预约任务）
   */
  async scheduleAuxiliaryTask(
    request: CreateAuxiliaryChainRequest
  ): Promise<string> {
    try {
      const delayMinutes = request.delayMinutes || 15
      const deadline = new Date(Date.now() + delayMinutes * 60 * 1000)

      const auxiliaryChain = await this.prisma.auxiliaryChain.create({
        data: {
          targetContextId: request.targetContextId,
          delayMinutes,
          deadline,
          description: request.description,
          reminder: request.reminder ?? true,
          status: AuxChainStatus.PENDING
        }
      })

      return auxiliaryChain.id
    } catch (error) {
      console.error('创建辅助链失败:', error)
      throw new Error('Failed to schedule auxiliary task')
    }
  }

  /**
   * 获取待处理的辅助链
   */
  async getUpcomingAuxiliaryTasks() {
    try {
      return await this.prisma.auxiliaryChain.findMany({
        where: {
          status: AuxChainStatus.PENDING,
          deadline: { gte: new Date() }
        },
        include: {
          targetContext: true
        },
        orderBy: { deadline: 'asc' }
      })
    } catch (error) {
      console.error('获取辅助链失败:', error)
      throw new Error('Failed to get upcoming auxiliary tasks')
    }
  }

  /**
   * 履行辅助链任务
   */
  async fulfillAuxiliaryTask(auxiliaryId: string): Promise<boolean> {
    try {
      await this.prisma.auxiliaryChain.update({
        where: { id: auxiliaryId },
        data: {
          status: AuxChainStatus.FULFILLED,
          fulfilledAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('履行辅助链失败:', error)
      return false
    }
  }

  /**
   * 辅助链任务失败
   */
  async failAuxiliaryTask(auxiliaryId: string): Promise<boolean> {
    try {
      await this.prisma.auxiliaryChain.update({
        where: { id: auxiliaryId },
        data: {
          status: AuxChainStatus.FAILED,
          failedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('辅助链失败更新失败:', error)
      return false
    }
  }

  /**
   * 获取链统计信息
   */
  async getChainStatistics(): Promise<ChainStatistics> {
    try {
      const [totalChains, activeChains, brokenChains, chains] = await Promise.all([
        this.prisma.cTDPChain.count(),
        this.prisma.cTDPChain.count({ where: { status: ChainStatus.ACTIVE } }),
        this.prisma.cTDPChain.count({ where: { status: ChainStatus.BROKEN } }),
        this.prisma.cTDPChain.findMany({
          include: { logs: { where: { type: LogType.SUCCESS } } }
        })
      ])

      const longestChain = Math.max(...chains.map(c => c.counter), 0)
      const totalFocusTime = chains.reduce((sum, c) => sum + c.totalDuration, 0)
      const totalSessions = chains.reduce((sum, c) => sum + c.logs.length, 0)
      const averageSessionDuration = totalSessions > 0 ? totalFocusTime / totalSessions : 0

      // 计算今日会话数
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sessionsToday = await this.prisma.cTDPLog.count({
        where: {
          type: LogType.SUCCESS,
          createdAt: { gte: today }
        }
      })

      return {
        totalChains,
        activeChains,
        brokenChains,
        longestChain,
        totalFocusTime,
        averageSessionDuration,
        sessionsToday,
        currentStreak: this.calculateCurrentStreak(chains)
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
      throw new Error('Failed to get chain statistics')
    }
  }

  /**
   * 获取情境统计信息
   */
  async getContextStatistics(): Promise<ContextStatistics[]> {
    try {
      const contexts = await this.prisma.sacredContext.findMany({
        include: {
          chains: {
            include: {
              logs: { where: { type: LogType.SUCCESS } }
            }
          }
        }
      })

      return contexts.map(context => {
        const allLogs = context.chains.flatMap(c => c.logs)
        const totalSessions = allLogs.length
        const totalDuration = context.chains.reduce((sum, c) => sum + c.totalDuration, 0)
        const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0
        const longestChain = Math.max(...context.chains.map(c => c.counter), 0)
        const activeChain = context.chains.find(c => c.status === ChainStatus.ACTIVE)
        const currentChain = activeChain?.counter || 0
        
        const successfulChains = context.chains.filter(c => c.counter > 0).length
        const totalChains = context.chains.length
        const successRate = totalChains > 0 ? (successfulChains / totalChains) * 100 : 0

        const lastLog = allLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

        return {
          contextId: context.id,
          contextName: context.name,
          totalSessions,
          totalDuration,
          averageDuration,
          longestChain,
          currentChain,
          successRate,
          lastSessionDate: lastLog?.createdAt
        }
      })
    } catch (error) {
      console.error('获取情境统计失败:', error)
      throw new Error('Failed to get context statistics')
    }
  }

  /**
   * 私有方法：更新链的平均时长
   */
  private async updateChainAverageDuration(chainId: string): Promise<void> {
    const logs = await this.prisma.cTDPLog.findMany({
      where: {
        chainId,
        type: LogType.SUCCESS,
        duration: { not: null }
      }
    })

    if (logs.length > 0) {
      const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0)
      const averageDuration = Math.round(totalDuration / logs.length)

      await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: { averageDuration }
      })
    }
  }

  /**
   * 私有方法：计算当前连续成功天数
   */
  private calculateCurrentStreak(chains: any[]): number {
    // 简化实现，实际应该基于日期计算连续天数
    const activeChainsCount = chains.filter(c => c.status === ChainStatus.ACTIVE).length
    return activeChainsCount
  }
}
