/**
 * CTDP数据库配置和连接管理
 * 用于主进程中的数据库连接
 */

import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import path from 'path'

// 数据库文件路径配置
const isDev = process.env.NODE_ENV === 'development'
const dbPath = isDev 
  ? path.join(process.cwd(), 'prisma', 'dev.db')
  : path.join(app.getPath('userData'), 'ctdp.db')

console.log(`📊 CTDP数据库路径: ${dbPath}`)

// 创建Prisma客户端实例
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  },
  log: isDev ? ['query', 'info', 'warn', 'error'] : ['error']
})

// 数据库连接初始化
export async function initDatabase() {
  try {
    console.log('🔌 初始化CTDP数据库连接...')
    
    // 测试连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    
    // 确保基础数据存在
    await ensureBasicData()
    
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

// 确保基础数据存在
async function ensureBasicData() {
  try {
    // 检查是否存在默认设置
    const settings = await prisma.cTDPSettings.findUnique({
      where: { id: 'default' }
    })
    
    if (!settings) {
      console.log('📝 创建默认设置...')
      await prisma.cTDPSettings.create({
        data: {
          id: 'default',
          defaultSessionDuration: 3600,
          defaultBreakDuration: 300,
          enableNotifications: true,
          enableSounds: true,
          strictRuleMode: false,
          allowRuleUpdates: true,
          theme: 'auto',
          language: 'zh-CN'
        }
      })
    }
    
    // 检查是否存在基础神圣情境
    const contextCount = await prisma.sacredContext.count()
    if (contextCount === 0) {
      console.log('🏛️ 创建默认神圣情境...')
      await createDefaultContexts()
    }
    
  } catch (error) {
    console.error('⚠️ 基础数据初始化失败:', error)
  }
}

// 创建默认神圣情境
async function createDefaultContexts() {
  const defaultContexts = [
    {
      id: 'deep-work',
      name: '深度工作',
      description: '需要高度专注的工作任务',
      icon: '🧠',
      color: '#3B82F6',
      rules: {
        minDuration: 3600,
        allowBreaks: false,
        distractionBlocking: true
      },
      environment: {
        notifications: false
      }
    },
    {
      id: 'study',
      name: '学习',
      description: '阅读、学习新知识',
      icon: '📚',
      color: '#10B981',
      rules: {
        minDuration: 1800,
        allowBreaks: true,
        breakDuration: 300
      },
      environment: {
        notifications: false
      }
    }
  ]
  
  for (const context of defaultContexts) {
    await prisma.sacredContext.create({
      data: context
    })
  }
}

// 关闭数据库连接
export async function closeDatabase() {
  try {
    await prisma.$disconnect()
    console.log('📊 数据库连接已关闭')
  } catch (error) {
    console.error('❌ 关闭数据库连接时出错:', error)
  }
}

// 导出默认实例
export default prisma
