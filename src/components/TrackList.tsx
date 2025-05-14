import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Music } from 'lucide-react';
import { Track } from '../types';
import { motion } from 'framer-motion';

interface TrackListProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  selectedTrackId: string | null;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onTrackSelect, selectedTrackId }) => {
  const [sortField, setSortField] = useState<keyof Track>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Track) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTracks = [...tracks].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }

    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }

    return 0;
  });

  if (tracks.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="w-full overflow-hidden bg-gray-900 rounded-lg shadow-xl border border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white">Imported Tracks ({tracks.length})</h2>
        <p className="text-gray-400 text-sm">Select a reference track to find compatible songs</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Title</span>
                  {sortField === 'title' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-left font-semibold">
                <button
                  onClick={() => handleSort('artist')}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <span>Artist</span>
                  {sortField === 'artist' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-right font-semibold">
                <button
                  onClick={() => handleSort('bpm')}
                  className="flex items-center space-x-1 justify-end hover:text-white"
                >
                  <span>BPM</span>
                  {sortField === 'bpm' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-center font-semibold">
                <button
                  onClick={() => handleSort('key')}
                  className="flex items-center space-x-1 justify-center hover:text-white"
                >
                  <span>Key</span>
                  {sortField === 'key' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTracks.map((track) => (
              <tr
                key={track.id}
                className={`
                  border-t border-gray-800 hover:bg-gray-800/50 transition-colors duration-150
                  ${selectedTrackId === track.id ? 'bg-primary-900/30' : ''}
                `}
              >
                <td className="py-3 px-4 text-white">{track.title}</td>
                <td className="py-3 px-4 text-gray-300">{track.artist}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-300">
                  {track.bpm.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                    {track.key} {track.camelotKey && `(${track.camelotKey})`}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onTrackSelect(track)}
                    className={`
                      inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200
                      ${
                        selectedTrackId === track.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800 hover:bg-primary-700 text-gray-300 hover:text-white'
                      }
                    `}
                  >
                    <Music size={16} className="mr-1.5" />
                    {selectedTrackId === track.id ? 'Selected' : 'Select'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TrackList;