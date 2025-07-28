import { useMemo } from 'react';
import { useTheme as useThemeContext, useEffectiveThemeMode } from '../contexts/theme';
import { ThemeMode } from '../contexts/theme/types';

// 重新导出主题hook
export { useTheme as useThemeContext, useEffectiveThemeMode } from '../contexts/theme';

/**
 * 便捷的useTheme hook，包装了context中的useTheme
 */
export function useTheme() {
  return useThemeContext();
}

/**
 * 获取主题相关的CSS变量值
 */
export function useThemeVariables() {
  const { currentTheme } = useThemeContext();
  
  return useMemo(() => {
    const { tokens } = currentTheme;
    
    return {
      // 背景色
      backgroundPrimary: `var(--background-primary, ${tokens.colors.background.primary})`,
      backgroundSecondary: `var(--background-secondary, ${tokens.colors.background.secondary})`,
      backgroundInteractive: `var(--background-interactive, ${tokens.colors.background.interactive})`,
      
      // 文本色
      textPrimary: `var(--text-primary, ${tokens.colors.text.primary})`,
      textSecondary: `var(--text-secondary, ${tokens.colors.text.secondary})`,
      textDisabled: `var(--text-disabled, ${tokens.colors.text.disabled})`,
      
      // 主色调
      accentPrimary: `var(--accent-primary, ${tokens.colors.accent.primary})`,
      accentPrimaryText: `var(--accent-primary-text, ${tokens.colors.accent.primaryText})`,
      
      // 功能色
      colorSuccess: `var(--color-success, ${tokens.colors.functional.success})`,
      colorDanger: `var(--color-danger, ${tokens.colors.functional.danger})`,
      
      // 边框色
      borderPrimary: `var(--border-primary, ${tokens.colors.border.primary})`,
      
      // 间距
      spacingBase: `var(--spacing-base, ${tokens.layout.spacing.base})`,
      spacingSm: `var(--spacing-sm, ${tokens.layout.spacing.sm})`,
      spacingMd: `var(--spacing-md, ${tokens.layout.spacing.md})`,
      spacingLg: `var(--spacing-lg, ${tokens.layout.spacing.lg})`,
      spacingXl: `var(--spacing-xl, ${tokens.layout.spacing.xl})`,
      
      // 圆角
      borderRadiusSm: `var(--border-radius-sm, ${tokens.layout.borderRadius.sm})`,
      borderRadiusMd: `var(--border-radius-md, ${tokens.layout.borderRadius.md})`,
      borderRadiusLg: `var(--border-radius-lg, ${tokens.layout.borderRadius.lg})`,
      borderRadiusXl: `var(--border-radius-xl, ${tokens.layout.borderRadius.xl})`,
      
      // 阴影
      shadowCard: `var(--shadow-card, ${tokens.shadows.card})`,
      shadowExtruded: tokens.shadows.extruded ? `var(--shadow-extruded, ${tokens.shadows.extruded})` : undefined,
      shadowInset: tokens.shadows.inset ? `var(--shadow-inset, ${tokens.shadows.inset})` : undefined,
      
      // 动效
      durationFast: `var(--duration-fast, ${tokens.animation.duration.fast})`,
      durationNormal: `var(--duration-normal, ${tokens.animation.duration.normal})`,
      easingDefault: `var(--easing-default, ${tokens.animation.easing.default})`
    };
  }, [currentTheme]);
}

/**
 * 检查当前是否为暗色主题
 */
export function useIsDarkMode(): boolean {
  const effectiveMode = useEffectiveThemeMode();
  return effectiveMode === ThemeMode.DARK;
}

/**
 * 获取主题感知的类名
 * 根据当前主题模式返回不同的类名
 */
export function useThemeClassName(lightClass: string, darkClass: string): string {
  const isDark = useIsDarkMode();
  return isDark ? darkClass : lightClass;
}

/**
 * 获取当前主题的基础信息
 */
export function useThemeInfo() {
  const { currentTheme, mode, preset } = useThemeContext();
  const effectiveMode = useEffectiveThemeMode();
  const isDark = useIsDarkMode();
  
  return useMemo(() => ({
    id: currentTheme.id,
    name: currentTheme.name,
    preset,
    mode,
    effectiveMode,
    isDark,
    isSystem: mode === ThemeMode.SYSTEM
  }), [currentTheme.id, currentTheme.name, preset, mode, effectiveMode, isDark]);
}

/**
 * 创建主题感知的样式对象
 */
export function useThemedStyles<T extends Record<string, any>>(
  lightStyles: T,
  darkStyles: Partial<T>
): T {
  const isDark = useIsDarkMode();
  
  return useMemo(() => {
    if (isDark) {
      return { ...lightStyles, ...darkStyles };
    }
    return lightStyles;
  }, [lightStyles, darkStyles, isDark]);
}

/**
 * 动态计算主题相关值
 */
export function useThemeValue<T>(lightValue: T, darkValue: T): T {
  const isDark = useIsDarkMode();
  return isDark ? darkValue : lightValue;
}

/**
 * 获取响应式的主题断点
 */
export function useThemeBreakpoints() {
  const { currentTheme } = useThemeContext();
  
  return useMemo(() => {
    // 基于设计规范的断点定义
    return {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };
  }, [currentTheme]);
}

/**
 * 主题切换动画控制
 */
export function useThemeTransition() {
  const { currentTheme } = useThemeContext();
  
  return useMemo(() => {
    const { duration, easing } = currentTheme.tokens.animation;
    
    return {
      duration: duration.normal,
      easing: easing.default,
      // 生成transition CSS字符串
      css: `all ${duration.normal} ${easing.default}`,
      // 针对颜色的transition
      colorTransition: `color ${duration.fast} ${easing.default}, background-color ${duration.fast} ${easing.default}, border-color ${duration.fast} ${easing.default}`
    };
  }, [currentTheme.tokens.animation]);
}
