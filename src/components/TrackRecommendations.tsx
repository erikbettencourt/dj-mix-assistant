import React, { useState, useEffect } from 'react';
import { Track } from '../types';
import { Music, ExternalLink, Play, Pause, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendedTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  price?: number;
  purchase_url?: string;
  preview_url?: string;
  genre?: string;
}

interface TrackRecommendationsProps {
  referenceTrack: Track;
}

const TrackRecommendations: React.FC<TrackRecommendationsProps> = ({ referenceTrack }) => {
  const [recommendations, setRecommendations] = useState<RecommendedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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

    // Cleanup audio on unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [referenceTrack]);

  const togglePlay = (track: RecommendedTrack) => {
    if (!track.preview_url) return;

    if (playingTrackId === track.id) {
      audio?.pause();
      setPlayingTrackId(null);
      return;
    }

    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(track.preview_url);
    newAudio.play();
    setAudio(newAudio);
    setPlayingTrackId(track.id);

    newAudio.onended = () => {
      setPlayingTrackId(null);
    };
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-gray-900 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin" />
          <span>Loading recommendations...</span>
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

  if (recommendations.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-900 rounded-lg text-center">
        <Music className="mx-auto h-12 w-12 text-gray-600 mb-3" />
        <p className="text-gray-400">No recommendations found for this track</p>
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
              {track.preview_url && (
                <button
                  onClick={() => togglePlay(track)}
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
            
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-gray-400">{Math.round(track.bpm)} BPM</span>
              <span className="text-gray-400">{track.key}</span>
              {track.genre && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{track.genre}</span>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              {track.price && (
                <span className="text-lg font-medium text-white">
                  ${track.price.toFixed(2)}
                </span>
              )}
              {track.purchase_url && (
                <a
                  href={track.purchase_url}
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