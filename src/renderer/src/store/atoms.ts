/**
 * @file atoms.ts
 * @description 该文件使用 Jotai atoms 定义了全局应用状态。
 * Jotai 是一个为 React 设计的原子化、灵活的状态管理库。
 * Atoms 是独立的状态单元，可以从任何组件中读取和写入。
 * 这种集中式的状态管理方法有助于维护一个可预测的状态容器，并简化整个应用的状态共享。
 */

import { atom } from 'jotai';
import type { ActiveSession } from '../../../types/ctdp';
import type { ScheduleState } from '../features/ctdp/atoms';

/**
 * 定义应用内用户主要活动的状态。
 * 这是核心用户工作流的有限状态机。
 * - 'IDLE': 空闲状态，没有激活或预约的专注会话。
 * - 'SCHEDULED': 已预约，一个专注会话已计划但尚未开始。
 * - 'FOCUSING': 专注中，一个专注会话当前正在进行。
 */
export type UserActivityState = 'IDLE' | 'SCHEDULED' | 'FOCUSING';

/**
 * 代表用户当前活动状态的 Atom。
 * 这是状态的核心部分，可以根据用户的行为控制整个应用的UI变化、通知和行为。
 */
export const userActivityStateAtom = atom<UserActivityState>('IDLE');

/**
 * 用户活动状态信息接口。
 * 存储与当前用户活动状态相关的详细信息。
 * - status: 具体的状态信息对象（ScheduleState 或 ActiveSession）
 * - timerId: 可选的计时器ID，用于管理与当前状态关联的定时器
 */
export interface UserActivityInfo {
  status: ScheduleState | ActiveSession | null;
  timerId?: NodeJS.Timeout;
}

/**
 * 代表用户当前活动详细信息的 Atom。
 * 根据 userActivityStateAtom 的值，status 字段应包含对应的状态信息：
 * - IDLE: status 为 null
 * - SCHEDULED: status 为 ScheduleState 类型
 * - FOCUSING: status 为 ActiveSession 类型
 */
export const userActivityInfoAtom = atom<UserActivityInfo>({ 
  status: null 
});

// 导出计时器管理相关的 atoms
export * from './timerManager';

