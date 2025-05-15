import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { Track, CompatibleTrack } from './types';
import { parseXmlFile } from './utils/xmlParser';
import { convertToCalemot } from './utils/camelotLogic';
import { findCompatibleTracks } from './utils/bpmCalculator';
import { RotateCcw } from 'lucide-react';

import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SearchTrack from './components/SearchTrack';
import CompatibilityResults from './components/CompatibilityResults';
import TabNavigation from './components/TabNavigation';
import SongAnalysis from './components/SongAnalysis';
import { sampleTracks } from './utils/sampleData';

function TrackDetail() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  
  // Get track data and other state from parent App component
  // This will be passed through context in the next step
  
  return null; // Temporary return until we implement the context
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [compatibleTracks, setCompatibleTracks] = useState<CompatibleTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editedBpm, setEditedBpm] = useState<number | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | undefined>();
  const [selectedTrackHistory, setSelectedTrackHistory] = useState<CompatibleTrack[]>([]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    if (location.pathname === '/') {
      setSelectedTrack(null);
      setCompatibleTracks([]);
      setEditedBpm(null);
      setSelectedTrackHistory([]);
    } else {
      const trackId = location.pathname.split('/').pop();
      if (trackId && selectedTrackHistory.length > 0) {
        const historyIndex = selectedTrackHistory.findIndex(t => t.id === trackId);
        if (historyIndex !== -1) {
          const newHistory = selectedTrackHistory.slice(0, historyIndex + 1);
          const track = selectedTrackHistory[historyIndex];
          
          setSelectedTrack({
            ...track,
            camelotKey: convertToCalemot(track.key)
          });
          setEditedBpm(track.adjustedBpm);
          
          const modifiedTrack = {
            ...track,
            bpm: track.adjustedBpm,
            key: track.shiftedKey,
            camelotKey: track.shiftedCamelotKey
          };
          
          const compatible = findCompatibleTracks(modifiedTrack, tracks);
          setCompatibleTracks(compatible);
          setSelectedTrackHistory(newHistory);
        }
      }
    }
  }, [location, tracks]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedTracks = await parseXmlFile(file);
      
      // Add Camelot key to each track
      const tracksWithCamelot = parsedTracks.map(track => ({
        ...track,
        camelotKey: convertToCalemot(track.key)
      }));
      
      setTracks(tracksWithCamelot);
      setCurrentFileName(file.name);
      
      // Reset selection and results
      setSelectedTrack(null);
      setCompatibleTracks([]);
      setEditedBpm(null);
      setSelectedTrackHistory([]);
      navigate('/');
    } catch (error) {
      console.error('Error parsing XML file:', error);
      setError('Failed to parse XML file. Please check the file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sample data
  const handleUseSampleData = (sampleTracks: Track[]) => {
    setTracks(sampleTracks);
    setCurrentFileName('sample-data.xml');
    setSelectedTrack(null);
    setCompatibleTracks([]);
    setEditedBpm(null);
    setSelectedTrackHistory([]);
    setError(null);
    navigate('/');
  };

  // Handle file removal
  const handleFileRemove = () => {
    setTracks([]);
    setSelectedTrack(null);
    setCompatibleTracks([]);
    setEditedBpm(null);
    setCurrentFileName(undefined);
    setError(null);
    setSelectedTrackHistory([]);
    navigate('/');
  };

  // Handle track selection
  const handleTrackSelect = (track: Track | null) => {
    if (!track) {
      setSelectedTrack(null);
      setCompatibleTracks([]);
      setEditedBpm(null);
      setSelectedTrackHistory([]);
      navigate('/');
      return;
    }

    const trackWithCamelot = {
      ...track,
      camelotKey: convertToCalemot(track.key)
    };
    
    setSelectedTrack(trackWithCamelot);
    setEditedBpm(null);
    
    // Find compatible tracks
    const compatible = findCompatibleTracks(trackWithCamelot, tracks);
    setCompatibleTracks(compatible);
    setSelectedTrackHistory([trackWithCamelot as CompatibleTrack]);
    navigate(`/track/${track.id}`);
  };

  // Handle compatible track selection
  const handleCompatibleTrackSelect = (track: CompatibleTrack) => {
    const originalTrack = tracks.find(t => t.id === track.id);
    if (originalTrack) {
      const trackWithCamelot = {
        ...originalTrack,
        camelotKey: convertToCalemot(originalTrack.key)
      };
      
      setSelectedTrack(trackWithCamelot);
      setEditedBpm(track.adjustedBpm);
      
      // Find compatible tracks with the adjusted BPM and shifted key
      const modifiedTrack = {
        ...trackWithCamelot,
        bpm: track.adjustedBpm,
        key: track.shiftedKey,
        camelotKey: track.shiftedCamelotKey
      };
      const compatible = findCompatibleTracks(modifiedTrack, tracks);
      setCompatibleTracks(compatible);
      
      // Update track history
      setSelectedTrackHistory(prev => [...prev, track]);
      navigate(`/track/${track.id}`);
    }
  };

  // Handle BPM change
  const handleBpmChange = (value: string) => {
    if (!selectedTrack) return;

    const newBpm = Math.round(parseFloat(value));
    if (isNaN(newBpm) || newBpm <= 0) return;

    setEditedBpm(newBpm);
    
    // Create modified reference track with new BPM and potentially shifted key
    const modifiedTrack = {
      ...selectedTrack,
      bpm: newBpm
    };

    // Recalculate compatible tracks with new BPM and shifted key
    const compatible = findCompatibleTracks(modifiedTrack, tracks);
    setCompatibleTracks(compatible);
  };

  // Reset BPM to original value
  const handleResetBpm = () => {
    if (!selectedTrack) return;
    setEditedBpm(null);
    const compatible = findCompatibleTracks(selectedTrack, tracks);
    setCompatibleTracks(compatible);
  };

  // Handle back to analysis view
  const handleBackToAnalysis = () => {
    setSelectedTrack(null);
    setCompatibleTracks([]);
    setEditedBpm(null);
    setSelectedTrackHistory([]);
    navigate('/');
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      handleBackToAnalysis();
      return;
    }

    if (index >= selectedTrackHistory.length - 1) return;

    const track = selectedTrackHistory[index];
    const newHistory = selectedTrackHistory.slice(0, index + 1);
    
    setSelectedTrack({
      ...track,
      camelotKey: convertToCalemot(track.key)
    });
    setEditedBpm(track.adjustedBpm);
    
    const modifiedTrack = {
      ...track,
      bpm: track.adjustedBpm,
      key: track.shiftedKey,
      camelotKey: track.shiftedCamelotKey
    };
    
    const compatible = findCompatibleTracks(modifiedTrack, tracks);
    setCompatibleTracks(compatible);
    setSelectedTrackHistory(newHistory);
    navigate(`/track/${track.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <Routes>
          <Route path="/" element={
            !tracks.length ? (
              <div className="max-w-3xl mx-auto text-center mb-10">
                <FileUpload 
                  onFileUploaded={handleFileUpload}
                  onFileRemove={handleFileRemove}
                  onUseSampleData={handleUseSampleData}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <FileUpload 
                    onFileUploaded={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    onUseSampleData={handleUseSampleData}
                    isLoading={isLoading}
                    currentFileName={currentFileName}
                  />
                </div>
                
                {error && (
                  <div className="p-4 mb-8 bg-error-900/50 border border-error-700 rounded-lg text-error-200">
                    {error}
                  </div>
                )}

                <SongAnalysis
                  tracks={tracks}
                  onTrackSelect={handleTrackSelect}
                />
              </>
            )
          } />
          
          <Route path="/track/:trackId" element={
            selectedTrack ? (
              <div className="space-y-8">
                <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => handleBreadcrumbClick(-1)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Playlist
                  </button>
                  <span className="text-gray-500">/</span>
                  {selectedTrackHistory.map((track, index) => (
                    <React.Fragment key={`${track.id}-${index}`}>
                      <button
                        onClick={() => handleBreadcrumbClick(index)}
                        className={`text-gray-300 hover:text-white transition-colors duration-200 ${
                          index === selectedTrackHistory.length - 1 ? 'cursor-default' : ''
                        }`}
                        disabled={index === selectedTrackHistory.length - 1}
                      >
                        {track.title} {index === 0 && `(${track.bpm} BPM)`}
                      </button>
                      {index < selectedTrackHistory.length - 1 && (
                        <span className="text-gray-500">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="p-8 bg-gray-900 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="text-3xl font-bold text-white">{selectedTrack.title}</h4>
                      <p className="text-xl text-gray-300">by {selectedTrack.artist}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div>
                        <span className="text-sm text-gray-400 mb-1 block">BPM</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editedBpm !== null ? editedBpm : Math.round(selectedTrack.bpm)}
                            onChange={(e) => handleBpmChange(e.target.value)}
                            className={`
                              w-24 text-lg font-mono rounded px-2 py-1
                              ${editedBpm !== null 
                                ? 'bg-primary-900/30 border-primary-500 text-primary-200' 
                                : 'bg-gray-800 border-gray-700 text-gray-200'
                              }
                              border focus:outline-none focus:ring-2 focus:ring-primary-500
                            `}
                            min="1"
                            step="1"
                          />
                          {editedBpm !== null && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 font-mono">
                                ({Math.round(selectedTrack.bpm)})
                              </span>
                              <button
                                onClick={handleResetBpm}
                                className="p-1.5 hover:bg-gray-800 rounded-full transition-colors group"
                                title="Reset to original BPM"
                              >
                                <RotateCcw size={16} className="text-gray-400 group-hover:text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400 mb-1 block">Key</span>
                        <p className="text-lg">
                          {editedBpm !== null && compatibleTracks.length > 0
                            ? compatibleTracks[0].shiftedCamelotKey
                            : selectedTrack.camelotKey}
                          <span className="text-gray-500 ml-2">
                            ({selectedTrack.camelotKey})
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CompatibilityResults 
                  tracks={compatibleTracks} 
                  onTrackSelect={handleCompatibleTrackSelect}
                />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;