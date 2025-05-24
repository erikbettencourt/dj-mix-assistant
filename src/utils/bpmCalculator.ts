import { Track, CompatibleTrack, CompatibilityType, CompatibilityDetails, CompatibilityGroup } from '../types';
import { calculateKeyShift, convertToCalemot, getCamelotKeyInfo, determineCompatibility } from './camelotLogic';

const MAX_SEMITONE_SHIFT = 3;
const MAX_BPM_CHANGE_PERCENT = 6; // Changed from 8% to 6%
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
    .flatMap(track => {
      const originalBpm = track.bpm;
      const bpmChangePercent = ((referenceTrack.bpm - track.bpm) / track.bpm) * 100;

      // Filter out tracks with BPM changes greater than MAX_BPM_CHANGE_PERCENT
      if (Math.abs(bpmChangePercent) > MAX_BPM_CHANGE_PERCENT) {
        return [];
      }

      const trackCamelotKey = track.camelotKey || convertToCalemot(track.key);
      const trackKeyInfo = getCamelotKeyInfo(track.key);

      if (!trackKeyInfo) return [];

      const compatibleTracks: CompatibleTrack[] = [];

      // Check native compatibility first
      const nativeCompatibility = determineCompatibility(refCamelotKey, trackCamelotKey);
      if (nativeCompatibility.type !== 'incompatible') {
        compatibleTracks.push(createCompatibleTrack(track, {
          type: nativeCompatibility.type,
          semitoneShift: 0,
          bpmAdjustment: bpmChangePercent,
          description: nativeCompatibility.description,
          score: nativeCompatibility.score - Math.abs(bpmChangePercent) // Reduce score based on BPM change
        }, referenceTrack.bpm));
      }

      // Try pitch shifting within limits
      for (let shift = 1; shift <= MAX_SEMITONE_SHIFT; shift++) {
        // Try shifting up
        const shiftedUpKey = calculateKeyShift(track.key, shift);
        const upCompatibility = determineCompatibility(refCamelotKey, convertToCalemot(shiftedUpKey));
        if (upCompatibility.type !== 'incompatible') {
          compatibleTracks.push(createCompatibleTrack(track, {
            type: 'pitch-shift-up',
            semitoneShift: shift,
            bpmAdjustment: bpmChangePercent,
            description: `Shift up ${shift} semitone${shift > 1 ? 's' : ''} for ${upCompatibility.description}`,
            score: upCompatibility.score * 0.9 - Math.abs(bpmChangePercent) - (shift * 2) // Penalties for pitch shift and BPM change
          }, referenceTrack.bpm));
        }

        // Try shifting down
        const shiftedDownKey = calculateKeyShift(track.key, -shift);
        const downCompatibility = determineCompatibility(refCamelotKey, convertToCalemot(shiftedDownKey));
        if (downCompatibility.type !== 'incompatible') {
          compatibleTracks.push(createCompatibleTrack(track, {
            type: 'pitch-shift-down',
            semitoneShift: -shift,
            bpmAdjustment: bpmChangePercent,
            description: `Shift down ${shift} semitone${shift > 1 ? 's' : ''} for ${downCompatibility.description}`,
            score: downCompatibility.score * 0.9 - Math.abs(bpmChangePercent) - (shift * 2)
          }, referenceTrack.bpm));
        }
      }

      // Try BPM matching without pitch lock
      const semitoneShift = Math.round(bpmChangePercent / (SEMITONE_BPM_RATIO * 100));
      const shiftedKey = calculateKeyShift(track.key, semitoneShift);
      const bpmMatchCompatibility = determineCompatibility(refCamelotKey, convertToCalemot(shiftedKey));
      
      if (bpmMatchCompatibility.type !== 'incompatible') {
        compatibleTracks.push(createCompatibleTrack(track, {
          type: 'bpm-match',
          semitoneShift,
          bpmAdjustment: bpmChangePercent,
          description: `Match BPM (${semitoneShift > 0 ? '+' : ''}${semitoneShift} semitone shift)`,
          score: bpmMatchCompatibility.score * 0.8 - Math.abs(bpmChangePercent) * 2 // Larger penalty for BPM matching
        }, referenceTrack.bpm));
      }

      return compatibleTracks;
    })
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
  // Sort tracks within each group by:
  // 1. Compatibility score (higher is better)
  // 2. BPM change (less change is better)
  // 3. Semitone shift (less shift is better)
  const sortTracks = (tracks: CompatibleTrack[]) => {
    return [...tracks].sort((a, b) => {
      // First by compatibility score
      if (b.compatibility.score !== a.compatibility.score) {
        return b.compatibility.score - a.compatibility.score;
      }
      // Then by absolute BPM change
      const bpmDiffA = Math.abs(a.compatibility.bpmAdjustment);
      const bpmDiffB = Math.abs(b.compatibility.bpmAdjustment);
      if (bpmDiffA !== bpmDiffB) {
        return bpmDiffA - bpmDiffB;
      }
      // Finally by absolute semitone shift
      return Math.abs(a.compatibility.semitoneShift) - Math.abs(b.compatibility.semitoneShift);
    });
  };

  const groups: CompatibilityGroup[] = [
    {
      title: "Native Compatible Tracks",
      description: "These tracks are naturally compatible without any pitch shifting",
      tracks: sortTracks(tracks.filter(t => 
        ['exact', 'adjacent', 'relative'].includes(t.compatibility.type)
      ))
    },
    {
      title: "Pitch Shifted Compatible Tracks",
      description: "These tracks become compatible when pitch shifted",
      tracks: sortTracks(tracks.filter(t => 
        ['pitch-shift-up', 'pitch-shift-down'].includes(t.compatibility.type)
      ))
    },
    {
      title: "BPM Matched Tracks",
      description: "These tracks are compatible when matching BPM without pitch lock",
      tracks: sortTracks(tracks.filter(t => t.compatibility.type === 'bpm-match'))
    }
  ];

  // Remove empty groups
  return groups.filter(group => group.tracks.length > 0);
};