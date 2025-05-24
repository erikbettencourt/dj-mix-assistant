import { Track, CompatibleTrack, MatchType } from '../types';
import { calculateKeyShift, convertToCalemot, determineCompatibility, shiftKeyBySemitones } from './camelotLogic';

const MAX_SEMITONE_SHIFT = 3;
const BPM_SEMITONE_RATIO = 0.06; // 6% BPM change = 1 semitone
const MAX_BPM_CHANGE = 0.08; // 8% maximum BPM change

export const findCompatibleTracks = (
  referenceTrack: Track,
  allTracks: Track[]
): CompatibleTrack[] => {
  if (!referenceTrack || !allTracks.length) {
    return [];
  }
  
  const compatibleTracks: CompatibleTrack[] = [];
  const refCamelotKey = referenceTrack.camelotKey || convertToCalemot(referenceTrack.key);
  
  allTracks
    .filter(track => track.id !== referenceTrack.id)
    .forEach(track => {
      // Check native compatibility (no changes needed)
      const nativeCompatibility = checkNativeCompatibility(track, refCamelotKey);
      if (nativeCompatibility) {
        compatibleTracks.push({
          ...nativeCompatibility,
          matchType: 'native'
        });
        return; // Skip other checks if natively compatible
      }
      
      // Check pitch shift compatibility (±1-3 semitones)
      const pitchShiftCompatibility = checkPitchShiftCompatibility(track, refCamelotKey);
      if (pitchShiftCompatibility) {
        compatibleTracks.push({
          ...pitchShiftCompatibility,
          matchType: 'pitch-shift'
        });
        return; // Skip tempo match if pitch shift compatible
      }
      
      // Check tempo-match compatibility (no pitch lock)
      const tempoMatchCompatibility = checkTempoMatchCompatibility(track, referenceTrack);
      if (tempoMatchCompatibility) {
        compatibleTracks.push({
          ...tempoMatchCompatibility,
          matchType: 'tempo-match'
        });
      }
    });
  
  return compatibleTracks.sort((a, b) => {
    // Sort by match type priority: native > pitch-shift > tempo-match
    const matchTypePriority = { native: 3, 'pitch-shift': 2, 'tempo-match': 1 };
    const matchTypeDiff = matchTypePriority[a.matchType] - matchTypePriority[b.matchType];
    if (matchTypeDiff !== 0) return matchTypeDiff;
    
    // Then by compatibility score
    return b.compatibilityScore - a.compatibilityScore;
  });
};

const checkNativeCompatibility = (
  track: Track,
  refCamelotKey: string
): CompatibleTrack | null => {
  const trackCamelotKey = track.camelotKey || convertToCalemot(track.key);
  const { type: compatibilityType, score: compatibilityScore } = 
    determineCompatibility(refCamelotKey, trackCamelotKey);
  
  if (compatibilityType === 'incompatible') {
    return null;
  }
  
  let compatibilityReason = 'Perfect Match';
  if (compatibilityType === 'perfect-fifth') compatibilityReason = 'Perfect Fifth (+1)';
  if (compatibilityType === 'perfect-fourth') compatibilityReason = 'Perfect Fourth (-1)';
  if (compatibilityType === 'relative-minor') compatibilityReason = 'Relative Minor';
  if (compatibilityType === 'relative-major') compatibilityReason = 'Relative Major';
  if (compatibilityType === 'energy-boost') compatibilityReason = 'Energy Boost';
  if (compatibilityType === 'energy-drop') compatibilityReason = 'Energy Drop';
  if (compatibilityType === 'compatible') compatibilityReason = 'Compatible';
  
  return {
    ...track,
    originalKey: track.key,
    adjustedBpm: track.bpm,
    shiftedKey: track.key,
    shiftedCamelotKey: trackCamelotKey,
    compatibilityType,
    compatibilityScore,
    compatibilityReason,
    semitoneShift: 0,
    matchType: 'native'
  };
};

const checkPitchShiftCompatibility = (
  track: Track,
  refCamelotKey: string
): CompatibleTrack | null => {
  let bestMatch: CompatibleTrack | null = null;
  let bestScore = 0;
  
  for (let semitones = -MAX_SEMITONE_SHIFT; semitones <= MAX_SEMITONE_SHIFT; semitones++) {
    if (semitones === 0) continue; // Skip no shift as it's covered by native compatibility
    
    const shiftedKey = shiftKeyBySemitones(track.key, semitones);
    const shiftedCamelotKey = convertToCalemot(shiftedKey);
    
    const { type: compatibilityType, score: compatibilityScore } = 
      determineCompatibility(refCamelotKey, shiftedCamelotKey);
    
    if (compatibilityType !== 'incompatible' && compatibilityScore > bestScore) {
      bestScore = compatibilityScore;
      bestMatch = {
        ...track,
        originalKey: track.key,
        adjustedBpm: track.bpm,
        shiftedKey,
        shiftedCamelotKey,
        compatibilityType,
        compatibilityScore: compatibilityScore * 0.9, // Slight penalty for pitch shifting
        compatibilityReason: `Pitch Shift ${semitones > 0 ? '+' : ''}${semitones}`,
        semitoneShift: semitones,
        matchType: 'pitch-shift'
      };
    }
  }
  
  return bestMatch;
};

const checkTempoMatchCompatibility = (
  track: Track,
  referenceTrack: Track
): CompatibleTrack | null => {
  // Calculate BPM change percentage
  const bpmChange = (referenceTrack.bpm - track.bpm) / track.bpm;
  
  // If BPM change is too large, skip
  if (Math.abs(bpmChange) > MAX_BPM_CHANGE) {
    return null;
  }
  
  // Calculate semitone shift based on BPM change
  const semitoneShift = Math.round(bpmChange / BPM_SEMITONE_RATIO);
  
  // If shift is too large, skip
  if (Math.abs(semitoneShift) > MAX_SEMITONE_SHIFT) {
    return null;
  }
  
  const shiftedKey = shiftKeyBySemitones(track.key, semitoneShift);
  const shiftedCamelotKey = convertToCalemot(shiftedKey);
  
  const { type: compatibilityType, score: compatibilityScore } = 
    determineCompatibility(referenceTrack.camelotKey || '', shiftedCamelotKey);
  
  if (compatibilityType !== 'incompatible') {
    const bpmChangePercent = (bpmChange * 100).toFixed(1);
    
    return {
      ...track,
      originalKey: track.key,
      adjustedBpm: referenceTrack.bpm,
      shiftedKey,
      shiftedCamelotKey,
      compatibilityType,
      compatibilityScore: compatibilityScore * 0.8, // Larger penalty for tempo matching
      compatibilityReason: `BPM Match (${bpmChangePercent}%, ${semitoneShift > 0 ? '+' : ''}${semitoneShift} semitones)`,
      semitoneShift,
      matchType: 'tempo-match'
    };
  }
  
  return null;
};

export const filterTracksByMatchType = (
  tracks: CompatibleTrack[],
  matchType: MatchType | 'all'
): CompatibleTrack[] => {
  if (matchType === 'all') {
    return tracks;
  }
  
  return tracks.filter(track => track.matchType === matchType);
};