import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompatibleTrack, CompatibilityGroup } from '../types';
import { ArrowUp, ArrowDown, Music, HelpCircle, Target, Shuffle, Zap, Sliders } from 'lucide-react';

interface CompatibilityResultsProps {
  groups: CompatibilityGroup[];
  onTrackSelect?: (track: CompatibleTrack) => void;
}

const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({ groups = [], onTrackSelect }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!groups || groups.length === 0) {
    return (
      <motion.div
        className="my-8 p-6 bg-gray-900 rounded-lg border border-gray-800 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HelpCircle size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Compatible Tracks Found</h3>
        <p className="text-gray-400">Try selecting a different reference track</p>
      </motion.div>
    );
  }

  const getTabIcon = (title: string) => {
    if (title.includes('Native')) return <Target size={16} />;
    if (title.includes('Diagonal')) return <Shuffle size={16} />;
    if (title.includes('Energy')) return <Zap size={16} />;
    if (title.includes('Transposed')) return <Sliders size={16} />;
    return <Music size={16} />;
  };

  const getTabTitle = (title: string) => {
    if (title.includes('Native')) return 'Native';
    if (title.includes('Diagonal')) return 'Diagonal';
    if (title.includes('Energy')) return 'Energy';
    if (title.includes('Transposed')) return 'Transposed';
    return title;
  };

  return (
    <motion.div
      className="space-y-8 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-gray-950 pt-4 pb-2 -mx-4 px-4 shadow-lg">
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          {groups.map((group, index) => (
            <button
              key={group.title}
              onClick={() => setActiveTab(index)}
              className={`
                flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-colors duration-200
                ${activeTab === index 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}
              `}
            >
              <span className="flex items-center gap-2">
                {getTabIcon(group.title)}
                <span>{getTabTitle(group.title)} ({group.tracks.length})</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Group Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900 rounded-lg border border-gray-800"
        >
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">{groups[activeTab].title}</h2>
            <p className="text-gray-400 text-sm">{groups[activeTab].description}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 text-gray-300">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Track</th>
                  <th className="py-3 px-4 text-left font-semibold">Artist</th>
                  <th className="py-3 px-4 text-right font-semibold">BPM</th>
                  <th className="py-3 px-4 text-center font-semibold">Key</th>
                  <th className="py-3 px-4 text-center font-semibold">Compatibility</th>
                </tr>
              </thead>
              <tbody>
                {groups[activeTab].tracks.map((track) => {
                  const bpmChange = ((track.adjustedBpm - track.originalBpm) / track.originalBpm) * 100;
                  const keyChanged = track.originalKey !== track.shiftedKey;
                  
                  return (
                    <tr
                      key={track.id}
                      className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onTrackSelect?.(track)}
                          className="text-white hover:text-primary-400 text-left transition-colors duration-200"
                        >
                          {track.title}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{track.artist}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="font-mono text-gray-300">
                            {Math.round(track.originalBpm)} → {Math.round(track.adjustedBpm)}
                          </span>
                          {Math.abs(bpmChange) > 0 && (
                            <span
                              className={`flex items-center text-xs ${
                                bpmChange > 0 ? 'text-success-400' : 'text-error-400'
                              }`}
                            >
                              {bpmChange > 0 ? (
                                <ArrowUp size={12} className="mr-0.5" />
                              ) : (
                                <ArrowDown size={12} className="mr-0.5" />
                              )}
                              {Math.abs(bpmChange).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {keyChanged ? (
                          <div className="flex items-center justify-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                              {track.camelotKey}
                            </span>
                            <span className="text-gray-500">→</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-accent-800/50 border border-accent-700/50 text-accent-200">
                              {track.shiftedCamelotKey}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                            {track.camelotKey}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          <span
                            className={`
                              inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-full text-xs font-medium
                              ${getCompatibilityStyle(track.compatibility.type)}
                            `}
                          >
                            {track.compatibility.description}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

const getCompatibilityStyle = (type: string): string => {
  switch (type) {
    case 'native':
      return 'bg-success-600 text-white';
    case 'diagonal':
      return 'bg-accent-600 text-white';
    case 'energy':
      return 'bg-secondary-600 text-white';
    case 'transposed':
      return 'bg-primary-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

export default CompatibilityResults;