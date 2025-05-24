import { Track, CompatibleTrack, CompatibilityType, CompatibilityDetails } from '../types';
import { calculateKeyShift, convertToCalemot, getCamelotKeyInfo, determineCompatibility } from './camelotLogic';

const MAX_SEMITONE_SHIFT = 3;
const MAX_BPM_CHANGE_PERCENT = 8;
const SEMITONE_BPM_RATIO = 0.06; // 6% BPM change = 1 semitone

export const findCompatibleTracks = (
  referenceTrack: Track,
  allTracks: Track[]
): CompatibleTrack[] => {
  if (!referenceTrack || !allTracks.length) {
    return [];
  }

  const refCamelotKey = referenceTrack.camelotKey || convertToCalemot(referenceTrack.key);
  const refKeyInfo = getCamelotKeyInfo(referenceTrack.key);

  if (!refKeyInfo) return [];

  return allTracks
    .filter(track => track.id !== referenceTrack.id)
    .map(track => {
      const originalBpm = track.bpm;
      const trackCamelotKey = track.camelotKey || convertToCalemot(track.key);
      const trackKeyInfo = getCamelotKeyInfo(track.key);

      if (!trackKeyInfo) return null;

      // Check native compatibility first
      const nativeCompatibility = determineCompatibility(refCamelotKey, trackCamelotKey);
      if (nativeCompatibility.type !== 'incompatible') {
        return createCompatibleTrack(track, {
          type: nativeCompatibility.type,
          semitoneShift: 0,
          bpmAdjustment: ((referenceTrack.bpm - track.bpm) / track.bpm) * 100,
          description: nativeCompatibility.description,
          score: nativeCompatibility.score
        }, referenceTrack.bpm);
      }

      // Try pitch shifting within limits
      for (let shift = 1; shift <= MAX_SEMITONE_SHIFT; shift++) {
        // Try shifting up
        const shiftedUpKey = calculateKeyShift(track.key, shift);
        const upCompatibility = determineCompatibility(refCamelotKey, convertToCalemot(shiftedUpKey));
        if (upCompatibility.type !== 'incompatible') {
          return createCompatibleTrack(track, {
            type: 'pitch-shift-up',
            semitoneShift: shift,
            bpmAdjustment: ((referenceTrack.bpm - track.bpm) / track.bpm) * 100,
            description: `Shift up ${shift} semitone${shift > 1 ? 's' : ''} for ${upCompatibility.description}`,
            score: upCompatibility.score * 0.9 // Slight penalty for pitch shifting
          }, referenceTrack.bpm);
        }

        // Try shifting down
        const shiftedDownKey = calculateKeyShift(track.key, -shift);
        const downCompatibility = determineCompatibility(refCamelotKey, convertToCalemot(shiftedDownKey));
        if (downCompatibility.type !== 'incompatible') {
          return createCompatibleTrack(track, {
            type: 'pitch-shift-down',
            semitoneShift: -shift,
            bpmAdjustment: ((referenceTrack.bpm - track.bpm) / track.bpm) * 100,
            description: `Shift down ${shift} semitone${shift > 1 ? 's' : ''} for ${downCompatibility.description}`,
            score: downCompatibility.score * 0.9
          }, referenceTrack.bpm);
        }
      }

      // Try BPM matching without pitch lock
      const bpmChangePercent = ((referenceTrack.bpm - track.bpm) / track.bpm) * 100;
      if (Math.abs(bpmChangePercent) <= MAX_BPM_CHANGE_PERCENT) {
        const semitoneShift = Math.round(bpmChangePercent / (SEMITONE_BPM_RATIO * 100));
        const shiftedKey = calculateKeyShift(track.key, semitoneShift);
        const bpmMatchCompatibility = determineCompatibility(refCamelotKey, convertToCalemot(shiftedKey));
        
        if (bpmMatchCompatibility.type !== 'incompatible') {
          return createCompatibleTrack(track, {
            type: 'bpm-match',
            semitoneShift,
            bpmAdjustment: bpmChangePercent,
            description: `Match BPM (${semitoneShift > 0 ? '+' : ''}${semitoneShift} semitone shift)`,
            score: bpmMatchCompatibility.score * 0.8 // Larger penalty for BPM matching
          }, referenceTrack.bpm);
        }
      }

      return null;
    })
    .filter((track): track is CompatibleTrack => track !== null)
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
};

const createCompatibleTrack = (
  track: Track,
  compatibility: CompatibilityDetails,
  targetBpm: number
): CompatibleTrack => {
  const shiftedKey = calculateKeyShift(track.key, compatibility.semitoneShift);
  
  return {
    ...track,
    originalKey: track.key,
    originalBpm: track.bpm,
    adjustedBpm: targetBpm,
    shiftedKey,
    shiftedCamelotKey: convertToCalemot(shiftedKey),
    compatibility
  };
};

export const groupCompatibleTracks = (
  tracks: CompatibleTrack[]
): CompatibilityGroup[] => {
  const groups: CompatibilityGroup[] = [
    {
      title: "Native Compatible Tracks",
      description: "These tracks are naturally compatible without any pitch shifting",
      tracks: tracks.filter(t => 
        ['exact', 'adjacent', 'relative'].includes(t.compatibility.type)
      )
    },
    {
      title: "Pitch Shifted Compatible Tracks",
      description: "These tracks become compatible when pitch shifted",
      tracks: tracks.filter(t => 
        ['pitch-shift-up', 'pitch-shift-down'].includes(t.compatibility.type)
      )
    },
    {
      title: "BPM Matched Tracks",
      description: "These tracks are compatible when matching BPM without pitch lock",
      tracks: tracks.filter(t => t.compatibility.type === 'bpm-match')
    }
  ];

  // Remove empty groups
  return groups.filter(group => group.tracks.length > 0);
};