/**
 * 主题系统类型定义
 * 基于 HolySeat UI 设计系统规范 v1.1
 */

// 主题模式枚举
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

// 主题预设枚举
export enum ThemePreset {
  CALM_TECH = 'calm-tech',
  SOFT_NEUMORPHISM = 'soft-neumorphism',
  CUSTOM = 'custom'
}

// CSS变量接口 - 核心设计令牌
export interface ThemeTokens {
  // 色彩系统
  colors: {
    // 背景色
    background: {
      primary: string;
      secondary: string;
      interactive: string;
    };
    // 文本色
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    // 主色调
    accent: {
      primary: string;
      primaryText: string;
    };
    // 功能色
    functional: {
      success: string;
      danger: string;
    };
    // 边框色
    border: {
      primary: string;
    };
  };

  // 排版系统
  typography: {
    fontFamily: {
      sans: string;
    };
    fontSize: {
      display: string;
      heading2: string;
      body: string;
      label: string;
    };
    fontWeight: {
      regular: string;
      medium: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };

  // 布局与间距
  layout: {
    spacing: {
      base: string; // 4px
      sm: string;   // 8px
      md: string;   // 16px
      lg: string;   // 24px
      xl: string;   // 32px
    };
    borderRadius: {
      sm: string;   // 4px
      md: string;   // 6px
      lg: string;   // 8px
      xl: string;   // 16px
    };
    borderWidth: {
      sm: string;   // 1px
      md: string;   // 2px
    };
  };

  // 阴影系统
  shadows: {
    card: string;
    extruded?: string;  // 新拟态凸起
    inset?: string;     // 新拟态凹陷
  };

  // 动效
  animation: {
    duration: {
      fast: string;    // 200ms
      normal: string;  // 300ms
    };
    easing: {
      default: string;
    };
  };
}

// 完整主题配置
export interface Theme {
  id: string;
  name: string;
  preset: ThemePreset;
  mode: ThemeMode;
  tokens: ThemeTokens;
}

// 主题上下文状态
export interface ThemeContextState {
  // 当前主题
  currentTheme: Theme;
  // 当前模式
  mode: ThemeMode;
  // 当前预设
  preset: ThemePreset;
  // 系统是否偏好暗色模式
  systemPrefersDark: boolean;
  // 是否正在加载
  isLoading: boolean;
}

// 主题上下文操作
export interface ThemeContextActions {
  // 设置主题模式
  setMode: (mode: ThemeMode) => void;
  // 设置主题预设
  setPreset: (preset: ThemePreset) => void;
  // 设置自定义主题
  setCustomTheme: (theme: Theme) => void;
  // 重置为默认主题
  resetToDefault: () => void;
  // 导入CSS主题文件
  importThemeFromCSS: (cssContent: string) => Promise<void>;
  // 导出当前主题为CSS
  exportThemeToCSS: () => string;
}

// 完整的主题上下文
export interface ThemeContext extends ThemeContextState, ThemeContextActions {}

// 主题配置选项
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultPreset?: ThemePreset;
  storageKey?: string;
  enableSystemDetection?: boolean;
}
