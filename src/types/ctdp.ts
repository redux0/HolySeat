/**
 * CTDP链管理模块 - TypeScript类型定义
 * 基于Prisma Schema生成的补充类型定义
 */

import { 
  SacredContext, 
  CTDPChain, 
  CTDPLog, 
  Tag, 
  AuxiliaryChain, 
  CTDPSettings,
  ChainStatus,
  LogType,
  AuxChainStatus 
} from '@prisma/client'

// ============= 基础类型 =============

export type { 
  SacredContext, 
  CTDPChain, 
  CTDPLog, 
  Tag, 
  AuxiliaryChain, 
  CTDPSettings,
  ChainStatus,
  LogType,
  AuxChainStatus 
}

// ============= 扩展类型 =============

/** 神圣情境的规则配置 */
export interface SacredContextRules {
  minDuration: number;           // 最少专注时长（秒）
  maxDuration?: number;          // 最大专注时长（秒）
  allowBreaks: boolean;          // 是否允许中途休息
  breakDuration?: number;        // 休息时长（秒）
  requireWarmup?: boolean;       // 是否需要热身
  distractionBlocking?: boolean; // 是否启用干扰屏蔽
}

/** 神圣情境的环境配置 */
export interface SacredContextEnvironment {
  apps?: {
    whitelist?: string[];  // 允许的应用列表
    blacklist?: string[];  // 禁止的应用列表
  };
  notifications?: boolean; // 是否允许通知
  soundEnabled?: boolean;  // 是否启用声音
  theme?: string;         // 专用主题
}

/** 日志元数据 */
export interface CTDPLogMetadata {
  ruleChanges?:      Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
    timestamp: string;
  }>;
  environmentData?: {
    activeApps?: string[];
    distractions?: string[];
    interruptionCount?: number;
  };
  performanceData?: {
    focusScore?: number;
    productivityRating?: number;
    energyLevel?: number;
  };
}

// ============= API类型 =============

/** 创建神圣情境的请求 */
export interface CreateSacredContextRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  rules?: SacredContextRules;
  environment?: SacredContextEnvironment;
}

/** 启动任务会话的请求 */
export interface StartSessionRequest {
  contextId: string;
  taskInfo?: {
    title?: string;
    tags?: string[];
    expectedDuration?: number;
  };
}

/** 完成任务会话的请求 */
export interface CompleteSessionRequest {
  chainId: string;
  duration: number;
  title?: string;
  tags?: string[];
  metadata?: CTDPLogMetadata;
}

/** 断裂链的请求 */
export interface BreakChainRequest {
  chainId: string;
  reason: string;
  metadata?: CTDPLogMetadata;
}

/** 创建预约的请求 */
export interface CreateAuxiliaryChainRequest {
  targetContextId: string;
  delayMinutes?: number;
  description?: string;
  reminder?: boolean;
}

// ============= 响应类型 =============

/** 带有活跃链信息的神圣情境 */
export interface ContextWithActiveChain extends SacredContext {
  activeChain?: CTDPChain & {
    logs: CTDPLog[];
  };
}

/** 带有详细日志的链 */
export interface ChainWithLogs extends CTDPChain {
  context: SacredContext;
  logs: (CTDPLog & {
    tags: Tag[];
  })[];
}

/** 当前活跃会话信息 */
export interface ActiveSession {
  contextId: string;
  contextName: string;
  chainId: string;
  chainCounter: number;
  startTime: Date;
  expectedEndTime?: Date;
  taskTitle?: string;
  tags?: Tag[];
}

/** 链统计信息 */
export interface ChainStatistics {
  totalChains: number;
  activeChains: number;
  brokenChains: number;
  longestChain: number;
  totalFocusTime: number;     // 总专注时长（秒）
  averageSessionDuration: number;
  sessionsToday: number;
  currentStreak: number;
}

/** 情境统计信息 */
export interface ContextStatistics {
  contextId: string;
  contextName: string;
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  longestChain: number;
  currentChain: number;
  successRate: number;        // 成功率 (%)
  lastSessionDate?: Date;
}

// ============= 事件类型 =============

/** CTDP事件类型 */
export type CTDPEventType = 
  | 'session_started'
  | 'session_completed' 
  | 'session_paused'
  | 'session_resumed'
  | 'chain_broken'
  | 'chain_archived'
  | 'auxiliary_scheduled'
  | 'auxiliary_fulfilled'
  | 'auxiliary_failed'
  | 'rule_updated'
  | 'context_created'
  | 'context_updated';

/** CTDP事件数据 */
export interface CTDPEvent {
  type: CTDPEventType;
  timestamp: Date;
  data: {
    contextId?: string;
    chainId?: string;
    sessionId?: string;
    auxiliaryId?: string;
    [key: string]: any;
  };
}

// ============= 配置类型 =============

/** 系统配置 */
export interface CTDPSystemConfig {
  database: {
    url: string;
    maxConnections?: number;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  defaults: {
    sessionDuration: number;
    breakDuration: number;
    auxiliaryDelay: number;
  };
  features: {
    strictMode: boolean;
    ruleUpdates: boolean;
    analytics: boolean;
  };
}

// ============= 工具类型 =============

/** 分页参数 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** 日期范围过滤器 */
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

/** 链过滤器 */
export interface ChainFilter extends DateRangeFilter {
  contextId?: string;
  status?: ChainStatus;
  minCounter?: number;
  maxCounter?: number;
}

/** 日志过滤器 */
export interface LogFilter extends DateRangeFilter {
  chainId?: string;
  contextId?: string;
  type?: LogType;
  tags?: string[];
}
