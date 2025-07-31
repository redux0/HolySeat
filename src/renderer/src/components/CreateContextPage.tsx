import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useThemeVariables } from '../hooks/useTheme';
import { useCTDPActions } from '../features/ctdp/hooks';
import { contextsWithChainsAtom } from '../features/ctdp/atoms';
import { toast } from './ui/toast';
import { 
  ArrowLeft,
  Timer,
  ShieldCheck,
  Bell,
  Play
} from 'lucide-react';
import { 
  AVAILABLE_ICONS, 
  AVAILABLE_COLORS, 
  getIconComponent, 
  getColorHex,
  IconNames,
  ColorNames,
  PRESET_TIMES,
  APP_CONFIG
} from '../constants';

interface CreateContextPageProps {
  onBack: () => void;
  isEditing?: boolean;
  contextId?: string;
}

const CreateContextPage: React.FC<CreateContextPageProps> = ({ onBack, isEditing = false, contextId }) => {
  const themeVars = useThemeVariables();
  const { createSacredContext, updateSacredContext } = useCTDPActions();
  const contextsWithChains = useAtomValue(contextsWithChainsAtom);
  
  // 表单状态
  const [contextName, setContextName] = useState('');
  const [contextDescription, setContextDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0].name);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0].name);
  const [defaultDuration, setDefaultDuration] = useState(45);
  const [rules, setRules] = useState('');
  const [triggerAction, setTriggerAction] = useState('');
  const [selectedPresetTime, setSelectedPresetTime] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 如果是编辑模式，加载现有配置
  React.useEffect(() => {
    if (isEditing && contextId && contextsWithChains) {
      // 从已加载的情境列表中查找要编辑的情境
      const existingContext = contextsWithChains.find(ctx => ctx.id === contextId);
      
      if (existingContext) {
        setContextName(existingContext.name || '');
        setContextDescription(existingContext.description || '');
        setSelectedIcon(existingContext.icon || AVAILABLE_ICONS[0].name);
        
        // 根据颜色hex值查找对应的颜色名称
        const colorOption = AVAILABLE_COLORS.find(option => option.hex === existingContext.color);
        setSelectedColor(colorOption?.name || AVAILABLE_COLORS[0].name);
        
        // 从规则JSON中解析数据
        if (existingContext.rules) {
          try {
            const rulesData = typeof existingContext.rules === 'string' 
              ? JSON.parse(existingContext.rules) 
              : existingContext.rules;
            
            if (rulesData.defaultDuration) {
              setDefaultDuration(rulesData.defaultDuration);
            }
            if (rulesData.items && Array.isArray(rulesData.items)) {
              setRules(rulesData.items.join('\n'));
            }
            if (rulesData.triggerAction) {
              setTriggerAction(rulesData.triggerAction);
            }
            if (rulesData.presetTime) {
              setSelectedPresetTime(typeof rulesData.presetTime === 'number' ? rulesData.presetTime : 15);
            }
          } catch (error) {
            console.error('解析规则数据失败:', error);
            // 使用默认值
          }
        }
      } else {
        console.warn(`未找到ID为 ${contextId} 的情境`);
        toast.error('未找到要编辑的情境数据');
      }
    } else if (!isEditing) {
      // 如果是创建模式，重置所有状态
      setContextName('');
      setContextDescription('');
      setSelectedIcon(AVAILABLE_ICONS[0].name);
      setSelectedColor(AVAILABLE_COLORS[0].name);
      setDefaultDuration(45);
      setRules('');
      setTriggerAction('');
      setSelectedPresetTime(15);
    }
  }, [isEditing, contextId, contextsWithChains]);

  // 表单验证
  const validateForm = () => {
    if (!contextName.trim()) {
      toast.error('情境名称不能为空');
      return false;
    }
    if (contextName.length > 50) {
      toast.error('情境名称不能超过50个字符');
      return false;
    }
    if (contextDescription.length > 200) {
      toast.error('情境描述不能超过200个字符');
      return false;
    }
    if (rules.length > 1000) {
      toast.error('行为准则不能超过1000个字符');
      return false;
    }
    return true;
  };

  // 处理保存/创建
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const contextData = {
        name: contextName.trim(),
        description: contextDescription.trim() || undefined,
        icon: selectedIcon,
        color: getColorHex(selectedColor),
        rules: {
          items: rules.split('\n').filter(rule => rule.trim()),
          defaultDuration: defaultDuration,
          triggerAction: triggerAction.trim() || undefined,
          presetTime: selectedPresetTime
        },
        environment: {
          // 可以添加环境相关配置
          strictMode: true
        }
      };

      if (isEditing && contextId) {
        await updateSacredContext(contextId, contextData);
        toast.success('情境修改成功');
      } else {
        await createSacredContext(contextData);
        toast.success('情境创建成功');
      }
      
      // 延迟一下再返回，让用户看到成功提示
      setTimeout(() => {
        onBack();
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败';
      toast.error(isEditing ? `情境修改失败: ${errorMessage}` : `情境创建失败: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = getIconComponent(selectedIcon);
  const colorHex = getColorHex(selectedColor);

  const presetTimes = PRESET_TIMES;

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
            {isEditing ? '编辑情境' : '创建新情境'}
          </h1>
          <p 
            className="mt-1"
            style={{ color: themeVars.textSecondary }}
          >
            {isEditing ? '修改你的神圣情境配置和规则。' : '配置你的神圣情境，定义专注的规则。'}
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
                
                <div>
                  <label 
                    htmlFor="context-description" 
                    className="text-sm font-medium"
                    style={{ color: themeVars.textSecondary }}
                  >
                    情境描述 (可选)
                  </label>
                  <textarea
                    id="context-description"
                    value={contextDescription}
                    onChange={(e) => setContextDescription(e.target.value)}
                    placeholder="描述这个情境的用途和特点，例如：需要高度专注的工作任务，如编程、写作、研究等"
                    rows={3}
                    className="w-full mt-2 p-3 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 resize-none"
                    style={{
                      backgroundColor: themeVars.backgroundSecondary,
                      borderColor: themeVars.backgroundInteractive,
                      color: themeVars.textPrimary
                    }}
                  />
                  <div className="text-xs mt-1" style={{ color: themeVars.textSecondary }}>
                    {contextDescription.length}/200
                  </div>
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
                      {AVAILABLE_ICONS.map(icon => (
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
                          title={icon.label}
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
                      {AVAILABLE_COLORS.map(color => (
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
                        key={time.value} 
                        onClick={() => setSelectedPresetTime(time.value)}
                        className="px-4 py-2 rounded-md transition font-medium"
                        style={{
                          backgroundColor: selectedPresetTime === time.value 
                            ? '#6366F1' 
                            : `${themeVars.backgroundSecondary}50`,
                          color: selectedPresetTime === time.value 
                            ? 'white' 
                            : themeVars.textPrimary
                        }}
                      >
                        {time.label}
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
            disabled={isSubmitting}
            className="px-6 py-2 rounded-md font-semibold transition disabled:opacity-50"
            style={{
              backgroundColor: `${themeVars.backgroundSecondary}50`,
              color: themeVars.textSecondary
            }}
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-md font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#6366F1',
              color: 'white'
            }}
          >
            {isSubmitting 
              ? (isEditing ? '保存中...' : '创建中...') 
              : (isEditing ? '保存修改' : '创建情境')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContextPage;
