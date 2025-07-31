/**
 * @file timerManager.ts
 * @description 全局计时器管理工具
 * 负责管理全局状态中的计时器ID，确保同一时间只有一个活跃计时器
 */

import { atom } from 'jotai';
import { userActivityInfoAtom, userActivityStateAtom } from './atoms';
import type { ActiveSession } from '../../../types/ctdp';
import type { ScheduleState } from '../features/ctdp/atoms';

/**
 * 清理当前计时器
 * @param get Jotai get 函数
 * @param set Jotai set 函数
 */
const clearCurrentTimer = (get: any, set: any) => {
  const currentInfo = get(userActivityInfoAtom);
  if (currentInfo.timerId) {
    clearInterval(currentInfo.timerId);
    console.log('🧹 清理计时器:', currentInfo.timerId);
  }
};

/**
 * 设置预约计时器的操作 atom
 * 第二个参数可以包含完成回调
 */
export const setScheduleTimerAtom = atom(
  null,
  (get, set, params: { scheduleState: ScheduleState, onComplete?: () => void }) => {
    const { scheduleState, onComplete } = params;
    
    // 清理之前的计时器
    clearCurrentTimer(get, set);

    // 创建新的预约计时器
    const timerId = setInterval(() => {
      const currentInfo = get(userActivityInfoAtom);
      const currentSchedule = currentInfo.status as ScheduleState;
      
      if (currentSchedule && currentSchedule.remainingTime > 1) {
        // 更新剩余时间
        const updatedSchedule: ScheduleState = {
          ...currentSchedule,
          remainingTime: currentSchedule.remainingTime - 1
        };
        
        set(userActivityInfoAtom, {
          status: updatedSchedule,
          timerId: currentInfo.timerId
        });
      } else {
        // 预约时间到，检查当前状态是否仍为SCHEDULED
        const currentState = get(userActivityStateAtom);
        
        if (currentState === 'SCHEDULED') {
          // 清理计时器并保持状态为SCHEDULED，让回调处理状态转换
          clearCurrentTimer(get, set);
          
          console.log('⏰ 预约时间到达，状态为SCHEDULED，触发完成回调');
          
          // 触发完成回调，由回调负责状态转换
          if (onComplete) {
            onComplete();
          } else {
            // 如果没有回调，则设置为IDLE
            set(userActivityStateAtom, 'IDLE');
            set(userActivityInfoAtom, { status: null });
          }
        } else {
          // 状态已经不是SCHEDULED，只清理计时器
          clearCurrentTimer(get, set);
          console.log('⏰ 预约时间到达，但状态已变更为', currentState, '，不触发回调');
        }
      }
    }, 1000);

    // 更新状态
    set(userActivityStateAtom, 'SCHEDULED');
    set(userActivityInfoAtom, {
      status: scheduleState,
      timerId
    });

    console.log('⏰ 设置预约计时器:', timerId, scheduleState);
  }
);

/**
 * 设置专注计时器的操作 atom
 */
export const setFocusTimerAtom = atom(
  null,
  (get, set, activeSession: ActiveSession) => {
    // 清理之前的计时器
    clearCurrentTimer(get, set);

    // 计算专注时长
    const startTime = new Date(activeSession.startTime).getTime();
    const endTime = activeSession.expectedEndTime 
      ? new Date(activeSession.expectedEndTime).getTime()
      : startTime + (60 * 60 * 1000); // 默认60分钟

    const totalDuration = Math.floor((endTime - startTime) / 1000);
    let elapsed = Math.floor((Date.now() - startTime) / 1000);

    // 创建新的专注计时器
    const timerId = setInterval(() => {
      elapsed += 1;
      const remaining = Math.max(0, totalDuration - elapsed);
      
      if (remaining <= 0) {
        // 专注时间到，清理计时器
        clearCurrentTimer(get, set);
        set(userActivityStateAtom, 'IDLE');
        set(userActivityInfoAtom, { status: null });
        
        // 这里可以触发专注完成的回调
        console.log('🎯 专注时间到达');
      }
    }, 1000);

    // 更新状态
    set(userActivityStateAtom, 'FOCUSING');
    set(userActivityInfoAtom, {
      status: activeSession,
      timerId
    });

    console.log('🎯 设置专注计时器:', timerId, activeSession);
  }
);

/**
 * 清理所有计时器的操作 atom
 */
export const clearAllTimersAtom = atom(
  null,
  (get, set) => {
    clearCurrentTimer(get, set);
    set(userActivityStateAtom, 'IDLE');
    set(userActivityInfoAtom, { status: null });
    console.log('🧹 清理所有计时器');
  }
);

/**
 * 取消当前活动的操作 atom
 */
export const cancelCurrentActivityAtom = atom(
  null,
  (get, set) => {
    const currentState = get(userActivityStateAtom);
    console.log('❌ 取消当前活动:', currentState);
    
    clearCurrentTimer(get, set);
    set(userActivityStateAtom, 'IDLE');
    set(userActivityInfoAtom, { status: null });
  }
);
