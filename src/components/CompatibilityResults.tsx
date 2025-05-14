import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, Shuffle, HelpCircle } from 'lucide-react';
import { CompatibleTrack } from '../types';
import { motion } from 'framer-motion';

interface CompatibilityResultsProps {
  tracks: CompatibleTrack[];
  onTrackSelect?: (track: CompatibleTrack) => void;
}

type SortType = 'bpm-change' | 'compatibility';

const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({ tracks, onTrackSelect }) => {
  const [sortType, setSortType] = useState<SortType>('bpm-change');

  const sortedTracks = [...tracks].sort((a, b) => {
    if (sortType === 'bpm-change') {
      const changeA = Math.abs(a.adjustedBpm - a.bpm);
      const changeB = Math.abs(b.adjustedBpm - b.bpm);
      return changeA - changeB;
    } else {
      return b.compatibilityScore - a.compatibilityScore;
    }
  });

  const getCompatibilityLabel = (type: string) => {
    switch (type) {
      case 'exact':
        return { text: 'Exact Match', color: 'bg-success-500' };
      case 'perfect-fifth':
        return { text: 'Perfect Fifth (+1)', color: 'bg-success-600' };
      case 'perfect-fourth':
        return { text: 'Perfect Fourth (-1)', color: 'bg-success-700' };
      case 'relative-minor':
        return { text: 'Relative Minor', color: 'bg-accent-500' };
      case 'relative-major':
        return { text: 'Relative Major', color: 'bg-accent-600' };
      case 'energy-boost':
        return { text: 'Energy Boost', color: 'bg-secondary-500' };
      case 'energy-drop':
        return { text: 'Energy Drop', color: 'bg-secondary-600' };
      case 'compatible':
        return { text: 'Compatible', color: 'bg-primary-600' };
      default:
        return { text: 'Incompatible', color: 'bg-gray-600' };
    }
  };

  if (tracks.length === 0) {
    return (
      <motion.div
        className="my-8 p-6 bg-gray-900 rounded-lg border border-gray-800 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HelpCircle size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Compatible Tracks Found</h3>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full overflow-hidden bg-gray-900 rounded-lg shadow-xl border border-gray-800 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Compatible Tracks ({tracks.length})</h2>
            <p className="text-gray-400 text-sm">
              Click a track name to see its compatible matches
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="bpm-change">BPM Change</option>
              <option value="compatibility">Compatibility</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Title</th>
              <th className="py-3 px-4 text-left font-semibold">Artist</th>
              <th className="py-3 px-4 text-right font-semibold">Original BPM</th>
              <th className="py-3 px-4 text-right font-semibold">Adjusted BPM</th>
              <th className="py-3 px-4 text-center font-semibold">Original Key</th>
              <th className="py-3 px-4 text-center font-semibold">Shifted Key</th>
              <th className="py-3 px-4 text-center font-semibold">Compatibility</th>
            </tr>
          </thead>
          <tbody>
            {sortedTracks.map((track) => {
              const bpmChange = ((track.adjustedBpm - track.bpm) / track.bpm) * 100;
              const compatibilityInfo = getCompatibilityLabel(track.compatibilityType);
              
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
                  <td className="py-3 px-4 text-right font-mono text-gray-300">
                    {track.bpm.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="font-mono text-gray-300">{track.adjustedBpm.toFixed(1)}</span>
                      {Math.abs(bpmChange) > 0.1 && (
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
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                      {track.originalKey}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center">
                      {track.originalKey !== track.shiftedKey ? (
                        <div className="flex items-center space-x-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-accent-800/50 border border-accent-700/50 text-accent-200">
                            {track.shiftedCamelotKey}
                          </span>
                          <Shuffle size={14} className="text-gray-500" title="Key shifted to match BPM" />
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                          {track.shiftedCamelotKey}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`
                        inline-block px-3 py-1 rounded-full text-xs font-medium text-white
                        ${compatibilityInfo.color}
                      `}
                    >
                      {compatibilityInfo.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CompatibilityResults;