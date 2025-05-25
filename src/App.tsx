import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Track, CompatibleTrack } from './types';
import { parseXmlFile } from './utils/xmlParser';
import { convertToCalemot } from './utils/camelotLogic';
import { findCompatibleTracks, groupCompatibleTracks } from './utils/bpmCalculator';
import { RotateCcw } from 'lucide-react';

import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SearchTrack from './components/SearchTrack';
import CompatibilityResults from './components/CompatibilityResults';
import TabNavigation from './components/TabNavigation';
import SongAnalysis from './components/SongAnalysis';
import { sampleTracks } from './utils/sampleData';

function App() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [compatibleTracks, setCompatibleTracks] = useState<CompatibleTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | undefined>();
  const [selectedTrackHistory, setSelectedTrackHistory] = useState<CompatibleTrack[]>([]);

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
  const handleUseSampleData = () => {
    setTracks(sampleTracks);
    setCurrentFileName('sample-data.xml');
    setSelectedTrack(null);
    setCompatibleTracks([]);
    setSelectedTrackHistory([]);
    setError(null);
    navigate('/');
  };

  // Handle file removal
  const handleFileRemove = () => {
    setTracks([]);
    setSelectedTrack(null);
    setCompatibleTracks([]);
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
      setSelectedTrackHistory([]);
      navigate('/');
      return;
    }

    const trackWithCamelot = {
      ...track,
      camelotKey: convertToCalemot(track.key)
    };
    
    setSelectedTrack(trackWithCamelot);
    
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

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setSelectedTrack(null);
      setCompatibleTracks([]);
      setSelectedTrackHistory([]);
      navigate('/');
      return;
    }

    if (index >= selectedTrackHistory.length - 1) return;

    const track = selectedTrackHistory[index];
    const newHistory = selectedTrackHistory.slice(0, index + 1);
    
    setSelectedTrack({
      ...track,
      camelotKey: convertToCalemot(track.key)
    });
    
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
                <div className="sticky top-0 z-20 bg-gray-950 pt-4 -mx-4 px-4 shadow-lg">
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
                          <p className="text-lg font-mono">{Math.round(selectedTrack.bpm)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400 mb-1 block">Key</span>
                          <p className="text-lg">{selectedTrack.camelotKey}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CompatibilityResults 
                  groups={groupCompatibleTracks(compatibleTracks)}
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