import React from 'react';

function App() {
  const [selectedTrack, setSelectedTrack] = React.useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Add TrackRecommendations component to the track detail view */}
      {selectedTrack && (
        <TrackRecommendations referenceTrack={selectedTrack} />
      )}
    </div>
  );
}

export default App;