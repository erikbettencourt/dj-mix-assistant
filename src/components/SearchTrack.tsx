import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../types';

interface SearchTrackProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  selectedTrack: Track | null;
}

const SearchTrack: React.FC<SearchTrackProps> = ({ tracks, onTrackSelect, selectedTrack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = tracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchQuery, tracks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (track: Track) => {
    onTrackSelect(track);
    setSearchQuery('');
    setIsOpen(false);
  };

  const clearSelection = () => {
    onTrackSelect(null);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a track..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
          >
            {suggestions.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelect(track)}
                className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors duration-150 flex items-center justify-between group"
              >
                <div>
                  <p className="text-white font-medium">{track.title}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="flex items-center text-xs text-gray-400 space-x-2">
                    <span>{track.bpm} BPM</span>
                    <span>•</span>
                    <span>Key: {track.key}</span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedTrack && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-800 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="text-white font-medium">{selectedTrack.title}</p>
            <p className="text-sm text-gray-400">{selectedTrack.artist}</p>
          </div>
          <button
            onClick={clearSelection}
            className="p-1.5 hover:bg-gray-700 rounded-full transition-colors duration-150"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SearchTrack;