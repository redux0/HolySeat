// 测试类型定义
import { SacredContextRules } from './src/types/ctdp';

const testRules: SacredContextRules = {
  minDuration: 3600, // 1小时
  allowBreaks: false,
  distractionBlocking: true,
  exceptionRules: [
    '允许因紧急电话中断',
    '允许因身体不适暂停'
  ]
};

console.log('测试规则:', testRules);
console.log('最小时长(秒):', testRules.minDuration);
console.log('最小时长(分钟):', testRules.minDuration / 60);

// 模拟从数据库读取
const mockContextFromDB = {
  id: 'test',
  name: '测试情境',
  rules: testRules
};

const rules = mockContextFromDB.rules as SacredContextRules;
const defaultDuration = rules?.minDuration || 45 * 60; // 从rules中读取minDuration，默认45分钟

console.log('默认时长(秒):', defaultDuration);
console.log('默认时长(分钟):', defaultDuration / 60);
