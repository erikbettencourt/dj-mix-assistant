import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, HelpCircle, Music, Sliders, Clock } from 'lucide-react';
import { CompatibleTrack, MatchType } from '../types';
import { motion } from 'framer-motion';

interface CompatibilityResultsProps {
  tracks: CompatibleTrack[];
  onTrackSelect?: (track: CompatibleTrack) => void;
}

const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({ tracks, onTrackSelect }) => {
  const [matchType, setMatchType] = useState<MatchType | 'all'>('all');

  const filteredTracks = matchType === 'all' 
    ? tracks 
    : tracks.filter(track => track.matchType === matchType);

  const groupedTracks = filteredTracks.reduce((acc, track) => {
    const group = track.matchType;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(track);
    return acc;
  }, {} as Record<MatchType, CompatibleTrack[]>);

  const getMatchTypeLabel = (type: MatchType): { icon: React.ReactNode; text: string } => {
    switch (type) {
      case 'native':
        return { 
          icon: <Music size={16} className="text-success-400" />,
          text: 'Native Compatibility'
        };
      case 'pitch-shift':
        return { 
          icon: <Sliders size={16} className="text-accent-400" />,
          text: 'Pitch Shifted'
        };
      case 'tempo-match':
        return { 
          icon: <Clock size={16} className="text-primary-400" />,
          text: 'Tempo Matched'
        };
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
            <span className="text-sm text-gray-400">Filter by:</span>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as MatchType | 'all')}
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Matches</option>
              <option value="native">Native Compatibility</option>
              <option value="pitch-shift">Pitch Shifted</option>
              <option value="tempo-match">Tempo Matched</option>
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
            {Object.entries(groupedTracks).map(([type, tracks]) => (
              <React.Fragment key={type}>
                <tr className="bg-gray-800/30">
                  <td colSpan={7} className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      {getMatchTypeLabel(type as MatchType).icon}
                      <span className="font-medium text-gray-300">
                        {getMatchTypeLabel(type as MatchType).text}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({tracks.length} tracks)
                      </span>
                    </div>
                  </td>
                </tr>
                {tracks.map((track) => {
                  const bpmChange = Math.round(((track.adjustedBpm - track.bpm) / track.bpm) * 100);
                  
                  return (
                    <tr
                      key={`${track.id}-${track.matchType}`}
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
                        {Math.round(track.bpm)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="font-mono text-gray-300">
                            {Math.round(track.adjustedBpm)}
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
                              {Math.abs(bpmChange)}%
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
                        <span className={`
                          inline-flex items-center px-2.5 py-1 rounded-md
                          ${track.originalKey !== track.shiftedKey
                            ? 'bg-accent-800/50 border-accent-700/50 text-accent-200'
                            : 'bg-gray-800 border border-gray-700 text-gray-300'
                          }
                        `}>
                          {track.shiftedKey}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`
                          inline-block px-3 py-1 rounded-full text-xs font-medium text-white
                          ${track.matchType === 'native' ? 'bg-success-600' :
                            track.matchType === 'pitch-shift' ? 'bg-accent-600' :
                            'bg-primary-600'}
                        `}>
                          {track.compatibilityReason}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CompatibilityResults;