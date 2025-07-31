/**
 * 应用常量配置文件
 * 统一管理图标映射、颜色配置、枚举值等常量
 */

import React from 'react';
import { 
  BrainCircuit, 
  BookOpen, 
  Zap, 
  Wind, 
  Sparkles, 
  Wand2,
  Play,
  Calendar,
  List,
  Plus,
  Settings,
  Target,
  Clock,
  CheckCircle,
  Users,
  Home,
  Activity
} from 'lucide-react';

// ============= 图标映射配置 =============

/**
 * 图标类型定义
 */
export type IconType = React.ComponentType<any>;

/**
 * 图标名称枚举
 * 使用字符串常量而非emoji，便于维护和扩展
 */
export enum IconNames {
  // 核心功能图标
  BRAIN_CIRCUIT = 'BRAIN_CIRCUIT',
  BOOK_OPEN = 'BOOK_OPEN',
  ZAP = 'ZAP',
  WIND = 'WIND',
  SPARKLES = 'SPARKLES',
  WAND2 = 'WAND2',
  
  // 操作图标
  PLAY = 'PLAY',
  CALENDAR = 'CALENDAR',
  LIST = 'LIST',
  PLUS = 'PLUS',
  SETTINGS = 'SETTINGS',
  TARGET = 'TARGET',
  CLOCK = 'CLOCK',
  CHECK_CIRCLE = 'CHECK_CIRCLE',
  USERS = 'USERS',
  HOME = 'HOME',
  ACTIVITY = 'ACTIVITY'
}

/**
 * 图标组件映射表
 */
export const ICON_MAP: Record<IconNames | string, IconType> = {
  // 核心功能图标
  [IconNames.BRAIN_CIRCUIT]: BrainCircuit,
  [IconNames.BOOK_OPEN]: BookOpen,
  [IconNames.ZAP]: Zap,
  [IconNames.WIND]: Wind,
  [IconNames.SPARKLES]: Sparkles,
  [IconNames.WAND2]: Wand2,
  
  // 操作图标
  [IconNames.PLAY]: Play,
  [IconNames.CALENDAR]: Calendar,
  [IconNames.LIST]: List,
  [IconNames.PLUS]: Plus,
  [IconNames.SETTINGS]: Settings,
  [IconNames.TARGET]: Target,
  [IconNames.CLOCK]: Clock,
  [IconNames.CHECK_CIRCLE]: CheckCircle,
  [IconNames.USERS]: Users,
  [IconNames.HOME]: Home,
  [IconNames.ACTIVITY]: Activity,

  // 兼容旧数据 - emoji映射到新的图标名称
  '🧠': BrainCircuit,      // 深度工作
  '📚': BookOpen,          // 学习
  '💪': Zap,               // 健身运动
  '🧘': Wind,              // 其他情境
  
  // 兼容CreateContextPage中的字符串名称
  'BrainCircuit': BrainCircuit,
  'BookOpen': BookOpen,
  'Zap': Zap,
  'Wind': Wind,
  'Sparkles': Sparkles,
  'Wand2': Wand2
};

/**
 * 获取图标组件的工具函数
 */
export function getIconComponent(iconName?: string | IconNames): IconType {
  if (!iconName) {
    return ICON_MAP[IconNames.BRAIN_CIRCUIT];
  }
  
  return ICON_MAP[iconName] || ICON_MAP[IconNames.BRAIN_CIRCUIT];
}

/**
 * 可用的图标选项（用于创建/编辑情境页面）
 */
export const AVAILABLE_ICONS = [
  { name: IconNames.BRAIN_CIRCUIT, component: BrainCircuit, label: '深度工作' },
  { name: IconNames.BOOK_OPEN, component: BookOpen, label: '学习阅读' },
  { name: IconNames.ZAP, component: Zap, label: '活力充沛' },
  { name: IconNames.WIND, component: Wind, label: '冥想放松' },
  { name: IconNames.SPARKLES, component: Sparkles, label: '创意灵感' },
  { name: IconNames.WAND2, component: Wand2, label: '魔法专注' }
];

// ============= 颜色配置 =============

/**
 * 颜色名称枚举
 */
export enum ColorNames {
  INDIGO = 'INDIGO',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  PURPLE = 'PURPLE',
  PINK = 'PINK',
  GRAY = 'GRAY'
}

/**
 * 颜色配置映射
 */
