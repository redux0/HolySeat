import React, { useState } from 'react';
import { useThemeVariables } from '../hooks/useTheme';
import { 
  BrainCircuit, 
  BookOpen, 
  Zap, 
  Wind, 
  Sparkles, 
  Wand2,
  ArrowLeft,
  Timer,
  ShieldCheck,
  Bell,
  Play
} from 'lucide-react';

// 图标选项
const iconOptions = [
  { name: 'BrainCircuit', component: BrainCircuit },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Zap', component: Zap },
  { name: 'Wind', component: Wind },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Wand2', component: Wand2 },
];

// 颜色选项
const colorOptions = [
  { name: 'indigo', hex: '#6366F1' },
  { name: 'sky', hex: '#38BDF8' },
  { name: 'amber', hex: '#F59E0B' },
  { name: 'emerald', hex: '#10B981' },
  { name: 'rose', hex: '#F43F5E' },
];

interface CreateContextPageProps {
  onBack: () => void;
}

const CreateContextPage: React.FC<CreateContextPageProps> = ({ onBack }) => {
  const themeVars = useThemeVariables();
  
  // 表单状态
  const [contextName, setContextName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0].name);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].name);
  const [defaultDuration, setDefaultDuration] = useState(45);
  const [rules, setRules] = useState('');
  const [triggerAction, setTriggerAction] = useState('');
  const [selectedPresetTime, setSelectedPresetTime] = useState('15分钟');

  const IconComponent = iconOptions.find(i => i.name === selectedIcon)?.component || BrainCircuit;
  const colorHex = colorOptions.find(c => c.name === selectedColor)?.hex || '#6366F1';

  const presetTimes = ['5分钟', '10分钟', '15分钟', '30分钟'];

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textPrimary,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* 头部 */}
      <div className="flex items-center p-8 pb-0">
        <button 
          onClick={onBack}
          className="p-2 mr-4 rounded-md transition-colors hover:bg-opacity-80"
          style={{ backgroundColor: `${themeVars.backgroundSecondary}80` }}
        >
          <ArrowLeft size={20} style={{ color: themeVars.textSecondary }} />
        </button>
        <div>
          <h1 
            className="text-3xl font-bold"
            style={{ color: themeVars.textPrimary }}
          >
            创建新情境
          </h1>
          <p 
            className="mt-1"
            style={{ color: themeVars.textSecondary }}
          >
            配置你的神圣情境，定义专注的规则。
          </p>
        </div>
      </div>

      {/* 滚动内容区域 */}
      <div className="flex-1 overflow-y-auto p-8 pt-4">
        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* 步骤 1: 定义情境 */}
          <div className="flex space-x-6 items-start">
            <div className="flex-shrink-0 text-3xl font-bold text-indigo-400">1</div>
            <div className="flex-1">
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: themeVars.textPrimary }}
              >
                定义情境
              </h2>
              <div className="space-y-6">
                <div>
                  <label 
                    htmlFor="context-name" 
                    className="text-sm font-medium"
                    style={{ color: themeVars.textSecondary }}
                  >
                    情境名称
                  </label>
                  <input
                    id="context-name"
                    type="text"
                    value={contextName}
                    onChange={(e) => setContextName(e.target.value)}
                    placeholder="例如：深度工作, 论文写作"
                    className="w-full mt-2 p-3 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500"
                    style={{
                      backgroundColor: themeVars.backgroundSecondary,
                      borderColor: themeVars.backgroundInteractive,
                      color: themeVars.textPrimary
                    }}
                  />
                </div>
                <div className="flex space-x-8">
                  <div>
                    <label 
                      className="text-sm font-medium"
                      style={{ color: themeVars.textSecondary }}
                    >
                      选择图标
                    </label>
                    <div className="flex space-x-2 mt-2">
                      {iconOptions.map(icon => (
                        <button 
                          key={icon.name} 
                          onClick={() => setSelectedIcon(icon.name)} 
                          className="p-3 rounded-md transition-all border-2"
                          style={{
                            backgroundColor: selectedIcon === icon.name 
                              ? '#6366F1' 
                              : `${themeVars.backgroundSecondary}`,
                            borderColor: selectedIcon === icon.name 
                              ? '#818CF8' 
                              : 'transparent'
                          }}
                        >
                          <icon.component size={24} color="white" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label 
                      className="text-sm font-medium"
                      style={{ color: themeVars.textSecondary }}
                    >
                      选择颜色
                    </label>
                    <div className="flex space-x-2 mt-2">
                      {colorOptions.map(color => (
                        <button 
                          key={color.name} 
                          onClick={() => setSelectedColor(color.name)} 
                          className="w-10 h-10 rounded-full transition-all border-2"
                          style={{ 
                            backgroundColor: color.hex,
                            borderColor: selectedColor === color.name 
                              ? 'white' 
                              : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="border-b"
            style={{ borderColor: themeVars.backgroundInteractive }}
          />

          {/* 步骤 2: 设定核心规则 */}
          <div className="flex space-x-6 items-start">
            <div className="flex-shrink-0 text-3xl font-bold text-indigo-400">2</div>
            <div className="flex-1">
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: themeVars.textPrimary }}
              >
                设定核心规则
              </h2>
              <div 
                className="p-4 rounded-lg border space-y-6"
                style={{
                  backgroundColor: themeVars.backgroundSecondary,
                  borderColor: themeVars.backgroundInteractive
                }}
              >
                <div>
                  <label 
                    className="text-sm font-medium flex items-center space-x-2"
                    style={{ color: themeVars.textPrimary }}
                  >
                    <Timer size={16} />
                    <span>默认专注时长</span>
                  </label>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: themeVars.textSecondary }}
                  >
                    设定单次专注任务的推荐时长。你可以在启动时随时修改。
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <input 
                      type="range" 
                      min="15" 
                      max="120" 
                      step="5" 
                      value={defaultDuration} 
                      onChange={e => setDefaultDuration(Number(e.target.value))} 
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        backgroundColor: themeVars.backgroundInteractive,
                        accentColor: '#6366F1'
                      }}
                    />
                    <span 
                      className="font-mono text-lg w-24 text-center"
                      style={{ color: themeVars.textPrimary }}
                    >
                      {defaultDuration} 分钟
                    </span>
                  </div>
                </div>
                <div>
                  <label 
                    className="text-sm font-medium flex items-center space-x-2"
                    style={{ color: themeVars.textPrimary }}
                  >
                    <ShieldCheck size={16} />
                    <span>行为准则</span>
                  </label>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: themeVars.textSecondary }}
                  >
                    定义进入此情境后需要遵守的规则。未来可在此处配置应用白名单。
                  </p>
                  <textarea 
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="例如：1. 关闭所有社交软件。 2. 手机静音并反面放置。" 
                    rows={3} 
                    className="w-full mt-3 p-3 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500"
                    style={{
                      backgroundColor: themeVars.backgroundPrimary,
                      borderColor: themeVars.backgroundInteractive,
                      color: themeVars.textPrimary
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div 
            className="border-b"
            style={{ borderColor: themeVars.backgroundInteractive }}
          />

          {/* 步骤 3: 配置高级启动器 */}
          <div className="flex space-x-6 items-start">
            <div className="flex-shrink-0 text-3xl font-bold text-indigo-400">3</div>
            <div className="flex-1">
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: themeVars.textPrimary }}
              >
                配置高级启动器 (可选)
              </h2>
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: themeVars.backgroundSecondary,
                  borderColor: themeVars.backgroundInteractive
                }}
              >
                <h3 
                  className="text-base font-semibold flex items-center space-x-2"
                  style={{ color: themeVars.textPrimary }}
                >
                  <Bell size={18} className="text-indigo-400" />
                  <span>辅助链 (预约) 设置</span>
                </h3>
                <p 
                  className="text-sm mt-2 mb-4"
                  style={{ color: themeVars.textSecondary }}
                >
                  配置启动此情境的"预约信号"，用于克服启动困难。
                </p>
                <div>
                  <label 
                    className="text-sm font-medium"
                    style={{ color: themeVars.textSecondary }}
                  >
                    预约信号 (触发动作)
                  </label>
                  <input 
                    type="text" 
                    value={triggerAction}
                    onChange={(e) => setTriggerAction(e.target.value)}
                    placeholder="例如：打一个响指" 
                    className="w-full mt-2 p-3 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500"
                    style={{
                      backgroundColor: themeVars.backgroundPrimary,
                      borderColor: themeVars.backgroundInteractive,
                      color: themeVars.textPrimary
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label 
                    className="text-sm font-medium"
                    style={{ color: themeVars.textSecondary }}
                  >
                    预约时长 (触发后多久内必须开始)
                  </label>
                  <div className="flex space-x-2 mt-2">
                    {presetTimes.map(time => (
                      <button 
                        key={time} 
                        onClick={() => setSelectedPresetTime(time)}
                        className="px-4 py-2 rounded-md transition font-medium"
                        style={{
                          backgroundColor: selectedPresetTime === time 
                            ? '#6366F1' 
                            : `${themeVars.backgroundSecondary}50`,
                          color: selectedPresetTime === time 
                            ? 'white' 
                            : themeVars.textPrimary
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部操作按钮 */}
        <div className="mt-12 flex justify-end space-x-4 max-w-3xl mx-auto">
          <button 
            onClick={onBack}
            className="px-6 py-2 rounded-md font-semibold transition"
            style={{
              backgroundColor: `${themeVars.backgroundSecondary}50`,
              color: themeVars.textSecondary
            }}
          >
            取消
          </button>
          <button 
            className="px-6 py-2 rounded-md font-semibold transition hover:opacity-90"
            style={{
              backgroundColor: '#6366F1',
              color: 'white'
            }}
          >
            创建情境
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContextPage;
