import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { Track, CompatibleTrack } from './types';
import { parseXmlFile } from './utils/xmlParser';
import { convertToCalemot, calculateKeyShift, getCamelotKeyInfo } from './utils/camelotLogic';
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
  
  return null;
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
  const [transpose, setTranspose] = useState<number>(0);

  // Listen for browser back/forward navigation
  useEffect(() => {
    if (location.pathname === '/') {
      setSelectedTrack(null);
      setCompatibleTracks([]);
      setEditedBpm(null);
      setSelectedTrackHistory([]);
      setTranspose(0);
    } else {
      const trackId = location.pathname.split('/').pop();
      if (trackId) {
        // First, check if the track is in history
        const historyTrack = selectedTrackHistory.find(t => t.id === trackId);
        if (historyTrack) {
          const historyIndex = selectedTrackHistory.findIndex(t => t.id === trackId);
          const newHistory = selectedTrackHistory.slice(0, historyIndex + 1);
          
          setSelectedTrack({
            ...historyTrack,
            camelotKey: convertToCalemot(historyTrack.key)
          });
          setEditedBpm(historyTrack.adjustedBpm);
          
          const modifiedTrack = {
            ...historyTrack,
            bpm: historyTrack.adjustedBpm,
            key: historyTrack.shiftedKey,
            camelotKey: historyTrack.shiftedCamelotKey
          };
          
          const compatible = findCompatibleTracks(modifiedTrack, tracks);
          setCompatibleTracks(compatible);
          setSelectedTrackHistory(newHistory);
        } else {
          // If not in history, check if it's a new track selection
          const track = tracks.find(t => t.id === trackId);
          if (track) {
            handleTrackSelect(track);
          }
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
      setTranspose(0);
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
    setTranspose(0);
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
    setTranspose(0);
    navigate('/');
  };

  // Handle track selection
  const handleTrackSelect = (track: Track | null) => {
    if (!track) {
      setSelectedTrack(null);
      setCompatibleTracks([]);
      setEditedBpm(null);
      setSelectedTrackHistory([]);
      setTranspose(0);
      navigate('/');
      return;
    }

    const trackWithCamelot = {
      ...track,
      camelotKey: convertToCalemot(track.key)
    };
    
    setSelectedTrack(trackWithCamelot);
    setEditedBpm(null);
    setTranspose(0);
    
    // Find compatible tracks
    const compatible = findCompatibleTracks(trackWithCamelot, tracks);
    setCompatibleTracks(compatible);
    
    // Create a compatible track object for history
    const historyTrack: CompatibleTrack = {
      ...trackWithCamelot,
      originalKey: track.key,
      adjustedBpm: track.bpm,
      shiftedKey: track.key,
      shiftedCamelotKey: trackWithCamelot.camelotKey || '',
      compatibilityType: 'exact',
      compatibilityScore: 100
    };
    
    setSelectedTrackHistory([historyTrack]);
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
      setTranspose(0);
      
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

  // Handle transpose change
  const handleTransposeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTrack) return;

    const newTranspose = parseInt(event.target.value, 10);
    setTranspose(newTranspose);
    
    const keyInfo = getCamelotKeyInfo(selectedTrack.key);
    if (!keyInfo) return;

    // Calculate new Camelot number based on transposition
    let newNumber = keyInfo.number;
    for (let i = 0; i < Math.abs(newTranspose); i++) {
      if (newTranspose > 0) {
        newNumber = newNumber === 12 ? 1 : newNumber + 1;
      } else {
        newNumber = newNumber === 1 ? 12 : newNumber - 1;
      }
    }

    const newCamelotKey = `${newNumber}${keyInfo.letter}`;
    
    // Create modified reference track with transposed key
    const modifiedTrack = {
      ...selectedTrack,
      key: newCamelotKey,
      camelotKey: newCamelotKey
    };

    // Recalculate compatible tracks with transposed key
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

  // Reset transpose to 0
  const handleResetTranspose = () => {
    if (!selectedTrack) return;
    setTranspose(0);
    const compatible = findCompatibleTracks(selectedTrack, tracks);
    setCompatibleTracks(compatible);
  };

  // Handle back to analysis view
  const handleBackToAnalysis = () => {
    setSelectedTrack(null);
    setCompatibleTracks([]);
    setEditedBpm(null);
    setSelectedTrackHistory([]);
    setTranspose(0);
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
    setTranspose(0);
    
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

  // Calculate transposed Camelot key
  const getTransposedCamelotKey = () => {
    if (!selectedTrack || !selectedTrack.camelotKey) return null;
    
    const keyInfo = getCamelotKeyInfo(selectedTrack.key);
    if (!keyInfo) return null;

    let newNumber = keyInfo.number;
    for (let i = 0; i < Math.abs(transpose); i++) {
      if (transpose > 0) {
        newNumber = newNumber === 12 ? 1 : newNumber + 1;
      } else {
        newNumber = newNumber === 1 ? 12 : newNumber - 1;
      }
    }

    return `${newNumber}${keyInfo.letter}`;
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
                          {transpose !== 0 ? getTransposedCamelotKey() : selectedTrack.camelotKey}
                          {transpose !== 0 && (
                            <span className="text-gray-500 ml-2">
                              ({selectedTrack.camelotKey})
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400 mb-1 block">Transpose</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={transpose}
                            onChange={handleTransposeChange}
                            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {Array.from({ length: 11 }, (_, i) => i - 5).map(value => (
                              <option key={value} value={value}>
                                {value > 0 ? `+${value}` : value}
                              </option>
                            ))}
                          </select>
                          {transpose !== 0 && (
                            <button
                              onClick={handleResetTranspose}
                              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors group"
                              title="Reset transpose"
                            >
                              <RotateCcw size={16} className="text-gray-400 group-hover:text-white" />
                            </button>
                          )}
                        </div>
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