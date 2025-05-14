import { Track, CompatibleTrack } from '../types';
import { calculateKeyShift, convertToCalemot, determineCompatibility } from './camelotLogic';

export const findCompatibleTracks = (
  referenceTrack: Track,
  allTracks: Track[]
): CompatibleTrack[] => {
  if (!referenceTrack || !allTracks.length) {
    return [];
  }
  
  // Ensure the reference track has a Camelot key
  const refCamelotKey = referenceTrack.camelotKey || convertToCalemot(referenceTrack.key);
  
  // Process each track to find compatibility
  return allTracks
    .filter(track => track.id !== referenceTrack.id) // Exclude the reference track
    .map(track => {
      // Calculate the BPM ratio needed to match the reference BPM
      const originalBpm = track.bpm;
      const adjustedBpm = referenceTrack.bpm;
      
      // Calculate BPM change percentage
      const bpmChangePercent = Math.abs((adjustedBpm - originalBpm) / originalBpm * 100);
      
      // If BPM change is more than 8%, mark as incompatible
      if (bpmChangePercent > 8) {
        return {
          ...track,
          originalKey: track.key,
          adjustedBpm,
          shiftedKey: track.key,
          shiftedCamelotKey: track.camelotKey || convertToCalemot(track.key),
          compatibilityType: 'incompatible',
          compatibilityScore: 0,
        };
      }
      
      // Calculate what the key would be if we shifted the track to match the reference BPM
      const shiftedKey = calculateKeyShift(track.key, originalBpm, adjustedBpm);
      const shiftedCamelotKey = convertToCalemot(shiftedKey);
      
      // Determine compatibility between the reference track and this track
      const { type: compatibilityType, score: compatibilityScore } = 
        determineCompatibility(refCamelotKey, shiftedCamelotKey);
      
      return {
        ...track,
        originalKey: track.key,
        adjustedBpm,
        shiftedKey,
        shiftedCamelotKey,
        compatibilityType,
        compatibilityScore,
      };
    })
    .filter(track => track.compatibilityType !== 'incompatible') // Remove incompatible tracks
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore); // Sort by compatibility score
};

// Function to determine if a BPM adjustment is within a reasonable range
export const isBpmAdjustmentReasonable = (
  originalBpm: number, 
  targetBpm: number
): boolean => {
  if (!originalBpm || !targetBpm) {
    return false;
  }
  
  const percentChange = Math.abs((targetBpm - originalBpm) / originalBpm) * 100;
  return percentChange <= 8;
};

// Calculate the percentage change in BPM
export const calculateBpmPercentageChange = (
  originalBpm: number,
  targetBpm: number
): number => {
  if (!originalBpm || !targetBpm) {
    return 0;
  }
  
  return ((targetBpm - originalBpm) / originalBpm) * 100;
};

// Filter tracks by compatibility type
export const filterTracksByCompatibility = (
  tracks: CompatibleTrack[],
  filterType: string
): CompatibleTrack[] => {
  if (filterType === 'all') {
    return tracks;
  }
  
  if (filterType === 'exact') {
    return tracks.filter(track => track.compatibilityType === 'exact');
  }
  
  if (filterType === 'energy-change') {
    return tracks.filter(track => 
      track.compatibilityType === 'energy-boost' || 
      track.compatibilityType === 'energy-drop'
    );
  }
  
  if (filterType === 'compatible') {
    return tracks.filter(track => track.compatibilityScore >= 60);
  }
  
  if (filterType === 'relatives') {
    return tracks.filter(track => 
      track.compatibilityType === 'relative-major' || 
      track.compatibilityType === 'relative-minor'
    );
  }
  
  return tracks;
};

// Filter tracks by BPM range
export const filterTracksByBpmRange = (
  tracks: CompatibleTrack[],
  minBpm: number,
  maxBpm: number
): CompatibleTrack[] => {
  if (!minBpm && !maxBpm) {
    return tracks;
  }
  
  return tracks.filter(track => {
    const bpm = track.bpm;
    
    if (minBpm && maxBpm) {
      return bpm >= minBpm && bpm <= maxBpm;
    }
    
    if (minBpm) {
      return bpm >= minBpm;
    }
    
    if (maxBpm) {
      return bpm <= maxBpm;
    }
    
    return true;
  });
};