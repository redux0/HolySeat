/**
 * ChainService - CTDP链管理核心业务逻辑
 * 基于设计文档v2.0，实现主链和辅助链的完整生命周期管理
 */

import { PrismaClient, ChainStatus, LogType, AuxChainStatus } from '@prisma/client'
import type {
  ContextWithActiveChain,
  ContextWithAllChains,
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
   * 获取单个情境及其所有链信息（包括已断裂的）
   * 用于情境管理页面展示
   */
  async getContextWithAllChains(contextId: string): Promise<ContextWithAllChains | null> {
    try {
      const context = await this.prisma.sacredContext.findUnique({
        where: { id: contextId },
        include: {
          chains: {
            orderBy: { createdAt: 'desc' },
            include: {
              logs: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { tags: true }
              }
            }
          }
        }
      })

      if (!context) return null

      // 为每个链添加状态标识
      const chainsWithStatus = context.chains.map(chain => ({
        ...chain,
        status: chain.status === ChainStatus.ACTIVE ? 'ACTIVE' : 'BROKEN'
      }))

      return {
        ...context,
        activeChain: context.chains.find(chain => chain.status === ChainStatus.ACTIVE) || undefined,
        allChains: context.chains
      }
    } catch (error) {
      console.error('获取情境所有链信息失败:', error)
      throw new Error('Failed to fetch context with all chains')
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

        // 3. 为新创建的主链自动创建对应的辅助链（如果配置了默认设置）
        await this.createDefaultAuxiliaryChain(contextId)
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
            status: 'completed',
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
   * 为主链创建默认辅助链
   */
  private async createDefaultAuxiliaryChain(contextId: string): Promise<void> {
    try {
      // 获取情境的规则配置
      const context = await this.prisma.sacredContext.findUnique({
        where: { id: contextId },
        select: { rules: true, name: true }
      });

      if (!context) {
        console.warn('情境不存在，跳过创建默认辅助链');
        return;
      }

      // 从规则中提取默认设置
      let defaultDelayMinutes = 15;
      let defaultTriggerAction = '打响指';
      
      if (context.rules && typeof context.rules === 'object') {
        const rules = context.rules as any;
        if (rules.presetTime) {
          defaultDelayMinutes = rules.presetTime;
        }
        if (rules.triggerAction) {
          defaultTriggerAction = rules.triggerAction;
        }
      }

      // 检查是否已经有待处理的辅助链
      const existingAuxChain = await this.prisma.auxiliaryChain.findFirst({
        where: {
          targetContextId: contextId,
          status: AuxChainStatus.PENDING
        }
      });

      // 如果没有现有的辅助链，创建一个默认的
      if (!existingAuxChain) {
        const deadline = new Date(Date.now() + defaultDelayMinutes * 60 * 1000);
        
        await this.prisma.auxiliaryChain.create({
          data: {
            targetContextId: contextId,
            delayMinutes: defaultDelayMinutes,
            deadline,
            description: `${context.name || '未知情境'}的默认预约设置`,
            reminder: true,
            status: AuxChainStatus.PENDING
          }
        });

        console.log(`✅ 为情境 ${context.name} 创建了默认辅助链`);
      }
    } catch (error) {
      console.error('创建默认辅助链失败:', error);
      // 不抛出错误，避免影响主链创建
    }
  }

  /**
   * 获取指定情境的最近辅助链信息（用于预约对话框默认值）
   */
  async getContextAuxiliaryInfo(contextId: string) {
    try {
      // 获取该情境最近一次的辅助链设置
      const recentAuxChain = await this.prisma.auxiliaryChain.findFirst({
        where: { targetContextId: contextId },
        orderBy: { createdAt: 'desc' },
        select: {
          delayMinutes: true,
          description: true,
          reminder: true
        }
      });

      // 获取情境的默认规则设置
      const context = await this.prisma.sacredContext.findUnique({
        where: { id: contextId },
        select: { rules: true }
      });

      let defaultDelayMinutes = 15;
      let defaultTriggerAction = '打响指';

      // 从情境规则中提取默认值
      if (context?.rules && typeof context.rules === 'object') {
        const rules = context.rules as any;
        if (rules.presetTime) {
          defaultDelayMinutes = rules.presetTime;
        }
        if (rules.triggerAction) {
          defaultTriggerAction = rules.triggerAction;
        }
      }

      return {
        delayMinutes: recentAuxChain?.delayMinutes ?? defaultDelayMinutes,
        description: recentAuxChain?.description ?? '',
        reminder: recentAuxChain?.reminder ?? true,
        triggerAction: defaultTriggerAction
      };
    } catch (error) {
      console.error('获取情境辅助链信息失败:', error);
      return {
        delayMinutes: 15,
        description: '',
        reminder: true,
        triggerAction: '打响指'
      };
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

      // 为辅助链创建启动日志
      const targetContext = await this.prisma.sacredContext.findUnique({
        where: { id: request.targetContextId },
        select: { name: true }
      });

      // 查找或创建该情境的活跃主链
      let activeChain = await this.prisma.cTDPChain.findFirst({
        where: {
          contextId: request.targetContextId,
          status: ChainStatus.ACTIVE
        }
      });

      if (!activeChain) {
        activeChain = await this.prisma.cTDPChain.create({
          data: {
            contextId: request.targetContextId,
            counter: 0,
            status: ChainStatus.ACTIVE
          }
        });
      }

      // 创建辅助链启动日志
      await this.prisma.cTDPLog.create({
        data: {
          type: LogType.CREATED,
          title: `预约启动: ${targetContext?.name || '未知情境'}`,
          message: `创建预约任务，将在 ${delayMinutes} 分钟后启动。${request.description ? `描述: ${request.description}` : ''}`,
          chainId: activeChain.id,
          metadata: {
            auxiliaryChainId: auxiliaryChain.id,
            delayMinutes,
            deadline: deadline.toISOString(),
            description: request.description
          }
        }
      });

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
   * 完成辅助链（到期时自动触发）
   */
  async fulfillAuxiliaryTask(auxiliaryId: string): Promise<boolean> {
    try {
      const auxiliaryChain = await this.prisma.auxiliaryChain.findUnique({
        where: { id: auxiliaryId },
        include: {
          targetContext: { select: { name: true } }
        }
      });

      if (!auxiliaryChain) {
        console.error('辅助链不存在');
        return false;
      }

      if (auxiliaryChain.status !== AuxChainStatus.PENDING) {
        console.error('辅助链状态不正确');
        return false;
      }

      // 更新辅助链状态
      await this.prisma.auxiliaryChain.update({
        where: { id: auxiliaryId },
        data: { 
          status: AuxChainStatus.FULFILLED,
          fulfilledAt: new Date()
        }
      });

      // 查找对应的主链
      const activeChain = await this.prisma.cTDPChain.findFirst({
        where: {
          contextId: auxiliaryChain.targetContextId,
          status: ChainStatus.ACTIVE
        }
      });

      if (activeChain) {
        // 创建辅助链完成日志
        await this.prisma.cTDPLog.create({
          data: {
            type: LogType.SUCCESS,
            title: `预约完成: ${auxiliaryChain.targetContext?.name || '未知情境'}`,
            message: `预约任务已到期完成。${auxiliaryChain.description ? `描述: ${auxiliaryChain.description}` : ''}`,
            chainId: activeChain.id,
            metadata: {
              auxiliaryChainId: auxiliaryId,
              description: auxiliaryChain.description,
              originalDelay: auxiliaryChain.delayMinutes
            }
          }
        });

        // 增加主链计数器（完成预约相当于完成一个任务）
        await this.prisma.cTDPChain.update({
          where: { id: activeChain.id },
          data: { counter: activeChain.counter + 1 }
        });
      }

      return true;
    } catch (error) {
      console.error('履行辅助链失败:', error);
      return false;
    }
  }

  /**
   * 取消辅助链（用户主动取消或其他原因）
   */
  async cancelAuxiliaryTask(auxiliaryId: string, reason?: string): Promise<boolean> {
    try {
      const auxiliaryChain = await this.prisma.auxiliaryChain.findUnique({
        where: { id: auxiliaryId },
        include: {
          targetContext: { select: { name: true } }
        }
      });

      if (!auxiliaryChain) {
        console.error('辅助链不存在');
        return false;
      }

      if (auxiliaryChain.status !== AuxChainStatus.PENDING) {
        console.error('只能取消待处理的辅助链');
        return false;
      }

      // 更新辅助链状态
      await this.prisma.auxiliaryChain.update({
        where: { id: auxiliaryId },
        data: { 
          status: AuxChainStatus.CANCELLED
        }
      });

      // 查找对应的主链
      const activeChain = await this.prisma.cTDPChain.findFirst({
        where: {
          contextId: auxiliaryChain.targetContextId,
          status: ChainStatus.ACTIVE
        }
      });

      if (activeChain) {
        // 创建辅助链取消日志
        await this.prisma.cTDPLog.create({
          data: {
            type: LogType.BROKEN,
            title: `预约取消: ${auxiliaryChain.targetContext?.name || '未知情境'}`,
            message: `预约任务已取消。${reason ? `原因: ${reason}` : ''}${auxiliaryChain.description ? ` 原描述: ${auxiliaryChain.description}` : ''}`,
            chainId: activeChain.id,
            metadata: {
              auxiliaryChainId: auxiliaryId,
              description: auxiliaryChain.description,
              originalDelay: auxiliaryChain.delayMinutes,
              cancelReason: reason
            }
          }
        });

        // 取消预约会中断主链
        await this.breakChain(activeChain.id, { 
          reason: `预约取消: ${reason || '用户取消'}`,
          metadata: { auxiliaryChainId: auxiliaryId }
        });
      }

      return true;
    } catch (error) {
      console.error('取消辅助链失败:', error);
      return false;
    }
  }

  /**
   * 辅助链任务失败（保留原有方法用于兼容）
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
   * 更新当前任务标题
   */
  async updateTaskTitle(chainId: string, title: string): Promise<void> {
    try {
      // 查找当前链的最新任务日志
      const latestLog = await this.prisma.cTDPLog.findFirst({
        where: {
          chainId,
          title: { not: null }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (latestLog) {
        // 更新最新日志的标题
        await this.prisma.cTDPLog.update({
          where: { id: latestLog.id },
          data: { 
            title,
            metadata: {
              ...latestLog.metadata as any,
              titleUpdatedAt: new Date().toISOString()
            }
          }
        })
      } else {
        // 如果没有任务日志，创建一个新的任务开始日志
        await this.prisma.cTDPLog.create({
          data: {
            chainId,
            type: LogType.SUCCESS,
            title,
            message: '任务标题已设置',
            metadata: {
              status: 'in_progress',
              startTime: new Date().toISOString()
            }
          }
        })
      }
    } catch (error) {
      console.error('更新任务标题失败:', error)
      throw new Error('Failed to update task title')
    }
  }

  /**
   * 更新情境的例外规则
   */
  async updateExceptionRules(contextId: string, exceptionRules: string[]): Promise<void> {
    try {
      // 获取当前情境
      const context = await this.prisma.sacredContext.findUnique({
        where: { id: contextId }
      })

      if (!context) {
        throw new Error('Context not found')
      }

      // 更新规则
      const currentRules = context.rules as any || {}
      const updatedRules = {
        ...currentRules,
        items: exceptionRules
      }

      await this.prisma.sacredContext.update({
        where: { id: contextId },
        data: { 
          rules: updatedRules,
          updatedAt: new Date()
        }
      })

      console.log('例外规则已更新:', { contextId, items: exceptionRules })
    } catch (error) {
      console.error('更新例外规则失败:', error)
      throw new Error('Failed to update exception rules')
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
