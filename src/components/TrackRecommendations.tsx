import React, { useState, useEffect } from 'react';
import { Track } from '../types';
import { Music, ExternalLink, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendedTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  price?: number;
  purchaseUrl?: string;
  previewUrl?: string;
}

interface TrackRecommendationsProps {
  referenceTrack: Track;
}

const TrackRecommendations: React.FC<TrackRecommendationsProps> = ({ referenceTrack }) => {
  const [recommendations, setRecommendations] = useState<RecommendedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-recommendations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: referenceTrack.key,
            bpm: referenceTrack.bpm
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        setError('Failed to load recommendations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (referenceTrack) {
      fetchRecommendations();
    }
  }, [referenceTrack]);

  const togglePlay = (trackId: string) => {
    setPlayingTrackId(playingTrackId === trackId ? null : trackId);
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-gray-900 rounded-lg text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/4 mx-auto"></div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-800 rounded-lg p-4 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-gray-900 rounded-lg text-center text-error-400">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold mb-4">Recommended Tracks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(track => (
          <motion.div
            key={track.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-white">{track.title}</h4>
                <p className="text-gray-400">{track.artist}</p>
              </div>
              {track.previewUrl && (
                <button
                  onClick={() => togglePlay(track.id)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  {playingTrackId === track.id ? (
                    <Pause size={18} className="text-primary-400" />
                  ) : (
                    <Play size={18} className="text-gray-400" />
                  )}
                </button>
              )}
            </div>
            
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
              <span>{track.bpm} BPM</span>
              <span>{track.key}</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {track.price && (
                <span className="text-lg font-medium text-white">
                  ${track.price.toFixed(2)}
                </span>
              )}
              {track.purchaseUrl && (
                <a
                  href={track.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <span>Buy Track</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrackRecommendations;