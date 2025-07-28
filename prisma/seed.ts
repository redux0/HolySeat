import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 创建默认的神圣情境
  const deepWorkContext = await prisma.sacredContext.upsert({
    where: { id: 'deep-work' },
    update: {},
    create: {
      id: 'deep-work',
      name: '深度工作',
      description: '需要高度专注的工作任务，如编程、写作、研究等',
      icon: '🧠',
      color: '#3B82F6',
      rules: {
        minDuration: 3600, // 最少1小时
        allowBreaks: false,
        distractionBlocking: true
      },
      environment: {
        apps: {
          whitelist: ['VSCode', 'Chrome', 'Terminal'],
          blacklist: ['WeChat', 'QQ', '抖音', '小红书']
        },
        notifications: false
      }
    }
  })

  const studyContext = await prisma.sacredContext.upsert({
    where: { id: 'study' },
    update: {},
    create: {
      id: 'study',
      name: '学习',
      description: '阅读、学习新知识、完成课业',
      icon: '📚',
      color: '#10B981',
      rules: {
        minDuration: 1800, // 最少30分钟
        allowBreaks: true,
        breakDuration: 300 // 5分钟休息
      },
      environment: {
        apps: {
          whitelist: ['Browser', 'Notion', 'Anki', 'PDF Reader'],
          blacklist: ['Games', 'Social Media']
        },
        notifications: false
      }
    }
  })

  const fitnessContext = await prisma.sacredContext.upsert({
    where: { id: 'fitness' },
    update: {},
    create: {
      id: 'fitness',
      name: '健身运动',
      description: '体能训练、有氧运动、力量训练',
      icon: '💪',
      color: '#F59E0B',
      rules: {
        minDuration: 1800, // 最少30分钟
        allowBreaks: true,
        requireWarmup: true
      },
      environment: {
        apps: {
          whitelist: ['健身App', '音乐播放器'],
          blacklist: ['社交软件', '视频软件']
        },
        notifications: true // 允许健身提醒
      }
    }
  })

  // 创建一些常用标签
  const tags = [
    { name: '编程', color: '#3B82F6' },
    { name: '写作', color: '#10B981' },
    { name: '阅读', color: '#8B5CF6' },
    { name: '研究', color: '#F59E0B' },
    { name: '学习', color: '#EF4444' },
    { name: '运动', color: '#F97316' },
    { name: '冥想', color: '#06B6D4' },
    { name: '复习', color: '#84CC16' }
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { color: tag.color },
      create: tag
    })
  }

  // 创建默认系统设置
  await prisma.cTDPSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultSessionDuration: 3600, // 1小时
      defaultBreakDuration: 300,    // 5分钟
      enableNotifications: true,
      enableSounds: true,
      strictRuleMode: false,
      allowRuleUpdates: true,
      theme: 'auto',
      language: 'zh-CN'
    }
  })

  console.log('✅ Database seeding completed!')
  console.log(`📝 Created contexts:`)
  console.log(`   - ${deepWorkContext.name} (${deepWorkContext.id})`)
  console.log(`   - ${studyContext.name} (${studyContext.id})`)
  console.log(`   - ${fitnessContext.name} (${fitnessContext.id})`)
  console.log(`🏷️  Created ${tags.length} tags`)
  console.log(`⚙️  Created default settings`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