export const COLOR_MAP: Record<ColorNames, { name: string; hex: string; label: string }> = {
  [ColorNames.INDIGO]: { name: 'indigo', hex: '#6366F1', label: '靛蓝色' },
  [ColorNames.BLUE]: { name: 'blue', hex: '#3B82F6', label: '蓝色' },
  [ColorNames.GREEN]: { name: 'green', hex: '#10B981', label: '绿色' },
  [ColorNames.YELLOW]: { name: 'yellow', hex: '#F59E0B', label: '黄色' },
  [ColorNames.RED]: { name: 'red', hex: '#EF4444', label: '红色' },
  [ColorNames.PURPLE]: { name: 'purple', hex: '#8B5CF6', label: '紫色' },
  [ColorNames.PINK]: { name: 'pink', hex: '#EC4899', label: '粉色' },
  [ColorNames.GRAY]: { name: 'gray', hex: '#6B7280', label: '灰色' }
};

/**
 * 可用的颜色选项（用于创建/编辑情境页面）
 */
export const AVAILABLE_COLORS = Object.values(COLOR_MAP);

/**
 * 获取颜色值的工具函数
 */
export function getColorHex(colorName?: string | ColorNames): string {
  if (!colorName) {
    return COLOR_MAP[ColorNames.INDIGO].hex;
  }
  
  // 查找匹配的颜色名称
  const colorEntry = Object.values(COLOR_MAP).find(
    color => color.name === colorName || color.hex === colorName
  );
  
  return colorEntry?.hex || COLOR_MAP[ColorNames.INDIGO].hex;
}

// ============= 时间配置 =============

/**
 * 预设时间选项（分钟）
 */
export const PRESET_TIMES = [
  { label: '5分钟', value: 5 },
  { label: '10分钟', value: 10 },
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '45分钟', value: 45 },
  { label: '60分钟', value: 60 },
  { label: '90分钟', value: 90 }
];

/**
 * 延迟预约时间选项（分钟）
 */
export const DELAY_TIME_OPTIONS = [
  { label: '5分钟后', value: 5 },
  { label: '10分钟后', value: 10 },
  { label: '15分钟后', value: 15 },
  { label: '30分钟后', value: 30 },
  { label: '60分钟后', value: 60 }
];

// ============= 状态配置 =============

/**
 * 链状态枚举
 */
export enum ChainStatus {
  ACTIVE = 'ACTIVE',
  BROKEN = 'BROKEN',
  COMPLETED = 'COMPLETED'
}

/**
 * 日志类型枚举
 */
export enum LogType {
  SESSION_START = 'SESSION_START',
  SESSION_SUCCESS = 'SESSION_SUCCESS',
  SESSION_FAILURE = 'SESSION_FAILURE',
  CHAIN_BREAK = 'CHAIN_BREAK',
  RULE_UPDATED = 'RULE_UPDATED'
}

/**
 * 状态显示配置
 */
export const STATUS_CONFIG = {
  [ChainStatus.ACTIVE]: {
    label: '活跃中',
    color: '#10B981',
    bgColor: '#D1FAE5'
  },
  [ChainStatus.BROKEN]: {
    label: '已断裂',
    color: '#EF4444',
    bgColor: '#FEE2E2'
  },
  [ChainStatus.COMPLETED]: {
    label: '已完成',
    color: '#6B7280',
    bgColor: '#F3F4F6'
  }
};

// ============= 应用配置 =============

/**
 * 应用基础配置
 */
export const APP_CONFIG = {
  // 应用信息
  name: 'HolySeat',
  version: '1.0.0',
  
  // 默认配置
  defaults: {
    sessionDuration: 25, // 默认专注时长（分钟）
    breakDuration: 5,    // 默认休息时长（分钟）
    longBreakDuration: 15, // 默认长休息时长（分钟）
    sessionsUntilLongBreak: 4, // 几次专注后长休息
    
    // 默认情境配置
    context: {
      icon: IconNames.BRAIN_CIRCUIT,
      color: ColorNames.INDIGO
    }
  },
  
  // 限制配置
  limits: {
    contextNameMaxLength: 50,
    contextDescriptionMaxLength: 200,
    maxContextsPerUser: 20,
    maxChainLength: 999
  },
  
  // 动画配置
  animation: {
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
};

// ============= 导出所有常量 =============

export default {
  IconNames,
  ICON_MAP,
  getIconComponent,
  AVAILABLE_ICONS,
  
  ColorNames,
  COLOR_MAP,
  getColorHex,
  AVAILABLE_COLORS,
  
  PRESET_TIMES,
  DELAY_TIME_OPTIONS,
  
  ChainStatus,
  LogType,
  STATUS_CONFIG,
  
  APP_CONFIG
};
