import React, { useState } from 'react';
import { useThemeVariables } from '../hooks/useTheme';
import { CheckCircle, XCircle, Clock, Link, Link2Off, ChevronDown, ChevronRight, Tag } from 'lucide-react';

interface ChainLog {
  id: string;
  type: 'success' | 'failure';
  title: string;
  time: string;
  duration?: string;
  tags?: string[];
}

interface Chain {
  id: string;
  status: 'active' | 'broken';
  title: string;
  date: string;
  logs: ChainLog[];
}

interface ChainHistoryListProps {
  chains: Chain[];
}

const ChainHistoryList: React.FC<ChainHistoryListProps> = ({ chains }) => {
  const themeVars = useThemeVariables();
  const [expandedChains, setExpandedChains] = useState<Record<string, boolean>>({});

  const toggleChainExpansion = (chainId: string) => {
    setExpandedChains(prev => ({
      ...prev,
      [chainId]: !prev[chainId]
    }));
  };

  const getStatusIcon = (status: 'active' | 'broken') => {
    return status === 'active' ? (
      <Link size={16} className="text-green-500" />
    ) : (
      <Link2Off size={16} className="text-gray-500" />
    );
  };

  const getLogIcon = (type: 'success' | 'failure') => {
    return type === 'success' ? (
      <CheckCircle size={16} className="text-green-500" />
    ) : (
      <XCircle size={16} className="text-red-500" />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* 链历史列表 */}
      <div className="space-y-4">
        {chains.map((chain, chainIndex) => {
          const isExpanded = expandedChains[chain.id];
          
          return (
            <div 
              key={chain.id}
              className="rounded-lg border"
              style={{
                backgroundColor: themeVars.backgroundSecondary,
                borderColor: themeVars.borderPrimary
              }}
            >
              {/* 链条标题 - 可点击展开/收缩 */}
              <button
                onClick={() => toggleChainExpansion(chain.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-opacity-80 transition-colors"
              >
                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                <div className="flex-shrink-0">
                  {getStatusIcon(chain.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold text-sm"
                    style={{ color: themeVars.textPrimary }}
                  >
                    {chain.title}
                  </h3>
                </div>
                <span 
                  className="text-xs flex-shrink-0"
                  style={{ color: themeVars.textSecondary }}
                >
                  {chain.date}
                </span>
              </button>

              {/* 链条历史记录 - 展开时显示 */}
              {isExpanded && (
                <div className="border-t" style={{ borderColor: themeVars.borderPrimary }}>
                  {chain.logs.map((log, logIndex) => (
                    <div key={log.id}>
                      <div className="flex items-start gap-3 p-4">
                        <div className="flex-shrink-0 mt-1">
                          {getLogIcon(log.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-medium text-sm mb-2"
                            style={{ color: themeVars.textPrimary }}
                          >
                            {log.title}
                          </div>
                          <div className="flex items-center gap-3 text-xs flex-wrap">
                            <span 
                              className="flex items-center gap-1"
                              style={{ color: themeVars.textSecondary }}
                            >
                              <Clock size={10} />
                              {log.time}
                            </span>
                            {log.duration && (
                              <span 
                                style={{ color: themeVars.textSecondary }}
                              >
                                {log.duration}
                              </span>
                            )}
                            {log.tags && log.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {log.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded"
                                    style={{
                                      backgroundColor: `${themeVars.textSecondary}15`,
                                      color: themeVars.textSecondary
                                    }}
                                  >
                                    <Tag size={8} />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* 历史记录间分割线 */}
                      {logIndex < chain.logs.length - 1 && (
                        <div 
                          className="h-px mx-4"
                          style={{ backgroundColor: themeVars.borderPrimary }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChainHistoryList;
