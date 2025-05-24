import React from 'react';
import { motion } from 'framer-motion';
import { CompatibleTrack, CompatibilityGroup } from '../types';
import { ArrowUp, ArrowDown, Music, HelpCircle } from 'lucide-react';

interface CompatibilityResultsProps {
  groups: CompatibilityGroup[];
  onTrackSelect?: (track: CompatibleTrack) => void;
}

const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({ groups, onTrackSelect }) => {
  if (groups.length === 0) {
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

  return (
    <motion.div
      className="space-y-8 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {groups.map((group, groupIndex) => (
        <div key={group.title} className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">{group.title} ({group.tracks.length})</h2>
            <p className="text-gray-400 text-sm">{group.description}</p>
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
                {group.tracks.map((track) => {
                  const bpmChange = ((track.adjustedBpm - track.originalBpm) / track.originalBpm) * 100;
                  
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
                        <div className="flex items-center justify-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                            {track.originalKey}
                          </span>
                          {track.originalKey !== track.shiftedKey && (
                            <>
                              <span className="text-gray-500">→</span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-accent-800/50 border border-accent-700/50 text-accent-200">
                                {track.shiftedKey}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          <span
                            className={`
                              inline-block px-3 py-1 rounded-full text-xs font-medium
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
        </div>
      ))}
    </motion.div>
  );
};

const getCompatibilityStyle = (type: string): string => {
  switch (type) {
    case 'exact':
      return 'bg-success-500 text-white';
    case 'adjacent':
    case 'relative':
      return 'bg-success-600 text-white';
    case 'pitch-shift-up':
    case 'pitch-shift-down':
      return 'bg-accent-600 text-white';
    case 'bpm-match':
      return 'bg-secondary-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

export default CompatibilityResults;