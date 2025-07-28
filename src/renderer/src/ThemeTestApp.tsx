import React from 'react';
import { ThemeProvider, useTheme, ThemeMode, ThemePreset } from './contexts/theme';

// 简单的测试组件
function ThemeTestComponent() {
  const { currentTheme, mode, preset, setMode } = useTheme();

  return (
    <div 
      style={{
        padding: '20px',
        backgroundColor: currentTheme.tokens.colors.background.primary,
        color: currentTheme.tokens.colors.text.primary,
        minHeight: '100vh',
        fontFamily: currentTheme.tokens.typography.fontFamily.sans,
        transition: 'all 300ms ease-in-out'
      }}
    >
      <div 
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: currentTheme.tokens.colors.background.secondary,
          borderRadius: currentTheme.tokens.layout.borderRadius.lg,
          border: `1px solid ${currentTheme.tokens.colors.border.primary}`
        }}
      >
        <h1 
          style={{
            fontSize: currentTheme.tokens.typography.fontSize.display,
            fontWeight: currentTheme.tokens.typography.fontWeight.bold,
            color: currentTheme.tokens.colors.text.primary,
            marginBottom: '20px'
          }}
        >
          HolySeat Theme System
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 
            style={{
              fontSize: currentTheme.tokens.typography.fontSize.heading2,
              fontWeight: currentTheme.tokens.typography.fontWeight.bold,
              color: currentTheme.tokens.colors.text.primary,
              marginBottom: '10px'
            }}
          >
            Current Theme Information
          </h2>
          <p style={{ color: currentTheme.tokens.colors.text.secondary }}>
            <strong>Theme:</strong> {currentTheme.name}
          </p>
          <p style={{ color: currentTheme.tokens.colors.text.secondary }}>
            <strong>Mode:</strong> {mode}
          </p>
          <p style={{ color: currentTheme.tokens.colors.text.secondary }}>
            <strong>Preset:</strong> {preset}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 
            style={{
              fontSize: currentTheme.tokens.typography.fontSize.body,
              fontWeight: currentTheme.tokens.typography.fontWeight.medium,
              color: currentTheme.tokens.colors.text.primary,
              marginBottom: '10px'
            }}
          >
            Color Palette Test
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div 
              style={{
                padding: '10px',
                backgroundColor: currentTheme.tokens.colors.accent.primary,
                color: currentTheme.tokens.colors.accent.primaryText,
                borderRadius: currentTheme.tokens.layout.borderRadius.md,
                minWidth: '100px',
                textAlign: 'center'
              }}
            >
              Accent Primary
            </div>
            <div 
              style={{
                padding: '10px',
                backgroundColor: currentTheme.tokens.colors.functional.success,
                color: '#FFFFFF',
                borderRadius: currentTheme.tokens.layout.borderRadius.md,
                minWidth: '100px',
                textAlign: 'center'
              }}
            >
              Success
            </div>
            <div 
              style={{
                padding: '10px',
                backgroundColor: currentTheme.tokens.colors.functional.danger,
                color: '#FFFFFF',
                borderRadius: currentTheme.tokens.layout.borderRadius.md,
                minWidth: '100px',
                textAlign: 'center'
              }}
            >
              Danger
            </div>
          </div>
        </div>

        <div>
          <h3 
            style={{
              fontSize: currentTheme.tokens.typography.fontSize.body,
              fontWeight: currentTheme.tokens.typography.fontWeight.medium,
              color: currentTheme.tokens.colors.text.primary,
              marginBottom: '10px'
            }}
          >
            Quick Mode Switch (Development Test)
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setMode(ThemeMode.LIGHT)}
              style={{
                padding: '8px 16px',
                backgroundColor: currentTheme.tokens.colors.background.interactive,
                color: currentTheme.tokens.colors.text.primary,
                border: `1px solid ${currentTheme.tokens.colors.border.primary}`,
                borderRadius: currentTheme.tokens.layout.borderRadius.md,
                cursor: 'pointer',
                transition: 'all 200ms ease-in-out'
              }}
            >
              Light Mode
            </button>
            <button 
              onClick={() => setMode(ThemeMode.DARK)}
              style={{
                padding: '8px 16px',
                backgroundColor: currentTheme.tokens.colors.background.interactive,
                color: currentTheme.tokens.colors.text.primary,
                border: `1px solid ${currentTheme.tokens.colors.border.primary}`,
                borderRadius: currentTheme.tokens.layout.borderRadius.md,
                cursor: 'pointer',
                transition: 'all 200ms ease-in-out'
              }}
            >
              Dark Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主测试应用
function ThemeTestApp() {
  return (
    <ThemeProvider 
      defaultMode={ThemeMode.DARK}
      defaultPreset={ThemePreset.CALM_TECH}
      enableSystemDetection={true}
    >
      <ThemeTestComponent />
    </ThemeProvider>
  );
}

export default ThemeTestApp;
