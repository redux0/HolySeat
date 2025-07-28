"use strict";
const electron = require("electron");
const path = require("path");
const require$$0 = require(".prisma/client/default");
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({ openAtLogin: auto });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const icon = "data:image/png;base64,";
var _default;
var hasRequired_default;
function require_default() {
  if (hasRequired_default) return _default;
  hasRequired_default = 1;
  _default = {
    ...require$$0
  };
  return _default;
}
var _defaultExports = /* @__PURE__ */ require_default();
const isDev = process.env.NODE_ENV === "development";
const dbPath = isDev ? path.join(process.cwd(), "prisma", "dev.db") : path.join(electron.app.getPath("userData"), "ctdp.db");
console.log(`📊 CTDP数据库路径: ${dbPath}`);
const prisma = new _defaultExports.PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  },
  log: isDev ? ["query", "info", "warn", "error"] : ["error"]
});
async function initDatabase() {
  try {
    console.log("🔌 初始化CTDP数据库连接...");
    await prisma.$connect();
    console.log("✅ 数据库连接成功");
    await ensureBasicData();
    return true;
  } catch (error) {
    console.error("❌ 数据库连接失败:", error);
    return false;
  }
}
async function ensureBasicData() {
  try {
    const settings = await prisma.cTDPSettings.findUnique({
      where: { id: "default" }
    });
    if (!settings) {
      console.log("📝 创建默认设置...");
      await prisma.cTDPSettings.create({
        data: {
          id: "default",
          defaultSessionDuration: 3600,
          defaultBreakDuration: 300,
          enableNotifications: true,
          enableSounds: true,
          strictRuleMode: false,
          allowRuleUpdates: true,
          theme: "auto",
          language: "zh-CN"
        }
      });
    }
    const contextCount = await prisma.sacredContext.count();
    if (contextCount === 0) {
      console.log("🏛️ 创建默认神圣情境...");
      await createDefaultContexts();
    }
  } catch (error) {
    console.error("⚠️ 基础数据初始化失败:", error);
  }
}
async function createDefaultContexts() {
  const defaultContexts = [
    {
      id: "deep-work",
      name: "深度工作",
      description: "需要高度专注的工作任务",
      icon: "🧠",
      color: "#3B82F6",
      rules: {
        minDuration: 3600,
        allowBreaks: false,
        distractionBlocking: true
      },
      environment: {
        notifications: false
      }
    },
    {
      id: "study",
      name: "学习",
      description: "阅读、学习新知识",
      icon: "📚",
      color: "#10B981",
      rules: {
        minDuration: 1800,
        allowBreaks: true,
        breakDuration: 300
      },
      environment: {
        notifications: false
      }
    }
  ];
  for (const context of defaultContexts) {
    await prisma.sacredContext.create({
      data: context
    });
  }
}
async function closeDatabase() {
  try {
    await prisma.$disconnect();
    console.log("📊 数据库连接已关闭");
  } catch (error) {
    console.error("❌ 关闭数据库连接时出错:", error);
  }
}
class ChainService {
  constructor(prisma2) {
    this.prisma = prisma2;
  }
  /**
   * 获取所有情境及其当前活跃链信息
   * 用于启动中心UI展示
   */
  async getContextsWithActiveChains() {
    try {
      const contexts = await this.prisma.sacredContext.findMany({
        include: {
          chains: {
            where: { status: _defaultExports.ChainStatus.ACTIVE },
            include: {
              logs: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { tags: true }
              }
            }
          }
        },
        orderBy: { createdAt: "asc" }
      });
      return contexts.map((context) => ({
        ...context,
        activeChain: context.chains[0] || void 0
      }));
    } catch (error) {
      console.error("获取情境列表失败:", error);
      throw new Error("Failed to fetch contexts with active chains");
    }
  }
  /**
   * 启动或继续链 - 核心入口函数
   * 当用户启动一个情境时调用
   */
  async startOrContinueChain(contextId, taskInfo) {
    try {
      let activeChain = await this.prisma.cTDPChain.findFirst({
        where: {
          contextId,
          status: _defaultExports.ChainStatus.ACTIVE
        },
        include: {
          context: true,
          logs: {
            include: { tags: true },
            orderBy: { createdAt: "desc" }
          }
        }
      });
      let isNewChain = false;
      if (!activeChain) {
        isNewChain = true;
        activeChain = await this.prisma.cTDPChain.create({
          data: {
            contextId,
            counter: 0,
            status: _defaultExports.ChainStatus.ACTIVE,
            logs: {
              create: {
                type: _defaultExports.LogType.CREATED,
                message: "新链创建",
                metadata: {
                  taskInfo,
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                }
              }
            }
          },
          include: {
            context: true,
            logs: {
              include: { tags: true },
              orderBy: { createdAt: "desc" }
            }
          }
        });
      }
      if (taskInfo?.title) {
        await this.prisma.cTDPLog.create({
          data: {
            chainId: activeChain.id,
            type: _defaultExports.LogType.SUCCESS,
            // 暂时标记为成功，完成时更新
            title: taskInfo.title,
            metadata: {
              status: "started",
              startTime: (/* @__PURE__ */ new Date()).toISOString()
            },
            tags: taskInfo.tags ? {
              connect: taskInfo.tags.map((tagName) => ({ name: tagName }))
            } : void 0
          }
        });
      }
      return { chain: activeChain, isNewChain };
    } catch (error) {
      console.error("启动链失败:", error);
      throw new Error("Failed to start or continue chain");
    }
  }
  /**
   * 增加链长度 - 成功完成任务
   */
  async incrementChain(chainId, logData) {
    try {
      const updatedChain = await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: {
          counter: { increment: 1 },
          totalDuration: { increment: logData.duration },
          longestSession: {
            set: Math.max(
              await this.prisma.cTDPChain.findUnique({ where: { id: chainId } }).then((chain) => chain?.longestSession || 0),
              logData.duration
            )
          },
          updatedAt: /* @__PURE__ */ new Date()
        },
        include: {
          context: true,
          logs: {
            include: { tags: true },
            orderBy: { createdAt: "desc" }
          }
        }
      });
      await this.prisma.cTDPLog.create({
        data: {
          chainId,
          type: _defaultExports.LogType.SUCCESS,
          title: logData.title,
          duration: logData.duration,
          message: `任务完成，链长度增加至 #${updatedChain.counter}`,
          metadata: {
            previousCounter: updatedChain.counter - 1,
            newCounter: updatedChain.counter,
            completedAt: (/* @__PURE__ */ new Date()).toISOString()
          },
          tags: logData.tags ? {
            connectOrCreate: logData.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          } : void 0
        }
      });
      await this.updateChainAverageDuration(chainId);
      return updatedChain;
    } catch (error) {
      console.error("增加链长度失败:", error);
      throw new Error("Failed to increment chain");
    }
  }
  /**
   * 断裂链 - 任务失败或放弃
   */
  async breakChain(chainId, logData) {
    try {
      const brokenChain = await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: {
          status: _defaultExports.ChainStatus.BROKEN,
          brokenAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        },
        include: {
          context: true,
          logs: {
            include: { tags: true },
            orderBy: { createdAt: "desc" }
          }
        }
      });
      await this.prisma.cTDPLog.create({
        data: {
          chainId,
          type: _defaultExports.LogType.BROKEN,
          message: logData.reason,
          metadata: {
            finalCounter: brokenChain.counter,
            brokenAt: (/* @__PURE__ */ new Date()).toISOString(),
            ...logData.metadata
          }
        }
      });
      return brokenChain;
    } catch (error) {
      console.error("断裂链失败:", error);
      throw new Error("Failed to break chain");
    }
  }
  /**
   * 归档链 - 软删除历史链
   */
  async archiveChain(chainId) {
    try {
      await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: {
          status: _defaultExports.ChainStatus.ARCHIVED,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      return true;
    } catch (error) {
      console.error("归档链失败:", error);
      return false;
    }
  }
  /**
   * 创建辅助链（预约任务）
   */
  async scheduleAuxiliaryTask(request) {
    try {
      const delayMinutes = request.delayMinutes || 15;
      const deadline = new Date(Date.now() + delayMinutes * 60 * 1e3);
      const auxiliaryChain = await this.prisma.auxiliaryChain.create({
        data: {
          targetContextId: request.targetContextId,
          delayMinutes,
          deadline,
          description: request.description,
          reminder: request.reminder ?? true,
          status: _defaultExports.AuxChainStatus.PENDING
        }
      });
      return auxiliaryChain.id;
    } catch (error) {
      console.error("创建辅助链失败:", error);
      throw new Error("Failed to schedule auxiliary task");
    }
  }
  /**
   * 获取待处理的辅助链
   */
  async getUpcomingAuxiliaryTasks() {
    try {
      return await this.prisma.auxiliaryChain.findMany({
        where: {
          status: _defaultExports.AuxChainStatus.PENDING,
          deadline: { gte: /* @__PURE__ */ new Date() }
        },
        include: {
          targetContext: true
        },
        orderBy: { deadline: "asc" }
      });
    } catch (error) {
      console.error("获取辅助链失败:", error);
      throw new Error("Failed to get upcoming auxiliary tasks");
    }
  }
  /**
   * 履行辅助链任务
   */
  async fulfillAuxiliaryTask(auxiliaryId) {
    try {
      await this.prisma.auxiliaryChain.update({
        where: { id: auxiliaryId },
        data: {
          status: _defaultExports.AuxChainStatus.FULFILLED,
          fulfilledAt: /* @__PURE__ */ new Date()
        }
      });
      return true;
    } catch (error) {
      console.error("履行辅助链失败:", error);
      return false;
    }
  }
  /**
   * 辅助链任务失败
   */
  async failAuxiliaryTask(auxiliaryId) {
    try {
      await this.prisma.auxiliaryChain.update({
        where: { id: auxiliaryId },
        data: {
          status: _defaultExports.AuxChainStatus.FAILED,
          failedAt: /* @__PURE__ */ new Date()
        }
      });
      return true;
    } catch (error) {
      console.error("辅助链失败更新失败:", error);
      return false;
    }
  }
  /**
   * 获取链统计信息
   */
  async getChainStatistics() {
    try {
      const [totalChains, activeChains, brokenChains, chains] = await Promise.all([
        this.prisma.cTDPChain.count(),
        this.prisma.cTDPChain.count({ where: { status: _defaultExports.ChainStatus.ACTIVE } }),
        this.prisma.cTDPChain.count({ where: { status: _defaultExports.ChainStatus.BROKEN } }),
        this.prisma.cTDPChain.findMany({
          include: { logs: { where: { type: _defaultExports.LogType.SUCCESS } } }
        })
      ]);
      const longestChain = Math.max(...chains.map((c) => c.counter), 0);
      const totalFocusTime = chains.reduce((sum, c) => sum + c.totalDuration, 0);
      const totalSessions = chains.reduce((sum, c) => sum + c.logs.length, 0);
      const averageSessionDuration = totalSessions > 0 ? totalFocusTime / totalSessions : 0;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const sessionsToday = await this.prisma.cTDPLog.count({
        where: {
          type: _defaultExports.LogType.SUCCESS,
          createdAt: { gte: today }
        }
      });
      return {
        totalChains,
        activeChains,
        brokenChains,
        longestChain,
        totalFocusTime,
        averageSessionDuration,
        sessionsToday,
        currentStreak: this.calculateCurrentStreak(chains)
      };
    } catch (error) {
      console.error("获取统计信息失败:", error);
      throw new Error("Failed to get chain statistics");
    }
  }
  /**
   * 获取情境统计信息
   */
  async getContextStatistics() {
    try {
      const contexts = await this.prisma.sacredContext.findMany({
        include: {
          chains: {
            include: {
              logs: { where: { type: _defaultExports.LogType.SUCCESS } }
            }
          }
        }
      });
      return contexts.map((context) => {
        const allLogs = context.chains.flatMap((c) => c.logs);
        const totalSessions = allLogs.length;
        const totalDuration = context.chains.reduce((sum, c) => sum + c.totalDuration, 0);
        const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
        const longestChain = Math.max(...context.chains.map((c) => c.counter), 0);
        const activeChain = context.chains.find((c) => c.status === _defaultExports.ChainStatus.ACTIVE);
        const currentChain = activeChain?.counter || 0;
        const successfulChains = context.chains.filter((c) => c.counter > 0).length;
        const totalChains = context.chains.length;
        const successRate = totalChains > 0 ? successfulChains / totalChains * 100 : 0;
        const lastLog = allLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        return {
          contextId: context.id,
          contextName: context.name,
          totalSessions,
          totalDuration,
          averageDuration,
          longestChain,
          currentChain,
          successRate,
          lastSessionDate: lastLog?.createdAt
        };
      });
    } catch (error) {
      console.error("获取情境统计失败:", error);
      throw new Error("Failed to get context statistics");
    }
  }
  /**
   * 私有方法：更新链的平均时长
   */
  async updateChainAverageDuration(chainId) {
    const logs = await this.prisma.cTDPLog.findMany({
      where: {
        chainId,
        type: _defaultExports.LogType.SUCCESS,
        duration: { not: null }
      }
    });
    if (logs.length > 0) {
      const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const averageDuration = Math.round(totalDuration / logs.length);
      await this.prisma.cTDPChain.update({
        where: { id: chainId },
        data: { averageDuration }
      });
    }
  }
  /**
   * 私有方法：计算当前连续成功天数
   */
  calculateCurrentStreak(chains) {
    const activeChainsCount = chains.filter((c) => c.status === _defaultExports.ChainStatus.ACTIVE).length;
    return activeChainsCount;
  }
}
const chainService = new ChainService(prisma);
function registerCTDPHandlers() {
  console.log("🔗 注册CTDP IPC处理器...");
  electron.ipcMain.handle("ctdp:getContextsWithActiveChains", async () => {
    try {
      return await chainService.getContextsWithActiveChains();
    } catch (error) {
      console.error("IPC Error - getContextsWithActiveChains:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:startOrContinueChain", async (_, contextId, taskInfo) => {
    try {
      return await chainService.startOrContinueChain(contextId, taskInfo);
    } catch (error) {
      console.error("IPC Error - startOrContinueChain:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:incrementChain", async (_, chainId, logData) => {
    try {
      return await chainService.incrementChain(chainId, logData);
    } catch (error) {
      console.error("IPC Error - incrementChain:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:breakChain", async (_, chainId, logData) => {
    try {
      return await chainService.breakChain(chainId, logData);
    } catch (error) {
      console.error("IPC Error - breakChain:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:archiveChain", async (_, chainId) => {
    try {
      return await chainService.archiveChain(chainId);
    } catch (error) {
      console.error("IPC Error - archiveChain:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:scheduleAuxiliaryTask", async (_, request) => {
    try {
      return await chainService.scheduleAuxiliaryTask(request);
    } catch (error) {
      console.error("IPC Error - scheduleAuxiliaryTask:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:getUpcomingAuxiliaryTasks", async () => {
    try {
      return await chainService.getUpcomingAuxiliaryTasks();
    } catch (error) {
      console.error("IPC Error - getUpcomingAuxiliaryTasks:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:fulfillAuxiliaryTask", async (_, auxiliaryId) => {
    try {
      return await chainService.fulfillAuxiliaryTask(auxiliaryId);
    } catch (error) {
      console.error("IPC Error - fulfillAuxiliaryTask:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:failAuxiliaryTask", async (_, auxiliaryId) => {
    try {
      return await chainService.failAuxiliaryTask(auxiliaryId);
    } catch (error) {
      console.error("IPC Error - failAuxiliaryTask:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:getChainStatistics", async () => {
    try {
      return await chainService.getChainStatistics();
    } catch (error) {
      console.error("IPC Error - getChainStatistics:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:getContextStatistics", async () => {
    try {
      return await chainService.getContextStatistics();
    } catch (error) {
      console.error("IPC Error - getContextStatistics:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:createSacredContext", async (_, contextData) => {
    try {
      return await prisma.sacredContext.create({
        data: {
          name: contextData.name,
          description: contextData.description,
          icon: contextData.icon,
          color: contextData.color,
          rules: contextData.rules || {},
          environment: contextData.environment || {}
        }
      });
    } catch (error) {
      console.error("IPC Error - createSacredContext:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:updateSacredContext", async (_, contextId, contextData) => {
    try {
      return await prisma.sacredContext.update({
        where: { id: contextId },
        data: {
          name: contextData.name,
          description: contextData.description,
          icon: contextData.icon,
          color: contextData.color,
          rules: contextData.rules,
          environment: contextData.environment,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      console.error("IPC Error - updateSacredContext:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:deleteSacredContext", async (_, contextId) => {
    try {
      const activeChains = await prisma.cTDPChain.findMany({
        where: {
          contextId,
          status: "ACTIVE"
        }
      });
      if (activeChains.length > 0) {
        throw new Error("无法删除有活跃链的情境，请先完成或断裂所有活跃链");
      }
      return await prisma.sacredContext.delete({
        where: { id: contextId }
      });
    } catch (error) {
      console.error("IPC Error - deleteSacredContext:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:getAllTags", async () => {
    try {
      return await prisma.tag.findMany({
        orderBy: { name: "asc" }
      });
    } catch (error) {
      console.error("IPC Error - getAllTags:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:createTag", async (_, tagData) => {
    try {
      return await prisma.tag.create({
        data: {
          name: tagData.name,
          color: tagData.color
        }
      });
    } catch (error) {
      console.error("IPC Error - createTag:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:getSettings", async () => {
    try {
      return await prisma.cTDPSettings.findUnique({
        where: { id: "default" }
      });
    } catch (error) {
      console.error("IPC Error - getSettings:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ctdp:updateSettings", async (_, settings) => {
    try {
      return await prisma.cTDPSettings.update({
        where: { id: "default" },
        data: {
          ...settings,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      console.error("IPC Error - updateSettings:", error);
      throw error;
    }
  });
  console.log("✅ CTDP IPC处理器注册完成");
}
function unregisterCTDPHandlers() {
  const handlers = [
    "ctdp:getContextsWithActiveChains",
    "ctdp:startOrContinueChain",
    "ctdp:incrementChain",
    "ctdp:breakChain",
    "ctdp:archiveChain",
    "ctdp:scheduleAuxiliaryTask",
    "ctdp:getUpcomingAuxiliaryTasks",
    "ctdp:fulfillAuxiliaryTask",
    "ctdp:failAuxiliaryTask",
    "ctdp:getChainStatistics",
    "ctdp:getContextStatistics",
    "ctdp:createSacredContext",
    "ctdp:updateSacredContext",
    "ctdp:deleteSacredContext",
    "ctdp:getAllTags",
    "ctdp:createTag",
    "ctdp:getSettings",
    "ctdp:updateSettings"
  ];
  handlers.forEach((handler) => {
    electron.ipcMain.removeAllListeners(handler);
  });
  console.log("🔌 CTDP IPC处理器已清理");
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    if (is.dev) {
      mainWindow.webContents.openDevTools();
    }
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(async () => {
  console.log("🚀 启动HolySeat应用...");
  const dbInitialized = await initDatabase();
  if (!dbInitialized) {
    console.error("❌ 数据库初始化失败，应用无法启动");
    electron.app.quit();
    return;
  }
  registerCTDPHandlers();
  electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", async () => {
  unregisterCTDPHandlers();
  await closeDatabase();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
