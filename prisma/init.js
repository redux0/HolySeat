#!/usr/bin/env node

/**
 * CTDP数据库初始化脚本
 * 用于快速设置开发环境的数据库
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 CTDP数据库初始化开始...\n');

// 检查Prisma schema文件是否存在
const schemaPath = path.join(__dirname, 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ 找不到 prisma/schema.prisma 文件');
  process.exit(1);
}

try {
  console.log('📦 安装依赖...');
  execSync('npm install @prisma/client', { stdio: 'inherit' });
  
  console.log('\n🔧 生成Prisma客户端...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n📊 创建数据库结构...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n🌱 初始化种子数据...');
  execSync('npx tsx seed.ts', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ CTDP数据库初始化完成！');
  console.log('\n📝 你现在可以：');
  console.log('   • 运行 `npm run db:studio` 查看数据库');
  console.log('   • 运行 `npm run dev` 启动应用');
  console.log('   • 查看 prisma/README.md 了解更多信息');
  
} catch (error) {
  console.error('\n❌ 初始化过程中出现错误：');
  console.error(error.message);
  
  console.log('\n🔧 手动执行步骤：');
  console.log('1. npm install @prisma/client');
  console.log('2. npx prisma generate');
  console.log('3. npx prisma db push');
  console.log('4. npx tsx prisma/seed.ts');
  
  process.exit(1);
}
