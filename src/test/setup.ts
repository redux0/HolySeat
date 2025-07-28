import '@testing-library/jest-dom'

// Mock electron
global.window = global.window || {};
global.window.electron = {
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    send: jest.fn()
  }
}

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}
