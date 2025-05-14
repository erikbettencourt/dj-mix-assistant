import React, { useMemo, useState } from 'react';
import { Track } from '../types';
import { findCompatibleTracks } from '../utils/bpmCalculator';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface SongAnalysisProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
}

interface TrackWithCompatibleCount extends Track {
  compatibleCount: number;
}

type SortField = 'title' | 'artist' | 'bpm' | 'key' | 'compatibleCount';
type SortDirection = 'asc' | 'desc';

const SongAnalysis: React.FC<SongAnalysisProps> = ({ tracks, onTrackSelect }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('compatibleCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const tracksWithCounts = useMemo(() => {
    return tracks.map(track => {
      const compatibleTracks = findCompatibleTracks(track, tracks);
      return {
        ...track,
        compatibleCount: compatibleTracks.length
      };
    });
  }, [tracks]);

  const sortedAndFilteredTracks = useMemo(() => {
    let result = [...tracksWithCounts];

    // Apply search filter
    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(track => 
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'bpm':
          comparison = a.bpm - b.bpm;
          break;
        case 'key':
          comparison = (a.camelotKey || '').localeCompare(b.camelotKey || '');
          break;
        case 'compatibleCount':
          comparison = a.compatibleCount - b.compatibleCount;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tracksWithCounts, filterQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <motion.div
      className="w-full overflow-hidden bg-gray-900 rounded-lg shadow-xl border border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Playlist ({tracks.length})</h2>
        <div className="relative w-64">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter tracks..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
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
                  className="flex items-center justify-end space-x-1 w-full hover:text-white"
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
                  className="flex items-center justify-center space-x-1 w-full hover:text-white"
                >
                  <span>Key</span>
                  {sortField === 'key' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-center font-semibold">
                <button
                  onClick={() => handleSort('compatibleCount')}
                  className="flex items-center justify-center space-x-1 w-full hover:text-white"
                >
                  <span>Compatible Songs</span>
                  {sortField === 'compatibleCount' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredTracks.map((track) => (
              <tr
                key={track.id}
                onClick={() => onTrackSelect(track)}
                className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
              >
                <td className="py-3 px-4 text-white">{track.title}</td>
                <td className="py-3 px-4 text-gray-300">{track.artist}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-300">
                  {Math.round(track.bpm)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                    {track.camelotKey}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-600/20 text-primary-400">
                    {track.compatibleCount} tracks
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SongAnalysis;