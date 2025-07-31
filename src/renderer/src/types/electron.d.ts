/**
 * 全局类型声明 - Electron API
 */

export interface IElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>
    send: (channel: string, ...args: any[]) => void
    on: (channel: string, func: (...args: any[]) => void) => () => void
    once: (channel: string, func: (...args: any[]) => void) => void
  }
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}
